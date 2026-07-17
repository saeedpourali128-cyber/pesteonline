import fs from "node:fs/promises";
import path from "node:path";
import { ensureReportDir, readJson, REPORT_DIR } from "./utils.mjs";

await ensureReportDir();

const source = await readJson("source-audit.json", {
  counts: { error: 0, warning: 0, info: 0 },
  findings: [],
});
const runtime = await readJson("runtime-audit.json", null);
const bundle = await readJson("bundle-audit.json", {
  metrics: {},
  violations: [],
});
const live = await readJson("live-audit.json", null);

const lighthouseDir = path.join(REPORT_DIR, "lighthouse");
let lighthouseReports = 0;
try {
  lighthouseReports = (await fs.readdir(lighthouseDir)).filter((name) =>
    name.endsWith(".html"),
  ).length;
} catch {
  // Lighthouse may not have run.
}

function groupFindings(findings = []) {
  const grouped = new Map();

  for (const item of findings) {
    const key = `${item.severity}:${item.code}`;
    const current = grouped.get(key) ?? {
      severity: item.severity,
      code: item.code,
      count: 0,
      examples: [],
    };

    current.count += 1;
    if (current.examples.length < 5) {
      current.examples.push({
        message: item.message,
        file: item.file ?? null,
        line: item.line ?? null,
      });
    }
    grouped.set(key, current);
  }

  return [...grouped.values()].sort((a, b) => {
    const order = { error: 0, warning: 1, info: 2 };
    return (order[a.severity] ?? 9) - (order[b.severity] ?? 9) || b.count - a.count;
  });
}

const sourceGroups = groupFindings(source.findings);
const liveGroups = groupFindings(live?.findings ?? []);

const runtimeWarningCount = runtime
  ? runtime.results.reduce(
      (total, result) =>
        total +
        result.consoleErrors.length +
        result.failedRequests.length +
        result.badResponses.length +
        result.brokenImages.length +
        result.imagesMissingAlt.length,
      0,
    )
  : 0;

const bundleViolations = (bundle.violations ?? []).map((item) => ({
  ...item,
  severity:
    item.severity ??
    (item.metric === "largestJavaScriptKb" || item.metric === "totalCssKb"
      ? "error"
      : "warning"),
}));

const bundleErrorCount = bundleViolations.filter(
  (item) => item.severity === "error",
).length;
const bundleWarningCount = bundleViolations.filter(
  (item) => item.severity !== "error",
).length;

const sourceErrorPenalty = source.counts.error * 12;
const sourceWarningPenalty = sourceGroups
  .filter((item) => item.severity === "warning")
  .reduce((total, item) => total + Math.min(item.count, 5) * 2, 0);
const runtimePenalty = runtime ? runtime.fatalCount * 20 + Math.min(runtimeWarningCount, 10) : 0;
const bundlePenalty = bundleErrorCount * 10 + bundleWarningCount * 3;
const livePenalty = live
  ? live.counts.error * 15 + Math.min(live.counts.warning, 10) * 3
  : 0;

const score = Math.max(
  0,
  Math.min(
    100,
    Math.round(
      100 -
        sourceErrorPenalty -
        sourceWarningPenalty -
        runtimePenalty -
        bundlePenalty -
        livePenalty,
    ),
  ),
);

const criticalCount =
  source.counts.error +
  (runtime?.fatalCount ?? 0) +
  bundleErrorCount +
  (live?.counts.error ?? 0);

const warningCount =
  source.counts.warning +
  runtimeWarningCount +
  bundleWarningCount +
  (live?.counts.warning ?? 0);

const lines = [
  "# گزارش Peste SEO Guardian",
  "",
  `- زمان تولید: ${new Date().toISOString()}`,
  `- امتیاز فنی تقریبی: **${score}/100**`,
  `- خطاهای مهم: **${criticalCount}**`,
  `- هشدارها: **${warningCount}**`,
  "",
  "> این امتیاز معیار داخلی Workflow است و رتبه گوگل یا امتیاز Lighthouse محسوب نمی‌شود.",
  "",
  "## سلامت کد و منبع",
  "",
  `- خطا: ${source.counts.error}`,
  `- هشدار: ${source.counts.warning}`,
  `- اطلاع: ${source.counts.info}`,
  "",
  "### گروه‌بندی یافته‌های کد",
  "",
];

