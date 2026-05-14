import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseStudentCsv } from '../src/lib/studentCsvImport.ts';

test('parseStudentCsv accepts valid rows and maps flexible headers', () => {
  const result = parseStudentCsv(`First Name,Last Name,Email,Password,Gender,Department,Semester,Mobile No
Ram,Sharma,ram@example.com,password123,Male,CSE,Semester 3,9800000000
Sita,Karki,sita@example.com,password456,Female,IT,4,9811111111`);

  assert.equal(result.totalRows, 2);
  assert.equal(result.validRows.length, 2);
  assert.equal(result.invalidRows.length, 0);
  assert.equal(result.validRows[0].data.email, 'ram@example.com');
  assert.equal(result.validRows[0].data.semester, 'Semester 3');
  assert.equal(result.validRows[1].data.semester, 'Semester 4');
  assert.equal(result.validRows[1].data.mobileNo, '9811111111');
});

test('parseStudentCsv reports row errors before import', () => {
  const result = parseStudentCsv(`firstName,lastName,email,password,gender,department
Ram,,not-email,short,Other,CSE
Sita,Karki,sita@example.com,password456,Female,Unknown
Sita,Duplicate,sita@example.com,password789,Female,IT`);

  assert.equal(result.totalRows, 3);
  assert.equal(result.validRows.length, 0);
  assert.equal(result.invalidRows.length, 3);
  assert.deepEqual(result.invalidRows.map((row) => row.rowNumber), [2, 3, 4]);
  assert.ok(result.invalidRows[0].errors.includes('Last name is required.'));
  assert.ok(result.invalidRows[0].errors.includes('Email is invalid.'));
  assert.ok(result.invalidRows[0].errors.includes('Password must be at least 8 characters.'));
  assert.ok(result.invalidRows[0].errors.includes('Gender must be Male or Female.'));
  assert.ok(result.invalidRows[1].errors.includes('Department must be one of CSE, IT, ECE, Civil, Mech.'));
  assert.ok(result.invalidRows[2].errors.includes('Email is duplicated in this CSV.'));
});

test('parseStudentCsv rejects invalid semester values', () => {
  const result = parseStudentCsv(`firstName,lastName,email,password,gender,department,semester
Ram,Sharma,ram@example.com,password123,Male,CSE,Semester 9`);

  assert.equal(result.totalRows, 1);
  assert.equal(result.validRows.length, 0);
  assert.equal(result.invalidRows.length, 1);
  assert.ok(result.invalidRows[0].errors.includes('Semester must be one of Semester 1 through Semester 8.'));
});
