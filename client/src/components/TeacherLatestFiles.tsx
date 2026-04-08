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
      case 'PPT': return <Presentation className="text-[#f97316]" size={20} />;
      case 'XLS': return <FileSpreadsheet className="text-[#10b981]" size={20} />;
    }
  };

  return (
    <div className="bg-white rounded-sm border border-[#e7dff0] flex flex-col w-full mt-6 shadow-[0_10px_28px_rgba(57,31,86,0.06)]">
      <div className="p-5 border-b border-[#e7dff0] flex items-center justify-between bg-[#fbf8fe]">
        <h3 className="text-[16px] font-bold text-[#4b3f68]">Latest Uploaded Files</h3>
        <span className="text-[12px] font-semibold text-[#7c8697]">Recent materials</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#fbf8fe] border-b border-[#e7dff0]">
              <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">File</th>
              <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course/Topic</th>
              <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Date</th>
              <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_FILES.map(item => (
              <tr key={item.id} className="border-b border-[#e7dff0] last:border-0 hover:bg-[#fbf8fe] transition-colors group">
                <td className="py-3 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-sm bg-[#f3eff7] flex items-center justify-center shrink-0">
                      {getFileIcon(item.type)}
                    </div>
                    <span className="text-[13px] font-semibold text-[#4b3f68]">{item.filename}</span>
                  </div>
                </td>
                <td className="py-3 px-6 text-[13px] font-medium text-[#475569] max-w-[200px] truncate">{item.courseTopic}</td>
                <td className="py-3 px-6 text-[13px] font-semibold text-[#64748b]">{item.date}</td>
                <td className="py-3 px-6 text-right">
                  <button className="text-[#94a3b8] hover:text-primary transition-colors p-1 rounded-sm cursor-pointer inline-flex items-center justify-center">
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