if (sourceGroups.length === 0) {
  lines.push("- موردی ثبت نشد.");
} else {
  for (const group of sourceGroups) {
    lines.push(
      `- **${group.severity.toUpperCase()}** \`${group.code}\`: ${group.count} مورد`,
    );
    for (const example of group.examples) {
      const location = example.file
        ? ` — \`${example.file}${example.line ? `:${example.line}` : ""}\``
        : "";
      lines.push(`  - ${example.message}${location}`);
    }
    if (group.count > group.examples.length) {
      lines.push(`  - و ${group.count - group.examples.length} مورد دیگر`);
    }
  }
}

lines.push(
  "",
  "## Runtime",
  "",
  runtime
    ? `- مسیرهای دارای خطای بحرانی: ${runtime.fatalCount}`
    : "- هنوز اجرا نشده است.",
  runtime
    ? `- تعداد مسیرهای بررسی‌شده: ${runtime.results.length}`
    : "- برای اجرا: `npm.cmd run seo:audit:runtime`",
  "",
  "## Bundle",
  "",
  `- بزرگ‌ترین JS: ${bundle.metrics.largestJavaScriptKb ?? "نامشخص"} KB`,
  `- مجموع JS تمام Chunkها: ${bundle.metrics.totalJavaScriptKb ?? "نامشخص"} KB`,
  `- مجموع CSS: ${bundle.metrics.totalCssKb ?? "نامشخص"} KB`,
  `- تخطی بحرانی از بودجه: ${bundleErrorCount}`,
  `- هشدار بودجه: ${bundleWarningCount}`,
  "",
  "> مجموع JS شامل همه Chunkهای lazy-loaded است و لزوماً حجم دانلود اولیه صفحه اصلی نیست.",
  "",
  "## نسخه آنلاین",
  "",
  live ? `- خطا: ${live.counts.error}` : "- هنوز اجرا نشده است.",
  live ? `- هشدار: ${live.counts.warning}` : "- برای اجرا: `npm.cmd run seo:audit:live`",
  live
    ? `- URLهای Sitemap: ${live.sitemapUrlCount ?? "نامشخص"}`
    : "- URLهای Sitemap: بررسی نشده",
  "",
  "## Lighthouse",
  "",
  `- گزارش‌های ذخیره‌شده: ${lighthouseReports}`,
  "",
  "## اولویت‌های پیشنهادی",
  "",
);

const priorities = [];

if (sourceGroups.some((item) => item.code === "third-party-readdy")) {
  priorities.push(
    "حذف URLهای باقی‌مانده `readdy.ai` از تصاویر پیش‌فرض و صفحات عمومی.",
  );
}
if (sourceGroups.some((item) => item.code === "dangerous-html")) {
  priorities.push(
    "بررسی و پاک‌سازی ورودی‌های نمایش‌داده‌شده با `dangerouslySetInnerHTML` برای جلوگیری از XSS.",
  );
}
if (sourceGroups.some((item) => item.code === "image-missing-dimensions")) {
  priorities.push(
    "افزودن ابعاد یا نسبت تصویر مشخص به تصاویر صفحات عمومی برای کاهش CLS؛ صفحات ادمین اولویت پایین‌تری دارند.",
  );
}
if ((bundle.metrics.largestJavaScriptKb ?? 0) > 450) {
  priorities.push(
    "تحلیل Chunk اصلی حدود 480KB و انتقال کتابخانه‌های سنگین یا بخش‌های غیرضروری به import پویا.",
  );
}
if (!runtime) {
  priorities.push("اجرای Runtime Audit برای بررسی صفحه سفید، Console و تصاویر خراب.");
}
if (!live) {
  priorities.push("اجرای Live Audit برای robots.txt و sitemap.xml.");
}

if (priorities.length === 0) {
  lines.push("- مشکل اولویت‌دار جدیدی ثبت نشد.");
} else {
  priorities.forEach((item, index) => lines.push(`${index + 1}. ${item}`));
}

lines.push(
  "",
  "## سیاست اصلاح",
  "",
  "- هیچ تغییر مستقیمی روی `main` انجام نمی‌شود.",
  "- اصلاحات قطعی فقط از طریق Branch و Pull Request پیشنهاد می‌شوند.",
  "- رتبه گوگل تضمین نمی‌شود؛ هدف حذف موانع فنی و جلوگیری از افت است.",
  "",
);

const report = `${lines.join("\n")}\n`;
await fs.writeFile(path.join(REPORT_DIR, "seo-guardian-report.md"), report, "utf8");
await fs.writeFile(
  path.join(REPORT_DIR, "actionable-count.txt"),
  String(criticalCount + warningCount),
  "utf8",
);

console.log(report);
