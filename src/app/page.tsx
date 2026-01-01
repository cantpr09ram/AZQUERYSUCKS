import { Suspense } from "react";
import { CourseSchedulerContent } from "@/components/course-scheduler-content";

export default function CourseScheduler() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CourseSchedulerContent />
    </Suspense>
  );
}
