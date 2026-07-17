import { pistachioPrices } from "@/mocks/pistachioData";

export default function MarketStatusNote() {
  const averageDailyChange =
    pistachioPrices.length > 0
      ? pistachioPrices.reduce(
          (total, item) => total + item.dailyChangePercent,
          0,
        ) / pistachioPrices.length
      : 0;

  const isUp = averageDailyChange >= 0;

  const statusText = isUp
    ? "بازار امروز روند صعودی داره - تقاضای صادراتی بالاست"
    : "بازار امروز روند نزولی داره - عرضه افزایش پیدا کرده";

  return (
    <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#fef9e7] border border-[#f5e6b8]/70 cursor-default whitespace-nowrap transition-all duration-200 hover:bg-[#fdf5d6]">
      <div className="w-6 h-6 rounded-md bg-[#fef0c7] flex items-center justify-center flex-shrink-0">
        <i
          className={`${
            isUp
              ? "ri-arrow-up-line text-amber-600"
              : "ri-arrow-down-line text-red-500"
          } text-sm w-3.5 h-3.5 flex items-center justify-center`}
        ></i>
      </div>

      <span className="text-sm font-medium text-amber-900/80 leading-tight">
        <strong>{statusText}</strong>
      </span>

      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></div>
    </div>
  );
}