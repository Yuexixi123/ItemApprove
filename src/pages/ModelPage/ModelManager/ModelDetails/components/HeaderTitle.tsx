import {
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  PaperClipOutlined,
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
  const { modelDetailsRecord, fetchModelsDetails } = useModel('modelDetails', (modelDetails) => {
    return {
      fetchModelsDetails: modelDetails.fetchModelsDetails,
      modelDetailsRecord: modelDetails.modelDetailsRecord,
    };
  });

  const modelId = getModelIdFromUrl();

  useEffect(() => {
    fetchModels();
    fetchModelsDetails({ model_id: modelId });
  }, []);

  // 添加默认值，防止modelDetailsRecord为undefined时解构报错
  const { modelgroup_name = '', is_builtin = false, models = [] } = modelDetailsRecord?.[0] ?? {};

  const [isShowEdit, setIsShowEdit] = useState(false);
  const [isShowGroupEdit, setIsShowGroupEdit] = useState(false);

  const handleDeleteOk = () => {
    if (is_builtin) return false;
    modal.confirm({
      title: '确定删除该模型？',
    });
  };

  const handleStopOk = () => {
    if (is_builtin) return false;
    modal.confirm({
      title: '确定停用该模型？',
    });
  };

  const handleEdit = () => {
    setIsShowEdit(true);
  };

  const handleGroupEdit = () => {
    setIsShowGroupEdit(true);
  };

  const handleCancel = () => {
    setIsShowEdit(false);
  };

  const handleSave = () => {
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
                  <Input style={{ width: '100px', height: '26px' }} />
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
                  onBlur={() => setIsShowGroupEdit(false)}
                  options={groupOptions}
                />
              )}
            </div>
            <div className="model-text">
              <span>实例数量：</span>
              <div className="text-content-count" style={{ color: '#3a84ff' }}>
                <span>0</span>
                <span className="right-icon-box">
                  <PaperClipOutlined />
                </span>
              </div>
            </div>

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
