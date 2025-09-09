"use client";

import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Copy, Check, Share } from "lucide-react";

import { ScheduledCourse } from "@/types/course";

// 定義父元件的 props
interface ExportCoursesDrawerDialogProps {
  courses: ScheduledCourse[];
}

export function ExportCoursesDrawerDialog({
  courses,
}: ExportCoursesDrawerDialogProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Share className="w-4 h-4 mr-2" />
            匯出課表
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>匯出課表</DialogTitle>
            <DialogDescription className="flex items-center gap-1">
              <span>按</span>
              <Copy className="w-3 h-3 text-muted-foreground" />
              <span>來複製開課序號</span>
            </DialogDescription>
          </DialogHeader>
          {/* 傳入 courses */}
          <ExportCoursesTable courses={courses} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">
          <Share className="w-4 h-4 mr-2" />
          匯出課表
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>匯出課表</DrawerTitle>
          <DrawerDescription className="flex items-center gap-1">
            <span>按</span>
            <Copy className="w-3 h-3 text-muted-foreground" />
            <span>來複製開課序號</span>
          </DrawerDescription>
        </DrawerHeader>
        <ExportCoursesTable courses={courses} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

interface ExportCoursesTableProps {
  courses: ScheduledCourse[];
}

function ExportCoursesTable({ courses }: ExportCoursesTableProps) {
  const list = Array.isArray(courses) ? courses : [];
  const count = list.length;
  const [copiedItems, setCopiedItems] = React.useState<Set<string>>(new Set());

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems((prev) => new Set(prev).add(id));
      setTimeout(() => {
        setCopiedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  if (count === 0) {
    return <p>Nothing Here</p>;
  } else {
    return (
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">開課序號</TableHead>
            <TableHead className="w-18">科目編號</TableHead>
            <TableHead className="">課程名稱</TableHead>
            <TableHead className="w-10">學分</TableHead>
            <TableHead className="w-10">必修</TableHead>
            <TableHead className="w-30">教師</TableHead>
            <TableHead>時間地點</TableHead>
            <TableHead>系所名稱</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course, index) => (
            <TableRow
              key={uuidv4()}
              className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
            >
              <TableCell className="font-mono">
                <div className="flex items-center gap-2">
                  <span>{course.seq || ""}</span>
                  {course.seq && (
                    <button
                      onClick={() =>
                        copyToClipboard(course.seq, `seq-${course.seq}`)
                      }
                      className="p-1 hover:bg-muted rounded transition-colors"
                      title="複製開課序號"
                    >
                      {copiedItems.has(`seq-${course.seq}`) ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-muted-foreground" />
                      )}
                    </button>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-mono">{course.code || ""}</TableCell>
              <TableCell>
                <div className="truncate" title={course.title || ""}>
                  {course.title || ""}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {course.credits || ""}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {course.required || ""}
              </TableCell>
              <TableCell>{course.teacher || ""}</TableCell>
              <TableCell className="text-muted-foreground">
                {course.times?.join(" || ") || ""}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {
                  String(course.dept_block || "")
                    .trim()
                    .replace(/\s+/g, " ")
                    .split(".", 2)[1]
                    ?.trimStart()
                    .split(/\s+/, 1)[0]
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
}
