import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import BreadcrumbNav from "@/components/feature/BreadcrumbNav";
import RelatedContentLinks from "@/components/feature/RelatedContentLinks";
import {
  generateBreadcrumbJsonLd, generateCollectionPageJsonLd, structuredDataScript,
} from "@/components/feature/StructuredData";
import { allAnalysisArticles, analysisCategories } from "@/mocks/analysisArticles";
import { pistachioTypes } from "@/mocks/pistachioTypeData";
import ScrollReveal from "@/components/base/ScrollReveal";
import { formatPersianDate, getPublishedArticles, type ArticleRecord } from "@/lib/articles";

const ITEMS_PER_PAGE = 9;

interface DisplayAnalysisArticle {
  id: string;
  analyst: string;
  title: string;
  content: string;
  date: string;
  category: string;
  slug: string;
  relatedTypes: string[];
  coverImage?: string | null;
}


const analystImages: Record<number, string> = {
  1: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20business%20suit%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20friendly%20expression%2C%20corporate%20style&width=120&height=120&seq=analysis-01&orientation=squarish",
  2: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20smart%20casual%20attire%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20confident%20expression%2C%20modern%20corporate%20style&width=120&height=120&seq=analysis-02&orientation=squarish",
  3: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20woman%20portrait%20in%20business%20attire%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20confident%20smile%2C%20modern%20corporate%20style&width=120&height=120&seq=analysis-03&orientation=squarish",
  4: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20formal%20attire%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20thoughtful%20expression%2C%20academic%20style&width=120&height=120&seq=analysis-04&orientation=squarish",
  5: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20woman%20portrait%20in%20modern%20business%20attire%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20warm%20smile%2C%20contemporary%20style&width=120&height=120&seq=analysis-05&orientation=squarish",
  6: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20business%20casual%20attire%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20authoritative%20expression%2C%20executive%20style&width=120&height=120&seq=analysis-06&orientation=squarish",
  7: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20woman%20portrait%20in%20academic%20attire%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20intellectual%20expression%2C%20scholarly%20style&width=120&height=120&seq=analysis-07&orientation=squarish",
  8: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20outdoor%20farm%20setting%2C%20warm%20natural%20lighting%2C%20agricultural%20professional%20portrait%2C%20friendly%20expression%2C%20agribusiness%20style&width=120&height=120&seq=analysis-08&orientation=squarish",
  9: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20woman%20portrait%20in%20logistics%20warehouse%20attire%2C%20warm%20studio%20lighting%2C%20clean%20background%2C%20supply%20chain%20professional%20photography%2C%20confident%20expression&width=120&height=120&seq=analysis-09&orientation=squarish",
  10: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20modern%20office%2C%20warm%20lighting%2C%20financial%20trading%20professional%2C%20serious%20expression%2C%20corporate%20portrait%20photography&width=120&height=120&seq=analysis-10&orientation=squarish",
  11: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20woman%20portrait%20in%20business%20hijab%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20market%20analyst%20photography%2C%20friendly%20professional%20expression&width=120&height=120&seq=analysis-11&orientation=squarish",
  12: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20laboratory%20coat%2C%20warm%20studio%20lighting%2C%20clean%20background%2C%20agricultural%20scientist%20photography%2C%20focused%20expression&width=120&height=120&seq=analysis-12&orientation=squarish",
  13: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20woman%20portrait%20in%20creative%20office%2C%20warm%20studio%20lighting%2C%20branding%20consultant%20photography%2C%20modern%20business%20style%2C%20confident%20smile&width=120&height=120&seq=analysis-13&orientation=squarish",
  14: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20research%20institute%2C%20warm%20lighting%2C%20plant%20scientist%20photography%2C%20intellectual%20expression%2C%20academic%20professional&width=120&height=120&seq=analysis-14&orientation=squarish",
  15: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20woman%20portrait%20in%20modern%20tech%20office%2C%20warm%20studio%20lighting%2C%20e-commerce%20specialist%20photography%2C%20friendly%20professional%20expression&width=120&height=120&seq=analysis-15&orientation=squarish",
  16: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20formal%20suit%2C%20warm%20studio%20lighting%2C%20risk%20analyst%20photography%2C%20authoritative%20expression%2C%20corporate%20professional%20style&width=120&height=120&seq=analysis-16&orientation=squarish",
  17: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20woman%20portrait%20in%20food%20processing%20facility%2C%20warm%20lighting%2C%20food%20technologist%20photography%2C%20clean%20professional%20style%2C%20focused%20expression&width=120&height=120&seq=analysis-17&orientation=squarish",
  18: "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20university%20setting%2C%20warm%20studio%20lighting%2C%20economics%20professor%20photography%2C%20academic%20professional%2C%20intellectual%20expression&width=120&height=120&seq=analysis-18&orientation=squarish",
};

