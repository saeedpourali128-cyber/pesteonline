import fs from "node:fs/promises";
import { issue, lineNumberAt, relative, walkFiles, writeJson } from "./utils.mjs";

const extensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".html",
  ".css",
  ".json",
]);

const roots = ["src", "public", "index.html", "vite.config.ts"];
const files = [];

for (const root of roots) {
  try {
    const stat = await fs.stat(root);
    if (stat.isFile()) files.push(root);
    else files.push(...(await walkFiles(root, extensions)));
  } catch {
    // Optional path.
  }
}

const findings = [];

function addMatches(text, regex, createFinding) {
  for (const match of text.matchAll(regex)) {
    const finding = createFinding(match, lineNumberAt(text, match.index ?? 0));
    if (finding) findings.push(finding);
  }
}

for (const file of files) {
  const text = await fs.readFile(file, "utf8");
  const name = relative(file);

  addMatches(text, /readdy\.ai/giu, (_match, line) =>
    issue(
      "warning",
      "third-party-readdy",
      "وابستگی به readdy.ai می‌تواند سرعت و پایداری تصویر را کاهش دهد.",
      name,
      line,
    ),
  );

  addMatches(
    text,
    /http:\/\/(?!localhost|127\.0\.0\.1|www\.w3\.org\/)[^\s"'`)<>]+/giu,
    (match, line) =>
      issue(
        "warning",
        "insecure-http",
        `آدرس ناامن HTTP پیدا شد: ${match[0].slice(0, 120)}`,
        name,
        line,
      ),
  );

  addMatches(text, /data:image\/[a-z0-9.+-]+;base64,/giu, (_match, line) =>
    issue(
      "warning",
      "inline-base64-image",
      "تصویر Base64 داخل کد پیدا شد؛ برای Cache و حجم Bundle مناسب نیست.",
      name,
      line,
    ),
  );

  addMatches(
    text,
    /(?:SUPABASE_SERVICE_ROLE|service[_-]?role[_-]?key|BEGIN PRIVATE KEY)/giu,
    (_match, line) =>
      issue(
        "error",
        "possible-secret",
        "عبارت حساس احتمالی در فایل قابل Commit پیدا شد. مقدار و محل را فوراً بررسی کنید.",
        name,
        line,
      ),
  );

  addMatches(text, /dangerouslySetInnerHTML\s*=/gu, (_match, line) =>
    issue(
      "warning",
      "dangerous-html",
      "استفاده از dangerouslySetInnerHTML نیازمند پاک‌سازی ورودی و بررسی XSS است.",
      name,
      line,
    ),
  );

  if (/\.(?:tsx|jsx)$/iu.test(name)) {
    addMatches(text, /<img\b[\s\S]*?>/giu, (match, line) => {
      const tag = match[0];
      if (!/\balt\s*=/iu.test(tag)) {
        return issue(
          "warning",
          "image-missing-alt",
          "تگ img بدون alt پیدا شد.",
          name,
          line,
        );
      }
      return null;
    });

    addMatches(text, /<img\b[\s\S]*?>/giu, (match, line) => {
      const tag = match[0];
      if (!/\bwidth\s*=/iu.test(tag) || !/\bheight\s*=/iu.test(tag)) {
        return issue(
          "info",
          "image-missing-dimensions",
          "تصویر فاقد width یا height صریح است و ممکن است CLS ایجاد کند.",
          name,
          line,
        );
      }
      return null;
    });

    addMatches(
      text,
      /<a\b[\s\S]*?target\s*=\s*["']_blank["'][\s\S]*?>/giu,
      (match, line) => {
        if (!/\brel\s*=/iu.test(match[0])) {
          return issue(
            "warning",
            "blank-target-missing-rel",
            "لینک target=_blank فاقد rel امن است.",
            name,
            line,
          );
        }
        return null;
      },
    );

    addMatches(text, /<img\b[\s\S]*?>/giu, (match, line) => {
      const attrs = [...match[0].matchAll(/\b([A-Za-z_:][\w:.-]*)\s*=/gu)].map(
        (item) => item[1].toLowerCase(),
      );
      const duplicates = [
        ...new Set(attrs.filter((item, index) => attrs.indexOf(item) !== index)),
      ];
      if (duplicates.length > 0) {
        return issue(
          "error",
          "duplicate-jsx-attribute",
          `ویژگی JSX تکراری در img: ${duplicates.join(", ")}`,
          name,
          line,
        );
      }
      return null;
    });
  }
}

const counts = findings.reduce(
  (acc, item) => {
    acc[item.severity] = (acc[item.severity] ?? 0) + 1;
    return acc;
  },
  { error: 0, warning: 0, info: 0 },
);

await writeJson("source-audit.json", {
  generatedAt: new Date().toISOString(),
  scannedFiles: files.length,
  counts,
  findings,
});

console.log(
  `Source audit: ${files.length} files, ${counts.error} errors, ${counts.warning} warnings, ${counts.info} info.`,
);

if (counts.error > 0) {
  process.exitCode = 1;
}
