type SupabaseLikeError = {
  code?: string;
  message?: string;
};

export function isMissingTeacherSchedulesTable(error?: SupabaseLikeError | null) {
  if (!error) return false;

  return error.code === 'PGRST205'
    || error.message?.toLowerCase().includes("could not find the table 'public.teacher_schedules'") === true;
}
