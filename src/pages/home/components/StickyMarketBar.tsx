import { useState, useEffect } from "react";

export default function StickyMarketBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      aria-label="ناوبری اصلی"
      className={`fixed top-0 start-0 end-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          : "bg-white/90"
      }`}
    >
      <div className="flex items-center justify-center h-14 px-4 md:px-6 max-w-full">
        <div className="flex items-center gap-2">
          <span className="text-lg md:text-xl font-black text-foreground-950 tracking-tighter">
            Peste<span className="text-primary-600">Online</span>
          </span>
          <span className="hidden sm:block w-px h-5 bg-foreground-200"></span>
          <span className="text-xs md:text-sm text-foreground-700 font-semibold whitespace-nowrap">
            مرجع تخصصی قیمت پسته
          </span>
        </div>
      </div>
    </nav>
  );
}