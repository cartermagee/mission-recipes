import fs from "node:fs/promises";
import path from "node:path";

const DATA_ROOT = path.join(process.cwd(), "data");
const RUNTIME_DIR = path.join(DATA_ROOT, ".runtime");
const SEED_DIR = path.join(DATA_ROOT, "seed");

type Mutex = Promise<void>;
const locks: Record<string, Mutex> = {};

async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks[key] ?? Promise.resolve();
  let release!: () => void;
  const next = new Promise<void>((resolve) => (release = resolve));
  locks[key] = prev.then(() => next);
  await prev;
  try {
    return await fn();
  } finally {
    release();
  }
}

async function ensureRuntimeFile(fileName: string): Promise<string> {
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
  const runtimePath = path.join(RUNTIME_DIR, fileName);
  try {
    await fs.access(runtimePath);
  } catch {
    const seedPath = path.join(SEED_DIR, fileName);
    try {
      const seed = await fs.readFile(seedPath, "utf8");
      await fs.writeFile(runtimePath, seed, "utf8");
    } catch {
      await fs.writeFile(runtimePath, "[]", "utf8");
    }
  }
  return runtimePath;
}

export async function readCollection<T>(fileName: string): Promise<T[]> {
  const filePath = await ensureRuntimeFile(fileName);
  const raw = await fs.readFile(filePath, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export async function writeCollection<T>(
  fileName: string,
  items: T[]
): Promise<void> {
  const filePath = await ensureRuntimeFile(fileName);
  await withLock(fileName, async () => {
    await fs.writeFile(filePath, JSON.stringify(items, null, 2), "utf8");
  });
}

export async function mutateCollection<T>(
  fileName: string,
  mutator: (items: T[]) => T[] | Promise<T[]>
): Promise<T[]> {
  const filePath = await ensureRuntimeFile(fileName);
  return withLock(fileName, async () => {
    const raw = await fs.readFile(filePath, "utf8");
    const current: T[] = (() => {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })();
    const next = await mutator(current);
    await fs.writeFile(filePath, JSON.stringify(next, null, 2), "utf8");
    return next;
  });
}
