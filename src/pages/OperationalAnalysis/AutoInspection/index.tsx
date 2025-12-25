import React, { useRef, useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { ActionType, ProColumns } from '@ant-design/pro-table';
import { Button, App } from 'antd';
import CustomProTable from '@/components/MyProTable/CustomProTable';
import { getSystemList } from '@/services/inspection/api';
import { PlayCircleOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import InspectionModal from './components/InspectionModal';

// 定义数据类型
interface InspectionItem {
  system_name: string;
  system_id: number;
}

const AutoInspection: React.FC = () => {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSystemId, setCurrentSystemId] = useState<number | undefined>();
  const [inspectionLoading, setInspectionLoading] = useState<number | null>(null); // 添加loading状态，记录正在巡检的系统ID

  // 使用inspection模型获取系统列表数据和巡检功能
  const {
    insertHostCache,
    inspectionData,
    isInspecting,
    startInspectionPolling,
    stopInspectionPolling,
    hostTotal,
  } = useModel('inspection', (model) => ({
    insertHostCache: model.insertHostCache,
    inspectionData: model.inspectionData,
    isInspecting: model.isInspecting,
    startInspectionPolling: model.startInspectionPolling,
    stopInspectionPolling: model.stopInspectionPolling,
    hostTotal: model.hostTotal,
  }));

  // 监听巡检状态变化
  useEffect(() => {
    // 当巡检状态从true变为false时，表示巡检完成
    if (!isInspecting && inspectionData.length > 0) {
      message.destroy(); // 清除所有message
      message.success('巡检已完成！');
      // 清除loading状态
      setInspectionLoading(null);
      // 巡检完成，刷新表格
      actionRef.current?.reload();
    }
  }, [isInspecting, inspectionData.length]);

  // 一键巡检操作
  const handleInspection = async (systemId?: number) => {
    // 如果当前系统正在巡检中，则不允许重复点击
    if (inspectionLoading === systemId) {
      return;
    }

    try {
      setInspectionLoading(systemId || null); // 设置loading状态

      message.loading('正在插入系统主机缓存...', 1);

      // 第一步：插入系统下的所有主机到Redis缓存
      const cacheResult = await insertHostCache(systemId);
      message.success(`已缓存 ${cacheResult.host_total} 台主机`);

      // 第二步：启动巡检轮询
      message.loading('正在启动巡检任务...', 1);

      // 保存当前系统ID
      setCurrentSystemId(systemId);

      // 打开巡检弹框
      setModalOpen(true);

      // 开始巡检轮询，并显示正在巡检的提示
      await startInspectionPolling(systemId);
      message.loading('正在进行巡检，请稍候...', 0); // 持续显示loading直到巡检完成
    } catch (error) {
      console.error('巡检启动失败:', error);
      message.error(error instanceof Error ? error.message : '巡检启动失败');
    } finally {
      // 延迟清除loading状态，避免用户快速重复点击
      setTimeout(() => {
        setInspectionLoading(null);
      }, 2000);
    }
  };

  // 关闭弹框
  const handleModalClose = () => {
    setModalOpen(false);
    // 停止巡检轮询
    stopInspectionPolling();
  };

  // 导出处理
  const handleExport = async () => {
    try {
      message.loading('正在导出数据...', 1);

      if (inspectionData.length > 0) {
        // TODO: 替换为实际的导出服务调用
        // const result = await exportInspectionResult(inspectionData);

        // 模拟导出成功
        const result = { success: true };

        if (result.success) {
          message.success('导出成功');
          // 这里可以添加下载逻辑
        } else {
          message.error('导出失败');
        }
      } else {
        message.warning('暂无巡检数据可导出');
      }
    } catch (error) {
      message.error('导出失败');
      console.error('导出失败:', error);
    }
  };

  // 将巡检数据转换为InspectionTask格式
  const convertToInspectionTask = (): AutoInspection.InspectionTask | null => {
    if (!inspectionData.length && !isInspecting) return null;

    // 由于现在使用CustomProTable，系统信息从表格数据中获取
    const currentSystem = { system_name: '系统' + currentSystemId };

    // 修复进度计算逻辑：实时反映巡检进度
    let completedHosts = 0;
    let totalHosts = hostTotal || 1;

    if (!isInspecting && inspectionData.length > 0) {
      // 巡检已完成，进度应该是100%
      completedHosts = totalHosts;
    } else if (isInspecting) {
      // 巡检进行中：基于实际返回的数据数量计算进度
      // 不管execute_status如何，只要有数据返回就算完成了该主机的巡检
      completedHosts = inspectionData.length;

      // 确保completedHosts不超过totalHosts
      if (completedHosts > totalHosts) {
        completedHosts = totalHosts;
      }
    }

    // 添加调试日志
    console.log('convertToInspectionTask 调试信息:', {
      inspectionDataLength: inspectionData.length,
      hostTotal,
      completedHosts,
      totalHosts,
      isInspecting,
      progressPercent: Math.round((completedHosts / totalHosts) * 100),
      inspectionData: inspectionData.map((d) => ({
        ip: d.ip,
        execute_status: d.execute_status,
        host_name: d.host_name,
      })),
    });

    const task: AutoInspection.InspectionTask = {
      taskId: `task_${currentSystemId}_${Date.now()}`,
      systemName: currentSystem?.system_name || '未知系统',
      status: isInspecting
        ? 'running'
        : ((inspectionData.length > 0
            ? 'completed'
            : 'pending') as AutoInspection.InspectionStatus),
      totalHosts,
      completedHosts,
      hosts: inspectionData.map((data) => ({
        hostId: data.ip,
        hostName: data.host_name,
        ip: data.ip,
        status:
          data.execute_status === 'success' ? 'normal' : ('warning' as AutoInspection.HostStatus),
        monitoringItems: (data.inspection_datas || []).map((item) => ({
          item_id: item.item_id || Math.random(),
          item_name: item.item_name || '未知监控项',
          item_key: item.item_key || '',
          value: item.value || '0',
          value_type: item.value_type || 'string',
          units: item.units || '',
          triggers: item.triggers || [],
          latest_time: item.latest_time || new Date().toISOString(),
          is_alarm: item.is_alarm || false,
          application: item.application || 'default',
        })),
        loadedItemsCount: data.inspection_datas?.length || 0,
        totalItemsCount: data.inspection_datas?.length || 0,
      })),
    };

    console.log('生成的 InspectionTask:', task);
    return task;
  };

  // 表格列配置
  const columns: ProColumns<InspectionItem>[] = [
    {
      title: '系统名称',
      dataIndex: 'system_name',
      key: 'system_name',
      hideInForm: true,
      hideInSearch: true,
    },
    {
      title: '系统名称',
      dataIndex: 'system_id',
      key: 'system_id',
      valueType: 'select',
      hideInTable: true,
      fieldProps: {
        showSearch: true,
        placeholder: '请选择系统名称',
      },
      // 系统选择项将由CustomProTable动态处理
      request: async () => {
        try {
          const res = await getSystemList({ current: 1, page_size: 10000, no_page_size: true });
          if (res.inside_code === 0 && Array.isArray(res.data.data)) {
            return res.data.data.map((item) => ({
              label: item.system_name,
              value: item.system_id,
            }));
          }
        } catch (error) {
          console.error('获取系统列表失败:', error);
        }
        return [];
      },
    },
    // {
    //   title: '主机数量',
    //   dataIndex: 'totalHosts',
    //   key: 'totalHosts',
    //   width: 100,
    //   render: (text, record) => {
    //     if (record.totalHosts === undefined) return '-';
    //     return (
    //       <span>
    //         <span style={{ color: '#52c41a' }}>{record.healthyHosts || 0}</span>
    //         <span style={{ margin: '0 4px' }}>/</span>
    //         <span>{record.totalHosts}</span>
    //       </span>
    //     );
    //   },
    // },
    // {
    //   title: '告警数量',
    //   dataIndex: 'alertCount',
    //   key: 'alertCount',
    //   width: 100,
    //   render: (text, record) => {
    //     if (record.alertCount === undefined) return '-';
    //     const color = record.alertCount === 0 ? '#52c41a' : record.alertCount > 10 ? '#ff4d4f' : '#faad14';
    //     return <span style={{ color }}>{record.alertCount}</span>;
    //   },
    // },
    // {
    //   title: '系统状态',
    //   dataIndex: 'status',
    //   key: 'status',
    //   width: 100,
    //   render: (text, record) => {
    //     if (!record.status) return '-';
    //     const statusConfig = {
    //       healthy: { color: '#52c41a', text: '健康' },
    //       warning: { color: '#faad14', text: '警告' },
    //       error: { color: '#ff4d4f', text: '异常' },
    //       unknown: { color: '#d9d9d9', text: '未知' },
    //     };
    //     const config = statusConfig[record.status];
    //     return (
    //       <span style={{ color: config.color }}>
    //         ●&nbsp;{config.text}
    //       </span>
    //     );
    //   },
    // },
    // {
    //   title: '最后巡检时间',
    //   dataIndex: 'lastInspectionTime',
    //   key: 'lastInspectionTime',
    //   width: 180,
    //   render: (text) => text || '-',
    // },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 200,
      render: (_text, record) => [
        <Button
          key="inspection"
          type="primary"
          icon={<PlayCircleOutlined />}
          loading={inspectionLoading === record.system_id}
          disabled={inspectionLoading === record.system_id}
          onClick={() => handleInspection(record.system_id)}
        >
          一键巡检
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer title={false}>
      <CustomProTable<InspectionItem>
        actionRef={actionRef}
        rowKey="system_id"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button key="refresh" onClick={() => actionRef.current?.reload()}>
            刷新
          </Button>,
        ]}
        api={(params) => getSystemList(params as Inspection.SystemListParams)}
        pageName="auto-inspection"
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
      />

      {/* 巡检弹框 */}
      <InspectionModal
        open={modalOpen}
        onClose={handleModalClose}
        inspectionTask={convertToInspectionTask()}
        onExport={handleExport}
      />
    </PageContainer>
  );
};

export default AutoInspection;
