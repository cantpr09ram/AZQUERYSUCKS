import type { ScheduledCourse } from "@/types/course";

export type CourseWithTimes = ScheduledCourse & {
  day: number[];
  startTime: number[];
  endTime: number[];
};

export function hasScheduleTimes(
  course: ScheduledCourse,
): course is CourseWithTimes {
  return (
    Array.isArray(course.day) &&
    Array.isArray(course.startTime) &&
    Array.isArray(course.endTime)
  );
}
