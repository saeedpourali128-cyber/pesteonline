import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import BreadcrumbNav from "@/components/feature/BreadcrumbNav";
import RelatedContentLinks from "@/components/feature/RelatedContentLinks";
import {
  generateBreadcrumbJsonLd, generateCollectionPageJsonLd, structuredDataScript,
} from "@/components/feature/StructuredData";
import { allNewsArticles, newsCategories } from "@/mocks/newsArticles";
import { pistachioTypes } from "@/mocks/pistachioTypeData";
import ScrollReveal from "@/components/base/ScrollReveal";
import { formatPersianDate, getPublishedArticles, type ArticleRecord } from "@/lib/articles";

const ITEMS_PER_PAGE = 9;

interface DisplayNewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  date: string;
  source: string;
  slug: string;
  relatedTypes: string[];
  coverImage?: string | null;
}


const newsImages: Record<number, string> = {
  1: "https://readdy.ai/api/search-image?query=Premium%20Akbari%20pistachios%20arranged%20on%20a%20market%20stall%2C%20rich%20green%20kernels%20visible%20through%20split%20shells%2C%20vibrant%20bazaar%20atmosphere%20with%20warm%20golden%20lighting%2C%20Persian%20marketplace%20photography%2C%20detailed%20close-up%20of%20luxury%20nuts%2C%20editorial%20food%20journalism%20style%2C%20warm%20amber%20and%20green%20tones&width=600&height=400&seq=news-img-01&orientation=landscape",
  2: "https://readdy.ai/api/search-image?query=Iranian%20pistachios%20in%20export%20packaging%20on%20shipping%20pallets%2C%20industrial%20warehouse%20setting%20with%20natural%20light%2C%20stacks%20of%20export-grade%20nut%20packages%20with%20Persian%20labels%2C%20international%20trade%20photography%20style%2C%20professional%20logistics%20environment%2C%20clean%20industrial%20aesthetic&width=600&height=400&seq=news-img-02&orientation=landscape",
  3: "https://readdy.ai/api/search-image?query=Vast%20Iranian%20pistachio%20orchard%20in%20Kerman%20province%20at%20golden%20hour%2C%20rows%20of%20mature%20pistachio%20trees%20with%20clusters%20of%20ripening%20nuts%2C%20majestic%20agricultural%20landscape%20with%20distant%20mountains%2C%20warm%20desert%20tones%2C%20documentary%20agricultural%20photography%2C%20rich%20earthy%20colors&width=600&height=400&seq=news-img-03&orientation=landscape",
  4: "https://readdy.ai/api/search-image?query=Financial%20trading%20desk%20with%20Iranian%20currency%20notes%20and%20a%20bowl%20of%20premium%20pistachios%20side%20by%20side%2C%20business%20newspaper%20in%20Persian%2C%20warm%20office%20lighting%2C%20economic%20analysis%20concept%20photography%2C%20professional%20editorial%20style%2C%20rich%20amber%20tones%20with%20green%20accents&width=600&height=400&seq=news-img-04&orientation=landscape",
  5: "https://readdy.ai/api/search-image?query=Vibrant%20green%20pistachio%20kernels%20in%20a%20premium%20glass%20jar%20on%20a%20luxury%20confectionery%20counter%2C%20European%20chocolate%20factory%20setting%2C%20high-end%20food%20photography%20with%20soft%20diffused%20lighting%2C%20professional%20commercial%20product%20photography%2C%20rich%20emerald%20greens%20and%20warm%20cream%20tones&width=600&height=400&seq=news-img-05&orientation=landscape",
  6: "https://readdy.ai/api/search-image?query=Jumbo%20Kaleh%20Ghouchi%20pistachios%20displayed%20on%20luxury%20dark%20marble%2C%20dramatic%20spotlight%20effect%20on%20the%20largest%20Iranian%20pistachio%20variety%2C%20high-end%20food%20product%20photography%2C%20premium%20nuts%20retail%20display%2C%20sophisticated%20gold%20and%20cream%20palette%20with%20deep%20shadows&width=600&height=400&seq=news-img-06&orientation=landscape",
  7: "https://readdy.ai/api/search-image?query=Indian%20spice%20market%20with%20sacks%20of%20Iranian%20pistachios%20prominently%20displayed%2C%20vibrant%20colorful%20bazaar%20atmosphere%2C%20traditional%20Indian%20trading%20scene%20with%20Persian%20nuts%2C%20cultural%20commerce%20photography%2C%20rich%20warm%20colors%20and%20textures%2C%20bustling%20marketplace%20energy&width=600&height=400&seq=news-img-07&orientation=landscape",
  8: "https://readdy.ai/api/search-image?query=Modern%20pistachio%20processing%20facility%20interior%20with%20laser%20sorting%20machines%2C%20industrial%20food%20processing%20technology%2C%20clean%20sterile%20environment%20with%20conveyor%20belts%20of%20green%20pistachios%2C%20high-tech%20agricultural%20industry%20photography%2C%20sleek%20metallic%20surfaces%20with%20warm%20nut%20tones&width=600&height=400&seq=news-img-08&orientation=landscape",
  9: "https://readdy.ai/api/search-image?query=Bulk%20Fandoghi%20pistachios%20being%20weighed%20on%20traditional%20market%20scales%2C%20bustling%20Iranian%20nut%20bazaar%20with%20sacks%20of%20nuts%2C%20authentic%20trading%20scene%20with%20merchants%20and%20customers%2C%20warm%20ambient%20lighting%2C%20documentary%20style%20Persian%20marketplace%20photography&width=600&height=400&seq=news-img-09&orientation=landscape",
  10: "https://readdy.ai/api/search-image?query=Chinese%20wholesale%20market%20with%20Iranian%20pistachio%20imports%20on%20display%2C%20modern%20Asian%20trading%20floor%20with%20nut%20samples%2C%20international%20trade%20scene%20with%20Persian%20products%2C%20global%20commerce%20photography%2C%20clean%20contemporary%20aesthetic%20with%20warm%20nut%20tones&width=600&height=400&seq=news-img-10&orientation=landscape",
};

