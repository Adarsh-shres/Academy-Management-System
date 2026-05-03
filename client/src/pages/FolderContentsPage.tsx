import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

// Mock data interfaces
interface FileItem {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'img' | 'other';
  size: string;
  uploadDate: string;
}

// Simulated backend database
const MOCK_FILES_DB: Record<string, { folderName: string, files: FileItem[] }> = {
  "assignments": {
    folderName: "Assignments",
    files: [
      { id: "f1", name: "Physics_Lab_Report_3.pdf", type: "pdf", size: "2.4 MB", uploadDate: "2024-05-01T08:30:00Z" },
      { id: "f2", name: "Math_Homework_Ch4.doc", type: "doc", size: "1.1 MB", uploadDate: "2024-04-28T10:15:00Z" },
    ]
  },
  "notes": {
    folderName: "Course Notes",
    files: [
      { id: "f3", name: "Calculus_Limits_Slides.pdf", type: "pdf", size: "4.5 MB", uploadDate: "2024-04-29T14:15:00Z" },
      { id: "f4", name: "Chemistry_Formulas.img", type: "img", size: "3.2 MB", uploadDate: "2024-04-25T09:00:00Z" },
      { id: "f5", name: "History_Lecture_Audio_Transcript.doc", type: "doc", size: "0.8 MB", uploadDate: "2024-04-20T11:20:00Z" },
    ]
  }
};

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return (
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    case 'doc':
      return (
        <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'img':
      return (
        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    default:
      return (
        <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
  }
};

export default function FolderContentsPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const [folderData, setFolderData] = useState<{ folderName: string, files: FileItem[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Connect to your backend API to fetch folder contents by ID
    // fetch(`/api/folders/${folderId}/files`).then(...)

    // Simulating API call
    setTimeout(() => {
      if (folderId && MOCK_FILES_DB[folderId]) {
        setFolderData(MOCK_FILES_DB[folderId]);
      } else {
        // Fallback for demo if folder not in mock db
        setFolderData({ folderName: "Empty Folder", files: [] });
      }
      setIsLoading(false);
    }, 500);
  }, [folderId]);

  if (isLoading) {
    return <div className="flex h-[300px] items-center justify-center text-[#7c8697] text-[13px] font-semibold animate-pulse uppercase tracking-wider">Loading Files...</div>;
  }

  const handleDownload = (_fileId: string, fileName: string) => {
    // TODO: Connect to your backend API for file download
    // window.open(`/api/files/download/${fileId}`, '_blank');
    alert(`Initiating download for ${fileName}`);
  };

  return (
    <div className="flex flex-col gap-8 pb-10 flex-1 min-w-0 max-w-[1100px] mx-auto w-full animate-in fade-in duration-200">
      {/* Header & Navigation */}
      <div className="flex flex-col gap-4">
        <Link
          to="/student/folders"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#7c8697] hover:text-[#4b3f68] transition-colors w-fit"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Folders
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="font-sans text-[26px] md:text-[28px] font-bold text-[#4b3f68] tracking-tight flex items-center gap-3">
              <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              {folderData?.folderName}
            </h1>
            <p className="text-[14px] text-[#7c8697] mt-1 ml-10">
              {folderData?.files.length || 0} files found
            </p>
          </div>
        </div>
      </div>

      {/* Files List */}
      <div className="bg-white rounded-[10px] border border-[#e7dff0] shadow-[0_2px_12px_rgba(57,31,86,0.04)] overflow-hidden">
        {folderData?.files.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <svg className="w-16 h-16 text-[#e2d9ed] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-[16px] font-bold text-[#4b3f68] mb-1">This folder is empty</h3>
            <p className="text-[#7c8697] font-medium text-[13px]">No files have been uploaded here yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#faf8fc] border-b border-[#f3eff7]">
                  <th className="px-6 py-4 text-[11px] font-bold text-[#778196] uppercase tracking-wider">File Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#778196] uppercase tracking-wider">Size</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#778196] uppercase tracking-wider hidden md:table-cell">Date Uploaded</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#778196] uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3eff7]">
                {folderData?.files.map((file) => (
                  <tr key={file.id} className="hover:bg-[#fcfbfc] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-[8px] border border-[#e7dff0] shadow-sm">
                          {getFileIcon(file.type)}
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-[#4b3f68] group-hover:text-primary transition-colors">{file.name}</p>
                          <p className="text-[12px] text-[#7c8697] uppercase tracking-wider font-medium mt-0.5 md:hidden">
                            {new Date(file.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-[#7c8697] whitespace-nowrap">
                      {file.size}
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-[#7c8697] whitespace-nowrap hidden md:table-cell">
                      {new Date(file.uploadDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDownload(file.id, file.name)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-[6px] bg-white border border-[#e7dff0] text-[#7c8697] hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                        title="Download"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
