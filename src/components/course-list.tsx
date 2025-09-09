"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ScheduledCourse } from "@/types/course";
import { Search } from "lucide-react";
import Pagination from "./Pagination";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Interval = { day: number; start: number; end: number };
function toIntervals(c: ScheduledCourse): Interval[] {
  if (
    Array.isArray((c as any).day) &&
    Array.isArray((c as any).startTime) &&
    Array.isArray((c as any).endTime)
  ) {
    const d = (c as any).day as number[];
    const s = (c as any).startTime as number[];
    const e = (c as any).endTime as number[];
    const out: Interval[] = [];
    for (let i = 0; i < Math.min(d.length, s.length, e.length); i++) {
      out.push({ day: d[i], start: s[i], end: e[i] });
    }
    return out;
  }
  return [];
}

const overlaps = (a: Interval, b: Interval): boolean => {
  if (a.day !== b.day) return false;
  return a.start <= b.end && b.start <= a.end;
};

function hasConflict(
  target: ScheduledCourse,
  selected: ScheduledCourse[],
): boolean {
  if (selected.some((s) => s.seq === target.seq)) {
    return false;
  }

  const t = toIntervals(target);
  if (t.length === 0) return false;

  for (const s of selected) {
    const si = toIntervals(s);
    for (const i1 of t)
      for (const i2 of si) {
        if (overlaps(i1, i2)) return true;
      }
  }
  return false;
}

interface CourseListProps {
  courses: ScheduledCourse[];
  onCourseSelect: (course: ScheduledCourse) => void;
  onCourseRemove: (courseId: string) => void;
  selectedCourses: ScheduledCourse[];
}

export function CourseList({
  courses,
  onCourseSelect,
  onCourseRemove,
  selectedCourses,
}: CourseListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("所有系所");
  const [selectedGrade, setSelectedGrade] = useState("所有年段");
  const [selectedRequired, setSelectedRequired] = useState("必/選修");
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = useState(false);
  const coursesPerPage = 6;

  const departments = [
    "所有系所",
    ...Array.from(
      new Set(
        courses.map(({ dept_block }) => {
          const s = String(dept_block || "")
            .trim()
            .replace(/\s+/g, " ");
          const afterDot = s.split(".", 2)[1] ?? s;
          return afterDot.trimStart().split(/\s+/, 1)[0];
        }),
      ),
    ),
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      (course.code && course.code.includes(searchTerm)) ||
      (course.title && course.title.includes(searchTerm)) ||
      (course.teacher && course.teacher.includes(searchTerm)) ||
      (course.seq && course.seq.includes(searchTerm)) ||
      (Array.isArray(course.place) &&
        course.place.some((p) => p.includes(searchTerm)));

    const matchesDepartment =
      selectedDepartment === "所有系所" ||
      course.dept_block.includes(selectedDepartment);
    const matchesGrade =
      selectedGrade === "所有年段" || String(course.grade) === selectedGrade;
    const matchesRequired =
      selectedRequired === "必/選修" || course.required === selectedRequired;
    return (
      matchesSearch && matchesDepartment && matchesGrade && matchesRequired
    );
  });

  // 計算每筆的衝突狀態（相依 selectedCourses）
  const withConflict = useMemo(() => {
    return filteredCourses.map((c) => ({
      course: c,
      conflict: hasConflict(c, selectedCourses),
    }));
  }, [filteredCourses, selectedCourses]);

  const totalPages = Math.ceil(withConflict.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const paginated = withConflict.slice(startIndex, startIndex + coursesPerPage);

  const isSelected = (courseId: string) =>
    selectedCourses.some((course) => course.seq === courseId);

  const handleCourseToggle = (course: ScheduledCourse, conflict: boolean) => {
    if (conflict) return; // 衝突則禁止選取
    if (isSelected(course.seq)) {
      onCourseRemove(course.seq);
    } else {
      onCourseSelect(course);
    }
  };

  return (
    <div className="w-68 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className=" border-b border-border pl-2 pb-5">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[250px] justify-between"
            >
              {selectedDepartment ? selectedDepartment : "找科系..."}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0">
            <Command>
              <CommandInput placeholder="找科系..." className="h-9" />
              <CommandList>
                <CommandEmpty>無結果</CommandEmpty>
                <CommandGroup>
                  {departments.map((department) => (
                    <CommandItem
                      key={department}
                      value={department}
                      onSelect={(currentValue) => {
                        setSelectedDepartment(
                          currentValue === selectedDepartment
                            ? ""
                            : currentValue,
                        );
                        setOpen(false);
                      }}
                    >
                      {department}
                      <Check
                        className={cn(
                          "ml-auto",
                          selectedDepartment === department
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Grade */}
        <div className="flex gap-4 pt-2">
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="所有年段" />
            </SelectTrigger>
            <SelectContent>
              {["所有年段", "0", "1", "2", "3", "4", "5"].map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Required */}
          <Select value={selectedRequired} onValueChange={setSelectedRequired}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="必/選修" />
            </SelectTrigger>
            <SelectContent>
              {["必/選修", "必", "選"].map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative pt-2">
          <Search className="absolute left-3 top-3/5 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="搜尋..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-[250px]"
          />
        </div>
      </div>

      {/* Course List */}
      <div className="flex1 space-y-2">
        {paginated.map(({ course, conflict }) => (
          <Card
            key={uuidv4()}
            className={`p-1 transition-colors ${
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
                    e.stopPropagation();
                    handleCourseToggle(course, conflict);
                  }}
                  className="w-4 h-4 text-accent bg-background border-border rounded focus:ring-accent disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                    {course.code}
                  </span>
                  <span
                    className="text-sm font-medium truncate block max-w-[200px]"
                    title={course.title || ""}
                  >
                    {course.title || ""}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div>學分 {course.credits}</div>
                  <div
                    className="truncate max-w-[250px]"
                    title={`${course.teacher || ""} | ${course.times || ""}`}
                  >
                    {course.teacher || ""} | {course.times || ""}
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
  );
}
