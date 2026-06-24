import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { chartData7d, chartData30d, chartData90d, chartData6m, chartData1y, type ChartPeriod } from "@/mocks/pistachioData";
import ScrollReveal from "@/components/base/ScrollReveal";

const periodLabels: Record<ChartPeriod, string> = {
  "7d": "۷ روز",
  "30d": "۳۰ روز",
  "90d": "۹۰ روز",
  "6m": "۶ ماه",
  "1y": "۱ سال",
};

const chartDataMap: Record<ChartPeriod, { date: string; price: number }[]> = {
  "7d": chartData7d,
  "30d": chartData30d,
  "90d": chartData90d,
  "6m": chartData6m,
  "1y": chartData1y,
};

const periods: ChartPeriod[] = ["7d", "30d", "90d", "6m", "1y"];

function formatToman(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toLocaleString("fa-IR")}M`;
  }
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

export default function HistoricalCharts() {
  const [activePeriod, setActivePeriod] = useState<ChartPeriod>("7d");
  const chartData = chartDataMap[activePeriod];

  return (
    <section id="charts" className="relative w-full bg-primary-800 py-12 md:py-16 px-4 md:px-6 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06]">
        <div className="w-full h-full" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.3) 39px, rgba(255,255,255,0.3) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.3) 39px, rgba(255,255,255,0.3) 40px)`
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="order-1">
              <h2 className="text-2xl md:text-4xl font-black text-white leading-[1.2]">
                <strong>تاریخچه قیمت</strong>
              </h2>
              <p className="text-sm md:text-base text-white/60 mt-2 font-light max-w-md">
                نمودار شمعی و خطی بازه‌های زمانی مختلف برای تحلیل روند بازار پسته
              </p>
            </div>
            <div className="order-2 flex items-center gap-1.5 bg-white/10 rounded-full p-1 flex-wrap">
              {periods.map((period) => (
                <button
                  key={period}
                  onClick={() => setActivePeriod(period)}
                  className={`px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    activePeriod === period
                      ? "bg-white text-primary-800"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {periodLabels[period]}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/10">
            <div className="h-[300px] md:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.08)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "Vazirmatn" }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "Vazirmatn" }}
                    tickFormatter={formatToman}
                    dx={-8}
                    width={60}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#fbbf24"
                    strokeWidth={2}
                    fill="url(#chartGradient)"
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "#fbbf24",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ScrollReveal>

        <div className="flex items-center justify-between mt-4 md:mt-6 text-white/50 text-xs">
          <span>منبع: PesteOnline Market Data</span>
          <span>TradingView Style Chart</span>
        </div>

        {/* Related Content Links */}
        <ScrollReveal delay={300}>
          <div className="mt-8 pt-6 border-t border-white/10">
            <span className="block text-xs font-semibold text-white/50 mb-3">
              مطالب مرتبط:
            </span>
            <div className="flex flex-wrap gap-2">
              <a
                href="#prices"
                title="جدول قیمت روز پسته ایران - قیمت لحظه‌ای و به‌روز"
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
              >
                <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
                <span>قیمت لحظه‌ای پسته ایران</span>
              </a>
              <a
                href="#market-notes"
                title="یادداشت روزانه بازار پسته - تحلیل و پیش‌بینی"
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
              >
                <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
                <span>یادداشت روز بازار پسته</span>
              </a>
              <a
                href="#expert-analysis"
                title="تحلیل‌های کارشناسی بازار پسته - پیش‌بینی قیمت"
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
              >
                <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
                <span>تحلیل کارشناسی بازار پسته</span>
              </a>
              <a
                href="#faq"
                title="سوالات متداول بازار پسته - پرسش و پاسخ"
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
              >
                <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
                <span>سوالات متداول پسته</span>
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}