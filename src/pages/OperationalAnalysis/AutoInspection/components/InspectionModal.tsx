import React, { useState } from 'react';
import { useModel } from '@umijs/max';
import {
  Modal,
  Progress,
  Collapse,
  Table,
  Tag,
  Button,
  Space,
  Switch,
  Tooltip,
  Empty,
  Typography,
  Divider,
} from 'antd';
import { DownloadOutlined, HistoryOutlined } from '@ant-design/icons';
import HistoryDataModal from './HistoryDataModal';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

interface InspectionModalProps {
  open: boolean;
  onClose: () => void;
  inspectionTask: AutoInspection.InspectionTask | null;
  onExport: (options: AutoInspection.ExportOptions) => void;
}

const InspectionModal: React.FC<InspectionModalProps> = ({
  open,
  onClose,
  inspectionTask,
  onExport,
}) => {
  const { fetchItemHistoryData } = useModel('inspection');

  const [filterOptions, setFilterOptions] = useState<AutoInspection.TableFilterOptions>({
    showOnlyAlerts: false,
    sortByTriggerLevel: false,
  });

  // 历史数据弹窗状态
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemName, setSelectedItemName] = useState<string>('');
  const [selectedValueType, setSelectedValueType] = useState<string>('string');
  const [selectedUnit, setSelectedUnit] = useState<string>('');

  // 获取监控项历史数据
  const fetchHistoryData = async (
    itemId: string,
    params?: { stime?: string; etime?: string },
  ): Promise<AutoInspection.HistoryDataResponse> => {
    try {
      const response = await fetchItemHistoryData(itemId, params);

      // fetchItemHistoryData返回的是历史数据数组，不是完整响应对象
      if (!response || !Array.isArray(response)) {
        throw new Error('Invalid response format');
      }

      // 直接返回响应数据，不再进行数据类型判断
      return {
        code: 0,
        inside_code: 0,
        msg: 'success',
        data: response.map((point: any) => ({
          value: point.value,
          datetime: point.datetime,
        })),
      };
    } catch (error) {
      console.error('Failed to fetch history data:', error);
      throw error;
    }
  };

  // 打开历史数据弹窗
  const handleShowHistory = (
    itemId: string,
    itemName: string,
    valueType?: string,
    unit?: string,
  ) => {
    setSelectedItemId(itemId);
    setSelectedItemName(itemName);
    setSelectedValueType(valueType || 'string');
    setSelectedUnit(unit || '');
    setHistoryModalOpen(true);
  };

  // 获取主机状态颜色
  const getHostStatusColor = (status: AutoInspection.HostStatus) => {
    switch (status) {
      case 'normal':
        return 'green';
      case 'warning':
        return 'orange';
      case 'critical':
        return 'red';
      default:
        return 'default';
    }
  };

  // 获取触发器级别颜色
  const getTriggerLevelColor = (level: AutoInspection.TriggerLevel) => {
    switch (level) {
      case '0':
      case 'info':
        return 'default';
      case '1':
        return 'blue';
      case '2':
      case 'warning':
        return 'orange';
      case '3':
        return 'gold';
      case '4':
      case 'critical':
        return 'red';
      case '5':
        return 'magenta';
      default:
        return 'default';
    }
  };

  // 获取触发器级别权重（用于排序）
  const getTriggerLevelWeight = (level: AutoInspection.TriggerLevel) => {
    switch (level) {
      case '5':
        return 5;
      case '4':
      case 'critical':
        return 4;
      case '3':
        return 3;
      case '2':
      case 'warning':
        return 2;
      case '1':
      case 'info':
        return 1;
      case '0':
        return 0;
      default:
        return 0;
    }
  };

  // 获取触发器级别中文显示
  const getTriggerLevelText = (level: AutoInspection.TriggerLevel) => {
    switch (level) {
      case '0':
        return '未分类';
      case '1':
      case 'info':
        return '信息';
      case '2':
      case 'warning':
        return '警告';
      case '3':
        return '一般严重';
      case '4':
      case 'critical':
        return '严重';
      case '5':
        return '灾难';
      default:
        return '未知';
    }
  };

  // 监控项表格列定义
  const monitoringItemColumns: ColumnsType<AutoInspection.MonitoringItem> = [
    {
      title: '应用分组',
      dataIndex: 'application',
      key: 'application',
      width: 200,
    },
    {
      title: '监控项名称',
      dataIndex: 'item_name',
      key: 'item_name',
      width: 200,
    },
    {
      title: '当前值',
      dataIndex: 'value',
      key: 'value',
      width: 120,
      // render: (value: string | number, record: AutoInspection.MonitoringItem) => (
      //    <span>
      //      {value} {record.unit && <Text type="secondary">({record.unit})</Text>}
      //    </span>
      //  ),
    },
    {
      title: '单位',
      dataIndex: 'units',
      key: 'units',
      width: 100,
    },
    {
      title: '触发器',
      dataIndex: 'triggers',
      key: 'triggers',
      render: (triggers: AutoInspection.TriggerInfo[]) => (
        <Space wrap>
          {triggers.map((trigger: AutoInspection.TriggerInfo, index: number) => (
            <Tooltip key={`trigger-${index}`} title={trigger.trigger_name}>
              <Tag
                color={getTriggerLevelColor(
                  String(trigger.trigger_level) as AutoInspection.TriggerLevel,
                )}
              >
                {trigger.trigger_name}-
                {getTriggerLevelText(String(trigger.trigger_level) as AutoInspection.TriggerLevel)}
              </Tag>
            </Tooltip>
          ))}
        </Space>
      ),
    },

    {
      title: '更新时间',
      dataIndex: 'latest_time',
      key: 'latest_time',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record: AutoInspection.MonitoringItem) => (
        <Button
          type="link"
          size="small"
          icon={<HistoryOutlined />}
          onClick={() =>
            handleShowHistory(
              String(record.item_id),
              record.item_name,
              record.value_type,
              record.units,
            )
          }
        >
          历史数据
        </Button>
      ),
    },
  ];

  // 过滤和排序监控项
  const filterAndSortItems = (items: AutoInspection.MonitoringItem[]) => {
    let filteredItems = [...items];

    // 只显示有告警的项
    if (filterOptions.showOnlyAlerts) {
      filteredItems = filteredItems.filter((item) => item.triggers.length > 0);
    }

    // 按触发器级别排序
    if (filterOptions.sortByTriggerLevel) {
      filteredItems.sort((a, b) => {
        const aMaxLevel = Math.max(
          ...a.triggers.map((t) =>
            getTriggerLevelWeight(String(t.trigger_level) as AutoInspection.TriggerLevel),
          ),
          0,
        );
        const bMaxLevel = Math.max(
          ...b.triggers.map((t) =>
            getTriggerLevelWeight(String(t.trigger_level) as AutoInspection.TriggerLevel),
          ),
          0,
        );
        return bMaxLevel - aMaxLevel;
      });
    }

    return filteredItems;
  };

  // 计算统计信息
  const getStatistics = () => {
    if (!inspectionTask) return { totalItems: 0, alertItems: 0, normalItems: 0 };

    const allItems = inspectionTask.hosts.flatMap((host) => host.monitoringItems);
    const alertItems = allItems.filter((item) => item.triggers.length > 0);

    return {
      totalItems: allItems.length,
      alertItems: alertItems.length,
      normalItems: allItems.length - alertItems.length,
    };
  };

  const statistics = getStatistics();

  console.log('inspectionTask', inspectionTask);

  return (
    <>
      <Modal
        title={`巡检结果 - ${inspectionTask?.systemName || '未知系统'}`}
        open={open}
        onCancel={onClose}
        width={1200}
        footer={[
          <Button
            key="export"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => onExport({ format: 'excel', taskId: inspectionTask?.taskId || '' })}
          >
            导出Excel
          </Button>,
          <Button key="close" onClick={onClose}>
            关闭
          </Button>,
        ]}
      >
        {inspectionTask ? (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* 进度信息 */}
            <div>
              <Text strong>巡检进度: </Text>
              <Progress
                percent={Math.round(
                  (inspectionTask.completedHosts / inspectionTask.totalHosts) * 100,
                )}
                status={
                  inspectionTask.status === 'completed'
                    ? 'success'
                    : inspectionTask.status === 'failed'
                    ? 'exception'
                    : 'active'
                }
                format={() => `${inspectionTask.completedHosts}/${inspectionTask.totalHosts}`}
              />
            </div>

            {/* 统计信息 */}
            <Space size="large">
              <Text>
                总监控项: <Text strong>{statistics.totalItems}</Text>
              </Text>
              <Text>
                告警项:{' '}
                <Text strong style={{ color: '#ff4d4f' }}>
                  {statistics.alertItems}
                </Text>
              </Text>
              <Text>
                正常项:{' '}
                <Text strong style={{ color: '#52c41a' }}>
                  {statistics.normalItems}
                </Text>
              </Text>
            </Space>

            {/* 筛选选项 */}
            <Space>
              <Text>筛选选项:</Text>
              <Switch
                checkedChildren="只显示告警"
                unCheckedChildren="显示全部"
                checked={filterOptions.showOnlyAlerts}
                onChange={(checked) =>
                  setFilterOptions((prev) => ({ ...prev, showOnlyAlerts: checked }))
                }
              />
              <Switch
                checkedChildren="按级别排序"
                unCheckedChildren="默认排序"
                checked={filterOptions.sortByTriggerLevel}
                onChange={(checked) =>
                  setFilterOptions((prev) => ({ ...prev, sortByTriggerLevel: checked }))
                }
              />
            </Space>

            <Divider />

            {/* 主机巡检结果 */}
            <Collapse
              items={inspectionTask.hosts.map((host) => ({
                key: host.hostId,
                label: (
                  <Space>
                    <Text strong>{host.hostName}</Text>
                    <Text type="secondary">({host.ip})</Text>
                    <Tag color={getHostStatusColor(host.status)}>
                      {host.status === 'normal'
                        ? '正常'
                        : host.status === 'warning'
                        ? '警告'
                        : '严重'}
                    </Tag>
                    <Text type="secondary">
                      {host.loadedItemsCount}/{host.totalItemsCount} 项
                    </Text>
                  </Space>
                ),
                children: (
                  <Table
                    columns={monitoringItemColumns}
                    dataSource={filterAndSortItems(host.monitoringItems)}
                    rowKey="item_id"
                    size="small"
                    pagination={{
                      pageSize: 10,
                      showTotal: (total) => `共 ${total} 项`,
                    }}
                    locale={{
                      emptyText: filterOptions.showOnlyAlerts ? '暂无告警项' : '暂无监控项',
                    }}
                  />
                ),
              }))}
              defaultActiveKey={inspectionTask.hosts.map((host) => host.hostId)}
            />
          </Space>
        ) : (
          <Empty description="暂无巡检数据" />
        )}
      </Modal>

      {/* 历史数据弹窗 */}
      <HistoryDataModal
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        itemId={selectedItemId}
        itemName={selectedItemName}
        valueType={selectedValueType}
        unit={selectedUnit}
        onFetchHistoryData={fetchHistoryData}
      />
    </>
  );
};

export default InspectionModal;
