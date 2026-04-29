

const ACTIVITIES = [
  {
    id: "001",
    name: "Anjali Rao",
    initials: "AR",
    role: "Student",
    dept: "B.Tech Computer Science",
    date: "Sep 04, 2024",
    status: "Active",
    color: "default"
  },
  {
    id: "002",
    name: "Dr. Ramesh Kumar",
    initials: "RK",
    role: "Teacher",
    dept: "Dept. of Physics",
    date: "Sep 04, 2024",
    status: "Active",
    color: "teal"
  },
  {
    id: "003",
    name: "Priya Menon",
    initials: "PM",
    role: "Student",
    dept: "MBA Finance",
    date: "Sep 05, 2024",
    status: "Pending",
    color: "amber"
  },
  {
    id: "004",
    name: "Suresh Pillai",
    initials: "SP",
    role: "Teacher",
    dept: "Dept. of Mathematics",
    date: "Sep 06, 2024",
    status: "Active",
    color: "teal"
  },
  {
    id: "005",
    name: "Kavitha Nair",
    initials: "KN",
    role: "Student",
    dept: "B.Sc. Data Science",
    date: "Sep 07, 2024",
    status: "Inactive",
    color: "red"
  }
];

export default function RecentActivity() {
  return (
    <div className="mt-1">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="font-sans text-[15px] font-extrabold text-[#4b3f68]">Recent Activity</h2>
        <button className="btn btn-outline btn--sm bg-white hover:bg-[#f8f6fb] px-3 py-1.5 text-xs rounded-sm border-[1.5px] border-[#e2e8f0] font-semibold cursor-pointer transition-all">
          View All
        </button>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th className="bg-[#f8fafc] p-[10px_16px] text-left text-[10.5px] font-bold text-[#7d8797] tracking-[0.08em] uppercase whitespace-nowrap">#</th>
                <th className="bg-[#f8fafc] p-[10px_16px] text-left text-[10.5px] font-bold text-[#7d8797] tracking-[0.08em] uppercase whitespace-nowrap">Name</th>
                <th className="bg-[#f8fafc] p-[10px_16px] text-left text-[10.5px] font-bold text-[#7d8797] tracking-[0.08em] uppercase whitespace-nowrap">Role</th>
                <th className="bg-[#f8fafc] p-[10px_16px] text-left text-[10.5px] font-bold text-[#7d8797] tracking-[0.08em] uppercase whitespace-nowrap">Course / Department</th>
                <th className="bg-[#f8fafc] p-[10px_16px] text-left text-[10.5px] font-bold text-[#7d8797] tracking-[0.08em] uppercase whitespace-nowrap">Date</th>
                <th className="bg-[#f8fafc] p-[10px_16px] text-left text-[10.5px] font-bold text-[#7d8797] tracking-[0.08em] uppercase whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {ACTIVITIES.map((act) => (
                <tr key={act.id} className="border-b border-[#ece5f3] last:border-b-0 transition-colors hover:bg-[#fbf8fe]">
                  <td className="p-[12px_16px] text-[#64748b] text-[12px] font-semibold align-middle">{act.id}</td>
                  <td className="p-[12px_16px] text-text-custom align-middle">
                    <div className="flex items-center gap-[9px] font-medium">
                      <div className={`w-[28px] h-[28px] rounded-sm text-white text-[10px] font-bold flex items-center justify-center shrink-0
                        ${act.color === 'default' ? 'bg-gradient-to-br from-[#164e6a] to-[#4b3f68]' : ''}
                        ${act.color === 'teal' ? 'bg-gradient-to-br from-[#0ea5b0] to-primary' : ''}
                        ${act.color === 'amber' ? 'bg-gradient-to-br from-[#fbbf24] to-[#d97706]' : ''}
                        ${act.color === 'red' ? 'bg-gradient-to-br from-[#f87171] to-[#ef4444]' : ''}
                      `}>
                        {act.initials}
                      </div>
                      {act.name}
                    </div>
                  </td>
                  <td className="p-[12px_16px] text-text-custom align-middle">{act.role}</td>
                  <td className="p-[12px_16px] text-text-custom align-middle">{act.dept}</td>
                  <td className="p-[12px_16px] text-text-custom align-middle whitespace-nowrap">{act.date}</td>
                  <td className="p-[12px_16px] text-text-custom align-middle">
                    <span className={`inline-block p-[3px_10px] rounded-sm text-[11px] font-bold tracking-[0.02em]
                      ${act.status === 'Active' ? 'bg-[#d1fae5] text-[#065f46]' : ''}
                      ${act.status === 'Pending' ? 'bg-[#fef3c7] text-[#92400e]' : ''}
                      ${act.status === 'Inactive' ? 'bg-[#f1f5f9] text-[#475569]' : ''}
                    `}>
                      {act.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
