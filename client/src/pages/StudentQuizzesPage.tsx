import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import AccessCodeModal from '../components/students/AccessCodeModal';
import { Calendar, CheckCircle, ClipboardList, Search } from '../components/shared/icons';

interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'mcq' | 'true_false';
  options: string[] | null;
  correct_answer: string;
  marks: number;
  order_index: number;
}

interface Quiz {
  id: string;
  class_id: string;
  course_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  time_limit_minutes: number | null;
  access_code: string | null;
  created_at: string;
  quiz_questions?: QuizQuestion[];
  className: string;
  courseName: string;
  courseCode: string;
}

interface QuizSubmission {
  id: string;
  quiz_id: string;
  student_id: string;
  answers: Record<string, string>;
  score: number;
  total_marks: number;
  percentage: number;
  time_taken_seconds: number;
  submitted_at: string;
}

type QuizFilter = 'all' | 'open' | 'submitted' | 'closed';

interface ClassRow {
  id: string;
  name: string | null;
  course_id: string | null;
}

interface CourseRow {
  id: string;
  name: string | null;
  course_code: string | null;
}

interface QuizRow {
  id: string;
  class_id: string;
  course_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  time_limit_minutes: number | null;
  access_code: string | null;
  created_at: string;
  quiz_questions?: QuizQuestion[];
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Failed to load quizzes.';
}

