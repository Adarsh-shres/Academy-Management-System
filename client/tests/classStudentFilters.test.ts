import assert from 'node:assert/strict';
import { test } from 'node:test';
import { filterAvailableClassStudents } from '../src/lib/classStudentFilters.ts';
import type { StudentRecord } from '../src/types/student.ts';

function student(overrides: Partial<StudentRecord>): StudentRecord {
  return {
    id: 'student-1',
    firstName: 'Ram',
    lastName: 'Sharma',
    fatherName: '',
    dateOfBirth: '',
    mobileNo: '',
    email: 'ram@example.com',
    password: '',
    gender: 'Male',
    department: 'CSE',
    city: '',
    address: '',
    course: '',
    isActive: true,
    dateEnrolled: '',
    ...overrides,
  };
}

test('filterAvailableClassStudents combines selected students, search, and department', () => {
  const students = [
    student({ id: '1', firstName: 'Ram', email: 'ram@example.com', department: 'CSE' }),
    student({ id: '2', firstName: 'Sita', email: 'sita@example.com', department: 'IT' }),
    student({ id: '3', firstName: 'Hari', email: 'hari@example.com', department: 'CSE' }),
  ];

  const result = filterAvailableClassStudents(students, ['3'], 'ra', 'CSE');

  assert.deepEqual(result.map((item) => item.id), ['1']);
});
