import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import AccessCodeModal from '../components/students/AccessCodeModal';
import { CardGridPageSkeleton } from '../components/skeletons/PageSkeletons';

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
  title: string;
  description: string | null;
  due_date: string | null;
  time_limit_minutes: number | null;
  access_code: string | null;
  created_at: string;
  quiz_questions?: QuizQuestion[];
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

interface ClassMeta {
  className: string;
  courseName: string;
  courseCode: string;
}

export default function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [classMeta, setClassMeta] = useState<Record<string, ClassMeta>>({});
  const [submissions, setSubmissions] = useState<Record<string, QuizSubmission>>({});
  const [currentUserId, setCurrentUserId] = useState('');
  const [unlockedQuizzes, setUnlockedQuizzes] = useState<Set<string>>(new Set());
  const [activeQuizToUnlock, setActiveQuizToUnlock] = useState<Quiz | null>(null);
  const [activeQuizToTake, setActiveQuizToTake] = useState<Quiz | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const answersRef = useRef(answers);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const sortedQuestions = useMemo(() => {
    return [...(activeQuizToTake?.quiz_questions || [])].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  }, [activeQuizToTake]);

  useEffect(() => {
    async function loadQuizzes() {
      setIsLoading(true);
      setError(null);

      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        const user = authData.user;
        if (!user) {
          setQuizzes([]);
          setSubmissions({});
          return;
        }

        setCurrentUserId(user.id);

        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*, quiz_questions(*)')
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (quizError) throw quizError;

        const visibleQuizzes = quizData || [];
        const visibleQuizClassIds = Array.from(new Set(
          visibleQuizzes.map((quiz: Quiz) => quiz.class_id).filter(Boolean),
        ));

        let enrolledClasses: any[] = [];
        if (visibleQuizClassIds.length > 0) {
          const { data: classesData, error: classesError } = await supabase
            .from('classes')
            .select('id, name, course_id')
            .in('id', visibleQuizClassIds);

          if (classesError) {
            console.warn('Failed to load quiz class metadata', classesError);
          } else {
            enrolledClasses = classesData || [];
          }
        }

        const courseIds = Array.from(new Set(enrolledClasses.map((cls: any) => cls.course_id).filter(Boolean)));
        const courseMap = new Map<string, any>();

        if (courseIds.length > 0) {
          const { data: coursesData, error: coursesError } = await supabase
            .from('courses')
            .select('id, name, course_code')
            .in('id', courseIds);

          if (coursesError) {
            console.warn('Failed to load quiz course metadata', coursesError);
          } else {
            (coursesData || []).forEach((course: any) => courseMap.set(course.id, course));
          }
        }

        const nextClassMeta = enrolledClasses.reduce((acc: Record<string, ClassMeta>, cls: any) => {
          const course = courseMap.get(cls.course_id);
          acc[cls.id] = {
            className: cls.name || 'Unknown Class',
            courseName: course?.name || 'Unknown Course',
            courseCode: course?.course_code || '---',
          };
          return acc;
        }, {});

        const { data: submissionData, error: submissionError } = await supabase
          .from('quiz_submissions')
          .select('*')
          .eq('student_id', user.id);

        if (submissionError) throw submissionError;

        setClassMeta(nextClassMeta);
        setQuizzes(visibleQuizzes);
        setSubmissions((submissionData || []).reduce((acc: Record<string, QuizSubmission>, sub: QuizSubmission) => {
          acc[sub.quiz_id] = sub;
          return acc;
        }, {}));
      } catch (err: any) {
        console.error('Failed to load student quizzes', err);
        setError(err.message || 'Failed to load quizzes.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadQuizzes();
  }, []);

  const startQuiz = (quiz: Quiz) => {
    setActiveQuizToTake(quiz);
    setAnswers({});
    setShowResults(false);
    setTimeLeft((quiz.time_limit_minutes || 0) > 0 ? (quiz.time_limit_minutes || 0) * 60 : 0);
  };

  const handleStartClick = (quiz: Quiz) => {
    if (quiz.access_code?.trim() && !unlockedQuizzes.has(quiz.id)) {
      setActiveQuizToUnlock(quiz);
      return;
    }

    startQuiz(quiz);
  };

  const handleUnlockSuccess = () => {
    if (!activeQuizToUnlock) return;

    setUnlockedQuizzes((prev) => {
      const next = new Set(prev);
      next.add(activeQuizToUnlock.id);
      return next;
    });
    startQuiz(activeQuizToUnlock);
    setActiveQuizToUnlock(null);
  };

  const handleViewResults = (quiz: Quiz) => {
    setActiveQuizToTake(quiz);
    setShowResults(true);
  };

  const handleSubmitQuiz = useCallback(async () => {
    if (!activeQuizToTake || !currentUserId || isSubmitting) return;

    setIsSubmitting(true);
    const questions = activeQuizToTake.quiz_questions || [];
    let score = 0;
    let totalMarks = 0;

    questions.forEach((question) => {
      const marks = question.marks || 1;
      totalMarks += marks;
      if (answersRef.current[question.id] === question.correct_answer) {
        score += marks;
      }
    });

    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const timeLimit = activeQuizToTake.time_limit_minutes || 0;
    const timeTaken = timeLimit > 0 ? Math.max(0, timeLimit * 60 - timeLeft) : 0;

    try {
      const { data, error: insertError } = await supabase
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

      if (insertError) throw insertError;

      setSubmissions((prev) => ({ ...prev, [activeQuizToTake.id]: data }));
      setShowResults(true);
    } catch (err: any) {
      console.error('Failed to submit quiz', err);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [activeQuizToTake, currentUserId, isSubmitting, timeLeft]);

  useEffect(() => {
    if (!activeQuizToTake || showResults || timeLeft <= 0) return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
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
    return (
      <div className="flex flex-col gap-6 pb-10 flex-1 min-w-0 max-w-[900px] mx-auto w-full">
        <div className="sticky top-0 z-10 bg-white border border-[#e7dff0] rounded-[10px] p-5 shadow-[0_10px_28px_rgba(57,31,86,0.06)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-sans text-[22px] font-bold text-[#4b3f68] tracking-tight">{activeQuizToTake.title}</h1>
            <p className="text-[13px] text-[#7c8697] mt-1">
              {sortedQuestions.length} question{sortedQuestions.length !== 1 ? 's' : ''}
            </p>
          </div>
          {(activeQuizToTake.time_limit_minutes || 0) > 0 && (
            <div className="text-[#6a5182] font-extrabold bg-[#f6f2fb] px-4 py-2 rounded-[8px] border border-[#e7dff0]">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          {sortedQuestions.map((question, index) => (
            <div key={question.id} className="bg-white p-6 rounded-[10px] border border-[#e7dff0] shadow-sm">
              <p className="font-bold text-[#4b3f68] mb-5 text-[16px] leading-snug">
                <span className="text-[#94a3b8] mr-2">{index + 1}.</span>
                {question.question_text}
              </p>
              <div className="flex flex-col gap-3">
                {question.question_type === 'mcq' && question.options?.map((option, optionIndex) => (
                  <label key={optionIndex} className="flex items-center gap-3 cursor-pointer p-3 border border-[#e7dff0] rounded-[8px] hover:bg-[#fbf8fe] transition-colors">
                    <input
                      type="radio"
                      name={`q-${question.id}`}
                      value={String(optionIndex)}
                      checked={answers[question.id] === String(optionIndex)}
                      onChange={(event) => setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))}
                      className="w-4 h-4 accent-[#6a5182]"
                    />
                    <span className="text-[#4b3f68] font-medium">{option}</span>
                  </label>
                ))}
                {question.question_type === 'true_false' && ['True', 'False'].map((option) => (
                  <label key={option} className="flex items-center gap-3 cursor-pointer p-3 border border-[#e7dff0] rounded-[8px] hover:bg-[#fbf8fe] transition-colors">
                    <input
                      type="radio"
                      name={`q-${question.id}`}
                      value={option.toLowerCase()}
                      checked={answers[question.id] === option.toLowerCase()}
                      onChange={(event) => setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))}
                      className="w-4 h-4 accent-[#6a5182]"
                    />
                    <span className="text-[#4b3f68] font-medium">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={() => setActiveQuizToTake(null)}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-[8px] text-[13px] font-semibold text-[#4b3f68] bg-white border border-[#e2d9ed] hover:bg-[#f3eff7] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitQuiz}
            disabled={isSubmitting}
            className="px-8 py-3 rounded-[8px] text-[13px] font-semibold text-white bg-primary hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </div>
    );
  }

  if (activeQuizToTake && showResults) {
    const submission = submissions[activeQuizToTake.id];

    return (
      <div className="flex flex-col gap-6 pb-10 flex-1 min-w-0 max-w-[900px] mx-auto w-full">
        <button onClick={() => setActiveQuizToTake(null)} className="self-start text-[#6a5182] hover:text-[#4b3f68] font-bold text-[13px] tracking-wide">
          Back to quizzes
        </button>

        {submission && (
          <>
            <div className="bg-white p-7 rounded-[10px] border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] text-center">
              <h1 className="font-sans text-[24px] font-bold text-[#4b3f68] tracking-tight">Results: {activeQuizToTake.title}</h1>
              <p className="text-[48px] font-extrabold text-[#6a5182] leading-none mt-5">{submission.percentage}%</p>
              <p className="text-[#64748b] font-bold uppercase tracking-widest text-[12px] mt-3">
                Score: {submission.score} / {submission.total_marks}
              </p>
            </div>

            <div className="flex flex-col gap-5">
              {sortedQuestions.map((question, index) => {
                const studentAnswer = submission.answers[question.id];
                const isCorrect = studentAnswer === question.correct_answer;

                return (
                  <div key={question.id} className={`bg-white p-6 rounded-[10px] border border-[#e7dff0] border-l-4 shadow-sm ${isCorrect ? 'border-l-[#16a34a]' : 'border-l-[#dc2626]'}`}>
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <p className="font-bold text-[#4b3f68] text-[16px] leading-snug">
                        <span className="text-[#94a3b8] mr-1">{index + 1}.</span>
                        {question.question_text}
                      </p>
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-[6px] shrink-0 ${isCorrect ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#fef2f2] text-[#dc2626]'}`}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {(question.question_type === 'mcq' ? question.options || [] : ['True', 'False']).map((option, optionIndex) => {
                        const answerValue = question.question_type === 'mcq' ? String(optionIndex) : option.toLowerCase();
                        const isSelected = studentAnswer === answerValue;
                        const isActualCorrect = question.correct_answer === answerValue;
                        const style = isActualCorrect
                          ? 'text-[#16a34a] font-bold bg-[#dcfce7]/50 border-[#bbf7d0]'
                          : isSelected
                            ? 'text-[#dc2626] font-bold bg-[#fef2f2]/50 border-[#fecaca]'
                            : 'text-[#64748b] border-[#f1f5f9]';

                        return (
                          <div key={`${question.id}-${answerValue}`} className={`flex items-center gap-3 p-3 rounded-[8px] border ${style}`}>
                            <span className="leading-snug">{option}</span>
                            {isActualCorrect && <span className="ml-auto text-[11px] uppercase tracking-wide">Answer</span>}
                            {isSelected && !isActualCorrect && <span className="ml-auto text-[11px] uppercase tracking-wide">Your pick</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10 flex-1 min-w-0 max-w-[1100px] mx-auto w-full">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="font-sans text-[26px] md:text-[28px] font-bold text-[#4b3f68] tracking-tight">Quizzes</h1>
          <p className="text-[14px] text-[#7c8697] mt-1">{quizzes.length} published quiz{quizzes.length !== 1 ? 'zes' : ''}</p>
        </div>
      </div>

      {isLoading ? (
        <CardGridPageSkeleton cards={4} />
      ) : error ? (
        <div className="flex h-[240px] items-center justify-center text-[#4b3f68] font-semibold">{error}</div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white rounded-[10px] border border-dashed border-[#e7dff0] p-12 text-center">
          <p className="text-[13px] font-semibold text-[#7c8697] uppercase tracking-wider">No quizzes available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {quizzes.map((quiz) => {
            const meta = classMeta[quiz.class_id];
            const hasSubmitted = !!submissions[quiz.id];

            return (
              <div key={quiz.id} className="bg-white rounded-[10px] border border-[#e7dff0] p-5 shadow-[0_2px_12px_rgba(57,31,86,0.04)] hover:shadow-[0_8px_24px_rgba(57,31,86,0.08)] transition-all flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-sans text-[16px] font-semibold text-[#4b3f68] leading-tight tracking-tight">{quiz.title}</h3>
                    <p className="text-[12px] font-medium text-[#7c8697] mt-2">
                      {meta?.courseName || 'Unknown Course'} / {meta?.className || 'Unknown Class'}
                    </p>
                    <p className="text-[11px] font-semibold text-primary mt-1">{meta?.courseCode || '---'}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-[2px] uppercase tracking-wide rounded-full border shrink-0 ${hasSubmitted ? 'text-primary bg-[#f3eff7] border-[#e7dff0]' : 'text-[#4b3f68] bg-[#faf8fc] border-[#e2d9ed]'}`}>
                    {hasSubmitted ? 'Submitted' : 'Open'}
                  </span>
                </div>

                {quiz.description && <p className="text-[13px] text-[#64748b] line-clamp-2">{quiz.description}</p>}

                <div className="flex flex-wrap gap-2">
                  {(quiz.time_limit_minutes || 0) > 0 && (
                    <span className="text-[11px] font-semibold text-[#64748b] bg-[#f8fafc] px-2 py-1 rounded-[6px] border border-[#e2e8f0]">
                      {quiz.time_limit_minutes} min
                    </span>
                  )}
                  {quiz.due_date && (
                    <span className="text-[11px] font-semibold text-[#64748b] bg-[#f8fafc] px-2 py-1 rounded-[6px] border border-[#e2e8f0]">
                      Due {new Date(quiz.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                  <span className="text-[11px] font-semibold text-[#64748b] bg-[#f8fafc] px-2 py-1 rounded-[6px] border border-[#e2e8f0]">
                    {(quiz.quiz_questions || []).length} question{(quiz.quiz_questions || []).length !== 1 ? 's' : ''}
                  </span>
                </div>

                {hasSubmitted ? (
                  <button
                    onClick={() => handleViewResults(quiz)}
                    className="w-full py-3 rounded-[8px] text-[13px] font-semibold text-primary bg-[#f3eff7] hover:bg-[#e7dff0] transition-colors uppercase tracking-wider"
                  >
                    View Results
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartClick(quiz)}
                    className="w-full py-3 rounded-[8px] text-[13px] font-semibold text-white bg-primary hover:opacity-90 transition-opacity uppercase tracking-wider"
                  >
                    Start Quiz
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeQuizToUnlock && (
        <AccessCodeModal
          isOpen={!!activeQuizToUnlock}
          onClose={() => setActiveQuizToUnlock(null)}
          expectedCode={activeQuizToUnlock.access_code || ''}
          quizTitle={activeQuizToUnlock.title}
          onSuccess={handleUnlockSuccess}
        />
      )}
    </div>
  );
}
