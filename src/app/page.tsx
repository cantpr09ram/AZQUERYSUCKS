"use client";

import { useEffect, useState } from "react";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/header";
import { WeeklySchedule } from "@/components/weekly-schedule";
import type { Course, ScheduledCourse } from "@/types/course";
import { parseTimes } from "@/utils/parse-times";

// Fetch courses from JSON URL
const COURSES_URL =
  process.env.NEXT_PUBLIC_COURSES_URL ??
  "https://raw.githubusercontent.com/cantpr09ram/CourseCatalogs2Json/refs/heads/main/courses.json";

//const COURSES_URL =
export default function CourseScheduler() {
  const [courses, setCourses] = useState<ScheduledCourse[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<ScheduledCourse[]>([
    {
      source: "A01.htm",
      dept_block: "TNUOB.核心課程Ｏ群－日 INFORMATION EDUCATION",
      grade: "0",
      seq: "2586",
      code: "E3528",
      major: null,
      term_order: "0",
      class: "B",
      group_div: null,
      required: "必",
      credits: 2,
      group: "O",
      title: "網路與資訊科技",
      cap: 50,
      teacher: "王元慶",
      times: ["五 / 6,7 / B 206"],
      english_taught: false,
      day: [1],
      startTime: [2],
      endTime: [2],
    },
  ]);

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
    setSelectedCourses((prev) => {
      if (prev.some((item) => item.seq === course.seq)) {
        return prev;
      }
      return [...prev, course];
    });
  };

  const handleCourseRemove = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.filter((course) => course.seq !== courseId),
    );
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
