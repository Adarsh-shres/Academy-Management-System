import { MoreVertical, FileText, FileSpreadsheet, Presentation } from './icons';

interface FileItem {
  id: string;
  filename: string;
  type: 'PDF' | 'PPT' | 'XLS';
  courseTopic: string;
  date: string;
}

const MOCK_FILES: FileItem[] = [
  { id: '1', filename: 'ClassPresentation.PDF', type: 'PDF', courseTopic: 'Math 101 Unit 2: Add and subtract', date: '12 Dec 2026' },
  { id: '2', filename: 'Slideshow220Dec.PPT', type: 'PPT', courseTopic: 'Math 102 Unit 2: Motion and forces', date: '09 Dec 2026' },
  { id: '3', filename: 'SolvingSheet.XLS', type: 'XLS', courseTopic: 'Math 104 Linear equations', date: '08 Dec 2026' },
];

export default function TeacherLatestFiles() {
  const getFileIcon = (type: FileItem['type']) => {
    switch (type) {
      case 'PDF': return <FileText className="text-[#ef4444]" size={20} />;
      case 'PPT': return <Presentation className="text-[#f59e0b]" size={20} />;
      case 'XLS': return <FileSpreadsheet className="text-[#10b981]" size={20} />;
    }
  };

  return (
    <div className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] hover:shadow-[0_16px_36px_rgba(57,31,86,0.1)] transition-all duration-200 flex flex-col w-full mt-6">
      <div className="p-5 border-b border-[#e7dff0] flex items-center justify-between bg-gradient-to-r from-[#f5effa] to-white">
        <h3 className="font-sans text-[18px] font-extrabold tracking-tight text-[#4b3f68]">Latest Uploaded Files</h3>
        <span className="px-[8px] py-[3px] rounded-[6px] bg-[#faf8fc] text-[#778196] border border-[#e7dff0] text-[10px] font-bold uppercase tracking-[0.08em] shadow-sm">
          Recent materials
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#faf8fc] border-b border-[#e7dff0]">
              <th className="py-[14px] px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">File</th>
              <th className="py-[14px] px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course / Topic</th>
              <th className="py-[14px] px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Date</th>
              <th className="py-[14px] px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_FILES.map(item => (
              <tr key={item.id} className="border-b border-dashed border-[#e7dff0] last:border-0 hover:bg-[#faf8fc] transition-colors group">
                <td className="py-[16px] px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-sm bg-[#f3eff7] flex items-center justify-center shrink-0 border border-[#e7dff0]">
                      {getFileIcon(item.type)}
                    </div>
                    <span className="text-[13px] font-extrabold text-[#4b3f68]">{item.filename}</span>
                  </div>
                </td>
                <td className="py-[16px] px-6 text-[13px] font-semibold text-[#7c8697] max-w-[200px] truncate leading-tight">{item.courseTopic}</td>
                <td className="py-[16px] px-6 text-[13px] font-bold text-[#4b3f68]">{item.date}</td>
                <td className="py-[16px] px-6 text-right">
                  <button className="text-[#cbd5e1] hover:text-[#7c8697] transition-colors p-1 rounded-sm cursor-pointer inline-flex items-center justify-center">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
