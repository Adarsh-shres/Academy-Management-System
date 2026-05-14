import { supabase } from "./supabase";

export async function getStudentClassIdsForCourse(courseId: string, studentId: string): Promise<string[]> {
  const { data: directClasses, error: directClassesError } = await supabase
    .from("classes")
    .select("id")
    .eq("course_id", courseId)
    .contains("student_ids", [studentId]);

  if (directClassesError) {
    throw directClassesError;
  }

  const { data: batches, error: batchesError } = await supabase
    .from("batches")
    .select("id")
    .contains("student_ids", [studentId]);

  if (batchesError && batchesError.code !== "42P01") {
    throw batchesError;
  }

  const batchIds = (batches || []).map((batch: any) => batch.id).filter(Boolean);
  let batchClasses: Array<{ id: string }> = [];

  if (batchIds.length > 0) {
    const { data, error } = await supabase
      .from("classes")
      .select("id")
      .eq("course_id", courseId)
      .in("batch_id", batchIds);

    if (error) {
      throw error;
    }

    batchClasses = data || [];
  }

  return Array.from(new Set([...(directClasses || []), ...batchClasses].map((classRow: any) => classRow.id)));
}
