"use client"

import { useState, useEffect } from "react"
import { CourseList } from "@/components/course-list"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from"@/components/ui/separator"
import { WeeklySchedule } from "@/components/weekly-schedule"
import { CourseInfoTable } from "@/components/course-info-table"
import { Footer } from "@/components/footer"
import type { Course, ScheduledCourse } from "@/types/course"
import { parseTimes } from "@/utils/parse-times"
// Fetch courses from JSON URL
//const COURSES_URL = "https://raw.githubusercontent.com/cantpr09ram/CourseCatalogs2Json/refs/heads/main/courses.json"
const COURSES_URL = "https://raw.githubusercontent.com/cantpr09ram/CourseCatalogs2Json/refs/heads/feat/ta-session/courses.json"
export default function CourseScheduler() {
  const [courses, setCourses] = useState<ScheduledCourse[]>([])
  const [activeTab, setActiveTab] = useState<"schedule" | "info">("schedule")
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
      day: [1],
      startTime: [2],
      endTime: [2]
    },
  ])

  useEffect(() => {
    fetch(COURSES_URL)
      .then((res) => res.json())
      .then((data: Course[]) => {
        const normalized: ScheduledCourse[] = data.map((c) => {
          const parsed = parseTimes(c.times)
          return {
            ...c,
            place: parsed.place,
            day: parsed.day,
            startTime: parsed.startTime,
            endTime: parsed.endTime,
          }
        })
        console.log(normalized[1])
        setCourses(normalized)
      })
      .catch((err) => {
        console.error("Failed to fetch courses:", err)
        setCourses([])
      })
  }, [])

  const handleCourseSelect = (course: ScheduledCourse) => {
    setSelectedCourses(prev => [...prev, course])
  }

  const handleCourseRemove = (courseId: string) => {
    setSelectedCourses((prev) => prev.filter((course) => course.seq !== courseId))
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SidebarProvider>
        <AppSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          courses={courses}
          onCourseSelect={handleCourseSelect}
          onCourseRemove={handleCourseRemove}
          selectedCourses={selectedCourses}
        />
        <main className="flex-1">
          <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 p-4 lg:gap-2 lg:px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mx-2 data-[orientation=vertical]:h-4"
              />
              {activeTab === "schedule" ? (
                <h1 className="text-base font-medium">課表</h1>
              ) : (
                <h1 className="text-base font-medium">選課資訊</h1>
              )}
            </div>
          </header>
          
          {activeTab === "schedule" ? (
            <div className="flex h-full min-h-0">
              <div className="flex-1 min-h-0 overflow-auto">
                <WeeklySchedule scheduledCourses={selectedCourses} onCourseRemove={handleCourseRemove} />
              </div>
            </div>
          ) : (
            <CourseInfoTable courses={courses} />
          )}
        </main>
      </SidebarProvider>

      <Footer />
    </div>
  )
}