import { STUDENT_SEMESTERS, type Department, type Gender, type Semester, type StudentFormData } from '../types/student';

const DEPARTMENTS: Exclude<Department, ''>[] = ['CSE', 'IT', 'ECE', 'Civil', 'Mech'];
const GENDERS: Gender[] = ['Male', 'Female'];

type StudentCsvField = Exclude<keyof StudentFormData, 'photo'>;

type RawCsvRow = Record<string, string>;

export interface StudentCsvValidRow {
  rowNumber: number;
  data: StudentFormData;
  raw: RawCsvRow;
}

export interface StudentCsvInvalidRow {
  rowNumber: number;
  errors: string[];
  raw: RawCsvRow;
}

export interface StudentCsvParseResult {
  totalRows: number;
  validRows: StudentCsvValidRow[];
  invalidRows: StudentCsvInvalidRow[];
}

export const STUDENT_CSV_TEMPLATE_HEADERS = [
  'firstName',
  'lastName',
  'email',
  'password',
  'fatherName',
  'dateOfBirth',
  'mobileNo',
  'gender',
  'department',
  'semester',
  'city',
  'address',
];

const FIELD_ALIASES: Record<string, StudentCsvField> = {
  firstname: 'firstName',
  first: 'firstName',
  givenname: 'firstName',
  lastname: 'lastName',
  last: 'lastName',
  surname: 'lastName',
  email: 'email',
  emailaddress: 'email',
  password: 'password',
  temporarypassword: 'password',
  temppassword: 'password',
  fathername: 'fatherName',
  parentname: 'fatherName',
  guardianname: 'fatherName',
  dateofbirth: 'dateOfBirth',
  dob: 'dateOfBirth',
  mobileno: 'mobileNo',
  mobilenumber: 'mobileNo',
  phone: 'mobileNo',
  phonenumber: 'mobileNo',
  gender: 'gender',
  department: 'department',
  semester: 'semester',
  city: 'city',
  address: 'address',
};

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(value.trim());
      value = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1;
      }
      row.push(value.trim());
      if (row.some(Boolean)) {
        rows.push(row);
      }
      row = [];
      value = '';
    } else {
      value += char;
    }
  }

  row.push(value.trim());
  if (row.some(Boolean)) {
    rows.push(row);
  }

  return rows;
}

function getFieldValue(raw: RawCsvRow, field: StudentCsvField) {
  return raw[field]?.trim() ?? '';
}

function normalizeGender(value: string): Gender | null {
  const match = GENDERS.find((gender) => gender.toLowerCase() === value.toLowerCase());
  return match ?? null;
}

function normalizeDepartment(value: string): Exclude<Department, ''> | null {
  const match = DEPARTMENTS.find((department) => department.toLowerCase() === value.toLowerCase());
  return match ?? null;
}

function normalizeSemester(value: string): Exclude<Semester, ''> | null {
  const normalized = value.trim().toLowerCase();
  const match = STUDENT_SEMESTERS.find((semester) => semester.toLowerCase() === normalized);
  if (match) return match;

  const numericMatch = normalized.match(/^(?:semester\s*)?([1-8])$/);
  if (numericMatch) {
    return `Semester ${numericMatch[1]}` as Exclude<Semester, ''>;
  }

  return null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function parseStudentCsv(text: string): StudentCsvParseResult {
  const rows = parseCsv(text);
  const validRows: StudentCsvValidRow[] = [];
  const invalidRows: StudentCsvInvalidRow[] = [];
  const seenEmails = new Set<string>();

  if (rows.length === 0) {
    return { totalRows: 0, validRows, invalidRows };
  }

  const headers = rows[0].map((header) => FIELD_ALIASES[normalizeHeader(header)] ?? null);
  const dataRows = rows.slice(1);

  dataRows.forEach((row, index) => {
    const raw: RawCsvRow = {};
    headers.forEach((field, fieldIndex) => {
      if (field) {
        raw[field] = row[fieldIndex]?.trim() ?? '';
      }
    });

    const rowNumber = index + 2;
    const errors: string[] = [];
    const firstName = getFieldValue(raw, 'firstName');
    const lastName = getFieldValue(raw, 'lastName');
    const email = getFieldValue(raw, 'email').toLowerCase();
    const password = getFieldValue(raw, 'password');
    const genderValue = getFieldValue(raw, 'gender');
    const departmentValue = getFieldValue(raw, 'department');
    const semesterValue = getFieldValue(raw, 'semester');
    const gender = genderValue ? normalizeGender(genderValue) : 'Male';
    const department = departmentValue ? normalizeDepartment(departmentValue) : 'CSE';
    const semester = semesterValue ? normalizeSemester(semesterValue) : 'Semester 1';

    if (!firstName) errors.push('First name is required.');
    if (!lastName) errors.push('Last name is required.');
    if (!email) {
      errors.push('Email is required.');
    } else if (!isValidEmail(email)) {
      errors.push('Email is invalid.');
    } else if (seenEmails.has(email)) {
      errors.push('Email is duplicated in this CSV.');
    }

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters.');
    }
    if (!gender) {
      errors.push('Gender must be Male or Female.');
    }
    if (!department) {
      errors.push('Department must be one of CSE, IT, ECE, Civil, Mech.');
    }
    if (!semester) {
      errors.push('Semester must be one of Semester 1 through Semester 8.');
    }

    if (email && isValidEmail(email)) {
      seenEmails.add(email);
    }

    if (errors.length > 0 || !gender || !department || !semester) {
      invalidRows.push({ rowNumber, errors, raw });
      return;
    }

    validRows.push({
      rowNumber,
      raw,
      data: {
        firstName,
        lastName,
        email,
        password,
        fatherName: getFieldValue(raw, 'fatherName'),
        dateOfBirth: getFieldValue(raw, 'dateOfBirth'),
        mobileNo: getFieldValue(raw, 'mobileNo'),
        gender,
        department,
        semester,
        city: getFieldValue(raw, 'city'),
        address: getFieldValue(raw, 'address'),
        photo: null,
      },
    });
  });

  return { totalRows: dataRows.length, validRows, invalidRows };
}
