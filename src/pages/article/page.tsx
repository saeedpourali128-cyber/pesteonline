import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import BreadcrumbNav from "@/components/feature/BreadcrumbNav";
import RelatedContentLinks from "@/components/feature/RelatedContentLinks";
import {
  generateArticleJsonLd,
  generateBreadcrumbJsonLd,
  structuredDataScript,
} from "@/components/feature/StructuredData";
import ScrollReveal from "@/components/base/ScrollReveal";
import { allNewsArticles } from "@/mocks/newsArticles";
import { allAnalysisArticles } from "@/mocks/analysisArticles";
import {
  articleTypeLabel,
  formatPersianDate,
  getPublishedArticleBySlug,
  type ArticleContentType,
  type ArticleRecord,
} from "@/lib/articles";

type DisplayArticle = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  contentType: ArticleContentType;
  publishedLabel: string;
  publishedIso: string | null;
  author: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  isIndexable: boolean;
};

function setMeta(name: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.name = name;
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function setCanonical(url: string) {
  let tag = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement("link");
    tag.rel = "canonical";
    document.head.appendChild(tag);
  }
  tag.href = url;
}

function databaseToDisplay(article: ArticleRecord): DisplayArticle {
  const canonical =
    article.canonical_url ||
    `${window.location.origin}/articles/${encodeURIComponent(article.slug)}`;

  return {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? "",
    content: article.content ?? "",
    coverImage: article.cover_image,
    contentType: article.content_type,
    publishedLabel: formatPersianDate(article.published_at ?? article.created_at),
    publishedIso: article.published_at ?? article.created_at,
    author: "تحریریه PesteOnline",
    metaTitle: article.meta_title || `${article.title} | PesteOnline`,
    metaDescription: article.meta_description || article.excerpt || article.title,
    canonicalUrl: canonical,
    isIndexable: article.is_indexable,
  };
}

function getBuiltInArticle(slug: string): DisplayArticle | null {
  const news = allNewsArticles.find((article) => article.slug === slug);
  if (news) {
    return {
      title: news.title,
      slug: news.slug,
      excerpt: news.summary,
      content: news.content,
      coverImage: `https://readdy.ai/api/search-image?query=${encodeURIComponent(news.imageQuery)}&width=1200&height=700&seq=article-${news.id}&orientation=landscape`,
      contentType: "news",
      publishedLabel: news.date,
      publishedIso: null,
      author: news.source,
      metaTitle: `${news.title} | PesteOnline`,
      metaDescription: news.summary,
      canonicalUrl: `${window.location.origin}/articles/${encodeURIComponent(news.slug)}`,
      isIndexable: true,
    };
  }

  const analysis = allAnalysisArticles.find((article) => article.slug === slug);
  if (analysis) {
    const headline = `${analysis.analyst}: ${analysis.title}`;
    return {
      title: headline,
      slug: analysis.slug,
      excerpt: analysis.content,
      content: analysis.content,
      coverImage: `https://readdy.ai/api/search-image?query=${encodeURIComponent(analysis.imageQuery)}&width=1200&height=700&seq=analysis-article-${analysis.id}&orientation=landscape`,
      contentType: "analysis",
      publishedLabel: analysis.date,
      publishedIso: null,
      author: analysis.analyst,
      metaTitle: `${headline} | PesteOnline`,
      metaDescription: analysis.content.slice(0, 165),
      canonicalUrl: `${window.location.origin}/articles/${encodeURIComponent(analysis.slug)}`,
      isIndexable: true,
    };
  }

  return null;
}

