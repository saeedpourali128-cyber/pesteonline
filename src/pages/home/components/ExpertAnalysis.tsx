import { useEffect, useMemo, useState } from "react";
import ScrollReveal from "@/components/base/ScrollReveal";
import { expertAnalyses } from "@/mocks/marketContent";
import {
  formatPersianDate,
  getPublishedArticles,
  type ArticleRecord,
} from "@/lib/articles";

const analystImages = [
  "/images/home/analysts/analyst-01.webp",
  "/images/home/analysts/analyst-02.webp",
  "/images/home/analysts/analyst-03.webp",
  "/images/home/analysts/analyst-04.webp",
  "/images/home/analysts/analyst-05.webp",
  "/images/home/analysts/analyst-06.webp",
] as const;

type DisplayAnalysis = {
  id: string;
  analyst: string;
  title: string;
  content: string;
  date: string;
  slug: string | null;
  image: string;
  fallbackImage: string;
};

function resolveAnalysisImage(
  coverImage: string | null,
  fallbackImage: string,
) {
  if (!coverImage) return fallbackImage;

  try {
    const host = new URL(coverImage, window.location.origin).hostname;

    if (host === "readdy.ai" || host.endsWith(".readdy.ai")) {
      return fallbackImage;
    }
  } catch {
    return fallbackImage;
  }

  return coverImage;
}

export default function ExpertAnalysis() {
  const [databaseAnalyses, setDatabaseAnalyses] = useState<ArticleRecord[]>([]);

  useEffect(() => {
    let active = true;

    void getPublishedArticles(["analysis"])
      .then((rows) => {
        if (active) {
          setDatabaseAnalyses(rows.slice(0, 6));
        }
      })
      .catch((error) => {
        console.error("Loading homepage market analyses failed", error);
      });

    return () => {
      active = false;
    };
  }, []);

  const featured = useMemo<DisplayAnalysis[]>(() => {
    if (databaseAnalyses.length > 0) {
      return databaseAnalyses.map((analysis, index) => {
        const fallbackImage =
          analystImages[index % analystImages.length];

        return {
          id: `db-${analysis.id}`,
          analyst: "تحریریه PesteOnline",
          title: analysis.title,
          content: analysis.excerpt || analysis.content || "",
          date: formatPersianDate(
            analysis.published_at ?? analysis.created_at,
          ),
          slug: analysis.slug,
          image: resolveAnalysisImage(
            analysis.cover_image,
            fallbackImage,
          ),
          fallbackImage,
        };
      });
    }

    return expertAnalyses.slice(0, 6).map((analysis, index) => {
      const fallbackImage =
        analystImages[index % analystImages.length];

      return {
        id: `mock-${analysis.id}`,
        analyst: analysis.analyst,
        title: analysis.title,
        content: analysis.content,
        date: analysis.date,
        slug: null,
        image: fallbackImage,
        fallbackImage,
      };
    });
  }, [databaseAnalyses]);

  return (
    <section
      id="expert-analysis"
      className="w-full bg-background-100/60 px-4 py-12 md:px-6 md:py-16"
    >
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-10">
            <div>
              <span className="mb-3 inline-block rounded-full bg-accent-100 px-3 py-1 text-xs font-medium text-accent-700">
                تحلیل
              </span>
              <h2 className="text-2xl font-black leading-[1.2] text-foreground-950 md:text-4xl">
                <strong>تحلیل‌های کارشناسی</strong>
                <br />
                <strong>بازار پسته</strong>
              </h2>
            </div>

            <a
              href="/analysis"
              className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-600"
            >
              <span>مشاهده بایگانی کامل تحلیل‌ها</span>
              <i className="ri-arrow-left-line flex h-4 w-4 items-center justify-center" />
            </a>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {featured.map((analysis, index) => (
            <ScrollReveal
              key={analysis.id}
              delay={index * 70}
              direction="up"
            >
              <article
                className="flex h-full flex-col rounded-xl border border-background-200/70 bg-white p-4 md:p-5"
                aria-label={`تحلیل ${analysis.analyst} - ${analysis.title}`}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full bg-background-200">
                    <img
                      src={analysis.image}
                      alt={analysis.analyst}
                      width={120}
                      height={120}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        if (
                          event.currentTarget.src !==
                          new URL(
                            analysis.fallbackImage,
                            window.location.origin,
                          ).href
                        ) {
                          event.currentTarget.src =
                            analysis.fallbackImage;
                        }
                      }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-foreground-950">
                      {analysis.analyst}
                    </div>
                    <div className="line-clamp-1 text-xs text-foreground-400">
                      {analysis.title}
                    </div>
                    <div className="mt-0.5 text-[11px] text-foreground-300">
                      {analysis.date}
                    </div>
                  </div>
                </div>

                <p className="line-clamp-5 flex-1 text-sm font-light leading-[1.9] text-foreground-600">
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
          <div className="mt-10 border-t border-background-200/60 pt-6 md:mt-12">
            <span className="mb-3 block text-center text-xs font-semibold text-foreground-400">
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
                  className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 transition-colors duration-200 hover:bg-primary-100"
                >
                  <i className="ri-arrow-left-line flex h-3.5 w-3.5 items-center justify-center" />
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
