// @ts-ignore
/* eslint-disable */

declare namespace Inspection {
  // 获取系统列表请求参数
  interface SystemListParams {
    current: number; // 当前页
    page_size: number; // 每页条数
    system_id?: number; // 资源实例名字段，可选
    no_page_size?: boolean; // 是否不返回分页信息，可选
  }

  // 系统信息项
  interface SystemItem {
    system_id: number; // 系统资源ID
    system_name: string; // 系统资源实例名
  }

  // 获取系统列表响应类型
  interface SystemListResponse {
    code: number; // 外部状态码
    inside_code: number; // 内部状态码
    msg: string; // 消息体
    data: {
      pagination: {
        total: number; // 总条数
        current: number; // 当前页
        page_size: number; // 每页条数
      };
      data: SystemItem[]; // 系统列表数据
    };
  }

  // 插入系统主机缓存请求参数
  interface SystemHostCacheParams {
    system_id?: number; // 资源实例名字段，可选
  }

  // 插入系统主机缓存响应数据
  interface SystemHostCacheData {
    host_total: number; // 主机总条数
  }

  // 插入系统主机缓存响应类型
  interface SystemHostCacheResponse {
    code: number; // 外部状态码
    inside_code: number; // 内部状态码
    msg: string; // 消息体
    data: SystemHostCacheData; // 主机缓存数据
  }

  // 一键巡检请求参数
  interface InspectionParams {
    system_id?: number; // 资源实例名字段，可选
  }

  // 巡检数据项
  interface InspectionDataItem {
    [key: string]: any; // 巡检数据的具体字段根据实际返回定义
  }

  // 巡检响应数据
  interface InspectionData {
    execute_status: string; // 执行状态：running | success
    ip: string; // 主机IP
    host_name: string; // 主机名
    inspection_datas: InspectionDataItem[]; // 巡检数据
  }

  // 一键巡检响应类型
  interface InspectionResponse {
    code: number; // 外部状态码
    inside_code: number; // 内部状态码
    msg: string; // 消息体
    data: InspectionData; // 巡检数据
  }

  // 监控项历史数据项
  interface HistoryDataItem {
    value: string; // 监控项值
    datetime: string; // 时间，YYYY-mm-dd HH:MM:SS
  }

  // 获取监控项历史数据响应类型
  interface HistoryDataResponse {
    code: number; // 外部状态码
    inside_code: number; // 内部状态码
    msg: string; // 消息体
    data: HistoryDataItem[]; // 历史数据数组
  }
}
