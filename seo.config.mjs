export default {
  productionUrl: "https://pesteonline.com",
  previewPort: 4173,
  routes: [
    { path: "/", name: "خانه", indexable: true, lighthouse: true },
    { path: "/news", name: "اخبار", indexable: true, lighthouse: true },
    { path: "/analysis", name: "تحلیل‌ها", indexable: true, lighthouse: true },
    { path: "/akbari", name: "پسته اکبری", indexable: true, lighthouse: true },
  ],
  bundleBudgets: {
    largestJavaScriptKb: 550,
    totalJavaScriptKb: 1100,
    totalCssKb: 300,
    largestImageKb: 500,
  },
  runtime: {
    navigationTimeoutMs: 45000,
    minimumRootTextLength: 25,
  },
};
