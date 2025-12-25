// @ts-ignore
/* eslint-disable */

declare namespace Identity {
  interface LoginParams {
    username: string;
    password: string;
  }

  interface LoginData {
    access_token: string;
    refresh_token?: string;
    user_info?: {
      cname?: string;
      id?: number;
      name?: string;
    };
  }

  interface LoginResponse {
    data: LoginData;
    inside_code: number;
    msg: string;
    success: boolean;
  }

  interface SignoutResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: Record<string, any>;
  }
}
