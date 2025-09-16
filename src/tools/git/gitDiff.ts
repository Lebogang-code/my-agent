import { tool } from "ai";
import { simpleGit, type SimpleGit } from "simple-git";
import { type FileChange, fileChangeSchema, type GitDiff } from "./types";

export class GitDiffService {
  private git: SimpleGit;
  private static readonly EXCLUDE_FILES = ["dist", "bun.lock"];

  constructor(rootDir: string) {
    this.git = simpleGit(rootDir);
  }

  private shouldIncludeFile(filename: string): boolean {
    return !GitDiffService.EXCLUDE_FILES.includes(filename);
  }

  async getChanges(): Promise<GitDiff[]> {
    try {
      const summary = await this.git.diffSummary();
      const diffs: GitDiff[] = [];

      for (const file of summary.files) {
        if (!this.shouldIncludeFile(file.file)) continue;
        const diff = await this.git.diff(["--", file.file]);
        diffs.push({ file: file.file, diff });
      }

      return diffs;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get git changes: ${error.message}`);
      } else {
        throw new Error(`Failed to get git changes: ${String(error)}`);
      }
    }
  }
}

export const getFileChangesInDirectoryTool = tool({
  description: "Gets the code changes made in given directory",
  inputSchema: fileChangeSchema,
  async execute({ rootDir }: FileChange) {
    const service = new GitDiffService(rootDir);
    return service.getChanges();
  },
});