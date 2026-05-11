export default function TeacherLatestFiles() {
  return (
    <div className="bg-white rounded-sm border border-[#e7dff0] flex flex-col w-full mt-6 shadow-[0_10px_28px_rgba(57,31,86,0.06)]">
      <div className="p-5 border-b border-[#e7dff0] flex items-center justify-between bg-[#fbf8fe]">
        <h3 className="text-[16px] font-bold text-[#4b3f68]">Latest Uploaded Files</h3>
        <span className="text-[12px] font-semibold text-[#7c8697]">Recent materials</span>
      </div>

      <div className="p-8 text-center text-[13px] font-semibold text-[#7c8697]">
        No uploaded files yet.
      </div>
    </div>
  );
}
