import { history } from '@umijs/max';
export const getModelIdFromUrl = (): number => {
  const pathname = history.location.pathname;
  const match = pathname.match(/\/modelPage\/modelManager\/details\/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};
