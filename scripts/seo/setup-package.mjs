import fs from "node:fs/promises";

const packagePath = new URL("../../package.json", import.meta.url);
const packageJson = JSON.parse(await fs.readFile(packagePath, "utf8"));

packageJson.scripts = {
  ...packageJson.scripts,
  "seo:audit:source": "node scripts/seo/audit-source.mjs",
  "seo:audit:runtime": "node scripts/seo/audit-runtime.mjs",
  "seo:audit:bundle": "node scripts/seo/audit-bundle.mjs",
  "seo:audit:live": "node scripts/seo/audit-live.mjs",
  "seo:report": "node scripts/seo/generate-report.mjs",
  "seo:safe-fix": "node scripts/seo/safe-fix.mjs",
  "seo:ai-review": "node scripts/seo/ai-review.mjs"
};

await fs.writeFile(
  packagePath,
  `${JSON.stringify(packageJson, null, 2)}\n`,
  "utf8",
);

const gitignorePath = new URL("../../.gitignore", import.meta.url);
let gitignore = "";
try {
  gitignore = await fs.readFile(gitignorePath, "utf8");
} catch {
  // Create it.
}

for (const entry of [
  "reports/",
  ".lighthouseci/",
  "playwright-report/",
  "test-results/",
]) {
  if (!gitignore.split(/\r?\n/u).includes(entry)) {
    gitignore += `${
      gitignore.endsWith("\n") || gitignore.length === 0 ? "" : "\n"
    }${entry}\n`;
  }
}

await fs.writeFile(gitignorePath, gitignore, "utf8");
console.log("package.json scripts and .gitignore were updated.");
