declare namespace AutoInspection {
  // 巡检任务状态
  type InspectionStatus = 'pending' | 'running' | 'completed' | 'failed';

  // 触发器级别
  type TriggerLevel = '0' | '1' | '2' | '3' | '4' | '5' | 'info' | 'warning' | 'critical';

  // 主机状态
  type HostStatus = 'normal' | 'warning' | 'critical';

  // 历史数据类型枚举
  enum HistoryDataType {
    NUMERIC = 'numeric', // 数值类型，展示曲线图
    TEXT = 'text', // 文本类型，展示表格
  }

  // 巡检系统项
  interface InspectionItem {
    id: string;
    systemName: string;
    systemId: number;
  }

  // 触发器信息
  interface TriggerInfo {
    trigger_name: string; // 触发器名称
    trigger_level: TriggerLevel; // 触发器严重程度 (0-5)
  }

  // 监控项信息（新的API响应格式）
  interface MonitoringItem {
    application: string; // zabbix标签名
    item_id: number; // 监控项ID (zabbix中的监控项ID)
    item_name: string; // 监控项资源名称
    item_key: string; // 监控项KEY (zabbix中监控项的唯一key)
    value: string; // 监控项值 (监控项的最新值)
    value_type: string; // 值类型 ('string' | 'number')
    units: string; // 单位 (值的单位)
    triggers: TriggerInfo[]; // 触发器名称列表
    latest_time: string; // 值的最新时间
    is_alarm: boolean; // 是否存在告警 (0: 未触发, 1: 触发)
  }

  // 历史数据点接口（新的API响应格式）
  interface HistoryDataPoint {
    value: string; // 监控项值
    datetime: string; // 时间，YYYY-mm-dd HH:MM:SS
  }

  // 历史数据响应接口（新的API响应格式）
  interface HistoryDataResponse {
    code: number; // 外部状态码
    inside_code: number; // 内部状态码
    msg: string; // 消息体
    data: HistoryDataPoint[]; // 历史数据数组
  }

  // 主机巡检结果（新的API响应格式）
  interface HostInspectionResult {
    execute_status: string; // 执行状态 ('running' | 'success')
    ip: string; // 主机IP
    host_name: string; // 主机名 (主机资源实例名)
    inspection_datas: MonitoringItem[]; // 巡检数据 (当前主机的巡检数据)
  }

  // 巡检任务信息（新的API响应格式）
  interface InspectionTask {
    taskId: string; // 任务ID
    systemName: string; // 系统名称
    status: InspectionStatus; // 巡检状态
    completedHosts: number; // 已完成主机数
    totalHosts: number; // 总主机数
    hosts: HostInfo[]; // 主机信息列表
  }

  // 主机信息
  interface HostInfo {
    hostId: string; // 主机ID
    hostName: string; // 主机名
    ip: string; // IP地址
    status: HostStatus; // 主机状态
    loadedItemsCount: number; // 已加载监控项数量
    totalItemsCount: number; // 总监控项数量
    monitoringItems: MonitoringItem[]; // 监控项列表
  }

  // 开始巡检请求参数
  interface StartInspectionParams {
    systemId: number;
    systemName: string;
  }

  // 开始巡检响应
  interface StartInspectionResponse {
    code: number;
    msg: string;
    data: {
      taskId: string;
      totalHosts: number;
    };
  }

  // 巡检结果响应
  interface InspectionResultResponse {
    code: number;
    msg: string;
    data: {
      taskId: string;
      status: InspectionStatus;
      completedHosts: number;
      totalHosts: number;
      hostResult?: HostInspectionResult;
    };
  }

  // 导出选项
  interface ExportOptions {
    format: 'pdf' | 'excel';
    taskId: string;
    includeOnlyAlerts?: boolean;
  }

  // 表格筛选选项
  interface TableFilterOptions {
    showOnlyAlerts: boolean;
    sortByTriggerLevel: boolean;
  }

  // 巡检弹框属性
  interface InspectionModalProps {
    open: boolean;
    onClose: () => void;
    inspectionTask: InspectionTask | null;
    onExport: (options: ExportOptions) => void;
  }

  // 主机面板属性
  interface HostPanelProps {
    hostResult: HostInspectionResult;
    filterOptions: TableFilterOptions;
    onFilterChange: (options: TableFilterOptions) => void;
  }
}
