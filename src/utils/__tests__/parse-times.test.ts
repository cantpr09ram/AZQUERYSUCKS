import { describe, expect, it } from "vitest";
import { parseTimes } from "@/utils/parse-times";

describe("parseTimes", () => {
  it("parses single range with place", () => {
    const result = parseTimes(["Mon / 6-8 / E 219"]);
    expect(result.day).toEqual([1]);
    expect(result.startTime).toEqual([6]);
    expect(result.endTime).toEqual([8]);
    expect(result.place).toEqual(["E219"]);
  });

  it("merges consecutive periods and supports multiple lines", () => {
    const result = parseTimes(["二/3-4/RoomA", "二/6,7,8/RoomB"]);
    expect(result.day).toEqual([2, 2]);
    expect(result.startTime).toEqual([3, 6]);
    expect(result.endTime).toEqual([4, 8]);
    expect(result.place).toEqual(["RoomA", "RoomB"]);
  });

  it("splits non-consecutive periods into multiple intervals", () => {
    const result = parseTimes(["7/3,5/RoomC"]);
    expect(result.day).toEqual([7, 7]);
    expect(result.startTime).toEqual([3, 5]);
    expect(result.endTime).toEqual([3, 5]);
    expect(result.place).toEqual(["RoomC", "RoomC"]);
  });

  it("handles reversed ranges and alternate separators", () => {
    const result = parseTimes(["Sun/8~6/Lab"]);
    expect(result.day).toEqual([7]);
    expect(result.startTime).toEqual([6]);
    expect(result.endTime).toEqual([8]);
  });

  it("skips invalid entries", () => {
    const result = parseTimes(["Foo/1/Room", "Mon/x/Room"]);
    expect(result.day).toEqual([]);
    expect(result.startTime).toEqual([]);
    expect(result.endTime).toEqual([]);
    expect(result.place).toEqual([]);
  });

  it("returns empty arrays for missing input", () => {
    const result = parseTimes(undefined);
    expect(result.day).toEqual([]);
    expect(result.startTime).toEqual([]);
    expect(result.endTime).toEqual([]);
    expect(result.place).toEqual([]);
  });
});
