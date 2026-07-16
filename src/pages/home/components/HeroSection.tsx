import { useSiteDesign } from "@/lib/site-design";

const alignClasses = {
  right: "items-start text-right",
  center: "items-center text-center",
  left: "items-end text-left",
} as const;

const contentPositionClasses = {
  right: "mr-0 ml-auto",
  center: "mx-auto",
  left: "ml-0 mr-auto",
} as const;

export default function HeroSection() {
  const { design } = useSiteDesign();
  const { hero } = design;
  const titleLines = hero.title.split("\n").filter(Boolean);
  const isCompact = design.template === "compact";
  const isEditorial = design.template === "editorial";
  const isPremium = design.template === "premium";

  return (
    <section
      className={`site-hero relative w-full pt-14 flex items-center overflow-hidden ${
        isEditorial ? "bg-background-100" : ""
      }`}
      style={{ minHeight: `${isCompact ? Math.min(hero.minHeight, 520) : hero.minHeight}px` }}
    >
      <div className="absolute inset-0">
        <img
          src={hero.imageUrl}
          alt="بنر اصلی پسته آنلاین"
          title="PesteOnline مرجع قیمت لحظه‌ای پسته ایران"
          className="w-full h-full object-cover"
          style={{ objectPosition: hero.position }}
        />
        <div
          className={`absolute inset-0 ${
            isPremium
              ? "bg-gradient-to-br from-black/80 via-black/30 to-primary-900/70"
              : isEditorial
                ? "bg-gradient-to-l from-black/75 via-black/25 to-transparent"
                : "bg-gradient-to-b from-black/35 via-black/20 to-black/50"
          }`}
          style={{ opacity: Math.max(0.15, hero.overlay / 100) }}
        />
      </div>

      <header className="relative z-10 w-full px-4 md:px-8 py-12 md:py-16">
        <div
          className={`flex flex-col ${alignClasses[hero.alignment]} ${
            contentPositionClasses[hero.alignment]
          } max-w-7xl`}
        >
          <div
            className={`max-w-3xl ${
              isPremium
                ? "rounded-[var(--site-radius)] border border-white/15 bg-black/20 p-7 md:p-10 backdrop-blur-md shadow-2xl"
                : isEditorial
                  ? "rounded-[var(--site-radius)] bg-white/10 p-6 md:p-9 backdrop-blur-sm"
                  : ""
            }`}
          >
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[1.08] tracking-tight mb-4 md:mb-6">
              {titleLines.map((line, index) => (
                <span key={`${line}-${index}`} className="block">
                  {line}
                </span>
              ))}
            </h1>

            <p className="text-lg md:text-xl text-white/85 font-light leading-relaxed max-w-2xl">
              {hero.subtitle}
            </p>

            <div
              className={`flex flex-wrap items-center gap-3 mt-8 md:mt-10 ${
                hero.alignment === "center"
                  ? "justify-center"
                  : hero.alignment === "left"
                    ? "justify-end"
                    : "justify-start"
              }`}
            >
              {hero.secondaryButtonText && (
                <a
                  href={hero.secondaryButtonLink || "#prices"}
                  className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-full px-5 py-2.5 text-white text-base cursor-pointer whitespace-nowrap transition-colors"
                >
                  <i className="ri-line-chart-line w-5 h-5 flex items-center justify-center" />
                  <span>{hero.secondaryButtonText}</span>
                </a>
              )}

              {hero.primaryButtonText && (
                <a
                  href={hero.primaryButtonLink || "#charts"}
                  className="flex items-center gap-2 bg-accent-500 hover:bg-accent-400 text-foreground-950 rounded-full px-5 py-2.5 text-base font-semibold cursor-pointer whitespace-nowrap transition-colors shadow-lg"
                >
                  <i className="ri-calendar-line w-5 h-5 flex items-center justify-center" />
                  <span>{hero.primaryButtonText}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>
    </section>
  );
}
