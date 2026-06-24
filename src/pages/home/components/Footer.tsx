import { useState } from "react";
import ScrollReveal from "@/components/base/ScrollReveal";

const NEWSLETTER_FORM_URL = "https://readdy.ai/api/form/d8t3jbb9b1tpbugifm60";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await fetch(NEWSLETTER_FORM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email, website_alt: "" }).toString(),
      });
      setSubmitted(true);
      setEmail("");
    } catch {
      // silently fail
    }
  };

  return (
    <footer className="w-full px-3 md:px-5 py-4 md:py-5">
      <div className="max-w-7xl mx-auto bg-foreground-900 rounded-2xl px-6 md:px-10 py-10 md:py-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <div className="text-[8rem] md:text-[12rem] font-black text-foreground-800/15 absolute bottom-0 end-0 leading-none translate-y-1/4">
            PESTE
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          <ScrollReveal delay={0}>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-white mb-4">
                Peste<span className="text-primary-400">Online</span>
              </h3>
              <p className="text-sm text-foreground-400 font-light leading-relaxed">
                مرجع قیمت لحظه‌ای پسته ایران و تحلیل بازار پسته - معتبرترین منبع اطلاعات بازار پسته کشور
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div>
              <h4 className="text-sm font-bold text-white mb-4">دسترسی سریع</h4>
              <nav className="flex flex-col gap-2.5">
                <a href="/#prices" className="text-sm text-foreground-400 hover:text-white transition-colors cursor-pointer">قیمت‌ها</a>
                <a href="/#charts" className="text-sm text-foreground-400 hover:text-white transition-colors cursor-pointer">نمودارها</a>
                <a href="/news" className="text-sm text-foreground-400 hover:text-white transition-colors cursor-pointer">اخبار</a>
                <a href="/analysis" className="text-sm text-foreground-400 hover:text-white transition-colors cursor-pointer">تحلیل‌ها</a>
                <a href="/#market-notes" className="text-sm text-foreground-400 hover:text-white transition-colors cursor-pointer">یادداشت بازار</a>
              </nav>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div>
              <h4 className="text-sm font-bold text-white mb-4">انواع پسته</h4>
              <nav className="flex flex-col gap-2.5">
                <a href="/akbari" className="text-sm text-foreground-400 hover:text-white transition-colors cursor-pointer">پسته اکبری</a>
                <a href="/kaleh-ghouchi" className="text-sm text-foreground-400 hover:text-white transition-colors cursor-pointer">پسته کله قوچی</a>
                <a href="/ahmad-aghaei" className="text-sm text-foreground-400 hover:text-white transition-colors cursor-pointer">پسته احمد آقایی</a>
                <a href="/fandoghi" className="text-sm text-foreground-400 hover:text-white transition-colors cursor-pointer">پسته فندقی</a>
                <a href="/badami" className="text-sm text-foreground-400 hover:text-white transition-colors cursor-pointer">پسته بادامی</a>
                <a href="/kernel" className="text-sm text-foreground-400 hover:text-white transition-colors cursor-pointer">مغز پسته</a>
              </nav>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div>
              <h4 className="text-sm font-bold text-white mb-4">خبرنامه</h4>
              <p className="text-xs text-foreground-400 font-light mb-3 leading-relaxed">
                از آخرین تحلیل‌ها و قیمت‌های بازار پسته مطلع شوید
              </p>
              {submitted ? (
                <div className="text-sm text-emerald-400 font-semibold">ثبت نام شما با موفقیت انجام شد!</div>
              ) : (
                <form onSubmit={handleSubmit} data-readdy-form="" className="flex items-center">
                  <input
                    type="text"
                    name="website_alt"
                    className="honeypot-field"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ایمیل خود را وارد کنید"
                    dir="ltr"
                    className="flex-1 bg-foreground-800/50 border border-foreground-700/50 rounded-s-full px-4 py-2.5 text-sm text-white placeholder:text-foreground-500 outline-none focus:border-primary-500/50 transition-colors text-left"
                  />
                  <button
                    type="submit"
                    className="bg-primary-500 hover:bg-primary-400 text-white rounded-e-full w-11 h-11 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 whitespace-nowrap"
                  >
                    <i className="ri-arrow-left-line w-5 h-5 flex items-center justify-center"></i>
                  </button>
                </form>
              )}
            </div>
          </ScrollReveal>
        </div>

        <div className="relative z-10 border-t border-foreground-800/50 mt-8 md:mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-foreground-500">
            © ۱۴۰۵ PesteOnline. تمامی حقوق محفوظ است.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-foreground-500 hover:text-foreground-300 transition-colors cursor-pointer">حریم خصوصی</a>
            <a href="#" className="text-xs text-foreground-500 hover:text-foreground-300 transition-colors cursor-pointer">شرایط استفاده</a>
          </div>
        </div>
      </div>
    </footer>
  );
}