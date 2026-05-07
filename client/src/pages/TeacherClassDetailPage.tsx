import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Bell, Mail, ChevronLeft, Users, Send, ClipboardList } from '../components/shared/icons';
import ProfileDropdown from '../components/shared/ProfileDropdown';
import TeacherSidebar from '../components/teachers/TeacherSidebar';
import TeacherGradeModal from '../components/teachers/TeacherGradeModal';
import TeacherContentTab from '../components/teachers/TeacherContentTab';
import TeacherAttendanceTab from '../components/teachers/TeacherAttendanceTab';

export default function TeacherClassDetailPage() {
  useAuth();
  const { classId } = useParams();
  const navigate = useNavigate();

  const [activeSubTab, setActiveSubTab] = useState<'content' | 'students' | 'notifications' | 'grades' | 'attendance'>('content');
  const [course, setCourse] = useState<any>(null);
  const [teacherName, setTeacherName] = useState<string>('');
  const [className, setClassName] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  useEffect(() => {
    async function loadClassAndCourse() {
      if (!classId) return;
      try {
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('*, courses(*)')
          .eq('id', classId)
          .single();

        if (classError || !classData) {
          navigate('/teacher/dashboard', { state: { targetTab: 'Classes' } });
          return;
        }

        setClassName(classData.name || '');
        setCourse({
          ...classData.courses,
          room: classData.courses?.department || 'Virtual',
          course_code: classData.courses?.course_code || 'N/A'
        });
        if (classData.teacher_id) {
          const { data: teacherData } = await supabase
            .from('users')
            .select('name')
            .eq('id', classData.teacher_id)
            .single();

          setTeacherName(teacherData?.name || '');
        }
      } catch {
        navigate('/teacher/dashboard', { state: { targetTab: 'Classes' } });
      }
    }
    loadClassAndCourse();
  }, [classId, navigate]);

  useEffect(() => {
    if (!classId) return;

    async function fetchStudents() {
      setIsLoadingStudents(true);
      try {
        const { data: classData, error } = await supabase
          .from('classes')
          .select('student_ids')
          .eq('id', classId)
          .single();

        if (error || !classData?.student_ids?.length) {
          setStudents([]);
          return;
        }

        const { data: studentsData, error: studentsError } = await supabase
          .from('users')
          .select('id, name, email')
          .in('id', classData.student_ids);

        if (studentsError) {
          setStudents([]);
          return;
        }

        setStudents(studentsData || []);
      } catch {
        setStudents([]);
      } finally {
        setIsLoadingStudents(false);
      }
    }

    fetchStudents();
  }, [classId]);

  const loadSubmissions = async () => {
    setIsLoadingGrades(true);
    try {
      const { data: assignments, error: aError } = await supabase
        .from('assignments')
        .select('id, title')
        .eq('class_id', classId);

      if (aError || !assignments?.length) {
        setSubmissions([]);
        return;
      }

      const assignmentIds = assignments.map((a: any) => a.id);

      const { data, error } = await supabase
        .from('submissions')
        .select('*, users(name)')
        .in('assignment_id', assignmentIds);

      if (error) {
        setSubmissions([]);
        return;
      }

      const enriched = (data || []).map((sub: any) => ({
        ...sub,
        assignments: assignments.find((a: any) => a.id === sub.assignment_id)
      }));

      setSubmissions(enriched);
    } catch (err: any) {
      console.error('Failed to fetch submissions', err);
    } finally {
      setIsLoadingGrades(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'grades' && classId) {
      loadSubmissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab, classId]);

  const handleTabChange = (tabId: string) => {
    navigate('/teacher/dashboard', { state: { targetTab: tabId } });
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      alert('Please fill in all fields.');
      return;
    }

    setIsSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const { error } = await supabase.from('notifications').insert({
        class_id: classId,
        teacher_id: user.id,
        message: `${title.toUpperCase()}\n\n${message}`,
        type: 'manual',
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      alert('Notification broadcasted to all enrolled students!');
      setTitle('');
      setMessage('');
    } catch (err: any) {
      alert('Failed to send notification: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  if (!course) return null;

  return (
    <div className="flex h-screen bg-main-bg font-sans overflow-hidden">
      <TeacherSidebar activeTab="Classes" onTabChange={handleTabChange} />

      <main className="flex-1 ml-[210px] flex flex-col min-w-0 bg-[#f9f8fa] overflow-y-auto hide-scrollbar">

        <header className="h-[68px] bg-white/80 backdrop-blur-md border-b border-[#e7dff0] px-6 md:px-8 flex items-center shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleTabChange('Classes')}
              className="text-[#64748b] hover:text-[#4b3f68] transition-colors p-1.5 rounded-sm hover:bg-[#fbf8fe]"
              title="Back to My Classes"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-[17px] font-extrabold text-[#4b3f68] tracking-tight">
              Class Details
            </h1>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <button className="relative text-[#64748b] hover:text-[#6a5182] transition-colors cursor-pointer">
              <Mail size={18} />
            </button>
            <button className="relative text-[#64748b] hover:text-[#6a5182] transition-colors cursor-pointer">
              <Bell size={18} />
            </button>
            <div className="w-[1px] h-6 bg-[#e7dff0] mx-1"></div>
            <ProfileDropdown />
          </div>
        </header>

        <div className="flex-1 p-6 md:p-8 flex flex-col min-w-0 max-w-[1200px] mx-auto w-full">

          <div className="bg-white rounded-md border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-[#6a5182] to-[#8b6ca8] h-3"></div>
            <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
              <div>
                <span className="bg-[#f3eff7] text-[#6a5182] rounded-sm px-2.5 py-1 text-[11.5px] font-bold tracking-wide border border-[#d8c8e9] inline-block mb-3">
                  {course.course_code}
                </span>
                <h2 className="text-[28px] font-extrabold text-[#4b3f68] mb-1 leading-tight tracking-tight">{course.name} - {className}</h2>
                <div className="flex flex-wrap items-center gap-4 text-[#64748b] text-[13.5px] font-medium mt-3">
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#cbd5e1]"></div> Teacher: <strong className="text-[#4b3f68]">{teacherName || 'Assigned Teacher'}</strong></div>
                </div>
              </div>
              <div className="bg-[#fbf8fe] border border-[#e7dff0] p-4 rounded-sm flex items-center justify-between gap-6 md:w-auto w-full">
                <div>
                  <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1">Enrolled Students</p>
                  <p className="text-[22px] font-extrabold text-[#6a5182] leading-none">{students.length}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#f3eff7] flex items-center justify-center text-[#6a5182]">
                  <Users size={18} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-6 border-b border-[#e7dff0] mb-6 px-2 overflow-x-auto">
            {(['content', 'students', 'grades', 'notifications', 'attendance'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`pb-3 text-[14px] font-bold tracking-wide transition-all whitespace-nowrap ${activeSubTab === tab
                  ? 'border-b-2 border-[#6a5182] text-[#6a5182]'
                  : 'text-[#64748b] hover:text-[#4b3f68]'
                  }`}
              >
                {tab === 'content' && 'Course Content'}
                {tab === 'students' && 'Enrolled Students'}
                {tab === 'grades' && 'Assignments & Grades'}
                {tab === 'notifications' && 'Broadcast Notification'}
                {tab === 'attendance' && 'Attendance'}
              </button>
            ))}
          </div>

          {activeSubTab === 'content' && (
            <TeacherContentTab courseId={course.id} classId={classId} />
          )}

          {activeSubTab === 'students' && (
            <div className="bg-white rounded-md border border-[#e7dff0] overflow-hidden shadow-[0_10px_28px_rgba(57,31,86,0.06)] animate-fade-in">
              {isLoadingStudents ? (
                <div className="p-6 flex justify-center py-20 text-[#94a3b8]">
                  <p className="text-[14px] font-medium animate-pulse">Loading enrollments...</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#fbf8fe] border-b border-[#e7dff0]">
                      <th className="py-4 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider w-[80px]">S.No</th>
                      <th className="py-4 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Student Name</th>
                      <th className="py-4 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Institutional Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7dff0]">
                    {students.map((student, idx) => (
                      <tr key={student.id} className="hover:bg-[#fbf8fe]/50 transition-colors">
                        <td className="py-4 px-6 text-[13px] font-semibold text-[#64748b]">{(idx + 1).toString().padStart(2, '0')}</td>
                        <td className="py-4 px-6 text-[14px] font-bold text-[#4b3f68]">{student.name}</td>
                        <td className="py-4 px-6 text-[13.5px] text-[#64748b]">{student.email}</td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-16 text-center">
                          <div className="flex flex-col items-center">
                            <Users size={32} className="text-[#cbd5e1] mb-3" />
                            <p className="text-[14px] font-semibold text-[#4b3f68]">No Active Enrollments</p>
                            <p className="text-[13px] text-[#64748b] mt-1">There are currently no students mapped to this Class ID.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeSubTab === 'grades' && (
            <div className="bg-white rounded-md border border-[#e7dff0] overflow-hidden shadow-[0_10px_28px_rgba(57,31,86,0.06)] animate-fade-in">
              {isLoadingGrades ? (
                <div className="p-6 flex justify-center py-20 text-[#94a3b8]">
                  <p className="text-[14px] font-medium animate-pulse">Loading submissions...</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#fbf8fe] border-b border-[#e7dff0]">
                      <th className="py-4 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider w-[300px]">Assignment</th>
                      <th className="py-4 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Student Name</th>
                      <th className="py-4 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Status</th>
                      <th className="py-4 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7dff0]">
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#fbf8fe]/50 transition-colors">
                        <td className="py-4 px-6 text-[13.5px] font-bold text-[#4b3f68] truncate max-w-[300px]">
                          {sub.assignments?.title || 'Unknown Assignment'}
                        </td>
                        <td className="py-4 px-6 text-[14px] font-semibold text-[#64748b]">
                          {sub.users?.name || 'Unknown Student'}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-sm text-[11px] font-bold tracking-wide ${sub.grade !== null
                            ? 'bg-[#dcfce7] text-[#16a34a]'
                            : 'bg-[#fef9c3] text-[#ca8a04]'
                            }`}>
                            {sub.grade !== null ? 'GRADED' : 'SUBMITTED'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedSubmission(sub)}
                            className="px-4 py-1.5 bg-white border border-[#d8c8e9] text-[#6a5182] hover:bg-[#f3eff7] text-[12px] font-bold tracking-wider rounded-sm transition-colors uppercase cursor-pointer shadow-sm"
                          >
                            {sub.grade !== null ? 'REGRADE' : 'GRADE'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {submissions.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-16 text-center">
                          <div className="flex flex-col items-center">
                            <ClipboardList size={32} className="text-[#cbd5e1] mb-3" />
                            <p className="text-[14px] font-semibold text-[#4b3f68]">No Submissions Found</p>
                            <p className="text-[13px] text-[#64748b] mt-1">Students have not yet submitted assignments to this class.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeSubTab === 'notifications' && (
            <div className="bg-white rounded-md border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] p-6 md:p-8 animate-fade-in">
              <div className="mb-6 border-b border-[#e7dff0] pb-4">
                <h3 className="text-[18px] font-extrabold text-[#4b3f68]">Push Notification to {course.name}</h3>
                <p className="text-[13px] text-[#64748b] mt-1">
                  Sending to: <strong className="text-[#4b3f68]">{className || 'Class'}</strong> ({course.name}) — {students.length} enrolled students.
                </p>
              </div>

              <form onSubmit={handleSendNotification} className="max-w-[600px] flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Title *</label>
                  <input
                    type="text"
                    placeholder="E.g. Important Update Regarding Midterms"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-3 text-[14px] w-full outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b] font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Message Details *</label>
                  <textarea
                    rows={5}
                    placeholder="Write your broadcast message here..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-3 text-[14px] w-full outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b] resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-bold tracking-wide rounded-sm transition-all shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed uppercase"
                  >
                    {isSending ? <>Processing...</> : <><Send size={16} /> Broadcast Now</>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSubTab === 'attendance' && (
            <TeacherAttendanceTab
              classId={classId}
              students={students}
              courseName={course?.name || ''}
              className={className}
            />
          )}

        </div>
      </main>

      <TeacherGradeModal
        isOpen={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        submission={selectedSubmission}
        onGraded={loadSubmissions}
      />

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
