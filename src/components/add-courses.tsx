"use client";

import { Plus } from "lucide-react";
import * as React from "react";

import { CourseList } from "@/components/course-list";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { ScheduledCourse } from "@/types/course";

interface AddCoursesProps {
  courses: ScheduledCourse[];
  onCourseSelect: (course: ScheduledCourse) => void;
  onCourseRemove: (courseId: string) => void;
  selectedCourses: ScheduledCourse[];
}

export function AddCoursesDrawerDialog({
  courses,
  onCourseSelect,
  onCourseRemove,
  selectedCourses,
}: AddCoursesProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="secondary" size="lg">
            <Plus className="w-4 h-4 mr-2" />
            加入課程
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>加入課程</DialogTitle>
          </DialogHeader>
          {/* 傳入 courses */}
          <CourseList
            courses={courses}
            onCourseSelect={onCourseSelect}
            onCourseRemove={onCourseRemove}
            selectedCourses={selectedCourses}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button type="button" variant="secondary" size="lg">
          <Plus className="w-4 h-4 mr-2" />
          加入課程
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>加入課程</DrawerTitle>
        </DrawerHeader>
        <CourseList
          courses={courses}
          onCourseSelect={onCourseSelect}
          onCourseRemove={onCourseRemove}
          selectedCourses={selectedCourses}
        />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
