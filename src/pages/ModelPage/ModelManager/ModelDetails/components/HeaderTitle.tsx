import {
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  // PaperClipOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { getModelIdFromUrl } from '@/utils';
import { App, Input, Select } from 'antd';
import './index.less';
import { useEffect, useState } from 'react';
import React from 'react';

const HeaderTitle = ({
  setIsShowImportField,
}: {
  setIsShowImportField: (open: boolean) => void;
}) => {
  const { modal } = App.useApp();

  const { allIcons } = useModel('global');
  const { groupOptions, fetchModels } = useModel('modelPage', (modelPage) => {
    return {
      groupOptions: modelPage.groupOptions,
      fetchModels: modelPage.fetchModels,
    };
  });
  const { modelDetailsRecord, fetchModelsDetails, runUpdateModel, runDeleteModel } = useModel(
    'modelDetails',
    (modelDetails) => {
      return {
        fetchModelsDetails: modelDetails.fetchModelsDetails,
        modelDetailsRecord: modelDetails.modelDetailsRecord,
        runUpdateModel: modelDetails.runUpdateModel,
        runDeleteModel: modelDetails.runDeleteModel,
      };
    },
  );

  const modelId = getModelIdFromUrl();

  useEffect(() => {
    fetchModels();
    fetchModelsDetails({ model_id: modelId });
  }, []);

  // 添加默认值，防止modelDetailsRecord为undefined时解构报错
  const { modelgroup_name = '', is_builtin = false, models = [] } = modelDetailsRecord?.[0] ?? {};

  const [isShowEdit, setIsShowEdit] = useState(false);
  const [isShowGroupEdit, setIsShowGroupEdit] = useState(false);
  const [editingModelName, setEditingModelName] = useState('');

  // 删除模型
  const handleDeleteOk = () => {
    if (is_builtin) return false;

    const currentModel = models[0];
    if (!currentModel) return;

    modal.confirm({
      title: '确定删除该模型？',
      content: `删除模型"${currentModel.model_name}"后，该模型下的所有资源实例也将被删除，此操作不可恢复。`,
      okText: '确定删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        await runDeleteModel({ model_id: currentModel.model_id });
      },
    });
  };

  // 停用/启用模型
  const handleStopOk = () => {
    if (is_builtin) return false;

    const currentModel = models[0];
    if (!currentModel) return;

    const isActive = currentModel.is_active;
    const actionText = isActive ? '停用' : '启用';

    modal.confirm({
      title: `确定${actionText}该模型？`,
      content: `${actionText}模型"${currentModel.model_name}"后，${
        isActive ? '将无法创建新的资源实例' : '可以正常创建资源实例'
      }。`,
      okText: `确定${actionText}`,
      cancelText: '取消',
      onOk: async () => {
        await runUpdateModel({
          model_id: String(currentModel.model_id),
          is_paused: isActive, // 注意：is_paused与is_active相反
        });
      },
    });
  };

  const handleEdit = () => {
    const currentModel = models[0];
    if (currentModel) {
      setEditingModelName(currentModel.model_name);
    }
    setIsShowEdit(true);
  };

  const handleGroupEdit = () => {
    setIsShowGroupEdit(true);
  };

  const handleGroupSave = async (modelgroup_id: string) => {
    const currentModel = models[0];
    if (!currentModel || !modelgroup_id) return;

    runUpdateModel({
      model_id: String(currentModel.model_id),
      modelgroup_id: modelgroup_id,
    });

    setIsShowGroupEdit(false);
  };

  const handleCancel = () => {
    setIsShowEdit(false);
  };

  const handleSave = async () => {
    const currentModel = models[0];
    if (!currentModel || !editingModelName.trim()) return;

    await runUpdateModel({
      model_id: String(currentModel.model_id),
      model_name: editingModelName.trim(),
    });

    setIsShowEdit(false);
  };

  const handleImportField = () => {
    setIsShowImportField(true);
  };

  return models.map((item) => {
    const ComponentsIcon = allIcons[item.model_icon ?? 'defaultIcon'];
    return (
      <React.Fragment key={item.model_id || item.model_key}>
        <div className="model-info">
          <div className="choose-icon-wrapper">
            {is_builtin ? (
              <div className="model-type is-builtin">内置</div>
            ) : (
              <div className="model-type">自定义</div>
            )}
            <div className="icon-box">{ComponentsIcon && <ComponentsIcon />}</div>
          </div>
          <div className="model-info-box">
            <div className="model-text">
              <span>唯一标识：</span>
              <span className="text-content id">{item.model_key}</span>
            </div>
            <div className="model-text">
              <span>名称：</span>
              {!isShowEdit && (
                <React.Fragment>
                  <span className="text-content">{item.model_name}</span>
                  <span className="icon-edit" onClick={handleEdit}>
                    <EditOutlined />
                  </span>
                </React.Fragment>
              )}
              {isShowEdit && (
                <>
                  <Input
                    style={{ width: '100px', height: '26px' }}
                    value={editingModelName}
                    onChange={(e) => setEditingModelName(e.target.value)}
                    onPressEnter={handleSave}
                  />
                  <span className="edit-button" onClick={handleSave}>
                    保存
                  </span>
                  <span className="edit-button" onClick={handleCancel}>
                    取消
                  </span>
                </>
              )}
            </div>
            <div className="model-text">
              <span>所属分组：</span>
              {!isShowGroupEdit && (
                <React.Fragment>
                  <span className="text-content">{modelgroup_name}</span>
                  <span className="icon-edit" onClick={handleGroupEdit}>
                    <EditOutlined />
                  </span>
                </React.Fragment>
              )}
              {isShowGroupEdit && (
                <Select
                  style={{ width: 200 }}
                  defaultValue={modelgroup_name}
                  onBlur={() => setIsShowGroupEdit(false)}
                  onChange={(value) => handleGroupSave(value)}
                  options={groupOptions}
                />
              )}
            </div>
            {/* <div className="model-text">
              <span>实例数量：</span>
              <div className="text-content-count" style={{ color: '#3a84ff' }}>
                <span>0</span>
                <span className="right-icon-box">
                  <PaperClipOutlined />
                </span>
              </div>
            </div> */}

            <div className="model-text">
              <span>更新时间：</span>
              <div className="text-content-count time">{item.update_time}</div>
            </div>
            <div className="model-text">
              <span>更新人：</span>
              <div className="text-content-count time">{item.update_name}</div>
            </div>
            <div className="model-text">
              <span>创建时间：</span>
              <div className="text-content-count time">{item.create_time}</div>
            </div>
            <div className="model-text">
              <span>创建人：</span>
              <div className="text-content-count time">{item.create_name}</div>
            </div>
          </div>
          <div className="btn-group">
            <div className="auth-box label-btn" onClick={handleImportField}>
              <VerticalAlignBottomOutlined />
              <span>导入</span>
            </div>
            <div className="auth-box label-btn">
              <VerticalAlignTopOutlined />
              <span>导出</span>
            </div>
            <div
              className={`auth-box label-btn ${is_builtin && 'is-disabled'}`}
              onClick={handleStopOk}
            >
              <InfoCircleOutlined />
              <span>停用</span>
            </div>
            <div
              className={`auth-box label-btn ${is_builtin && 'is-disabled'}`}
              onClick={handleDeleteOk}
            >
              <DeleteOutlined />
              <span>删除</span>
            </div>
          </div>
        </div>
        <div className="model-info-bottom"></div>
      </React.Fragment>
    );
  });
};

export default HeaderTitle;
