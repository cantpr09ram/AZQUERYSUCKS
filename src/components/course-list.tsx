"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { ScheduledCourse } from "@/types/course"
import { Search } from "lucide-react"
import Pagination from "./Pagination"
import { v4 as uuidv4 } from "uuid";

// 若你的資料已預先 parse，可刪掉這段並直接用 course.day/startTime/endTime
type Interval = { day: number, start: number, end: number }
function toIntervals(c: ScheduledCourse): Interval[] {
  // 假設 ScheduledCourse 內已有 parse 後欄位（推薦）
  if (Array.isArray((c as any).day) && Array.isArray((c as any).startTime) && Array.isArray((c as any).endTime)) {
    const d = (c as any).day as number[]
    const s = (c as any).startTime as number[]
    const e = (c as any).endTime as number[]
    const out: Interval[] = []
    for (let i = 0; i < Math.min(d.length, s.length, e.length); i++) {
      out.push({ day: d[i], start: s[i], end: e[i] })
    }
    return out
  }
  // 後備：若只有文字 times，可在此呼叫你的 parseTimes(times: string[])
  // return parseTimes(c.times).map(...)
  return []
}

function overlaps(a: Interval, b: Interval): boolean {
  if (a.day !== b.day) return false
  // 有交集：a.start <= b.end 且 b.start <= a.end
  return a.start <= b.end && b.start <= a.end
}

function hasConflict(target: ScheduledCourse, selected: ScheduledCourse[]): boolean {
  // 如果這堂課已經被選擇，不需要顯示衝突
  if (selected.some(s => s.seq === target.seq)) {
    return false
  }

  const t = toIntervals(target)
  if (t.length === 0) return false

  for (const s of selected) {
    const si = toIntervals(s)
    for (const i1 of t) for (const i2 of si) {
      if (overlaps(i1, i2)) return true
    }
  }
  return false
}


interface CourseListProps {
  courses: ScheduledCourse[]
  onCourseSelect: (course: ScheduledCourse) => void
  onCourseRemove: (courseId: string) => void
  selectedCourses: ScheduledCourse[]
}

export function CourseList({ courses, onCourseSelect, onCourseRemove, selectedCourses }: CourseListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("所有系所")
  const [currentPage, setCurrentPage] = useState(1)
  const coursesPerPage = 6

  const departments = [
    "所有系所",
    ...Array.from(
      new Set(
        courses.map(({ dept_block }) => {
          const s = String(dept_block || "").trim().replace(/\s+/g, " ");
          const afterDot = s.split(".", 2)[1] ?? s;
          return afterDot.trimStart().split(/\s+/, 1)[0];
        })
      )
    ),
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      (course.code && course.code.includes(searchTerm)) ||
      (course.title && course.title.includes(searchTerm)) ||
      (course.teacher && course.teacher.includes(searchTerm)) ||
      (course.seq && course.seq.includes(searchTerm)) ||
      (Array.isArray(course.place) && course.place.some(p => p.includes(searchTerm)))

    const matchesDepartment = selectedDepartment === "所有系所" || course.dept_block.includes(selectedDepartment)
    return matchesSearch && matchesDepartment
  })

  // 計算每筆的衝突狀態（相依 selectedCourses）
  const withConflict = useMemo(() => {
    return filteredCourses.map(c => ({
      course: c,
      conflict: hasConflict(c, selectedCourses)
    }))
  }, [filteredCourses, selectedCourses])

  const totalPages = Math.ceil(withConflict.length / coursesPerPage)
  const startIndex = (currentPage - 1) * coursesPerPage
  const paginated = withConflict.slice(startIndex, startIndex + coursesPerPage)

  const isSelected = (courseId: string) => selectedCourses.some((course) => course.seq === courseId)

  const handleCourseToggle = (course: ScheduledCourse, conflict: boolean) => {
    if (conflict) return // 衝突則禁止選取
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

        <select
          value={selectedDepartment}
          onChange={e => setSelectedDepartment(e.target.value)}
          className="appearance-none bg-card border border-border rounded-lg px-4 py-2 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-2"
        >
          {departments.map(dept => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
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
          <span>課程資訊</span>
        </div>

        {paginated.map(({ course, conflict }) => (
          <Card
            key={uuidv4()}
            className={`p-3 transition-colors ${
              conflict
                ? "opacity-60 cursor-not-allowed border-destructive"
                : "cursor-pointer hover:bg-accent/50"
            } ${isSelected(course.seq) ? "bg-accent/20 border-accent" : ""}`}
            onClick={() => handleCourseToggle(course, conflict)}
            aria-disabled={conflict}
            title={conflict ? "時間衝突，無法選取" : ""}
          >
            <div className="flex items-start gap-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isSelected(course.seq)}
                  disabled={conflict}
                  onChange={(e) => {
                    e.stopPropagation()
                    handleCourseToggle(course, conflict)
                  }}
                  className="w-4 h-4 text-accent bg-background border-border rounded focus:ring-accent disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{course.code}</span>
                  <span className="text-sm font-medium">{course.title}</span>
                  {conflict && (
                    <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">
                      時間衝突
                    </span>
                  )}
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div>學分 {course.credits}</div>
                  <div>
                    {course.teacher} | {course.times}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        window={0}
      />
    </div>
  )
}
