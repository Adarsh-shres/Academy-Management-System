import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Todo } from '../types/todo';
import { MOCK_TODOS } from '../data/mockTodos';

/* ─── Context shape ─────────────────────────────────────────── */

interface TodoContextValue {
  todos: Todo[];
  addTodo: (text: string) => Todo;
  updateTodo: (id: number, data: Partial<Todo>) => void;
  deleteTodo: (id: number) => void;
  toggleTodo: (id: number) => void;
}

const TodoContext = createContext<TodoContextValue | null>(null);

/* ─── Provider ──────────────────────────────────────────────── */

let nextId = MOCK_TODOS.length + 1;

export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>(MOCK_TODOS);

  const addTodo = useCallback((text: string): Todo => {
    const newTodo: Todo = { id: nextId++, text, done: false };
    setTodos(prev => [...prev, newTodo]);
    return newTodo;
  }, []);

  const updateTodo = useCallback((id: number, data: Partial<Todo>) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, ...data } : t)),
    );
  }, []);

  const deleteTodo = useCallback((id: number) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleTodo = useCallback((id: number) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }, []);

  return (
    <TodoContext.Provider value={{ todos, addTodo, updateTodo, deleteTodo, toggleTodo }}>
      {children}
    </TodoContext.Provider>
  );
}

/* ─── Hook ──────────────────────────────────────────────────── */

export function useTodos() {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error('useTodos must be used within <TodoProvider>');
  return ctx;
}
