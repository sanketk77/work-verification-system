export interface Todo {
  id: number;
  content: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoContract {
  getTodo(): Promise<
    Array<{
      id: { toNumber: () => number };
      content: string;
      completed: boolean;
      createdAt: { toNumber: () => number };
      updatedAt: { toNumber: () => number };
    }>
  >;
  createTodo(content: string): Promise<{ wait: () => Promise<any> }>;
  editTodo(id: number, content: string): Promise<{ wait: () => Promise<any> }>;
  completeTodo(id: number): Promise<{ wait: () => Promise<any> }>;
  deleteTodo(id: number): Promise<{ wait: () => Promise<any> }>;
}
