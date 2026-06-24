import { useEffect, useRef, useState, useMemo } from "react";
import { technicalChartData, type TechPeriod } from "@/mocks/pistachioData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";

interface TechnicalChartModalProps {
  type: string;
  size: string;
  chartKey: string;
  todayPrice: number;
  dailyChangePercent: number;
  onClose: () => void;
}

function formatToman(value: number): string {
  return value.toLocaleString("fa-IR");
}

const periodLabels: Record<TechPeriod, string> = {
  "7d": "۷ روز",
  "30d": "۳۰ روز",
  "90d": "۹۰ روز",
};

const periodDataCount: Record<TechPeriod, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

const periodSmaWindow: Record<TechPeriod, number> = {
  "7d": 3,
  "30d": 7,
  "90d": 10,
};

export default function TechnicalChartModal({
  type,
  size,
  chartKey,
  todayPrice,
  dailyChangePercent,
  onClose,
}: TechnicalChartModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [period, setPeriod] = useState<TechPeriod>("90d");

  const allPeriodData = technicalChartData[chartKey];
  const chartData = useMemo(
    () => (allPeriodData ? allPeriodData[period] : []),
    [allPeriodData, period]
  );

  const isPositive = dailyChangePercent >= 0;

  const priceMin = useMemo(() => {
    if (chartData.length === 0) return 0;
    const min = Math.min(...chartData.map((d) => d.low));
    return Math.floor(min * 0.98);
  }, [chartData]);

  const priceMax = useMemo(() => {
    if (chartData.length === 0) return 0;
    const max = Math.max(...chartData.map((d) => d.high));
    return Math.ceil(max * 1.02);
  }, [chartData]);

  const windowSize = periodSmaWindow[period];

  const smaData = useMemo(() => {
    return chartData.map((d, i) => {
      const slice = chartData.slice(Math.max(0, i - windowSize + 1), i + 1);
      const avg = slice.reduce((sum, p) => sum + p.close, 0) / slice.length;
      return { ...d, sma: Math.round(avg) };
    });
  }, [chartData, windowSize]);

  const xInterval = useMemo(() => {
    const len = chartData.length;
    if (len <= 7) return 0;
    if (len <= 30) return 4;
    return 9;
  }, [chartData]);

  const firstPrice = chartData.length > 0 ? chartData[0].close : todayPrice;
  const lastPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : todayPrice;
  const totalChange = lastPrice - firstPrice;
  const totalChangePercent = firstPrice > 0 ? (totalChange / firstPrice) * 100 : 0;
  const periodColorClass = totalChange >= 0 ? "text-emerald-400" : "text-red-400";

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 200);
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) handleClose();
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: { time: string; open: number; high: number; low: number; close: number } }[] }) => {
    if (!active || !payload || payload.length === 0) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-gray-400 mb-1">{d.time}</p>
        <div className="space-y-0.5 text-xs">
          <p className="text-gray-300">
            باز: <span className="text-white font-mono">{formatToman(d.open)}</span>
          </p>
          <p className="text-gray-300">
            بیشترین: <span className="text-emerald-400 font-mono">{formatToman(d.high)}</span>
          </p>
          <p className="text-gray-300">
            کمترین: <span className="text-red-400 font-mono">{formatToman(d.low)}</span>
          </p>
          <p className="text-gray-300">
            بسته:{" "}
            <span
              className={`font-mono ${
                d.close >= d.open ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {formatToman(d.close)}
            </span>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? "bg-black/70 backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <div
        className={`w-full max-w-4xl bg-[#131522] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-[#1e2032]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1a1d2e] flex items-center justify-center">
              <i className="ri-line-chart-line w-5 h-5 flex items-center justify-center text-primary-400"></i>
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-white">
                تحلیل تکنیکال - {type}
              </h3>
              <p className="text-xs text-gray-400">
                سایز {size} | قیمت امروز:{" "}
                <span className="text-white font-bold">
                  {formatToman(todayPrice)} تومان
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-bold whitespace-nowrap ${
                isPositive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {isPositive ? "+" : ""}
              {dailyChangePercent.toFixed(2)}%
            </span>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-lg bg-[#1a1d2e] hover:bg-[#252840] text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <i className="ri-close-line w-5 h-5 flex items-center justify-center"></i>
            </button>
          </div>
        </div>

        {/* Chart Area */}
        <div className="px-3 md:px-5 py-4">
          {/* Period Selector + Legend Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            {/* Period Tabs */}
            <div className="flex items-center bg-[#1a1d2e] rounded-full p-1">
              {(Object.keys(periodLabels) as TechPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    period === p
                      ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {periodLabels[p]}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>حمایت</span>
                <span className="text-white font-mono text-[11px]">
                  {formatToman(priceMin)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span>مقاومت</span>
                <span className="text-white font-mono text-[11px]">
                  {formatToman(priceMax)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>SMA {windowSize}</span>
              </div>
            </div>
          </div>

          {/* Period Performance Summary */}
          <div className="flex items-center gap-3 md:gap-5 mb-4 text-xs">
            <span className="text-gray-400">{periodLabels[period]} گذشته:</span>
            <span className={`font-bold font-mono ${periodColorClass}`}>
              {totalChange >= 0 ? "+" : ""}
              {formatToman(totalChange)} تومان
            </span>
            <span className={`font-bold ${periodColorClass}`}>
              ({totalChangePercent >= 0 ? "+" : ""}
              {totalChangePercent.toFixed(2)}%)
            </span>
          </div>

          <div className="h-[320px] md:h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={smaData}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="chartGradientGreen"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#22c55e"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor="#22c55e"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                  <linearGradient
                    id="chartGradientRed"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#ef4444"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor="#ef4444"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e2032"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: "#555974" }}
                  tickLine={false}
                  axisLine={{ stroke: "#1e2032" }}
                  interval={xInterval}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#555974" }}
                  tickLine={false}
                  axisLine={false}
                  domain={[priceMin, priceMax]}
                  tickFormatter={(v: number) =>
                    v >= 1000000
                      ? `${(v / 1000000).toFixed(1)}M`
                      : (v / 1000).toFixed(0)
                  }
                  width={55}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={priceMin}
                  stroke="#22c55e"
                  strokeDasharray="4 4"
                  strokeOpacity={0.4}
                />
                <ReferenceLine
                  y={priceMax}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeOpacity={0.4}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={totalChange >= 0 ? "#22c55e" : "#ef4444"}
                  strokeWidth={2}
                  fill={
                    totalChange >= 0
                      ? "url(#chartGradientGreen)"
                      : "url(#chartGradientRed)"
                  }
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "#fff",
                    stroke: totalChange >= 0 ? "#22c55e" : "#ef4444",
                    strokeWidth: 2,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sma"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  strokeDasharray="5 3"
                  fill="none"
                  dot={false}
                  activeDot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 md:px-6 py-3 border-t border-[#1e2032]">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <i className="ri-time-line w-3.5 h-3.5 flex items-center justify-center"></i>
              بروزرسانی: ۲۳ خرداد ۱۴۰۵
            </span>
            <span className="flex items-center gap-1">
              <i className="ri-bar-chart-grouped-line w-3.5 h-3.5 flex items-center justify-center"></i>
              بازه: {periodLabels[period]}
            </span>
            <span className="flex items-center gap-1">
              <i className="ri-pulse-line w-3.5 h-3.5 flex items-center justify-center"></i>
              {periodDataCount[period]} کندل
            </span>
          </div>
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg bg-[#1a1d2e] hover:bg-[#252840] text-gray-300 hover:text-white text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
          >
            بستن نمودار
          </button>
        </div>
      </div>
    </div>
  );
}