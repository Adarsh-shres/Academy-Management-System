import { useState } from 'react';

export default function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Review curriculum updates', done: false },
    { id: 2, text: 'Approve new faculty accounts', done: true },
    { id: 3, text: 'Schedule orientation session', done: false },
  ]);

  const toggleTodo = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <aside className="w-[300px] border-l border-[#e2e8f0] bg-white hidden xl:flex flex-col shrink-0 min-h-[calc(100vh-58px)] shadow-sm">
      <div className="p-5 tracking-tight border-b border-[#e2e8f0] flex items-center justify-between">
        <h2 className="font-sans text-[15px] font-bold text-[#0d3349]">My Tasks</h2>
        <span className="bg-[#e6f7f9] text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
          {todos.filter(t => !t.done).length} left
        </span>
      </div>
      <div className="p-5 flex-1 bg-[#f8fcfd]">
        <ul className="space-y-3">
          {todos.map(todo => (
            <li key={todo.id} className="flex items-start gap-3 group">
              <input 
                type="checkbox" 
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
                className="mt-0.5 w-4 h-4 shrink-0 cursor-pointer accent-primary"
              />
              <span 
                className={`text-[13px] leading-snug cursor-pointer select-none transition-colors ${
                  todo.done ? 'line-through text-[#94a3b8]' : 'text-[#1e293b] font-medium group-hover:text-primary'
                }`} 
                onClick={() => toggleTodo(todo.id)}
              >
                {todo.text}
              </span>
            </li>
          ))}
        </ul>
        <button className="mt-5 text-[#006496] font-bold text-[12px] flex items-center gap-1.5 hover:opacity-75 transition-opacity px-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add New Task
        </button>
      </div>
    </aside>
  );
}
