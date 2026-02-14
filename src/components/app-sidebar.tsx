import { Link } from "@tanstack/react-router";

import { CourseList } from "@/components/course-list";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { ScheduledCourse } from "@/types/course";

interface AppSidebarProps {
  activeTab: "schedule" | "info";
  setActiveTab: (tab: "schedule" | "info") => void;
  courses: ScheduledCourse[];
  onCourseSelect: (course: ScheduledCourse) => void;
  onCourseRemove: (courseId: string) => void;
  selectedCourses: ScheduledCourse[];
}

export function AppSidebar({
  activeTab,
  setActiveTab,
  courses,
  onCourseSelect,
  onCourseRemove,
  selectedCourses,
}: AppSidebarProps) {
  return (
    <Sidebar className="min-h-screen">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/">
                <span className="text-base font-semibold">AZQUERYSUCKS</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenuButton onClick={() => setActiveTab("schedule")}>
            排課模擬
          </SidebarMenuButton>
          <SidebarMenuButton onClick={() => setActiveTab("info")}>
            選課資訊
          </SidebarMenuButton>
        </SidebarGroup>

        <SidebarGroup>
          {activeTab !== "info" && (
            <CourseList
              courses={courses}
              onCourseSelect={onCourseSelect}
              onCourseRemove={onCourseRemove}
              selectedCourses={selectedCourses}
            />
          )}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
