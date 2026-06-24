import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import BreadcrumbNav from "@/components/feature/BreadcrumbNav";
import RelatedContentLinks from "@/components/feature/RelatedContentLinks";
import {
  generateBreadcrumbJsonLd, generateFAQJsonLd, generateProductPriceJsonLd, structuredDataScript,
} from "@/components/feature/StructuredData";
import { pistachioTypes, type PistachioTypeKey, archivePeriodLabels, type ArchivePeriod } from "@/mocks/pistachioTypeData";
import { pistachioPrices } from "@/mocks/pistachioData";
import { allNewsArticles } from "@/mocks/newsArticles";
import ScrollReveal from "@/components/base/ScrollReveal";

const chartPeriods: { key: string; label: string }[] = [
  { key: "7d", label: "۷ روز" },
  { key: "30d", label: "۳۰ روز" },
  { key: "90d", label: "۹۰ روز" },
  { key: "180d", label: "۶ ماه" },
  { key: "1y", label: "۱ سال" },
];

function formatToman(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toLocaleString("fa-IR")}M`;
  return value.toLocaleString("fa-IR");
}

function formatPrice(value: number): string {
  return value.toLocaleString("fa-IR");
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 border border-background-200 shadow-sm">
        <p className="text-xs text-foreground-500 mb-1">{label}</p>
        <p className="text-sm font-bold text-primary-700">
          {payload[0].value.toLocaleString("fa-IR")} تومان
        </p>
      </div>
    );
  }
  return null;
};

const priceChangeTag = (change: number) => {
  if (change === 0) return { text: "بدون تغییر", color: "text-foreground-500", icon: "ri-subtract-line", bg: "bg-foreground-100" };
  if (change > 0) return { text: `${change.toLocaleString("fa-IR")}+ تومان`, color: "text-emerald-600", icon: "ri-arrow-up-line", bg: "bg-emerald-50" };
  return { text: `${Math.abs(change).toLocaleString("fa-IR")}- تومان`, color: "text-red-500", icon: "ri-arrow-down-line", bg: "bg-red-50" };
};

export default function PistachioTypePage({ pistachioType }: { pistachioType: PistachioTypeKey }) {
  const typeData = pistachioTypes[pistachioType];
  const [chartPeriod, setChartPeriod] = useState("30d");
  const currentPrices = pistachioPrices.filter((p) => p.type === typeData.name);

  useEffect(() => {
    document.title = typeData.seo.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", typeData.seo.description);
    const metaKw = document.querySelector('meta[name="keywords"]');
    if (metaKw) metaKw.setAttribute("content", typeData.seo.keywords);
  }, [typeData]);

  const breadcrumbItems = [
    { label: "صفحه اصلی", href: "/" },
    { label: typeData.name },
  ];

  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: "صفحه اصلی", item: "/" },
    { name: typeData.name },
  ]);

  const faqLd = generateFAQJsonLd(typeData.faqItems);

  const priceLd = generateProductPriceJsonLd(
    `${typeData.name} - PesteOnline`,
    typeData.description,
    typeData.prices.today,
    "IRR",
    `/${typeData.slug}`
  );

  const relatedLinks = [
    { text: `قیمت لحظه‌ای ${typeData.name}`, href: `/${typeData.slug}`, title: `قیمت روز ${typeData.name} - جدول قیمت به‌روز` },
    { text: `آرشیو قیمت ${typeData.name}`, href: `/price-history/${typeData.slug}`, title: `آرشیو تاریخی قیمت ${typeData.name} - امروز، دیروز، هفته و ماه گذشته` },
    { text: "قیمت روز پسته ایران", href: "/#prices", title: "قیمت لحظه‌ای انواع پسته ایران" },
    { text: "اخبار بازار پسته", href: "/news", title: "آخرین اخبار بازار پسته ایران" },
    { text: "تحلیل کارشناسی بازار پسته", href: "/analysis", title: "تحلیل‌های کارشناسی بازار پسته" },
  ];

  const allPistachioLinks = Object.values(pistachioTypes)
    .filter((t) => t.key !== pistachioType)
    .map((t) => ({
      text: `قیمت ${t.name}`,
      href: `/${t.slug}`,
      title: `قیمت روز ${t.name} - ${t.description}`,
    }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataScript(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataScript(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataScript(priceLd) }} />

      <main className="min-h-screen bg-background-50">
        <BreadcrumbNav items={breadcrumbItems} />

        {/* Hero / Price Banner */}
        <section className="w-full bg-white border-b border-background-200/60 py-10 md:py-16 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <span className="inline-block bg-primary-100 text-primary-700 text-xs font-medium rounded-full px-3 py-1 mb-3">
                    {typeData.category === "premium" ? "رقم لوکس" : typeData.category === "standard" ? "رقم استاندارد" : typeData.category === "kernel" ? "مغز پسته" : "رقم اقتصادی"}
                  </span>
                  <h1 className="text-2xl md:text-5xl font-black text-foreground-950 leading-[1.15] mb-3">
                    <strong>{typeData.seo.h1}</strong>
                  </h1>
                  <p className="text-sm md:text-base text-foreground-500 font-light max-w-xl leading-relaxed">
                    {typeData.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {typeData.sizes.map((size) => (
                      <span key={size} className="text-xs bg-background-100 text-foreground-600 rounded-full px-3 py-1.5 font-medium">
                        سایز {size}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0 bg-background-50 rounded-2xl p-6 md:p-8 text-center border border-background-200/60">
                  <div className="text-xs text-foreground-400 mb-2">قیمت امروز {typeData.sizes[0]}</div>
                  <div className="text-3xl md:text-4xl font-black text-foreground-950 mb-1">
                    {formatPrice(typeData.prices.today)}
                  </div>
                  <div className="text-sm text-foreground-400">{typeData.prices.unit}</div>
                  {(() => {
                    const change = typeData.prices.today - typeData.prices.yesterday;
                    const tag = priceChangeTag(change);
                    return (
                      <div className={`mt-3 inline-flex items-center gap-1.5 ${tag.bg} rounded-full px-3 py-1`}>
                        <i className={`${tag.icon} w-3.5 h-3.5 flex items-center justify-center ${tag.color}`}></i>
                        <span className={`text-xs font-semibold ${tag.color}`}>{tag.text}</span>
                      </div>
                    );
                  })()}
                  <a
                    href={`/price-history/${typeData.slug}`}
                    className="mt-4 inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full px-4 py-2 text-sm font-semibold cursor-pointer transition-colors whitespace-nowrap"
                  >
                    <i className="ri-history-line w-4 h-4 flex items-center justify-center"></i>
                    <span>مشاهده آرشیو قیمت</span>
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Historical Chart */}
        <section className="w-full bg-primary-800 py-10 md:py-14 px-4 md:px-6 overflow-hidden relative">
          <div className="absolute inset-0 opacity-[0.06]">
            <div className="w-full h-full" style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.3) 39px, rgba(255,255,255,0.3) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.3) 39px, rgba(255,255,255,0.3) 40px)`
            }}></div>
          </div>
          <div className="relative z-10 max-w-7xl mx-auto">
            <ScrollReveal>
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl md:text-4xl font-black text-white leading-[1.2]">
                    <strong>تاریخچه قیمت {typeData.name}</strong>
                  </h2>
                  <p className="text-sm text-white/60 mt-2 font-light">
                    نمودار قیمت {typeData.name} در بازه‌های زمانی مختلف
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 rounded-full p-1 flex-wrap">
                  {chartPeriods.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setChartPeriod(p.key)}
                      className={`px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        chartPeriod === p.key ? "bg-white text-primary-800" : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={150}>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/10">
                <div className="h-[300px] md:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={typeData.chartData[chartPeriod as keyof typeof typeData.chartData] || typeData.chartData["30d"]} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`chartGradient-${pistachioType}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "Vazirmatn" }} dy={8} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "Vazirmatn" }} tickFormatter={formatToman} dx={-8} width={60} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="price" stroke="#fbbf24" strokeWidth={2} fill={`url(#chartGradient-${pistachioType})`} dot={false} activeDot={{ r: 5, fill: "#fbbf24", stroke: "#fff", strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Quick Archive Table */}
        <section className="w-full bg-background-50 py-10 md:py-14 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl md:text-3xl font-black text-foreground-950">
                    <strong>آرشیو قیمت {typeData.name}</strong>
                  </h2>
                  <p className="text-sm text-foreground-500 mt-1 font-light">
                    قیمت {typeData.name} در بازه‌های زمانی مختلف — مقایسه و تحلیل تغییرات
                  </p>
                </div>
                <a
                  href={`/price-history/${typeData.slug}`}
                  className="hidden sm:inline-flex items-center gap-2 bg-foreground-900 hover:bg-foreground-800 text-white rounded-full px-4 py-2 text-sm font-medium cursor-pointer transition-colors whitespace-nowrap"
                >
                  <span>آرشیو کامل</span>
                  <i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center"></i>
                </a>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="bg-white rounded-2xl border border-background-200/60 overflow-hidden">
                <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-background-100">
                  {(["today", "yesterday", "lastWeek", "lastMonth", "lastYear"] as ArchivePeriod[]).map((period) => {
                    const price = typeData.prices[period];
                    const change = period === "today" ? 0 : price - typeData.prices.today;
                    const tag = period === "today" ? { color: "text-foreground-500", icon: "", bg: "" } : priceChangeTag(change);
                    return (
                      <div key={period} className="p-4 md:p-5 text-center">
                        <div className="text-xs text-foreground-400 mb-2">{archivePeriodLabels[period]}</div>
                        <div className="text-base md:text-lg font-black text-foreground-950">
                          {formatPrice(price)}
                        </div>
                        <div className="text-xs text-foreground-400 mt-1">تومان</div>
                        {period !== "today" && (
                          <div className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${tag.color}`}>
                            <i className={`${tag.icon} w-3 h-3 flex items-center justify-center`}></i>
                            <span>{tag.text}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Market Analysis */}
        <section className="w-full bg-white py-10 md:py-14 px-4 md:px-6 border-t border-background-200/60">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-8">
                <span className="inline-block bg-accent-100 text-accent-700 text-xs font-medium rounded-full px-3 py-1 mb-3">
                  تحلیل بازار
                </span>
                <h2 className="text-xl md:text-3xl font-black text-foreground-950">
                  <strong>وضعیت بازار {typeData.name}</strong>
                </h2>
                <p className="text-sm text-foreground-500 mt-2 font-light">
                  تحلیل روزانه عرضه، تقاضا، روند قیمت و یادداشت بازار {typeData.name}
                </p>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <ScrollReveal delay={50}>
                <div className="bg-background-50 rounded-2xl p-5 md:p-6 border border-background-200/60 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <i className="ri-stack-line w-5 h-5 flex items-center justify-center text-emerald-600"></i>
                    </span>
                    <h3 className="text-sm font-bold text-foreground-900">وضعیت عرضه</h3>
                  </div>
                  <p className="text-sm text-foreground-600 leading-[1.9] font-light">{typeData.marketAnalysis.supply}</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={100}>
                <div className="bg-background-50 rounded-2xl p-5 md:p-6 border border-background-200/60 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <i className="ri-global-line w-5 h-5 flex items-center justify-center text-amber-600"></i>
                    </span>
                    <h3 className="text-sm font-bold text-foreground-900">تقاضای صادراتی</h3>
                  </div>
                  <p className="text-sm text-foreground-600 leading-[1.9] font-light">{typeData.marketAnalysis.exportDemand}</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={150}>
                <div className="bg-background-50 rounded-2xl p-5 md:p-6 border border-background-200/60 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                      <i className="ri-line-chart-line w-5 h-5 flex items-center justify-center text-rose-600"></i>
                    </span>
                    <h3 className="text-sm font-bold text-foreground-900">روند بازار</h3>
                  </div>
                  <p className="text-sm text-foreground-600 leading-[1.9] font-light">{typeData.marketAnalysis.trend}</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={200}>
                <div className="bg-primary-800 rounded-2xl p-5 md:p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <i className="ri-chat-quote-line w-5 h-5 flex items-center justify-center text-white"></i>
                    </span>
                    <h3 className="text-sm font-bold text-white">یادداشت بازار</h3>
                  </div>
                  <p className="text-sm text-white/80 leading-[1.9] font-light">{typeData.marketAnalysis.marketNote}</p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Related News */}
        {(() => {
          const relatedArticles = allNewsArticles.filter((a) => a.relatedTypes.includes(pistachioType)).slice(0, 3);
          if (relatedArticles.length === 0) return null;
          return (
            <section className="w-full bg-background-50 py-10 md:py-14 px-4 md:px-6 border-t border-background-200/60">
              <div className="max-w-7xl mx-auto">
                <ScrollReveal>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className="inline-block bg-primary-100 text-primary-700 text-xs font-medium rounded-full px-3 py-1 mb-2">
                        اخبار مرتبط
                      </span>
                      <h2 className="text-xl md:text-3xl font-black text-foreground-950">
                        <strong>اخبار {typeData.name}</strong>
                      </h2>
                      <p className="text-sm text-foreground-500 mt-1 font-light">
                        آخرین اخبار و تحلیل‌های مرتبط با بازار {typeData.name}
                      </p>
                    </div>
                    <a
                      href="/news"
                      className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 cursor-pointer whitespace-nowrap"
                    >
                      <span>همه اخبار</span>
                      <i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center"></i>
                    </a>
                  </div>
                </ScrollReveal>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                  {relatedArticles.map((article, idx) => (
                    <ScrollReveal key={article.id} delay={idx * 70}>
                      <article className="bg-white rounded-xl border border-background-200/70 overflow-hidden h-full flex flex-col group cursor-pointer">
                        <div className="p-4 md:p-5 flex-1 flex flex-col">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-foreground-400">{article.date}</span>
                            <span className="text-xs bg-secondary-50 text-secondary-600 rounded-full px-2 py-0.5 font-medium">{article.category}</span>
                          </div>
                          <h3 className="text-sm font-bold text-foreground-950 mb-2 leading-[1.5] group-hover:text-primary-600 transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-xs text-foreground-500 leading-[1.8] font-light flex-1">
                            {article.summary}
                          </p>
                          <a
                            href="/news"
                            className="mt-3 text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>مشاهده خبر</span>
                            <i className="ri-arrow-left-s-line w-3.5 h-3.5 flex items-center justify-center"></i>
                          </a>
                        </div>
                      </article>
                    </ScrollReveal>
                  ))}
                </div>
                <div className="mt-4 text-center sm:hidden">
                  <a
                    href="/news"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 cursor-pointer"
                  >
                    <span>مشاهده همه اخبار</span>
                    <i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center"></i>
                  </a>
                </div>
              </div>
            </section>
          );
        })()}

        {/* SEO Content Area */}
        <section className="w-full bg-white py-10 md:py-14 px-4 md:px-6 border-y border-background-200/60">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
              <ScrollReveal className="lg:col-span-2">
                <div>
                  <h2 className="text-xl md:text-3xl font-black text-foreground-950 mb-6">
                    <strong>راهنمای جامع {typeData.name}</strong>
                  </h2>
                  <div className="prose max-w-none">
                    <p className="text-sm md:text-base text-foreground-600 leading-[2] font-light mb-6">
                      {typeData.seo.intro}
                    </p>

                    <h3 className="text-lg md:text-xl font-bold text-foreground-900 mt-8 mb-4">
                      ویژگی‌های <strong>{typeData.name}</strong>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {typeData.seo.characteristics.map((char, idx) => (
                        <div key={idx} className="bg-background-50 rounded-xl p-4 md:p-5 border border-background-200/40">
                          <h4 className="text-sm font-bold text-foreground-900 mb-2">{char.title}</h4>
                          <p className="text-xs md:text-sm text-foreground-500 leading-[1.9] font-light">{char.content}</p>
                        </div>
                      ))}
                    </div>

                    <h3 className="text-lg md:text-xl font-bold text-foreground-900 mt-8 mb-4">
                      وضعیت بازار <strong>{typeData.name}</strong>
                    </h3>
                    <p className="text-sm md:text-base text-foreground-600 leading-[2] font-light mb-6">
                      {typeData.seo.marketInfo}
                    </p>

                    <h3 className="text-lg md:text-xl font-bold text-foreground-900 mt-8 mb-4">
                      صادرات <strong>{typeData.name}</strong>
                    </h3>
                    <p className="text-sm md:text-base text-foreground-600 leading-[2] font-light mb-6">
                      {typeData.seo.exportInfo}
                    </p>

                    <h3 className="text-lg md:text-xl font-bold text-foreground-900 mt-8 mb-4">
                      راهنمای تشخیص <strong>{typeData.name}</strong> اصل
                    </h3>
                    <p className="text-sm md:text-base text-foreground-600 leading-[2] font-light">
                      {typeData.seo.qualityTips}
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={200} className="lg:col-span-1">
                <div className="lg:sticky lg:top-24 space-y-6">
                  {/* Quick links sidebar */}
                  <div className="bg-background-50 rounded-2xl p-5 border border-background-200/60">
                    <h4 className="text-sm font-bold text-foreground-900 mb-4">دسترسی سریع</h4>
                    <div className="flex flex-col gap-2">
                      <a href={`/price-history/${typeData.slug}`} className="flex items-center gap-2 text-sm text-foreground-600 hover:text-primary-600 transition-colors cursor-pointer">
                        <i className="ri-history-line w-4 h-4 flex items-center justify-center"></i>
                        <span>آرشیو قیمت {typeData.name}</span>
                      </a>
                      <a href="/news" className="flex items-center gap-2 text-sm text-foreground-600 hover:text-primary-600 transition-colors cursor-pointer">
                        <i className="ri-newspaper-line w-4 h-4 flex items-center justify-center"></i>
                        <span>اخبار بازار پسته</span>
                      </a>
                      <a href="/analysis" className="flex items-center gap-2 text-sm text-foreground-600 hover:text-primary-600 transition-colors cursor-pointer">
                        <i className="ri-bar-chart-line w-4 h-4 flex items-center justify-center"></i>
                        <span>تحلیل‌های کارشناسی</span>
                      </a>
                      <a href="/#prices" className="flex items-center gap-2 text-sm text-foreground-600 hover:text-primary-600 transition-colors cursor-pointer">
                        <i className="ri-price-tag-3-line w-4 h-4 flex items-center justify-center"></i>
                        <span>قیمت روز پسته ایران</span>
                      </a>
                    </div>
                  </div>

                  {/* Other pistachio types */}
                  <div className="bg-background-50 rounded-2xl p-5 border border-background-200/60">
                    <h4 className="text-sm font-bold text-foreground-900 mb-4">سایر انواع پسته</h4>
                    <div className="flex flex-col gap-2">
                      {allPistachioLinks.slice(0, 3).map((link, idx) => (
                        <a key={idx} href={link.href} title={link.title} className="text-sm text-foreground-600 hover:text-primary-600 transition-colors cursor-pointer truncate">
                          {link.text}
                        </a>
                      ))}
                      <a href="/" className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-1 cursor-pointer">
                        مشاهده همه ←
                      </a>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="w-full bg-background-50 py-10 md:py-14 px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-8">
                <span className="inline-block bg-accent-100 text-accent-700 text-xs font-medium rounded-full px-3 py-1 mb-3">
                  سوالات متداول
                </span>
                <h2 className="text-xl md:text-3xl font-black text-foreground-950">
                  <strong>سوالات متداول {typeData.name}</strong>
                </h2>
                <p className="text-sm text-foreground-500 mt-2 font-light">
                  پاسخ به پرتکرارترین سوالات درباره {typeData.name}
                </p>
              </div>
            </ScrollReveal>
            <div className="flex flex-col gap-3">
              {typeData.faqItems.map((item, idx) => (
                <QAAccordion key={idx} question={item.question} answer={item.answer} defaultOpen={idx === 0} />
              ))}
            </div>
          </div>
        </section>

        {/* Related Content Links */}
        <section className="w-full bg-white border-t border-background-200/60 py-10 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <RelatedContentLinks links={relatedLinks} variant="light" />
            </ScrollReveal>
          </div>
        </section>
      </main>
    </>
  );
}

function QAAccordion({ question, answer, defaultOpen }: { question: string; answer: string; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <ScrollReveal>
      <div className={`bg-white border rounded-xl overflow-hidden transition-all duration-300 ${
        open ? "border-primary-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.04)]" : "border-background-200/60 hover:border-background-300/70"
      }`}>
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between gap-4 px-5 md:px-6 py-4 text-right cursor-pointer transition-colors duration-200 hover:bg-background-50/50"
          aria-expanded={open}
        >
          <span className={`text-sm md:text-base font-bold transition-colors ${open ? "text-primary-700" : "text-foreground-900"}`}>
            {question}
          </span>
          <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
            open ? "bg-primary-500 text-white rotate-45" : "bg-background-100 text-foreground-400"
          }`}>
            <i className="ri-add-line w-4 h-4 flex items-center justify-center"></i>
          </span>
        </button>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="px-5 md:px-6 pb-5 pt-1 text-sm text-foreground-600 leading-[2] font-light border-t border-background-100">
            {answer}
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}