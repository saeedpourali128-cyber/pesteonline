export default function HeroSection() {
  return (
    <section className="relative w-full pt-14 min-h-[480px] md:min-h-[640px] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://readdy.ai/api/search-image?query=Abstract%20flowing%20green%20waves%20on%20a%20dark%20background%20forming%20elegant%20financial%20market%20chart%20patterns%2C%20smooth%20organic%20curves%20overlapping%20in%20layers%20of%20emerald%20green%20and%20dark%20teal%20tones%20with%20subtle%20golden%20highlights%20tracing%20the%20wave%20crests%2C%20minimalist%20gradient%20style%20reminiscent%20of%20audio%20equalizer%20bars%20and%20stock%20market%20candlestick%20silhouettes%2C%20soft%20glowing%20light%20emanating%20from%20behind%20the%20waves%20creating%20depth%20and%20dimension%2C%20dark%20sophisticated%20atmosphere%20with%20rich%20emerald%20greens%2C%20clean%20modern%20aesthetic%2C%20no%20text%2C%20premium%20editorial%20quality&width=1600&height=800&seq=hero-green-waves-v1&orientation=landscape"
          alt="پس‌زمینه بازار پسته - قیمت روز و تحلیل بازار"
          title="PesteOnline مرجع قیمت لحظه‌ای پسته ایران"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/45"></div>
      </div>

      <header className="relative z-10 w-full px-4 md:px-6 py-12 md:py-16">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[1.08] tracking-tight mb-4 md:mb-6">
            <strong>قیمت روز</strong>
            <br />
            <strong>پسته ایران</strong>
          </h1>
          <p className="text-lg md:text-xl text-white/80 font-light leading-relaxed max-w-xl">
            مرجع <strong>قیمت لحظه‌ای پسته</strong> و <strong>تحلیل بازار پسته</strong>
          </p>
          <div className="flex items-center gap-3 mt-8 md:mt-10">
            <a href="#prices" className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-5 py-2.5 text-white text-base cursor-pointer whitespace-nowrap">
              <i className="ri-line-chart-line w-5 h-5 flex items-center justify-center"></i>
              <span>مشاهده قیمت‌ها</span>
            </a>
            <a href="#charts" className="flex items-center gap-2 bg-accent-500/90 text-foreground-950 rounded-full px-5 py-2.5 text-base font-semibold cursor-pointer whitespace-nowrap">
              <i className="ri-calendar-line w-5 h-5 flex items-center justify-center"></i>
              <span>تاریخچه قیمت</span>
            </a>
          </div>
        </div>
      </header>
    </section>
  );
}