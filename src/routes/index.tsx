import { createFileRoute } from "@tanstack/react-router";
import { CourseSchedulerContent } from "@/components/course-scheduler-content";
import { Route as RootRoute } from "./__root";

function normalizeSelectedCourses(value: unknown): string[] {
  const normalizeValue = (entry: string) =>
    entry
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  if (Array.isArray(value)) {
    return [
      ...new Set(
        value.flatMap((item) =>
          typeof item === "string" ? normalizeValue(item) : [],
        ),
      ),
    ];
  }

  if (typeof value === "string") {
    return [...new Set(normalizeValue(value))];
  }

  return [];
}

export const Route = createFileRoute("/")({
  getParentRoute: () => RootRoute,
  path: "/",
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => {
    const selectedCourses = normalizeSelectedCourses(search.selectedCourses);

    if (selectedCourses.length === 0) {
      return {};
    }

    return { selectedCourses };
  },
  component: Home,
});

function Home() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const selectedCourseSeqs = search.selectedCourses ?? [];

  const setSelectedCourseSeqs = (
    updater: (prev: string[]) => string[],
    replace = true,
  ) => {
    navigate({
      replace,
      search: (prev) => {
        const previous = normalizeSelectedCourses(prev.selectedCourses);
        const next = updater(previous);

        if (next.length === 0) {
          return {};
        }

        return { selectedCourses: next };
      },
    });
  };

  return (
    <CourseSchedulerContent
      selectedCourseSeqs={selectedCourseSeqs}
      setSelectedCourseSeqs={setSelectedCourseSeqs}
    />
  );
}
