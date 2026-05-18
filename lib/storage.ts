import "server-only";
import fs from "fs";
import path from "path";
import { head, put } from "@vercel/blob";

const dataDir = path.join(process.cwd(), "data");
const tmpDir = path.join("/tmp", "budgetbeheer-data");

function useBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function useTmpOnVercel(): boolean {
  return process.env.VERCEL === "1" && !useBlob();
}

function blobKey(filename: string): string {
  return `data/${filename}`;
}

function readFromDisk<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

function writeToDisk(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function bundledPath(filename: string): string {
  return path.join(dataDir, filename);
}

function tmpPath(filename: string): string {
  return path.join(tmpDir, filename);
}

async function readFromBlob<T>(filename: string): Promise<T> {
  try {
    const meta = await head(blobKey(filename));
    const res = await fetch(meta.url);
    if (!res.ok) throw new Error("Blob ophalen mislukt");
    return (await res.json()) as T;
  } catch {
    const seeded = readFromDisk<T>(bundledPath(filename));
    await writeToBlob(filename, seeded);
    return seeded;
  }
}

async function writeToBlob(filename: string, data: unknown): Promise<void> {
  await put(blobKey(filename), JSON.stringify(data, null, 2), {
    access: "public",
    allowOverwrite: true,
    contentType: "application/json",
  });
}

function readFromTmp<T>(filename: string): T {
  const target = tmpPath(filename);
  if (!fs.existsSync(target)) {
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.copyFileSync(bundledPath(filename), target);
  }
  return readFromDisk<T>(target);
}

function writeToTmp(filename: string, data: unknown): void {
  writeToDisk(tmpPath(filename), data);
}

export async function readJsonFile<T>(filename: string): Promise<T> {
  if (useBlob()) return readFromBlob<T>(filename);
  if (useTmpOnVercel()) return readFromTmp<T>(filename);
  return readFromDisk<T>(bundledPath(filename));
}

export async function writeJsonFile(filename: string, data: unknown): Promise<void> {
  if (useBlob()) {
    await writeToBlob(filename, data);
    return;
  }
  if (useTmpOnVercel()) {
    writeToTmp(filename, data);
    return;
  }
  writeToDisk(bundledPath(filename), data);
}

export function storageIsWritable(): boolean {
  return !process.env.VERCEL || useBlob() || useTmpOnVercel();
}
