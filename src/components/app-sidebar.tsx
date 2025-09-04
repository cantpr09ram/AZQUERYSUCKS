import {
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { DarkModeToggle } from "./dark-mode-toggle"
import { ScheduledCourse } from "@/types/course"
import { CourseList } from "@/components/course-list"

interface SideBarrProps {
  activeTab: "schedule" | "info"
  setActiveTab: (tab: "schedule" | "info") => void
  courses: ScheduledCourse[]
  onCourseSelect: (course: ScheduledCourse) => void
  onCourseRemove: (courseId: string) => void
  selectedCourses: ScheduledCourse[]
}

export function AppSidebar({ activeTab, setActiveTab, courses, onCourseSelect, onCourseRemove, selectedCourses }: SideBarrProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="">
                <span className="text-base font-semibold">AZQUERYSUCKS</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenuButton
            onClick={() => setActiveTab("schedule")}
          >
            排課模擬
          </SidebarMenuButton>
          <SidebarMenuButton
            onClick={() => setActiveTab("info")}
          >
            選課資訊
          </SidebarMenuButton>
        </SidebarGroup>
        
        <SidebarGroup>
          {activeTab === "info"?(
            <></>
        ) : (
          <CourseList
            courses={courses}
            onCourseSelect= {onCourseSelect}
            onCourseRemove={onCourseRemove}
            selectedCourses={selectedCourses}
          />
        )}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-3 py-3">
          <DarkModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}