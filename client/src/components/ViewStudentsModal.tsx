import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface ViewStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: any;
}

export default function ViewStudentsModal({ isOpen, onClose, course }: ViewStudentsModalProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !course) return;

    async function fetchStudents() {
      setIsLoading(true);
      try {
        // Fetch ALL users WHERE role = 'student'
        // TODO: filter by actual enrollment for this course when an enrollments table exists
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('role', 'student');

        if (error) throw error;
        setStudents(data || []);
      } catch (err: any) {
        console.error('Failed to fetch students:', err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStudents();
  }, [isOpen, course]);

  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-[#0d3349]/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-md w-full max-w-[600px] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-[#e7dff0] flex justify-between items-center bg-[#fbf8fe] rounded-t-md">
          <div>
            <h3 className="text-[18px] font-bold text-[#4b3f68]">Enrolled Students</h3>
            <p className="text-[13px] text-[#64748b] font-medium mt-0.5">{course.name} ({course.course_code})</p>
          </div>
          <button onClick={onClose} className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer bg-white rounded-full p-1.5 shadow-sm border border-[#e2d9ed]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="p-5 overflow-y-auto w-full hide-scrollbar flex-1 bg-main-bg">
          <div className="mb-4 text-[13px] font-semibold text-[#64748b]">
            Total Students: <span className="text-[#1e293b]">{students.length}</span>
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-[#e2e8f0]/40 rounded-sm w-full"></div>)}
            </div>
          ) : (
            <div className="bg-white rounded-sm border border-[#e7dff0] overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fbf8fe] border-b border-[#e7dff0]">
                    <th className="py-3 px-5 text-[11px] font-bold text-[#64748b] uppercase tracking-wider w-[60px]">S.No</th>
                    <th className="py-3 px-5 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Student Name</th>
                    <th className="py-3 px-5 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7dff0]">
                  {students.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-[#fbf8fe]/50 transition-colors">
                      <td className="py-3 px-5 text-[12.5px] font-semibold text-[#64748b]">{idx + 1}</td>
                      <td className="py-3 px-5 text-[13.5px] font-bold text-[#4b3f68]">{student.name}</td>
                      <td className="py-3 px-5 text-[13px] text-[#64748b]">{student.email}</td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-[#64748b] text-[13px]">
                        No students enrolled in this course.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
