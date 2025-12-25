import { getModelAttributes } from '@/services/resources/api';
import {
  getModelAttributesWithFilter,
  getMonitoringItemModelNames,
  getMonitoringItemRelatedResources,
  createMonitoringItemApproval,
  updateMonitoringItemApproval,
  getMonitoringItemApprovalDetail,
} from '@/services/monitoring-item/api';

/**
 * 监控相关数据服务
 */
export class MonitoringService {
  /**
   * 获取监控项模型名称
   */
  static async fetchMonitoringItemModelNames() {
    const result = await getMonitoringItemModelNames();
    if (result.inside_code === 0 && result.data) {
      return result.data;
    }
    return [];
  }

  /**
   * 获取模型资源数据
   */
  static async fetchModelResources(params: Record<string, any>) {
    try {
      const requestParams: MonitoringItem.RelatedResourceParams = {
        sys_resource_id: params.sys_resource_id,
        host_resource_id: params.host_resource_id,
        sys_rel: 'system_CONTAINS_host',
        host_rel: 'host_CONTAINS_' + params.model_key,
        item_rel: params.model_key + '_CONTAINS_' + 'trigger',
      };

      // 如果传入了approval_id，则添加到请求参数中
      if (params.approval_id) {
        requestParams.approval_id = params.approval_id;
      }

      const response = await getMonitoringItemRelatedResources(requestParams);
      if (response.inside_code === 0 && response.data) {
        return response.data || [];
      }
      return [];
    } catch (error) {
      console.error(`获取模型资源数据失败:`, error);
      return [];
    }
  }

  /**
   * 获取模型属性
   */
  static async fetchModelAttributes(modelId: number) {
    if (!modelId) return [];

    try {
      const response = await getModelAttributes(modelId);
      if (response.inside_code === 0 && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('获取模型属性失败:', error);
      return [];
    }
  }

  /**
   * 获取触发器模型属性
   */
  static async fetchTriggerModelAttributes() {
    try {
      const response = await getModelAttributesWithFilter({
        model_key: 'trigger',
      });
      if (response.inside_code === 0 && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('获取触发器模型属性失败:', error);
      return [];
    }
  }

  /**
   * 获取监控项审批详情
   * @param itemApprovalId 审批ID
   * @returns 审批详情数据
   */
  static async fetchMonitoringItemApprovalDetail(itemApprovalId: number) {
    try {
      const response = await getMonitoringItemApprovalDetail(itemApprovalId);
      if (response.inside_code === 0 && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('获取监控项审批详情失败:', error);
      return null;
    }
  }

  /**
   * 新建监控项审批
   * @param data 审批数据
   * @returns 创建结果
   */
  static async createMonitoringItemApproval(data: MonitoringItem.CreateApprovalParams) {
    // 参数校验
    if (!data) {
      throw new Error('审批数据不能为空');
    }

    if (!data.system_id) {
      throw new Error('系统ID不能为空');
    }

    if (!data.model_id || !Array.isArray(data.model_id) || data.model_id.length === 0) {
      throw new Error('监控项模型ID不能为空');
    }

    // resources字段为可选，如果提供则需要验证格式
    if (data.resources && (typeof data.resources !== 'object' || Array.isArray(data.resources))) {
      throw new Error('资源数据格式不正确');
    }

    if (typeof data.approval_status !== 'number' || ![1, 2].includes(data.approval_status)) {
      throw new Error('审批状态必须为1(可编辑)或2(流转中)');
    }

    try {
      console.log('创建监控项审批，参数:', data);
      const response = await createMonitoringItemApproval(data);

      if (response.inside_code === 0) {
        console.log('创建监控项审批成功:', response.data);
        return {
          success: true,
          data: response.data,
          message: response.msg || '创建成功',
        };
      } else {
        console.error('创建监控项审批失败:', response.msg);
        return {
          success: false,
          message: response.msg || '创建失败',
        };
      }
    } catch (error) {
      console.error('创建监控项审批异常:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '创建失败，请稍后重试',
      };
    }
  }

  /**
   * 更新监控项审批
   * @param approvalId 审批ID
   * @param data 审批数据
   * @returns 更新结果
   */
  static async updateMonitoringItemApproval(
    approvalId: number,
    data: MonitoringItem.UpdateApprovalParams,
  ) {
    // 参数校验
    if (!approvalId) {
      throw new Error('审批ID不能为空');
    }

    if (!data) {
      throw new Error('审批数据不能为空');
    }

    if (!data.system_id) {
      throw new Error('系统ID不能为空');
    }

    if (!data.model_id || !Array.isArray(data.model_id) || data.model_id.length === 0) {
      throw new Error('监控项模型ID不能为空');
    }

    if (typeof data.approval_status !== 'number' || ![1, 2].includes(data.approval_status)) {
      throw new Error('审批状态必须为1(可编辑)或2(流转中)');
    }

    try {
      console.log('更新监控项审批，参数:', { approvalId, data });
      const response = await updateMonitoringItemApproval(approvalId, data);

      if (response.inside_code === 0) {
        console.log('更新监控项审批成功:', response.data);
        return {
          success: true,
          data: response.data,
          message: response.msg || '更新成功',
        };
      } else {
        console.error('更新监控项审批失败:', response.msg);
        return {
          success: false,
          message: response.msg || '更新失败',
        };
      }
    } catch (error) {
      console.error('更新监控项审批异常:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '更新失败，请稍后重试',
      };
    }
  }
}
