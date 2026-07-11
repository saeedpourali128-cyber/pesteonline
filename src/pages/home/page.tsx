import StickyMarketBar from "./components/StickyMarketBar";
import HeroSection from "./components/HeroSection";
import PriceTable from "./components/PriceTable";
import HistoricalCharts from "./components/HistoricalCharts";
import MarketNotes from "./components/MarketNotes";
import LatestNews from "./components/LatestNews";
import ExpertAnalysis from "./components/ExpertAnalysis";
import FAQSection from "./components/FAQSection";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import { useSiteDesign, type SiteSectionId } from "@/lib/site-design";

const SECTION_COMPONENTS: Record<
  Exclude<SiteSectionId, "marketBar">,
  React.ReactNode
> = {
  hero: <HeroSection />,
  prices: <PriceTable />,
  charts: <HistoricalCharts />,
  marketNotes: <MarketNotes />,
  news: <LatestNews />,
  analysis: <ExpertAnalysis />,
  faq: <FAQSection />,
  footer: <Footer />,
};

export default function Home() {
  const { design } = useSiteDesign();
  const marketBar = design.sections.find((section) => section.id === "marketBar");

  return (
    <main
      className="site-home min-h-screen bg-background-50"
      data-template={design.template}
      data-density={design.density}
    >
      {marketBar?.visible !== false && <StickyMarketBar />}

      <div className="site-home-sections">
        {design.sections
          .filter((section) => section.id !== "marketBar" && section.visible)
          .map((section) => {
            const content = SECTION_COMPONENTS[
              section.id as Exclude<SiteSectionId, "marketBar">
            ];
            if (!content) return null;

            return (
              <div
                key={section.id}
                className={`site-section-shell site-section-${section.width}`}
                data-section={section.id}
              >
                {content}
              </div>
            );
          })}
      </div>

      <BackToTop />
    </main>
  );
}
