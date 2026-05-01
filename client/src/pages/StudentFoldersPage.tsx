import { useState } from "react";
// In a real app, this would be `import { useNavigate } from "react-router-dom";`
// using an a tag for mock navigation here if router isn't fully set up, or Link.
import { Link } from "react-router-dom";

// Mock data
const MOCK_FOLDERS = [
  {
    id: "assignments",
    name: "Assignments",
    description: "Submitted and pending course assignments",
    fileCount: 12,
    lastUpdated: "2024-05-01T08:30:00Z",
    color: "#8b5cf6", // Purple
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    )
  },
  {
    id: "notes",
    name: "Course Notes",
    description: "Lecture slides and study materials",
    fileCount: 45,
    lastUpdated: "2024-04-29T14:15:00Z",
    color: "#3b82f6", // Blue
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  {
    id: "results",
    name: "Results & Transcripts",
    description: "Official grades and semester results",
    fileCount: 4,
    lastUpdated: "2024-01-15T09:00:00Z",
    color: "#10b981", // Green
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    )
  },
  {
    id: "resources",
    name: "General Resources",
    description: "University policies and student handbooks",
    fileCount: 8,
    lastUpdated: "2023-11-20T11:30:00Z",
    color: "#f59e0b", // Yellow
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
      </svg>
    )
  }
];

export default function StudentFoldersPage() {
  // TODO: Fetch folders from backend API
  const [folders] = useState(MOCK_FOLDERS);

  const totalFiles = folders.reduce((acc, folder) => acc + folder.fileCount, 0);

  return (
    <div className="flex flex-col gap-8 pb-10 flex-1 min-w-0 max-w-[1100px] mx-auto w-full animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="font-sans text-[26px] md:text-[28px] font-bold text-[#4b3f68] tracking-tight">
            Document Center
          </h1>
          <p className="text-[14px] text-[#7c8697] mt-1">Manage your files and academic resources</p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 rounded-[8px] border border-[#e2d9ed] bg-white px-4 py-2 text-[13px] font-medium text-[#4b3f68] shadow-sm">
             <span className="text-[#7c8697]">Total Files:</span>
             <span className="font-bold text-primary">{totalFiles}</span>
          </div>
        </div>
      </div>

      {/* Folders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {folders.map((folder) => (
          <Link 
            key={folder.id} 
            to={`/student/folders/${folder.id}`}
            className="group relative overflow-hidden rounded-[10px] border border-[#e7dff0] bg-white p-6 shadow-[0_2px_12px_rgba(57,31,86,0.04)] hover:shadow-[0_8px_24px_rgba(57,31,86,0.08)] hover:border-[#d3c8e0] transition-all duration-300 flex flex-col h-full"
          >
            {/* Color accent line */}
            <div 
              className="absolute top-0 left-0 right-0 h-1" 
              style={{ backgroundColor: folder.color }}
            />
            
            <div className="flex justify-between items-start mb-4 mt-1">
              <div 
                className="p-3 rounded-[10px] bg-opacity-10"
                style={{ backgroundColor: `${folder.color}15`, color: folder.color }}
              >
                {folder.icon}
              </div>
              <span className="text-[11px] font-bold text-[#778196] uppercase tracking-wider bg-[#faf8fc] px-2.5 py-1 rounded-full border border-[#f3eff7]">
                {folder.fileCount} {folder.fileCount === 1 ? 'file' : 'files'}
              </span>
            </div>

            <div className="mt-auto">
              <h3 className="font-sans text-[18px] font-bold text-[#4b3f68] tracking-tight group-hover:text-primary transition-colors">
                {folder.name}
              </h3>
              <p className="text-[13px] text-[#7c8697] mt-1 mb-4 line-clamp-2 min-h-[40px]">
                {folder.description}
              </p>
              
              <div className="flex items-center gap-2 pt-4 border-t border-[#f3eff7] text-[11px] font-semibold text-[#a0a8b5] uppercase tracking-wide">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Updated {new Date(folder.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
