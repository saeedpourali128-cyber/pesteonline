import { lazy, Suspense, type ReactNode } from "react";
import type { RouteObject } from "react-router-dom";

import Home from "../pages/home/page";

const NotFound = lazy(() => import("../pages/NotFound"));

const ExpertAnalysisArchive = lazy(
  () => import("../pages/expert-analysis/page"),
);

const PistachioTypePage = lazy(
  () => import("../pages/pistachio-type/page"),
);

const PistachioArchivePage = lazy(
  () => import("../pages/pistachio-type/archive-page"),
);

const NewsPage = lazy(() => import("../pages/news/page"));
const AnalysisPage = lazy(() => import("../pages/analysis/page"));
const ArticlePage = lazy(() => import("../pages/article/page"));

const AdminAuth = lazy(
  () => import("../pages/admin/components/AdminAuth"),
);

const AdminLayout = lazy(
  () => import("../pages/admin/components/AdminLayout"),
);

const AdminDashboard = lazy(
  () => import("../pages/admin/dashboard/page"),
);

const AdminPrices = lazy(
  () => import("../pages/admin/prices/page"),
);

const AdminArticles = lazy(
  () => import("../pages/admin/articles/page"),
);

const AdminDesign = lazy(
  () => import("../pages/admin/design/page"),
);

const AdminAnalytics = lazy(
  () => import("../pages/admin/analytics/page"),
);

const AdminMarketAnalysis = lazy(
  () => import("../pages/admin/analysis/page"),
);

const AdminSettings = lazy(
  () => import("../pages/admin/settings/page"),
);

function RouteLoader() {
  return (
    <div
      className="flex min-h-[45vh] items-center justify-center"
      dir="rtl"
      role="status"
    >
      <div className="text-sm text-gray-500">در حال بارگذاری...</div>
    </div>
  );
}

function withSuspense(element: ReactNode) {
  return (
    <Suspense fallback={<RouteLoader />}>
      {element}
    </Suspense>
  );
}

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },

  {
    path: "/akbari",
    element: withSuspense(
      <PistachioTypePage pistachioType="akbari" />,
    ),
  },
  {
    path: "/ahmad-aghaei",
    element: withSuspense(
      <PistachioTypePage pistachioType="ahmad-aghaei" />,
    ),
  },
  {
    path: "/fandoghi",
    element: withSuspense(
      <PistachioTypePage pistachioType="fandoghi" />,
    ),
  },
  {
    path: "/kaleh-ghouchi",
    element: withSuspense(
      <PistachioTypePage pistachioType="kaleh-ghouchi" />,
    ),
  },
  {
    path: "/badami",
    element: withSuspense(
      <PistachioTypePage pistachioType="badami" />,
    ),
  },
  {
    path: "/kernel",
    element: withSuspense(
      <PistachioTypePage pistachioType="kernel" />,
    ),
  },

  {
    path: "/price-history/akbari",
    element: withSuspense(
      <PistachioArchivePage pistachioType="akbari" />,
    ),
  },
  {
    path: "/price-history/ahmad-aghaei",
    element: withSuspense(
      <PistachioArchivePage pistachioType="ahmad-aghaei" />,
    ),
  },
  {
    path: "/price-history/fandoghi",
    element: withSuspense(
      <PistachioArchivePage pistachioType="fandoghi" />,
    ),
  },
  {
    path: "/price-history/kaleh-ghouchi",
    element: withSuspense(
      <PistachioArchivePage pistachioType="kaleh-ghouchi" />,
    ),
  },
  {
    path: "/price-history/badami",
    element: withSuspense(
      <PistachioArchivePage pistachioType="badami" />,
    ),
  },
  {
    path: "/price-history/kernel",
    element: withSuspense(
      <PistachioArchivePage pistachioType="kernel" />,
    ),
  },

  {
    path: "/news",
    element: withSuspense(<NewsPage />),
  },
  {
    path: "/analysis",
    element: withSuspense(<AnalysisPage />),
  },
  {
    path: "/articles/:slug",
    element: withSuspense(<ArticlePage />),
  },
  {
    path: "/expert-analysis",
    element: withSuspense(<ExpertAnalysisArchive />),
  },

  {
    path: "/admin",
    element: withSuspense(
      <AdminAuth>
        <AdminLayout />
      </AdminAuth>,
    ),
    children: [
      {
        index: true,
        element: withSuspense(<AdminDashboard />),
      },
      {
        path: "prices",
        element: withSuspense(<AdminPrices />),
      },
      {
        path: "articles",
        element: withSuspense(<AdminArticles />),
      },
      {
        path: "analysis",
        element: withSuspense(<AdminMarketAnalysis />),
      },
      {
        path: "design",
        element: withSuspense(<AdminDesign />),
      },
      {
        path: "analytics",
        element: withSuspense(<AdminAnalytics />),
      },
      {
        path: "settings",
        element: withSuspense(<AdminSettings />),
      },
    ],
  },

  {
    path: "*",
    element: withSuspense(<NotFound />),
  },
];

export default routes;
