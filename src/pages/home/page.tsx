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

export default function Home() {
  return (
    <main className="min-h-screen">
      <StickyMarketBar />
      <HeroSection />
      <PriceTable />
      <HistoricalCharts />
      <MarketNotes />
      <LatestNews />
      <ExpertAnalysis />
      <FAQSection />
      <Footer />
      <BackToTop />
    </main>
  );
}