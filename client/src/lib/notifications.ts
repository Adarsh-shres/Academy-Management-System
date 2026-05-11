import { supabase } from './supabase';

export type NotificationType = 'announcement' | 'content' | 'update' | 'assignment_open' | 'manual';

interface NotificationRowInput {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  classId?: string | null;
  assignmentId?: string | null;
  teacherId?: string | null;
}

interface SendClassNotificationInput {
  classId: string;
  title: string;
  message: string;
  type?: NotificationType;
  assignmentId?: string | null;
}

interface ClassRecipientRow {
  student_ids?: string[] | null;
}

interface UserRecipientRow {
  id: string;
}

function uniqueIds(ids: string[]) {
  return Array.from(new Set(ids.filter(Boolean)));
}

async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user?.id) {
    throw new Error('You must be logged in to send notifications.');
  }

  return user.id;
}

async function insertNotificationRows(rows: NotificationRowInput[]) {
  if (rows.length === 0) {
    return { count: 0 };
  }

  const senderId = await getCurrentUserId();
  const payload = rows.map((row) => ({
    user_id: row.userId,
    title: row.title.trim() || 'Notification',
    message: row.message.trim(),
    type: row.type ?? 'announcement',
    is_read: false,
    class_id: row.classId ?? null,
    teacher_id: row.teacherId ?? senderId,
    assignment_id: row.assignmentId ?? null,
    created_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from('notifications').insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  return { count: payload.length };
}

export async function getClassStudentIds(classId: string) {
  const { data, error } = await supabase
    .from('classes')
    .select('student_ids')
    .eq('id', classId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return uniqueIds(((data as ClassRecipientRow | null)?.student_ids ?? []).map(String));
}

export async function sendNotificationToUsers(rows: NotificationRowInput[]) {
  return insertNotificationRows(rows);
}

export async function sendClassNotification({
  classId,
  title,
  message,
  type = 'announcement',
  assignmentId = null,
}: SendClassNotificationInput) {
  const studentIds = await getClassStudentIds(classId);
  const teacherId = await getCurrentUserId();

  return insertNotificationRows(
    studentIds.map((studentId) => ({
      userId: studentId,
      title,
      message,
      type,
      classId,
      assignmentId,
      teacherId,
    })),
  );
}

export async function sendRoleNotification(role: 'student' | 'teacher', title: string, message: string) {
  const { data, error } = await supabase.from('users').select('id').eq('role', role);

  if (error) {
    throw new Error(error.message);
  }

  const recipients = ((data ?? []) as UserRecipientRow[]).map((row) => row.id);

  return insertNotificationRows(
    uniqueIds(recipients).map((userId) => ({
      userId,
      title,
      message,
      type: 'announcement',
    })),
  );
}

export async function sendGeneralNotification(title: string, message: string) {
  const { data, error } = await supabase.from('users').select('id');

  if (error) {
    throw new Error(error.message);
  }

  const recipients = ((data ?? []) as UserRecipientRow[]).map((row) => row.id);

  return insertNotificationRows(
    uniqueIds(recipients).map((userId) => ({
      userId,
      title,
      message,
      type: 'announcement',
    })),
  );
}
