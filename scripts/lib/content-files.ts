/// <reference types="node" />
/**
 * content-files.ts — shared helpers for the content scripts.
 *
 * Reads every file in content/, checks it with the Zod schemas and
 * collects friendly error messages instead of crashing on the first one.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { z } from 'zod';

import {
  CategoriesFileSchema,
  DropSchema,
  isRealDate,
  ScheduleConfigSchema,
  type Category,
  type Drop,
  type ScheduleConfig,
} from '../../src/lib/schema';

export const ROOT_DIR = path.resolve(__dirname, '..', '..');
export const CONTENT_DIR = path.join(ROOT_DIR, 'content');
export const CATEGORIES_FILE = path.join(CONTENT_DIR, 'categories.json');
export const INDEX_FILE = path.join(CONTENT_DIR, 'index.json');
export const SCHEDULE_FILE = path.join(ROOT_DIR, 'schedule.config.json');

/** Files allowed at the top of content/ besides the category folders. */
const TOP_LEVEL_FILES = new Set(['categories.json', 'index.json', '_errors.log']);
const DROP_FILE_PATTERN = /^drop-([1-3])\.json$/;

/** One problem found while reading content, tied to a file. */
export interface ContentProblem {
  file: string;
  message: string;
}

/** A drop file that passed the schema check. */
export interface LoadedDrop {
  /** Path relative to content/, always with forward slashes. */
  relPath: string;
  drop: Drop;
}

export interface LoadedContent {
  categories: Category[];
  schedule: ScheduleConfig | null;
  drops: LoadedDrop[];
  problems: ContentProblem[];
}

/** Path relative to the project root, with "/" even on Windows. */
export function rel(file: string): string {
  return path.relative(ROOT_DIR, file).split(path.sep).join('/');
}

/** Turns Zod's error into short lines like "items[2].options: must have 4 options". */
export function formatZodError(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const where = issue.path
      .map((p) => (typeof p === 'number' ? `[${p}]` : `.${String(p)}`))
      .join('')
      .replace(/^\./, '');
    return where ? `${where}: ${issue.message}` : issue.message;
  });
}

/** Reads a JSON file. Returns undefined (and records a problem) if it is broken. */
function readJson(file: string, problems: ContentProblem[]): unknown {
  let text: string;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch {
    problems.push({ file: rel(file), message: 'file is missing or cannot be read' });
    return undefined;
  }
  try {
    // Strip a UTF-8 "BOM" mark that some Windows editors add at the start.
    return JSON.parse(text.replace(/^﻿/, ''));
  } catch (err) {
    problems.push({ file: rel(file), message: `not valid JSON — ${(err as Error).message}` });
    return undefined;
  }
}

/** Lists sub-folders/files of a folder, sorted so results are always the same. */
function listDir(dir: string): fs.Dirent[] {
  return fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
}

/** Loads categories, schedule and every drop file. Never throws for content mistakes. */
export function loadContent(): LoadedContent {
  const problems: ContentProblem[] = [];

  // 1. categories.json
  let categories: Category[] = [];
  const rawCategories = readJson(CATEGORIES_FILE, problems);
  if (rawCategories !== undefined) {
    const parsed = CategoriesFileSchema.safeParse(rawCategories);
    if (parsed.success) categories = parsed.data;
    else
      formatZodError(parsed.error).forEach((message) =>
        problems.push({ file: rel(CATEGORIES_FILE), message }),
      );
  }
  const categoryIds = new Set(categories.map((c) => c.id));

  // 2. schedule.config.json
  let schedule: ScheduleConfig | null = null;
  const rawSchedule = readJson(SCHEDULE_FILE, problems);
  if (rawSchedule !== undefined) {
    const parsed = ScheduleConfigSchema.safeParse(rawSchedule);
    if (parsed.success) schedule = parsed.data;
    else
      formatZodError(parsed.error).forEach((message) =>
        problems.push({ file: rel(SCHEDULE_FILE), message }),
      );
  }

  // 3. Walk content/<category>/<date>/drop-<n>.json
  const drops: LoadedDrop[] = [];
  for (const entry of listDir(CONTENT_DIR)) {
    const entryPath = path.join(CONTENT_DIR, entry.name);
    if (entry.isFile()) {
      if (!TOP_LEVEL_FILES.has(entry.name)) {
        problems.push({ file: rel(entryPath), message: 'unexpected file in content/' });
      }
      continue;
    }
    if (!entry.isDirectory()) continue;
    if (!categoryIds.has(entry.name)) {
      problems.push({
        file: rel(entryPath),
        message: `folder "${entry.name}" is not a category in content/categories.json`,
      });
      continue;
    }

    for (const dateEntry of listDir(entryPath)) {
      const datePath = path.join(entryPath, dateEntry.name);
      if (!dateEntry.isDirectory() || !isRealDate(dateEntry.name)) {
        problems.push({
          file: rel(datePath),
          message: 'expected a date folder named YYYY-MM-DD',
        });
        continue;
      }

      for (const fileEntry of listDir(datePath)) {
        const filePath = path.join(datePath, fileEntry.name);
        const match = DROP_FILE_PATTERN.exec(fileEntry.name);
        if (!fileEntry.isFile() || !match) {
          problems.push({
            file: rel(filePath),
            message: 'expected only drop-1.json, drop-2.json or drop-3.json here',
          });
          continue;
        }

        const raw = readJson(filePath, problems);
        if (raw === undefined) continue;
        const parsed = DropSchema.safeParse(raw);
        if (!parsed.success) {
          formatZodError(parsed.error).forEach((message) =>
            problems.push({ file: rel(filePath), message }),
          );
          continue;
        }

        // The file's contents must agree with where it is saved.
        const drop = parsed.data;
        const expected = { category: entry.name, date: dateEntry.name, drop: Number(match[1]) };
        let pathOk = true;
        for (const key of ['category', 'date', 'drop'] as const) {
          if (drop[key] !== expected[key]) {
            pathOk = false;
            problems.push({
              file: rel(filePath),
              message: `"${key}" is ${JSON.stringify(drop[key])} but the file path says ${JSON.stringify(expected[key])}`,
            });
          }
        }
        if (pathOk) {
          drops.push({ relPath: `${entry.name}/${dateEntry.name}/${fileEntry.name}`, drop });
        }
      }
    }
  }

  return { categories, schedule, drops, problems };
}

/** Prints problems grouped by file. */
export function printProblems(problems: ContentProblem[]): void {
  const byFile = new Map<string, string[]>();
  for (const p of problems) {
    byFile.set(p.file, [...(byFile.get(p.file) ?? []), p.message]);
  }
  for (const [file, messages] of byFile) {
    console.error(`\n✖ ${file}`);
    messages.forEach((m) => console.error(`    - ${m}`));
  }
}
