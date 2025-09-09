"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ScheduledCourse } from "@/types/course";
import { X } from "lucide-react";
import { ExportCoursesDrawerDialog } from "@/components/export-courses";

interface WeeklyScheduleProps {
  scheduledCourses: ScheduledCourse[];
  onCourseRemove: (courseId: string) => void;
}

const days = ["一", "二", "三", "四", "五", "六", "日"];
const timeSlots = Array.from({ length: 14 }, (_, i) => i + 1); // 1..14

const COL_W = 100; // column width for each day
const TIME_W = 30; // width for the left "time" column
const ROW_H = 60; // row height
const HEAD_H = 20; // header height

export function WeeklySchedule({
  scheduledCourses,
  onCourseRemove,
}: WeeklyScheduleProps) {
  // 回傳「在該日該節次覆蓋到的第一門課」（如有多門重疊仍取第一門）
  const getCourseAtSlot = (
    day: number,
    time: number,
  ): ScheduledCourse | undefined => {
    return scheduledCourses.find((course) => {
      if (
        !Array.isArray(course.day) ||
        !Array.isArray(course.startTime) ||
        !Array.isArray(course.endTime)
      )
        return false;
      return course.day.some((d, i) => {
        const s = course.startTime![i];
        const e = course.endTime![i];
        // 覆蓋條件：該格時間 time 落在 s..e 之間
        return d === day && time >= s && time <= e;
      });
    });
  };

  const totalCredits = Array.from(
    new Map(scheduledCourses.map((c) => [c.seq, c])).values(),
  ).reduce((sum, c) => sum + (Number(c.credits) || 0), 0);

  return (
    <div className="overflow-x-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-border flex-shrink-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left block */}
          <div>
            <div className="mt-1 text-xs sm:text-sm text-muted-foreground">
              {scheduledCourses.length} 門課程 / {totalCredits} 學分
            </div>

            <div className="text-[11px] sm:text-xs text-muted-foreground">
              尚可修課學分數 {25 - totalCredits}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ExportCoursesDrawerDialog courses={scheduledCourses} />
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="overflow-x-scroll">
        <div
          className=" my-5"
          style={{ width: `${TIME_W + days.length * COL_W}px` }}
        >
          {/* let content width follow its size, overflow triggers horizontal scroll */}
          <div className="">
            <div
              className="inline-grid gap-px"
              style={{
                gridTemplateColumns: `${TIME_W}px repeat(${days.length}, ${COL_W}px)`,
                gridTemplateRows: `${HEAD_H}px repeat(${timeSlots.length}, ${ROW_H}px)`,
              }}
            >
              {/* Header Row */}
              <div className="sticky left-0 top-0 z-30 flex items-center justify-center bg-background text-sm font-medium text-muted-foreground">
                Time
              </div>
              {days.map((d) => (
                <div
                  key={d}
                  className="sticky top-0 z-20 flex items-center justify-center bg-background text-sm font-medium text-muted-foreground"
                >
                  {d}
                </div>
              ))}

              {/* Rows */}
              {timeSlots.map((slot) => (
                <React.Fragment key={`row-${slot}`}>
                  {/* Left time column fixed */}
                  <div className="sticky left-0 z-20 flex items-center justify-center bg-background text-sm text-muted-foreground">
                    {slot}
                  </div>

                  {/* Day cells: fixed width and height */}
                  {days.map((dayLabel, dayIndex) => {
                    const course = getCourseAtSlot(dayIndex + 1, slot);
                    return (
                      <div
                        key={`${dayLabel}-${slot}`}
                        className="relative box-border w-full h-full border border-border/50 hover:bg-accent/10 transition-colors overflow-hidden"
                      >
                        {course && (
                          <Card className="absolute inset-1 bg-primary text-primary-foreground p-2">
                            <div className="pr-6 space-y-0.5">
                              <div className="text-xs font-medium">
                                {course.code}
                              </div>
                              <div className="text-xs truncate">
                                {course.title}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-1 right-1 h-5 w-5 p-0 text-primary-foreground hover:bg-primary-foreground/20"
                              onClick={() => onCourseRemove(course.seq)}
                              aria-label="remove course"
                              title="Remove this course"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </Card>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
          {/* shadcn/ui scrollbars */}
        </div>
      </div>
    </div>
  );
}
