import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import ExpertAnalysisArchive from "../pages/expert-analysis/page";
import AdminAuth from "../pages/admin/components/AdminAuth";
import AdminLayout from "../pages/admin/components/AdminLayout";
import AdminDashboard from "../pages/admin/dashboard/page";
import AdminPrices from "../pages/admin/prices/page";
import AdminArticles from "../pages/admin/articles/page";
import AdminDesign from "../pages/admin/design/page";
import AdminAnalytics from "../pages/admin/analytics/page";
import AdminMarketAnalysis from "../pages/admin/analysis/page";
import AdminSettings from "../pages/admin/settings/page";
import PistachioTypePage from "../pages/pistachio-type/page";
import PistachioArchivePage from "../pages/pistachio-type/archive-page";
import NewsPage from "../pages/news/page";
import AnalysisPage from "../pages/analysis/page";

const routes: RouteObject[] = [
  // Homepage
  { path: "/", element: <Home /> },

  // Pistachio Type Landing Pages
  { path: "/akbari", element: <PistachioTypePage pistachioType="akbari" /> },
  { path: "/ahmad-aghaei", element: <PistachioTypePage pistachioType="ahmad-aghaei" /> },
  { path: "/fandoghi", element: <PistachioTypePage pistachioType="fandoghi" /> },
  { path: "/kaleh-ghouchi", element: <PistachioTypePage pistachioType="kaleh-ghouchi" /> },
  { path: "/badami", element: <PistachioTypePage pistachioType="badami" /> },
  { path: "/kernel", element: <PistachioTypePage pistachioType="kernel" /> },

  // Pistachio Type Archive Pages (SEO-optimized for "price history" search queries)
  { path: "/price-history/akbari", element: <PistachioArchivePage pistachioType="akbari" /> },
  { path: "/price-history/ahmad-aghaei", element: <PistachioArchivePage pistachioType="ahmad-aghaei" /> },
  { path: "/price-history/fandoghi", element: <PistachioArchivePage pistachioType="fandoghi" /> },
  { path: "/price-history/kaleh-ghouchi", element: <PistachioArchivePage pistachioType="kaleh-ghouchi" /> },
  { path: "/price-history/badami", element: <PistachioArchivePage pistachioType="badami" /> },
  { path: "/price-history/kernel", element: <PistachioArchivePage pistachioType="kernel" /> },

  // Content Hubs
  { path: "/news", element: <NewsPage /> },
  { path: "/analysis", element: <AnalysisPage /> },

  // Legacy / Redirect routes
  { path: "/expert-analysis", element: <ExpertAnalysisArchive /> },
  {
    path: "/admin",
    element: <AdminAuth><AdminLayout /></AdminAuth>,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "prices", element: <AdminPrices /> },
      { path: "articles", element: <AdminArticles /> },
      { path: "analysis", element: <AdminMarketAnalysis /> },
      { path: "design", element: <AdminDesign /> },
      { path: "analytics", element: <AdminAnalytics /> },
      { path: "settings", element: <AdminSettings /> },
    ],
  },

  // 404
  { path: "*", element: <NotFound /> },
];

export default routes;