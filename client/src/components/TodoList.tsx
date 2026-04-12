import { useState } from 'react';
import { useTodos } from '../context/TodoContext';

export default function TodoList() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();
  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState('');

  const handleAdd = () => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    addTodo(trimmed);
    setNewText('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') { setIsAdding(false); setNewText(''); }
  };

  return (
    <aside className="w-full rounded-[10px] border border-[#e6dfef] bg-white shadow-[0_2px_12px_rgba(57,31,86,0.06)] overflow-hidden flex flex-col sticky top-[82px]">
      <div className="p-5 tracking-tight border-b border-[#eee8f4] flex items-center justify-between bg-[#fbf8fe] rounded-t-[10px]">
        <h2 className="font-sans text-[15px] font-semibold text-[#4b3f68]">My Tasks</h2>
        <span className="bg-[#f3eff7] text-primary text-[10px] font-semibold px-2 py-0.5 rounded-[6px] uppercase tracking-[0.06em]">
          {todos.filter(t => !t.done).length} left
        </span>
      </div>
      <div className="p-5 flex-1 bg-white">
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
                className={`text-[13px] leading-snug cursor-pointer select-none transition-colors flex-1 ${
                  todo.done ? 'line-through text-[#94a3b8]' : 'text-[#1e293b] font-medium group-hover:text-primary'
                }`} 
                onClick={() => toggleTodo(todo.id)}
              >
                {todo.text}
              </span>
              <button
                onClick={() => {
                  if (window.confirm('Delete this task?')) {
                    deleteTodo(todo.id);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 shrink-0 text-[#ef4444] hover:text-[#dc2626] text-[15px] font-bold px-1 transition-opacity cursor-pointer leading-none"
                title="Delete Task"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>

        {/* Add New Task */}
        {isAdding ? (
          <div className="mt-4 flex items-center gap-2">
            <input
              type="text"
              value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              placeholder="Enter task..."
              className="flex-1 bg-[#f8fafc] border border-[#e2d9ed] rounded-[6px] px-3 py-1.5 text-[13px] outline-none focus:border-[#6a5182] focus:ring-1 focus:ring-[#6a5182]/20 transition-all text-[#1e293b]"
            />
            <button
              onClick={handleAdd}
              className="shrink-0 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[11px] font-semibold px-3 py-1.5 rounded-[6px] transition-all"
            >
              Add
            </button>
            <button
              onClick={() => { setIsAdding(false); setNewText(''); }}
              className="shrink-0 text-[#64748b] hover:text-[#1e293b] text-[11px] font-semibold px-2 py-1.5 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="mt-5 text-[#6a5182] font-semibold text-[12px] flex items-center gap-1.5 hover:opacity-75 transition-opacity px-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add New Task
          </button>
        )}
      </div>
    </aside>
  );
}
