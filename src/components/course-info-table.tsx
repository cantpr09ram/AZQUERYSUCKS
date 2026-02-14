"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Check, ChevronsUpDown, Copy, Search } from "lucide-react";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

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
  allDepartmentsLabel,
  allGradesLabel,
  allRequiredLabel,
  applyCourseFilters,
  DAY_OPTIONS,
  getDepartmentOptions,
  PERIOD_OPTIONS,
} from "@/utils/course-filters";
import Pagination from "./Pagination";

const MAX_PERIOD = Math.max(...PERIOD_OPTIONS);

const baseFilterSchema = z.object({
  searchTerm: z.string().default(""),
  department: z.string().default(allDepartmentsLabel),
  grade: z.string().default(allGradesLabel),
  required: z.string().default(allRequiredLabel),
  weekday: z.string().default("0"),
  startTime: z.number().int().min(0).max(MAX_PERIOD),
  endTime: z.number().int().min(0).max(MAX_PERIOD),
});

type BaseFilterValues = z.infer<typeof baseFilterSchema>;

const filterSchema = baseFilterSchema.superRefine(
  (data: BaseFilterValues, ctx: z.RefinementCtx) => {
    if (data.startTime === 0 || data.endTime === 0) return;
    if (data.startTime > data.endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "開始時間不能晚於結束時間",
        path: ["endTime"],
      });
    }
  },
);

type FilterFormInput = z.input<typeof filterSchema>;
type ColumnMeta = { className?: string };

const getDepartmentLabel = (course: ScheduledCourse) =>
  String(course.dept_block || "")
    .trim()
    .replace(/\s+/g, " ")
    .split(".", 2)[1]
    ?.trimStart()
    .split(/\s+/, 1)[0] ?? "";

interface CourseInfoTableProps {
  courses: ScheduledCourse[];
}

