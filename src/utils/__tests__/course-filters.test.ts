import { describe, expect, it } from "vitest";
import type { ScheduledCourse } from "@/types/course";
import {
  allDepartmentsLabel,
  allGradesLabel,
  allRequiredLabel,
  applyCourseFilters,
  getDepartmentOptions,
} from "@/utils/course-filters";

const courseOne: ScheduledCourse = {
  source: "local",
  dept_block: "AA.CS Science",
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
  title: "Intro to CS",
  cap: 30,
  teacher: "Dr Ada",
  times: [],
  english_taught: false,
  place: ["RoomA"],
  day: [1],
  startTime: [1],
  endTime: [2],
};

const courseTwo: ScheduledCourse = {
  source: "local",
  dept_block: "BB.Math",
  grade: "2",
  seq: "002",
  code: "MATH200",
  major: null,
  term_order: "1",
  class: "1",
  group_div: null,
  required: "選修",
  credits: 3,
  group: "",
  title: "Discrete Math",
  cap: 40,
  teacher: "Dr Turing",
  times: [],
  english_taught: false,
  place: ["RoomB"],
  day: [3],
  startTime: [5],
  endTime: [6],
};

describe("getDepartmentOptions", () => {
  it("extracts department labels from dept_block", () => {
    const options = getDepartmentOptions([courseOne, courseTwo]);
    expect(options).toContain(allDepartmentsLabel);
    expect(options).toContain("CS");
    expect(options).toContain("Math");
  });
});

describe("applyCourseFilters", () => {
  it("filters by search term", () => {
    const result = applyCourseFilters([courseOne, courseTwo], {
      searchTerm: "CS101",
      department: allDepartmentsLabel,
      grade: allGradesLabel,
      required: allRequiredLabel,
      weekday: "0",
      startTime: 0,
      endTime: 0,
    });

    expect(result).toEqual([courseOne]);
  });

  it("returns empty when search term does not match", () => {
    const result = applyCourseFilters([courseOne, courseTwo], {
      searchTerm: "NOPE",
      department: allDepartmentsLabel,
      grade: allGradesLabel,
      required: allRequiredLabel,
      weekday: "0",
      startTime: 0,
      endTime: 0,
    });

    expect(result).toEqual([]);
  });

  it("filters by department, grade, required, weekday", () => {
    const result = applyCourseFilters([courseOne, courseTwo], {
      searchTerm: "",
      department: "Math",
      grade: "2",
      required: "選修",
      weekday: "3",
      startTime: 0,
      endTime: 0,
    });

    expect(result).toEqual([courseTwo]);
  });

  it("returns empty when weekday does not match", () => {
    const result = applyCourseFilters([courseOne, courseTwo], {
      searchTerm: "",
      department: allDepartmentsLabel,
      grade: allGradesLabel,
      required: allRequiredLabel,
      weekday: "4",
      startTime: 0,
      endTime: 0,
    });

    expect(result).toEqual([]);
  });

  it("returns empty for time range when course lacks schedule", () => {
    const courseWithoutSchedule: ScheduledCourse = {
      ...courseOne,
      day: undefined,
      startTime: undefined,
      endTime: undefined,
    };

    const result = applyCourseFilters([courseWithoutSchedule], {
      searchTerm: "",
      department: allDepartmentsLabel,
      grade: allGradesLabel,
      required: allRequiredLabel,
      weekday: "0",
      startTime: 1,
      endTime: 2,
    });

    expect(result).toEqual([]);
  });

  it("ignores time range when invalid", () => {
    const courseWithoutSchedule: ScheduledCourse = {
      ...courseTwo,
      day: undefined,
      startTime: undefined,
      endTime: undefined,
    };

    const result = applyCourseFilters([courseWithoutSchedule], {
      searchTerm: "",
      department: allDepartmentsLabel,
      grade: allGradesLabel,
      required: allRequiredLabel,
      weekday: "0",
      startTime: 3,
      endTime: 0,
    });

    expect(result).toEqual([courseWithoutSchedule]);
  });

  it("filters by time range", () => {
    const result = applyCourseFilters([courseOne, courseTwo], {
      searchTerm: "",
      department: allDepartmentsLabel,
      grade: allGradesLabel,
      required: allRequiredLabel,
      weekday: "0",
      startTime: 1,
      endTime: 2,
    });

    expect(result).toEqual([courseOne]);
  });
});
