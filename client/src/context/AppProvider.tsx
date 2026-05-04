import type { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { StudentProvider } from './StudentContext';
import { CourseProvider } from './CourseContext';
import { BatchProvider } from './BatchContext';
import { TeacherProvider } from './TeacherContext';
import { ScheduleProvider } from './ScheduleContext';
import { TodoProvider } from './TodoContext';

/**
 * Combines every context provider into a single wrapper.
 * Wrap <App /> with this in main.tsx so all pages can
 * `useStudents()`, `useCourses()`, etc.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <StudentProvider>
        <CourseProvider>
          <BatchProvider>
            <TeacherProvider>
              <ScheduleProvider>
                <TodoProvider>
                  {children}
                </TodoProvider>
              </ScheduleProvider>
            </TeacherProvider>
          </BatchProvider>
        </CourseProvider>
      </StudentProvider>
    </AuthProvider>
  );
}
