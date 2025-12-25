import { useState } from 'react';
import { login as loginApi } from '@/services/identity';

export default () => {
  const [loading, setLoading] = useState(false);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const res = await loginApi({ username, password });
      if (res && res.success && res.data) {
        const token = res.data.access_token;
        const refresh = res.data.refresh_token;
        const user = res.data.user_info;
        if (token) localStorage.setItem('access_token', token);
        if (refresh) localStorage.setItem('refresh_token', String(refresh));
        if (user?.id) localStorage.setItem('userId', String(user.id));
        if (user?.name) localStorage.setItem('userName', String(user.name));
        if (user?.cname) localStorage.setItem('userCName', String(user.cname));
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { loading, login };
};