export default function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, QuizSubmission>>({});
  const [currentUserId, setCurrentUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<QuizFilter>('all');
  const [unlockedQuizzes, setUnlockedQuizzes] = useState<Set<string>>(new Set());
  const [activeQuizToUnlock, setActiveQuizToUnlock] = useState<Quiz | null>(null);
  const [activeQuizToTake, setActiveQuizToTake] = useState<Quiz | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const loadQuizzes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      setCurrentUserId(user.id);

      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('id, name, course_id')
        .contains('student_ids', [user.id]);

      if (classesError) throw classesError;

      const enrolledClasses = (classesData || []) as ClassRow[];
      const classIds = enrolledClasses.map((cls) => cls.id);

      if (classIds.length === 0) {
        setQuizzes([]);
        setSubmissions({});
        setIsLoading(false);
        return;
      }

      const courseIds = Array.from(new Set(enrolledClasses.map((cls) => cls.course_id).filter(Boolean))) as string[];
      const classMap = new Map(enrolledClasses.map((cls) => [cls.id, cls]));
      const courseMap = new Map<string, CourseRow>();

      if (courseIds.length > 0) {
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('id, name, course_code')
          .in('id', courseIds);

        if (coursesError) throw coursesError;
        ((coursesData || []) as CourseRow[]).forEach((course) => courseMap.set(course.id, course));
      }

      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*, quiz_questions(*)')
        .in('class_id', classIds)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (quizError) throw quizError;

      const { data: submissionData, error: submissionError } = await supabase
        .from('quiz_submissions')
        .select('*')
        .eq('student_id', user.id);

      if (submissionError) throw submissionError;

      const submissionMap = (submissionData || []).reduce((acc: Record<string, QuizSubmission>, sub: QuizSubmission) => {
        acc[sub.quiz_id] = sub;
        return acc;
      }, {});

      setSubmissions(submissionMap);
      setQuizzes(((quizData || []) as QuizRow[]).map((quiz) => {
        const cls = classMap.get(quiz.class_id);
        const courseId = quiz.course_id || cls?.course_id || '';
        const course = courseMap.get(courseId);
        const questions = [...(quiz.quiz_questions || [])].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

        return {
          ...quiz,
          quiz_questions: questions,
          className: cls?.name || 'Assigned class',
          courseName: course?.name || 'Course',
          courseCode: course?.course_code || '---',
        };
      }));
    } catch (err) {
      console.error('Failed to load quizzes:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadQuizzes();
  }, []);

  const isPastDue = (quiz: Quiz) => quiz.due_date ? new Date(quiz.due_date) < new Date() : false;
  const hasSubmitted = (quiz: Quiz) => Boolean(submissions[quiz.id]);
  const canTake = (quiz: Quiz) => !hasSubmitted(quiz) && !isPastDue(quiz);

  const filteredQuizzes = quizzes.filter((quiz) => {
    const text = `${quiz.title} ${quiz.courseName} ${quiz.className}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ? true :
      filter === 'open' ? canTake(quiz) :
      filter === 'submitted' ? hasSubmitted(quiz) :
      filter === 'closed' ? !hasSubmitted(quiz) && isPastDue(quiz) : true;

    return matchesSearch && matchesFilter;
  });

  const filterOptions = [
    { value: 'all' as const, label: 'ALL', count: quizzes.length },
    { value: 'open' as const, label: 'OPEN', count: quizzes.filter(canTake).length },
    { value: 'submitted' as const, label: 'SUBMITTED', count: quizzes.filter(hasSubmitted).length },
    { value: 'closed' as const, label: 'CLOSED', count: quizzes.filter(q => !hasSubmitted(q) && isPastDue(q)).length },
  ];

  const startQuiz = (quiz: Quiz) => {
    setActiveQuizToTake(quiz);
    setAnswers({});
    setShowResults(false);
    setTimeLeft(quiz.time_limit_minutes ? quiz.time_limit_minutes * 60 : 0);
  };

  const handleStartClick = (quiz: Quiz) => {
    if (!canTake(quiz)) return;
    if (quiz.access_code?.trim() && !unlockedQuizzes.has(quiz.id)) {
      setActiveQuizToUnlock(quiz);
      return;
    }
    startQuiz(quiz);
  };

  const handleUnlockSuccess = () => {
    if (!activeQuizToUnlock) return;
    setUnlockedQuizzes(prev => new Set(prev).add(activeQuizToUnlock.id));
    startQuiz(activeQuizToUnlock);
    setActiveQuizToUnlock(null);
  };

  const handleSubmitQuiz = useCallback(async () => {
    if (!activeQuizToTake || isSubmitting) return;

    setIsSubmitting(true);
    const questions = activeQuizToTake.quiz_questions || [];
    let score = 0;
    let totalMarks = 0;

    questions.forEach(question => {
      totalMarks += question.marks || 1;
      if (answersRef.current[question.id] === question.correct_answer) {
        score += question.marks || 1;
      }
    });

    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const timeTaken = activeQuizToTake.time_limit_minutes ? activeQuizToTake.time_limit_minutes * 60 - timeLeft : 0;

    try {
      const { data, error: submitError } = await supabase
        .from('quiz_submissions')
        .insert({
          quiz_id: activeQuizToTake.id,
          student_id: currentUserId,
          answers: answersRef.current,
          score,
          total_marks: totalMarks,
          percentage,
          time_taken_seconds: timeTaken,
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (submitError) throw submitError;

      setSubmissions(prev => ({ ...prev, [activeQuizToTake.id]: data }));
      setShowResults(true);
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [activeQuizToTake, currentUserId, isSubmitting, timeLeft]);

  useEffect(() => {
    if (!activeQuizToTake || showResults || timeLeft <= 0) return;

    const timer = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          window.clearInterval(timer);
          void handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeQuizToTake, handleSubmitQuiz, showResults, timeLeft]);

  if (activeQuizToTake && !showResults) {
    const questions = activeQuizToTake.quiz_questions || [];
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="flex flex-col gap-6 pb-10 flex-1 min-w-0 max-w-[980px] mx-auto w-full">
        <div className="sticky top-0 z-20 bg-main-bg/95 backdrop-blur pt-1 pb-3">
          <div className="bg-white rounded-[10px] border border-[#e7dff0] shadow-[0_2px_12px_rgba(57,31,86,0.05)] p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="min-w-0">
              <button onClick={() => setActiveQuizToTake(null)} className="text-[12px] font-bold text-[#6a5182] hover:text-[#4b3f68] uppercase tracking-wide mb-2 cursor-pointer">
                Back to quizzes
              </button>
              <h1 className="text-[22px] font-extrabold text-[#4b3f68] tracking-tight">{activeQuizToTake.title}</h1>
              <p className="text-[13px] text-[#64748b] mt-1">{activeQuizToTake.courseName} · {activeQuizToTake.className}</p>
            </div>
            <div className="flex gap-2.5 flex-wrap">
              <span className="px-3 py-2 rounded-[8px] bg-[#f8fafc] border border-[#e2e8f0] text-[12px] font-bold text-[#64748b]">
                {answeredCount}/{questions.length} Answered
              </span>
              {activeQuizToTake.time_limit_minutes ? (
                <span className="px-3 py-2 rounded-[8px] bg-[#f3eff7] border border-[#d8c8e9] text-[12px] font-extrabold text-[#6a5182]">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-[10px] border border-[#e7dff0] p-5 md:p-6 shadow-[0_2px_12px_rgba(57,31,86,0.03)]">
              <div className="flex justify-between items-start gap-4 mb-4">
                <p className="text-[15px] md:text-[16px] font-bold text-[#4b3f68] leading-snug">
                  <span className="text-[#94a3b8] mr-1">{index + 1}.</span>{question.question_text}
                </p>
                <span className="text-[11px] font-bold text-[#6a5182] bg-[#f3eff7] px-2 py-1 rounded-sm border border-[#d8c8e9] shrink-0">
                  {question.marks || 1} mark{question.marks === 1 ? '' : 's'}
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {question.question_type === 'mcq' && question.options?.map((option, optionIndex) => (
                  <label key={optionIndex} className={`flex items-center gap-3 cursor-pointer p-3 border rounded-[8px] transition-colors ${answers[question.id] === String(optionIndex) ? 'border-[#6a5182] bg-[#f3eff7]' : 'border-[#e7dff0] hover:bg-[#fbf8fe]'}`}>
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={String(optionIndex)}
                      checked={answers[question.id] === String(optionIndex)}
                      onChange={(event) => setAnswers(prev => ({ ...prev, [question.id]: event.target.value }))}
                      className="w-4 h-4 accent-[#6a5182]"
                    />
                    <span className="text-[13.5px] font-medium text-[#4b3f68] leading-snug">{option}</span>
                  </label>
                ))}

                {question.question_type === 'true_false' && ['true', 'false'].map((option) => (
                  <label key={option} className={`flex items-center gap-3 cursor-pointer p-3 border rounded-[8px] transition-colors capitalize ${answers[question.id] === option ? 'border-[#6a5182] bg-[#f3eff7]' : 'border-[#e7dff0] hover:bg-[#fbf8fe]'}`}>
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={(event) => setAnswers(prev => ({ ...prev, [question.id]: event.target.value }))}
                      className="w-4 h-4 accent-[#6a5182]"
                    />
                    <span className="text-[13.5px] font-medium text-[#4b3f68]">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmitQuiz}
          disabled={isSubmitting || questions.length === 0}
          className="self-end px-7 py-3 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13px] font-bold rounded-[8px] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wide cursor-pointer"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </div>
    );
  }

  if (activeQuizToTake && showResults) {
    const submission = submissions[activeQuizToTake.id];
    const questions = activeQuizToTake.quiz_questions || [];

    return (
      <div className="flex flex-col gap-6 pb-10 flex-1 min-w-0 max-w-[980px] mx-auto w-full">
        <button onClick={() => setActiveQuizToTake(null)} className="self-start text-[#6a5182] hover:text-[#4b3f68] font-bold text-[12px] tracking-wide uppercase cursor-pointer">
          Back to quizzes
        </button>

        <div className="bg-white rounded-[10px] border border-[#e7dff0] shadow-[0_2px_12px_rgba(57,31,86,0.04)] p-7 text-center">
          <p className="text-[12px] font-bold text-[#64748b] uppercase tracking-wide">{activeQuizToTake.courseName}</p>
          <h1 className="text-[22px] font-extrabold text-[#4b3f68] mt-1">{activeQuizToTake.title}</h1>
          <p className="text-[48px] font-extrabold text-[#6a5182] leading-none mt-5">{submission?.percentage ?? 0}%</p>
          <p className="text-[12px] font-bold text-[#64748b] uppercase tracking-wide mt-2">
            Score: {submission?.score ?? 0} / {submission?.total_marks ?? 0}
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {questions.map((question, index) => {
            const studentAnswer = submission?.answers?.[question.id];
            const isCorrect = studentAnswer === question.correct_answer;
            const options = question.question_type === 'mcq' ? (question.options || []) : ['True', 'False'];

            return (
              <div key={question.id} className={`bg-white rounded-[10px] border border-[#e7dff0] border-l-4 p-5 shadow-sm ${isCorrect ? 'border-l-[#16a34a]' : 'border-l-[#dc2626]'}`}>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <p className="font-bold text-[#4b3f68] text-[15px] leading-snug">
                    <span className="text-[#94a3b8] mr-1">{index + 1}.</span>{question.question_text}
                  </p>
                  <span className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-sm shrink-0 ${isCorrect ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#fee2e2] text-[#dc2626]'}`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {options.map((option, optionIndex) => {
                    const answerValue = question.question_type === 'mcq' ? String(optionIndex) : String(option).toLowerCase();
                    const selected = studentAnswer === answerValue;
                    const correct = question.correct_answer === answerValue;
                    const optionClass = correct
                      ? 'bg-[#dcfce7]/60 border-[#bbf7d0] text-[#15803d] font-bold'
                      : selected
                        ? 'bg-[#fee2e2]/60 border-[#fecaca] text-[#dc2626] font-bold'
                        : 'bg-[#fbf8fe] border-[#e7dff0] text-[#64748b]';

                    return (
                      <div key={answerValue} className={`flex items-center gap-3 p-3 rounded-[8px] border text-[13.5px] ${optionClass}`}>
                        <span className="w-6 h-6 rounded-full bg-white border border-current flex items-center justify-center text-[11px] font-bold shrink-0">
                          {question.question_type === 'mcq' ? String.fromCharCode(65 + optionIndex) : optionIndex + 1}
                        </span>
                        <span>{option}</span>
                        {correct && <span className="ml-auto text-[11px] uppercase">Correct</span>}
                        {selected && !correct && <span className="ml-auto text-[11px] uppercase">Your answer</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10 flex-1 min-w-0 max-w-[1100px] mx-auto w-full">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="font-sans text-[26px] md:text-[28px] font-bold text-[#4b3f68] tracking-tight">Quizzes</h1>
          <p className="text-[14px] text-[#7c8697] mt-1">{quizzes.length} assigned quizzes</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[220px] items-center justify-center text-[#7c8697] text-[13px] font-semibold animate-pulse uppercase tracking-wider">
          Loading quizzes...
        </div>
      ) : error ? (
        <div className="flex h-[220px] items-center justify-center text-[#4b3f68] font-semibold">{error}</div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1 flex items-center gap-2 bg-white border border-[#e7dff0] rounded-[8px] px-4 py-2.5 shadow-[0_1px_4px_rgba(57,31,86,0.02)] transition-shadow focus-within:shadow-[0_2px_10px_rgba(57,31,86,0.06)] focus-within:border-[#d8c8e9] w-full">
              <Search className="w-4 h-4 text-[#7c8697]" />
              <input
                type="text"
                placeholder="Search quizzes..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="flex-1 text-[13px] text-[#4b3f68] placeholder-[#cbd5e1] outline-none bg-transparent font-medium"
              />
            </div>

            <div className="flex gap-2 bg-white border border-[#e7dff0] rounded-[8px] p-1.5 shadow-[0_1px_4px_rgba(57,31,86,0.02)] w-full md:w-auto overflow-x-auto shrink-0">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-[6px] text-[12px] font-semibold transition-all uppercase tracking-wide whitespace-nowrap cursor-pointer ${
                    filter === option.value ? 'bg-primary text-white shadow-sm' : 'text-[#778196] hover:bg-[#faf8fc]'
                  }`}
                >
                  {option.label}
                  <span className={`text-[10px] px-2 py-[2px] rounded-full font-semibold ${filter === option.value ? 'bg-white/20 text-white' : 'bg-[#f3eff7] text-[#4b3f68]'}`}>
                    {option.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {filteredQuizzes.length === 0 ? (
            <div className="bg-white rounded-[10px] border border-dashed border-[#e7dff0] shadow-[0_2px_12px_rgba(57,31,86,0.02)] p-12 text-center">
              <ClipboardList size={36} className="mx-auto text-[#cbd5e1] mb-3" />
              <p className="text-[13px] font-semibold text-[#7c8697] uppercase tracking-wider">No quizzes found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredQuizzes.map((quiz) => {
                const submitted = hasSubmitted(quiz);
                const closed = !submitted && isPastDue(quiz);
                const submission = submissions[quiz.id];
                const questionCount = quiz.quiz_questions?.length || 0;

                return (
                  <div key={quiz.id} className="bg-white rounded-[10px] border border-[#e7dff0] shadow-[0_2px_12px_rgba(57,31,86,0.04)] p-5 flex flex-col gap-5">
                    <div className="flex items-start gap-4">
                      <div className={`mt-0.5 w-9 h-9 rounded-[8px] flex items-center justify-center flex-shrink-0 ${submitted ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#faf8fc] text-[#4b3f68]'}`}>
                        {submitted ? <CheckCircle size={18} /> : <ClipboardList size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-sans text-[15px] font-semibold text-[#4b3f68] leading-tight tracking-tight">{quiz.title}</h3>
                          <span className={`text-[10px] font-semibold px-2 py-[2px] uppercase tracking-wide rounded-full border flex-shrink-0 ${
                            submitted ? 'text-[#16a34a] bg-[#dcfce7] border-[#bbf7d0]' :
                            closed ? 'text-[#94a3b8] bg-[#faf8fc] border-[#e2d9ed]' :
                            'text-[#4b3f68] bg-[#faf8fc] border-[#e2d9ed]'
                          }`}>
                            {submitted ? 'Submitted' : closed ? 'Closed' : 'Open'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-[12px] font-medium text-[#7c8697]">{quiz.courseName}</span>
                          <span className="text-[#cbd5e1]">&bull;</span>
                          <span className="text-[11px] font-semibold text-primary">{quiz.courseCode}</span>
                          <span className="text-[#cbd5e1]">&bull;</span>
                          <span className="text-[12px] font-medium text-[#7c8697]">{quiz.className}</span>
                        </div>
                        {quiz.description && <p className="text-[12.5px] text-[#64748b] line-clamp-2">{quiz.description}</p>}
                        <div className="flex items-center gap-2.5 mt-3 flex-wrap text-[12px] text-[#7c8697]">
                          <span>{questionCount} question{questionCount === 1 ? '' : 's'}</span>
                          {quiz.time_limit_minutes ? <span>{quiz.time_limit_minutes} min</span> : null}
                          {quiz.due_date ? (
                            <span className="inline-flex items-center gap-1">
                              <Calendar size={13} />
                              Due {new Date(quiz.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          ) : null}
                          {submitted && submission ? <span className="font-bold text-[#6a5182]">{submission.percentage}%</span> : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {submitted ? (
                        <button
                          onClick={() => { setActiveQuizToTake(quiz); setShowResults(true); }}
                          className="flex-1 py-2.5 rounded-[8px] text-[13px] font-semibold text-primary bg-[#f3eff7] hover:bg-[#e7dff0] transition-colors cursor-pointer"
                        >
                          View Results
                        </button>
                      ) : closed ? (
                        <button disabled className="flex-1 py-2.5 rounded-[8px] text-[13px] font-semibold text-[#94a3b8] bg-[#f1f5f9] cursor-not-allowed">
                          Quiz Closed
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartClick(quiz)}
                          className="flex-1 py-2.5 rounded-[8px] text-[13px] font-semibold text-white bg-primary hover:opacity-90 transition-opacity cursor-pointer"
                        >
                          Take Quiz
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeQuizToUnlock && (
        <AccessCodeModal
          isOpen={Boolean(activeQuizToUnlock)}
          onClose={() => setActiveQuizToUnlock(null)}
          expectedCode={activeQuizToUnlock.access_code || ''}
          quizTitle={activeQuizToUnlock.title}
          onSuccess={handleUnlockSuccess}
        />
      )}
    </div>
  );
}
