import {
  ProForm,
  ProFormDatePicker,
  ProFormText,
  ProFormDigit,
  ProFormSwitch,
  ProFormSelect,
  //   ProFormSelect,
  //   ProFormTextArea,
  //   ProFormRadio,
  //   ProFormCheckbox,
  //   ProFormRate,
  //   ProFormSlider,
  //   ProFormMoney
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Drawer, Collapse } from 'antd';
import { timezoneList } from './FieldTypeRender';
import pinyinMatch from 'pinyin-match';

const FieldPerview = ({
  showFieldPreview,
  handleClose,
}: {
  showFieldPreview: boolean;
  handleClose: () => void;
}) => {
  const { userOptions } = useModel('user', (model) => ({
    userOptions: model.userOptions,
  }));

  const { filteredData, allActiveKeys } = useModel('modelDetails', (model) => {
    return {
      filteredData: model.filteredData,
      allActiveKeys: model.allActiveKeys,
    };
  });

  const items = filteredData.map((item) => ({
    key: item.attrgroup_id,
    label: item.attrgroup_name,
    children: item.attrs?.map((child) => {
      // 通用样式
      const commonStyle = { display: 'inline-block', width: '50%' };
      const key = child.attr_id;
      const name = child.attr_key || child.attr_id;
      const label = child.attr_name;
      const required = child.is_required;
      const rules = required ? [{ required: true, message: '该项为必填项' }] : undefined;

      // 根据字段类型渲染不同的表单组件
      switch (child.attr_type) {
        // case 'select': {
        //     const options = Array.isArray(child.option) ?
        //         child.option.map(opt => ({ label: opt.label || opt, value: opt.value || opt })) :
        //         [];
        //     return (
        //         <div style={commonStyle} key={key}>
        //             <ProFormSelect
        //                 width='md'
        //                 name={name}
        //                 label={label}
        //                 rules={rules}
        //                 options={options}
        //             />
        //         </div>
        //     );
        // }
        case 'date':
          return (
            <div style={commonStyle} key={key}>
              <ProFormDatePicker
                width="md"
                name={name}
                label={label}
                rules={rules}
                fieldProps={{ format: 'YYYY-MM-DD' }}
              />
            </div>
          );
        case 'datetime':
          return (
            <div style={commonStyle} key={key}>
              <ProFormDatePicker
                width="md"
                name={name}
                label={label}
                rules={rules}
                fieldProps={{ format: 'YYYY-MM-DD HH:mm:ss', showTime: true }}
              />
            </div>
          );
        // case 'textarea':
        //     return (
        //         <div style={commonStyle} key={key}>
        //             <ProFormTextArea
        //                 width='md'
        //                 name={name}
        //                 label={label}
        //                 rules={rules}
        //             />
        //         </div>
        //     );
        case 'number':
          return (
            <div style={commonStyle} key={key}>
              <ProFormDigit width="md" name={name} label={label} rules={rules} />
            </div>
          );
        case 'boolean':
          return (
            <div style={commonStyle} key={key}>
              <ProFormSwitch name={name} label={label} rules={rules} />
            </div>
          );
        case 'timezone':
          return (
            <div style={commonStyle} key={key}>
              <ProFormSelect
                width="md"
                name={name}
                label={label}
                rules={rules}
                initialValue={'Shanghai'}
                options={timezoneList}
                fieldProps={{
                  filterOption: (input, option) => {
                    return (
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase()) ||
                      !!pinyinMatch.match((option?.label ?? '').toString(), input)
                    );
                  },
                  virtual: true,
                  listHeight: 400,
                }}
              />
            </div>
          );

        case 'user':
          return (
            <div style={commonStyle} key={key}>
              <ProFormSelect
                name="attr_default"
                label="默认值"
                showSearch
                options={userOptions}
                fieldProps={{
                  filterOption: (input, option) => {
                    return (
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase()) ||
                      !!pinyinMatch.match((option?.label ?? '').toString(), input)
                    );
                  },
                  virtual: true,
                  listHeight: 400,
                }}
              />
            </div>
          );
        // case 'radio': {
        //     const radioOptions = Array.isArray(child.option) ?
        //         child.option.map(opt => ({ label: opt.label || opt, value: opt.value || opt })) :
        //         [];
        //     return (
        //         <div style={commonStyle} key={key}>
        //             <ProFormRadio.Group
        //                 name={name}
        //                 label={label}
        //                 rules={rules}
        //                 options={radioOptions}
        //             />
        //         </div>
        //     );
        // }
        // case 'checkbox': {
        //     const checkboxOptions = Array.isArray(child.option) ?
        //         child.option.map(opt => ({ label: opt.label || opt, value: opt.value || opt })) :
        //         [];
        //     return (
        //         <div style={commonStyle} key={key}>
        //             <ProFormCheckbox.Group
        //                 name={name}
        //                 label={label}
        //                 rules={rules}
        //                 options={checkboxOptions}
        //             />
        //         </div>
        //     );
        // }
        // case 'rate':
        //     return (
        //         <div style={commonStyle} key={key}>
        //             <ProFormRate
        //                 name={name}
        //                 label={label}
        //                 rules={rules}
        //             />
        //         </div>
        //     );
        // case 'slider':
        //     return (
        //         <div style={commonStyle} key={key}>
        //             <ProFormSlider
        //                 name={name}
        //                 label={label}
        //                 rules={rules}
        //             />
        //         </div>
        //     );
        // case 'money':
        //     return (
        //         <div style={commonStyle} key={key}>
        //             <ProFormMoney
        //                 width='md'
        //                 name={name}
        //                 label={label}
        //                 rules={rules}
        //             />
        //         </div>
        //     );
        // case 'password':
        //     return (
        //         <div style={commonStyle} key={key}>
        //             <ProFormText.Password
        //                 width='md'
        //                 name={name}
        //                 label={label}
        //                 rules={rules}
        //             />
        //         </div>
        //     );
        case 'text':
        default:
          return (
            <div style={commonStyle} key={key}>
              <ProFormText width="md" name={name} label={label} rules={rules} />
            </div>
          );
      }
    }),
  }));

  return (
    <Drawer
      width={800}
      title="字段预览"
      open={showFieldPreview}
      onClose={handleClose}
      footer={null}
    >
      <ProForm submitter={false} layout="vertical">
        <Collapse defaultActiveKey={allActiveKeys} ghost items={items} />
      </ProForm>
    </Drawer>
  );
};

export default FieldPerview;
