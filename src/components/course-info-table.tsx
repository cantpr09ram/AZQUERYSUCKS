"use client";

import { Check, ChevronsUpDown, Copy, Search } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ScheduledCourse } from "@/types/course";
import {
  applyCourseFilters,
  DAY_OPTIONS,
  getDepartmentOptions,
  PERIOD_OPTIONS,
} from "@/utils/course-filters";
import Pagination from "./Pagination";

interface CourseInfoTableProps {
  courses: ScheduledCourse[];
}

export function CourseInfoTable({ courses }: CourseInfoTableProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("所有系所");
  const [selectedGrade, setSelectedGrade] = useState("所有年段");
  const [selectedRequired, setSelectedRequired] = useState("必/選修");
  const [selectedWeekday, setSelectedWeekday] = useState("0");
  const [selectStartTime, setSelectedStartTime] = useState(0);
  const [selectEndTime, setSelectedEndTime] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const itemsPerPage = 20;
  //
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems((prev) => new Set(prev).add(id));
      setTimeout(() => {
        setCopiedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };
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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCourses.length / itemsPerPage),
  );

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCourses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCourses, currentPage]);

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

  //Keyborad shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          setCurrentPage((prev) => Math.max(1, prev - 1));
          break;
        case "ArrowRight":
          event.preventDefault();
          setCurrentPage((prev) => Math.min(totalPages, prev + 1));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalPages]);

  return (
    <div className="pt-6 px-6">
      {/* Filters */}
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

      {/* Table */}
      <div className="overflow-x-auto mt-3">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">開課序號</TableHead>
              <TableHead className="w-18">科目編號</TableHead>
              <TableHead className="">課程名稱</TableHead>
              <TableHead className="w-10">學分</TableHead>
              <TableHead className="w-10">必修</TableHead>
              <TableHead className="w-30">教師</TableHead>
              <TableHead>時間地點</TableHead>
              <TableHead>系所名稱</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCourses.map((course, index) => (
              <TableRow
                key={course.seq || `${course.code}-${index}`}
                className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
              >
                <TableCell className="font-mono">
                  <div className="flex items-center gap-2">
                    <span>{course.seq || ""}</span>
                    {course.seq && (
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(course.seq, `seq-${course.seq}`)
                        }
                        className="p-1 hover:bg-muted rounded transition-colors"
                        title="複製開課序號"
                        aria-label="複製開課序號"
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
                <TableCell>
                  <div className="truncate" title={course.title || ""}>
                    {course.title || ""}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {course.credits || ""}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {course.required || ""}
                </TableCell>
                <TableCell>{course.teacher || ""}</TableCell>
                <TableCell className="text-muted-foreground">
                  {course.times?.join(" || ") || ""}
                </TableCell>
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
  );
}
