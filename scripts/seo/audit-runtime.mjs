import { spawn, spawnSync } from "node:child_process";
import { chromium } from "playwright";
import config from "../../seo.config.mjs";
import { writeJson } from "./utils.mjs";

const explicitBaseUrl = process.env.BASE_URL?.replace(/\/+$/u, "");
const useLocalPreview = !explicitBaseUrl;
const baseUrl =
  explicitBaseUrl ?? `http://127.0.0.1:${config.previewPort}`;

let server = null;

async function waitForServer(url, timeoutMs = 45000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(5000),
      });
      if (response.status < 500) return;
    } catch {
      // Retry until timeout.
    }

    await new Promise((resolve) => setTimeout(resolve, 750));
  }

  throw new Error(`Preview server did not become ready: ${url}`);
}

function startPreviewServer() {
  const previewArgs = [
    "run",
    "preview",
    "--",
    "--host",
    "127.0.0.1",
    "--port",
    String(config.previewPort),
  ];

  if (process.platform === "win32") {
    const comSpec = process.env.ComSpec || "C:\\Windows\\System32\\cmd.exe";
    const command = `npm.cmd ${previewArgs.join(" ")}`;

    return spawn(comSpec, ["/d", "/s", "/c", command], {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
      env: process.env,
    });
  }

  return spawn("npm", previewArgs, {
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
    detached: true,
  });
}

async function stopPreviewServer(child) {
  if (!child?.pid || child.exitCode !== null) return;

  child.stdout?.destroy();
  child.stderr?.destroy();

  if (process.platform === "win32") {
    spawnSync(
      "taskkill",
      ["/pid", String(child.pid), "/T", "/F"],
      { stdio: "ignore", windowsHide: true },
    );
    return;
  }

  const waitForExit = new Promise((resolve) => {
    const finish = () => resolve();
    child.once("exit", finish);
    child.once("close", finish);

    const timer = setTimeout(finish, 3000);
    timer.unref?.();
  });

  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    child.kill("SIGTERM");
  }

  await waitForExit;

  if (child.exitCode === null) {
    try {
      process.kill(-child.pid, "SIGKILL");
    } catch {
      child.kill("SIGKILL");
    }
  }
}

if (useLocalPreview) {
  server = startPreviewServer();

  server.stdout?.on("data", (chunk) => process.stdout.write(chunk));
  server.stderr?.on("data", (chunk) => process.stderr.write(chunk));
  server.on("error", (error) => {
    console.error(`Preview process failed: ${error.message}`);
  });

  try {
    await waitForServer(`${baseUrl}/`);
  } catch (error) {
    await stopPreviewServer(server);
    throw error;
  }
}

const launchOptions =
  process.platform === "win32"
    ? {
        headless: true,
        channel: "msedge",
      }
    : {
        headless: true,
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
      };

const browser = await chromium.launch(launchOptions);
const results = [];
let fatalCount = 0;

try {
  for (const route of config.routes) {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      locale: "fa-IR",
    });

    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];
    const badResponses = [];

    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    page.on("pageerror", (error) => pageErrors.push(error.message));

    page.on("requestfailed", (request) => {
      failedRequests.push({
        url: request.url(),
        failure: request.failure()?.errorText ?? "unknown",
      });
    });

    page.on("response", (response) => {
      if (response.status() >= 400) {
        badResponses.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });

    const url = `${baseUrl}${route.path}`;
    let navigationError = null;

    try {
      await page.goto(url, {
        waitUntil: "networkidle",
        timeout: config.runtime.navigationTimeoutMs,
      });
    } catch (error) {
      navigationError =
        error instanceof Error ? error.message : String(error);
    }

    const snapshot = await page.evaluate(() => {
      const root = document.querySelector("#root");
      const images = [...document.images];
      const canonical = document.querySelector('link[rel="canonical"]');
      const description = document.querySelector('meta[name="description"]');
      const robots = document.querySelector('meta[name="robots"]');
      const h1s = [...document.querySelectorAll("h1")];

      return {
        title: document.title.trim(),
        description: description?.getAttribute("content")?.trim() ?? "",
        canonical: canonical?.getAttribute("href")?.trim() ?? "",
        robots: robots?.getAttribute("content")?.trim() ?? "",
        htmlLang: document.documentElement.lang,
        htmlDir: document.documentElement.dir,
        rootTextLength: root?.textContent?.trim().length ?? 0,
        bodyTextLength: document.body.textContent?.trim().length ?? 0,
        h1Count: h1s.length,
        h1Texts: h1s
          .map((item) => item.textContent?.trim() ?? "")
          .filter(Boolean),
        imageCount: images.length,
        brokenImages: images
          .filter((image) => image.complete && image.naturalWidth === 0)
          .map((image) => image.currentSrc || image.src),
        imagesMissingAlt: images
          .filter((image) => !image.hasAttribute("alt"))
          .map((image) => image.currentSrc || image.src),
        imagesMissingDimensions: images
          .filter(
            (image) =>
              !image.getAttribute("width") ||
              !image.getAttribute("height"),
          )
          .map((image) => image.currentSrc || image.src),
        internalLinkCount: [...document.querySelectorAll("a[href]")].filter(
          (anchor) => {
            try {
              return new URL(anchor.href).origin === window.location.origin;
            } catch {
              return false;
            }
          },
        ).length,
      };
    });

    const fatal =
      Boolean(navigationError) ||
      snapshot.rootTextLength < config.runtime.minimumRootTextLength ||
      pageErrors.length > 0;

    if (fatal) fatalCount += 1;

    results.push({
      route,
      url,
      fatal,
      navigationError,
      consoleErrors,
      pageErrors,
      failedRequests,
      badResponses,
      ...snapshot,
    });

    await page.close();
  }
} finally {
  await browser.close();
  await stopPreviewServer(server);
}

await writeJson("runtime-audit.json", {
  generatedAt: new Date().toISOString(),
  baseUrl,
  fatalCount,
  results,
});

console.log(
  `Runtime audit: ${results.length} routes, ${fatalCount} fatal route(s).`,
);

if (fatalCount > 0) {
  process.exitCode = 1;
}
