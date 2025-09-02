"use client"

import { useState, useEffect } from "react"
import type { Course, ScheduledCourse } from "@/types/course"
import { v4 as uuidv4 } from "uuid";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, Copy, Check, Search } from "lucide-react"
import Pagination from "./Pagination"
import { Label } from "@radix-ui/react-select";

interface CourseInfoTableProps {
  courses: ScheduledCourse[]
}

export function CourseInfoTable({ courses }: CourseInfoTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("所有系所")
  const [selectedGrade, setSelectedGrade] = useState("所有年段")
  const [selectedRequired, setSelectedRequired] = useState("必/選修")
  const [selectedWeekday, setSelectedWeekday] = useState("0")
  const [selectStartTime, setSelectedStartTime] = useState(0)
  const [selectEndTime, setSelectedEndTime] = useState(0)

  const [currentPage, setCurrentPage] = useState(1)
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set())
  const itemsPerPage = 20
  // 
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItems((prev) => new Set(prev).add(id))
      setTimeout(() => {
        setCopiedItems((prev) => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
      }, 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }
  // Get unique departments
  const departments = [
    "所有系所",
    ...Array.from(
      new Set(
        courses.map(({ dept_block }) => {
          const s = String(dept_block || "").trim().replace(/\s+/g, " ");
          // 取第一個點後面的字，直到第一個空白為止
          const afterDot = s.split(".", 2)[1] ?? s;     // 去掉代碼與點
          return afterDot.trimStart().split(/\s+/, 1)[0]; // 取到第一個空白
        })
      )
    ),
  ];
  
  const DAY_OPTS = [
    { v: "0", label: "整週" },
    { v: "1", label: "一 / Mon" },
    { v: "2", label: "二 / Tue" },
    { v: "3", label: "三 / Wed" },
    { v: "4", label: "四 / Thu" },
    { v: "5", label: "五 / Fri" },
    { v: "6", label: "六 / Sat" },
    { v: "7", label: "日 / Sun" },
  ]

  const PERIOD_OPTS = Array.from({ length: 15 }, (_, i) => i) // 1..14 可依校務調整

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
    (course.code && course.code.includes(searchTerm)) ||
    (course.title && course.title.includes(searchTerm)) ||
    (course.teacher && course.teacher.includes(searchTerm)) ||
    (course.seq && course.seq.includes(searchTerm)) ||
    (Array.isArray(course.place) && course.place.some(p => p.includes(searchTerm)))

    const matchesDepartment = selectedDepartment === "所有系所" || course.dept_block.includes(selectedDepartment)
    const matchesGrade = selectedGrade === "所有年段" || String(course.grade) === selectedGrade;
    const matchesRequired = selectedRequired === "必/選修" || course.required === selectedRequired;
    const matchesWeekDay = selectedWeekday === "0" || Array.isArray(course.day) && course.day.includes(Number(selectedWeekday))

    if (selectStartTime <= selectEndTime) {
      const matchesStartEnd =
        (selectStartTime === 0 && selectEndTime === 0) ||
        (
          Array.isArray(course.startTime) &&
          Array.isArray(course.endTime) &&
          course.startTime.some((s, i) => {
            const e = course.endTime![i]
            return s >= selectStartTime && e <= selectEndTime
          })
        )
      return matchesSearch && matchesDepartment && matchesGrade && matchesRequired && matchesWeekDay && matchesStartEnd
    }
    return matchesSearch && matchesDepartment && matchesGrade && matchesRequired && matchesWeekDay
  })

  // Paginate courses
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage)
  const maxPage = totalPages < 3 ? totalPages : 3;
  const pages = Array.from({ length: maxPage }, (_, i) => i + 1)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage)
  //Keyborad shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
        return
      }

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault()
          setCurrentPage((prev) => Math.max(1, prev - 1))
          break
        case "ArrowRight":
          event.preventDefault()
          setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [totalPages])

  return (
    <div className="p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">選課資訊</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row mt-3 justify-between">
        <div className="flex gap-4">
          <div className="relative">
            {/*department */}
            <select
              value={selectedDepartment}
              onChange={e => setSelectedDepartment(e.target.value)}
              className="text-sm appearance-none bg-card border border-border rounded-lg px-4 py-2 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept.includes(")") ? dept.split(")")[0] + ")" : dept}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          {/*grade */}
          <div className="relative">
            <select
              value={selectedGrade}
              onChange={e => setSelectedGrade(e.target.value)}
              className="text-sm appearance-none bg-card border border-border rounded-lg px-4 py-2 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {["所有年段", "0", "1", "2", "3", "4"].map(grade => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          {/*required */}
          <div className="relative">
            <select
              value={selectedRequired}
              onChange={e => setSelectedRequired(e.target.value)}
              className="text-sm appearance-none bg-card border border-border rounded-lg px-4 py-2 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {["必/選修", "必", "選"].map(grade => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          {/*day */}
          <div className="relative">
            <select
              value={selectedWeekday}
              onChange={e => setSelectedWeekday(e.target.value)}
              className="text-sm appearance-none bg-card border border-border rounded-lg px-4 py-2 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {DAY_OPTS.map(day => (
                <option key={day.v} value={day.v}>
                  {day.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          {/*startTime */}
          <div className="relative">
            <select
              value={selectStartTime}
              onChange={e => setSelectedStartTime(Number(e.target.value))}
              className="text-sm appearance-none bg-card border border-border rounded-lg px-4 py-2 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {PERIOD_OPTS.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          {/*endTime */}
          <div className="relative">
            <select
              value={selectEndTime}
              onChange={e => setSelectedEndTime(Number(e.target.value))}
              className="text-sm appearance-none bg-card border border-border rounded-lg px-4 py-2 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {PERIOD_OPTS.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="搜尋課程代碼或課程名稱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-sm flex-1 bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden mt-3 space-y-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>開課序號</TableHead>
              <TableHead>課程代碼</TableHead>
              <TableHead className="min-w-[200px]">課程名稱</TableHead>
              <TableHead>學分</TableHead>
              <TableHead>必修</TableHead>
              <TableHead>教師</TableHead>
              <TableHead>時間地點</TableHead>
              <TableHead>系所名稱</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCourses.map((course, index) => (
              <TableRow key={uuidv4()} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                <TableCell className="font-mono">
                  <div className="flex items-center gap-2">
                    <span>{course.seq || ""}</span>
                    {course.seq && (
                      <button
                        onClick={() => copyToClipboard(course.seq, `seq-${course.seq}`)}
                        className="p-1 hover:bg-muted rounded transition-colors"
                        title="複製開課序號"
                      >
                        {copiedItems.has(`seq-${course.seq}`) ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3 text-muted-foreground" />
                        )}
                      </button>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono">{course.code || ""}</TableCell>
                <TableCell className="min-w-[200px] max-w-[300px]">
                  <div className="truncate" title={course.title || ""}>
                    {course.title || ""}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{course.credits || ""}</TableCell>
                <TableCell className="text-muted-foreground">{course.required || ""}</TableCell>
                <TableCell>{course.teacher || ""}</TableCell>
                <TableCell className="text-muted-foreground">{course.times?.join(" || ") || ""}</TableCell>
                <TableCell className="text-muted-foreground">
                  {
                    String(course.dept_block || "")
                      .trim()
                      .replace(/\s+/g, " ")
                      .split(".", 2)[1]
                      ?.trimStart()
                      .split(/\s+/, 1)[0]
                  }
                 </TableCell>
              </TableRow>
            ))}
            </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        window={2}
      />
    </div>
  )
}
