/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CourseInfoTable } from "@/components/course-info-table";
import type { ScheduledCourse } from "@/types/course";

const courses: ScheduledCourse[] = [
  {
    source: "test",
    dept_block: "AA.資訊工程",
    grade: "1",
    seq: "001",
    code: "CS101",
    major: null,
    term_order: "1",
    class: "A",
    group_div: null,
    required: "必",
    credits: 3,
    group: "1",
    title: "Introduction to CS",
    cap: 30,
    teacher: "Ada",
    times: ["一(1-2)"],
    english_taught: false,
  },
  {
    source: "test",
    dept_block: "BB.數學系",
    grade: "2",
    seq: "002",
    code: "MATH201",
    major: null,
    term_order: "1",
    class: "B",
    group_div: null,
    required: "選",
    credits: 2,
    group: "1",
    title: "高等數學",
    cap: 40,
    teacher: "Euler",
    times: ["二(3-4)"],
    english_taught: false,
  },
];

describe("CourseInfoTable", () => {
  it("filters by search term", async () => {
    const user = userEvent.setup();
    render(<CourseInfoTable courses={courses} />);

    expect(screen.getByText("Introduction to CS")).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText("課名、教師、地點、代號.."),
      "數學",
    );

    await waitFor(() => {
      expect(screen.queryByText("Introduction to CS")).not.toBeInTheDocument();
    });
  });
});
