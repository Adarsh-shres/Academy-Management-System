interface CurriculumCardProps {
  title: string;
  tag: string;
  tagColor?: string;
}

export default function CurriculumCard({ title, tag, tagColor = 'bg-[#e6f7f9] text-[#006496]' }: CurriculumCardProps) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-[#e2e8f0] p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-10 h-10 bg-[#e6f7f9] rounded-lg flex items-center justify-center shrink-0">
        <span className="text-[#006496] text-lg">🖥</span>
      </div>
      <div className="flex-1 min-w-0">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${tagColor}`}>{tag}</span>
        <p className="text-sm font-semibold text-[#0d3349] mt-0.5 truncate">{title}</p>
      </div>
    </div>
  );
}
