export default function Features() {
  return (
    <section className="flex flex-col gap-12 mt-12" id="features">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 bg-white p-8 rounded-sm shadow-[0_10px_28px_rgba(57,31,86,0.06)] border border-[#e7dff0]">
                <h3 className="text-[12px] font-bold text-primary uppercase tracking-[0.08em] mb-4 pb-3 border-b border-[#e2d9ed]">Personalized Student Dashboard</h3>
                <p className="text-[14px] text-[#64748b] leading-relaxed">
                    A Personalized Student Dashboard is like a smart control panel for each student showing
                    everything they need in one place, tailored specifically to their learning journey.
                </p>
            </div>

            <div className="flex-1">
                <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-primary mb-2">Student Dashboard</div>
                <h2 className="text-[32px] font-extrabold text-[#4b3f68] mb-4 tracking-tight">Student Dashboard</h2>
                <p className="text-[15px] text-[#7c8697] leading-relaxed">
                    Personalized Student Dashboard is a dynamic interface that adapts to each student’s performance,
                    goals, and activity. Instead of showing the same data to everyone, it provides custom insights,
                    recommendations, and progress tracking based on individual behavior.
                </p>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1">
                <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-primary mb-2">To-Do List</div>
                <h2 className="text-[32px] font-extrabold text-[#4b3f68] mb-4 tracking-tight">To-Do List</h2>
                <p className="text-[15px] text-[#7c8697] leading-relaxed">
                    Track tasks set for the day.
                </p>
            </div>

            <div className="flex-1 bg-white p-8 rounded-sm shadow-[0_10px_28px_rgba(57,31,86,0.06)] border border-[#e7dff0]">
                <h3 className="text-[12px] font-bold text-primary uppercase tracking-[0.08em] mb-4 pb-3 border-b border-[#e2d9ed]">Organized Task List</h3>
                <p className="text-[14px] text-[#64748b] mb-3 flex items-center gap-2"><span className="text-primary text-lg">▸</span> List The Days Tasks</p>
                <p className="text-[14px] text-[#64748b] flex items-center gap-2"><span className="text-primary text-lg">▸</span> Manual Tracking</p>
            </div>
        </div>
    </section>
  );
}
