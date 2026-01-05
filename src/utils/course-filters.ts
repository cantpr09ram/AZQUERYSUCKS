import type { ScheduledCourse } from "@/types/course";
import { hasScheduleTimes } from "./course-times";

export const DAY_OPTIONS = [
  { value: "0", label: "整週" },
  { value: "1", label: "一 / Mon" },
  { value: "2", label: "二 / Tue" },
  { value: "3", label: "三 / Wed" },
  { value: "4", label: "四 / Thu" },
  { value: "5", label: "五 / Fri" },
  { value: "6", label: "六 / Sat" },
  { value: "7", label: "日 / Sun" },
];

export const PERIOD_OPTIONS = Array.from({ length: 15 }, (_, index) => index);

export type CourseFilters = {
  searchTerm: string;
  department: string;
  grade: string;
  required: string;
  weekday: string;
  startTime: number;
  endTime: number;
};

export const allDepartmentsLabel = "所有系所";
export const allGradesLabel = "所有年段";
export const allRequiredLabel = "必/選修";

export function getDepartmentOptions(courses: ScheduledCourse[]): string[] {
  const labels = new Set<string>();
  for (const course of courses) {
    const normalized = String(course.dept_block ?? "")
      .trim()
      .replace(/\s+/g, " ");
    const afterDot = normalized.split(".", 2)[1] ?? normalized;
    const department = afterDot.trimStart().split(/\s+/, 1)[0];
    if (department) {
      labels.add(department);
    }
  }

  return [allDepartmentsLabel, ...Array.from(labels.values())];
}

export function applyCourseFilters(
  courses: ScheduledCourse[],
  filters: CourseFilters,
): ScheduledCourse[] {
  const normalizedSearch = filters.searchTerm.trim();
  const hasTimeRange =
    filters.startTime <= filters.endTime && filters.endTime !== 0;

  return courses.filter((course) => {
    const matchesSearch =
      !normalizedSearch ||
      course.code?.includes(normalizedSearch) ||
      course.title?.includes(normalizedSearch) ||
      course.teacher?.includes(normalizedSearch) ||
      course.seq?.includes(normalizedSearch) ||
      (Array.isArray(course.place) &&
        course.place.some((place) => place.includes(normalizedSearch)));

    if (!matchesSearch) return false;

    const matchesDepartment =
      filters.department === allDepartmentsLabel ||
      (course.dept_block ?? "").includes(filters.department);
    if (!matchesDepartment) return false;

    const matchesGrade =
      filters.grade === allGradesLabel ||
      String(course.grade) === filters.grade;
    if (!matchesGrade) return false;

    const matchesRequired =
      filters.required === allRequiredLabel ||
      course.required === filters.required;
    if (!matchesRequired) return false;

    const matchesWeekDay =
      filters.weekday === "0" ||
      (Array.isArray(course.day) &&
        course.day.includes(Number(filters.weekday)));
    if (!matchesWeekDay) return false;

    if (!hasTimeRange) return true;

    if (!hasScheduleTimes(course)) return false;

    const matchesTime = course.startTime.some((start, index) => {
      const end = course.endTime[index];
      return (
        typeof start === "number" &&
        typeof end === "number" &&
        start >= filters.startTime &&
        end <= filters.endTime
      );
    });

    return matchesTime;
  });
}
