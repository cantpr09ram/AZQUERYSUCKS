"use client";

import { useEffect, useState } from "react";
import { useQueryState, parseAsArrayOf, parseAsString } from "nuqs";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/header";
import { WeeklySchedule } from "@/components/weekly-schedule";
import type { Course, ScheduledCourse } from "@/types/course";
import { parseTimes } from "@/utils/parse-times";

const COURSES_URL =
  process.env.NEXT_PUBLIC_COURSES_URL ??
  "https://raw.githubusercontent.com/cantpr09ram/CourseCatalogs2Json/refs/heads/main/courses.json";

export function CourseSchedulerContent() {
  const [courses, setCourses] = useState<ScheduledCourse[]>([]);
  const [selectedCourseSeqs, setSelectedCourseSeqs] = useQueryState(
    "selectedCourses",
    parseAsArrayOf(parseAsString).withDefault([]),
  );
  const selectedCourses = courses.filter((course) =>
    selectedCourseSeqs.includes(course.seq),
  );

  useEffect(() => {
    const controller = new AbortController();

    const loadCourses = async () => {
      try {
        const res = await fetch(COURSES_URL, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Failed to fetch courses: ${res.status}`);
        }
        const data: Course[] = await res.json();
        const normalized: ScheduledCourse[] = data.map((course) => {
          const parsed = parseTimes(course.times);
          return {
            ...course,
            place: parsed.place,
            day: parsed.day,
            startTime: parsed.startTime,
            endTime: parsed.endTime,
          };
        });
        setCourses(normalized);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.error("Failed to fetch courses:", error);
        setCourses([]);
      }
    };

    loadCourses();

    return () => controller.abort();
  }, []);

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
