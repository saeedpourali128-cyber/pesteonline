module.exports = {
  ci: {
    collect: {
      startServerCommand:
        "npm run preview -- --host 127.0.0.1 --port 4173",
      startServerReadyPattern: "Local",
      startServerReadyTimeout: 30000,
      url: [
        "http://127.0.0.1:4173/",
        "http://127.0.0.1:4173/news",
        "http://127.0.0.1:4173/analysis",
        "http://127.0.0.1:4173/akbari",
      ],
      numberOfRuns: 1,
      settings: {
        chromeFlags: "--headless --no-sandbox --disable-dev-shm-usage",
        formFactor: "mobile",
        screenEmulation: {
          mobile: true,
          width: 390,
          height: 844,
          deviceScaleFactor: 1,
          disabled: false,
        },
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.65 }],
        "categories:seo": ["warn", { minScore: 0.85 }],
        "categories:accessibility": ["warn", { minScore: 0.8 }],
        "categories:best-practices": ["warn", { minScore: 0.8 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 4000 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.15 }],
        "total-blocking-time": ["warn", { maxNumericValue: 500 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./reports/lighthouse",
    },
  },
};
