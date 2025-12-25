import React, { useState, useEffect } from 'react';
import { BellOutlined } from '@ant-design/icons';
import { Badge, Popover, List, Button, Empty } from 'antd';
import { history } from '@umijs/max';
import { createStyles } from 'antd-style';
import { getWorkflowTodo } from '@/services/todo';
import dayjs from 'dayjs';

interface NoticeItem {
  id?: string;
  title?: string;
  description?: string;
  datetime?: string;
  status?: string;
  read?: boolean;
  type?: string;
  extra?: string;
  priority?: string;
}

const useStyles = createStyles(({ token }) => ({
  noticeIcon: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    height: '36px',
    '&:hover': {
      backgroundColor: token.colorBgTextHover,
    },
  },
  popoverContent: {
    width: '336px',
  },
  noticeList: {
    maxHeight: '400px',
    overflow: 'auto',
  },
  listItem: {
    cursor: 'pointer',
    padding: '12px 16px',
    transition: 'all 0.3s',
    '&:hover': {
      backgroundColor: token.colorBgTextHover,
    },
  },
  noticeTitle: {
    fontWeight: 500,
    marginBottom: '4px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noticeDesc: {
    fontSize: '12px',
    color: token.colorTextSecondary,
    marginTop: '4px',
  },
  noticeFooter: {
    textAlign: 'center',
    padding: '8px 0',
    borderTop: `1px solid ${token.colorBorderSecondary}`,
  },
}));

const NoticeIcon: React.FC = () => {
  const { styles } = useStyles();
  const [visible, setVisible] = useState(false);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [total, setTotal] = useState<number>(0);

  // 获取待办通知
  const fetchNotices = async () => {
    try {
      setLoading(true);
      const userName = localStorage.getItem('userName') || '';
      // 使用新的待办服务获取数据
      const response = await getWorkflowTodo({
        status: 'pending',
        page_size: 20, // 按照用户要求请求20条
        current: 1,
        user_name: userName,
      });

      if (response?.success) {
        const todoList = response.data?.data || response.data || [];
        const todoNotices = Array.isArray(todoList)
          ? todoList.map((item: any) => ({
              id: item.id,
              title: item.process_name, // 使用 process_name 作为标题
              description: item.task_name, // 使用 task_name 作为描述
              datetime: dayjs(item.create_date).format('YYYY-MM-DD HH:mm:ss'),
              status: item.work_state,
              type: 'todo',
            }))
          : [];
        setNotices(todoNotices);
        // 设置总数
        setTotal(response.data?.pagination?.total || response.total || 0);
      }
    } catch (error) {
      console.error('获取待办通知失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 组件挂载时获取一次数据，用于显示徽标数量
    fetchNotices();
  }, []);

  useEffect(() => {
    if (visible) {
      fetchNotices();
    }
  }, [visible]);

  // 点击待办项，跳转到待办页面
  const handleNoticeClick = () => {
    setVisible(false);
    history.push('/todo');
  };

  // 去处理
  const handleGoToTodo = () => {
    setVisible(false);
    history.push('/todo');
  };

  /*
  const getPriorityTag = (priority?: string) => {
    const config = {
      low: { color: 'green', text: '低' },
      medium: { color: 'gold', text: '中' },
      high: { color: 'red', text: '高' },
    };
    if (priority && config[priority as keyof typeof config]) {
      const { color, text } = config[priority as keyof typeof config];
      return <Tag color={color} style={{ marginRight: 0 }}>{text}</Tag>;
    }
    return null;
  };
  */

  const noticeContent = (
    <div className={styles.popoverContent}>
      <div className={styles.noticeList}>
        {loading ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="加载中..." />
        ) : notices.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无待办" />
        ) : (
          <List
            dataSource={notices}
            renderItem={(item) => (
              <List.Item className={styles.listItem} onClick={() => handleNoticeClick()}>
                <div style={{ width: '100%' }}>
                  <div className={styles.noticeTitle}>
                    <span>{item.title}</span>
                  </div>
                  {item.description && (
                    <div className={styles.noticeDesc} style={{ color: 'rgba(0,0,0,0.65)' }}>
                      {item.description}
                    </div>
                  )}
                  <div className={styles.noticeDesc}>{item.datetime}</div>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
      <div className={styles.noticeFooter}>
        <Button type="link" onClick={handleGoToTodo}>
          查看全部待办
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      content={noticeContent}
      trigger="hover"
      open={visible}
      onOpenChange={setVisible}
      placement="bottomRight"
      overlayStyle={{ paddingTop: 8 }}
    >
      <div className={styles.noticeIcon}>
        <Badge count={total} offset={[10, 0]}>
          <BellOutlined style={{ fontSize: 16 }} />
        </Badge>
      </div>
    </Popover>
  );
};

export default NoticeIcon;
