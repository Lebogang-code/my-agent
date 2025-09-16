import { z } from "zod";

export const fileChangeSchema = z.object({
  rootDir: z.string().min(1).describe("The root directory"),
});

export type FileChange = z.infer<typeof fileChangeSchema>;

export interface GitDiff {
  file: string;
  diff: string;
}