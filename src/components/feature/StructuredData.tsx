export function generateBreadcrumbJsonLd(items: { name: string; item?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": item.name,
      ...(item.item ? { item: item.item } : {}),
    })),
  };
}

export function generateFAQJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
      },
    })),
  };
}

export function generateArticleJsonLd(article: {
  headline: string;
  description: string;
  datePublished: string;
  authorName: string;
  publisherName: string;
  url: string;
  imageUrl?: string;
  keywords?: string[];
}) {
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.headline,
    "description": article.description,
    "datePublished": article.datePublished,
    "author": {
      "@type": "Organization",
      "name": article.authorName,
    },
    "publisher": {
      "@type": "Organization",
      "name": article.publisherName,
      "url": "https://pesteonline.com",
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url,
    },
    "inLanguage": "fa",
  };

  if (article.keywords) {
    base.about = article.keywords.map((kw) => ({ "@type": "Thing", "name": kw }));
  }

  return base;
}

export function generateProductPriceJsonLd(name: string, description: string, price: number, currency: string = "IRR", url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "offers": {
      "@type": "Offer",
      "price": price.toString(),
      "priceCurrency": currency,
      "availability": "https://schema.org/InStock",
      "url": url,
      "priceValidUntil": new Date(Date.now() + 86400000).toISOString().split("T")[0],
    },
  };
}

export function generateCollectionPageJsonLd(title: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": title,
    "description": description,
    "url": url,
    "isPartOf": {
      "@type": "WebSite",
      "name": "PesteOnline - مرجع قیمت و تحلیل بازار پسته ایران",
      "url": "https://pesteonline.com",
    },
  };
}

export function structuredDataScript(json: Record<string, unknown>) {
  return JSON.stringify(json);
}