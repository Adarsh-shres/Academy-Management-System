import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, MapPin, Calendar } from '../components/shared/icons';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];



/** Shows the weekly teaching schedule grouped by day. */
export default function TeacherSchedulePage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSchedule() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        setIsLoading(true);
        const { data } = await supabase
          .from('courses')
          .select('*')
          .eq('faculty_lead', user.user_metadata?.name || user.email?.split('@')[0]);
        
        if (data && data.length > 0) {
           const structuredSchedule = data.map(course => ({
              id: course.id,
              name: course.name,
              course_code: course.course_code,
              schedule_days: course.schedule_days || ['Monday', 'Wednesday'],
              timeRange: course.schedule_time || '10:00AM - 11:30AM',
              room: course.department ? `Dept: ${course.department}` : 'Virtual',
              students: course.enrolled_students || '--',
              sessionType: 'LECTURE'
           }));
           setCourses(structuredSchedule);
        } else {
           setCourses([]);
        }
      } catch (err) {
         console.error('Failed to load schedule', err);
         setCourses([]);
      } finally {
         setIsLoading(false);
      }
    }
    loadSchedule();
  }, []);

  /** Normalizes stored schedule days into a string array. */
  const safeParseDays = (daysObj: any): string[] => {
    if (!daysObj) return [];
    if (Array.isArray(daysObj)) return daysObj;
    if (typeof daysObj === 'string') {
      try {
        const parsed = JSON.parse(daysObj);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return daysObj.split(',').map(d => d.trim());
      }
    }
    return [];
  };

  const scheduleMap: Record<string, any[]> = {};
  DAYS_OF_WEEK.forEach(day => { scheduleMap[day] = []; });

  courses.forEach(course => {
    const days = safeParseDays(course.schedule_days);
    days.forEach(day => {
      const normalizedDay = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
      if (scheduleMap[normalizedDay]) {
        scheduleMap[normalizedDay].push(course);
      } else {
        const matchedDay = DAYS_OF_WEEK.find(d => d.toLowerCase().startsWith(day.toLowerCase()));
        if (matchedDay) scheduleMap[matchedDay].push(course);
      }
    });
  });

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col min-w-0 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[26px] font-extrabold text-[#4b3f68] tracking-tight">Weekly Schedule</h1>
          <p className="text-[#64748b] font-medium mt-1">Manage your teaching schedule for this semester</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {DAYS_OF_WEEK.map(day => {
          const isSunday = day === 'Sunday';
          const dayCourses = scheduleMap[day] || [];

          return (
            <div key={day} className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] overflow-hidden flex flex-col md:flex-row">
              <div className="bg-[#fbf8fe] p-6 border-b md:border-b-0 md:border-r border-[#e7dff0] w-full md:w-[220px] shrink-0 flex flex-col md:justify-center items-center md:items-start text-center md:text-left gap-2">
                <h3 className="text-[20px] font-extrabold text-[#4b3f68] tracking-tight">{day}</h3>
                {!isSunday && (
                  <span className="bg-[#e2d9ed] text-[#4b3f68] text-[11px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wide">
                    {dayCourses.length} {dayCourses.length === 1 ? 'Class' : 'Classes'}
                  </span>
                )}
              </div>

              <div className="p-6 flex-1 bg-white">
                {isSunday ? (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-6 md:py-8">
                    <div>
                      <h4 className="text-[16px] font-bold text-[#4e5d78] mb-0.5">Weekend Holiday</h4>
                      <p className="text-[13.5px] text-[#8a94a6] font-medium">Weekend Holiday — Enjoy your break from the curriculum!</p>
                    </div>
                  </div>
                ) : (
                  isLoading ? (
                    <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                      {[1, 2].map(i => <div key={i} className="animate-pulse bg-[#f1f5f9] h-[140px] min-w-[280px] rounded-sm border border-[#e2e8f0]"></div>)}
                    </div>
                  ) : dayCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dayCourses.map((course, idx) => {
                        const mockTimeRange = course.timeRange;
                        const mockRoom = course.room;
                        const mockSessionType = course.sessionType;
                        const mockStudentCount = course.students;

                        return (
                          <div key={`${course.id}-${idx}`} className="border border-[#e2d9ed] rounded-sm p-4 hover:border-[#b096cc] hover:shadow-sm transition-all bg-[#fbf8fe]/30 group">
                            <div className="flex justify-between items-start mb-3">
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-sm uppercase tracking-wider ${mockSessionType === 'LECTURE' ? 'bg-[#ffedd5] text-[#ea580c]' :
                                  mockSessionType === 'TUTORIAL' ? 'bg-[#dcfce7] text-[#16a34a]' :
                                    'bg-[#e0f2fe] text-[#0284c7]'
                                }`}>
                                {mockSessionType}
                              </span>
                              <span className="bg-white border border-[#e2d9ed] text-[#64748b] text-[11px] font-bold px-2 py-0.5 rounded-sm">
                                {course.course_code || 'CRS'}
                              </span>
                            </div>

                            <h4 className="text-[15px] font-bold text-[#4b3f68] mb-3 leading-tight group-hover:text-[#6a5182] transition-colors">{course.name}</h4>

                            <div className="flex flex-col gap-2 mt-auto">
                              <div className="flex items-center gap-2 text-[12px] font-medium text-[#475569]">
                                <Calendar size={14} className="text-[#94a3b8]" />
                                <span>{mockTimeRange}</span>
                              </div>
                              <div className="flex items-center gap-4 text-[12px] font-medium text-[#475569]">
                                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#94a3b8]" /> {mockRoom}</span>
                                <span className="flex items-center gap-1.5"><Users size={14} className="text-[#94a3b8]" /> {mockStudentCount}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-8 bg-[#f8fafc] rounded-sm border border-dashed border-[#cbd5e1] text-center h-full min-h-[140px]">
                      <span className="text-[13.5px] font-medium text-[#64748b]">No classes scheduled for {day}.</span>
                    </div>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
