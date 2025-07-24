import { Space } from 'antd';
import { useModel, history } from '@umijs/max';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import useHover from '@/hooks/useHover';
import { useTableDelete } from '@/hooks/useTableDelete';
import { deleteModelGroup } from '@/services/model-api/model-group';
import './index.less';

/**
 * 模型列表组件
 * @param props 组件属性
 * @returns React组件
 */
const ModelList: React.FC<ModelManager.ModelListProps> = (props) => {
  const { item, setModelVisitor, setEditGroupVisitor, setRow } = props;

  const { allIcons } = useModel('global');

  const handleTableDelete = useTableDelete();

  const { fetchModels } = useModel('modelPage', (model) => ({ fetchModels: model.fetchModels }));

  // 使用更新后的 useHover hook，使用 item.modelgroup_id 作为唯一标识
  const { handleMouseEnter, handleMouseLeave, isItemHovered } = useHover<string | number>();

  /**
   * 跳转到模型详情页
   * @param model 模型数据
   */
  const handleJump = (model: ModelManager.Model) => {
    sessionStorage.setItem('MODELNAME', model.model_name);
    history.push(`/modelPage/modelManager/details/${model.model_id}`);
  };

  /**
   * 删除分组
   */
  const handleDeleteGroup = async () => {
    const success = await handleTableDelete({
      api: deleteModelGroup,
      params: item?.modelgroup_id,
    });
    if (success) {
      fetchModels();
    }
  };

  /**
   * 编辑分组
   */
  const handleEditGroup = () => {
    setEditGroupVisitor?.(true);
    setRow(item);
  };

  /**
   * 添加模型
   */
  const handleAddModel = (item: ModelManager.GroupItem) => {
    setModelVisitor?.(true);
    // 将当前分组信息传递给模型创建组件
    setRow({
      modelgroup_id: item.modelgroup_id,
      modelgroup_name: item.modelgroup_name,
      modelgroup_key: item.modelgroup_key,
      models: item.models,
    });
  };

  return (
    <ul key={item.modelgroup_name} className="group-list">
      <li className="group-item">
        <div className="group-title">
          <div
            className="title-info"
            onMouseLeave={handleMouseLeave}
            onMouseEnter={() => handleMouseEnter(item.modelgroup_id)}
          >
            <div className="mr5">
              {item.modelgroup_name}
              <span className="title-number">({item.models.length})</span>
              {isItemHovered(item.modelgroup_id) && (
                <div className="show-title-icon">
                  <Space size="small">
                    <span className="icon-box" onClick={() => handleAddModel(item)}>
                      <PlusOutlined />
                    </span>
                    <span className="icon-box" onClick={handleEditGroup}>
                      <EditOutlined />
                    </span>
                    {item.models.length === 0 && (
                      <span className="icon-box" onClick={handleDeleteGroup}>
                        <DeleteOutlined />
                      </span>
                    )}
                  </Space>
                </div>
              )}
            </div>
          </div>
        </div>
        <ul className="model-list clearfix">
          {item.models.map((model) => {
            const Component = allIcons[model.model_icon];
            return (
              <li
                key={model.model_id}
                className={`model-item ${model.is_active ? '' : 'is-builtin'}`}
              >
                <div className="info-model" onClick={() => handleJump(model)}>
                  <div className="icon-box">
                    <Component />
                  </div>
                  <div className="model-details">
                    <p className="model-name">{model.model_name}</p>
                    <p className="model-id">{model.model_key}</p>
                  </div>
                </div>
                {/* <div className="info-instance">
                                    <div className="icon-cc-share">
                                        <Component />
                                    </div>
                                    <p>0</p>
                                </div> */}
              </li>
            );
          })}
        </ul>
      </li>
    </ul>
  );
};

export default ModelList;
