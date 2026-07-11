import { createContext, useContext } from "react";

export type SiteTemplate =
  | "classic"
  | "editorial"
  | "premium"
  | "compact"
  | "minimal"
  | "warm";
export type SiteWidth = "full" | "wide" | "boxed";
export type SiteDensity = "comfortable" | "compact";
export type HeroAlignment = "right" | "center" | "left";
export type HeroPosition = "top" | "center" | "bottom";
export type SiteSectionId =
  | "marketBar"
  | "hero"
  | "prices"
  | "charts"
  | "marketNotes"
  | "news"
  | "analysis"
  | "faq"
  | "footer";

export type SiteSectionSetting = {
  id: SiteSectionId;
  visible: boolean;
  width: SiteWidth;
};

export type SiteDesignSettings = {
  version: 1;
  template: SiteTemplate;
  density: SiteDensity;
  cornerRadius: number;
  colors: {
    primary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  fonts: {
    body: string;
    heading: string;
    label: string;
  };
  hero: {
    imageUrl: string;
    title: string;
    subtitle: string;
    primaryButtonText: string;
    primaryButtonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
    overlay: number;
    alignment: HeroAlignment;
    position: HeroPosition;
    minHeight: number;
  };
  sections: SiteSectionSetting[];
};

export const SECTION_META: Record<
  SiteSectionId,
  { label: string; description: string }
> = {
  marketBar: {
    label: "نوار بالای سایت",
    description: "لوگو و معرفی کوتاه ثابت در بالای صفحه",
  },
  hero: {
    label: "بنر اصلی",
    description: "تصویر اصلی، تیتر و دکمه‌های شروع صفحه",
  },
  prices: {
    label: "جدول قیمت‌ها",
    description: "قیمت روز محصولات و ابزارهای دریافت خروجی",
  },
  charts: {
    label: "نمودارهای تاریخی",
    description: "نمودار روند قیمت در بازه‌های مختلف",
  },
  marketNotes: {
    label: "یادداشت روز بازار",
    description: "جمع‌بندی و نکات روزانه بازار",
  },
  news: {
    label: "آخرین اخبار",
    description: "جدیدترین خبرهای منتشرشده",
  },
  analysis: {
    label: "تحلیل کارشناسان",
    description: "آخرین تحلیل‌های بازار پسته",
  },
  faq: {
    label: "سؤالات متداول",
    description: "پاسخ به پرسش‌های پرتکرار کاربران",
  },
  footer: {
    label: "فوتر سایت",
    description: "اطلاعات پایانی، لینک‌ها و عضویت خبرنامه",
  },
};

export const FONT_OPTIONS = [
  {
    id: "vazirmatn",
    label: "وزیرمتن",
    family: "'Vazirmatn', Tahoma, system-ui, sans-serif",
  },
  {
    id: "estedad",
    label: "استعداد",
    family: "'Estedad', 'Vazirmatn', Tahoma, sans-serif",
  },
  {
    id: "noto-sans",
    label: "Noto Sans Arabic",
    family: "'Noto Sans Arabic', 'Vazirmatn', Tahoma, sans-serif",
  },
  {
    id: "noto-kufi",
    label: "Noto Kufi Arabic",
    family: "'Noto Kufi Arabic', 'Vazirmatn', Tahoma, sans-serif",
  },
  {
    id: "markazi",
    label: "مرکزی",
    family: "'Markazi Text', 'Vazirmatn', Tahoma, serif",
  },
  {
    id: "lalezar",
    label: "لاله‌زار",
    family: "'Lalezar', 'Vazirmatn', Tahoma, sans-serif",
  },
  {
    id: "tahoma",
    label: "Tahoma",
    family: "Tahoma, Arial, sans-serif",
  },
 ] as const;

export const COLOR_PRESETS: Array<{
  id: string;
  label: string;
  description: string;
  colors: SiteDesignSettings["colors"];
}> = [
  {
    id: "pistachio",
    label: "سبز پسته‌ای",
    description: "ترکیب سبز تخصصی با طلایی گرم",
    colors: {
      primary: "#087f5b",
      accent: "#d9a928",
      background: "#faf9f5",
      foreground: "#17202a",
    },
  },
  {
    id: "forest",
    label: "جنگلی لوکس",
    description: "سبز تیره، کرم و طلایی صادراتی",
    colors: {
      primary: "#14532d",
      accent: "#b88916",
      background: "#f7f4ec",
      foreground: "#171717",
    },
  },
  {
    id: "ocean",
    label: "آبی تجاری",
    description: "مناسب سایت داده‌محور و رسمی",
    colors: {
      primary: "#1d4ed8",
      accent: "#ea580c",
      background: "#f8fafc",
      foreground: "#0f172a",
    },
  },
  {
    id: "turquoise",
    label: "فیروزه‌ای بازار",
    description: "مدرن، شفاف و مناسب داشبورد قیمت",
    colors: {
      primary: "#0f766e",
      accent: "#f59e0b",
      background: "#f7faf9",
      foreground: "#102a2e",
    },
  },
  {
    id: "earth",
    label: "خاکی و طبیعی",
    description: "الهام‌گرفته از باغ پسته و خاک کویر",
    colors: {
      primary: "#6b7a40",
      accent: "#b45309",
      background: "#fffaf0",
      foreground: "#2f2a22",
    },
  },
  {
    id: "berry",
    label: "زرشکی حرفه‌ای",
    description: "رسمی و متفاوت برای محتوای تحلیلی",
    colors: {
      primary: "#9f1239",
      accent: "#d97706",
      background: "#fff7f7",
      foreground: "#29161b",
    },
  },
  {
    id: "violet",
    label: "بنفش مدرن",
    description: "ظاهر فناوری‌محور و تازه",
    colors: {
      primary: "#6d28d9",
      accent: "#0891b2",
      background: "#faf8ff",
      foreground: "#211a2d",
    },
  },
  {
    id: "monochrome",
    label: "مینیمال خنثی",
    description: "سفید، ذغالی و خاکستری با تمرکز بر محتوا",
    colors: {
      primary: "#334155",
      accent: "#d97706",
      background: "#ffffff",
      foreground: "#111827",
    },
  },
];

const DEFAULT_HERO_IMAGE =
  "https://readdy.ai/api/search-image?query=Abstract%20flowing%20green%20waves%20on%20a%20dark%20background%20forming%20elegant%20financial%20market%20chart%20patterns%2C%20smooth%20organic%20curves%20overlapping%20in%20layers%20of%20emerald%20green%20and%20dark%20teal%20tones%20with%20subtle%20golden%20highlights%20tracing%20the%20wave%20crests%2C%20minimalist%20gradient%20style%20reminiscent%20of%20audio%20equalizer%20bars%20and%20stock%20market%20candlestick%20silhouettes%2C%20soft%20glowing%20light%20emanating%20from%20behind%20the%20waves%20creating%20depth%20and%20dimension%2C%20dark%20sophisticated%20atmosphere%20with%20rich%20emerald%20greens%2C%20clean%20modern%20aesthetic%2C%20no%20text%2C%20premium%20editorial%20quality&width=1600&height=800&seq=hero-green-waves-v1&orientation=landscape";

export const DEFAULT_SITE_DESIGN: SiteDesignSettings = {
  version: 1,
  template: "classic",
  density: "comfortable",
  cornerRadius: 20,
  colors: {
    primary: "#087f5b",
    accent: "#d9a928",
    background: "#faf9f5",
    foreground: "#17202a",
  },
  fonts: {
    body: "vazirmatn",
    heading: "vazirmatn",
    label: "vazirmatn",
  },
  hero: {
    imageUrl: DEFAULT_HERO_IMAGE,
    title: "قیمت روز\nپسته ایران",
    subtitle: "مرجع قیمت لحظه‌ای پسته و تحلیل بازار پسته",
    primaryButtonText: "تاریخچه قیمت",
    primaryButtonLink: "#charts",
    secondaryButtonText: "مشاهده قیمت‌ها",
    secondaryButtonLink: "#prices",
    overlay: 42,
    alignment: "center",
    position: "top",
    minHeight: 640,
  },
  sections: [
    { id: "marketBar", visible: true, width: "full" },
    { id: "hero", visible: true, width: "full" },
    { id: "prices", visible: true, width: "full" },
    { id: "charts", visible: true, width: "full" },
    { id: "marketNotes", visible: true, width: "full" },
    { id: "news", visible: true, width: "full" },
    { id: "analysis", visible: true, width: "full" },
    { id: "faq", visible: true, width: "full" },
    { id: "footer", visible: true, width: "full" },
  ],
};

export const TEMPLATE_PRESETS: Array<{
  id: SiteTemplate;
  label: string;
  description: string;
  settings: Partial<SiteDesignSettings> & {
    colors: SiteDesignSettings["colors"];
  };
}> = [
  {
    id: "classic",
    label: "کلاسیک سبز",
    description: "حالت فعلی سایت با تمرکز روی قیمت و اعتماد",
    settings: {
      template: "classic",
      density: "comfortable",
      cornerRadius: 20,
      colors: {
        primary: "#087f5b",
        accent: "#d9a928",
        background: "#faf9f5",
        foreground: "#17202a",
      },
    },
  },
  {
    id: "editorial",
    label: "مجله‌ای روشن",
    description: "فضای سفید بیشتر و ظاهر مناسب اخبار و تحلیل",
    settings: {
      template: "editorial",
      density: "comfortable",
      cornerRadius: 14,
      colors: {
        primary: "#1d4ed8",
        accent: "#c2410c",
        background: "#fffdf8",
        foreground: "#1f2937",
      },
    },
  },
  {
    id: "premium",
    label: "پریمیوم طلایی",
    description: "ظاهر رسمی، لوکس و مناسب برند صادراتی",
    settings: {
      template: "premium",
      density: "comfortable",
      cornerRadius: 28,
      colors: {
        primary: "#14532d",
        accent: "#b88916",
        background: "#f7f4ec",
        foreground: "#171717",
      },
    },
  },
  {
    id: "compact",
    label: "فشرده و داده‌محور",
    description: "فاصله کمتر و نمایش سریع‌تر اطلاعات بازار",
    settings: {
      template: "compact",
      density: "compact",
      cornerRadius: 10,
      colors: {
        primary: "#0f766e",
        accent: "#ea580c",
        background: "#f8fafc",
        foreground: "#0f172a",
      },
    },
  },
  {
    id: "minimal",
    label: "مینیمال سفید",
    description: "ظاهر تمیز، سبک و مناسب تمرکز روی محتوا",
    settings: {
      template: "minimal",
      density: "comfortable",
      cornerRadius: 8,
      colors: {
        primary: "#334155",
        accent: "#d97706",
        background: "#ffffff",
        foreground: "#111827",
      },
    },
  },
  {
    id: "warm",
    label: "طبیعی و گرم",
    description: "الهام‌گرفته از باغ، خاک و محصول پسته",
    settings: {
      template: "warm",
      density: "comfortable",
      cornerRadius: 24,
      colors: {
        primary: "#6b7a40",
        accent: "#b45309",
        background: "#fffaf0",
        foreground: "#2f2a22",
      },
    },
  },
];

export const SiteDesignContext = createContext<{
  design: SiteDesignSettings;
  loading: boolean;
  reload: () => Promise<void>;
}>({
  design: DEFAULT_SITE_DESIGN,
  loading: true,
  reload: async () => undefined,
});

export function useSiteDesign() {
  return useContext(SiteDesignContext);
}

export function cloneDesign(value: SiteDesignSettings): SiteDesignSettings {
  return JSON.parse(JSON.stringify(value)) as SiteDesignSettings;
}

export function normalizeSiteDesign(value: unknown): SiteDesignSettings {
  if (!value || typeof value !== "object") return cloneDesign(DEFAULT_SITE_DESIGN);

  const source = value as Partial<SiteDesignSettings>;
  const sourceSections = Array.isArray(source.sections) ? source.sections : [];
  const sectionMap = new Map(
    sourceSections
      .filter((item): item is SiteSectionSetting => Boolean(item?.id))
      .map((item) => [item.id, item]),
  );

  const orderedIds = sourceSections
    .map((item) => item?.id)
    .filter((id): id is SiteSectionId => Boolean(id && SECTION_META[id]));

  const missingIds = DEFAULT_SITE_DESIGN.sections
    .map((item) => item.id)
    .filter((id) => !orderedIds.includes(id));

  const sections = [...orderedIds, ...missingIds].map((id) => {
    const fallback = DEFAULT_SITE_DESIGN.sections.find((item) => item.id === id)!;
    const current = sectionMap.get(id);
    return {
      id,
      visible: current?.visible ?? fallback.visible,
      width:
        current?.width === "wide" ||
        current?.width === "boxed" ||
        current?.width === "full"
          ? current.width
          : fallback.width,
    };
  });

  return {
    ...cloneDesign(DEFAULT_SITE_DESIGN),
    ...source,
    version: 1,
    template:
      source.template && ["classic", "editorial", "premium", "compact", "minimal", "warm"].includes(source.template)
        ? source.template
        : DEFAULT_SITE_DESIGN.template,
    density:
      source.density === "compact" ? "compact" : "comfortable",
    cornerRadius: clampNumber(source.cornerRadius, 0, 40, 20),
    colors: {
      ...DEFAULT_SITE_DESIGN.colors,
      ...(source.colors ?? {}),
    },
    fonts: {
      ...DEFAULT_SITE_DESIGN.fonts,
      ...(source.fonts ?? {}),
    },
    hero: {
      ...DEFAULT_SITE_DESIGN.hero,
      ...(source.hero ?? {}),
      overlay: clampNumber(source.hero?.overlay, 0, 90, 42),
      minHeight: clampNumber(source.hero?.minHeight, 420, 900, 640),
    },
    sections,
  };
}

function clampNumber(
  value: number | undefined,
  min: number,
  max: number,
  fallback: number,
) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function sanitizeHex(hex: string, fallback: string) {
  const value = hex.trim();
  if (/^#[0-9a-f]{6}$/i.test(value)) return value.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toLowerCase();
  }
  return fallback;
}

function hexToRgb(hex: string) {
  const clean = hex.slice(1);
  return {
    r: Number.parseInt(clean.slice(0, 2), 16),
    g: Number.parseInt(clean.slice(2, 4), 16),
    b: Number.parseInt(clean.slice(4, 6), 16),
  };
}

function mixHex(hex: string, target: "white" | "black", amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const targetValue = target === "white" ? 255 : 0;
  const mix = (channel: number) =>
    Math.round(channel + (targetValue - channel) * amount);
  return { r: mix(r), g: mix(g), b: mix(b) };
}

function rgbToOklch({ r, g, b }: { r: number; g: number; b: number }) {
  const toLinear = (channel: number) => {
    const value = channel / 255;
    return value <= 0.04045
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  };

  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const lRoot = Math.cbrt(l);
  const mRoot = Math.cbrt(m);
  const sRoot = Math.cbrt(s);

  const labL = 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot;
  const labA = 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot;
  const labB = 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot;

  const chroma = Math.sqrt(labA * labA + labB * labB);
  let hue = (Math.atan2(labB, labA) * 180) / Math.PI;
  if (hue < 0) hue += 360;
  if (chroma < 0.0001) hue = 0;

  return `${labL.toFixed(4)} ${chroma.toFixed(4)} ${hue.toFixed(2)}`;
}

function applyScale(
  root: HTMLElement,
  name: string,
  baseHex: string,
  mode: "brand" | "background" | "foreground",
) {
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
  const brandMixes: Record<number, ["white" | "black", number]> = {
    50: ["white", 0.93],
    100: ["white", 0.84],
    200: ["white", 0.7],
    300: ["white", 0.52],
    400: ["white", 0.28],
    500: ["white", 0],
    600: ["black", 0.12],
    700: ["black", 0.28],
    800: ["black", 0.44],
    900: ["black", 0.58],
    950: ["black", 0.72],
  };
  const backgroundDarken: Record<number, number> = {
    50: 0,
    100: 0.025,
    200: 0.07,
    300: 0.14,
    400: 0.24,
    500: 0.36,
    600: 0.47,
    700: 0.58,
    800: 0.68,
    900: 0.76,
    950: 0.84,
  };
  const foregroundLighten: Record<number, number> = {
    50: 0.93,
    100: 0.84,
    200: 0.72,
    300: 0.58,
    400: 0.45,
    500: 0.33,
    600: 0.24,
    700: 0.16,
    800: 0.09,
    900: 0.04,
    950: 0,
  };

  for (const step of steps) {
    let rgb;
    if (mode === "brand") {
      const [target, amount] = brandMixes[step];
      rgb = mixHex(baseHex, target, amount);
    } else if (mode === "background") {
      rgb = mixHex(baseHex, "black", backgroundDarken[step]);
    } else {
      rgb = mixHex(baseHex, "white", foregroundLighten[step]);
    }
    root.style.setProperty(`--${name}-${step}`, rgbToOklch(rgb));
  }
}

export function applySiteDesignToDocument(input: SiteDesignSettings) {
  if (typeof document === "undefined") return;
  const design = normalizeSiteDesign(input);
  const root = document.documentElement;

  const primary = sanitizeHex(design.colors.primary, DEFAULT_SITE_DESIGN.colors.primary);
  const accent = sanitizeHex(design.colors.accent, DEFAULT_SITE_DESIGN.colors.accent);
  const background = sanitizeHex(
    design.colors.background,
    DEFAULT_SITE_DESIGN.colors.background,
  );
  const foreground = sanitizeHex(
    design.colors.foreground,
    DEFAULT_SITE_DESIGN.colors.foreground,
  );

  applyScale(root, "primary", primary, "brand");
  applyScale(root, "secondary", primary, "brand");
  applyScale(root, "accent", accent, "brand");
  applyScale(root, "background", background, "background");
  applyScale(root, "foreground", foreground, "foreground");

  const bodyFont =
    FONT_OPTIONS.find((item) => item.id === design.fonts.body)?.family ??
    FONT_OPTIONS[0].family;
  const headingFont =
    FONT_OPTIONS.find((item) => item.id === design.fonts.heading)?.family ??
    FONT_OPTIONS[0].family;
  const labelFont =
    FONT_OPTIONS.find((item) => item.id === design.fonts.label)?.family ??
    FONT_OPTIONS[0].family;

  root.style.setProperty("--font-body", bodyFont);
  root.style.setProperty("--font-heading", headingFont);
  root.style.setProperty("--font-label", labelFont);
  root.style.setProperty("--site-radius", `${design.cornerRadius}px`);
  root.style.setProperty(
    "--site-section-gap",
    design.density === "compact" ? "10px" : "20px",
  );
  root.dataset.siteTemplate = design.template;
  root.dataset.siteDensity = design.density;
}
