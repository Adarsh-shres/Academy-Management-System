import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, ChevronDown, ChevronRight, FileText, Video, Users, File } from '../shared/icons';

const MOCK_WEEKS: Week[] = [
  {
    id: 'Week 1: Introduction',
    title: 'Week 1: Introduction',
    items: [
      { id: 'c1', title: 'Course Syllabus', type: 'Study Material', fileName: 'syllabus.pdf' },
      { id: 'c2', title: 'Introductory Lecture', type: 'Lecture', description: 'Overview of the course and objectives.' }
    ]
  },
  {
    id: 'Week 2: Fundamentals',
    title: 'Week 2: Fundamentals',
    items: [
      { id: 'c3', title: 'Chapter 1 Readings', type: 'Study Material', fileName: 'chapter1.pdf' },
      { id: 'c4', title: 'Discussion Workshop', type: 'Workshop' }
    ]
  }
];

interface ContentItem {
  id: string;
  title: string;
  type: 'Lecture' | 'Tutorial' | 'Workshop' | 'Study Material';
  description?: string;
  fileUrl?: string;
  fileName?: string;
  week_number?: string | number;
}

interface Week {
  id: string;
  title: string;
  items: ContentItem[];
}

interface TeacherContentTabProps {
  classId?: string;
  teacherId?: string;
}

