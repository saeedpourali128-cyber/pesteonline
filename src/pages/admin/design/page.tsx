import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Eye,
  GripVertical,
  Image as ImageIcon,
  LayoutGrid,
  Link2,
  Loader2,
  Monitor,
  Move,
  Palette,
  RefreshCw,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Tablet,
  Type,
  Upload,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  COLOR_PRESETS,
  DEFAULT_SITE_DESIGN,
  FONT_OPTIONS,
  SECTION_META,
  TEMPLATE_PRESETS,
  cloneDesign,
  normalizeSiteDesign,
  type SiteDesignSettings,
  type SiteSectionId,
  type SiteSectionSetting,
  type SiteWidth,
} from "@/lib/site-design";

const SETTING_KEY = "site_design";

type TabId = "templates" | "colors" | "fonts" | "hero" | "sections";
type PreviewMode = "desktop" | "tablet" | "mobile";
type Notice = { kind: "success" | "error" | "info"; text: string } | null;

const TABS: Array<{ id: TabId; label: string; icon: typeof Palette }> = [
  { id: "templates", label: "قالب‌ها", icon: Sparkles },
  { id: "colors", label: "رنگ‌ها", icon: Palette },
  { id: "fonts", label: "فونت‌ها", icon: Type },
  { id: "hero", label: "بنر اصلی", icon: ImageIcon },
  { id: "sections", label: "چیدمان باکس‌ها", icon: LayoutGrid },
];

const WIDTH_OPTIONS: Array<{ value: SiteWidth; label: string; hint: string }> = [
  { value: "full", label: "تمام‌عرض", hint: "از لبه تا لبه صفحه" },
  { value: "wide", label: "عریض", hint: "کادر بزرگ و مدرن" },
  { value: "boxed", label: "باکس‌شده", hint: "کادر جمع‌وجورتر" },
];

const PREVIEW_WIDTH: Record<PreviewMode, string> = {
  desktop: "100%",
  tablet: "760px",
  mobile: "390px",
};

function fontFamily(fontId: string) {
  return FONT_OPTIONS.find((item) => item.id === fontId)?.family ?? FONT_OPTIONS[0].family;
}

function isHexColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value.trim());
}

function rgbaFromHex(hex: string, alpha: number) {
  const safe = isHexColor(hex) ? hex : "#000000";
  const value = safe.slice(1);
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

async function compressBannerImage(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("فایل انتخاب‌شده تصویر نیست.");
  if (file.size > 12 * 1024 * 1024)
    throw new Error("حجم تصویر بیشتر از ۱۲ مگابایت است.");

  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("خواندن تصویر انجام نشد."));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("تصویر قابل پردازش نیست."));
    element.src = source;
  });

  const maxWidth = 1800;
  const maxHeight = 1100;
  const scale = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("مرورگر امکان فشرده‌سازی تصویر را ندارد.");
  context.drawImage(image, 0, 0, width, height);

  let result = canvas.toDataURL("image/webp", 0.82);
  if (!result.startsWith("data:image/")) result = canvas.toDataURL("image/jpeg", 0.82);
  if (result.length > 1_800_000) result = canvas.toDataURL("image/jpeg", 0.68);
  if (result.length > 2_500_000)
    throw new Error("تصویر بعد از فشرده‌سازی هنوز بزرگ است؛ تصویر سبک‌تری انتخاب کن.");

  return result;
}

function FieldLabel({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-2">
      <label className="text-sm font-black text-slate-800">{title}</label>
      {hint && <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <FieldLabel title={label} />
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={isHexColor(value) ? value : "#000000"}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-14 cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
        />
        <input
          type="text"
          dir="ltr"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`min-w-0 flex-1 rounded-xl border px-3 py-2.5 text-left font-mono text-sm outline-none transition ${
            isHexColor(value)
              ? "border-slate-200 focus:border-emerald-500"
              : "border-rose-300 bg-rose-50 focus:border-rose-500"
          }`}
          placeholder="#087f5b"
        />
      </div>
    </div>
  );
}

