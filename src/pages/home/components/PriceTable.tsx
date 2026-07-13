import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";
import { marketBarData } from "@/mocks/pistachioData";
const TechnicalChartModal = lazy(
  () => import("./TechnicalChartModal"),
);

const RequestPriceModal = lazy(
  () => import("./RequestPriceModal"),
);
import ScrollReveal from "@/components/base/ScrollReveal";

interface PistachioPrice {
  id: number;
  variety: string;
  size: string;
  today_price: number;
  yesterday_price: number;
  weekly_change: number;
  weekly_change_percent: number;
  trend: "up" | "down";
  is_visible: boolean;
  sort_order: number;
  updated_at: string;
}

interface PriceDisplayItem {
  type: string;
  size: string;
  todayPrice: number;
  yesterdayPrice: number;
  dailyChange: number;
  dailyChangePercent: number;
  weeklyChange: number;
  weeklyChangePercent: number;
  trend: "up" | "down";
}

function formatToman(value: number): string {
  return value.toLocaleString("fa-IR");
}

function formatPercent(change: number): string {
  const prefix = change > 0 ? "+" : "";
  return `${prefix}${change.toFixed(2)}%`;
}

const currencyNames: Record<string, string> = {
  usd: "دلار",
  eur: "یورو",
  aed: "درهم",
  gold: "طلا ۱۸",
};

const currencyCodes: Record<string, string> = {
  usd: "USD",
  eur: "EUR",
  aed: "AED",
  gold: "XAU",
};

const currencyItems = [
  { key: "usd", ...marketBarData.usd },
  { key: "eur", ...marketBarData.eur },
  { key: "aed", ...marketBarData.aed },
  { key: "gold", ...marketBarData.gold },
];

const varietyColors: Record<string, { bar: string; bg: string; badge: string; text: string }> = {
  "اکبری": {
    bar: "bg-emerald-700",
    bg: "bg-emerald-700",
    badge: "bg-emerald-100/80 text-emerald-800",
    text: "text-white",
  },
  "احمد آقایی": {
    bar: "bg-emerald-700",
    bg: "bg-emerald-700",
    badge: "bg-emerald-100/80 text-emerald-800",
    text: "text-white",
  },
  "فندقی": {
    bar: "bg-emerald-700",
    bg: "bg-emerald-700",
    badge: "bg-emerald-100/80 text-emerald-800",
    text: "text-white",
  },
  "کله قوچی": {
    bar: "bg-emerald-700",
    bg: "bg-emerald-700",
    badge: "bg-emerald-100/80 text-emerald-800",
    text: "text-white",
  },
  "بادامی": {
    bar: "bg-emerald-700",
    bg: "bg-emerald-700",
    badge: "bg-emerald-100/80 text-emerald-800",
    text: "text-white",
  },
  "مغز پسته": {
    bar: "bg-emerald-700",
    bg: "bg-emerald-700",
    badge: "bg-emerald-100/80 text-emerald-800",
    text: "text-white",
  },
};

