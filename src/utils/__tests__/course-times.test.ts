import { describe, expect, it } from "vitest";
import type { ScheduledCourse } from "@/types/course";
import { hasScheduleTimes } from "@/utils/course-times";

describe("hasScheduleTimes", () => {
  it("returns true when schedule arrays exist", () => {
    const course: ScheduledCourse = {
      source: "local",
      dept_block: "AA.CS",
      grade: "1",
      seq: "001",
      code: "CS101",
      major: null,
      term_order: "1",
      class: "1",
      group_div: null,
      required: "必修",
      credits: 3,
      group: "",
      title: "Intro",
      cap: 30,
      teacher: "Dr X",
      times: [],
      english_taught: false,
      day: [1],
      startTime: [1],
      endTime: [2],
    };

    expect(hasScheduleTimes(course)).toBe(true);
  });

  it("returns false when schedule arrays are missing", () => {
    const course: ScheduledCourse = {
      source: "local",
      dept_block: "AA.CS",
      grade: "1",
      seq: "001",
      code: "CS101",
      major: null,
      term_order: "1",
      class: "1",
      group_div: null,
      required: "必修",
      credits: 3,
      group: "",
      title: "Intro",
      cap: 30,
      teacher: "Dr X",
      times: [],
      english_taught: false,
    };

    expect(hasScheduleTimes(course)).toBe(false);
  });
});
