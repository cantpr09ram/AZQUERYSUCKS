"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { SiteHeader } from "@/components/header";
import { WeeklySchedule } from "@/components/weekly-schedule";
import { CourseInfoTable } from "@/components/course-info-table";
import { Footer } from "@/components/footer";
import type { Course, ScheduledCourse } from "@/types/course";
import { parseTimes } from "@/utils/parse-times";
// Fetch courses from JSON URL
const COURSES_URL =
  "https://raw.githubusercontent.com/cantpr09ram/CourseCatalogs2Json/refs/heads/main/courses.json";
//const COURSES_URL =
export default function CourseScheduler() {
  const [courses, setCourses] = useState<ScheduledCourse[]>([]);
  const [activeTab, setActiveTab] = useState<"schedule" | "info">("schedule");
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
    fetch(COURSES_URL)
      .then((res) => res.json())
      .then((data: Course[]) => {
        const normalized: ScheduledCourse[] = data.map((c) => {
          const parsed = parseTimes(c.times);
          return {
            ...c,
            place: parsed.place,
            day: parsed.day,
            startTime: parsed.startTime,
            endTime: parsed.endTime,
          };
        });
        console.log(normalized[1]);
        setCourses(normalized);
      })
      .catch((err) => {
        console.error("Failed to fetch courses:", err);
        setCourses([]);
      });
  }, []);

  const handleCourseSelect = (course: ScheduledCourse) => {
    setSelectedCourses((prev) => [...prev, course]);
  };

  const handleCourseRemove = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.filter((course) => course.seq !== courseId),
    );
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        courses={courses}
        onCourseSelect={handleCourseSelect}
        onCourseRemove={handleCourseRemove}
        selectedCourses={selectedCourses}
      />
      <SidebarInset>
        <SiteHeader activeTab={activeTab} />
        {activeTab === "schedule" ? (
          <div className="flex justify-center">
            <WeeklySchedule
              scheduledCourses={selectedCourses}
              onCourseRemove={handleCourseRemove}
            />
          </div>
        ) : (
          <CourseInfoTable courses={courses} />
        )}
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