export default function PriceTable() {
  const [prices, setPrices] = useState<PistachioPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<string | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const tableRef = useRef<HTMLElement>(null);

  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    supabase
      .from("pistachio_prices")
      .select("*")
      .eq("is_visible", true)
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) {
          const pricesData = data as PistachioPrice[];
          setPrices(pricesData);
          if (pricesData.length > 0) {
            const latest = pricesData.reduce((a, b) =>
              new Date(a.updated_at) > new Date(b.updated_at) ? a : b
            );
            const d = new Date(latest.updated_at);
            const options: Intl.DateTimeFormatOptions = {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Tehran",
            };
            setLastUpdate(new Intl.DateTimeFormat("fa-IR", options).format(d));
          }
        }
        setLoading(false);
      });
  }, []);

  const displayItems: PriceDisplayItem[] = useMemo(() => {
    return prices.map((p) => ({
      type: p.variety,
      size: p.size,
      todayPrice: p.today_price,
      yesterdayPrice: p.yesterday_price,
      dailyChange: p.today_price - p.yesterday_price,
      dailyChangePercent:
        p.yesterday_price > 0
          ? parseFloat(
              (((p.today_price - p.yesterday_price) / p.yesterday_price) * 100).toFixed(2)
            )
          : 0,
      weeklyChange: p.weekly_change,
      weeklyChangePercent: p.weekly_change_percent,
      trend: p.trend,
    }));
  }, [prices]);

  const handleDownloadPDF = async () => {
    if (!tableRef.current || isDownloading) return;
    setIsDownloading(true);

    try {    const [
      { default: html2canvas },
      { default: jsPDF },
    ] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);
      const table = tableRef.current;

      // Clone the table and resolve all oklch colors to RGB for html2canvas compatibility
      const clone = table.cloneNode(true) as HTMLElement;
      clone.style.position = "fixed";
      clone.style.top = "-9999px";
      clone.style.left = "-9999px";
      clone.style.visibility = "hidden";
      clone.style.width = table.offsetWidth + "px";
      document.body.appendChild(clone);

      // Walk original elements, read computed RGB, apply as inline styles on clone
      const originalEls = Array.from(table.querySelectorAll("*"));
      const cloneEls = Array.from(clone.querySelectorAll("*"));

      const colorProps = [
        "color",
        "background-color",
        "border-top-color",
        "border-right-color",
        "border-bottom-color",
        "border-left-color",
        "outline-color",
        "text-decoration-color",
        "box-shadow",
      ];

      // Also handle the root table element itself
      const tableComputed = window.getComputedStyle(table);
      colorProps.forEach((prop) => {
        const val = tableComputed.getPropertyValue(prop);
        if (val && val !== "rgba(0, 0, 0, 0)" && val !== "transparent") {
          clone.style.setProperty(prop, val);
        }
      });

      // Walk through all descendant elements
      originalEls.forEach((origEl, i) => {
        const cloneEl = cloneEls[i] as HTMLElement;
        if (!cloneEl) return;
        const computed = window.getComputedStyle(origEl);
        colorProps.forEach((prop) => {
          const val = computed.getPropertyValue(prop);
          if (val && val !== "rgba(0, 0, 0, 0)" && val !== "transparent") {
            cloneEl.style.setProperty(prop, val);
          }
        });
      });

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      // Clean up the off-screen clone
      document.body.removeChild(clone);

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // Handle multi-page if content is taller than A4
      let heightLeft = imgHeight;
      let pageOffset = 0;
      const pageHeight = 297; // A4 height in mm

      while (heightLeft > pageHeight) {
        pageOffset += pageHeight;
        heightLeft -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -pageOffset, imgWidth, imgHeight);
      }

      pdf.save("قیمت-انواع-پسته.pdf");
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const grouped = useMemo(() => {
    const varietyOrder: string[] = [];
    const map: Record<string, PriceDisplayItem[]> = {};
    displayItems.forEach((p) => {
      if (!map[p.type]) {
        map[p.type] = [];
        varietyOrder.push(p.type);
      }
      map[p.type].push(p);
    });
    return varietyOrder.map((t) => ({ type: t, items: map[t] }));
  }, [displayItems]);

  const selectedItem = displayItems.find(
    (p) => `${p.type}-${p.size}` === activeChart
  );

  let globalIdx = 0;

  if (loading) {
    return (
      <section id="prices" className="w-full bg-background-100/80 py-10 md:py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto text-center text-foreground-400 text-sm py-10">
          در حال بارگذاری قیمت‌ها...
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="prices" className="w-full bg-background-100/80 py-10 md:py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            {/* === Mobile Layout: Title row (no CTA) === */}
            <div className="md:hidden mb-2">
              <h2 className="text-xl font-black text-foreground-950 leading-[1.2] tracking-tight">
                <strong>قیمت انواع پسته</strong>
              </h2>
              <p className="text-xs text-foreground-500 mt-1 font-light">
                قیمت‌ها به تومان - هر کیلوگرم
              </p>
            </div>

            {/* === Mobile: CTA Box (left) + Compact Currency Cards (right) === */}
            <div className="md:hidden flex flex-row items-stretch gap-2 mb-3">
              {/* CTA Box - Left, stretched vertically alongside all 4 cards */}
              <button
                onClick={() => setShowRequestForm(true)}
                className="flex-shrink-0 flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-500/20 group w-[80px]"
              >
                <i className="ri-flashlight-line w-5 h-5 flex items-center justify-center group-hover:scale-110 transition-transform"></i>
                <span className="text-[9px] font-bold leading-relaxed text-center">مشخصات پسته رو بفرست ،</span>
                <span className="text-[9px] font-bold leading-relaxed text-center">قیمت رو آنلاین بهت بدم !</span>
              </button>

              {/* Currency Cards Column - Right, Chand App Style */}
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                {currencyItems.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center gap-2 rounded-xl bg-white border border-background-200/80 p-2"
                  >
                    {/* Currency Icon — flag emoji */}
                    <span className="flex-shrink-0 text-sm leading-none w-5 text-center">
                      {item.key === "usd"
                        ? "🇺🇸"
                        : item.key === "eur"
                        ? "🇪🇺"
                        : item.key === "aed"
                        ? "🇦🇪"
                        : "🟡"}
                    </span>

                    {/* Chand-style stacked content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-foreground-400 font-medium">
                            {currencyNames[item.key]}
                          </span>
                          <span className="text-[9px] text-foreground-400">
                            {currencyCodes[item.key]}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-0.5 text-[10px] font-bold whitespace-nowrap ${
                            item.change >= 0
                              ? "text-emerald-600"
                              : "text-red-500"
                          }`}
                        >
                          <i
                            className={`${
                              item.change >= 0
                                ? "ri-arrow-up-line"
                                : "ri-arrow-down-line"
                            } w-2.5 h-2.5 flex items-center justify-center`}
                          ></i>
                          {formatPercent(item.change)}
                        </span>
                      </div>
                      <div className="text-base font-black text-foreground-900 tabular-nums leading-tight mt-0.5">
                        {formatToman(item.value)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* === Desktop Layout: Title Row + CTA === */}
            <div className="hidden md:block mb-6 md:mb-8">
              <div className="flex flex-row items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-foreground-950 leading-[1.2] tracking-tight">
                    <strong>قیمت انواع پسته</strong>
                  </h2>
                  <p className="text-sm md:text-base text-foreground-500 mt-2 font-light">
                    قیمت‌ها به تومان - هر کیلوگرم
                  </p>
                </div>

                {/* Vertical Full-Height Request Box */}
                <button
                  onClick={() => setShowRequestForm(true)}
                  className="flex-shrink-0 self-stretch flex flex-col items-center justify-center gap-3 px-8 py-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-500/20 group"
                >
                  <i className="ri-flashlight-line w-8 h-8 flex items-center justify-center group-hover:scale-110 transition-transform"></i>
                  <span className="text-sm font-bold leading-relaxed text-center">مشخصات پسته رو بفرست ،</span>
                  <span className="text-sm font-bold leading-relaxed text-center">قیمت رو آنلاین بهت بدم !</span>
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Currency Ticker Bar — Desktop Only */}
          <ScrollReveal delay={100}>
            <div className="hidden md:flex items-center gap-3 md:gap-5 px-3 md:px-4 py-3 bg-white rounded-xl border border-background-200/70 overflow-x-auto">
              {currencyItems.map((item) => (
                <div key={item.key} className="flex items-center gap-1.5 md:gap-2 flex-shrink-0"
                  >
                  <span className="text-[10px] md:text-xs text-foreground-400 font-medium"
                  >
                    {currencyNames[item.key]}
                  </span>
                  <span className="text-xs md:text-sm font-bold text-foreground-900"
                  >
                    {formatToman(item.value)}
                  </span>
                  <span
                    className={`text-[10px] md:text-xs font-semibold ${
                      item.change >= 0 ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {formatPercent(item.change)}
                  </span>
                  <span className="text-foreground-200 text-xs mx-0.5 md:mx-1"
                  >|</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse"
                ></span>
                <span className="text-[10px] md:text-xs text-foreground-400"
                >نرخ‌های لحظه‌ای بازار</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Last Update Bar - dark green, between currency bar and table */}
          <ScrollReveal delay={125}>
            <div className="w-full flex items-center justify-between gap-3 px-3 md:px-5 py-2 mb-3 rounded-lg bg-emerald-800 border border-emerald-700 text-white text-[11px] md:text-xs font-medium animate-live-pulse">
              <div className="flex items-center gap-2">
                <i className="ri-time-line w-4 h-4 md:w-4.5 md:h-4.5 flex items-center justify-center"></i>
                <span>آخرین به‌روزرسانی: {lastUpdate || "—"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:inline text-emerald-300">بروزرسانی لحظه‌ای</span>
                <div className="w-2 h-2 rounded-full bg-emerald-300 animate-live-dot flex-shrink-0"></div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <article
              ref={tableRef}
              className="bg-white rounded-xl border border-background-200/80 overflow-hidden"
              aria-label="جدول قیمت روز پسته ایران"
            >
              {/* Scrollable wrapper - swipe to reveal chart on mobile */}
              <div className="overflow-x-auto md:overflow-visible relative">
                {/* Swipe hint indicator */}
                <div className="md:hidden absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-l from-transparent to-white/80 pointer-events-none flex items-center justify-center">
                  <i className="ri-arrow-left-s-line w-5 h-5 flex items-center justify-center text-foreground-300 animate-pulse"></i>
                </div>
              {/* Table Header */}
              <div className="flex items-center px-3 md:px-6 py-3 bg-background-100/70 border-b border-background-300/60 text-[11px] md:text-sm font-bold text-foreground-600 tracking-tight min-w-[400px] md:min-w-0">
                <div className="flex-1 min-w-0 pr-3 md:pr-5 text-right">رقم / انس</div>
                <div className="w-24 md:w-44 text-left">قیمت (تومان)</div>
                <div className="w-px h-4 bg-background-300/60 mx-2 md:mx-3"></div>
                <div className="w-14 md:w-28 text-center">تغییرات</div>
                <div className="w-10 md:w-20 text-center">نمودار</div>
              </div>

              {/* Grouped Rows */}
              {grouped.map((group, gi) => {
                const colors = varietyColors[group.type] || varietyColors["اکبری"];

                return (
                  <div key={group.type}>
                    {/* Subtle gap between groups */}
                    {gi > 0 && (
                      <div className="h-2 bg-background-100/80 min-w-[400px] md:min-w-0" />
                    )}

                    {/* Group Header */}
                    <div
                      className="flex items-center gap-3 px-4 md:px-6 py-2.5 bg-emerald-50/90 border-r-4 border-emerald-500 border-b border-emerald-200/60 min-w-[400px] md:min-w-0"
                    >
                      <span className="text-sm md:text-base font-extrabold text-emerald-800">
                        {group.type}
                      </span>
                      <span className={`text-[11px] md:text-xs rounded-full px-2.5 py-0.5 font-semibold ${colors.badge}`}>
                        {group.items.length} سایز
                      </span>
                    </div>

                    {/* Size Rows */}
                    {group.items.map((item) => {
                      const isPositive = item.dailyChangePercent >= 0;
                      const chartKey = `${item.type}-${item.size}`;
                      globalIdx++;

                      return (
                        <div
                          key={chartKey}
                          className={`flex items-center px-3 md:px-6 py-3 md:py-3.5 border-b border-background-200/40 last:border-b-0 hover:bg-background-50/80 transition-colors duration-150 min-w-[400px] md:min-w-0 ${
                            globalIdx % 2 === 0 ? "bg-white" : "bg-background-50/40"
                          }`}
                        >
                          {/* Variety Name + Size */}
                          <div className="flex-1 min-w-0 flex items-center justify-start gap-1.5 md:gap-2.5 pr-3 md:pr-5">
                            <span className="text-sm md:text-base font-bold text-foreground-900 whitespace-nowrap">
                              {item.type}
                            </span>
                            <span className={`inline-block px-2 md:px-2.5 py-0.5 md:py-1 rounded-md text-[11px] md:text-xs font-semibold ${colors.badge}`}>
                              {item.size}
                            </span>
                          </div>

                          {/* Today Price */}
                          <div className="w-24 md:w-44 text-left flex items-baseline gap-0.5 md:gap-1">
                            <span className="text-sm md:text-lg font-black text-foreground-950 whitespace-nowrap tabular-nums">
                              {formatToman(item.todayPrice)}
                            </span>
                            <span className="text-[10px] md:text-xs text-foreground-400 font-medium">تومان</span>
                          </div>

                          {/* Separator */}
                          <div className="w-px h-5 bg-background-300/60 mx-2 md:mx-3"></div>

                          {/* Change Percentage */}
                          <div className="w-14 md:w-28 text-center">
                            <span
                              className={`inline-flex items-center gap-0.5 text-[11px] md:text-sm font-bold whitespace-nowrap ${
                                isPositive ? "text-emerald-600" : "text-red-500"
                              }`}
                            >
                              <i
                                className={`${
                                  isPositive
                                    ? "ri-arrow-up-line"
                                    : item.dailyChangePercent < 0
                                    ? "ri-arrow-down-line"
                                    : "ri-subtract-line"
                                } w-3 h-3 md:w-3.5 md:h-3.5 flex items-center justify-center`}
                              ></i>
                              {isPositive ? "+" : ""}
                              {item.dailyChangePercent.toFixed(2)}%
                            </span>
                          </div>

                          {/* Chart Button */}
                          <div className="w-10 md:w-20 text-center">
                            <button
                              onClick={() => setActiveChart(chartKey)}
                              className="inline-flex items-center justify-center w-7 h-7 md:w-9 md:h-9 rounded-lg bg-background-100 hover:bg-primary-100 text-foreground-400 hover:text-primary-600 transition-all duration-200 cursor-pointer group"
                              title="نمودار تحلیل تکنیکال"
                            >
                              <i className="ri-line-chart-line w-3.5 h-3.5 md:w-4 md:h-4 flex items-center justify-center group-hover:scale-110 transition-transform"></i>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              </div>
            </article>
          </ScrollReveal>

          {/* PDF Download Bar - full width, between table and related links */}
          <ScrollReveal delay={250}>
            <div className="flex items-center justify-between gap-3 md:gap-5 mt-3 px-3 md:px-4 py-3 bg-white rounded-xl border border-background-200/70">
              <div className="flex items-center gap-2 md:gap-3">
                <i className="ri-download-2-line w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-emerald-600"></i>
                <span className="text-xs md:text-sm font-semibold text-foreground-800">دانلود جدول قیمت به صورت PDF</span>
                <span className="hidden sm:inline text-[10px] md:text-xs text-foreground-400">برای مشاهده آفلاین</span>
              </div>
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="inline-flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
              >
                {isDownloading ? (
                  <>
                    <i className="ri-loader-4-line w-4 h-4 md:w-5 md:h-5 flex items-center justify-center animate-spin"></i>
                    <span>در حال آماده‌سازی...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-download-2-line w-4 h-4 md:w-5 md:h-5 flex items-center justify-center"></i>
                    <span>دانلود PDF</span>
                  </>
                )}
              </button>
            </div>
          </ScrollReveal>

          {/* Related Content Links */}
          <ScrollReveal delay={300}>
            <div className="mt-6 pt-5 border-t border-background-200/60">
              <span className="block text-xs font-semibold text-foreground-400 mb-3">
                مطالب مرتبط:
              </span>
              <div className="flex flex-wrap gap-2">
                <a
                  href="#charts"
                  title="نمودار تاریخچه قیمت پسته - تحلیل تکنیکال و روند بازار"
                  className="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
                >
                  <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
                  <span>تاریخچه قیمت پسته</span>
                </a>
                <a
                  href="#market-notes"
                  title="یادداشت روزانه بازار پسته - تحلیل و پیش‌بینی"
                  className="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
                >
                  <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
                  <span>یادداشت روز بازار پسته</span>
                </a>
                <a
                  href="#expert-analysis"
                  title="تحلیل‌های کارشناسی بازار پسته - نظرات خبرگان"
                  className="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
                >
                  <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
                  <span>تحلیل کارشناسی بازار پسته</span>
                </a>
                <a
                  href="#faq"
                  title="سوالات متداول بازار پسته - پرسش و پاسخ تخصصی"
                  className="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
                >
                  <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
                  <span>سوالات متداول قیمت پسته</span>
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Technical Chart Modal */}
      {activeChart && selectedItem && (
        <TechnicalChartModal
          type={selectedItem.type}
          size={selectedItem.size}
          chartKey={activeChart}
          todayPrice={selectedItem.todayPrice}
          dailyChangePercent={selectedItem.dailyChangePercent}
          onClose={() => setActiveChart(null)}
        />
      )}

      {/* Request Price Modal */}
      {showRequestForm && (
        <RequestPriceModal onClose={() => setShowRequestForm(false)} />
      )}
    </>
  );
}