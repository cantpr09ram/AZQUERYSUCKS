"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ScheduledCourse } from "@/types/course";
import {
  applyCourseFilters,
  DAY_OPTIONS,
  getDepartmentOptions,
  PERIOD_OPTIONS,
} from "@/utils/course-filters";
import { hasScheduleTimes } from "@/utils/course-times";
import Pagination from "./Pagination";

type Interval = { day: number; start: number; end: number };
function toIntervals(course: ScheduledCourse): Interval[] {
  if (!hasScheduleTimes(course)) return [];

  const out: Interval[] = [];
  for (
    let i = 0;
    i <
    Math.min(course.day.length, course.startTime.length, course.endTime.length);
    i++
  ) {
    out.push({
      day: course.day[i],
      start: course.startTime[i],
      end: course.endTime[i],
    });
  }
  return out;
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

  const departments = useMemo(() => getDepartmentOptions(courses), [courses]);

  const deferredSearchTerm = useDeferredValue(searchTerm);

  const filterState = useMemo(
    () => ({
      searchTerm: deferredSearchTerm,
      department: selectedDepartment,
      grade: selectedGrade,
      required: selectedRequired,
      weekday: selectedWeekday,
      startTime: selectStartTime,
      endTime: selectEndTime,
    }),
    [
      deferredSearchTerm,
      selectEndTime,
      selectStartTime,
      selectedDepartment,
      selectedGrade,
      selectedRequired,
      selectedWeekday,
    ],
  );

  const filteredCourses = useMemo(() => {
    return applyCourseFilters(courses, filterState);
  }, [courses, filterState]);

  // 計算每筆的衝突狀態（相依 selectedCourses）
  const withConflict = useMemo(() => {
    return filteredCourses.map((c) => ({
      course: c,
      conflict: hasConflict(c, selectedCourses),
    }));
  }, [filteredCourses, selectedCourses]);

  const totalPages = Math.max(
    1,
    Math.ceil(withConflict.length / coursesPerPage),
  );

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginated = useMemo(() => {
    const startIndex = (currentPage - 1) * coursesPerPage;
    return withConflict.slice(startIndex, startIndex + coursesPerPage);
  }, [withConflict, currentPage]);

  const listRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: paginated.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 110,
    overscan: 6,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setCurrentPage(1);
  };

  const handleGradeChange = (value: string) => {
    setSelectedGrade(value);
    setCurrentPage(1);
  };

  const handleRequiredChange = (value: string) => {
    setSelectedRequired(value);
    setCurrentPage(1);
  };

  const handleWeekdayChange = (value: string) => {
    setSelectedWeekday(value);
    setCurrentPage(1);
  };

  const handleStartTimeChange = (value: number) => {
    setSelectedStartTime(value);
    setCurrentPage(1);
  };

  const handleEndTimeChange = (value: number) => {
    setSelectedEndTime(value);
    setCurrentPage(1);
  };

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
    <div className="p-5 bg-card border-r border-border flex flex-col max-h-250 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-2 md:gap-3 lg:flex-row lg:items-center lg:gap-3">
        {/* All selects in one horizontal row on lg+ */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 md:gap-3 lg:flex-row lg:flex-nowrap lg:gap-3 lg:order-1">
          {/* Department */}
          <div className="relative flex-1 sm:flex-none min-w-0 lg:min-w-[160px]">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
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
                          onSelect={(value) => {
                            const nextValue =
                              value === selectedDepartment ? "" : value;
                            handleDepartmentChange(nextValue);
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
            <Select value={selectedGrade} onValueChange={handleGradeChange}>
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
                {["所有年段", "0", "1", "2", "3", "4", "5"].map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Required */}
          <div className="relative flex-1 sm:flex-none min-w-0 lg:min-w-[110px]">
            <Select
              value={selectedRequired}
              onValueChange={handleRequiredChange}
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
                onValueChange={handleWeekdayChange}
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
                  {DAY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start */}
            <div className="relative min-w-0">
              <Select
                value={String(selectStartTime)}
                onValueChange={(value) => handleStartTimeChange(Number(value))}
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
                  {PERIOD_OPTIONS.map((period) => (
                    <SelectItem key={period} value={String(period)}>
                      {String(period)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* End */}
            <div className="relative min-w-0">
              <Select
                value={String(selectEndTime)}
                onValueChange={(value) => handleEndTimeChange(Number(value))}
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
                  {PERIOD_OPTIONS.map((period) => (
                    <SelectItem key={period} value={String(period)}>
                      {String(period)}
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
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full text-base sm:text-xs md:text-sm bg-card border border-border rounded-md 
                      pl-9 sm:pl-8 md:pl-10 pr-3 md:pr-4 py-2 sm:py-1.5 text-foreground placeholder:text-muted-foreground 
                      focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      {/* Course List */}
      <div ref={listRef} className="py-5 flex-1 overflow-y-auto">
        <div
          className="relative"
          style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        >
          {virtualItems.map((virtualRow) => {
            const { course, conflict } = paginated[virtualRow.index];
            const selected = isSelected(course.seq);
            return (
              <div
                key={
                  course.seq ??
                  `${course.code}-${course.class}-${course.group ?? ""}-${course.title}-${virtualRow.index}`
                }
                className="absolute left-0 top-0 w-full"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                <Card
                  aria-disabled={conflict}
                  className={`p-1 mb-2 transition-colors ${
                    conflict
                      ? "opacity-60 cursor-not-allowed border-destructive"
                      : "cursor-pointer hover:bg-accent/50"
                  } ${selected ? "bg-accent/20 border-accent" : ""}`}
                  onClick={() => handleCourseToggle(course, conflict)}
                  title={conflict ? "時間衝突，無法選取" : ""}
                >
                  <div className="flex items-start gap-3 p-1">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        aria-label={`選擇 ${course.title || course.code || "課程"}`}
                        checked={selected}
                        disabled={conflict}
                        onChange={(event) => {
                          event.stopPropagation();
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
              </div>
            );
          })}
        </div>
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
