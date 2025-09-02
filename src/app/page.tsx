"use client"

import { useState, useEffect } from "react"
import { CourseList } from "@/components/course-list"
import { WeeklySchedule } from "@/components/weekly-schedule"
import { CourseInfoTable } from "@/components/course-info-table"
import { DarkModeToggle } from "@/components/dark-mode-toggle"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { Course, ScheduledCourse } from "@/types/course"

// Fetch courses from JSON URL
const COURSES_URL = "https://raw.githubusercontent.com/cantpr09ram/CourseCatalogs2Json/refs/heads/main/courses.json"

export default function CourseScheduler() {
  const [courses, setCourses] = useState<Course[]>([])
  const [activeTab, setActiveTab] = useState<"schedule" | "info">("info")
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
      times: [
        "五 / 6,7 / B 206"
      ],
      english_taught: false,
      day: 0,
      startTime: 0,
      endTime: 0
    },
  ])

  useEffect(() => {
    fetch(COURSES_URL)
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((err) => {
        console.error("Failed to fetch courses:", err)
        setCourses([])
      })
  }, [])

  const handleCourseSelect = (course: Course) => {
    // Simple scheduling logic - place course in available slot
    const scheduledCourse: ScheduledCourse = {
      ...course,
      day: Math.floor(Math.random() * 7), // Random day for demo
      startTime1: Math.floor(Math.random() * 8) + 1,
      endTime1: Math.floor(Math.random() * 8) + 2,
    }

    setSelectedCourses((prev) => [...prev, scheduledCourse])
  }

  const handleCourseRemove = (courseId: string) => {
    setSelectedCourses((prev) => prev.filter((course) => course.seq !== courseId))
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <div className="border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex">
            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "schedule"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              排課模擬
            </button>
            <button
              onClick={() => setActiveTab("info")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "info"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              選課資訊
            </button>
          </div>
          <div className="px-6 py-3">
            <DarkModeToggle />
          </div>
        </div>
      </div>

      <main className="flex-1">
        {activeTab === "schedule" ? (
          <div className="flex h-[calc(100vh-121px)]">
            <CourseList
              courses={courses}
              onCourseSelect={handleCourseSelect}
              onCourseRemove={handleCourseRemove}
              selectedCourses={selectedCourses}
            />
            <WeeklySchedule scheduledCourses={selectedCourses} onCourseRemove={handleCourseRemove} />
          </div>
        ) : (
          <CourseInfoTable courses={courses} />
        )}
      </main>

      <Footer />
    </div>
  )
}