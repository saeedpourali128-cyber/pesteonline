import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import BreadcrumbNav from "@/components/feature/BreadcrumbNav";
import RelatedContentLinks from "@/components/feature/RelatedContentLinks";
import {
  generateBreadcrumbJsonLd, structuredDataScript,
} from "@/components/feature/StructuredData";
import { pistachioTypes, type PistachioTypeKey, archivePeriodLabels, type ArchivePeriod } from "@/mocks/pistachioTypeData";
import ScrollReveal from "@/components/base/ScrollReveal";

const allPeriods: ArchivePeriod[] = ["today", "yesterday", "lastWeek", "lastMonth", "lastYear"];

const extendedChartPeriods: { key: string; label: string }[] = [
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

function priceChangePercent(current: number, previous: number): string {
  const diff = ((current - previous) / previous) * 100;
  const sign = diff >= 0 ? "+" : "";
  return `${sign}${diff.toFixed(2)}٪`;
}

function changeDirection(current: number, previous: number): "up" | "down" | "neutral" {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "neutral";
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

export default function PistachioArchivePage({ pistachioType }: { pistachioType: PistachioTypeKey }) {
  const typeData = pistachioTypes[pistachioType];
  const [chartPeriod, setChartPeriod] = useState("90d");

  useEffect(() => {
    document.title = `تاریخچه قیمت ${typeData.name} | نمودار و آرشیو قیمت ${typeData.name} | PesteOnline`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", `آرشیو کامل قیمت ${typeData.name} از امروز تا یک سال گذشته. مقایسه تغییرات قیمت، نمودار تاریخچه، تحلیل روند و پیش‌بینی بازار ${typeData.name}. مرجع تخصصی قیمت پسته ایران - PesteOnline`);
    const metaKw = document.querySelector('meta[name="keywords"]');
    if (metaKw) metaKw.setAttribute("content", `تاریخچه قیمت ${typeData.name}, آرشیو قیمت ${typeData.name}, نمودار قیمت ${typeData.name}, قیمت ${typeData.name}, تاریخچه قیمت پسته`);
  }, [typeData]);

  const todayPrice = typeData.prices.today;

  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: "صفحه اصلی", item: "/" },
    { name: typeData.name, item: `/${typeData.slug}` },
    { name: `تاریخچه قیمت ${typeData.name}`, item: `/price-history/${typeData.slug}` },
  ]);

  const relatedLinks = [
    { text: `قیمت روز ${typeData.name}`, href: `/${typeData.slug}`, title: `قیمت لحظه‌ای ${typeData.name} - جدول قیمت` },
    { text: "قیمت روز پسته ایران", href: "/#prices", title: "قیمت لحظه‌ای انواع پسته ایران" },
    { text: "اخبار بازار پسته", href: "/news", title: "آخرین اخبار بازار پسته" },
    { text: "تحلیل کارشناسی بازار پسته", href: "/analysis", title: "تحلیل‌های کارشناسی بازار پسته" },
  ];

  const allPistachioLinks = Object.values(pistachioTypes)
    .filter((t) => t.key !== pistachioType)
    .map((t) => ({ text: `قیمت ${t.name}`, href: `/${t.slug}`, title: `قیمت روز ${t.name}` }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataScript(breadcrumbLd) }} />

      <main className="min-h-screen bg-background-50">
        <BreadcrumbNav items={[
          { label: "صفحه اصلی", href: "/" },
          { label: typeData.name, href: `/${typeData.slug}` },
          { label: "آرشیو قیمت" },
        ]} />

        {/* Hero */}
        <section className="w-full bg-white border-b border-background-200/60 py-10 md:py-16 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <span className="inline-block bg-accent-100 text-accent-700 text-xs font-medium rounded-full px-3 py-1 mb-3">
                آرشیو تاریخی
              </span>
              <h1 className="text-2xl md:text-5xl font-black text-foreground-950 leading-[1.15] mb-3">
                <strong>آرشیو قیمت {typeData.name}</strong>
              </h1>
              <p className="text-sm md:text-base text-foreground-500 font-light max-w-xl leading-relaxed">
                تاریخچه کامل قیمت {typeData.name} — از امروز تا یک سال گذشته. مقایسه تغییرات قیمت، تحلیل روند و پیش‌بینی بازار.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Main Archive Table */}
        <section className="w-full bg-background-50 py-10 md:py-14 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <h2 className="text-xl md:text-3xl font-black text-foreground-950 mb-6">
                <strong>مقایسه قیمت {typeData.name}</strong> در بازه‌های زمانی مختلف
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div className="bg-white rounded-2xl border border-background-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="bg-background-50 border-b border-background-200/60">
                        <th className="px-4 md:px-6 py-4 text-sm font-bold text-foreground-700">بازه زمانی</th>
                        <th className="px-4 md:px-6 py-4 text-sm font-bold text-foreground-700">قیمت (تومان)</th>
                        <th className="px-4 md:px-6 py-4 text-sm font-bold text-foreground-700">تغییر نسبت به امروز</th>
                        <th className="px-4 md:px-6 py-4 text-sm font-bold text-foreground-700">درصد تغییر</th>
                        <th className="px-4 md:px-6 py-4 text-sm font-bold text-foreground-700">روند</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-background-100">
                      {allPeriods.map((period, idx) => {
                        const price = typeData.prices[period];
                        const change = price - todayPrice;
                        const changePct = period === "today" ? "0.00٪" : priceChangePercent(price, todayPrice);
                        const direction = period === "today" ? "neutral" : changeDirection(price, todayPrice);
                        const isToday = period === "today";

                        return (
                          <tr key={period} className={`transition-colors ${isToday ? "bg-primary-50/50" : "hover:bg-background-50/50"}`}>
                            <td className="px-4 md:px-6 py-4">
                              <div className="flex items-center gap-3">
                                {isToday && (
                                  <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0"></span>
                                )}
                                <span className={`text-sm font-semibold ${isToday ? "text-primary-700" : "text-foreground-900"}`}>
                                  {archivePeriodLabels[period]}
                                  {isToday && (
                                    <span className="text-xs text-primary-500 font-medium mr-2">(فعلی)</span>
                                  )}
                                </span>
                              </div>
                              <div className="text-xs text-foreground-400 mt-0.5 pr-5">
                                {idx === 0 ? "۲۳ خرداد ۱۴۰۵" : idx === 1 ? "۲۲ خرداد ۱۴۰۵" : idx === 2 ? "۱۶ خرداد ۱۴۰۵" : idx === 3 ? "۲۳ اردیبهشت ۱۴۰۵" : "۲۳ خرداد ۱۴۰۴"}
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4">
                              <span className="text-sm md:text-base font-bold text-foreground-950">
                                {formatPrice(price)}
                              </span>
                              <div className="text-xs text-foreground-400 mt-0.5">{typeData.prices.unit}</div>
                            </td>
                            <td className="px-4 md:px-6 py-4">
                              {period === "today" ? (
                                <span className="text-sm text-foreground-400">—</span>
                              ) : (
                                <span className={`inline-flex items-center gap-1 text-sm font-semibold ${
                                  direction === "up" ? "text-emerald-600" : direction === "down" ? "text-red-500" : "text-foreground-500"
                                }`}>
                                  <i className={`w-4 h-4 flex items-center justify-center ${
                                    direction === "up" ? "ri-arrow-up-line" : direction === "down" ? "ri-arrow-down-line" : "ri-subtract-line"
                                  }`}></i>
                                  {direction === "up" ? "+" : ""}{change.toLocaleString("fa-IR")}
                                </span>
                              )}
                            </td>
                            <td className="px-4 md:px-6 py-4">
                              {period === "today" ? (
                                <span className="text-sm text-foreground-400">—</span>
                              ) : (
                                <span className={`text-sm font-bold ${
                                  direction === "up" ? "text-emerald-600" : direction === "down" ? "text-red-500" : "text-foreground-500"
                                }`}>
                                  {changePct}
                                </span>
                              )}
                            </td>
                            <td className="px-4 md:px-6 py-4">
                              {period === "today" ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground-400 bg-foreground-100 rounded-full px-2.5 py-1 whitespace-nowrap">
                                  <i className="ri-circle-fill w-2 h-2 flex items-center justify-center"></i>
                                  فعلی
                                </span>
                              ) : (
                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 whitespace-nowrap ${
                                  direction === "up" ? "text-emerald-700 bg-emerald-50" : direction === "down" ? "text-red-600 bg-red-50" : "text-foreground-500 bg-foreground-50"
                                }`}>
                                  <i className={`w-3 h-3 flex items-center justify-center ${
                                    direction === "up" ? "ri-arrow-up-line" : direction === "down" ? "ri-arrow-down-line" : "ri-subtract-line"
                                  }`}></i>
                                  {direction === "up" ? "صعودی" : direction === "down" ? "نزولی" : "ثابت"}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Extended Chart */}
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
                    <strong>نمودار بلندمدت {typeData.name}</strong>
                  </h2>
                  <p className="text-sm text-white/60 mt-2 font-light">
                    روند قیمت {typeData.name} در بازه‌های بلندمدت — تحلیل و پیش‌بینی
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 rounded-full p-1 flex-wrap">
                  {extendedChartPeriods.map((p) => (
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
                    <AreaChart data={typeData.chartData[chartPeriod as keyof typeof typeData.chartData] || typeData.chartData["90d"]} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`archive-chart-${pistachioType}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "Vazirmatn" }} dy={8} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "Vazirmatn" }} tickFormatter={formatToman} dx={-8} width={60} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="price" stroke="#fbbf24" strokeWidth={2} fill={`url(#archive-chart-${pistachioType})`} dot={false} activeDot={{ r: 5, fill: "#fbbf24", stroke: "#fff", strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Year over Year Summary */}
        <section className="w-full bg-background-50 py-10 md:py-14 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <h2 className="text-xl md:text-3xl font-black text-foreground-950 mb-6">
                <strong>خلاصه تغییرات سالانه {typeData.name}</strong>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "تغییر روزانه", from: typeData.prices.yesterday, to: typeData.prices.today },
                  { label: "تغییر هفتگی", from: typeData.prices.lastWeek, to: typeData.prices.today },
                  { label: "تغییر ماهانه", from: typeData.prices.lastMonth, to: typeData.prices.today },
                  { label: "تغییر سالانه", from: typeData.prices.lastYear, to: typeData.prices.today },
                ].map((item, idx) => {
                  const diff = item.to - item.from;
                  const pct = ((item.to - item.from) / item.from) * 100;
                  const dir = diff > 0 ? "up" : diff < 0 ? "down" : "neutral";
                  return (
                    <div key={idx} className="bg-white rounded-xl p-5 border border-background-200/60">
                      <div className="text-xs text-foreground-400 mb-2">{item.label}</div>
                      <div className={`text-lg font-black mb-1 ${dir === "up" ? "text-emerald-600" : dir === "down" ? "text-red-500" : "text-foreground-700"}`}>
                        {dir === "up" ? "+" : ""}{diff.toLocaleString("fa-IR")}
                      </div>
                      <div className="text-sm text-foreground-500">تومان</div>
                      <div className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1 ${
                        dir === "up" ? "text-emerald-700 bg-emerald-50" : dir === "down" ? "text-red-600 bg-red-50" : "text-foreground-500 bg-foreground-50"
                      }`}>
                        <i className={`w-3 h-3 flex items-center justify-center ${dir === "up" ? "ri-arrow-up-line" : dir === "down" ? "ri-arrow-down-line" : "ri-subtract-line"}`}></i>
                        <span>{dir === "up" ? "+" : ""}{pct.toFixed(1)}٪</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Other Types Sidebar */}
        <section className="w-full bg-white border-t border-background-200/60 py-10 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <RelatedContentLinks links={relatedLinks} variant="light" />
            </ScrollReveal>
            <ScrollReveal delay={150}>
              <div className="mt-8 pt-6 border-t border-background-200/60">
                <span className="block text-xs font-semibold text-foreground-400 mb-3">
                  آرشیو قیمت سایر انواع پسته:
                </span>
                <div className="flex flex-wrap gap-2">
                  {allPistachioLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={`/price-history/${link.href.replace("/", "")}`}
                      title={link.title}
                      className="inline-flex items-center gap-1.5 bg-secondary-50 hover:bg-secondary-100 text-secondary-700 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
                    >
                      <i className="ri-history-line w-3.5 h-3.5 flex items-center justify-center"></i>
                      <span>آرشیو {link.text}</span>
                    </a>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </>
  );
}