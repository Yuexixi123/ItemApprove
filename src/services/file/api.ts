import { request } from '@umijs/max';

/**
 * 上传文件
 * @param file 文件对象
 * @param channel_type 业务类型，默认为 capacity
 */
export async function uploadFile(file: File | Blob, channel_type: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('channel_type', channel_type);

  return request<any>('/file', {
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': undefined as any,
    },
  });
}
