import { request } from '@umijs/max';

export async function getTodoList(params: Todo.Params) {
  return request('/api/todo/list', {
    method: 'GET',
    params,
  });
}

export async function addTodo(data: Partial<Todo.Item>) {
  return request('/api/todo', {
    method: 'POST',
    data,
  });
}

export async function updateTodo(id: string, data: Partial<Todo.Item>) {
  return request(`/api/todo/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteTodo(id: string) {
  return request(`/api/todo/${id}`, {
    method: 'DELETE',
  });
}

export async function getWorkflowTodo(params: {
  user_name: string;
  current?: number;
  page_size?: number;
  [key: string]: any;
}) {
  return request('/workflow/todo', {
    method: 'GET',
    params,
  });
}
