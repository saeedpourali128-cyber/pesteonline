import fs from "node:fs/promises";
import path from "node:path";

const SITE_URL = (
  process.env.VITE_SITE_URL || "https://www.pesteonline.com"
).replace(/\/+$/, "");

const rootDirectory = process.cwd();
const outputPath = path.join(rootDirectory, "public", "sitemap.xml");

const staticPaths = [
  "/",
  "/akbari",
  "/ahmad-aghaei",
  "/fandoghi",
  "/kaleh-ghouchi",
  "/badami",
  "/kernel",
  "/price-history/akbari",
  "/price-history/ahmad-aghaei",
  "/price-history/fandoghi",
  "/price-history/kaleh-ghouchi",
  "/price-history/badami",
  "/price-history/kernel",
  "/news",
  "/analysis",
  "/expert-analysis",
];

const builtInArticleFiles = [
  path.join(rootDirectory, "src", "mocks", "newsArticles.ts"),
  path.join(rootDirectory, "src", "mocks", "analysisArticles.ts"),
];

function normalizePath(value) {
  if (!value || value === "/") return "/";

  return `/${value.replace(/^\/+|\/+$/gu, "")}`;
}

function escapeXml(value) {
  return value.replace(/[<>&'"]/gu, (character) => {
    const entities = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;",
    };

    return entities[character];
  });
}

async function getBuiltInArticles() {
  const articles = [];

  for (const filePath of builtInArticleFiles) {
    const [content, stats] = await Promise.all([
      fs.readFile(filePath, "utf8"),
      fs.stat(filePath),
    ]);

    const lastModified = stats.mtime.toISOString().slice(0, 10);

    for (const match of content.matchAll(/slug\s*:\s*"([^"]+)"/gu)) {
      articles.push({
        path: `/articles/${encodeURIComponent(match[1])}`,
        lastModified,
      });
    }
  }

  return articles;
}

async function getDatabaseArticles() {
  const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    console.log(
      "Sitemap: Supabase variables are unavailable; built-in URLs only.",
    );
    return [];
  }

  try {
    const endpoint = new URL("/rest/v1/admin_articles", supabaseUrl);

    endpoint.searchParams.set(
      "select",
      "slug,updated_at,published_at",
    );
    endpoint.searchParams.set("status", "eq.published");
    endpoint.searchParams.set("is_indexable", "eq.true");
    endpoint.searchParams.set("order", "updated_at.desc");
    endpoint.searchParams.set("limit", "1000");

    const response = await fetch(endpoint, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(
        `Supabase returned ${response.status} ${response.statusText}`,
      );
    }

    const records = await response.json();

    return records
      .filter(
        (article) =>
          typeof article.slug === "string" &&
          article.slug.trim().length > 0,
      )
      .map((article) => ({
        path: `/articles/${encodeURIComponent(article.slug.trim())}`,
        lastModified:
          article.updated_at?.slice(0, 10) ||
          article.published_at?.slice(0, 10) ||
          null,
      }));
  } catch (error) {
    console.warn(
      `Sitemap: database articles could not be loaded: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );

    return [];
  }
}

function createUrlXml(url, lastModified = null) {
  const lines = [
    "  <url>",
    `    <loc>${escapeXml(url)}</loc>`,
  ];

  if (lastModified) {
    lines.push(`    <lastmod>${escapeXml(lastModified)}</lastmod>`);
  }

  lines.push("  </url>");

  return lines.join("\n");
}

const urls = new Map();

for (const routePath of staticPaths) {
  const normalizedPath = normalizePath(routePath);
  urls.set(`${SITE_URL}${normalizedPath}`, null);
}

const builtInArticles = await getBuiltInArticles();
const databaseArticles = await getDatabaseArticles();

for (const article of [...builtInArticles, ...databaseArticles]) {
  const normalizedPath = normalizePath(article.path);

  urls.set(
    `${SITE_URL}${normalizedPath}`,
    article.lastModified || null,
  );
}

const documentLines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
];

for (const [url, lastModified] of urls) {
  documentLines.push(createUrlXml(url, lastModified));
}

documentLines.push("</urlset>", "");

await fs.writeFile(outputPath, documentLines.join("\n"), "utf8");

console.log(
  `Sitemap generated: ${urls.size} URL(s) using ${SITE_URL}.`,
);
