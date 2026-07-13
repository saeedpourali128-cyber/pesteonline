import { marketNews } from "@/mocks/marketContent";
import ScrollReveal from "@/components/base/ScrollReveal";

const newsImages = [
  "https://readdy.ai/api/search-image?query=Iranian%20pistachio%20market%20with%20wooden%20bowls%20of%20fresh%20green%20pistachios%20on%20a%20modern%20wooden%20table%2C%20warm%20natural%20lighting%20from%20window%2C%20minimalist%20composition%2C%20professional%20product%20photography%20style%2C%20clean%20background%20with%20subtle%20green%20and%20brown%20tones%2C%20editorial%20quality&width=600&height=400&seq=news-pistachio-01&orientation=landscape",
  "https://readdy.ai/api/search-image?query=Export%20cargo%20containers%20with%20agricultural%20products%20at%20port%2C%20industrial%20shipping%20scene%20with%20warm%20sunset%20light%2C%20professional%20logistics%20photography%2C%20clean%20and%20modern%20aesthetic%2C%20golden%20hour%20lighting%20on%20containers%20and%20cranes%2C%20atmospheric%20and%20professional&width=600&height=400&seq=news-pistachio-02&orientation=landscape",
  "https://readdy.ai/api/search-image?query=Pistachio%20orchard%20in%20Iran%20with%20trees%20in%20rows%2C%20golden%20sunlight%20through%20leaves%2C%20agricultural%20landscape%20photography%2C%20fresh%20green%20pistachio%20clusters%20on%20branches%2C%20natural%20and%20organic%20atmosphere%2C%20professional%20farm%20photography&width=600&height=400&seq=news-pistachio-03&orientation=landscape",
  "https://readdy.ai/api/search-image?query=Financial%20market%20trading%20screen%20with%20green%20charts%20and%20numbers%2C%20modern%20office%20desk%20with%20laptop%20and%20coffee%2C%20warm%20ambient%20lighting%2C%20professional%20trading%20environment%2C%20clean%20aesthetic%20with%20green%20accent%20colors%2C%20editorial%20quality&width=600&height=400&seq=news-pistachio-04&orientation=landscape",
];

export default function LatestNews() {
  return (
    <section id="latest-news" className="w-full bg-background-50 py-10 md:py-14 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-xl md:text-3xl font-black text-foreground-950">
              <strong>آخرین اخبار</strong>
            </h2>
            <span className="text-xs md:text-sm text-foreground-400 font-light">
              تحولات لحظه‌ای بازار پسته
            </span>
            <a
              href="/news"
              className="inline-flex items-center gap-2 bg-foreground-900 hover:bg-foreground-800 text-white text-sm font-semibold rounded-full px-5 py-2.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
            >
              <span>مشاهده همه اخبار</span>
              <i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center"></i>
            </a>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {marketNews.map((news, idx) => (
            <ScrollReveal key={news.id} delay={idx * 100} direction="up">
              <article className="group relative rounded-xl overflow-hidden h-64 md:h-72">
                <a
                  href="/news"
                  className="absolute inset-0 cursor-pointer block"
                  aria-label={news.title}
                ></a>
                <img
  src={article.image}
  alt={article.title}
  loading="lazy"
  decoding="async"
  width={600}
  height={400}
  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
                <div className="absolute top-3 right-3">
                  <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full px-2.5 py-0.5">
                    {news.category}
                  </span>
                </div>
                <div className="absolute bottom-0 start-0 end-0 p-4">
                  <h3 className="text-white text-sm md:text-base font-bold leading-snug mb-1.5 line-clamp-2">
                    <strong>{news.title}</strong>
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-xs">{news.date}</span>
                    <span className="w-1 h-1 rounded-full bg-white/30"></span>
                    <span className="text-white/60 text-xs">{news.source}</span>
                  </div>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>

        {/* Related Content Links */}
        <ScrollReveal delay={400}>
          <div className="mt-8 md:mt-10 pt-5 border-t border-background-200/60">
            <span className="block text-xs font-semibold text-foreground-400 mb-3">
              مطالب مرتبط:
            </span>
            <div className="flex flex-wrap gap-2">
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
                title="نمودار تاریخچه قیمت پسته - تحلیل تکنیکال و روند بازار"
                className="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
              >
                <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
                <span>تاریخچه قیمت پسته</span>
              </a>
              <a
                href="/analysis"
                title="تحلیل‌های کارشناسی بازار پسته - نظرات خبرگان"
                className="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
              >
                <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
                <span>تحلیل کارشناسی بازار پسته</span>
              </a>
              <a
                href="/news"
                title="آرشیو کامل اخبار بازار پسته - آخرین اخبار و تحلیل"
                className="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
              >
                <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
                <span>آرشیو اخبار بازار پسته</span>
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}