export default function ArticlePage() {
  const { slug = "" } = useParams();
  const [article, setArticle] = useState<DisplayArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);

    void getPublishedArticleBySlug(slug)
      .then((record) => {
        if (!active) return;
        const result = record ? databaseToDisplay(record) : getBuiltInArticle(slug);
        setArticle(result);
        setNotFound(!result);
      })
      .catch((error) => {
        console.error("Loading article failed", error);
        if (!active) return;
        const fallback = getBuiltInArticle(slug);
        setArticle(fallback);
        setNotFound(!fallback);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!article) return;
    document.title = article.metaTitle;
    setMeta("description", article.metaDescription);
    setMeta("robots", article.isIndexable ? "index,follow" : "noindex,nofollow");
    setCanonical(article.canonicalUrl);
  }, [article]);

  const paragraphs = useMemo(
    () => article?.content.split(/\n\s*\n/).filter(Boolean) ?? [],
    [article],
  );

  if (loading) {
    return (
      <main dir="rtl" className="min-h-screen grid place-items-center bg-background-50">
        <div className="text-sm text-foreground-500">در حال دریافت مقاله...</div>
      </main>
    );
  }

  if (notFound || !article) {
    return (
      <main dir="rtl" className="min-h-screen grid place-items-center bg-background-50 px-4">
        <div className="max-w-md text-center rounded-3xl bg-white border border-background-200 p-8">
          <div className="text-5xl font-black text-primary-500">۴۰۴</div>
          <h1 className="mt-4 text-xl font-black text-foreground-950">مقاله پیدا نشد</h1>
          <p className="mt-3 text-sm text-foreground-500 leading-7">
            ممکن است این محتوا حذف شده، هنوز منتشر نشده یا آدرس آن تغییر کرده باشد.
          </p>
          <a
            href="/news"
            className="mt-6 inline-flex rounded-full bg-primary-500 px-5 py-2.5 text-sm font-bold text-white"
          >
            بازگشت به اخبار
          </a>
        </div>
      </main>
    );
  }

  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: "صفحه اصلی", item: "/" },
    {
      name: article.contentType === "analysis" ? "تحلیل بازار" : "اخبار و مقالات",
      item: article.contentType === "analysis" ? "/analysis" : "/news",
    },
    { name: article.title },
  ]);

  const articleLd = article.publishedIso
    ? generateArticleJsonLd({
        headline: article.title,
        description: article.metaDescription,
        datePublished: article.publishedIso,
        authorName: article.author,
        publisherName: "PesteOnline",
        url: article.canonicalUrl,
        imageUrl: article.coverImage ?? undefined,
        keywords: ["پسته", "بازار پسته", articleTypeLabel(article.contentType)],
      })
    : null;

  const archiveHref = article.contentType === "analysis" ? "/analysis" : "/news";
  const archiveLabel = article.contentType === "analysis" ? "تحلیل‌های بازار" : "اخبار و مقالات";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredDataScript(breadcrumbLd) }}
      />
      {articleLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredDataScript(articleLd) }}
        />
      )}

      <main dir="rtl" className="min-h-screen bg-background-50">
        <BreadcrumbNav
          items={[
            { label: "صفحه اصلی", href: "/" },
            { label: archiveLabel, href: archiveHref },
            { label: article.title },
          ]}
        />

        <article>
          <section className="bg-white border-b border-background-200/60 px-4 md:px-6 py-10 md:py-16">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-primary-100 px-3 py-1 font-bold text-primary-700">
                    {articleTypeLabel(article.contentType)}
                  </span>
                  <span className="text-foreground-400">{article.publishedLabel}</span>
                  <span className="text-foreground-300">•</span>
                  <span className="text-foreground-400">{article.author}</span>
                </div>
                <h1 className="mt-5 text-2xl md:text-5xl font-black text-foreground-950 leading-[1.35]">
                  {article.title}
                </h1>
                <p className="mt-5 text-base md:text-lg text-foreground-500 leading-9 font-light">
                  {article.excerpt}
                </p>
              </ScrollReveal>
            </div>
          </section>

          <section className="px-4 md:px-6 py-8 md:py-12">
            <div className="max-w-4xl mx-auto">
              {article.coverImage && (
                <ScrollReveal>
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full max-h-[520px] object-cover rounded-2xl md:rounded-3xl border border-background-200 bg-white"
                  />
                </ScrollReveal>
              )}

              <ScrollReveal delay={100}>
                <div className="mt-7 md:mt-10 rounded-2xl md:rounded-3xl bg-white border border-background-200/70 p-5 md:p-10 text-foreground-700 text-base md:text-lg leading-[2.15] shadow-sm">
                  {paragraphs.map((paragraph, index) => (
                    <p key={index} className="mb-6 last:mb-0 whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal delay={180}>
                <RelatedContentLinks
                  variant="light"
                  links={[
                    { text: "قیمت روز پسته", href: "/#prices", title: "قیمت روز انواع پسته" },
                    { text: "آرشیو اخبار", href: "/news", title: "آخرین اخبار بازار پسته" },
                    { text: "تحلیل‌های بازار", href: "/analysis", title: "تحلیل کارشناسی بازار پسته" },
                  ]}
                />
              </ScrollReveal>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
