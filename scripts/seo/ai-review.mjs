import fs from "node:fs/promises";
import path from "node:path";
import { ensureReportDir, REPORT_DIR } from "./utils.mjs";

const token = process.env.GITHUB_TOKEN;
if (!token) {
  throw new Error("GITHUB_TOKEN is required for GitHub Models.");
}

await ensureReportDir();

const reportPath = path.join(REPORT_DIR, "seo-guardian-report.md");
const report = await fs.readFile(reportPath, "utf8");
const model = process.env.GITHUB_MODELS_MODEL || "openai/gpt-4.1";

const prompt = `
شما بازرس ارشد React/Vite و Technical SEO پروژه PesteOnline هستید.
گزارش زیر را تحلیل کنید و یک برنامه اصلاح کم‌ریسک و اولویت‌بندی‌شده به فارسی بنویسید.

قوانین:
- رتبه گوگل را تضمین نکنید.
- تغییر مستقیم main، انتشار یا حذف داده پیشنهاد ندهید.
- مشکلات Runtime و صفحه سفید بالاترین اولویت‌اند.
- برای هر پیشنهاد، ریسک، فایل‌های احتمالی، روش تست و معیار پذیرش را بنویسید.
- بین «اصلاح خودکار امن» و «نیازمند بررسی انسانی» تفاوت قائل شوید.
- پاسخ حداکثر 1400 کلمه باشد.

گزارش:
${report.slice(0, 40000)}
`;

const response = await fetch(
  "https://models.github.ai/inference/chat/completions",
  {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a conservative senior software and technical SEO reviewer.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 2200,
    }),
  },
);

if (!response.ok) {
  throw new Error(
    `GitHub Models request failed: ${response.status} ${await response.text()}`,
  );
}

const payload = await response.json();
const content = payload.choices?.[0]?.message?.content;

if (!content) {
  throw new Error("GitHub Models returned no review content.");
}

const output = `# بازبینی هوش مصنوعی Peste SEO Guardian\n\n${content.trim()}\n`;
await fs.writeFile(path.join(REPORT_DIR, "ai-review.md"), output, "utf8");
console.log(output);
