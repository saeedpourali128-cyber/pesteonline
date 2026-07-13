import { useEffect, useMemo, useState } from "react";
import ScrollReveal from "@/components/base/ScrollReveal";
import { expertAnalyses } from "@/mocks/marketContent";
import {
  formatPersianDate,
  getPublishedArticles,
  type ArticleRecord,
} from "@/lib/articles";

const analystImages = [
  "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20business%20suit%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20friendly%20expression%2C%20corporate%20style&width=120&height=120&seq=analyst-01&orientation=squarish",
  "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20smart%20casual%20attire%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20confident%20expression%2C%20modern%20corporate%20style&width=120&height=120&seq=analyst-02&orientation=squarish",
  "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20woman%20portrait%20in%20business%20attire%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20confident%20smile%2C%20modern%20corporate%20style&width=120&height=120&seq=analyst-03&orientation=squarish",
  "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20formal%20attire%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20thoughtful%20expression%2C%20academic%20style&width=120&height=120&seq=analyst-04&orientation=squarish",
  "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20woman%20portrait%20in%20modern%20business%20attire%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20warm%20smile%2C%20contemporary%20style&width=120&height=120&seq=analyst-05&orientation=squarish",
  "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20business%20casual%20attire%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20authoritative%20expression%2C%20executive%20style&width=120&height=120&seq=analyst-06&orientation=squarish",
];

type DisplayAnalysis = {
  id: string;
  analyst: string;
  title: string;
  content: string;
  date: string;
  slug: string | null;
  image: string;
};

export default function ExpertAnalysis() {
  const [databaseAnalyses, setDatabaseAnalyses] = useState<ArticleRecord[]>([]);

  useEffect(() => {
    let active = true;

    void getPublishedArticles(["analysis"])
      .then((rows) => {
        if (active) setDatabaseAnalyses(rows.slice(0, 6));
      })
      .catch((error) =>
        console.error("Loading homepage market analyses failed", error),
      );

    return () => {
      active = false;
    };
  }, []);

  const featured = useMemo<DisplayAnalysis[]>(() => {
    if (databaseAnalyses.length > 0) {
      return databaseAnalyses.map((analysis, index) => ({
        id: `db-${analysis.id}`,
        analyst: "تحریریه PesteOnline",
        title: analysis.title,
        content: analysis.excerpt || analysis.content || "",
        date: formatPersianDate(analysis.published_at ?? analysis.created_at),
        slug: analysis.slug,
        image: analysis.cover_image || analystImages[index % analystImages.length],
      }));
    }

    return expertAnalyses.slice(0, 6).map((analysis, index) => ({
      id: `mock-${analysis.id}`,
      analyst: analysis.analyst,
      title: analysis.title,
      content: analysis.content,
      date: analysis.date,
      slug: null,
      image: analystImages[index % analystImages.length],
    }));
  }, [databaseAnalyses]);

  return (
    <section
      id="expert-analysis"
      className="w-full bg-background-100/60 py-12 md:py-16 px-4 md:px-6"
    >
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 md:mb-10">
            <div>
              <span className="inline-block bg-accent-100 text-accent-700 text-xs font-medium rounded-full px-3 py-1 mb-3">
                تحلیل
              </span>
              <h2 className="text-2xl md:text-4xl font-black text-foreground-950 leading-[1.2]">
                <strong>تحلیل‌های کارشناسی</strong>
                <br />
                <strong>بازار پسته</strong>
              </h2>
            </div>
            <a
              href="/analysis"
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-full px-5 py-2.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
            >
              <span>مشاهده بایگانی کامل تحلیل‌ها</span>
              <i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center"></i>
            </a>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {featured.map((analysis, index) => (
            <ScrollReveal
              key={analysis.id}
              delay={index * 70}
              direction="up"
            >
              <article
                className="bg-white rounded-xl p-4 md:p-5 border border-background-200/70 h-full flex flex-col"
                aria-label={`تحلیل ${analysis.analyst} - ${analysis.title}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-background-200">
                    <img
                      src={analysis.image}
                      alt={analysis.analyst}
                      loading="lazy"
decoding="async"
width={120}
height={120}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-foreground-950 truncate">
                      {analysis.analyst}
                    </div>
                    <div className="text-xs text-foreground-400 line-clamp-1">
                      {analysis.title}
                    </div>
                    <div className="text-[11px] text-foreground-300 mt-0.5">
                      {analysis.date}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-foreground-600 leading-[1.9] font-light flex-1 line-clamp-5">
                  {analysis.content}
                </p>

                {analysis.slug && (
                  <a
                    href={`/articles/${analysis.slug}`}
                    className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700"
                  >
                    مطالعه کامل تحلیل
                    <i className="ri-arrow-left-line" />
                  </a>
                )}
              </article>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={400}>
          <div className="mt-10 md:mt-12 pt-6 border-t border-background-200/60">
            <span className="block text-xs font-semibold text-foreground-400 mb-3 text-center">
              مطالب مرتبط:
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                ["#prices", "قیمت لحظه‌ای پسته ایران"],
                ["#charts", "تاریخچه قیمت پسته"],
                ["#market-notes", "یادداشت روز بازار پسته"],
                ["/news", "اخبار بازار پسته"],
                ["/akbari", "قیمت پسته اکبری"],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
                >
                  <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
