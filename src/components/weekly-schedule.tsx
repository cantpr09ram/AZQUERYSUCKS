"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ScheduledCourse } from "@/types/course"
import { X, Share, QrCode } from "lucide-react"
import React from "react"

interface WeeklyScheduleProps {
  scheduledCourses: ScheduledCourse[]
  onCourseRemove: (courseId: string) => void
}

const days = ["一", "二", "三", "四", "五", "六", "日"]
const timeSlots = ["A", "1", "2", "3", "4", "5", "6", "7", "B"]

export function WeeklySchedule({ scheduledCourses, onCourseRemove }: WeeklyScheduleProps) {
  const getCourseAtSlot = (day: number, time: number) => {
    return scheduledCourses.find((course) => course.day === day && time >= course.startTime && time <= course.endTime)
  }

  return (
    <div className="flex-1 bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">排課模擬器</h2>
            <div className="text-sm text-muted-foreground mt-1">1 門課程 2 學分</div>
            <div className="text-xs text-muted-foreground">尚可修課學分數 &gt;</div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              分享課表
            </Button>
            <Button variant="outline" size="sm">
              <QrCode className="w-4 h-4 mr-2" />
              匯出 QR Code
            </Button>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="p-4">
        <div className="grid grid-cols-8 gap-1">
          {/* Header Row */}
          <div className="p-2 text-center text-sm font-medium text-muted-foreground">時段</div>
          {days.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}

          {/* Time Slots */}
          {timeSlots.map((timeSlot, timeIndex) => (
            <React.Fragment key={`timeslot-${timeIndex}`}>
              <div
                key={`time-${timeSlot}`}
                className="p-2 text-center text-sm text-muted-foreground border-r border-border"
              >
                {timeSlot}
              </div>
              {days.map((day, dayIndex) => {
                const course = getCourseAtSlot(dayIndex, timeIndex + 1)

                return (
                  <div
                    key={`${day}-${timeSlot}`}
                    className="relative min-h-[60px] border border-border/50 hover:bg-accent/10 transition-colors"
                  >
                    {course && (
                      <Card className="absolute inset-1 bg-primary text-primary-foreground p-2 flex flex-col justify-between">
                        <div>
                          <div className="text-xs font-medium">{course.code}</div>
                          <div className="text-xs truncate">{course.title}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-1 right-1 h-4 w-4 p-0 text-primary-foreground hover:bg-primary-foreground/20"
                          onClick={() => onCourseRemove(course.seq)}
                        >
                          <X className="w-3 h-3" />
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
  )
}
