import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { expertAnalyses } from "@/mocks/marketContent";
import ScrollReveal from "@/components/base/ScrollReveal";

const ITEMS_PER_PAGE = 6;

const analystImages: Record<number, string> = {
  1: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20business%20suit%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20friendly%20expression%2C%20corporate%20style&width=120&height=120&seq=analyst-01&orientation=squarish",
  2: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20smart%20casual%20attire%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20confident%20expression%2C%20modern%20corporate%20style&width=120&height=120&seq=analyst-02&orientation=squarish",
  3: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20woman%20portrait%20in%20business%20attire%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20confident%20smile%2C%20modern%20corporate%20style&width=120&height=120&seq=analyst-03&orientation=squarish",
  4: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20formal%20attire%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20thoughtful%20expression%2C%20academic%20style&width=120&height=120&seq=analyst-04&orientation=squarish",
  5: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20woman%20portrait%20in%20modern%20business%20attire%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20warm%20smile%2C%20contemporary%20style&width=120&height=120&seq=analyst-05&orientation=squarish",
  6: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20business%20casual%20attire%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20authoritative%20expression%2C%20executive%20style&width=120&height=120&seq=analyst-06&orientation=squarish",
  7: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20woman%20portrait%20in%20academic%20attire%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20intellectual%20expression%2C%20scholarly%20style&width=120&height=120&seq=analyst-07&orientation=squarish",
  8: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20outdoor%20farm%20setting%2C%20warm%20natural%20lighting%2C%20agricultural%20professional%20portrait%2C%20friendly%20expression%2C%20agribusiness%20style&width=120&height=120&seq=analyst-08&orientation=squarish",
  9: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20woman%20portrait%20in%20logistics%20warehouse%20attire%2C%20warm%20studio%20lighting%2C%20clean%20background%2C%20supply%20chain%20professional%20photography%2C%20confident%20expression&width=120&height=120&seq=analyst-09&orientation=squarish",
  10: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20modern%20office%2C%20warm%20lighting%2C%20financial%20trading%20professional%2C%20serious%20expression%2C%20corporate%20portrait%20photography&width=120&height=120&seq=analyst-10&orientation=squarish",
  11: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20woman%20portrait%20in%20business%20hijab%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20market%20analyst%20photography%2C%20friendly%20professional%20expression&width=120&height=120&seq=analyst-11&orientation=squarish",
  12: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20laboratory%20coat%2C%20warm%20studio%20lighting%2C%20clean%20background%2C%20agricultural%20scientist%20photography%2C%20focused%20expression&width=120&height=120&seq=analyst-12&orientation=squarish",
  13: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20woman%20portrait%20in%20creative%20office%2C%20warm%20studio%20lighting%2C%20branding%20consultant%20photography%2C%20modern%20business%20style%2C%20confident%20smile&width=120&height=120&seq=analyst-13&orientation=squarish",
  14: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20research%20institute%2C%20warm%20lighting%2C%20plant%20scientist%20photography%2C%20intellectual%20expression%2C%20academic%20professional&width=120&height=120&seq=analyst-14&orientation=squarish",
  15: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20woman%20portrait%20in%20modern%20tech%20office%2C%20warm%20studio%20lighting%2C%20e-commerce%20specialist%20photography%2C%20friendly%20professional%20expression&width=120&height=120&seq=analyst-15&orientation=squarish",
  16: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20formal%20suit%2C%20warm%20studio%20lighting%2C%20risk%20analyst%20photography%2C%20authoritative%20expression%2C%20corporate%20professional%20style&width=120&height=120&seq=analyst-16&orientation=squarish",
  17: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20woman%20portrait%20in%20food%20processing%20facility%2C%20warm%20lighting%2C%20food%20technologist%20photography%2C%20clean%20professional%20style%2C%20focused%20expression&width=120&height=120&seq=analyst-17&orientation=squarish",
  18: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20university%20setting%2C%20warm%20studio%20lighting%2C%20economics%20professor%20photography%2C%20academic%20professional%2C%20intellectual%20expression&width=120&height=120&seq=analyst-18&orientation=squarish",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "صفحه اصلی",
      "item": "/",
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "تحلیل‌های کارشناسی بازار پسته",
      "item": "/expert-analysis",
    },
  ],
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "تحلیل‌های کارشناسی بازار پسته | PesteOnline",
  "description": "آرشیو کامل تحلیل‌های کارشناسی بازار پسته ایران - نظرات و پیش‌بینی‌های خبرگان اقتصاد کشاورزی، صادرات و تجارت بین‌الملل پسته",
  "url": "/expert-analysis",
  "isPartOf": {
    "@type": "WebSite",
    "name": "PesteOnline - مرجع قیمت و تحلیل بازار پسته ایران",
    "url": "/",
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "صفحه اصلی",
        "item": "/",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "تحلیل‌های کارشناسی بازار پسته",
      },
    ],
  },
};

