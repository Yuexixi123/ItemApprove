import { ProDescriptions } from '@ant-design/pro-components';
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import type {
  ProColumns,
  ProDescriptionsItemProps,
  ProFieldValueType,
} from '@ant-design/pro-components';
import { useModel, useParams } from '@umijs/max';
import './index.less';

interface AttrDescriptionsProps {
  resourceId?: number;
}

const AttrDescriptions = forwardRef<any, AttrDescriptionsProps>(
  ({ resourceId: propResourceId }, ref) => {
    const actionRef = useRef();
    const [columns, setColumns] = useState<ProColumns<any>[]>([]);
    const params = useParams<{ id: string }>(); // 从URL路径获取modelId

    const {
      modelAttributes,
      resourceRecord,
      fetchModelAttributes,
      fetchResourceDetail,
      resourceDetailLoading,
    } = useModel('resource', (model) => ({
      modelAttributes: model.modelAttributes,
      resourceRecord: model.resourceRecord,
      fetchModelAttributes: model.fetchModelAttributes,
      fetchResourceDetail: model.fetchResourceDetail,
      resourceDetailLoading: model.resourceDetailLoading,
    }));

    // 暴露刷新数据的方法给父组件
    useImperativeHandle(ref, () => ({
      refreshData: () => {
        const modelId = params.id;
        if (propResourceId && modelId) {
          fetchResourceDetail(Number(propResourceId), Number(modelId));
          fetchModelAttributes(Number(modelId));
        }
      },
    }));

    // 如果有参数，加载资源详情和模型属性
    useEffect(() => {
      const modelId = params.id; // 从URL路径获取modelId

      if (propResourceId && modelId) {
        fetchResourceDetail(Number(propResourceId), Number(modelId));
        fetchModelAttributes(Number(modelId));
      }
    }, [propResourceId, params.id]); // 移除函数依赖，避免无限循环

    // 当模型属性数据变化时，生成列配置
    useEffect(() => {
      if (modelAttributes && modelAttributes.length > 0) {
        const generatedColumns: ProColumns<any>[] = modelAttributes.map((field) => ({
          dataIndex: field.attr_key,
          title: field.attr_name,
          valueType: (field.attr_type === 'enum'
            ? 'select'
            : field.attr_type === 'boolean'
            ? 'switch'
            : field.attr_type) as ProFieldValueType,
          // 为布尔类型添加自定义渲染函数，显示"是"或"否"
          render: (text) => {
            if (field.attr_type === 'boolean') {
              return text ? '是' : '否';
            }
            if (text === null || text === undefined) {
              return '-';
            }
            return text;
          },
        }));

        setColumns(generatedColumns);
      }
    }, [modelAttributes]); // 只依赖modelAttributes

    return (
      <ul className="group-list">
        <li className="group-item">
          <div className="group-title">
            <div className="title-info">
              <div className="mr5">
                <span>基础信息</span>
              </div>
            </div>
          </div>
          <ul className="model-list clearfix">
            <ProDescriptions
              column={2}
              actionRef={actionRef}
              loading={resourceDetailLoading}
              dataSource={resourceRecord || {}} // 使用dataSource而不是params
              columns={columns as ProDescriptionsItemProps<any>[]}
            ></ProDescriptions>
          </ul>
        </li>
      </ul>
    );
  },
);

export default AttrDescriptions;
