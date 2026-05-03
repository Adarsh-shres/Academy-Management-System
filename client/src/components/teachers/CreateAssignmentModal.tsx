import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

/** Handles assignment creation, file upload, and assignment submission. */
export default function CreateAssignmentModal({ isOpen, onClose, onCreated }: CreateAssignmentModalProps) {
  const { user } = useAuth();

  const [courses, setCourses] = useState<{ id: string; name: string; course_code?: string }[]>([]);
  const [courseId, setCourseId] = useState('');

  const [allClasses, setAllClasses] = useState<{ id: string; name: string; course_id: string }[]>([]);
  const [classId, setClassId] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  const isToday = dueDate === minDate;
  const minTime = isToday ? today.toTimeString().slice(0, 5) : undefined;

  const isDateTimeInvalid = () => {
    if (!dueDate || !dueTime) return false;
    const selectedDateTime = new Date(`${dueDate}T${dueTime}`);
    return selectedDateTime <= new Date();
  };

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const resetForm = () => {
    setCourseId('');
    setClassId('');
    setTitle('');
    setDescription('');
    setDueDate('');
    setDueTime('');
    setFile(null);
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isOpen || !user?.id) return;

    resetForm();

    async function fetchClassesAndCourses() {
      setIsLoadingData(true);
      try {
        const { data, error: err } = await supabase
          .from('classes')
          .select(`
            id,
            name,
            course_id,
            courses (
              id,
              name,
              course_code
            )
          `)
          .eq('teacher_id', user.id);

        if (err) {
          console.error('Fetch error:', err.message);
        } else if (data) {
          const uniqueCourses = new Map();
          const fetchedClasses: { id: string; name: string; course_id: string }[] = [];

          data.forEach((cls: any) => {
            if (cls.courses) {
              const course = Array.isArray(cls.courses) ? cls.courses[0] : cls.courses;
              if (course && !uniqueCourses.has(course.id)) {
                uniqueCourses.set(course.id, course);
              }
              if (course) {
                fetchedClasses.push({ id: cls.id, name: cls.name, course_id: course.id });
              }
            }
          });

          const coursesList = Array.from(uniqueCourses.values());
          setCourses(coursesList);
          setAllClasses(fetchedClasses);

          if (coursesList.length > 0) {
            const firstCourseId = coursesList[0].id;
            setCourseId(firstCourseId);
            const initialClasses = fetchedClasses.filter(c => c.course_id === firstCourseId);
            if (initialClasses.length > 0) {
              setClassId(initialClasses[0].id);
            }
          } else {
            setCourseId('');
            setClassId('');
          }
        }
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchClassesAndCourses();
  }, [isOpen, user?.id]);

  const handleCourseChange = (newCourseId: string) => {
    setCourseId(newCourseId);
    const filteredClasses = allClasses.filter(c => c.course_id === newCourseId);
    if (filteredClasses.length > 0) {
      setClassId(filteredClasses[0].id);
    } else {
      setClassId('');
    }
  };

  if (!isOpen) return null;

  const handleFileUpload = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error: uploadError } = await supabase.storage
      .from('assignments')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = supabase.storage
      .from('assignments')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!courseId || !classId || !title || !description || !dueDate || !dueTime || !file) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedDateTime = new Date(`${dueDate}T${dueTime}`);
    if (selectedDateTime <= new Date()) {
      alert('Due date must be in the future');
      return;
    }

    setIsSubmitting(true);
    try {
      const fileUrl = await handleFileUpload(file);

      const { error: insertError } = await supabase
        .from('assignments')
        .insert({
          teacher_id: user?.id,
          course_id: courseId,
          class_id: classId,
          title: title,
          description: description,
          due_date: dueDate,
          due_time: dueTime,
          attachment_url: fileUrl,
          portal_open: true,
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      onCreated();
      onClose();
      resetForm();
    } catch (err: any) {
      console.error('Save error:', err.message);
      alert('Failed to save assignment: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClasses = allClasses.filter(c => c.course_id === courseId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { resetForm(); onClose(); }} />
      <div className="relative z-10 bg-white rounded-md w-full max-w-[500px] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-[#e7dff0] flex justify-between items-center bg-[#fbf8fe] rounded-t-md">
          <h3 className="text-[18px] font-bold text-[#4b3f68]">Create Assignment</h3>
          <button onClick={() => { resetForm(); onClose(); }} className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="p-5 overflow-y-auto w-full hide-scrollbar">
          <form id="assignment-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Course *</label>
              <select
                value={courseId}
                onChange={e => handleCourseChange(e.target.value)}
                className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                disabled={isLoadingData || courses.length === 0}
              >
                {isLoadingData && <option value="" disabled>Loading courses...</option>}
                {!isLoadingData && courses.length === 0 && <option value="" disabled>No courses assigned</option>}
                {!isLoadingData && courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Class *</label>
              <select
                value={classId}
                onChange={e => setClassId(e.target.value)}
                className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                disabled={!courseId || isLoadingData || filteredClasses.length === 0}
              >
                {!courseId && <option value="" disabled>Select a course first</option>}
                {courseId && isLoadingData && <option value="" disabled>Loading classes...</option>}
                {courseId && !isLoadingData && filteredClasses.length === 0 && <option value="" disabled>No classes found</option>}
                {courseId && !isLoadingData && filteredClasses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Title *</label>
              <input
                type="text"
                placeholder="E.g. Chapter 4 Exercises"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Description *</label>
              <textarea
                rows={3}
                placeholder="Instructions..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b] resize-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex gap-4">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Due Date *</label>
                  <input
                    type="date"
                    value={dueDate}
                    min={minDate}
                    onChange={e => setDueDate(e.target.value)}
                    className={`bg-[#f6f2fb] border rounded-sm px-4 py-2.5 text-[14px] w-full outline-none transition-all text-[#1e293b] ${
                      isDateTimeInvalid() 
                        ? 'border-red-500 focus:bg-white focus:ring-[3px] focus:ring-red-500/10' 
                        : 'border-transparent focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10'
                    }`}
                  />
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Due Time *</label>
                  <input
                    type="time"
                    value={dueTime}
                    min={minTime}
                    onChange={e => setDueTime(e.target.value)}
                    className={`bg-[#f6f2fb] border rounded-sm px-4 py-2.5 text-[14px] w-full outline-none transition-all text-[#1e293b] ${
                      isDateTimeInvalid() 
                        ? 'border-red-500 focus:bg-white focus:ring-[3px] focus:ring-red-500/10' 
                        : 'border-transparent focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10'
                    }`}
                  />
                </div>
              </div>
              {isDateTimeInvalid() && (
                <span className="text-red-500 text-[11px] font-semibold mt-1">Due date must be in the future</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Attachment File *</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const droppedFile = e.dataTransfer.files[0];
                  if (droppedFile) setFile(droppedFile);
                }}
                className={`border-2 border-dashed rounded-sm p-6 text-center cursor-pointer transition-all ${isDragging ? 'border-[#6a5182] bg-[#f3eff7]' : 'border-[#d8c8e9] hover:border-[#6a5182] hover:bg-[#fbf8fe]'}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const selected = e.target.files?.[0];
                    if (selected) setFile(selected);
                  }}
                />
                {file ? (
                  <div className="flex items-center justify-center gap-2 text-[#6a5182]">
                    <span className="text-[13px] font-semibold">{file.name}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="text-rose-400 hover:text-rose-600 font-bold ml-2"
                    >✕</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#94a3b8]">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span className="text-[13px] font-medium">
                      Click or drag file to upload
                    </span>
                    <span className="text-[11px]">PDF, DOC, DOCX supported</span>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-[#e7dff0] bg-[#fbf8fe] flex justify-end gap-3 rounded-b-md">
          <button
            type="button"
            onClick={() => { resetForm(); onClose(); }}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-white border border-[#e2d9ed] text-[#4b3f68] text-[13.5px] font-semibold rounded-sm hover:bg-[#f3eff7] transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="assignment-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold rounded-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
}

