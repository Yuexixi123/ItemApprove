import { getModelAttributes } from '@/services/resources/api';
import {
  getModelAttributesWithFilter,
  getMonitoringItemModelNames,
  getMonitoringItemRelatedResources,
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
      const response = await getMonitoringItemRelatedResources({
        sys_resource_id: params.sys_resource_id,
        host_resource_id: params.host_resource_id,
        sys_rel: 'system_in_host',
        host_rel: 'host_in_' + params.model_key,
        item_rel: params.model_key + '_in_' + 'tigger',
      });
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
        model_key: 'trigger_model',
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
}
