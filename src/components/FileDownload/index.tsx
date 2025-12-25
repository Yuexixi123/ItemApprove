import React from 'react';
import { Button, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { request } from '@umijs/max';

interface FileDownloadProps {
  fileId: string | number;
  fileName?: string;
  showIcon?: boolean;
}

const FileDownload: React.FC<FileDownloadProps> = ({ fileId, fileName, showIcon = true }) => {
  const handleDownload = async () => {
    try {
      const response = await request(`/file/${fileId}`, {
        method: 'GET',
        responseType: 'blob',
        getResponse: true,
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // 尝试从 Content-Disposition header 获取文件名，或者使用传入的 fileName
      let downloadName = fileName || `file_${fileId}`;
      link.setAttribute('download', downloadName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      message.error('文件下载失败');
    }
  };

  return (
    <Button
      type="link"
      icon={showIcon ? <DownloadOutlined /> : undefined}
      onClick={handleDownload}
      style={{ padding: 0, height: 'auto' }}
    >
      {fileName || '下载附件'}
    </Button>
  );
};

export default FileDownload;