export default function NewsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [databaseArticles, setDatabaseArticles] = useState<ArticleRecord[]>([]);
  const currentPage = Number(searchParams.get("page")) || 1;
  const activeCategory = searchParams.get("category") || "all";

  useEffect(() => {
    document.title = "اخبار بازار پسته | آخرین اخبار قیمت، صادرات و تولید پسته ایران | PesteOnline";

    let active = true;
    void getPublishedArticles(["news", "article"])
      .then((rows) => {
        if (active) setDatabaseArticles(rows);
      })
      .catch((error) => console.error("Loading published news failed", error));

    return () => {
      active = false;
    };
  }, []);

  const displayArticles = useMemo<DisplayNewsArticle[]>(() => {
    const liveArticles = databaseArticles.map((article) => ({
      id: `db-${article.id}`,
      title: article.title,
      summary: article.excerpt ?? "",
      content: article.content ?? "",
      category: article.content_type === "article" ? "صنعت" : "بازار داخلی",
      date: formatPersianDate(article.published_at ?? article.created_at),
      source: "تحریریه PesteOnline",
      slug: article.slug,
      relatedTypes: [],
      coverImage: article.cover_image,
    }));

    const builtInArticles = allNewsArticles.map((article) => ({
      ...article,
      id: `mock-${article.id}`,
      coverImage: newsImages[article.id] || newsImages[1],
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

  const breadcrumbLd = generateBreadcrumbJsonLd([{ name: "صفحه اصلی", item: "/" }, { name: "اخبار بازار پسته" }]);
  const collectionLd = generateCollectionPageJsonLd(
    "اخبار بازار پسته | PesteOnline",
    "آرشیو کامل اخبار بازار پسته ایران - آخرین اخبار قیمت، صادرات، تولید و تحلیل بازار پسته. مرجع خبری تخصصی صنعت پسته ایران.",
    "/news"
  );

  const relatedLinks = [
    { text: "قیمت روز پسته ایران", href: "/#prices", title: "قیمت لحظه‌ای انواع پسته ایران" },
    { text: "تحلیل کارشناسی بازار پسته", href: "/analysis", title: "تحلیل‌های کارشناسی بازار پسته" },
    { text: "قیمت پسته اکبری", href: "/akbari", title: "قیمت روز پسته اکبری" },
    { text: "قیمت پسته کله قوچی", href: "/kaleh-ghouchi", title: "قیمت روز پسته کله قوچی" },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataScript(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataScript(collectionLd) }} />

      <main className="min-h-screen bg-background-50">
        <BreadcrumbNav items={[{ label: "صفحه اصلی", href: "/" }, { label: "اخبار" }]} />

        <section className="w-full bg-white border-b border-background-200/60 py-10 md:py-16 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <span className="inline-block bg-accent-100 text-accent-700 text-xs font-medium rounded-full px-3 py-1 mb-3">
                مرکز اخبار
              </span>
              <h1 className="text-2xl md:text-5xl font-black text-foreground-950 leading-[1.15] mb-3">
                <strong>اخبار بازار پسته</strong>
              </h1>
              <p className="text-sm md:text-base text-foreground-500 font-light max-w-xl leading-relaxed">
                آخرین اخبار <strong>قیمت پسته</strong>، <strong>صادرات</strong>، <strong>تولید</strong> و <strong>تحلیل بازار پسته ایران</strong> — پوشش جامع و به‌روز صنعت پسته
              </p>
            </ScrollReveal>
          </div>
        </section>

        <section className="w-full py-10 md:py-14 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 flex-wrap mb-8 overflow-x-auto pb-2">
              {newsCategories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryChange(cat.key)}
                  className={`rounded-full px-4 py-1.5 text-xs md:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    activeCategory === cat.key
                      ? "bg-primary-500 text-white"
                      : "bg-white text-foreground-600 hover:bg-background-100 border border-background-200/60"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* News Grid */}
            {paginatedArticles.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-foreground-400 text-sm">مقاله‌ای در این دسته‌بندی یافت نشد.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {paginatedArticles.map((article, idx) => (
                  <ScrollReveal key={article.id} delay={idx * 60} direction="up">
                    <article className="bg-white rounded-xl border border-background-200/70 overflow-hidden h-full flex flex-col group cursor-pointer">
                      <div className="relative h-48 overflow-hidden">
                        <a href={`/articles/${article.slug}`} aria-label={article.title}>
                          <img
                            src={article.coverImage || newsImages[1]}
                            alt={article.title}
                            title={article.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        </a>
                        <div className="absolute top-3 right-3">
                          <span className="text-xs bg-white/90 backdrop-blur-sm text-foreground-700 rounded-full px-2.5 py-1 font-medium">
                            {article.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 md:p-5 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-foreground-400">{article.date}</span>
                          <span className="text-xs text-foreground-300">{article.source}</span>
                        </div>
                        <h3 className="text-sm md:text-base font-bold text-foreground-950 mb-2 leading-[1.5] group-hover:text-primary-600 transition-colors">
                          <a href={`/articles/${article.slug}`}>{article.title}</a>
                        </h3>
                        <p className="text-xs md:text-sm text-foreground-500 leading-[1.9] font-light flex-1">
                          {article.summary}
                        </p>
                        {article.relatedTypes.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-background-100">
                            {article.relatedTypes.map((typeKey) => {
                              const typeData = pistachioTypes[typeKey as keyof typeof pistachioTypes];
                              if (!typeData) return null;
                              return (
                                <a
                                  key={typeKey}
                                  href={`/${typeData.slug}`}
                                  className="text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer whitespace-nowrap"
                                >
                                  {typeData.name}
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </article>
                  </ScrollReveal>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <ScrollReveal delay={300}>
                <nav aria-label="صفحه‌بندی" className="mt-10 md:mt-14 flex justify-center">
                  <div className="flex items-center gap-1.5 bg-white rounded-full border border-background-200/70 p-1">
                    <button
                      onClick={() => handlePageChange(safePage - 1)}
                      disabled={safePage <= 1}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-foreground-400 hover:text-primary-600 hover:bg-primary-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                      aria-label="صفحه قبل"
                    >
                      <i className="ri-arrow-right-s-line w-5 h-5 flex items-center justify-center"></i>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-9 h-9 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                          safePage === p ? "bg-primary-500 text-white" : "text-foreground-500 hover:bg-primary-50 hover:text-primary-600"
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
                      className="w-9 h-9 rounded-full flex items-center justify-center text-foreground-400 hover:text-primary-600 hover:bg-primary-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
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