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
  const [selectedWeekday, setSelectedWeekday] = useState("0");
  const [selectStartTime, setSelectedStartTime] = useState(0);
  const [selectEndTime, setSelectedEndTime] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = useState(false);
  const coursesPerPage = 8;

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

  const DAY_OPTS = [
    { v: "0", label: "整週" },
    { v: "1", label: "一 / Mon" },
    { v: "2", label: "二 / Tue" },
    { v: "3", label: "三 / Wed" },
    { v: "4", label: "四 / Thu" },
    { v: "5", label: "五 / Fri" },
    { v: "6", label: "六 / Sat" },
    { v: "7", label: "日 / Sun" },
  ];

  const PERIOD_OPTS = Array.from({ length: 15 }, (_, i) => i);

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
    const matchesWeekDay =
      selectedWeekday === "0" ||
      (Array.isArray(course.day) &&
        course.day.includes(Number(selectedWeekday)));

    if (selectStartTime <= selectEndTime) {
      const matchesStartEnd =
        (selectStartTime === 0 && selectEndTime === 0) ||
        (Array.isArray(course.startTime) &&
          Array.isArray(course.endTime) &&
          course.startTime.some((s, i) => {
            const e = course.endTime![i];
            return s >= selectStartTime && e <= selectEndTime;
          }));
      return (
        matchesSearch &&
        matchesDepartment &&
        matchesGrade &&
        matchesRequired &&
        matchesWeekDay &&
        matchesStartEnd
      );
    }
    return (
      matchesSearch &&
      matchesDepartment &&
      matchesGrade &&
      matchesRequired &&
      matchesWeekDay
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
    <div className="p-5 bg-card border-r border-border flex flex-col max-h-250 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col gap-2 md:gap-3 lg:flex-row lg:items-center lg:gap-3">
        {/* All selects in one horizontal row on lg+ */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 md:gap-3 lg:flex-row lg:flex-nowrap lg:gap-3 lg:order-1">
          {/* Department */}
          <div className="relative flex-1 sm:flex-none min-w-0 lg:min-w-[160px]">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="
                    w-full justify-between
                    text-base sm:text-xs md:text-sm
                    bg-card border border-border text-foreground
                    px-4 py-2 sm:px-3 sm:py-1.5 md:px-4 md:py-2
                  "
                >
                  {selectedDepartment ? selectedDepartment : "找科系..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>

              {/* 對齊 Trigger 寬度 */}
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover text-popover-foreground">
                <Command className="bg-popover text-popover-foreground">
                  <CommandInput placeholder="找科系..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>無結果</CommandEmpty>
                    <CommandGroup>
                      {departments.map((department) => (
                        <CommandItem
                          key={department}
                          value={department}
                          className="text-popover-foreground"
                          onSelect={(v) => {
                            setSelectedDepartment(
                              v === selectedDepartment ? "" : v,
                            );
                            setOpen(false);
                          }}
                        >
                          <span className="truncate">{department}</span>
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
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
          </div>

          {/* Grade */}
          <div className="relative flex-1 sm:flex-none min-w-0 lg:min-w-[120px]">
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger
                className="
                  w-full text-base sm:text-xs md:text-sm
                  bg-card border border-border rounded-md
                  px-4 py-2 sm:px-3 sm:py-1.5 md:px-4 md:py-2
                  pr-10 sm:pr-8
                  text-foreground focus:outline-none focus:ring-2 focus:ring-primary
                  [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-3 sm:[&>svg]:h-3 md:[&>svg]:w-4 md:[&>svg]:h-4
                "
              >
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
          </div>

          {/* Required */}
          <div className="relative flex-1 sm:flex-none min-w-0 lg:min-w-[110px]">
            <Select
              value={selectedRequired}
              onValueChange={setSelectedRequired}
            >
              <SelectTrigger
                className="
                  w-full text-base sm:text-xs md:text-sm
                  bg-card border border-border rounded-md
                  px-4 py-2 sm:px-3 sm:py-1.5 md:px-4 md:py-2
                  pr-10 sm:pr-8
                  text-foreground focus:outline-none focus:ring-2 focus:ring-primary
                  [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-3 sm:[&>svg]:h-3 md:[&>svg]:w-4 md:[&>svg]:h-4
                "
              >
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

          {/* Time-related filters */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-3 md:gap-4">
            {/* Day */}
            <div className="relative col-span-2 sm:col-span-1 sm:flex-1 min-w-0">
              <Select
                value={selectedWeekday}
                onValueChange={setSelectedWeekday}
              >
                <SelectTrigger
                  className="
                    w-full text-base sm:text-xs md:text-sm
                    bg-card border border-border rounded-md
                    px-4 py-2 sm:px-3 sm:py-1.5 md:px-4 md:py-2
                    pr-10 sm:pr-8
                    text-foreground focus:outline-none focus:ring-2 focus:ring-primary
                    [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-3 sm:[&>svg]:h-3 md:[&>svg]:w-4 md:[&>svg]:h-4
                  "
                >
                  <SelectValue placeholder="星期" />
                </SelectTrigger>
                <SelectContent>
                  {DAY_OPTS.map((d) => (
                    <SelectItem key={d.v} value={d.v}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start */}
            <div className="relative min-w-0">
              <Select
                value={String(selectStartTime)}
                onValueChange={(v) => setSelectedStartTime(Number(v))}
              >
                <SelectTrigger
                  className="
                    w-full text-base sm:text-xs md:text-sm
                    bg-card border border-border rounded-md
                    px-4 py-2 sm:px-3 sm:py-1.5 md:px-4 md:py-2
                    pr-10 sm:pr-8
                    text-foreground focus:outline-none focus:ring-2 focus:ring-primary
                    [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-3 sm:[&>svg]:h-3 md:[&>svg]:w-4 md:[&>svg]:h-4
                  "
                >
                  <SelectValue placeholder="開始" />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTS.map((p) => (
                    <SelectItem key={p} value={String(p)}>
                      {String(p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* End */}
            <div className="relative min-w-0">
              <Select
                value={String(selectEndTime)}
                onValueChange={(v) => setSelectedEndTime(Number(v))}
              >
                <SelectTrigger
                  className="
                    w-full text-base sm:text-xs md:text-sm
                    bg-card border border-border rounded-md
                    px-4 py-2 sm:px-3 sm:py-1.5 md:px-4 md:py-2
                    pr-10 sm:pr-8
                    text-foreground focus:outline-none focus:ring-2 focus:ring-primary
                    [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-3 sm:[&>svg]:h-3 md:[&>svg]:w-4 md:[&>svg]:h-4
                  "
                >
                  <SelectValue placeholder="結束" />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTS.map((p) => (
                    <SelectItem key={p} value={String(p)}>
                      {String(p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Search: sits on the right on lg+, full-width on small */}
        <div className="relative lg:ml-auto lg:flex-1 lg:max-w-[480px] xl:max-w-[640px] lg:order-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-3 sm:h-3" />
          <Input
            type="text"
            placeholder="課名、教師、地點、代號.."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-base sm:text-xs md:text-sm bg-card border border-border rounded-md 
                      pl-9 sm:pl-8 md:pl-10 pr-3 md:pr-4 py-2 sm:py-1.5 text-foreground placeholder:text-muted-foreground 
                      focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      {/* Course List */}
      <div className="py-5 flex1 space-y-2">
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
            <div className="flex items-start gap-3 p-1">
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
        window={2}
      />
    </div>
  );
}
