"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ScheduledCourse } from "@/types/course"
import { X, Share, QrCode } from "lucide-react"

interface WeeklyScheduleProps {
  scheduledCourses: ScheduledCourse[]
  onCourseRemove: (courseId: string) => void
}

const days = ["一", "二", "三", "四", "五", "六", "日"]
const timeSlots = Array.from({ length: 14 }, (_, i) => i + 1) // 1..14

export function WeeklySchedule({ scheduledCourses, onCourseRemove }: WeeklyScheduleProps) {
  // 回傳「在該日該節次覆蓋到的第一門課」（如有多門重疊仍取第一門）
  const getCourseAtSlot = (day: number, time: number): ScheduledCourse | undefined => {
    return scheduledCourses.find(course => {
      if (!Array.isArray(course.day) || !Array.isArray(course.startTime) || !Array.isArray(course.endTime)) return false
      return course.day.some((d, i) => {
        const s = course.startTime![i]
        const e = course.endTime![i]
        // 覆蓋條件：該格時間 time 落在 s..e 之間
        return d === day && time >= s && time <= e
      })
    })
  }

  const totalCredits = Array.from(new Map(scheduledCourses.map(c => [c.seq, c])).values())
    .reduce((sum, c) => sum + (Number(c.credits) || 0), 0)

  return (
    <div className="flex-1 bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-foreground font-medium">課表</div>
            <div className="text-sm text-muted-foreground mt-1">
              {scheduledCourses.length} 門課程 / {totalCredits} 學分
            </div>
            <div className="text-xs text-muted-foreground">尚可修課學分數 { 25-totalCredits }</div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              分享課表
            </Button>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <div className="grid grid-cols-8 gap-1">
            {/* Header Row */}
            <div className="p-2 text-center text-sm font-medium text-muted-foreground">時段</div>
            {days.map((dayLabel) => (
              <div key={dayLabel} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {dayLabel}
              </div>
            ))}

            {/* Rows */}
            {timeSlots.map((slot) => (
              <React.Fragment key={`row-${slot}`}>
                {/* 時段欄 */}
                <div className="p-2 text-center text-sm text-muted-foreground border-r border-border">
                  {slot}
                </div>

                {/* 七日欄位 */}
                {days.map((dayLabel, dayIndex) => {
                  const course = getCourseAtSlot(dayIndex + 1, slot)

                  return (
                    <div
                      key={`${dayLabel}-${slot}`}
                      className="relative min-h-[80px] border border-border/50 hover:bg-accent/10 transition-colors"
                    >
                      {course && (
                        <Card className="absolute inset-1 bg-primary text-primary-foreground p-2">
                          <div className="pr-6 space-y-0.5">
                            <div className="text-xs font-medium">{course.code}</div>
                            <div className="text-xs truncate">{course.title}</div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-1 right-1 h-5 w-5 p-0 text-primary-foreground hover:bg-primary-foreground/20"
                            onClick={() => onCourseRemove(course.seq)}
                            aria-label="remove course"
                            title="移除此課程"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </Card>
                      )}
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
