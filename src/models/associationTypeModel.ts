import { useState, useCallback } from 'react';
import { App } from 'antd';
import {
  getAssociationTypes,
  createAssociationType,
  deleteAssociationType,
  updateAssociationType,
} from '@/services/model-api/association';

export default () => {
  const { message } = App.useApp();
  // 关联类型列表状态
  const [associationTypes, setAssociationTypes] = useState<API.AssociationTypeItem[]>([]);
  const [associationTypesLoading, setAssociationTypesLoading] = useState<boolean>(false);
  const [associationTypesPagination, setAssociationTypesPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 获取关联类型列表
  const fetchAssociationTypes = useCallback(
    async (params?: { current?: number; page_size?: number; field_sort?: string }) => {
      setAssociationTypesLoading(true);
      try {
        const response = await getAssociationTypes(params);

        if (response.inside_code === 0) {
          setAssociationTypes(response.data.asst_type);
          setAssociationTypesPagination({
            current: params?.current || 1,
            pageSize: params?.page_size || 10,
            total: parseInt(response.data.total) || 0,
          });
        } else {
          message.error(response.msg || '获取关联类型列表失败');
        }
      } catch (error) {
        console.error('获取关联类型列表出错:', error);
        message.error('获取关联类型列表失败');
      } finally {
        setAssociationTypesLoading(false);
      }
    },
    [],
  );

  // 创建关联类型
  const addAssociationType = useCallback(async (data: API.CreateAssociationTypeRequest) => {
    try {
      const response = await createAssociationType(data);
      if (response.inside_code === 0) {
        message.success('创建关联类型成功');
        return true;
      } else {
        message.error(response.msg || '创建关联类型失败');
        return false;
      }
    } catch (error) {
      console.error('创建关联类型出错:', error);
      message.error('创建关联类型失败');
      return false;
    }
  }, []);

  // 删除关联类型
  const removeAssociationType = useCallback(async (asst_id: number) => {
    try {
      const response = await deleteAssociationType(asst_id);
      if (response.inside_code === 0) {
        message.success('删除关联类型成功');
        return true;
      } else {
        message.error(response.msg || '删除关联类型失败');
        return false;
      }
    } catch (error) {
      console.error('删除关联类型出错:', error);
      message.error('删除关联类型失败');
      return false;
    }
  }, []);

  // 修改关联类型
  const editAssociationType = useCallback(
    async (asst_id: number, data: API.UpdateAssociationTypeRequest) => {
      try {
        const response = await updateAssociationType(asst_id, data);
        if (response.inside_code === 0) {
          message.success('修改关联类型成功');
          return true;
        } else {
          message.error(response.msg || '修改关联类型失败');
          return false;
        }
      } catch (error) {
        console.error('修改关联类型出错:', error);
        message.error('修改关联类型失败');
        return false;
      }
    },
    [],
  );

  return {
    associationTypes,
    associationTypesLoading,
    associationTypesPagination,
    fetchAssociationTypes,
    addAssociationType,
    removeAssociationType,
    editAssociationType,
  };
};
