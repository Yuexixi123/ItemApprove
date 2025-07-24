// 导入ProComponents组件
import { ProDescriptions } from '@ant-design/pro-components';
// 导入antd组件
import { Button, Drawer } from 'antd';

/**
 * 查看字段抽屉组件的Props接口定义
 */
interface CreateFieldDrawerProps {
  title?: string; // 抽屉标题
  drawerVisit: boolean; // 抽屉显示状态
  values: ModelField.ModelAttribute | undefined; // 字段值
  setDrawerVisit: (value: boolean) => void; // 设置抽屉显示状态的函数
  setUpdateDrawerVisit: (value: boolean) => void; // 设置更新抽屉显示状态的函数
}

/**
 * 查看字段抽屉组件
 * @param drawerVisit - 抽屉显示状态
 * @param setDrawerVisit - 设置抽屉显示状态的函数
 * @param setUpdateDrawerVisit - 设置更新抽屉显示状态的函数
 * @param values - 字段值
 */
const CreateFieldDrawer: React.FC<CreateFieldDrawerProps> = ({
  drawerVisit,
  setDrawerVisit,
  setUpdateDrawerVisit,
  values,
}) => {
  // 处理编辑按钮点击事件
  const handleEditorDrawer = () => {
    setDrawerVisit(false);
    setUpdateDrawerVisit(true);
  };

  return (
    <Drawer onClose={() => setDrawerVisit(false)} title="字段详情" width={500} open={drawerVisit}>
      <ProDescriptions
        column={2}
        layout="vertical"
        params={values}
        request={async () => {
          return Promise.resolve({
            success: true,
            data: values,
          });
        }}
      >
        <ProDescriptions.Item
          label="唯一标识"
          tooltip="请填写英文开头，下划线，数字，英文的组合"
          dataIndex="attr_key"
        />
        <ProDescriptions.Item dataIndex="attr_name" label="字段名称" />
        <ProDescriptions.Item valueType="select" dataIndex="attr_type" label="字段类型" />
        <ProDescriptions.Item
          valueEnum={{
            false: '否',
            true: '是',
          }}
          valueType="select"
          dataIndex="is_form_show"
          label="在表单中显示"
        />
        <ProDescriptions.Item
          valueEnum={{
            false: '否',
            true: '是',
          }}
          valueType="select"
          dataIndex="editable"
          label="在实例中可编辑"
        />
        <ProDescriptions.Item
          valueEnum={{
            false: '否',
            true: '是',
          }}
          dataIndex="is_required"
          valueType="select"
          label="是否为必填项"
        />
        <ProDescriptions.Item dataIndex="description" label="用户提示" valueType="textarea" />
      </ProDescriptions>
      {values?.editable && (
        <Button onClick={handleEditorDrawer} style={{ marginTop: 24 }} type="primary">
          编辑
        </Button>
      )}
    </Drawer>
  );
};

export default CreateFieldDrawer;
