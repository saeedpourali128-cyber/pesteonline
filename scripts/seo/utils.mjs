import fs from "node:fs/promises";
import path from "node:path";

export const REPORT_DIR = path.resolve("reports");

export async function ensureReportDir() {
  await fs.mkdir(REPORT_DIR, { recursive: true });
}

export async function writeJson(filename, value) {
  await ensureReportDir();
  const target = path.join(REPORT_DIR, filename);
  await fs.writeFile(target, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return target;
}

export async function readJson(filename, fallback = null) {
  try {
    const text = await fs.readFile(path.join(REPORT_DIR, filename), "utf8");
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export async function walkFiles(root, allowedExtensions) {
  const result = [];

  async function walk(current) {
    let entries;
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (
        entry.isDirectory() &&
        !["node_modules", ".git", "out", "dist", "reports", ".lighthouseci"].includes(
          entry.name,
        )
      ) {
        await walk(full);
      } else if (
        entry.isFile() &&
        allowedExtensions.has(path.extname(entry.name).toLowerCase())
      ) {
        result.push(full);
      }
    }
  }

  await walk(path.resolve(root));
  return result;
}

export function relative(file) {
  return path.relative(process.cwd(), file).replaceAll("\\", "/");
}

export function issue(severity, code, message, file = null, line = null) {
  return { severity, code, message, file, line };
}

export function lineNumberAt(text, index) {
  return text.slice(0, index).split(/\r?\n/u).length;
}
