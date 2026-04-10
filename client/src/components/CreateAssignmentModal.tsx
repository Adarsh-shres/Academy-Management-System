import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateAssignmentModal({ isOpen, onClose, onCreated }: CreateAssignmentModalProps) {
  const { user } = useAuth();
  
  const [courses, setCourses] = useState<{ id: string; name: string; course_code?: string }[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [courseName, setCourseName] = useState('');
  
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [classId, setClassId] = useState('');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const resetForm = () => {
    setCourseName(courses.length > 0 ? courses[0].name : '');
    setClassId('');
    setTitle('');
    setDescription('');
    setDueDate('');
    setDueTime('');
    setFile(null);
    setError('');
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isOpen || !user) return;
    
    resetForm();

    async function fetchCourses() {
      if (!user?.name) {
        setCourses([]);
        return;
      }

      setIsLoadingCourses(true);
      try {
        const { data: coursesData, error: err } = await supabase
          .from('courses')
          .select('id, name, course_code')
          .eq('faculty_lead', user.name);

        if (err) {
          console.error('Courses fetch error:', err.message);
        } else {
          setCourses(coursesData || []);
          if (coursesData && coursesData.length > 0) {
            setCourseName(coursesData[0].name);
          }
        }
      } finally {
        setIsLoadingCourses(false);
      }
    }
    fetchCourses();
  }, [isOpen, user]);

  // Fetch classes when courseName changes
  useEffect(() => {
    async function fetchClasses() {
      const selectedCourse = courses.find(c => c.name === courseName);
      if (!selectedCourse?.id) {
        setClasses([]);
        setClassId('');
        return;
      }
      setIsLoadingClasses(true);
      const { data, error: err } = await supabase
        .from('classes')
        .select('id, name')
        .eq('course_id', selectedCourse.id);
        
      if (!err) {
        setClasses(data || []);
        if (data && data.length > 0) setClassId(data[0].id);
        else setClassId('');
      } else {
        console.error('Classes fetch error:', err.message);
        setClasses([]);
        setClassId('');
      }
      setIsLoadingClasses(false);
    }
    
    if (isOpen) {
      fetchClasses();
    }
  }, [courseName, courses, isOpen]);

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
    
    // Validate all fields
    if (!courseName || !classId || !title || !description || !dueDate || !dueTime || !file) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      // 1. Upload file first
      const fileUrl = await handleFileUpload(file);

      // 2. Combine date + time
      const combined = new Date(`${dueDate}T${dueTime}:00`).toISOString();

      const selectedCourse = courses.find(c => c.name === courseName);
      // 3. Insert assignment
      const { error: insertError } = await supabase
        .from('assignments')
        .insert({
          teacher_id: user?.id,
          course_id: selectedCourse?.id,
          class_id: classId,
          title: title,
          description: description,
          due_date: combined,
          file_url: fileUrl,
          type: 'assignment',
          status: 'active',
          portal_open: false,
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      // 4. Reset and close
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { resetForm(); onClose(); }} />
      <div className="relative z-10 bg-white rounded-md w-full max-w-[500px] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-[#e7dff0] flex justify-between items-center bg-[#fbf8fe] rounded-t-md">
          <h3 className="text-[18px] font-bold text-[#4b3f68]">Create Assignment</h3>
          <button onClick={() => { resetForm(); onClose(); }} className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="p-5 overflow-y-auto w-full hide-scrollbar">
          <form id="assignment-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Course *</label>
              <select 
                value={courseName}
                onChange={e => setCourseName(e.target.value)}
                className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                disabled={isLoadingCourses || courses.length === 0}
              >
                {isLoadingCourses && <option value="" disabled>Loading courses...</option>}
                {!isLoadingCourses && courses.length === 0 && <option value="" disabled>No courses assigned</option>}
                {!isLoadingCourses && courses.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Class *</label>
              <select 
                value={classId}
                onChange={e => setClassId(e.target.value)}
                className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                disabled={!courseName || isLoadingClasses || classes.length === 0}
              >
                {!courseName && <option value="" disabled>Select a course first</option>}
                {courseName && isLoadingClasses && <option value="" disabled>Loading classes...</option>}
                {courseName && !isLoadingClasses && classes.length === 0 && <option value="" disabled>No classes found</option>}
                {courseName && !isLoadingClasses && classes.map(c => (
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

            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Due Date *</label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Due Time *</label>
                <input 
                  type="time" 
                  value={dueTime}
                  onChange={e => setDueTime(e.target.value)}
                  className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                />
              </div>
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
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
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
