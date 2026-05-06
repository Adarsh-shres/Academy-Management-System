import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Bell, Mail, ChevronLeft, Users, Send, ClipboardList } from '../components/shared/icons';
import ProfileDropdown from '../components/shared/ProfileDropdown';
import TeacherSidebar from '../components/teachers/TeacherSidebar';
import TeacherGradeModal from '../components/teachers/TeacherGradeModal';
import TeacherContentTab from '../components/teachers/TeacherContentTab';

export default function TeacherClassDetailPage() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [activeSubTab, setActiveSubTab] = useState<'content' | 'students' | 'notifications' | 'grades' | 'quizzes'>('content');
  const [course, setCourse] = useState<any>(null);
  const [classDetails, setClassDetails] = useState<any>(null);
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

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);

  const [quizSubmissions, setQuizSubmissions] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  const [isEditingQuiz, setIsEditingQuiz] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

  // Quiz form state
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [quizDueDate, setQuizDueDate] = useState('');
  const [quizTimeLimit, setQuizTimeLimit] = useState('');
  const [questions, setQuestions] = useState<any[]>([
    { question_text: '', question_type: 'mcq', options: ['', '', '', ''], correct_answer: '0', marks: 1 }
  ]);
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);
  const [savingMode, setSavingMode] = useState<'draft' | 'publish' | null>(null);

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
      } catch (err) {
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
      } catch (err: any) {
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
  }, [activeSubTab, classId]);

  const handleTabChange = (tabId: string) => {
    const routes: Record<string, string> = {
      'Dashboard': '/teacher/dashboard',
      'Classes': '/teacher/classes',
      'Assignment': '/teacher/assignments',
      'Schedule': '/teacher/schedule',
      'Settings': '/teacher/settings',
    };
    navigate(routes[tabId] || '/teacher/dashboard');
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

  const loadQuizzes = async () => {
    setIsLoadingQuizzes(true);
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setQuizzes(data || []);
    } catch (err) {
      console.error('Failed to load quizzes', err);
    } finally {
      setIsLoadingQuizzes(false);
    }
  };

  const loadQuizQuestions = async (quizId: string) => {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_index');
    if (!error) setQuizQuestions(data || []);
  };

  const loadQuizSubmissions = async (quizId: string) => {
    setIsLoadingSubmissions(true);
    try {
      const { data, error } = await supabase
        .from('quiz_submissions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      // Fetch student names from users table
      if (data && data.length > 0) {
        const studentIds = data.map((s: any) => s.student_id);
        const { data: usersData } = await supabase
          .from('users')
          .select('id, name, email')
          .in('id', studentIds);

        const enriched = data.map((sub: any) => ({
          ...sub,
          student: usersData?.find((u: any) => u.id === sub.student_id) || null
        }));

        setQuizSubmissions(enriched);
      } else {
        setQuizSubmissions([]);
      }
    } catch (err) {
      console.error('Failed to load quiz submissions', err);
      setQuizSubmissions([]);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      question_text: '', question_type: 'mcq', options: ['', '', '', ''], correct_answer: '0', marks: 1
    }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q));
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const newOptions = [...q.options];
      newOptions[oIndex] = value;
      return { ...q, options: newOptions };
    }));
  };

  const resetQuizForm = () => {
    setQuizTitle('');
    setQuizDescription('');
    setQuizDueDate('');
    setQuizTimeLimit('');
    setQuestions([{ question_text: '', question_type: 'mcq', options: ['', '', '', ''], correct_answer: '0', marks: 1 }]);
    setShowQuizForm(false);
    setIsEditingQuiz(false);
    setEditingQuizId(null);
  };

  const openEditQuiz = (quiz: any) => {
    // Pre-fill form with existing quiz data
    setQuizTitle(quiz.title);
    setQuizDescription(quiz.description || '');
    setQuizDueDate(quiz.due_date ? new Date(quiz.due_date).toISOString().slice(0, 16) : '');
    setQuizTimeLimit(quiz.time_limit_minutes ? String(quiz.time_limit_minutes) : '');

    // Pre-fill questions from already-loaded quizQuestions
    if (quizQuestions.length > 0) {
      setQuestions(quizQuestions.map(q => ({
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options || ['', '', '', ''],
        correct_answer: q.correct_answer,
        marks: q.marks || 1,
        id: q.id // keep existing id for update
      })));
    }

    setEditingQuizId(quiz.id);
    setIsEditingQuiz(true);
    setShowQuizForm(true);
    setSelectedQuiz(null);
  };

  const updateQuiz = async (publish: boolean) => {
    if (!quizTitle.trim()) { showToast('Please enter a quiz title.', 'error'); return; }
    if (questions.some(q => !q.question_text.trim())) { showToast('Please fill in all question texts.', 'error'); return; }

    setSavingMode(publish ? 'publish' : 'draft');
    setIsSavingQuiz(true);

    try {
      // Update quiz metadata
      const { error: quizError } = await supabase
        .from('quizzes')
        .update({
          title: quizTitle.trim(),
          description: quizDescription.trim() || null,
          due_date: quizDueDate || null,
          time_limit_minutes: quizTimeLimit ? Math.round(Number(quizTimeLimit)) : null,
          is_published: publish
        })
        .eq('id', editingQuizId);

      if (quizError) throw quizError;

      // Delete all old questions and re-insert (simplest approach)
      const { error: deleteError } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('quiz_id', editingQuizId);

      if (deleteError) throw deleteError;

      // Insert updated questions
      const questionsToInsert = questions.map((q, idx) => ({
        quiz_id: editingQuizId,
        question_text: q.question_text.trim(),
        question_type: q.question_type,
        options: q.question_type === 'mcq' ? q.options : null,
        correct_answer: q.correct_answer,
        marks: q.marks || 1,
        order_index: idx
      }));

      const { error: qError } = await supabase
        .from('quiz_questions')
        .insert(questionsToInsert);

      if (qError) throw qError;

      showToast(publish ? 'Quiz updated and published!' : 'Quiz updated and saved as draft.');
      resetQuizForm();
      setIsEditingQuiz(false);
      setEditingQuizId(null);
      loadQuizzes();

    } catch (err: any) {
      showToast('Failed to update quiz: ' + err.message, 'error');
    } finally {
      setIsSavingQuiz(false);
      setSavingMode(null);
    }
  };

  const saveQuiz = async (publish: boolean) => {
    if (!quizTitle.trim()) { showToast('Please enter a quiz title.', 'error'); return; }
    if (questions.some(q => !q.question_text.trim())) { showToast('Please fill in all question texts.', 'error'); return; }

    setSavingMode(publish ? 'publish' : 'draft');
    setIsSavingQuiz(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          class_id: classId,
          course_id: course?.id || null,
          teacher_id: user.id,
          title: quizTitle.trim(),
          description: quizDescription.trim() || null,
          due_date: quizDueDate || null,
          time_limit_minutes: quizTimeLimit ? Math.round(Number(quizTimeLimit)) : null,
          is_published: publish
        })
        .select()
        .single();

      if (quizError) throw quizError;

      const questionsToInsert = questions.map((q, idx) => ({
        quiz_id: quizData.id,
        question_text: q.question_text.trim(),
        question_type: q.question_type,
        options: q.question_type === 'mcq' ? q.options : null,
        correct_answer: q.correct_answer,
        marks: q.marks || 1,
        order_index: idx
      }));

      const { error: qError } = await supabase.from('quiz_questions').insert(questionsToInsert);
      if (qError) throw qError;

      showToast(publish ? 'Quiz published successfully! Students can now see it.' : 'Quiz saved as draft. It is not visible to students yet.');
      resetQuizForm();
      loadQuizzes();
    } catch (err: any) {
      showToast('Failed to save quiz: ' + err.message, 'error');
    } finally {
      setIsSavingQuiz(false);
      setSavingMode(null);
    }
  };

  const togglePublish = async (quiz: any) => {
    const newStatus = !quiz.is_published;
    const { error } = await supabase
      .from('quizzes')
      .update({ is_published: newStatus })
      .eq('id', quiz.id);
    if (!error) {
      setSelectedQuiz((prev: any) => ({ ...prev, is_published: newStatus }));
      loadQuizzes();
      showToast(newStatus ? 'Quiz published! Students can now see it.' : 'Quiz unpublished. Hidden from students.');
    }
  };

  const deleteQuiz = async (quizId: string) => {
    const { error } = await supabase.from('quizzes').delete().eq('id', quizId);
    if (!error) {
      setSelectedQuiz(null);
      loadQuizzes();
      showToast('Quiz deleted successfully.');
    } else {
      showToast('Failed to delete quiz.', 'error');
    }
  };

  useEffect(() => {
    if (activeSubTab === 'quizzes' && classId) {
      loadQuizzes();
    }
  }, [activeSubTab, classId]);

  useEffect(() => {
    if (selectedQuiz) {
      loadQuizQuestions(selectedQuiz.id);
      loadQuizSubmissions(selectedQuiz.id);
    } else {
      setQuizSubmissions([]);
    }
  }, [selectedQuiz]);

  if (!course) return null;

  return (
    <div className="flex h-screen bg-main-bg font-sans overflow-hidden">
      <TeacherSidebar activeTab="Classes" onTabChange={handleTabChange} />

      <main className="flex-1 ml-[210px] flex flex-col min-w-0 bg-[#f9f8fa] overflow-y-auto hide-scrollbar">

        <header className="h-[68px] bg-white/80 backdrop-blur-md border-b border-[#e7dff0] px-6 md:px-8 flex items-center shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/teacher/classes')}
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
            {(['content', 'students', 'grades', 'notifications', 'quizzes'] as const).map((tab) => (
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
                {tab === 'quizzes' && 'Quizzes'}
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

          {activeSubTab === 'quizzes' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              {toast && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-md shadow-xl border max-w-[380px] animate-fade-in ${
                  toast.type === 'success'
                    ? 'bg-white border-[#86efac] text-[#15803d]'
                    : 'bg-white border-[#fca5a5] text-[#dc2626]'
                }`}>
                  <span className="text-[18px] mt-0.5">{toast.type === 'success' ? '✓' : '✕'}</span>
                  <div>
                    <p className="text-[13.5px] font-bold text-[#4b3f68]">
                      {toast.type === 'success' ? 'Success' : 'Error'}
                    </p>
                    <p className="text-[12.5px] font-medium text-[#64748b] mt-0.5">{toast.message}</p>
                  </div>
                  <button onClick={() => setToast(null)} className="ml-auto text-[#94a3b8] hover:text-[#64748b] text-[14px] cursor-pointer">✕</button>
                </div>
              )}

              {/* Header row */}
              {!showQuizForm && !selectedQuiz && (
                <div className="flex justify-between items-center">
                  <p className="text-[13.5px] text-[#64748b] font-medium">{quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} in this class</p>
                  <button
                    onClick={() => setShowQuizForm(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13px] font-bold rounded-sm transition-all shadow-sm uppercase tracking-wide cursor-pointer"
                  >
                    + Create Quiz
                  </button>
                </div>
              )}

              {/* Quiz creation form */}
              {showQuizForm && (
                <div className="bg-white rounded-md border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] p-6 md:p-8">
                  <div className="flex justify-between items-center mb-6 border-b border-[#e7dff0] pb-4">
                    <h3 className="text-[18px] font-extrabold text-[#4b3f68]">
                      {isEditingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
                    </h3>
                    <button onClick={resetQuizForm} className="text-[#64748b] hover:text-[#4b3f68] text-[13px] font-semibold cursor-pointer">✕ Cancel</button>
                  </div>

                  {/* Quiz details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Quiz Title *</label>
                      <input type="text" placeholder="E.g. Chapter 1 Review Quiz" value={quizTitle} onChange={e => setQuizTitle(e.target.value)}
                        className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-3 text-[14px] w-full outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b] font-medium" />
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Description (optional)</label>
                      <textarea rows={2} placeholder="Brief description of the quiz..." value={quizDescription} onChange={e => setQuizDescription(e.target.value)}
                        className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-3 text-[14px] w-full outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b] resize-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Due Date (optional)</label>
                      <input type="datetime-local" value={quizDueDate} onChange={e => setQuizDueDate(e.target.value)}
                        className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-3 text-[14px] w-full outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b]" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Time Limit in Minutes (optional)</label>
                      <input type="number" placeholder="E.g. 30" min="1" value={quizTimeLimit} onChange={e => setQuizTimeLimit(e.target.value)}
                        className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-3 text-[14px] w-full outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b]" />
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="flex flex-col gap-5 mb-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[14px] font-extrabold text-[#4b3f68] uppercase tracking-wide">Questions</h4>
                      <button onClick={addQuestion}
                        className="px-4 py-1.5 bg-white border border-[#d8c8e9] text-[#6a5182] hover:bg-[#f3eff7] text-[12px] font-bold tracking-wider rounded-sm transition-colors uppercase cursor-pointer shadow-sm">
                        + Add Question
                      </button>
                    </div>

                    {questions.map((q, qIdx) => (
                      <div key={qIdx} className="bg-[#fbf8fe] border border-[#e7dff0] rounded-md p-5 flex flex-col gap-4">
                        <div className="flex justify-between items-start gap-3">
                          <span className="text-[12px] font-bold text-[#6a5182] uppercase tracking-wide">Q{qIdx + 1}</span>
                          {questions.length > 1 && (
                            <button onClick={() => removeQuestion(qIdx)} className="text-[#94a3b8] hover:text-red-500 text-[12px] font-bold cursor-pointer transition-colors">🗑 Remove</button>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Question Text *</label>
                          <textarea rows={2} placeholder="Enter your question here..." value={q.question_text}
                            onChange={e => updateQuestion(qIdx, 'question_text', e.target.value)}
                            className="bg-white border border-[#e7dff0] rounded-sm px-4 py-2.5 text-[13.5px] w-full outline-none focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b] resize-none" />
                        </div>

                        <div className="flex gap-4 items-center">
                          <div className="flex flex-col gap-1.5 flex-1">
                            <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Question Type</label>
                            <select value={q.question_type} onChange={e => updateQuestion(qIdx, 'question_type', e.target.value)}
                              className="bg-white border border-[#e7dff0] rounded-sm px-4 py-2.5 text-[13.5px] outline-none focus:border-[#6a5182] text-[#1e293b] cursor-pointer">
                              <option value="mcq">Multiple Choice (MCQ)</option>
                              <option value="true_false">True / False</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1.5 w-[100px]">
                            <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Marks</label>
                            <input type="number" min="1" value={q.marks} onChange={e => updateQuestion(qIdx, 'marks', parseInt(e.target.value))}
                              className="bg-white border border-[#e7dff0] rounded-sm px-4 py-2.5 text-[13.5px] outline-none focus:border-[#6a5182] text-[#1e293b]" />
                          </div>
                        </div>

                        {q.question_type === 'mcq' && (
                          <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Options</label>
                            {['A', 'B', 'C', 'D'].map((letter, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-3">
                                <span className="text-[12px] font-bold text-[#6a5182] w-5">{letter}.</span>
                                <input type="text" placeholder={`Option ${letter}`} value={q.options[oIdx]}
                                  onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                                  className="bg-white border border-[#e7dff0] rounded-sm px-3 py-2 text-[13px] flex-1 outline-none focus:border-[#6a5182] focus:ring-[2px] focus:ring-[#6a5182]/10 text-[#1e293b]" />
                              </div>
                            ))}
                            <div className="flex flex-col gap-1.5 mt-1">
                              <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Correct Answer</label>
                              <select value={q.correct_answer} onChange={e => updateQuestion(qIdx, 'correct_answer', e.target.value)}
                                className="bg-white border border-[#e7dff0] rounded-sm px-4 py-2.5 text-[13.5px] outline-none focus:border-[#6a5182] text-[#1e293b] cursor-pointer">
                                <option value="0">A</option>
                                <option value="1">B</option>
                                <option value="2">C</option>
                                <option value="3">D</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {q.question_type === 'true_false' && (
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Correct Answer</label>
                            <select value={q.correct_answer} onChange={e => updateQuestion(qIdx, 'correct_answer', e.target.value)}
                              className="bg-white border border-[#e7dff0] rounded-sm px-4 py-2.5 text-[13.5px] outline-none focus:border-[#6a5182] text-[#1e293b] cursor-pointer">
                              <option value="true">True</option>
                              <option value="false">False</option>
                            </select>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Save buttons */}
                  <div className="flex gap-3 pt-2 border-t border-[#e7dff0]">
                    <button onClick={() => isEditingQuiz ? updateQuiz(false) : saveQuiz(false)} disabled={isSavingQuiz}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-[#d8c8e9] text-[#6a5182] hover:bg-[#f3eff7] text-[13px] font-bold rounded-sm transition-all shadow-sm cursor-pointer disabled:opacity-70 uppercase tracking-wide">
                      {savingMode === 'draft' ? 'Saving...' : 'Save as Draft'}
                    </button>
                    <button onClick={() => isEditingQuiz ? updateQuiz(true) : saveQuiz(true)} disabled={isSavingQuiz}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13px] font-bold rounded-sm transition-all shadow-sm cursor-pointer disabled:opacity-70 uppercase tracking-wide">
                      {savingMode === 'publish' ? 'Publishing...' : isEditingQuiz ? 'Update & Publish' : 'Publish Quiz'}
                    </button>
                  </div>
                </div>
              )}

              {/* Quiz detail view */}
              {selectedQuiz && !showQuizForm && (
                <div className="bg-white rounded-md border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] p-6 md:p-8">
                  <div className="flex justify-between items-start mb-6 border-b border-[#e7dff0] pb-4">
                    <div>
                      <button onClick={() => setSelectedQuiz(null)} className="text-[#64748b] hover:text-[#4b3f68] text-[13px] font-semibold cursor-pointer mb-2">← Back to Quizzes</button>
                      <h3 className="text-[18px] font-extrabold text-[#4b3f68]">{selectedQuiz.title}</h3>
                      {selectedQuiz.description && <p className="text-[13px] text-[#64748b] mt-1">{selectedQuiz.description}</p>}
                      <div className="flex gap-4 mt-2 text-[12px] text-[#64748b] font-medium">
                        {selectedQuiz.due_date && <span>Due: {new Date(selectedQuiz.due_date).toLocaleString()}</span>}
                        {selectedQuiz.time_limit_minutes && <span>⏱ {selectedQuiz.time_limit_minutes} min</span>}
                        <span>{quizQuestions.length} question{quizQuestions.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditQuiz(selectedQuiz)}
                        className="px-4 py-1.5 bg-white border border-[#d8c8e9] text-[#6a5182] hover:bg-[#f3eff7] text-[12px] font-bold tracking-wider rounded-sm transition-colors uppercase cursor-pointer shadow-sm"
                      >
                        Edit
                      </button>
                      <button onClick={() => togglePublish(selectedQuiz)}
                        className={`px-4 py-1.5 text-[12px] font-bold tracking-wider rounded-sm transition-colors uppercase cursor-pointer shadow-sm border ${selectedQuiz.is_published ? 'bg-[#fef9c3] text-[#ca8a04] border-[#fde68a]' : 'bg-[#dcfce7] text-[#16a34a] border-[#86efac]'}`}>
                        {selectedQuiz.is_published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button onClick={() => deleteQuiz(selectedQuiz.id)}
                        className="px-4 py-1.5 bg-white border border-[#fecaca] text-red-500 hover:bg-red-50 text-[12px] font-bold tracking-wider rounded-sm transition-colors uppercase cursor-pointer shadow-sm">
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {quizQuestions.map((q, idx) => (
                      <div key={q.id} className="bg-[#fbf8fe] border border-[#e7dff0] rounded-md p-5">
                        <div className="flex justify-between items-start mb-3">
                          <p className="text-[14px] font-bold text-[#4b3f68]">Q{idx + 1}. {q.question_text}</p>
                          <span className="text-[11px] font-bold text-[#6a5182] bg-[#f3eff7] px-2 py-0.5 rounded-sm border border-[#d8c8e9]">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                        </div>
                        {q.question_type === 'mcq' && q.options && (
                          <div className="flex flex-col gap-1.5 mt-2">
                            {q.options.map((opt: string, oIdx: number) => (
                              <div key={oIdx} className={`flex items-center gap-2 px-3 py-2 rounded-sm text-[13px] ${String(oIdx) === q.correct_answer ? 'bg-[#dcfce7] text-[#16a34a] font-bold border border-[#86efac]' : 'bg-white border border-[#e7dff0] text-[#64748b]'}`}>
                                <span className="font-bold">{['A', 'B', 'C', 'D'][oIdx]}.</span> {opt}
                                {String(oIdx) === q.correct_answer && <span className="ml-auto text-[11px]">✓ Correct</span>}
                              </div>
                            ))}
                          </div>
                        )}
                        {q.question_type === 'true_false' && (
                          <div className="flex gap-2 mt-2">
                            {['true', 'false'].map(val => (
                              <div key={val} className={`px-4 py-2 rounded-sm text-[13px] font-bold border capitalize ${val === q.correct_answer ? 'bg-[#dcfce7] text-[#16a34a] border-[#86efac]' : 'bg-white border-[#e7dff0] text-[#64748b]'}`}>
                                {val} {val === q.correct_answer && '✓'}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Student Results Section */}
                  <div className="mt-8 border-t border-[#e7dff0] pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[15px] font-extrabold text-[#4b3f68] uppercase tracking-wide">
                        Student Results
                      </h4>
                      {quizSubmissions.length > 0 && (
                        <div className="flex items-center gap-4 text-[12px] font-bold text-[#64748b]">
                          <span>
                            {quizSubmissions.length} Submission{quizSubmissions.length !== 1 ? 's' : ''}
                          </span>
                          <span className="bg-[#f3eff7] text-[#6a5182] px-3 py-1 rounded-sm border border-[#d8c8e9]">
                            Avg: {(quizSubmissions.reduce((sum, s) => sum + (s.percentage || 0), 0) / quizSubmissions.length).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>

                    {isLoadingSubmissions ? (
                      <div className="flex flex-col gap-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="animate-pulse bg-[#fbf8fe] h-[60px] rounded-md border border-[#e7dff0]" />
                        ))}
                      </div>
                    ) : quizSubmissions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4 bg-[#fbf8fe] border border-dashed border-[#e7dff0] rounded-md text-center">
                        <Users size={32} className="text-[#cbd5e1] mb-3" />
                        <p className="text-[14px] font-bold text-[#4b3f68]">No Submissions Yet</p>
                        <p className="text-[13px] text-[#64748b] mt-1">
                          {selectedQuiz.is_published
                            ? 'Students have not attempted this quiz yet.'
                            : 'Publish this quiz so students can attempt it.'}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white rounded-md border border-[#e7dff0] overflow-hidden shadow-[0_10px_28px_rgba(57,31,86,0.06)]">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#fbf8fe] border-b border-[#e7dff0]">
                              <th className="py-3 px-5 text-[11px] font-bold text-[#64748b] uppercase tracking-wider w-[50px]">#</th>
                              <th className="py-3 px-5 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Student</th>
                              <th className="py-3 px-5 text-[11px] font-bold text-[#64748b] uppercase tracking-wider text-center">Score</th>
                              <th className="py-3 px-5 text-[11px] font-bold text-[#64748b] uppercase tracking-wider text-center">Percentage</th>
                              <th className="py-3 px-5 text-[11px] font-bold text-[#64748b] uppercase tracking-wider text-center">Time Taken</th>
                              <th className="py-3 px-5 text-[11px] font-bold text-[#64748b] uppercase tracking-wider text-center">Submitted</th>
                              <th className="py-3 px-5 text-[11px] font-bold text-[#64748b] uppercase tracking-wider text-center">Result</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#e7dff0]">
                            {quizSubmissions.map((sub, idx) => {
                              const passed = sub.percentage >= 50;
                              const mins = sub.time_taken_seconds ? Math.floor(sub.time_taken_seconds / 60) : null;
                              const secs = sub.time_taken_seconds ? sub.time_taken_seconds % 60 : null;
                              return (
                                <tr key={sub.id} className="hover:bg-[#fbf8fe]/50 transition-colors">
                                  <td className="py-3 px-5 text-[13px] font-semibold text-[#64748b]">
                                    {(idx + 1).toString().padStart(2, '0')}
                                  </td>
                                  <td className="py-3 px-5">
                                    <p className="text-[14px] font-bold text-[#4b3f68]">
                                      {sub.student?.name || 'Unknown Student'}
                                    </p>
                                    <p className="text-[12px] text-[#94a3b8]">{sub.student?.email || ''}</p>
                                  </td>
                                  <td className="py-3 px-5 text-center">
                                    <span className="text-[14px] font-extrabold text-[#4b3f68]">
                                      {sub.score}
                                    </span>
                                    <span className="text-[12px] text-[#94a3b8] font-medium">
                                      /{sub.total_marks}
                                    </span>
                                  </td>
                                  <td className="py-3 px-5 text-center">
                                    <span className={`text-[13px] font-extrabold ${sub.percentage >= 75 ? 'text-[#16a34a]' : sub.percentage >= 50 ? 'text-[#ca8a04]' : 'text-red-500'}`}>
                                      {Number(sub.percentage).toFixed(1)}%
                                    </span>
                                  </td>
                                  <td className="py-3 px-5 text-center text-[13px] text-[#64748b] font-medium">
                                    {mins !== null ? `${mins}m ${secs}s` : '—'}
                                  </td>
                                  <td className="py-3 px-5 text-center text-[12px] text-[#94a3b8] font-medium">
                                    {new Date(sub.submitted_at).toLocaleDateString()}
                                  </td>
                                  <td className="py-3 px-5 text-center">
                                    <span className={`px-2.5 py-1 rounded-sm text-[11px] font-bold tracking-wide ${passed ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#fee2e2] text-red-500'}`}>
                                      {passed ? 'PASSED' : 'FAILED'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quiz list */}
              {!showQuizForm && !selectedQuiz && (
                isLoadingQuizzes ? (
                  <div className="flex flex-col gap-4">
                    {[1, 2].map(i => <div key={i} className="animate-pulse bg-white h-[90px] rounded-md border border-[#e7dff0]"></div>)}
                  </div>
                ) : quizzes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border border-dashed border-[#e7dff0] rounded-md w-full text-center">
                    <ClipboardList size={40} className="text-[#cbd5e1] mb-3" />
                    <p className="text-[15px] font-bold text-[#4b3f68]">No Quizzes Yet</p>
                    <p className="text-[13px] text-[#64748b] mt-1">Create your first quiz for this class.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {quizzes.map(quiz => (
                      <div key={quiz.id} onClick={() => setSelectedQuiz(quiz)}
                        className="bg-white rounded-md border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] p-5 flex justify-between items-center cursor-pointer hover:border-[#6a5182] hover:shadow-md transition-all">
                        <div>
                          <p className="text-[15px] font-bold text-[#4b3f68]">{quiz.title}</p>
                          <div className="flex gap-4 mt-1 text-[12px] text-[#64748b] font-medium">
                            {quiz.due_date && <span>Due: {new Date(quiz.due_date).toLocaleDateString()}</span>}
                            {quiz.time_limit_minutes && <span>⏱ {quiz.time_limit_minutes} min</span>}
                            <span>Created: {new Date(quiz.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-sm text-[11px] font-bold tracking-wide ${quiz.is_published ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#f1f5f9] text-[#64748b]'}`}>
                          {quiz.is_published ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
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