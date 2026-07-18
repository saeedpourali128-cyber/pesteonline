import fs from "node:fs/promises";
import path from "node:path";
import config from "../../seo.config.mjs";
import { writeJson } from "./utils.mjs";

const outDir = path.resolve("out");
const files = [];

async function walk(current) {
  for (const entry of await fs.readdir(current, { withFileTypes: true })) {
    const full = path.join(current, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.isFile()) {
      const stat = await fs.stat(full);
      files.push({
        file: path.relative(outDir, full).replaceAll("\\", "/"),
        bytes: stat.size,
        extension: path.extname(entry.name).toLowerCase(),
      });
    }
  }
}

try {
  await walk(outDir);
} catch {
  console.error("Build output directory 'out' was not found. Run npm run build first.");
  process.exit(1);
}

const sum = (extensions) =>
  files
    .filter((item) => extensions.includes(item.extension))
    .reduce((total, item) => total + item.bytes, 0);

const jsFiles = files.filter((item) => [".js", ".mjs"].includes(item.extension));
const imageFiles = files.filter((item) =>
  [".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"].includes(
    item.extension,
  ),
);

const largestJs = [...jsFiles].sort((a, b) => b.bytes - a.bytes)[0] ?? null;
const largestImage =
  [...imageFiles].sort((a, b) => b.bytes - a.bytes)[0] ?? null;

const metrics = {
  totalJavaScriptKb: Math.round((sum([".js", ".mjs"]) / 1024) * 100) / 100,
  totalCssKb: Math.round((sum([".css"]) / 1024) * 100) / 100,
  largestJavaScriptKb: largestJs
    ? Math.round((largestJs.bytes / 1024) * 100) / 100
    : 0,
  largestJavaScriptFile: largestJs?.file ?? null,
  largestImageKb: largestImage
    ? Math.round((largestImage.bytes / 1024) * 100) / 100
    : 0,
  largestImageFile: largestImage?.file ?? null,
  emittedFiles: files.length,
};

const severityByMetric = {
  largestJavaScriptKb: "error",
  totalCssKb: "error",
  totalJavaScriptKb: "warning",
  largestImageKb: "warning",
};

const violations = [];
for (const [key, limit] of Object.entries(config.bundleBudgets)) {
  if (metrics[key] > limit) {
    violations.push({
      metric: key,
      actual: metrics[key],
      limit,
      severity: severityByMetric[key] ?? "warning",
    });
  }
}

await writeJson("bundle-audit.json", {
  generatedAt: new Date().toISOString(),
  metrics,
  budgets: config.bundleBudgets,
  violations,
  largestFiles: [...files]
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 20)
    .map((item) => ({
      ...item,
      kb: Math.round((item.bytes / 1024) * 100) / 100,
    })),
});

const criticalViolations = violations.filter(
  (item) => item.severity === "error",
).length;

console.log(
  `Bundle audit: largest JS ${metrics.largestJavaScriptKb} KB, total JS ${metrics.totalJavaScriptKb} KB, ${criticalViolations} critical and ${violations.length - criticalViolations} warning violation(s).`,
);

if (criticalViolations > 0) {
  process.exitCode = 1;
}
