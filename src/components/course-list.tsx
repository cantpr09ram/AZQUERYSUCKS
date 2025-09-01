"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Course, ScheduledCourse } from "@/types/course"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

interface CourseListProps {
  courses: Course[]
  onCourseSelect: (course: Course) => void
  onCourseRemove: (courseId: string) => void
  selectedCourses: ScheduledCourse[]
}

export function CourseList({ courses, onCourseSelect, onCourseRemove, selectedCourses }: CourseListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const coursesPerPage = 100

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      (course.title?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      (course.code?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === "all" || course.dept_block === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage)
  const startIndex = (currentPage - 1) * coursesPerPage
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + coursesPerPage)

  const isSelected = (courseId: string) => {
    return selectedCourses.some((course) => course.seq === courseId)
  }

  const handleCourseToggle = (course: Course) => {
    if (isSelected(course.seq)) {
      onCourseRemove(course.seq)
    } else {
      onCourseSelect(course)
    }
  }

  return (
    <div className="w-96 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-4">課程選擇</h2>

        {/* Department Filter */}
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="mb-3">
            <SelectValue placeholder="所有系所" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有系所</SelectItem>
            <SelectItem value="歷史系">歷史系</SelectItem>
            <SelectItem value="藝術系">藝術系</SelectItem>
            <SelectItem value="數學系">數學系</SelectItem>
            <SelectItem value="語言系">語言系</SelectItem>
            <SelectItem value="國文系">國文系</SelectItem>
            <SelectItem value="商學系">商學系</SelectItem>
            <SelectItem value="中文系">中文系</SelectItem>
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="搜尋課程代碼或課程名稱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Course List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="flex justify-between items-center text-sm text-muted-foreground mb-3">
          <span>選課</span>
          <span>課程資訊</span>
        </div>

        {paginatedCourses.map((course) => (
          <Card
            key={course.seq}
            className={`p-3 cursor-pointer transition-colors hover:bg-accent/50 ${
              isSelected(course.seq) ? "bg-accent/20 border-accent" : ""
            } ${course.conflict ? "border-destructive" : ""}`}
            onClick={() => handleCourseToggle(course)}
          >
            <div className="flex items-start gap-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isSelected(course.seq)}
                  onChange={(e) => {
                    e.stopPropagation()
                    handleCourseToggle(course)
                  }}
                  className="w-4 h-4 text-accent bg-background border-border rounded focus:ring-accent"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{course.code}</span>
                  <span className="text-sm font-medium">{course.title}</span>
                  {/* {course.conflict && (
                    <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">
                      時間衝突
                    </span>
                  )} */}
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div>學分 {course.credits}-0</div>
                  <div>
                    {course.teacher} | {course.times}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <span className="text-sm text-muted-foreground">{currentPage}</span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <span className="text-sm text-muted-foreground ml-2">... {totalPages}</span>
        </div>
      </div>
    </div>
  )
}
