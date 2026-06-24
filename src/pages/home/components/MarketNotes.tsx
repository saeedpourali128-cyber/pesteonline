import { dailyMarketNote } from "@/mocks/marketNote";
import ScrollReveal from "@/components/base/ScrollReveal";

export default function MarketNotes() {
  return (
    <section id="market-notes" className="w-full bg-background-50 py-12 md:py-16 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          <ScrollReveal direction="right" className="w-full lg:w-[40%] order-1 lg:order-2">
            <div>
              <span className="inline-block bg-secondary-100 text-secondary-700 text-xs font-medium rounded-full px-3 py-1 mb-4">
                یادداشت روزانه
              </span>
              <h2 className="text-2xl md:text-4xl font-black text-foreground-950 leading-[1.2] mb-3">
                <strong>یادداشت</strong>
                <br />
                <strong>روز بازار</strong>
              </h2>
              <p className="text-sm md:text-base text-foreground-500 font-light leading-relaxed max-w-sm">
                <strong>تحلیل روزانه بازار پسته</strong> توسط تیم کارشناسی PesteOnline - بررسی روند قیمت‌ها، عوامل تأثیرگذار و پیش‌بینی بازار
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="text-xs text-foreground-400">{dailyMarketNote.date}</span>
                <span className="w-1 h-1 rounded-full bg-foreground-300"></span>
                <span className="text-xs text-foreground-400">{dailyMarketNote.analyst}</span>
              </div>

              <div className="mt-6 pt-5 border-t border-background-200/70">
                <span className="block text-xs font-semibold text-foreground-400 mb-2.5">
                  مطالب مرتبط:
                </span>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="#prices"
                    title="جدول قیمت روز پسته ایران - قیمت لحظه‌ای و به‌روز"
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
                    href="#expert-analysis"
                    title="تحلیل‌های کارشناسی بازار پسته - نظرات خبرگان"
                    className="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
                  >
                    <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
                    <span>تحلیل کارشناسی بازار پسته</span>
                  </a>
                  <a
                    href="#faq"
                    title="سوالات متداول بازار پسته - پرسش و پاسخ تخصصی"
                    className="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap"
                  >
                    <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
                    <span>سوالات متداول پسته</span>
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="left" delay={150} className="w-full lg:w-[60%] order-2 lg:order-1">
            <article className="bg-primary-700 rounded-2xl p-5 md:p-8" aria-label="یادداشت روز بازار پسته">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/40 text-xs">تحلیل امروز</span>
                <div className="flex gap-1">
                  <span className="w-1 h-1 rounded-full bg-white/30"></span>
                  <span className="w-1 h-1 rounded-full bg-white/30"></span>
                  <span className="w-1 h-1 rounded-full bg-white/30"></span>
                </div>
              </div>
              <div className="text-white/95 text-sm md:text-base leading-[2] md:leading-[2.2] font-light whitespace-pre-line max-h-80 overflow-y-auto">
                {dailyMarketNote.content}
              </div>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-500/30 flex items-center justify-center">
                    <i className="ri-user-line w-5 h-5 flex items-center justify-center text-accent-300"></i>
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">{dailyMarketNote.analyst}</div>
                    <div className="text-white/50 text-xs">{dailyMarketNote.analystTitle}</div>
                  </div>
                </div>
                <a href="#faq" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-full px-4 py-2 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap">
                  <span>سوالات متداول</span>
                  <i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center"></i>
                </a>
              </div>
            </article>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}