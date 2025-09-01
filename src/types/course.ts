export interface Course {
  source: string
  dept_block: string
  grade: string
  seq: string
  code: string
  major: string | null
  term_order: string
  class: string
  group_div: string | null
  required: string
  credits: number
  group: string
  title: string
  cap: number
  teacher: string
  times: string[]
  english_taught: boolean
  note?: string
  conflict?: boolean
}

export interface ScheduledCourse extends Course {
  day: number // 0-6 (Monday-Sunday)
  startTime: number // 1-14 (time slots)
  endTime: number
}