export default function ExpertAnalysisArchive() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    document.title = "تحلیل‌های کارشناسی بازار پسته | آرشیو کامل تحلیل و پیش‌بینی | PesteOnline";
  }, []);

  const sortedAnalyses = useMemo(
    () => [...expertAnalyses].sort((a, b) => b.id - a.id),
    []
  );

  const totalPages = Math.ceil(sortedAnalyses.length / ITEMS_PER_PAGE);
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedItems = useMemo(
    () =>
      sortedAnalyses.slice(
        (safePage - 1) * ITEMS_PER_PAGE,
        safePage * ITEMS_PER_PAGE
      ),
    [safePage, sortedAnalyses]
  );

  const handlePageChange = (page: number) => {
    setSearchParams(page > 1 ? { page: String(page) } : {});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= safePage - 1 && i <= safePage + 1)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  }, [totalPages, safePage]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      <main className="min-h-screen bg-background-50">
        {/* Breadcrumb Bar */}
        <nav aria-label="مسیر صفحه" className="w-full bg-white border-b border-background-200/60 py-3 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-xs md:text-sm text-foreground-400">
              <a href="/" className="hover:text-primary-600 transition-colors cursor-pointer whitespace-nowrap">
                صفحه اصلی
              </a>
              <i className="ri-arrow-left-s-line w-4 h-4 flex items-center justify-center"></i>
              <span className="text-foreground-700 font-medium">
                تحلیل‌های کارشناسی
              </span>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="w-full bg-white border-b border-background-200/60 py-10 md:py-16 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <span className="inline-block bg-accent-100 text-accent-700 text-xs font-medium rounded-full px-3 py-1 mb-3">
                بایگانی تحلیل‌ها
              </span>
              <h1 className="text-2xl md:text-5xl font-black text-foreground-950 leading-[1.15] mb-3">
                <strong>تحلیل‌های کارشناسی</strong>
                <br />
                <strong>بازار پسته ایران</strong>
              </h1>
              <p className="text-sm md:text-base text-foreground-500 font-light max-w-xl leading-relaxed">
                آرشیو کامل تحلیل‌ها و پیش‌بینی‌های <strong>کارشناسان بازار پسته</strong> — از اقتصاد کشاورزی تا تجارت بین‌الملل و <strong>صادرات پسته ایران</strong>
              </p>
              <div className="mt-4 text-xs text-foreground-300 font-light">
                {expertAnalyses.length} تحلیل کارشناسی
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Analysis Grid */}
        <section className="w-full py-10 md:py-14 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {paginatedItems.map((analysis, idx) => (
                <ScrollReveal key={analysis.id} delay={idx * 70} direction="up">
                  <article
                    className="bg-white rounded-xl p-5 md:p-6 border border-background-200/70 h-full flex flex-col"
                    aria-label={`تحلیل ${analysis.analyst} - ${analysis.title}`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-background-200">
                        <img
                          src={analystImages[analysis.id]}
                          alt={analysis.analyst}
                          title={`${analysis.analyst} - ${analysis.title}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-foreground-950 truncate">
                          {analysis.analyst}
                        </div>
                        <div className="text-xs text-foreground-400 truncate">
                          {analysis.title}
                        </div>
                        <div className="text-xs text-foreground-300 mt-0.5">
                          {analysis.date}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-foreground-600 leading-[1.9] font-light flex-1">
                      {analysis.content}
                    </p>
                    <div className="mt-4 pt-4 border-t border-background-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-foreground-400">
                        <i className="ri-chat-quote-line w-3.5 h-3.5 flex items-center justify-center"></i>
                        <span>تحلیل تخصصی</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href="/#prices"
                          title="مشاهده قیمت روز پسته ایران"
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer whitespace-nowrap transition-colors"
                        >
                          قیمت روز پسته
                        </a>
                        <span className="text-foreground-200">•</span>
                        <a
                          href="/#charts"
                          title="نمودار تاریخچه قیمت پسته"
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer whitespace-nowrap transition-colors"
                        >
                          تاریخچه قیمت
                        </a>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <ScrollReveal delay={300}>
                <nav aria-label="صفحه‌بندی" className="mt-10 md:mt-14 flex justify-center">
                  <div className="flex items-center gap-1.5 bg-white rounded-full border border-background-200/70 p-1">
                    {/* Previous */}
                    <button
                      onClick={() => handlePageChange(safePage - 1)}
                      disabled={safePage <= 1}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-foreground-400 hover:text-primary-600 hover:bg-primary-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                      aria-label="صفحه قبل"
                    >
                      <i className="ri-arrow-right-s-line w-5 h-5 flex items-center justify-center"></i>
                    </button>

                    {pageNumbers.map((p, i) =>
                      p === "..." ? (
                        <span
                          key={`dots-${i}`}
                          className="w-9 h-9 flex items-center justify-center text-foreground-300 text-sm"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => handlePageChange(p as number)}
                          className={`w-9 h-9 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                            safePage === p
                              ? "bg-primary-500 text-white"
                              : "text-foreground-500 hover:bg-primary-50 hover:text-primary-600"
                          }`}
                          aria-label={`صفحه ${p}`}
                          aria-current={safePage === p ? "page" : undefined}
                        >
                          {p}
                        </button>
                      )
                    )}

                    {/* Next */}
                    <button
                      onClick={() => handlePageChange(safePage + 1)}
                      disabled={safePage >= totalPages}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-foreground-400 hover:text-primary-600 hover:bg-primary-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                      aria-label="صفحه بعد"
                    >
                      <i className="ri-arrow-left-s-line w-5 h-5 flex items-center justify-center"></i>
                    </button>
                  </div>
                </nav>
              </ScrollReveal>
            )}

            {/* Related Content Links */}
            <ScrollReveal delay={400}>
              <div className="mt-12 pt-6 border-t border-background-200/60">
                <span className="block text-xs font-semibold text-foreground-400 mb-3 text-center">
                  مطالب مرتبط:
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  <a
                    href="/#prices"
                    title="جدول قیمت روز پسته ایران - قیمت لحظه‌ای انواع پسته"
                    className="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
                  >
                    <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
                    <span>قیمت لحظه‌ای پسته ایران</span>
                  </a>
                  <a
                    href="/#charts"
                    title="نمودار تاریخچه قیمت پسته - تحلیل تکنیکال بازار"
                    className="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
                  >
                    <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
                    <span>تاریخچه قیمت پسته</span>
                  </a>
                  <a
                    href="/#market-notes"
                    title="یادداشت روزانه بازار پسته - تحلیل و پیش‌بینی"
                    className="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
                  >
                    <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
                    <span>یادداشت روز بازار پسته</span>
                  </a>
                  <a
                    href="/#faq"
                    title="سوالات متداول بازار پسته - پرسش و پاسخ تخصصی"
                    className="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
                  >
                    <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
                    <span>سوالات متداول پسته</span>
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </>
  );
}