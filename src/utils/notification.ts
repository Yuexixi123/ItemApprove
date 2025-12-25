// 全局notification实例
let notificationInstance: any = null;

// 设置notification实例
export const setNotificationInstance = (instance: any) => {
  notificationInstance = instance;
};

// 获取notification实例
export const getNotificationInstance = () => {
  return notificationInstance;
};

// 封装的notification方法
export const showNotification = {
  error: (config: { message: string; description: string }) => {
    if (notificationInstance) {
      notificationInstance.error(config);
    } else {
      // 降级处理：如果没有实例，使用静态方法（会有警告但不会报错）
      console.warn('Notification instance not available, using static method');
      const { notification } = require('antd');
      notification.error(config);
    }
  },
  success: (config: { message: string; description: string }) => {
    if (notificationInstance) {
      notificationInstance.success(config);
    } else {
      console.warn('Notification instance not available, using static method');
      const { notification } = require('antd');
      notification.success(config);
    }
  },
  warning: (config: { message: string; description: string }) => {
    if (notificationInstance) {
      notificationInstance.warning(config);
    } else {
      console.warn('Notification instance not available, using static method');
      const { notification } = require('antd');
      notification.warning(config);
    }
  },
  info: (config: { message: string; description: string }) => {
    if (notificationInstance) {
      notificationInstance.info(config);
    } else {
      console.warn('Notification instance not available, using static method');
      const { notification } = require('antd');
      notification.info(config);
    }
  },
};
