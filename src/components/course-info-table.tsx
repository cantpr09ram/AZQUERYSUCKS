"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import type { Course } from "@/types/course"
import { v4 as uuidv4 } from "uuid";

interface CourseInfoTableProps {
  courses: Course[]
}

export function CourseInfoTable({ courses }: CourseInfoTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("所有系所")
  const [selectedGrade, setSelectedGrade] = useState("所有年段")
  const [selectedRequired, setSelectedRequired] = useState("必/選修")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 30

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

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
    course.code.includes(searchTerm) ||
    course.title.includes(searchTerm) ||
    course.teacher.includes(searchTerm) ||
    course.seq.includes(searchTerm)

    const matchesDepartment = selectedDepartment === "所有系所" || course.dept_block.includes(selectedDepartment)
    const matchesGrade = selectedGrade === "所有年段" || String(course.grade) === selectedGrade;
    const matchesRequired = selectedRequired === "必/選修" || course.required === selectedRequired;

    return matchesSearch && matchesDepartment && matchesGrade && matchesRequired
  })

  // Paginate courses
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage)
  const maxPage = totalPages < 3 ? totalPages : 3;
  const pages = Array.from({ length: maxPage }, (_, i) => i + 1)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">選課資訊</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative">
          <select
            value={selectedDepartment}
            onChange={e => setSelectedDepartment(e.target.value)}
            className="appearance-none bg-card border border-border rounded-lg px-4 py-2 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept.includes(")") ? dept.split(")")[0] + ")" : dept}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={selectedGrade}
            onChange={e => setSelectedGrade(e.target.value)}
            className="appearance-none bg-card border border-border rounded-lg px-4 py-2 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {["所有年段", "0", "1", "2", "3", "4"].map(grade => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={selectedRequired}
            onChange={e => setSelectedRequired(e.target.value)}
            className="appearance-none bg-card border border-border rounded-lg px-4 py-2 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {["必/選修", "必", "選"].map(grade => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>

        <input
          type="text"
          placeholder="搜尋課程代碼或課程名稱..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-card border border-border rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">開課序號</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">課程代碼</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">課程名稱</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">學分</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">必修</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">教師</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">時間地點</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">系所名稱</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCourses.map((course, index) => (
                <tr key={uuidv4()} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                <td className="px-4 py-3 text-sm text-foreground font-mono">{course.seq}</td>
                <td className="px-4 py-3 text-sm text-foreground font-mono">{course.code}</td>
                <td className="px-4 py-3 text-sm text-foreground">{course.title}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{course.credits}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{course.required}</td>
                <td className="px-4 py-3 text-sm text-foreground">{course.teacher}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{course.times.join(" || ")}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{String(course.dept_block || "").trim().replace(/\s+/g, " ").split(".", 2)[1]?.trimStart().split(/\s+/, 1)[0]}</td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border border-border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
        >
          &lt;
        </button>

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 text-sm border border-border rounded ${
              currentPage === page ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            {page}
          </button>
        ))}

        <span className="px-2 text-sm text-muted-foreground">...</span>

        <button
          onClick={() => setCurrentPage(totalPages)}
          className={`px-3 py-1 text-sm border border-border rounded ${
            currentPage === totalPages ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          }`}
        >
          {totalPages}
        </button>

        <button
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border border-border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
        >
          &gt;
        </button>
      </div>
    </div>
  )
}
