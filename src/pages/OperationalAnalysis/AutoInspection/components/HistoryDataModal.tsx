import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Spin,
  Empty,
  Typography,
  Card,
  Space,
  Tag,
  DatePicker,
  Button,
  Row,
  Col,
  Popover,
} from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { Text } = Typography;
const { RangePicker } = DatePicker;

// 图表组件
const DataChart: React.FC<{ data: any[]; unit?: string }> = ({ data, unit }) => {
  // 转换数据格式为recharts需要的格式
  const chartData = data.map((point) => ({
    time: new Date(point.datetime).toLocaleTimeString(),
    value: parseFloat(point.value),
    datetime: point.datetime,
  }));

  return (
    <Card>
      <div style={{ height: 300, padding: '20px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{ value: unit || '', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              labelFormatter={(value) => `时间: ${value}`}
              formatter={(value: any) => [value + (unit || ''), '数值']}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#1890ff"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

interface HistoryDataModalProps {
  open: boolean;
  onClose: () => void;
  itemId: string | null;
  itemName: string;
  valueType: string; // 新增：数据类型 ('string' | 'number')
  unit?: string; // 新增：单位
  onFetchHistoryData: (
    itemId: string,
    params?: { stime?: string; etime?: string },
  ) => Promise<AutoInspection.HistoryDataResponse>;
}

const HistoryDataModal: React.FC<HistoryDataModalProps> = ({
  open,
  onClose,
  itemId,
  itemName,
  valueType,
  unit,
  onFetchHistoryData,
}) => {
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState<AutoInspection.HistoryDataResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<[Dayjs, Dayjs] | null>(null);

  // 快速检索时间范围计算函数
  const getQuickTimeRange = (type: string): [Dayjs, Dayjs] => {
    const now = dayjs();

    switch (type) {
      case 'today':
        return [now.startOf('day'), now.endOf('day')];
      case 'yesterday': {
        const yesterday = now.subtract(1, 'day');
        return [yesterday.startOf('day'), yesterday.endOf('day')];
      }
      case 'dayBeforeYesterday': {
        const dayBeforeYesterday = now.subtract(2, 'day');
        return [dayBeforeYesterday.startOf('day'), dayBeforeYesterday.endOf('day')];
      }
      case 'thisWeek':
        return [now.startOf('week'), now.endOf('week')];
      case 'lastWeek': {
        const lastWeekStart = now.subtract(1, 'week').startOf('week');
        const lastWeekEnd = now.subtract(1, 'week').endOf('week');
        return [lastWeekStart, lastWeekEnd];
      }
      case 'thisMonth':
        return [now.startOf('month'), now.endOf('month')];
      case 'thisYear':
        return [now.startOf('year'), now.endOf('year')];
      default:
        return [now.startOf('day'), now.endOf('day')];
    }
  };

  // 获取历史数据
  const fetchData = async (customTimeRange?: [Dayjs, Dayjs] | null) => {
    if (!itemId) return;

    setLoading(true);
    setError(null);

    try {
      const range = customTimeRange !== undefined ? customTimeRange : timeRange;
      const params = range
        ? {
            stime: range[0].format('YYYY-MM-DD HH:mm:ss'),
            etime: range[1].format('YYYY-MM-DD HH:mm:ss'),
          }
        : undefined;

      const data = await onFetchHistoryData(itemId, params);
      setHistoryData(data);
    } catch (err) {
      setError('获取历史数据失败');
      console.error('Failed to fetch history data:', err);
    } finally {
      setLoading(false);
    }
  };

  // 处理快速检索选择
  const handleQuickSearch = (type: string) => {
    const range = getQuickTimeRange(type);
    setTimeRange(range);
    fetchData(range);
  };

  // 当弹窗打开且有itemId时获取数据
  useEffect(() => {
    if (open && itemId) {
      fetchData();
    } else {
      setHistoryData(null);
      setError(null);
      setTimeRange(null);
    }
  }, [open, itemId]);

  // 格式化时间显示
  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 渲染曲线图
  const renderChart = (data: AutoInspection.HistoryDataPoint[], unit?: string) => {
    return <DataChart data={data} unit={unit} />;
  };

  // 渲染表格
  const renderTable = (data: AutoInspection.HistoryDataPoint[]) => {
    const columns: ColumnsType<AutoInspection.HistoryDataPoint> = [
      {
        title: '时间',
        dataIndex: 'datetime',
        key: 'datetime',
        width: 180,
        render: (datetime: string) => formatTime(datetime),
        sorter: (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
        defaultSortOrder: 'descend',
      },
      {
        title: '值',
        dataIndex: 'value',
        key: 'value',
        render: (value: string) => <Text code>{String(value)}</Text>,
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={data.map((item, index) => ({ ...item, key: index }))}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        scroll={{ y: 400 }}
      />
    );
  };

  // 渲染内容
  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">正在加载历史数据...</Text>
          </div>
        </div>
      );
    }

    if (error) {
      return <Empty description={error} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    if (!historyData || !historyData.data.length) {
      return <Empty description="暂无历史数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 时间范围选择器 */}
        <Card size="small">
          <Row gutter={16} align="middle">
            <Col>
              <Text strong>时间范围:</Text>
            </Col>
            <Col>
              <RangePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                value={timeRange}
                onChange={(dates) => setTimeRange(dates as [Dayjs, Dayjs] | null)}
                placeholder={['开始时间', '结束时间']}
                style={{ width: 350 }}
              />
            </Col>
            <Col>
              <Button type="primary" onClick={() => fetchData()} loading={loading}>
                查询
              </Button>
            </Col>
            <Col>
              <Button
                onClick={() => {
                  setTimeRange(null);
                  fetchData(null);
                }}
                loading={loading}
              >
                重置
              </Button>
            </Col>
            <Col>
              <Popover
                content={
                  <div style={{ width: 200 }}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Button
                        type="text"
                        block
                        onClick={() => handleQuickSearch('today')}
                        style={{ textAlign: 'left' }}
                      >
                        今天
                      </Button>
                      <Button
                        type="text"
                        block
                        onClick={() => handleQuickSearch('yesterday')}
                        style={{ textAlign: 'left' }}
                      >
                        昨天
                      </Button>
                      <Button
                        type="text"
                        block
                        onClick={() => handleQuickSearch('dayBeforeYesterday')}
                        style={{ textAlign: 'left' }}
                      >
                        前天
                      </Button>
                      <Button
                        type="text"
                        block
                        onClick={() => handleQuickSearch('thisWeek')}
                        style={{ textAlign: 'left' }}
                      >
                        本周
                      </Button>
                      <Button
                        type="text"
                        block
                        onClick={() => handleQuickSearch('lastWeek')}
                        style={{ textAlign: 'left' }}
                      >
                        上一周
                      </Button>
                      <Button
                        type="text"
                        block
                        onClick={() => handleQuickSearch('thisMonth')}
                        style={{ textAlign: 'left' }}
                      >
                        本月
                      </Button>
                      <Button
                        type="text"
                        block
                        onClick={() => handleQuickSearch('thisYear')}
                        style={{ textAlign: 'left' }}
                      >
                        本年
                      </Button>
                    </Space>
                  </div>
                }
                title="快速检索"
                trigger="hover"
                placement="bottom"
              >
                <Button icon={<ClockCircleOutlined />}>快速检索</Button>
              </Popover>
            </Col>
          </Row>
        </Card>

        {/* 数据信息 */}
        <Card size="small">
          <Space wrap>
            <Text strong>监控项:</Text>
            <Text>{itemName}</Text>
            <Text strong>数据类型:</Text>
            <Tag color={valueType === 'number' ? 'blue' : 'green'}>
              {valueType === 'number' ? '数值' : '文本'}
            </Tag>
            {unit && (
              <>
                <Text strong>单位:</Text>
                <Text>{unit}</Text>
              </>
            )}
            <Text strong>数据点数:</Text>
            <Text>{historyData.data.length}</Text>
          </Space>
        </Card>

        {/* 数据展示 */}
        {valueType === 'number'
          ? renderChart(historyData.data, unit)
          : renderTable(historyData.data)}
      </Space>
    );
  };

  return (
    <Modal
      title={`历史数据 - ${itemName}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnClose
    >
      {renderContent()}
    </Modal>
  );
};

export default HistoryDataModal;
