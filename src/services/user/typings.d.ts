// ... 现有代码 ...

declare namespace API {
  // 用户相关接口类型定义
  interface UserNameItem {
    label: string;
    value: number;
  }

  interface UserNamesResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: UserNameItem[];
  }
}
