import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Todo } from '../types/todo';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

/* ─── Context shape ─────────────────────────────────────────── */

interface TodoContextValue {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  addTodo: (text: string) => Promise<void>;
  updateTodo: (id: string, data: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
}

const TodoContext = createContext<TodoContextValue | null>(null);

/* ─── Provider ──────────────────────────────────────────────── */

export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (fetchError) throw fetchError;

        if (data) {
          setTodos(data.map(t => ({
            id: t.id,
            text: t.text,
            done: t.done
          })));
        }
      } catch (err: any) {
        console.error('Error fetching tasks:', err);
        setError(err.message || 'Failed to fetch tasks');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTasks();
  }, [user]);

  const addTodo = useCallback(async (text: string) => {
    if (!user) return;
    try {
      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert({ text, done: false, user_id: user.id })
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        setTodos(prev => [...prev, { id: data.id, text: data.text, done: data.done }]);
      }
    } catch (err: any) {
      console.error('Error adding task:', err);
    }
  }, [user]);

  const updateTodo = useCallback(async (id: string, data: Partial<Todo>) => {
    if (!user) return;
    try {
      setTodos(prev => prev.map(t => (t.id === id ? { ...t, ...data } : t)));
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ ...data })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating task:', updateError);
        // We could revert optimistic update here, but omitting for simplicity
      }
    } catch (err: any) {
      console.error('Error updating task:', err);
    }
  }, [user]);

  const deleteTodo = useCallback(async (id: string) => {
    if (!user) return;
    try {
      setTodos(prev => prev.filter(t => t.id !== id));
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error deleting task:', deleteError);
      }
    } catch (err: any) {
      console.error('Error deleting task:', err);
    }
  }, [user]);

  const toggleTodo = useCallback(async (id: string) => {
    if (!user) return;
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    await updateTodo(id, { done: !todo.done });
  }, [todos, updateTodo, user]);

  return (
    <TodoContext.Provider value={{ todos, isLoading, error, addTodo, updateTodo, deleteTodo, toggleTodo }}>
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
