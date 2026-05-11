export default function StudentFoldersPage() {
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
             <span className="font-bold text-primary">0</span>
          </div>
        </div>
      </div>

      <div className="rounded-[10px] border border-dashed border-[#d8c8e9] bg-white p-12 text-center shadow-[0_2px_12px_rgba(57,31,86,0.04)]">
        <h3 className="text-[16px] font-bold text-[#4b3f68]">No folders yet</h3>
        <p className="mt-1 text-[13px] font-medium text-[#7c8697]">Uploaded academic resources will appear here once they are connected to your account.</p>
      </div>
    </div>
  );
}
