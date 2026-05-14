import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AccessCodeModal from '../components/students/AccessCodeModal';

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
  title: string;
  description: string;
  time_limit_minutes: number;
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

export default function StudentClassDetailPage() {
  const { classId } = useParams<{ classId: string }>();
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, QuizSubmission>>({});
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [unlockedQuizzes, setUnlockedQuizzes] = useState<Set<string>>(new Set());
  
  const [activeQuizToUnlock, setActiveQuizToUnlock] = useState<Quiz | null>(null);
  const [activeQuizToTake, setActiveQuizToTake] = useState<Quiz | null>(null);
  const [showResults, setShowResults] = useState(false);
  
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizLoadError, setQuizLoadError] = useState('');

  // Use a ref for answers to ensure the timer auto-submit gets the latest state without being a dependency
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    async function loadData() {
      if (!classId) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);
      setQuizLoadError('');

      try {
        const { data: qData, error: qError } = await supabase
          .from('quizzes')
          .select('*, quiz_questions(*)')
          .eq('class_id', classId)
          .eq('is_published', true)
          .order('created_at', { ascending: false });
          
        if (qError) throw qError;
        setQuizzes(qData || []);
        
        const { data: subData, error: subError } = await supabase
          .from('quiz_submissions')
          .select('*')
          .eq('student_id', user.id);
          
        if (subError) throw subError;
        if (subData) {
          const subsMap = subData.reduce((acc, sub) => {
            acc[sub.quiz_id] = sub;
            return acc;
          }, {} as Record<string, QuizSubmission>);
          setSubmissions(subsMap);
        }
      } catch (err: any) {
        console.error('Failed to load quizzes', err);
        setQuizLoadError(err.message || 'Failed to load quizzes.');
        setQuizzes([]);
      }
    }
    
    loadData();
  }, [classId]);

  const handleStartClick = (quiz: Quiz) => {
    if (quiz.access_code && quiz.access_code.trim() !== '' && !unlockedQuizzes.has(quiz.id)) {
      setActiveQuizToUnlock(quiz);
    } else {
      startQuizNormally(quiz);
    }
  };

  const handleUnlockSuccess = () => {
    if (activeQuizToUnlock) {
      setUnlockedQuizzes(prev => {
        const newSet = new Set(prev);
        newSet.add(activeQuizToUnlock!.id);
        return newSet;
      });
      startQuizNormally(activeQuizToUnlock);
      setActiveQuizToUnlock(null);
    }
  };

  const startQuizNormally = (quiz: Quiz) => {
    setActiveQuizToTake(quiz);
    setAnswers({});
    setShowResults(false);
    if (quiz.time_limit_minutes > 0) {
      setTimeLeft(quiz.time_limit_minutes * 60);
    } else {
      setTimeLeft(0);
    }
  };

  const handleViewResults = (quiz: Quiz) => {
    setActiveQuizToTake(quiz);
    setShowResults(true);
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuizToTake || isSubmitting) return;
    setIsSubmitting(true);
    
    const questions = activeQuizToTake.quiz_questions || [];
    let score = 0;
    let totalMarks = 0;
    
    questions.forEach(q => {
      totalMarks += (q.marks || 1);
      if (answersRef.current[q.id] === q.correct_answer) {
        score += (q.marks || 1);
      }
    });
    
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const timeTaken = activeQuizToTake.time_limit_minutes ? (activeQuizToTake.time_limit_minutes * 60 - timeLeft) : 0;
    
    try {
      const { data, error } = await supabase
        .from('quiz_submissions')
        .insert({
          quiz_id: activeQuizToTake.id,
          student_id: currentUserId,
          answers: answersRef.current,
          score,
          total_marks: totalMarks,
          percentage,
          time_taken_seconds: timeTaken,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setSubmissions(prev => ({ ...prev, [activeQuizToTake.id]: data }));
      setShowResults(true);
    } catch (err) {
      console.error('Failed to submit quiz', err);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!activeQuizToTake || showResults || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [activeQuizToTake, showResults, timeLeft]);

  // View: Taking Quiz
  if (activeQuizToTake && !showResults) {
    const questions = activeQuizToTake.quiz_questions || [];
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col gap-6">
        <div className="flex justify-between items-center bg-white p-5 rounded-md border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] sticky top-0 z-10">
          <h1 className="text-xl font-bold text-[#4b3f68]">{activeQuizToTake.title}</h1>
          {activeQuizToTake.time_limit_minutes > 0 && (
            <div className="text-[#6a5182] font-extrabold flex items-center gap-2 bg-[#f6f2fb] px-4 py-2 rounded-md">
              <span>⏱</span>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-6 mt-2">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white p-7 rounded-md border border-[#e7dff0] shadow-sm">
              <p className="font-bold text-[#4b3f68] mb-5 text-lg"><span className="text-[#94a3b8] mr-2">{idx + 1}.</span> {q.question_text}</p>
              <div className="flex flex-col gap-3">
                {q.question_type === 'mcq' && q.options?.map((opt, optIdx) => (
                  <label key={optIdx} className="flex items-center gap-3 cursor-pointer p-3 border border-[#e7dff0] rounded-md hover:bg-[#fbf8fe] transition-colors">
                    <input 
                      type="radio" 
                      name={`q-${q.id}`} 
                      value={String(optIdx)} 
                      checked={answers[q.id] === String(optIdx)}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      className="w-4 h-4 accent-[#6a5182]"
                    />
                    <span className="text-[#4b3f68] font-medium">{opt}</span>
                  </label>
                ))}
                {q.question_type === 'true_false' && ['True', 'False'].map((opt) => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer p-3 border border-[#e7dff0] rounded-md hover:bg-[#fbf8fe] transition-colors">
                    <input 
                      type="radio" 
                      name={`q-${q.id}`} 
                      value={opt.toLowerCase()} 
                      checked={answers[q.id] === opt.toLowerCase()}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      className="w-4 h-4 accent-[#6a5182]"
                    />
                    <span className="text-[#4b3f68] font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <button 
          onClick={handleSubmitQuiz} 
          disabled={isSubmitting}
          className="self-end px-10 py-3.5 mt-4 bg-[#6a5182] text-white font-bold tracking-wide rounded-md hover:bg-[#5b4471] transition-all shadow-md disabled:opacity-50 uppercase"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </div>
    );
  }

  // View: Quiz Results
  if (activeQuizToTake && showResults) {
    const submission = submissions[activeQuizToTake.id];
    const questions = activeQuizToTake.quiz_questions || [];
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col gap-6">
        <button onClick={() => setActiveQuizToTake(null)} className="self-start text-[#6a5182] hover:text-[#4b3f68] font-bold text-sm tracking-wide">← BACK TO QUIZZES</button>
        
        <div className="bg-white p-8 rounded-md border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] flex flex-col items-center gap-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#6a5182] to-[#bca6cf]"></div>
          <h1 className="text-2xl font-bold text-[#4b3f68]">Results: {activeQuizToTake.title}</h1>
          <div className="flex items-end gap-2 mt-4">
            <p className="text-5xl font-extrabold text-[#6a5182] leading-none">{submission.percentage}%</p>
          </div>
          <p className="text-[#64748b] font-bold uppercase tracking-widest text-xs mt-2">Score: {submission.score} / {submission.total_marks}</p>
        </div>
        
        <div className="flex flex-col gap-6 mt-4">
          {questions.map((q, idx) => {
            const studentAnswer = submission.answers[q.id];
            const isCorrect = studentAnswer === q.correct_answer;
            return (
              <div key={q.id} className={`bg-white p-7 rounded-md border border-[#e7dff0] border-l-4 shadow-sm ${isCorrect ? 'border-l-[#16a34a]' : 'border-l-[#dc2626]'}`}>
                <div className="flex justify-between items-start gap-4 mb-5">
                  <p className="font-bold text-[#4b3f68] text-lg leading-snug"><span className="text-[#94a3b8] mr-1">{idx + 1}.</span> {q.question_text}</p>
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm shrink-0 ${isCorrect ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#fef2f2] text-[#dc2626]'}`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {q.question_type === 'mcq' && q.options?.map((opt, optIdx) => {
                    const isSelected = studentAnswer === String(optIdx);
                    const isActualCorrect = q.correct_answer === String(optIdx);
                    let style = "text-[#64748b] border-transparent";
                    let dotStyle = "border-gray-300";
                    if (isActualCorrect) {
                      style = "text-[#16a34a] font-bold bg-[#dcfce7]/50 border-[#bbf7d0]";
                      dotStyle = "border-[#16a34a] bg-[#16a34a]";
                    } else if (isSelected && !isActualCorrect) {
                      style = "text-[#dc2626] font-bold bg-[#fef2f2]/50 border-[#fecaca]";
                      dotStyle = "border-[#dc2626] bg-[#dc2626]";
                    } else if (isSelected) {
                      dotStyle = "border-[#4b3f68] bg-[#4b3f68]";
                    }
                    
                    return (
                      <div key={optIdx} className={`flex items-center gap-3 p-3 rounded-md border ${style}`}>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${dotStyle}`}>
                          {(isSelected || isActualCorrect) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="leading-snug">{opt}</span>
                      </div>
                    );
                  })}
                  {q.question_type === 'true_false' && ['True', 'False'].map((opt) => {
                    const optLower = opt.toLowerCase();
                    const isSelected = studentAnswer === optLower;
                    const isActualCorrect = q.correct_answer === optLower;
                    let style = "text-[#64748b] border-transparent";
                    let dotStyle = "border-gray-300";
                    if (isActualCorrect) {
                      style = "text-[#16a34a] font-bold bg-[#dcfce7]/50 border-[#bbf7d0]";
                      dotStyle = "border-[#16a34a] bg-[#16a34a]";
                    } else if (isSelected && !isActualCorrect) {
                      style = "text-[#dc2626] font-bold bg-[#fef2f2]/50 border-[#fecaca]";
                      dotStyle = "border-[#dc2626] bg-[#dc2626]";
                    } else if (isSelected) {
                      dotStyle = "border-[#4b3f68] bg-[#4b3f68]";
                    }
                    
                    return (
                      <div key={opt} className={`flex items-center gap-3 p-3 rounded-md border ${style}`}>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${dotStyle}`}>
                          {(isSelected || isActualCorrect) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="leading-snug">{opt}</span>
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

  // View: Main Listing
  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-[#4b3f68] tracking-tight">Class Quizzes</h1>
      
      {quizLoadError ? (
        <div className="bg-white rounded-md border border-[#fecaca] p-8 text-center">
          <p className="text-[#dc2626] font-semibold">Failed to load quizzes.</p>
          <p className="text-[13px] text-[#64748b] mt-2">{quizLoadError}</p>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white rounded-md border border-dashed border-[#e7dff0] p-12 text-center">
          <p className="text-[#94a3b8] font-semibold">No quizzes available for this class.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {quizzes.map(quiz => {
            const hasSubmitted = !!submissions[quiz.id];
            
            return (
              <div key={quiz.id} className="bg-white rounded-[10px] border border-[#e7dff0] p-6 shadow-[0_2px_12px_rgba(57,31,86,0.04)] hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                <div>
                  <h3 className="font-bold text-[#4b3f68] text-lg">{quiz.title}</h3>
                  {quiz.description && <p className="text-[13px] text-[#64748b] mt-1 line-clamp-2">{quiz.description}</p>}
                  <div className="flex gap-4 mt-3">
                    {quiz.time_limit_minutes > 0 && <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider bg-[#f8fafc] px-2 py-1 rounded-sm">⏱ {quiz.time_limit_minutes} min</span>}
                    {hasSubmitted && <span className="text-[11px] font-bold text-[#16a34a] uppercase tracking-wider bg-[#dcfce7] px-2 py-1 rounded-sm">✓ Submitted</span>}
                  </div>
                </div>
                {hasSubmitted ? (
                  <button 
                    onClick={() => handleViewResults(quiz)}
                    className="px-6 py-2.5 bg-[#f3eff7] text-[#6a5182] border border-[#d8c8e9] font-bold text-sm tracking-wide rounded-md hover:bg-[#e7dff0] transition-colors shrink-0 uppercase"
                  >
                    View Results
                  </button>
                ) : (
                  <button 
                    onClick={() => handleStartClick(quiz)}
                    className="px-6 py-2.5 bg-[#6a5182] text-white font-bold text-sm tracking-wide rounded-md hover:bg-[#5b4471] transition-colors shrink-0 uppercase shadow-sm"
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
