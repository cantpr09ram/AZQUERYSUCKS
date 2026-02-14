"use client";

import { useQuery } from "@tanstack/react-query";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/header";
import { WeeklySchedule } from "@/components/weekly-schedule";
import type { Course, ScheduledCourse } from "@/types/course";
import { parseTimes } from "@/utils/parse-times";

const COURSES_URL =
  import.meta.env.NEXT_PUBLIC_COURSES_URL ??
  import.meta.env.VITE_COURSES_URL ??
  "https://raw.githubusercontent.com/cantpr09ram/CourseCatalogs2Json/refs/heads/main/courses.json";

interface CourseSchedulerContentProps {
  selectedCourseSeqs: string[];
  setSelectedCourseSeqs: (
    updater: (prev: string[]) => string[],
    replace?: boolean,
  ) => void;
}

export function CourseSchedulerContent({
  selectedCourseSeqs,
  setSelectedCourseSeqs,
}: CourseSchedulerContentProps) {
  const { data: courses = [] } = useQuery({
    queryKey: ["courses", COURSES_URL],
    queryFn: async () => {
      const res = await fetch(COURSES_URL);
      if (!res.ok) {
        throw new Error(`Failed to fetch courses: ${res.status}`);
      }

      const data: Course[] = await res.json();
      return data;
    },
    select: (data): ScheduledCourse[] => {
      return data.map((course) => {
        const parsed = parseTimes(course.times);

        return {
          ...course,
          place: parsed.place,
          day: parsed.day,
          startTime: parsed.startTime,
          endTime: parsed.endTime,
        };
      });
    },
  });

  const selectedCourses = courses.filter((course) =>
    selectedCourseSeqs.includes(course.seq),
  );

  const handleCourseSelect = (course: ScheduledCourse) => {
    setSelectedCourseSeqs((prev) =>
      prev.includes(course.seq) ? prev : [...prev, course.seq],
    );
  };

  const handleCourseRemove = (courseId: string) => {
    setSelectedCourseSeqs((prev) => prev.filter((seq) => seq !== courseId));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <div className="flex-1 flex justify-center">
        <WeeklySchedule
          courses={courses}
          onCourseSelect={handleCourseSelect}
          onCourseRemove={handleCourseRemove}
          scheduledCourses={selectedCourses}
        />
      </div>
      <Footer />
    </div>
  );
}
