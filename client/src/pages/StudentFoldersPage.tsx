import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useStudentData } from "../hooks/useStudentData";
import { getStudentClassIdsForCourse } from "../lib/studentClassEnrollment";
import { MaterialsPageSkeleton } from "../components/skeletons/PageSkeletons";

interface FolderSummary {
  id: string;
  title: string;
  itemCount: number;
  lastUpdated: string | null;
}

const uniqueById = (rows: any[]) => Array.from(new Map(rows.map((row) => [row.id, row])).values());

export default function StudentFoldersPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { courses, isLoading: isStudentDataLoading } = useStudentData();
  const [folders, setFolders] = useState<FolderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const course = useMemo(() => courses.find((item) => item.id === courseId), [courses, courseId]);

  useEffect(() => {
    const loadFolders = async () => {
      if (!user || !courseId) {
        setIsLoading(false);
        return;
      }

      if (isStudentDataLoading) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const classIds = Array.from(new Set([
          ...(course?.classIds || []),
          ...(await getStudentClassIdsForCourse(courseId, user.id)),
        ]));
        if (classIds.length === 0) {
          setFolders([]);
          return;
        }

        const { data: contentRows, error: contentError } = await supabase
          .from("course_content")
          .select("id, week_number, created_at")
          .in("class_id", classIds)
          .order("week_number", { ascending: true })
          .order("created_at", { ascending: false });

        if (contentError) throw contentError;

        const grouped = new Map<number, FolderSummary>();
        uniqueById(contentRows || []).forEach((item: any) => {
          const weekNumber = item.week_number || 0;
          const existing = grouped.get(weekNumber);
          if (existing) {
            existing.itemCount += 1;
            if (item.created_at && (!existing.lastUpdated || item.created_at > existing.lastUpdated)) {
              existing.lastUpdated = item.created_at;
            }
            return;
          }

          grouped.set(weekNumber, {
            id: String(weekNumber),
            title: weekNumber > 0 ? `Week ${weekNumber}` : "Uncategorized",
            itemCount: 1,
            lastUpdated: item.created_at || null,
          });
        });

        setFolders(Array.from(grouped.values()));
      } catch (err: any) {
        console.error("Load student course folders error:", err);
        setError(err.message || "Unable to load folders.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadFolders();
  }, [course?.classIds, courseId, isStudentDataLoading, user]);

  if (isLoading) {
    return <MaterialsPageSkeleton />;
  }

  if (error) {
    return <div className="flex h-[300px] items-center justify-center text-[#4b3f68] font-semibold">{error}</div>;
  }

  return (
    <div className="flex flex-col gap-8 pb-10 flex-1 min-w-0 max-w-[1100px] mx-auto w-full animate-in fade-in duration-200">
      <div className="flex flex-col gap-4">
        <Link
          to="/student/courses"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#7c8697] hover:text-[#4b3f68] transition-colors w-fit"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Courses
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="font-sans text-[26px] md:text-[28px] font-bold text-[#4b3f68] tracking-tight">
              Study Material Folders
            </h1>
            <p className="text-[14px] text-[#7c8697] mt-1">
              {course ? `${course.name} materials shared by your teacher` : "Materials shared by your teacher"}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-[8px] border border-[#e2d9ed] bg-white px-4 py-2 text-[13px] font-medium text-[#4b3f68] shadow-sm w-fit">
            <span className="text-[#7c8697]">Folders:</span>
            <span className="font-bold text-primary">{folders.length}</span>
          </div>
        </div>
      </div>

      {folders.length === 0 ? (
        <div className="rounded-[10px] border border-dashed border-[#d8c8e9] bg-white p-12 text-center shadow-[0_2px_12px_rgba(57,31,86,0.04)]">
          <h3 className="text-[16px] font-bold text-[#4b3f68]">No folders yet</h3>
          <p className="mt-1 text-[13px] font-medium text-[#7c8697]">Study materials for this course will appear here once your teacher uploads them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {folders.map((folder) => (
            <Link
              key={folder.id}
              to={`/student/courses/${courseId}/folders/${folder.id}`}
              className="group rounded-[10px] border border-[#e7dff0] bg-white p-5 shadow-[0_2px_12px_rgba(57,31,86,0.04)] hover:shadow-[0_8px_24px_rgba(57,31,86,0.08)] transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="w-11 h-11 rounded-[8px] bg-[#f3eff7] text-primary flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <span className="text-[12px] font-semibold px-2 py-[3px] rounded-[6px] border text-primary bg-[#f3eff7] border-[#e7dff0]">
                  {folder.itemCount} {folder.itemCount === 1 ? "item" : "items"}
                </span>
              </div>
              <h3 className="font-sans text-[17px] font-bold text-[#4b3f68] mt-5 group-hover:text-primary transition-colors">{folder.title}</h3>
              <p className="text-[12px] font-medium text-[#7c8697] mt-1">
                {folder.lastUpdated ? `Updated ${new Date(folder.lastUpdated).toLocaleDateString()}` : "Ready to view"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
