import { marketNews } from "@/mocks/marketContent";
import ScrollReveal from "@/components/base/ScrollReveal";

const newsImages = [
  "/images/home/news/news-market.webp",
  "/images/home/news/news-export.webp",
  "/images/home/news/news-orchard.webp",
  "/images/home/news/news-finance.webp",
] as const;

export default function LatestNews() {
  return (
    <section
      id="latest-news"
      className="w-full bg-background-50 px-4 py-10 md:px-6 md:py-14"
    >
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="mb-6 flex items-center justify-between md:mb-8">
            <h2 className="text-xl font-black text-foreground-950 md:text-3xl">
              <strong>آخرین اخبار</strong>
            </h2>
            <span className="text-xs font-light text-foreground-400 md:text-sm">
              تحولات لحظه‌ای بازار پسته
            </span>
            <a
              href="/news"
              className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full bg-foreground-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-foreground-800"
            >
              <span>مشاهده همه اخبار</span>
              <i className="ri-arrow-left-line flex h-4 w-4 items-center justify-center" />
            </a>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4">
          {marketNews.map((news, idx) => {
            const imageSrc = newsImages[idx % newsImages.length];

            return (
              <ScrollReveal
                key={news.id}
                delay={idx * 100}
                direction="up"
              >
                <article className="group relative h-64 overflow-hidden rounded-xl md:h-72">
                  <a
                    href="/news"
                    className="absolute inset-0 z-10 block cursor-pointer"
                    aria-label={news.title}
                  />

                  <img
                    src={imageSrc}
                    alt={news.title}
                    title={`${news.title} - PesteOnline`}
                    width={600}
                    height={400}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  <div className="absolute right-3 top-3">
                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                      {news.category}
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="mb-1.5 line-clamp-2 text-sm font-bold leading-snug text-white md:text-base">
                      <strong>{news.title}</strong>
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/60">{news.date}</span>
                      <span className="h-1 w-1 rounded-full bg-white/30" />
                      <span className="text-xs text-white/60">{news.source}</span>
                    </div>
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={400}>
          <div className="mt-8 border-t border-background-200/60 pt-5 md:mt-10">
            <span className="mb-3 block text-xs font-semibold text-foreground-400">
              مطالب مرتبط:
            </span>
            <div className="flex flex-wrap gap-2">
              <a
                href="#prices"
                title="جدول قیمت روز پسته ایران - قیمت لحظه‌ای انواع پسته"
                className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 transition-colors duration-200 hover:bg-primary-100"
              >
                <i className="ri-arrow-left-line flex h-3.5 w-3.5 items-center justify-center" />
                <span>قیمت لحظه‌ای پسته ایران</span>
              </a>
              <a
                href="#charts"
                title="نمودار تاریخچه قیمت پسته - تحلیل تکنیکال و روند بازار"
                className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 transition-colors duration-200 hover:bg-primary-100"
              >
                <i className="ri-arrow-left-line flex h-3.5 w-3.5 items-center justify-center" />
                <span>تاریخچه قیمت پسته</span>
              </a>
              <a
                href="/analysis"
                title="تحلیل‌های کارشناسی بازار پسته - نظرات خبرگان"
                className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 transition-colors duration-200 hover:bg-primary-100"
              >
                <i className="ri-arrow-left-line flex h-3.5 w-3.5 items-center justify-center" />
                <span>تحلیل کارشناسی بازار پسته</span>
              </a>
              <a
                href="/news"
                title="آرشیو کامل اخبار بازار پسته - آخرین اخبار و تحلیل"
                className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 transition-colors duration-200 hover:bg-primary-100"
              >
                <i className="ri-arrow-left-line flex h-3.5 w-3.5 items-center justify-center" />
                <span>آرشیو اخبار بازار پسته</span>
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