export function CourseInfoTable({ courses }: CourseInfoTableProps) {
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const itemsPerPage = 20;

  const form = useForm<FilterFormInput>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      searchTerm: "",
      department: allDepartmentsLabel,
      grade: allGradesLabel,
      required: allRequiredLabel,
      weekday: "0",
      startTime: 0,
      endTime: 0,
    },
  });

  const { control, formState } = form;
  const watchedValues =
    (useWatch({ control }) as FilterFormInput | undefined) ?? form.getValues();
  const {
    searchTerm,
    department: selectedDepartment,
    grade: selectedGrade,
    required: selectedRequired,
    weekday: selectedWeekday,
    startTime: selectStartTime,
    endTime: selectEndTime,
  } = watchedValues;

  const timeRangeError = formState.errors.endTime?.message;

  const copyToClipboard = useCallback(async (text: string, id: string) => {
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
  }, []);
  const departments = useMemo(() => getDepartmentOptions(courses), [courses]);

  const deferredSearchTerm = useDeferredValue(searchTerm ?? "");

  const filterState = useMemo(
    () => ({
      searchTerm: deferredSearchTerm,
      department: selectedDepartment ?? allDepartmentsLabel,
      grade: selectedGrade ?? allGradesLabel,
      required: selectedRequired ?? allRequiredLabel,
      weekday: selectedWeekday ?? "0",
      startTime: selectStartTime ?? 0,
      endTime: selectEndTime ?? 0,
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

  const columns = useMemo<ColumnDef<ScheduledCourse, unknown>[]>(
    () => [
      {
        header: "開課序號",
        accessorKey: "seq",
        meta: { className: "w-20" },
        cell: ({ getValue }) => {
          const seq = String(getValue() ?? "");
          return (
            <div className="flex items-center gap-2">
              <span className="font-mono">{seq}</span>
              {seq && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(seq, `seq-${seq}`)}
                  className="p-1 hover:bg-muted rounded transition-colors"
                  title="複製開課序號"
                  aria-label="複製開課序號"
                >
                  {copiedItems.has(`seq-${seq}`) ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3 text-muted-foreground" />
                  )}
                </button>
              )}
            </div>
          );
        },
      },
      {
        header: "科目編號",
        accessorKey: "code",
        meta: { className: "w-18" },
        cell: ({ getValue }) => (
          <span className="font-mono">{String(getValue() ?? "")}</span>
        ),
      },
      {
        header: "課程名稱",
        accessorKey: "title",
        cell: ({ getValue }) => (
          <div className="truncate" title={String(getValue() ?? "")}>
            {String(getValue() ?? "")}
          </div>
        ),
      },
      {
        header: "學分",
        accessorKey: "credits",
        meta: { className: "w-10" },
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">
            {String(getValue() ?? "")}
          </span>
        ),
      },
      {
        header: "必修",
        accessorKey: "required",
        meta: { className: "w-10" },
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">
            {String(getValue() ?? "")}
          </span>
        ),
      },
      {
        header: "教師",
        accessorKey: "teacher",
        meta: { className: "w-30" },
        cell: ({ getValue }) => String(getValue() ?? ""),
      },
      {
        header: "時間地點",
        accessorKey: "times",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">
            {Array.isArray(getValue())
              ? (getValue() as string[]).join(" || ")
              : ""}
          </span>
        ),
      },
      {
        header: "系所名稱",
        accessorKey: "dept_block",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {getDepartmentLabel(row.original)}
          </span>
        ),
      },
    ],
    [copiedItems, copyToClipboard],
  );

  const table = useReactTable({
    data: paginatedCourses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row, index) => row.seq ?? row.code ?? String(index),
  });

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
            <Controller
              control={control}
              name="department"
              render={({ field }) => (
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
                      {field.value || "找科系..."}
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
                                field.onChange(value || allDepartmentsLabel);
                                setCurrentPage(1);
                                setOpen(false);
                              }}
                            >
                              <span className="truncate">{department}</span>
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  field.value === department
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
              )}
            />
          </div>

          {/* Grade */}
          <div className="relative flex-1 sm:flex-none min-w-0 lg:min-w-[120px]">
            <Controller
              control={control}
              name="grade"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setCurrentPage(1);
                  }}
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
                    <SelectValue placeholder={allGradesLabel} />
                  </SelectTrigger>
                  <SelectContent>
                    {[allGradesLabel, "0", "1", "2", "3", "4", "5"].map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Required */}
          <div className="relative flex-1 sm:flex-none min-w-0 lg:min-w-[110px]">
            <Controller
              control={control}
              name="required"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setCurrentPage(1);
                  }}
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
                    <SelectValue placeholder={allRequiredLabel} />
                  </SelectTrigger>
                  <SelectContent>
                    {[allRequiredLabel, "必", "選"].map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Time-related filters */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-3 md:gap-4">
            {/* Day */}
            <div className="relative col-span-2 sm:col-span-1 sm:flex-1 min-w-0">
              <Controller
                control={control}
                name="weekday"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setCurrentPage(1);
                    }}
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
                )}
              />
            </div>

            {/* Start */}
            <div className="relative min-w-0">
              <Controller
                control={control}
                name="startTime"
                render={({ field }) => (
                  <Select
                    value={String(field.value)}
                    onValueChange={(value) => {
                      field.onChange(Number(value));
                      setCurrentPage(1);
                    }}
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
                )}
              />
            </div>

            {/* End */}
            <div className="relative min-w-0">
              <Controller
                control={control}
                name="endTime"
                render={({ field }) => (
                  <Select
                    value={String(field.value)}
                    onValueChange={(value) => {
                      field.onChange(Number(value));
                      setCurrentPage(1);
                    }}
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
                )}
              />
            </div>
          </div>
          {timeRangeError ? (
            <p className="text-xs text-destructive sm:basis-full">
              {timeRangeError}
            </p>
          ) : null}
        </div>

        {/* Search: sits on the right on lg+, full-width on small */}
        <div className="relative lg:ml-auto lg:flex-1 lg:max-w-[480px] xl:max-w-[640px] lg:order-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-3 sm:h-3" />
          <Controller
            control={control}
            name="searchTerm"
            render={({ field }) => (
              <Input
                type="text"
                placeholder="課名、教師、地點、代號.."
                value={field.value}
                onChange={(event) => {
                  field.onChange(event);
                  setCurrentPage(1);
                }}
                className="w-full text-base sm:text-xs md:text-sm bg-card border border-border rounded-md 
                          pl-9 sm:pl-8 md:pl-10 pr-3 md:pr-4 py-2 sm:py-1.5 text-foreground placeholder:text-muted-foreground 
                          focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-3">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as
                    | ColumnMeta
                    | undefined;
                  return (
                    <TableHead key={header.id} className={meta?.className}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={
                  row.index % 2 === 0 ? "bg-background" : "bg-muted/20"
                }
              >
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as
                    | ColumnMeta
                    | undefined;
                  return (
                    <TableCell key={cell.id} className={meta?.className}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  );
                })}
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
