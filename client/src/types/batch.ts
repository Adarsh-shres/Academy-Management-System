export type BatchStatus = 'Active' | 'Archived';

export interface BatchRow {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: BatchStatus;
  course_ids: string[];
  student_ids: string[];
  created_at: string;
}

export interface Batch {
  id: string;
  name: string;
  code: string;
  description: string;
  status: BatchStatus;
  courseIds: string[];
  studentIds: string[];
  createdAt: string;
}

export type BatchInput = Omit<Batch, 'id' | 'createdAt'>;

export function rowToBatch(row: BatchRow): Batch {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description ?? '',
    status: row.status,
    courseIds: row.course_ids ?? [],
    studentIds: row.student_ids ?? [],
    createdAt: row.created_at,
  };
}

export function batchToRow(batch: Partial<Batch>): Partial<BatchRow> {
  const row: Partial<BatchRow> = {};

  if (batch.name !== undefined) row.name = batch.name;
  if (batch.code !== undefined) row.code = batch.code;
  if (batch.description !== undefined) row.description = batch.description;
  if (batch.status !== undefined) row.status = batch.status;
  if (batch.courseIds !== undefined) row.course_ids = batch.courseIds;
  if (batch.studentIds !== undefined) row.student_ids = batch.studentIds;

  return row;
}