function PreviewSection({
  section,
  design,
}: {
  section: SiteSectionSetting;
  design: SiteDesignSettings;
}) {
  const width = section.width === "full" ? "100%" : section.width === "wide" ? "92%" : "78%";
  const meta = SECTION_META[section.id];
  const isDark = section.id === "charts" || section.id === "footer";

  if (section.id === "marketBar") {
    return (
      <div
        className="flex h-9 items-center justify-center text-[10px] font-black shadow-sm"
        style={{ background: "rgba(255,255,255,.94)", color: design.colors.foreground }}
      >
        Peste<span style={{ color: design.colors.primary }}>Online</span>
        <span className="mx-2 opacity-30">|</span>
        مرجع تخصصی قیمت پسته
      </div>
    );
  }

  if (section.id === "hero") {
    const title = design.hero.title.split("\n");
    return (
      <div
        className="relative mx-auto flex min-h-52 items-center overflow-hidden"
        style={{
          width,
          borderRadius: section.width === "full" ? 0 : design.cornerRadius,
          background: design.colors.primary,
        }}
      >
        {design.hero.imageUrl && (
          <img
            src={design.hero.imageUrl}
            alt="پیش‌نمایش بنر"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: design.hero.position }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{ background: `rgba(0,0,0,${design.hero.overlay / 100})` }}
        />
        <div
          className={`relative z-10 flex w-full flex-col px-7 py-8 text-white ${
            design.hero.alignment === "center"
              ? "items-center text-center"
              : design.hero.alignment === "left"
                ? "items-end text-left"
                : "items-start text-right"
          }`}
        >
          <div className="text-2xl font-black leading-tight">
            {title.map((line, index) => (
              <div key={`${line}-${index}`}>{line}</div>
            ))}
          </div>
          <p className="mt-2 max-w-md text-[11px] text-white/80">{design.hero.subtitle}</p>
          <div className="mt-4 flex gap-2">
            {design.hero.secondaryButtonText && (
              <span className="rounded-full bg-white/20 px-3 py-1.5 text-[9px]">
                {design.hero.secondaryButtonText}
              </span>
            )}
            {design.hero.primaryButtonText && (
              <span
                className="rounded-full px-3 py-1.5 text-[9px] font-black"
                style={{ background: design.colors.accent, color: design.colors.foreground }}
              >
                {design.hero.primaryButtonText}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto p-3"
      style={{
        width,
        borderRadius: section.width === "full" ? 0 : design.cornerRadius,
        background: isDark ? design.colors.foreground : "rgba(255,255,255,.72)",
        color: isDark ? "white" : design.colors.foreground,
        border: `1px solid ${rgbaFromHex(design.colors.foreground, 0.09)}`,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="h-7 w-7 rounded-lg"
          style={{ background: isDark ? design.colors.primary : rgbaFromHex(design.colors.primary, 0.14) }}
        />
        <div className="flex-1">
          <div className="text-[10px] font-black">{meta.label}</div>
          <div className={`mt-1 h-1.5 w-2/3 rounded-full ${isDark ? "bg-white/15" : "bg-slate-200"}`} />
        </div>
        <div
          className="h-5 w-12 rounded-full"
          style={{ background: rgbaFromHex(design.colors.accent, 0.65) }}
        />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className={`h-12 rounded-lg ${isDark ? "bg-white/10" : "bg-slate-100"}`}
          />
        ))}
      </div>
    </div>
  );
}

function DesignPreview({
  design,
  mode,
}: {
  design: SiteDesignSettings;
  mode: PreviewMode;
}) {
  const visibleSections = design.sections.filter((section) => section.visible);
  return (
    <div className="overflow-auto rounded-3xl border border-slate-200 bg-slate-200/60 p-3">
      <div
        className="mx-auto origin-top overflow-hidden bg-white shadow-xl transition-all duration-300"
        style={{
          width: PREVIEW_WIDTH[mode],
          maxWidth: "100%",
          minHeight: 480,
          borderRadius: mode === "mobile" ? 28 : 18,
          background: design.colors.background,
          color: design.colors.foreground,
          fontFamily: fontFamily(design.fonts.body),
        }}
      >
        <div className="flex flex-col gap-2 py-2">
          {visibleSections.map((section) => (
            <PreviewSection key={section.id} section={section} design={design} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminDesign() {
  const [design, setDesign] = useState<SiteDesignSettings>(() => cloneDesign(DEFAULT_SITE_DESIGN));
  const [publishedDesign, setPublishedDesign] = useState<SiteDesignSettings>(() =>
    cloneDesign(DEFAULT_SITE_DESIGN),
  );
  const [activeTab, setActiveTab] = useState<TabId>("templates");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [draggedSection, setDraggedSection] = useState<SiteSectionId | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dirty = useMemo(
    () => JSON.stringify(normalizeSiteDesign(design)) !== JSON.stringify(normalizeSiteDesign(publishedDesign)),
    [design, publishedDesign],
  );

  const loadDesign = useCallback(async () => {
    setLoading(true);
    setNotice(null);

    const { data, error } = await supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", SETTING_KEY)
      .maybeSingle();

    if (error) {
      console.error(error);
      setNotice({ kind: "error", text: `دریافت تنظیمات طراحی انجام نشد: ${error.message}` });
      setLoading(false);
      return;
    }

    const next = normalizeSiteDesign(data?.setting_value ?? DEFAULT_SITE_DESIGN);
    setDesign(cloneDesign(next));
    setPublishedDesign(cloneDesign(next));
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadDesign();
  }, [loadDesign]);

  const setColor = (key: keyof SiteDesignSettings["colors"], value: string) => {
    setDesign((current) => ({
      ...current,
      colors: { ...current.colors, [key]: value },
    }));
  };

  const setFont = (key: keyof SiteDesignSettings["fonts"], value: string) => {
    setDesign((current) => ({
      ...current,
      fonts: { ...current.fonts, [key]: value },
    }));
  };

  const setHero = <K extends keyof SiteDesignSettings["hero"]>(
    key: K,
    value: SiteDesignSettings["hero"][K],
  ) => {
    setDesign((current) => ({
      ...current,
      hero: { ...current.hero, [key]: value },
    }));
  };

  const applyTemplate = (templateId: SiteDesignSettings["template"]) => {
    const preset = TEMPLATE_PRESETS.find((item) => item.id === templateId);
    if (!preset) return;
    setDesign((current) => ({
      ...current,
      template: preset.id,
      density: preset.settings.density ?? current.density,
      cornerRadius: preset.settings.cornerRadius ?? current.cornerRadius,
      colors: { ...preset.settings.colors },
    }));
    setNotice({ kind: "info", text: "قالب روی پیش‌نمایش اعمال شد؛ برای نمایش در سایت ذخیره کن." });
  };

  const applyColorPreset = (presetId: string) => {
    const preset = COLOR_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setDesign((current) => ({ ...current, colors: { ...preset.colors } }));
    setNotice({ kind: "info", text: "پالت رنگ روی پیش‌نمایش اعمال شد." });
  };

  const handleImageFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setNotice(null);
    try {
      const imageUrl = await compressBannerImage(file);
      setHero("imageUrl", imageUrl);
      setNotice({ kind: "success", text: "تصویر انتخاب شد و برای وب فشرده شد. برای انتشار ذخیره کن." });
    } catch (error) {
      setNotice({
        kind: "error",
        text: error instanceof Error ? error.message : "پردازش تصویر انجام نشد.",
      });
    } finally {
      setUploading(false);
    }
  };

  const updateSection = (id: SiteSectionId, patch: Partial<SiteSectionSetting>) => {
    setDesign((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === id ? { ...section, ...patch } : section,
      ),
    }));
  };

  const moveSection = (id: SiteSectionId, direction: -1 | 1) => {
    if (id === "marketBar") return;
    setDesign((current) => {
      const sections = [...current.sections];
      const index = sections.findIndex((section) => section.id === id);
      const target = index + direction;
      if (index < 0 || target < 1 || target >= sections.length) return current;
      [sections[index], sections[target]] = [sections[target], sections[index]];
      return { ...current, sections };
    });
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, targetId: SiteSectionId) => {
    event.preventDefault();
    if (!draggedSection || draggedSection === targetId) return;
    if (draggedSection === "marketBar" || targetId === "marketBar") return;

    setDesign((current) => {
      const sections = [...current.sections];
      const sourceIndex = sections.findIndex((section) => section.id === draggedSection);
      const targetIndex = sections.findIndex((section) => section.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return current;
      const [moved] = sections.splice(sourceIndex, 1);
      sections.splice(targetIndex, 0, moved);
      return { ...current, sections };
    });
    setDraggedSection(null);
  };

  const validate = () => {
    if (!Object.values(design.colors).every(isHexColor))
      return "همه رنگ‌ها باید با فرمت شش‌رقمی مثل #087f5b وارد شوند.";
    if (!design.hero.title.trim()) return "عنوان بنر اصلی را وارد کن.";
    if (design.hero.imageUrl && !/^(https?:\/\/|data:image\/)/i.test(design.hero.imageUrl.trim()))
      return "آدرس تصویر بنر باید با http، https یا data:image شروع شود.";
    if (!design.sections.some((section) => section.visible && section.id !== "marketBar"))
      return "حداقل یک بخش از صفحه اصلی باید قابل نمایش باشد.";
    return null;
  };

  const saveDesign = async () => {
    const validationError = validate();
    if (validationError) {
      setNotice({ kind: "error", text: validationError });
      return;
    }

    const normalized = normalizeSiteDesign(design);
    setSaving(true);
    setNotice(null);

    const { data, error } = await supabase
      .from("site_settings")
      .upsert(
        {
          setting_key: SETTING_KEY,
          setting_value: normalized,
          is_public: true,
        },
        { onConflict: "setting_key" },
      )
      .select("setting_value")
      .single();

    if (error) {
      console.error(error);
      setNotice({ kind: "error", text: `ذخیره طراحی انجام نشد: ${error.message}` });
      setSaving(false);
      return;
    }

    const saved = normalizeSiteDesign(data?.setting_value ?? normalized);
    setDesign(cloneDesign(saved));
    setPublishedDesign(cloneDesign(saved));
    window.dispatchEvent(new CustomEvent("site-design-updated", { detail: saved }));
    setNotice({ kind: "success", text: "طراحی با موفقیت منتشر شد و روی سایت اعمال شد." });
    setSaving(false);
  };

  const discardChanges = () => {
    if (dirty && !window.confirm("تغییرات ذخیره‌نشده کنار گذاشته شوند؟")) return;
    setDesign(cloneDesign(publishedDesign));
    setNotice({ kind: "info", text: "تغییرات ذخیره‌نشده کنار گذاشته شد." });
  };

  const resetDefaults = () => {
    if (!window.confirm("همه تنظیمات طراحی به حالت پیش‌فرض برگردد؟ هنوز تا زمان ذخیره روی سایت اعمال نمی‌شود."))
      return;
    setDesign(cloneDesign(DEFAULT_SITE_DESIGN));
    setNotice({ kind: "info", text: "حالت پیش‌فرض در پیش‌نمایش قرار گرفت؛ برای اعمال، ذخیره کن." });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 font-bold text-slate-700 shadow-sm">
          <Loader2 className="animate-spin text-emerald-600" /> در حال دریافت تنظیمات طراحی...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-24" dir="rtl">
      <header className="border-b border-slate-200 bg-white px-5 py-6 lg:px-8">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-black text-emerald-700">
              <Palette size={16} /> طراحی و ظاهر سایت
            </div>
            <h1 className="text-2xl font-black text-slate-950 md:text-3xl">استودیو طراحی PesteOnline</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
              قالب، رنگ، فونت، بنر اصلی و ترتیب تمام باکس‌های صفحه اول را بدون تغییر کد مدیریت کن.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              <Eye size={17} /> مشاهده سایت
            </a>
            <button
              type="button"
              onClick={discardChanges}
              disabled={!dirty || saving}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw size={17} /> لغو تغییرات
            </button>
            <button
              type="button"
              onClick={() => void saveDesign()}
              disabled={!dirty || saving || uploading}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              ذخیره و انتشار
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-6 p-4 md:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)] lg:p-8">
        <section className="min-w-0">
          {notice && (
            <div
              className={`mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-bold leading-6 ${
                notice.kind === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : notice.kind === "error"
                    ? "border-rose-200 bg-rose-50 text-rose-800"
                    : "border-sky-200 bg-sky-50 text-sky-800"
              }`}
            >
              {notice.kind === "success" ? (
                <CheckCircle2 className="mt-0.5 shrink-0" size={19} />
              ) : (
                <SlidersHorizontal className="mt-0.5 shrink-0" size={19} />
              )}
              <span>{notice.text}</span>
            </div>
          )}

          <div className="mb-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <div className="flex min-w-max gap-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition ${
                    activeTab === id
                      ? "bg-slate-950 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={17} /> {label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            {activeTab === "templates" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-black text-slate-950">انتخاب قالب کلی</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    قالب، فاصله‌ها، گوشه‌ها و پالت پایه را تغییر می‌دهد؛ متن‌ها و ترتیب باکس‌ها حفظ می‌شوند.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {TEMPLATE_PRESETS.map((preset) => {
                    const active = design.template === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyTemplate(preset.id)}
                        className={`overflow-hidden rounded-2xl border-2 text-right transition hover:-translate-y-0.5 hover:shadow-lg ${
                          active ? "border-emerald-500 ring-4 ring-emerald-500/10" : "border-slate-200"
                        }`}
                      >
                        <div
                          className="h-28 p-3"
                          style={{ background: preset.settings.colors.background }}
                        >
                          <div
                            className="h-6 rounded-lg"
                            style={{ background: preset.settings.colors.primary }}
                          />
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            <div
                              className="col-span-2 h-14 rounded-xl"
                              style={{
                                background: rgbaFromHex(preset.settings.colors.primary, 0.16),
                                borderRadius: preset.settings.cornerRadius,
                              }}
                            />
                            <div
                              className="h-14 rounded-xl"
                              style={{
                                background: preset.settings.colors.accent,
                                borderRadius: preset.settings.cornerRadius,
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex items-start gap-3 bg-white p-4">
                          <div className="flex-1">
                            <div className="font-black text-slate-900">{preset.label}</div>
                            <div className="mt-1 text-xs leading-5 text-slate-500">{preset.description}</div>
                          </div>
                          {active && <CheckCircle2 className="text-emerald-600" size={21} />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <FieldLabel title="تراکم صفحه" hint="فاصله عمودی بین بخش‌ها و میزان فشردگی محتوا" />
                    <div className="grid grid-cols-2 gap-2">
                      {(["comfortable", "compact"] as const).map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setDesign((current) => ({ ...current, density: value }))}
                          className={`rounded-xl border px-3 py-2.5 text-sm font-black ${
                            design.density === value
                              ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                              : "border-slate-200 text-slate-600"
                          }`}
                        >
                          {value === "comfortable" ? "راحت و باز" : "فشرده"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <FieldLabel title={`گردی گوشه‌ها: ${design.cornerRadius}px`} hint="روی باکس‌ها و بنرهای کادردار اعمال می‌شود" />
                    <input
                      type="range"
                      min={0}
                      max={40}
                      value={design.cornerRadius}
                      onChange={(event) =>
                        setDesign((current) => ({ ...current, cornerRadius: Number(event.target.value) }))
                      }
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "colors" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-black text-slate-950">رنگ‌بندی سایت</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    از پالت آماده استفاده کن یا هر چهار رنگ اصلی را دقیقاً مطابق برند تغییر بده.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyColorPreset(preset.id)}
                      className="rounded-2xl border border-slate-200 bg-white p-3 text-right transition hover:border-emerald-400 hover:shadow-md"
                    >
                      <div className="mb-3 flex overflow-hidden rounded-xl">
                        {Object.values(preset.colors).map((color, index) => (
                          <span key={`${color}-${index}`} className="h-10 flex-1" style={{ background: color }} />
                        ))}
                      </div>
                      <div className="text-sm font-black text-slate-900">{preset.label}</div>
                      <div className="mt-1 text-[11px] leading-5 text-slate-500">{preset.description}</div>
                    </button>
                  ))}
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <ColorField label="رنگ اصلی برند" value={design.colors.primary} onChange={(value) => setColor("primary", value)} />
                  <ColorField label="رنگ تأکیدی و دکمه‌ها" value={design.colors.accent} onChange={(value) => setColor("accent", value)} />
                  <ColorField label="پس‌زمینه کلی" value={design.colors.background} onChange={(value) => setColor("background", value)} />
                  <ColorField label="متن اصلی" value={design.colors.foreground} onChange={(value) => setColor("foreground", value)} />
                </div>
              </div>
            )}

            {activeTab === "fonts" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-black text-slate-950">فونت‌های سایت</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    فونت متن، تیتر و دکمه‌ها را جدا انتخاب کن. همه فونت‌های زیر از قبل در سایت بارگذاری شده‌اند.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  {(
                    [
                      ["body", "فونت متن‌ها", "برای پاراگراف‌ها و توضیحات"],
                      ["heading", "فونت تیترها", "برای عنوان صفحه و بخش‌ها"],
                      ["label", "فونت دکمه و فرم", "برای کنترل‌ها و برچسب‌ها"],
                    ] as const
                  ).map(([key, label, hint]) => (
                    <div key={key} className="rounded-2xl border border-slate-200 p-4">
                      <FieldLabel title={label} hint={hint} />
                      <select
                        value={design.fonts[key]}
                        onChange={(event) => setFont(key, event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold outline-none focus:border-emerald-500"
                        style={{ fontFamily: fontFamily(design.fonts[key]) }}
                      >
                        {FONT_OPTIONS.map((font) => (
                          <option key={font.id} value={font.id} style={{ fontFamily: font.family }}>
                            {font.label}
                          </option>
                        ))}
                      </select>
                      <div
                        className="mt-4 rounded-xl bg-slate-50 p-4 text-lg leading-8 text-slate-800"
                        style={{ fontFamily: fontFamily(design.fonts[key]) }}
                      >
                        قیمت روز پسته ایران
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-xs font-black text-slate-500">نمونه ترکیب نهایی</div>
                  <h3
                    className="mt-3 text-3xl font-black text-slate-950"
                    style={{ fontFamily: fontFamily(design.fonts.heading) }}
                  >
                    تحلیل امروز بازار پسته
                  </h3>
                  <p
                    className="mt-3 leading-8 text-slate-600"
                    style={{ fontFamily: fontFamily(design.fonts.body) }}
                  >
                    اطلاعات قیمت و روند بازار با چیدمانی شفاف، خوانا و مناسب تمام نمایشگرها ارائه می‌شود.
                  </p>
                  <button
                    type="button"
                    className="mt-4 rounded-xl px-5 py-2.5 text-sm font-black text-white"
                    style={{
                      background: design.colors.primary,
                      fontFamily: fontFamily(design.fonts.label),
                    }}
                  >
                    مشاهده قیمت‌ها
                  </button>
                </div>
              </div>
            )}

            {activeTab === "hero" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-black text-slate-950">مدیریت بنر اصلی</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    تصویر را از کامپیوتر انتخاب کن یا لینک مستقیم بده؛ تصویر پیش از ذخیره خودکار فشرده می‌شود.
                  </p>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="space-y-5">
                    <div>
                      <FieldLabel title="تصویر بنر" hint="پیشنهاد: تصویر افقی با نسبت حدود ۱۶:۹ و حداقل عرض ۱۴۰۰ پیکسل" />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => void handleImageFile(event)}
                        className="hidden"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-50"
                        >
                          {uploading ? <Loader2 size={17} className="animate-spin" /> : <Upload size={17} />}
                          انتخاب عکس از کامپیوتر
                        </button>
                        <button
                          type="button"
                          onClick={() => setHero("imageUrl", DEFAULT_SITE_DESIGN.hero.imageUrl)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700"
                        >
                          <RefreshCw size={17} /> تصویر پیش‌فرض
                        </button>
                      </div>
                    </div>

                    <div>
                      <FieldLabel title="یا آدرس مستقیم تصویر" hint="برای تصویر موجود در سایت یا سرویس تصاویر" />
                      <div className="relative">
                        <Link2 className="absolute right-3 top-3.5 text-slate-400" size={18} />
                        <input
                          type="url"
                          dir="ltr"
                          value={design.hero.imageUrl.startsWith("data:image/") ? "" : design.hero.imageUrl}
                          onChange={(event) => setHero("imageUrl", event.target.value)}
                          placeholder="https://example.com/banner.webp"
                          className="w-full rounded-xl border border-slate-200 py-3 pl-3 pr-10 text-left text-sm outline-none focus:border-emerald-500"
                        />
                      </div>
                      {design.hero.imageUrl.startsWith("data:image/") && (
                        <p className="mt-2 text-xs font-bold text-emerald-700">تصویر انتخاب‌شده از کامپیوتر آماده ذخیره است.</p>
                      )}
                    </div>

                    <div>
                      <FieldLabel title="عنوان اصلی" hint="برای رفتن به خط بعد Enter بزن" />
                      <textarea
                        rows={3}
                        value={design.hero.title}
                        onChange={(event) => setHero("title", event.target.value)}
                        className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold leading-7 outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <FieldLabel title="زیرعنوان" />
                      <textarea
                        rows={3}
                        value={design.hero.subtitle}
                        onChange={(event) => setHero("subtitle", event.target.value)}
                        className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <FieldLabel title="متن دکمه اصلی" />
                        <input
                          value={design.hero.primaryButtonText}
                          onChange={(event) => setHero("primaryButtonText", event.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <FieldLabel title="لینک دکمه اصلی" />
                        <input
                          dir="ltr"
                          value={design.hero.primaryButtonLink}
                          onChange={(event) => setHero("primaryButtonLink", event.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-3 text-left text-sm outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <FieldLabel title="متن دکمه دوم" />
                        <input
                          value={design.hero.secondaryButtonText}
                          onChange={(event) => setHero("secondaryButtonText", event.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <FieldLabel title="لینک دکمه دوم" />
                        <input
                          dir="ltr"
                          value={design.hero.secondaryButtonLink}
                          onChange={(event) => setHero("secondaryButtonLink", event.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-3 text-left text-sm outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                      <div className="relative aspect-[16/10]">
                        {design.hero.imageUrl ? (
                          <img
                            src={design.hero.imageUrl}
                            alt="پیش‌نمایش تصویر بنر"
                            className="h-full w-full object-cover"
                            style={{ objectPosition: design.hero.position }}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            <ImageIcon size={40} />
                          </div>
                        )}
                        <div
                          className="absolute inset-0"
                          style={{ background: `rgba(0,0,0,${design.hero.overlay / 100})` }}
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4">
                      <FieldLabel title={`تیرگی روی تصویر: ${design.hero.overlay}%`} hint="برای خواناترشدن متن روی عکس" />
                      <input
                        type="range"
                        min={0}
                        max={90}
                        value={design.hero.overlay}
                        onChange={(event) => setHero("overlay", Number(event.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4">
                      <FieldLabel title={`ارتفاع بنر: ${design.hero.minHeight}px`} />
                      <input
                        type="range"
                        min={420}
                        max={900}
                        step={10}
                        value={design.hero.minHeight}
                        onChange={(event) => setHero("minHeight", Number(event.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4">
                      <FieldLabel title="محل متن روی بنر" />
                      <div className="grid grid-cols-3 gap-2">
                        {(["right", "center", "left"] as const).map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setHero("alignment", value)}
                            className={`rounded-xl border px-2 py-2.5 text-xs font-black ${
                              design.hero.alignment === value
                                ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                                : "border-slate-200 text-slate-600"
                            }`}
                          >
                            {value === "right" ? "راست" : value === "center" ? "وسط" : "چپ"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4">
                      <FieldLabel title="برش و جایگاه تصویر" />
                      <div className="grid grid-cols-3 gap-2">
                        {(["top", "center", "bottom"] as const).map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setHero("position", value)}
                            className={`rounded-xl border px-2 py-2.5 text-xs font-black ${
                              design.hero.position === value
                                ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                                : "border-slate-200 text-slate-600"
                            }`}
                          >
                            {value === "top" ? "بالا" : value === "center" ? "مرکز" : "پایین"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "sections" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-black text-slate-950">چیدمان و جای‌گذاری باکس‌ها</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    کارت‌ها را با دستگیره جابه‌جا کن یا از فلش‌ها استفاده کن. برای هر بخش نمایش و عرض مستقل تعیین می‌شود.
                  </p>
                </div>

                <div className="space-y-3">
                  {design.sections.map((section, index) => {
                    const meta = SECTION_META[section.id];
                    const fixed = section.id === "marketBar";
                    return (
                      <div
                        key={section.id}
                        draggable={!fixed}
                        onDragStart={() => setDraggedSection(section.id)}
                        onDragEnd={() => setDraggedSection(null)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => handleDrop(event, section.id)}
                        className={`rounded-2xl border bg-white p-4 transition ${
                          draggedSection === section.id
                            ? "border-emerald-500 opacity-60"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                fixed ? "bg-slate-100 text-slate-400" : "cursor-grab bg-slate-950 text-white active:cursor-grabbing"
                              }`}
                              title={fixed ? "نوار ثابت بالای سایت" : "برای جابه‌جایی بکش"}
                            >
                              {fixed ? <Monitor size={19} /> : <GripVertical size={20} />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-black text-slate-900">{meta.label}</span>
                                <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">
                                  {fixed ? "ثابت در بالا" : `جایگاه ${index}`}
                                </span>
                              </div>
                              <p className="mt-1 text-xs leading-5 text-slate-500">{meta.description}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {!fixed && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => moveSection(section.id, -1)}
                                  disabled={index <= 1}
                                  className="rounded-xl border border-slate-200 p-2.5 text-slate-600 disabled:opacity-30"
                                  title="یک ردیف بالاتر"
                                >
                                  <ArrowUp size={17} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveSection(section.id, 1)}
                                  disabled={index === design.sections.length - 1}
                                  className="rounded-xl border border-slate-200 p-2.5 text-slate-600 disabled:opacity-30"
                                  title="یک ردیف پایین‌تر"
                                >
                                  <ArrowDown size={17} />
                                </button>
                              </>
                            )}

                            {!fixed && (
                              <select
                                value={section.width}
                                onChange={(event) =>
                                  updateSection(section.id, { width: event.target.value as SiteWidth })
                                }
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-black text-slate-700 outline-none focus:border-emerald-500"
                              >
                                {WIDTH_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            )}

                            <button
                              type="button"
                              onClick={() => updateSection(section.id, { visible: !section.visible })}
                              className={`relative h-10 w-20 rounded-full p-1 transition ${
                                section.visible ? "bg-emerald-500" : "bg-slate-300"
                              }`}
                            >
                              <span
                                className={`absolute top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[9px] font-black shadow transition-all ${
                                  section.visible ? "right-11 text-emerald-700" : "right-1 text-slate-500"
                                }`}
                              >
                                {section.visible ? "روشن" : "خاموش"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-7 text-sky-900">
                  <div className="flex items-center gap-2 font-black"><Move size={18} /> راهنمای عرض بخش‌ها</div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {WIDTH_OPTIONS.map((option) => (
                      <div key={option.value} className="rounded-xl bg-white/70 p-3">
                        <div className="font-black">{option.label}</div>
                        <div className="mt-1 text-xs text-sky-700">{option.hint}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs leading-6 text-slate-500">
              {dirty ? (
                <span className="font-black text-amber-700">تغییرات ذخیره‌نشده داری.</span>
              ) : (
                <span className="font-black text-emerald-700">طراحی فعلی با سایت هماهنگ است.</span>
              )}
            </div>
            <button
              type="button"
              onClick={resetDefaults}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-black text-rose-700"
            >
              <RotateCcw size={16} /> بازگشت همه چیز به پیش‌فرض
            </button>
          </div>
        </section>

        <aside className="min-w-0 lg:sticky lg:top-5 lg:self-start">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-black text-slate-950">پیش‌نمایش زنده</h2>
                <p className="mt-1 text-xs text-slate-500">نمای تقریبی صفحه اصلی قبل از انتشار</p>
              </div>
              <div className="flex rounded-xl bg-slate-100 p-1">
                {(
                  [
                    ["desktop", Monitor],
                    ["tablet", Tablet],
                    ["mobile", Smartphone],
                  ] as const
                ).map(([mode, Icon]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPreviewMode(mode)}
                    className={`rounded-lg p-2.5 transition ${
                      previewMode === mode ? "bg-white text-emerald-700 shadow" : "text-slate-500"
                    }`}
                    title={mode === "desktop" ? "دسکتاپ" : mode === "tablet" ? "تبلت" : "موبایل"}
                  >
                    <Icon size={17} />
                  </button>
                ))}
              </div>
            </div>

            <DesignPreview design={normalizeSiteDesign(design)} mode={previewMode} />

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-slate-400">قالب</div>
                <div className="mt-1 font-black text-slate-800">
                  {TEMPLATE_PRESETS.find((item) => item.id === design.template)?.label ?? design.template}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-slate-400">بخش‌های فعال</div>
                <div className="mt-1 font-black text-slate-800">
                  {design.sections.filter((section) => section.visible).length} از {design.sections.length}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(15,23,42,.08)] backdrop-blur lg:right-72">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
          <div className="hidden text-sm font-bold text-slate-500 sm:block">
            {dirty ? "تغییرات آماده انتشار است" : "همه تغییرات ذخیره شده‌اند"}
          </div>
          <button
            type="button"
            onClick={() => void saveDesign()}
            disabled={!dirty || saving || uploading}
            className="mr-auto inline-flex min-w-44 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            ذخیره و انتشار طراحی
          </button>
        </div>
      </div>
    </div>
  );
}
