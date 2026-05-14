import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useStudentData } from "../hooks/useStudentData";
import { getStudentClassIdsForCourse } from "../lib/studentClassEnrollment";

interface MaterialItem {
  id: string;
  title: string;
  type: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  uploadDate: string;
}

const uniqueById = (rows: any[]) => Array.from(new Map(rows.map((row) => [row.id, row])).values());

const getFileIcon = (fileName?: string) => {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  const color = ext === "pdf" ? "text-red-500" : ext === "doc" || ext === "docx" ? "text-blue-500" : ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "gif" ? "text-green-500" : "text-[#64748b]";

  return (
    <svg className={`w-8 h-8 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
};

const getBrowserPreviewUrl = (fileUrl: string, fileName?: string) => {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  const directPreviewExts = new Set(["pdf", "jpg", "jpeg", "png", "gif", "webp", "svg", "txt"]);

  if (!ext || directPreviewExts.has(ext)) {
    return fileUrl;
  }

  return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
};

export default function FolderContentsPage() {
  const { courseId, folderId } = useParams<{ courseId: string; folderId: string }>();
  const { user } = useAuth();
  const { courses } = useStudentData();
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const folderName = folderId && Number(folderId) > 0 ? `Week ${folderId}` : "Uncategorized";

  useEffect(() => {
    const loadMaterials = async () => {
      if (!user || !courseId || folderId === undefined) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const course = courses.find((item) => item.id === courseId);
        const classIds = Array.from(new Set([
          ...(course?.classIds || []),
          ...(await getStudentClassIdsForCourse(courseId, user.id)),
        ]));
        const weekNumber = Number(folderId) || 0;
        if (classIds.length === 0) {
          setMaterials([]);
          return;
        }

        const { data: contentRows, error: contentError } = await supabase
          .from("course_content")
          .select("id, title, description, file_url, material_type, created_at")
          .eq("week_number", weekNumber)
          .in("class_id", classIds)
          .order("created_at", { ascending: false });

        if (contentError) throw contentError;

        setMaterials(uniqueById(contentRows || []).map((item: any) => ({
          id: item.id,
          title: item.title || "Untitled material",
          type: item.material_type || "Other",
          description: item.description || "",
          fileUrl: item.file_url || "",
          fileName: item.file_url?.split("/").pop() || "",
          uploadDate: item.created_at || new Date().toISOString(),
        })));
      } catch (err: any) {
        console.error("Load student folder contents error:", err);
        setError(err.message || "Unable to load materials.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadMaterials();
  }, [courseId, courses, folderId, user]);

  const handleOpenMaterial = (fileUrl?: string, fileName?: string) => {
    if (!fileUrl) return;
    window.open(getBrowserPreviewUrl(fileUrl, fileName), "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return <div className="flex h-[300px] items-center justify-center text-[#7c8697] text-[13px] font-semibold animate-pulse uppercase tracking-wider">Loading Materials...</div>;
  }

  if (error) {
    return <div className="flex h-[300px] items-center justify-center text-[#4b3f68] font-semibold">{error}</div>;
  }

  return (
    <div className="flex flex-col gap-8 pb-10 flex-1 min-w-0 max-w-[1100px] mx-auto w-full animate-in fade-in duration-200">
      <div className="flex flex-col gap-4">
        <Link
          to={`/student/courses/${courseId}/folders`}
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#7c8697] hover:text-[#4b3f68] transition-colors w-fit"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Folders
        </Link>

        <div>
          <h1 className="font-sans text-[26px] md:text-[28px] font-bold text-[#4b3f68] tracking-tight flex items-center gap-3">
            <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            {folderName}
          </h1>
          <p className="text-[14px] text-[#7c8697] mt-1 ml-10">{materials.length} study materials found</p>
        </div>
      </div>

      <div className="bg-white rounded-[10px] border border-[#e7dff0] shadow-[0_2px_12px_rgba(57,31,86,0.04)] overflow-hidden">
        {materials.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <svg className="w-16 h-16 text-[#e2d9ed] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-[16px] font-bold text-[#4b3f68] mb-1">This folder is empty</h3>
            <p className="text-[#7c8697] font-medium text-[13px]">No study materials have been uploaded here yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f3eff7]">
            {materials.map((material) => (
              <div key={material.id} className="px-6 py-5 hover:bg-[#fcfbfc] transition-colors">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="p-2 bg-white rounded-[8px] border border-[#e7dff0] shadow-sm shrink-0">
                      {getFileIcon(material.fileName)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[14px] font-semibold text-[#4b3f68]">{material.title}</h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider border rounded-[6px] px-2 py-0.5 bg-[#f3eff7] text-primary border-[#e7dff0]">{material.type}</span>
                      </div>
                      {material.description && <p className="text-[13px] text-[#64748b] mt-2 leading-relaxed">{material.description}</p>}
                      {material.fileName && <p className="text-[12px] text-[#0284c7] font-semibold mt-2 break-all">{material.fileName}</p>}
                      <p className="text-[12px] text-[#7c8697] font-medium mt-2">
                        Uploaded {new Date(material.uploadDate).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenMaterial(material.fileUrl, material.fileName)}
                    disabled={!material.fileUrl}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[8px] bg-primary text-white text-[12px] font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
