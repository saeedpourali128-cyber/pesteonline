import { expertAnalyses } from "@/mocks/marketContent";
import ScrollReveal from "@/components/base/ScrollReveal";

const analystImages = [
  "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20business%20suit%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20friendly%20expression%2C%20corporate%20style&width=120&height=120&seq=analyst-01&orientation=squarish",
  "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20smart%20casual%20attire%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20confident%20expression%2C%20modern%20corporate%20style&width=120&height=120&seq=analyst-02&orientation=squarish",
  "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20woman%20portrait%20in%20business%20attire%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20confident%20smile%2C%20modern%20corporate%20style&width=120&height=120&seq=analyst-03&orientation=squarish",
  "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20formal%20attire%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20thoughtful%20expression%2C%20academic%20style&width=120&height=120&seq=analyst-04&orientation=squarish",
  "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20woman%20portrait%20in%20modern%20business%20attire%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20warm%20smile%2C%20contemporary%20style&width=120&height=120&seq=analyst-05&orientation=squarish",
  "https://readdy.ai/api/search-image?query=Professional%20middle%20eastern%20man%20portrait%20in%20business%20casual%20attire%2C%20warm%20studio%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%20photography%2C%20authoritative%20expression%2C%20executive%20style&width=120&height=120&seq=analyst-06&orientation=squarish",
];

export default function ExpertAnalysis() {
  const featured = expertAnalyses.slice(0, 6);
  const col1 = featured.slice(0, 2);
  const col2 = featured.slice(2, 4);
  const col3 = featured.slice(4, 6);

  return (
    <section id="expert-analysis" className="w-full bg-background-100/60 py-12 md:py-16 px-4 md:px-6">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {[col1, col2, col3].map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-4 md:gap-5">
              {col.map((analysis, idx) => (
                <ScrollReveal key={analysis.id} delay={colIdx * 100 + idx * 80} direction="up">
                  <article
                    className="bg-white rounded-xl p-4 md:p-5 border border-background-200/70"
                    aria-label={`تحلیل ${analysis.analyst} - ${analysis.title}`}
                    style={{
                      marginTop: (colIdx === 1 && idx === 0) || (colIdx === 2 && idx === 1) ? "1.5rem" : "0",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-background-200">
                        <img
                          src={analystImages[analysis.id - 1]}
                          alt={analysis.analyst}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-foreground-950 truncate">
                          {analysis.analyst}
                        </div>
                        <div className="text-xs text-foreground-400 truncate flex items-center gap-1">
                          <span className="text-primary-500">@</span>
                          {analysis.title}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-foreground-600 leading-[1.8] font-light relative pe-4">
                      <span className="absolute top-0 end-0 text-2xl text-primary-200 font-serif leading-none">
                        &quot;
                      </span>
                      {analysis.content}
                      <span className="text-2xl text-primary-200 font-serif leading-none ms-1">
                        &quot;
                      </span>
                    </p>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          ))}
        </div>

        <ScrollReveal delay={400}>
          <div className="mt-10 md:mt-12 pt-6 border-t border-background-200/60">
            <span className="block text-xs font-semibold text-foreground-400 mb-3 text-center">
              مطالب مرتبط:
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="#prices"
                title="جدول قیمت روز پسته ایران - قیمت لحظه‌ای انواع پسته"
                className="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
              >
                <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
                <span>قیمت لحظه‌ای پسته ایران</span>
              </a>
              <a
                href="#charts"
                title="نمودار تاریخچه قیمت پسته - تحلیل تکنیکال بازار"
                className="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
              >
                <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
                <span>تاریخچه قیمت پسته</span>
              </a>
              <a
                href="#market-notes"
                title="یادداشت روزانه بازار پسته - تحلیل و پیش‌بینی"
                className="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
              >
                <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
                <span>یادداشت روز بازار پسته</span>
              </a>
              <a
                href="#faq"
                title="سوالات متداول بازار پسته - پرسش و پاسخ تخصصی"
                className="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
              >
                <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
                <span>سوالات متداول پسته</span>
              </a>
              <a
                href="/news"
                title="آرشیو کامل اخبار بازار پسته - آخرین اخبار"
                className="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
              >
                <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
                <span>اخبار بازار پسته</span>
              </a>
              <a
                href="/akbari"
                title="قیمت روز پسته اکبری - نمودار و تحلیل"
                className="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
              >
                <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
                <span>قیمت پسته اکبری</span>
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}