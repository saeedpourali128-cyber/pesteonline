import { useState } from "react";
import { faqItems, type FAQRelatedLink } from "@/mocks/faqData";
import ScrollReveal from "@/components/base/ScrollReveal";

function buildAnswerText(answer: string, relatedLinks: FAQRelatedLink[]): string {
  if (!relatedLinks || relatedLinks.length === 0) return answer;

  const linksText = relatedLinks
    .map((link) => `• ${link.text}: ${link.href}`)
    .join("\n");

  return `${answer}\n\n\u0645\u0637\u0627\u0644\u0628 \u0645\u0631\u062a\u0628\u0637:\n${linksText}`;
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqItems.map((item) => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": buildAnswerText(item.answer, item.relatedLinks),
    },
  })),
};

export default function FAQSection() {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section id="faq" className="w-full bg-background-50 py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-8 md:mb-12">
              <span className="inline-block bg-primary-100 text-primary-700 text-xs font-medium rounded-full px-3 py-1 mb-3">
                سوالات متداول
              </span>
              <h2 className="text-2xl md:text-4xl font-black text-foreground-950 leading-[1.2]">
                <strong>سوالات متداول</strong>
                <br />
                <strong>بازار پسته</strong>
              </h2>
              <p className="text-sm md:text-base text-foreground-500 mt-3 font-light max-w-lg mx-auto">
                پاسخ به پرتکرارترین سوالات درباره <strong>قیمت پسته</strong>، <strong>صادرات پسته</strong> و <strong>بازار پسته ایران</strong>
              </p>
            </div>
          </ScrollReveal>

          <div className="flex flex-col gap-3 md:gap-4">
            {faqItems.map((item, idx) => {
              const isOpen = openId === item.id;

              return (
                <ScrollReveal key={item.id} delay={idx * 60} direction="up">
                  <article
                    className={`bg-white border rounded-xl overflow-hidden transition-all duration-300 ${
                      isOpen
                        ? "border-primary-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
                        : "border-background-200/60 hover:border-background-300/70"
                    }`}
                  >
                    <h4>
                      <button
                        onClick={() => toggle(item.id)}
                        className="w-full flex items-center justify-between gap-4 px-5 md:px-6 py-4 md:py-5 text-right cursor-pointer transition-colors duration-200 hover:bg-background-50/50"
                        aria-expanded={isOpen}
                      >
                        <span
                          className={`text-sm md:text-base font-bold transition-colors duration-200 ${
                            isOpen ? "text-primary-700" : "text-foreground-900"
                          }`}
                        >
                          {item.question}
                        </span>
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                            isOpen
                              ? "bg-primary-500 text-white rotate-45"
                              : "bg-background-100 text-foreground-400"
                          }`}
                        >
                          <i className="ri-add-line w-4 h-4 flex items-center justify-center"></i>
                        </span>
                      </button>
                    </h4>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="px-5 md:px-6 pb-5 md:pb-6 pt-1 text-sm md:text-base text-foreground-600 leading-[2] font-light border-t border-background-100">
                        {item.answer}
                        {item.relatedLinks && item.relatedLinks.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-background-100/80">
                            <span className="block text-xs font-semibold text-foreground-400 mb-2.5">
                              مطالب مرتبط:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {item.relatedLinks.map((link, linkIdx) => (
                                <a
                                  key={linkIdx}
                                  href={link.href}
                                  title={link.title}
                                  onClick={() => toggle(item.id)}
                                  className="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
                                >
                                  <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
                                  <span>{link.text}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}