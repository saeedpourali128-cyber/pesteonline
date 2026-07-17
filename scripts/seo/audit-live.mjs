import config from "../../seo.config.mjs";
import { writeJson } from "./utils.mjs";

const baseUrl = (
  process.env.BASE_URL || config.productionUrl
).replace(/\/+$/u, "");

const findings = [];

async function get(pathname, attempts = 2) {
  const url = `${baseUrl}${pathname}`;
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        headers: { "user-agent": "PesteSEOGuardian/1.2" },
        signal: AbortSignal.timeout(15000),
      });

      return {
        url,
        response,
        text: await response.text(),
        error: null,
      };
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : String(error);

      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  return {
    url,
    response: null,
    text: "",
    error: lastError ?? "unknown network error",
  };
}

function addAvailabilityFinding(resourceName, result) {
  if (!result.response) {
    findings.push({
      severity: "warning",
      code: `${resourceName}-network-inconclusive`,
      message:
        `${resourceName} از این شبکه قابل بررسی نبود: ${result.error}. ` +
        "این نتیجه به‌تنهایی ثابت نمی‌کند فایل روی سایت خراب است؛ بررسی ابری GitHub Actions معتبرتر است.",
    });
    return false;
  }

  if (!result.response.ok) {
    findings.push({
      severity: "error",
      code: `${resourceName}-http-error`,
      message:
        `${resourceName} پاسخ HTTP ${result.response.status} برگرداند.`,
    });
    return false;
  }

  return true;
}

function parseRobotsGroups(text) {
  const groups = [];
  let current = { agents: [], rules: [] };
  let hasRules = false;

  const pushCurrent = () => {
    if (current.agents.length > 0) {
      groups.push(current);
    }
    current = { agents: [], rules: [] };
    hasRules = false;
  };

  for (const rawLine of text.replace(/^\uFEFF/u, "").split(/\r?\n/u)) {
    const line = rawLine.replace(/#.*$/u, "").trim();
    if (!line) continue;

    const separator = line.indexOf(":");
    if (separator < 0) continue;

    const directive = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (directive === "user-agent") {
      if (hasRules) pushCurrent();
      current.agents.push(value.toLowerCase());
      continue;
    }

    if (current.agents.length === 0) continue;

    if (directive === "allow" || directive === "disallow") {
      current.rules.push({
        directive,
        value,
      });
      hasRules = true;
    }
  }

  pushCurrent();
  return groups;
}

const robots = await get("/robots.txt");
const robotsAvailable = addAvailabilityFinding("robots", robots);

if (robotsAvailable) {
  const groups = parseRobotsGroups(robots.text);

  if (!/sitemap\s*:/iu.test(robots.text)) {
    findings.push({
      severity: "warning",
      code: "robots-missing-sitemap",
      message: "robots.txt آدرس Sitemap را معرفی نمی‌کند.",
    });
  }

  const wildcardBlocksAll = groups.some(
    (group) =>
      group.agents.includes("*") &&
      group.rules.some(
        (rule) =>
          rule.directive === "disallow" &&
          rule.value.trim() === "/",
      ),
  );

  if (wildcardBlocksAll) {
    findings.push({
      severity: "error",
      code: "robots-blocks-all",
      message:
        "گروه User-agent: * در robots.txt دارای Disallow: / است و همه خزنده‌های عمومی را مسدود می‌کند.",
    });
  }

  const specificallyBlockedAgents = groups
    .filter(
      (group) =>
        !group.agents.includes("*") &&
        group.rules.some(
          (rule) =>
            rule.directive === "disallow" &&
            rule.value.trim() === "/",
        ),
    )
    .flatMap((group) => group.agents);

  if (specificallyBlockedAgents.length > 0) {
    findings.push({
      severity: "info",
      code: "robots-specific-agents-blocked",
      message:
        `${new Set(specificallyBlockedAgents).size} خزنده مشخص در robots.txt مسدود شده‌اند؛ ` +
        "این مورد به معنی مسدودشدن Googlebot یا همه موتورهای جست‌وجو نیست.",
    });
  }
}

const sitemap = await get("/sitemap.xml");
const sitemapAvailable = addAvailabilityFinding("sitemap", sitemap);
let sitemapUrls = [];

if (sitemapAvailable) {
  sitemapUrls = [
    ...sitemap.text.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/giu),
  ].map((match) => match[1].trim());

  const duplicates = sitemapUrls.filter(
    (url, index) => sitemapUrls.indexOf(url) !== index,
  );

  if (duplicates.length > 0) {
    findings.push({
      severity: "warning",
      code: "sitemap-duplicates",
      message: `${new Set(duplicates).size} URL تکراری در Sitemap پیدا شد.`,
    });
  }

  const adminUrls = sitemapUrls.filter((url) =>
    /\/admin(?:\/|$)/iu.test(url),
  );

  if (adminUrls.length > 0) {
    findings.push({
      severity: "error",
      code: "admin-in-sitemap",
      message: `${adminUrls.length} URL مدیریتی داخل Sitemap قرار دارد.`,
    });
  }

  for (const url of sitemapUrls.slice(0, 100)) {
    try {
      const response = await fetch(url, {
        redirect: "manual",
        headers: { "user-agent": "PesteSEOGuardian/1.2" },
        signal: AbortSignal.timeout(15000),
      });

      if (response.status >= 400) {
        findings.push({
          severity: "warning",
          code: "sitemap-url-error",
          message:
            `URL موجود در Sitemap وضعیت ${response.status} دارد: ${url}`,
        });
      }
    } catch (error) {
      findings.push({
        severity: "warning",
        code: "sitemap-url-network-inconclusive",
        message:
          `بررسی URL از این شبکه ممکن نبود: ${url} — ` +
          `${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }
}

const counts = findings.reduce(
  (acc, item) => {
    acc[item.severity] = (acc[item.severity] ?? 0) + 1;
    return acc;
  },
  { error: 0, warning: 0, info: 0 },
);

await writeJson("live-audit.json", {
  generatedAt: new Date().toISOString(),
  baseUrl,
  robotsStatus: robots.response?.status ?? null,
  sitemapStatus: sitemap.response?.status ?? null,
  robotsCheckConclusive: Boolean(robots.response),
  sitemapCheckConclusive: Boolean(sitemap.response),
  sitemapUrlCount: sitemapUrls.length,
  counts,
  findings,
});

console.log(
  `Live audit: ${counts.error} errors, ${counts.warning} warnings, ` +
    `${counts.info} info, ${sitemapUrls.length} sitemap URLs.`,
);

if (counts.error > 0) {
  process.exitCode = 1;
}