export default function AnalysisPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [databaseArticles, setDatabaseArticles] = useState<ArticleRecord[]>([]);
  const currentPage = Number(searchParams.get("page")) || 1;
  const activeCategory = searchParams.get("category") || "all";

  useEffect(() => {
    document.title = "تحلیل بازار پسته | تحلیل‌های کارشناسی و پیش‌بینی قیمت | PesteOnline";

    let active = true;
    void getPublishedArticles(["analysis"])
      .then((rows) => {
        if (active) setDatabaseArticles(rows);
      })
      .catch((error) => console.error("Loading published analyses failed", error));

    return () => {
      active = false;
    };
  }, []);

  const displayArticles = useMemo<DisplayAnalysisArticle[]>(() => {
    const liveArticles = databaseArticles.map((article) => ({
      id: `db-${article.id}`,
      analyst: "تحریریه PesteOnline",
      title: article.title,
      content: article.excerpt || article.content || "",
      date: formatPersianDate(article.published_at ?? article.created_at),
      category: "تحلیل قیمت",
      slug: article.slug,
      relatedTypes: [],
      coverImage: article.cover_image,
    }));

    const builtInArticles = allAnalysisArticles.map((article) => ({
      ...article,
      id: `mock-${article.id}`,
      coverImage: analystImages[article.id] || analystImages[1],
    }));

    return [...liveArticles, ...builtInArticles];
  }, [databaseArticles]);

  const filteredArticles = useMemo(() => {
    if (activeCategory === "all") return displayArticles;
    return displayArticles.filter((a) => a.category === activeCategory);
  }, [activeCategory, displayArticles]);

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const safePage = Math.min(Math.max(currentPage, 1), totalPages || 1);
  const paginatedArticles = filteredArticles.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const handleCategoryChange = (cat: string) => {
    setSearchParams(cat !== "all" ? { category: cat } : {});
  };

  const handlePageChange = (page: number) => {
    const params: Record<string, string> = {};
    if (page > 1) params.page = String(page);
    if (activeCategory !== "all") params.category = activeCategory;
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const breadcrumbLd = generateBreadcrumbJsonLd([{ name: "صفحه اصلی", item: "/" }, { name: "تحلیل‌های کارشناسی بازار پسته" }]);
  const collectionLd = generateCollectionPageJsonLd(
    "تحلیل‌های کارشناسی بازار پسته | PesteOnline",
    "آرشیو کامل تحلیل‌های کارشناسی بازار پسته ایران - تحلیل قیمت، پیش‌بینی بازار، صادرات و اقتصاد کشاورزی پسته. نظرات خبرگان صنعت پسته ایران.",
    "/analysis"
  );

  const relatedLinks = [
    { text: "قیمت روز پسته ایران", href: "/#prices", title: "قیمت لحظه‌ای انواع پسته ایران" },
    { text: "اخبار بازار پسته", href: "/news", title: "آخرین اخبار بازار پسته" },
    { text: "قیمت پسته اکبری", href: "/akbari", title: "قیمت روز پسته اکبری" },
    { text: "قیمت پسته احمد آقایی", href: "/ahmad-aghaei", title: "قیمت روز پسته احمد آقایی" },
    { text: "قیمت مغز پسته", href: "/kernel", title: "قیمت روز مغز پسته" },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataScript(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataScript(collectionLd) }} />

      <main className="min-h-screen bg-background-50">
        <BreadcrumbNav items={[{ label: "صفحه اصلی", href: "/" }, { label: "تحلیل‌های کارشناسی" }]} />

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
                {displayArticles.length} تحلیل کارشناسی
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="w-full py-10 md:py-14 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 flex-wrap mb-8 overflow-x-auto pb-2">
              {analysisCategories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryChange(cat.key)}
                  className={`rounded-full px-4 py-1.5 text-xs md:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    activeCategory === cat.key
                      ? "bg-accent-500 text-foreground-950"
                      : "bg-white text-foreground-600 hover:bg-background-100 border border-background-200/60"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {paginatedArticles.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-foreground-400 text-sm">تحلیلی در این دسته‌بندی یافت نشد.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {paginatedArticles.map((article, idx) => (
                  <ScrollReveal key={article.id} delay={idx * 70} direction="up">
                    <article className="bg-white rounded-xl p-5 md:p-6 border border-background-200/70 h-full flex flex-col" aria-label={`تحلیل ${article.analyst} - ${article.title}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-background-200">
                          <img
                            src={article.coverImage || analystImages[1]}
                            alt={article.analyst}
                            title={`${article.analyst} - ${article.title}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-foreground-950 truncate">{article.analyst}</div>
                          <div className="text-xs text-foreground-400 line-clamp-2">
                            <a href={`/articles/${article.slug}`} className="hover:text-accent-700">{article.title}</a>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-foreground-300">{article.date}</span>
                            <span className="text-xs bg-accent-50 text-accent-600 rounded-full px-2 py-0.5 font-medium">{article.category}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-foreground-600 leading-[1.9] font-light flex-1">{article.content}</p>
                      <a
                        href={`/articles/${article.slug}`}
                        className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-accent-700 hover:text-accent-800"
                      >
                        مطالعه کامل تحلیل
                        <i className="ri-arrow-left-line" />
                      </a>
                      {article.relatedTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-background-100">
                          {article.relatedTypes.map((typeKey) => {
                            const typeData = pistachioTypes[typeKey as keyof typeof pistachioTypes];
                            if (!typeData) return null;
                            return (
                              <a
                                key={typeKey}
                                href={`/${typeData.slug}`}
                                className="text-xs text-accent-600 hover:text-accent-700 font-medium cursor-pointer whitespace-nowrap"
                              >
                                {typeData.name}
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </article>
                  </ScrollReveal>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <ScrollReveal delay={300}>
                <nav aria-label="صفحه‌بندی" className="mt-10 md:mt-14 flex justify-center">
                  <div className="flex items-center gap-1.5 bg-white rounded-full border border-background-200/70 p-1">
                    <button
                      onClick={() => handlePageChange(safePage - 1)}
                      disabled={safePage <= 1}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-foreground-400 hover:text-accent-600 hover:bg-accent-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                      aria-label="صفحه قبل"
                    >
                      <i className="ri-arrow-right-s-line w-5 h-5 flex items-center justify-center"></i>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-9 h-9 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                          safePage === p ? "bg-accent-500 text-foreground-950" : "text-foreground-500 hover:bg-accent-50 hover:text-accent-600"
                        }`}
                        aria-label={`صفحه ${p}`}
                        aria-current={safePage === p ? "page" : undefined}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(safePage + 1)}
                      disabled={safePage >= totalPages}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-foreground-400 hover:text-accent-600 hover:bg-accent-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                      aria-label="صفحه بعد"
                    >
                      <i className="ri-arrow-left-s-line w-5 h-5 flex items-center justify-center"></i>
                    </button>
                  </div>
                </nav>
              </ScrollReveal>
            )}

            <ScrollReveal delay={400}>
              <RelatedContentLinks links={relatedLinks} variant="light" />
            </ScrollReveal>
          </div>
        </section>
      </main>
    </>
  );
}