/** Manages weekly course materials for a teacher's class. */
export default function TeacherContentTab({ classId, teacherId }: TeacherContentTabProps) {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  const [isAddWeekOpen, setIsAddWeekOpen] = useState(false);
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [deleteWeekId, setDeleteWeekId] = useState<string | null>(null);
  const [deleteContentId, setDeleteContentId] = useState<{weekId: string, contentId: string} | null>(null);

  const [newWeekTitle, setNewWeekTitle] = useState('');
  const [activeWeekId, setActiveWeekId] = useState<string | null>(null);
  
  const [contentTitle, setContentTitle] = useState('');
  const [contentType, setContentType] = useState<'Lecture' | 'Tutorial' | 'Workshop' | 'Study Material'>('Lecture');
  const [contentDesc, setContentDesc] = useState('');
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [contentFileError, setContentFileError] = useState('');

  const loadContent = async () => {
    if (!classId) return;
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('assignments')
        .select('*')
        .eq('class_id', classId)
        .in('type', ['lecture', 'tutorial', 'workshop', 'study_material'])
        .order('created_at', { ascending: true });

      if (data) {
        const weeksMap: Record<string, Week> = {};
        
        data.forEach((item: any) => {
          const wKey = item.week_number ? String(item.week_number) : 'Uncategorized Week';
          if (!weeksMap[wKey]) {
             weeksMap[wKey] = {
               id: wKey,
               title: wKey,
               items: []
             };
          }
          let mappedType = 'Study Material';
          if (item.type === 'lecture') mappedType = 'Lecture';
          if (item.type === 'tutorial') mappedType = 'Tutorial';
          if (item.type === 'workshop') mappedType = 'Workshop';

          weeksMap[wKey].items.push({
             id: item.id,
             title: item.title,
             type: mappedType as any,
             description: item.description,
             fileUrl: item.attachment_url,
             fileName: item.attachment_url?.split('/').pop() || '',
             week_number: item.week_number
          });
        });

        const mergedWeeks = [...weeks];
        
        if (Object.keys(weeksMap).length === 0 && weeks.length === 0) {
           setWeeks(MOCK_WEEKS);
        } else {
           Object.values(weeksMap).forEach(fetchedWeek => {
              const existingIdx = mergedWeeks.findIndex(w => w.title === fetchedWeek.title);
              if (existingIdx >= 0) {
                 mergedWeeks[existingIdx].items = fetchedWeek.items;
              } else {
                 mergedWeeks.push(fetchedWeek);
              }
           });
           setWeeks(mergedWeeks);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [classId]);

  const toggleWeek = (weekId: string) => {
    setExpandedWeeks(prev => ({ ...prev, [weekId]: !prev[weekId] }));
  };

  const handleAddWeek = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeekTitle.trim()) return;
    const newWeek: Week = {
      id: newWeekTitle.trim(),
      title: newWeekTitle.trim(),
      items: []
    };
    if (weeks.find(w => w.title === newWeek.title)) return;
    setWeeks([...weeks, newWeek]);
    setExpandedWeeks({ ...expandedWeeks, [newWeek.id]: true });
    setIsAddWeekOpen(false);
    setNewWeekTitle('');
  };

  const handleFileUpload = async (fileToUpload: File): Promise<string> => {
    const fileNameSafe = `${Date.now()}_${fileToUpload.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { data, error } = await supabase.storage
      .from('assignments')
      .upload(fileNameSafe, fileToUpload, { upsert: true });
    
    if (error) throw new Error(error.message);
    
    const { data: urlData } = supabase.storage
      .from('assignments')
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  };

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentTitle.trim() || !activeWeekId || !classId) return;
    
    setIsLoading(true);
    try {
       let publicUrl = undefined;
       if (contentFile) {
         publicUrl = await handleFileUpload(contentFile);
       }

       let dbType = 'study_material';
       if (contentType === 'Lecture') dbType = 'lecture';
       if (contentType === 'Tutorial') dbType = 'tutorial';
       if (contentType === 'Workshop') dbType = 'workshop';

       const { error } = await supabase.from('assignments').insert({
         class_id: classId,
         teacher_id: teacherId,
         title: contentTitle,
         description: contentDesc,
         type: dbType,
         week_number: activeWeekId,
         attachment_url: publicUrl,
         portal_open: false,
         due_date: null,
         due_time: null
       });
       
       if (error) throw error;
       await loadContent();
    } catch (err: any) {
       console.error(err);
       alert("Failed to insert material: " + err.message);
    } finally {
      setIsLoading(false);
      setIsAddContentOpen(false);
      setContentTitle('');
      setContentType('Lecture');
      setContentDesc('');
      setContentFile(null);
      setContentFileError('');
      setActiveWeekId(null);
    }
  };

  const handleDeleteWeek = () => {
    if (!deleteWeekId) return;
    setWeeks(weeks.filter(w => w.id !== deleteWeekId));
    // Empty weeks are local-only until a dedicated weeks table exists.
    setDeleteWeekId(null);
  };

  const handleDeleteContent = async () => {
    if (!deleteContentId) return;
    try {
      await supabase.from('assignments').delete().eq('id', deleteContentId.contentId);
      await loadContent();
    } catch (err: any) {
      alert("Failed to delete content");
    } finally {
      setDeleteContentId(null);
    }
  };

  const openAddContentModal = (weekId: string) => {
    setActiveWeekId(weekId);
    setContentFile(null);
    setContentFileError('');
    setIsAddContentOpen(true);
  };

  const handleItemClick = (item: ContentItem) => {
    if (!item.fileUrl || !item.fileName) return;

    const ext = item.fileName.split('.').pop()?.toLowerCase();
    
    if (ext === 'pdf') {
      window.open(item.fileUrl, '_blank');
    } else {
      const a = document.createElement('a');
      a.href = item.fileUrl;
      a.download = item.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return <FileText size={16} className="text-red-500 shrink-0" />;
      case 'doc':
      case 'docx': return <FileText size={16} className="text-blue-500 shrink-0" />;
      case 'ppt':
      case 'pptx': return <FileText size={16} className="text-orange-500 shrink-0" />;
      case 'xls':
      case 'xlsx': return <FileText size={16} className="text-green-500 shrink-0" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return <FileText size={16} className="text-purple-500 shrink-0" />;
      case 'zip': return <FileText size={16} className="text-gray-500 shrink-0" />;
      default: return <FileText size={16} className="text-[#64748b] shrink-0" />;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContentFileError('');
    const file = e.target.files?.[0];
    if (!file) {
      setContentFile(null);
      return;
    }
    
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const blockedExts = ['mp4', 'mp3', 'wav', 'avi', 'mov', 'mkv', 'ogg', 'webm'];
    
    if (blockedExts.includes(ext) || file.type.startsWith('video/') || file.type.startsWith('audio/')) {
      setContentFileError("Video and audio files are not allowed.");
      setContentFile(null);
      e.target.value = '';
      return;
    }
    
    setContentFile(file);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Lecture': return <Video size={16} />;
      case 'Tutorial': return <Users size={16} />;
      case 'Workshop': return <Users size={16} />;
      case 'Study Material': return <File size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'Lecture': return 'bg-[#e0f2fe] text-[#0284c7] border-[#bae6fd]';
      case 'Tutorial': return 'bg-[#fce7f3] text-[#db2777] border-[#fbcfe8]';
      case 'Workshop': return 'bg-[#fef3c7] text-[#d97706] border-[#fde68a]';
      case 'Study Material': return 'bg-[#dcfce7] text-[#16a34a] border-[#bbf7d0]';
      default: return 'bg-[#f3eff7] text-[#6a5182] border-[#d8c8e9]';
    }
  };

  return (
    <div className="bg-white rounded-md border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] p-6 md:p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6 border-b border-[#e7dff0] pb-4">
        <div>
          <h3 className="text-[18px] font-extrabold text-[#4b3f68]">Course Content</h3>
          <p className="text-[13px] text-[#64748b] mt-1">Organize and manage your class materials by week</p>
        </div>
        <button 
          onClick={() => setIsAddWeekOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13px] font-bold tracking-wide rounded-sm transition-all uppercase"
        >
          <Plus size={16} /> Add Week
        </button>
      </div>

      <div className="space-y-4">
        {isLoading && weeks.length === 0 ? (
          <div className="py-16 flex justify-center items-center rounded-md bg-[#fbf8fe]">
            <p className="text-[13px] font-bold text-[#94a3b8] animate-pulse">Loading content packages...</p>
          </div>
        ) : weeks.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-[#e7dff0] rounded-md bg-[#fbf8fe]">
            <FileText size={32} className="text-[#cbd5e1] mx-auto mb-3" />
            <p className="text-[14px] font-semibold text-[#4b3f68]">No Content Found</p>
            <p className="text-[13px] text-[#64748b] mt-1">Add your first week to start organizing course materials.</p>
          </div>
        ) : (
          weeks.map(week => (
            <div key={week.id} className="border border-[#e7dff0] rounded-md overflow-hidden bg-white">
              <div 
                className="bg-[#fbf8fe] p-4 flex items-center justify-between cursor-pointer hover:bg-[#f3eff7] transition-colors"
                onClick={() => toggleWeek(week.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-[#6a5182]">
                    {expandedWeeks[week.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                  <h4 className="text-[15px] font-bold text-[#4b3f68]">{week.title}</h4>
                  <span className="text-[12px] font-medium text-[#64748b] bg-[#e2e8f0] px-2 py-0.5 rounded-full">
                    {week.items.length} items
                  </span>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={() => openAddContentModal(week.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#d8c8e9] text-[#6a5182] hover:bg-[#f3eff7] text-[11px] font-bold tracking-wider rounded-sm transition-colors uppercase shadow-sm cursor-pointer"
                  >
                    <Plus size={14} /> Add Material
                  </button>
                  <button 
                    onClick={() => setDeleteWeekId(week.id)}
                    className="p-1.5 text-[#ef4444] hover:bg-[#fee2e2] rounded-sm transition-colors cursor-pointer"
                    title="Delete Week"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {expandedWeeks[week.id] && (
                <div className="p-4 bg-white border-t border-[#e7dff0]">
                  {week.items.length === 0 ? (
                    <p className="text-center text-[#94a3b8] text-[13px] py-4 italic">No content added for this week yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {week.items.map(item => (
                        <div 
                          key={item.id} 
                          onClick={() => handleItemClick(item)}
                          className={`flex gap-4 p-3 border border-[#f1f5f9] rounded-sm bg-[#f8fafc] hover:border-[#e2e8f0] transition-colors group ${item.fileUrl ? 'cursor-pointer hover:shadow-sm' : ''}`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${getTypeColor(item.type).split(' ').filter(c => c.startsWith('bg-') || c.startsWith('text-') || c.startsWith('border-')).join(' ')}`}>
                            {getTypeIcon(item.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h5 className="text-[14px] font-bold text-[#334155] flex items-center gap-2">
                                  {item.title}
                                  {item.fileName && getFileIcon(item.fileName)}
                                </h5>
                                <span className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-sm ${getTypeColor(item.type)}`}>
                                  {item.type}
                                </span>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteContentId({ weekId: week.id, contentId: item.id });
                                }}
                                className="p-1.5 text-[#ef4444] opacity-0 group-hover:opacity-100 hover:bg-[#fee2e2] rounded-sm transition-all shrink-0 cursor-pointer"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                            {item.description && (
                              <p className="text-[13px] text-[#64748b] mt-2 leading-relaxed">{item.description}</p>
                            )}
                            {item.fileName && (
                              <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0284c7] mt-2 group-hover:underline">
                                Attached: {item.fileName}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {isAddWeekOpen && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4">
          <form onSubmit={handleAddWeek} className="bg-white rounded-md max-w-md w-full shadow-2xl overflow-hidden animate-fade-in border border-[#e7dff0]">
            <div className="px-6 py-4 border-b border-[#e7dff0] bg-[#fbf8fe] flex justify-between items-center">
              <h3 className="text-[15px] font-extrabold text-[#4b3f68]">Add New Week</h3>
              <button type="button" onClick={() => setIsAddWeekOpen(false)} className="text-[#94a3b8] hover:text-[#4b3f68]">✕</button>
            </div>
            <div className="p-6">
              <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-wider mb-2">Week Title *</label>
              <input 
                type="text" 
                autoFocus
                required
                placeholder="E.g. Week 1: Introduction"
                value={newWeekTitle}
                onChange={e => setNewWeekTitle(e.target.value)}
                className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b] font-medium"
              />
            </div>
            <div className="px-6 py-4 border-t border-[#e7dff0] bg-[#fbf8fe] flex justify-end gap-3">
              <button type="button" onClick={() => setIsAddWeekOpen(false)} className="px-4 py-2 text-[13px] font-bold text-[#64748b] hover:text-[#4b3f68] transition-colors uppercase">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13px] font-bold tracking-wide rounded-sm transition-all uppercase">Add Week</button>
            </div>
          </form>
        </div>
      )}

      {isAddContentOpen && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4">
          <form onSubmit={handleAddContent} className="bg-white rounded-md max-w-lg w-full shadow-2xl overflow-hidden animate-fade-in border border-[#e7dff0]">
            <div className="px-6 py-4 border-b border-[#e7dff0] bg-[#fbf8fe] flex justify-between items-center">
              <h3 className="text-[15px] font-extrabold text-[#4b3f68]">Add Content Material</h3>
              <button type="button" onClick={() => setIsAddContentOpen(false)} className="text-[#94a3b8] hover:text-[#4b3f68]">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-wider mb-2">Title *</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  placeholder="E.g. Introduction Slides"
                  value={contentTitle}
                  onChange={e => setContentTitle(e.target.value)}
                  className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b] font-medium"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-wider mb-2">Content Type *</label>
                <select 
                  value={contentType}
                  onChange={e => setContentType(e.target.value as any)}
                  className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b] font-medium appearance-none"
                >
                  <option value="Lecture">Lecture</option>
                  <option value="Tutorial">Tutorial</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Study Material">Study Material</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-wider mb-2">Description (Optional)</label>
                <textarea 
                  rows={3}
                  placeholder="Brief context about this material..."
                  value={contentDesc}
                  onChange={e => setContentDesc(e.target.value)}
                  className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b] resize-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-wider mb-2">Upload File (Optional)</label>
                <div className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-2.5 w-full transition-all text-[#1e293b] font-medium focus-within:bg-white focus-within:border-[#6a5182] focus-within:ring-[3px] focus-within:ring-[#6a5182]/10">
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.zip"
                    className="text-[13px] w-full file:mr-4 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-[12px] file:font-semibold file:bg-[#6a5182] file:text-white hover:file:bg-[#5b4471] file:cursor-pointer file:transition-colors"
                  />
                </div>
                {contentFileError && (
                  <p className="text-red-500 text-[12px] font-bold mt-1.5">{contentFileError}</p>
                )}
                <p className="text-[#64748b] text-[11px] mt-1.5 leading-relaxed font-medium">
                  Accepted: PDF, Word, PowerPoint, Excel, Images, ZIP. No video or audio.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#e7dff0] bg-[#fbf8fe] flex justify-end gap-3">
              <button type="button" onClick={() => setIsAddContentOpen(false)} className="px-4 py-2 text-[13px] font-bold text-[#64748b] hover:text-[#4b3f68] transition-colors uppercase">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13px] font-bold tracking-wide rounded-sm transition-all uppercase">Save Content</button>
            </div>
          </form>
        </div>
      )}

      {deleteWeekId && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-sm w-full shadow-2xl p-6 border border-[#e7dff0] animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            <h3 className="text-[16px] font-extrabold text-[#1e293b] mb-2 flex items-center gap-2">
              <Trash2 size={18} className="text-red-500" /> Delete Week?
            </h3>
            <p className="text-[13.5px] text-[#64748b] mb-6">
              Are you sure you want to delete this week and <strong className="text-[#334155]">all its contents</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteWeekId(null)} className="px-4 py-2 text-[13px] font-bold text-[#64748b] hover:text-[#4b3f68] transition-colors uppercase cursor-pointer">Cancel</button>
              <button onClick={handleDeleteWeek} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold tracking-wide rounded-sm transition-all uppercase cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}

      {deleteContentId && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-sm w-full shadow-2xl p-6 border border-[#e7dff0] animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            <h3 className="text-[16px] font-extrabold text-[#1e293b] mb-2 flex items-center gap-2">
              <Trash2 size={18} className="text-red-500" /> Remove Material?
            </h3>
            <p className="text-[13.5px] text-[#64748b] mb-6">
              Are you sure you want to remove this material from the week's content?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteContentId(null)} className="px-4 py-2 text-[13px] font-bold text-[#64748b] hover:text-[#4b3f68] transition-colors uppercase cursor-pointer">Cancel</button>
              <button onClick={handleDeleteContent} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold tracking-wide rounded-sm transition-all uppercase cursor-pointer">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
