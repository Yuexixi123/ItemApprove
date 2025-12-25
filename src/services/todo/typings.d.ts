declare namespace Todo {
  type Priority = 'low' | 'medium' | 'high';
  type Status = 'pending' | 'in_progress' | 'done';

  interface Item {
    id: string;
    title: string;
    description?: string;
    status: Status;
    priority: Priority;
    deadline?: string;
    createdAt: number;
    updatedAt: number;
  }

  interface Params {
    current?: number;
    pageSize?: number;
    status?: Status;
    keyword?: string;
  }
}
