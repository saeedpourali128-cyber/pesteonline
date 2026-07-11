import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  CheckCircle2,
  Clock3,
  Eye,
  FileBarChart,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  ARTICLE_SELECT,
  formatPersianDate,
  type ArticleRecord,
  type ArticleStatus,
} from "@/lib/articles";

type Notice = {
  kind: "success" | "error" | "info";
  text: string;
} | null;

type AnalysisForm = {
  id: number | null;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  status: ArticleStatus;
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  is_indexable: boolean;
  published_at: string | null;
};

const EMPTY_FORM: AnalysisForm = {
  id: null,
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: "",
  status: "draft",
  meta_title: "",
  meta_description: "",
  canonical_url: "",
  is_indexable: true,
  published_at: null,
};

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06ff-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function rowToForm(article: ArticleRecord): AnalysisForm {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? "",
    content: article.content ?? "",
    cover_image: article.cover_image ?? "",
    status: article.status,
    meta_title: article.meta_title ?? "",
    meta_description: article.meta_description ?? "",
    canonical_url: article.canonical_url ?? "",
    is_indexable: article.is_indexable,
    published_at: article.published_at,
  };
}

export default function AdminMarketAnalysis() {
  const [analyses, setAnalyses] = useState<ArticleRecord[]>([]);
  const [form, setForm] = useState<AnalysisForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ArticleStatus>("all");
  const [notice, setNotice] = useState<Notice>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const fetchAnalyses = useCallback(async () => {
    setLoading(true);
    setNotice(null);

    const { data, error } = await supabase
      .from("admin_articles")
      .select(ARTICLE_SELECT)
      .eq("content_type", "analysis")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error(error);
      setAnalyses([]);
      setNotice({
        kind: "error",
        text: `دریافت تحلیل‌های بازار انجام نشد: ${error.message}`,
      });
    } else {
      setAnalyses((data ?? []) as ArticleRecord[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchAnalyses();
  }, [fetchAnalyses]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return analyses.filter((analysis) => {
      const matchesQuery =
        !query ||
        `${analysis.title} ${analysis.slug} ${analysis.excerpt ?? ""}`
          .toLowerCase()
          .includes(query);
      const matchesStatus =
        statusFilter === "all" || analysis.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [analyses, search, statusFilter]);

  const metrics = useMemo(
    () => ({
      total: analyses.length,
      published: analyses.filter((item) => item.status === "published").length,
      draft: analyses.filter((item) => item.status === "draft").length,
    }),
    [analyses],
  );

  const setField = <K extends keyof AnalysisForm>(
    key: K,
    value: AnalysisForm[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setNotice(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectAnalysis = (analysis: ArticleRecord) => {
    setForm(rowToForm(analysis));
    setSlugTouched(true);
    setNotice(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validate = (nextStatus: ArticleStatus) => {
    if (!form.title.trim()) return "عنوان تحلیل را وارد کن.";
    if (!normalizeSlug(form.slug)) return "اسلاگ معتبر وارد کن.";
    if (nextStatus === "published" && !form.excerpt.trim())
      return "برای انتشار، خلاصه تحلیل را وارد کن.";
    if (nextStatus === "published" && !form.content.trim())
      return "برای انتشار، متن کامل تحلیل را وارد کن.";
    if (form.meta_title.length > 70)
      return "عنوان سئو بهتر است حداکثر ۷۰ نویسه باشد.";
    if (form.meta_description.length > 170)
      return "توضیحات سئو بهتر است حداکثر ۱۷۰ نویسه باشد.";
    if (form.cover_image && !/^https?:\/\//i.test(form.cover_image.trim()))
      return "آدرس تصویر شاخص باید با http یا https شروع شود.";
    if (form.canonical_url && !/^https?:\/\//i.test(form.canonical_url.trim()))
      return "آدرس Canonical باید با http یا https شروع شود.";
    return null;
  };

  const saveAnalysis = async (nextStatus: ArticleStatus) => {
    const validationError = validate(nextStatus);
    if (validationError) {
      setNotice({ kind: "error", text: validationError });
      return;
    }

    setSaving(true);
    setNotice(null);

    const now = new Date().toISOString();
    const payload = {
      title: form.title.trim(),
      slug: normalizeSlug(form.slug),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      cover_image: form.cover_image.trim() || null,
      content_type: "analysis" as const,
      status: nextStatus,
      meta_title: form.meta_title.trim() || null,
      meta_description: form.meta_description.trim() || null,
      canonical_url: form.canonical_url.trim() || null,
      is_indexable: form.is_indexable,
      published_at:
        nextStatus === "published" ? form.published_at ?? now : null,
    };

    const query = form.id
      ? supabase
          .from("admin_articles")
          .update(payload)
          .eq("id", form.id)
          .eq("content_type", "analysis")
          .select(ARTICLE_SELECT)
          .single()
      : supabase
          .from("admin_articles")
          .insert(payload)
          .select(ARTICLE_SELECT)
          .single();

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setNotice({
        kind: "error",
        text:
          error.code === "23505"
            ? "این اسلاگ قبلاً استفاده شده است. یک اسلاگ دیگر وارد کن."
            : `ذخیره تحلیل انجام نشد: ${error.message}`,
      });
      setSaving(false);
      return;
    }

    const saved = data as ArticleRecord;
    setAnalyses((current) => [
      saved,
      ...current.filter((item) => item.id !== saved.id),
    ]);
    setForm(rowToForm(saved));
    setSlugTouched(true);
    setNotice({
      kind: "success",
      text:
        nextStatus === "published"
          ? "تحلیل بازار با موفقیت منتشر شد و در سایت قابل مشاهده است."
          : "پیش‌نویس تحلیل با موفقیت ذخیره شد.",
    });
    setSaving(false);
  };

  const deleteAnalysis = async () => {
    if (!form.id) return;
    if (
      !window.confirm(
        `تحلیل «${form.title}» حذف شود؟ این کار قابل بازگشت نیست.`,
      )
    )
      return;

    setDeleting(true);
    setNotice(null);

    const { error } = await supabase
      .from("admin_articles")
      .delete()
      .eq("id", form.id)
      .eq("content_type", "analysis");

    if (error) {
      console.error(error);
      setNotice({ kind: "error", text: `حذف انجام نشد: ${error.message}` });
      setDeleting(false);
      return;
    }

    setAnalyses((current) => current.filter((item) => item.id !== form.id));
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setNotice({ kind: "success", text: "تحلیل با موفقیت حذف شد." });
    setDeleting(false);
  };

  const publishedUrl = form.slug
    ? `/articles/${encodeURIComponent(normalizeSlug(form.slug))}`
    : "/analysis";

  return (
    <div className="p-4 md:p-8 max-w-[1700px] mx-auto" dir="rtl">
      <header className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-emerald-700 text-sm font-black">
            <Activity size={18} /> مرکز تحلیل بازار پسته
          </div>
          <h1 className="mt-2 text-2xl md:text-3xl font-black text-slate-950">
            مدیریت تحلیل‌های بازار
          </h1>
          <p className="mt-2 text-sm text-slate-500 leading-7 max-w-3xl">
            تحلیل‌های روزانه و تخصصی را به‌صورت پیش‌نویس ذخیره کن، پیش‌نمایش
            بگیر و پس از تکمیل مستقیم در صفحه تحلیل بازار منتشر کن.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/analysis"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold hover:border-emerald-400"
          >
            <Eye size={18} /> مشاهده صفحه تحلیل‌ها
          </Link>
          <button
            onClick={resetForm}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
          >
            <Plus size={18} /> تحلیل جدید
          </button>
        </div>
      </header>

      <section className="grid sm:grid-cols-3 gap-3 mb-6">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-700">
              <FileBarChart size={21} />
            </span>
            <div>
              <p className="text-xs text-slate-500">کل تحلیل‌ها</p>
              <p className="text-2xl font-black mt-1">{metrics.total}</p>
            </div>
          </div>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={21} />
            </span>
            <div>
              <p className="text-xs text-slate-500">منتشرشده</p>
              <p className="text-2xl font-black mt-1">{metrics.published}</p>
            </div>
          </div>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <Clock3 size={21} />
            </span>
            <div>
              <p className="text-xs text-slate-500">پیش‌نویس</p>
              <p className="text-2xl font-black mt-1">{metrics.draft}</p>
            </div>
          </div>
        </article>
      </section>

      {notice && (
        <div
          className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-bold leading-7 ${
            notice.kind === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : notice.kind === "error"
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-sky-200 bg-sky-50 text-sky-800"
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="grid xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,.8fr)] gap-6 items-start">
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 px-5 md:px-7 py-5">
            <div>
              <h2 className="font-black text-lg">
                {form.id ? "ویرایش تحلیل بازار" : "ثبت تحلیل جدید"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                نوع این محتوا به‌صورت خودکار «تحلیل بازار» ثبت می‌شود.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setPreviewOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold hover:bg-slate-50"
              >
                <Eye size={17} /> پیش‌نمایش
              </button>
              {form.id && form.status === "published" && (
                <Link
                  to={publishedUrl}
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100"
                >
                  <Eye size={17} /> مشاهده در سایت
                </Link>
              )}
              {form.id && (
                <button
                  onClick={() => void deleteAnalysis()}
                  disabled={saving || deleting}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Trash2 size={17} />
                  )}
                  حذف
                </button>
              )}
            </div>
          </div>

          <div className="p-5 md:p-7 space-y-5">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">عنوان تحلیل *</span>
              <input
                value={form.title}
                onChange={(event) => {
                  const value = event.target.value;
                  setField("title", value);
                  if (!slugTouched) setField("slug", normalizeSlug(value));
                }}
                placeholder="مثلاً تحلیل روند قیمت پسته اکبری در هفته جاری"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500"
              />
            </label>

            <label className="block">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-slate-700">اسلاگ *</span>
                <span className="text-xs text-slate-400" dir="ltr">
                  /articles/{normalizeSlug(form.slug) || "analysis-slug"}
                </span>
              </div>
              <input
                dir="ltr"
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setField("slug", event.target.value);
                }}
                onBlur={() => setField("slug", normalizeSlug(form.slug))}
                placeholder="weekly-pistachio-market-analysis"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left outline-none focus:border-emerald-500"
              />
            </label>

            <label className="block">
              <div className="flex justify-between gap-3">
                <span className="text-sm font-bold text-slate-700">خلاصه تحلیل *</span>
                <span className="text-xs text-slate-400">{form.excerpt.length} نویسه</span>
              </div>
              <textarea
                value={form.excerpt}
                onChange={(event) => setField("excerpt", event.target.value)}
                rows={4}
                placeholder="خلاصه‌ای روشن از نتیجه، عوامل اثرگذار و جهت احتمالی بازار بنویس..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 leading-8 outline-none focus:border-emerald-500"
              />
            </label>

            <label className="block">
              <div className="flex justify-between gap-3">
                <span className="text-sm font-bold text-slate-700">متن کامل تحلیل *</span>
                <span className="text-xs text-slate-400">{form.content.length} نویسه</span>
              </div>
              <textarea
                value={form.content}
                onChange={(event) => setField("content", event.target.value)}
                rows={15}
                placeholder="مقدمه، وضعیت عرضه و تقاضا، اثر نرخ ارز، وضعیت صادرات، جمع‌بندی و سناریوهای محتمل را در پاراگراف‌های جدا بنویس..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 leading-9 outline-none focus:border-emerald-500"
              />
              <p className="mt-2 text-xs text-slate-400 leading-6">
                برای جداسازی پاراگراف‌ها یک خط خالی بگذار. متن در صفحه عمومی به همان ترتیب نمایش داده می‌شود.
              </p>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">آدرس تصویر شاخص</span>
              <input
                dir="ltr"
                value={form.cover_image}
                onChange={(event) => setField("cover_image", event.target.value)}
                placeholder="https://..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left outline-none focus:border-emerald-500"
              />
              {form.cover_image && /^https?:\/\//i.test(form.cover_image) && (
                <img
                  src={form.cover_image}
                  alt="پیش‌نمایش تصویر شاخص"
                  className="mt-3 w-full h-56 object-cover rounded-2xl border border-slate-200"
                />
              )}
            </label>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5 space-y-4">
              <div>
                <p className="font-black text-slate-900">تنظیمات سئو</p>
                <p className="text-xs text-slate-500 mt-1">
                  در صورت خالی‌بودن، عنوان و خلاصه اصلی استفاده می‌شوند.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="block">
                  <div className="flex justify-between gap-2">
                    <span className="text-sm font-bold text-slate-700">عنوان سئو</span>
                    <span
                      className={`text-xs ${
                        form.meta_title.length > 70
                          ? "text-rose-600"
                          : "text-slate-400"
                      }`}
                    >
                      {form.meta_title.length}/70
                    </span>
                  </div>
                  <input
                    value={form.meta_title}
                    onChange={(event) => setField("meta_title", event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Canonical URL</span>
                  <input
                    dir="ltr"
                    value={form.canonical_url}
                    onChange={(event) =>
                      setField("canonical_url", event.target.value)
                    }
                    placeholder="https://www.pesteonline.com/articles/..."
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left outline-none focus:border-emerald-500"
                  />
                </label>
              </div>
              <label className="block">
                <div className="flex justify-between gap-2">
                  <span className="text-sm font-bold text-slate-700">توضیحات سئو</span>
                  <span
                    className={`text-xs ${
                      form.meta_description.length > 170
                        ? "text-rose-600"
                        : "text-slate-400"
                    }`}
                  >
                    {form.meta_description.length}/170
                  </span>
                </div>
                <textarea
                  value={form.meta_description}
                  onChange={(event) =>
                    setField("meta_description", event.target.value)
                  }
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 leading-7 outline-none focus:border-emerald-500"
                />
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_indexable}
                  onChange={(event) =>
                    setField("is_indexable", event.target.checked)
                  }
                  className="w-4 h-4 accent-emerald-600"
                />
                <span className="text-sm font-bold text-slate-700">
                  اجازه ایندکس‌شدن این تحلیل در موتورهای جست‌وجو
                </span>
              </label>
            </div>
          </div>

          <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white/95 backdrop-blur px-5 md:px-7 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-xs text-slate-500">
              وضعیت فعلی: {form.status === "published" ? "منتشرشده" : "پیش‌نویس"}
              {form.published_at
                ? ` · ${formatPersianDate(form.published_at)}`
                : ""}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => void saveAnalysis("draft")}
                disabled={saving || deleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold hover:bg-slate-50 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}
                ذخیره پیش‌نویس
              </button>
              <button
                onClick={() => void saveAnalysis("published")}
                disabled={saving || deleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Send size={17} />
                )}
                انتشار تحلیل
              </button>
            </div>
          </div>
        </section>

        <aside className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden xl:sticky xl:top-6">
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-black text-lg">آرشیو تحلیل‌ها</h2>
                <p className="text-xs text-slate-500 mt-1">
                  {filtered.length} مورد نمایش داده می‌شود
                </p>
              </div>
              <button
                onClick={() => void fetchAnalyses()}
                disabled={loading}
                className="rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50 disabled:opacity-50"
                aria-label="بارگذاری دوباره"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="relative mt-4">
              <Search
                size={17}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="جست‌وجو در عنوان یا اسلاگ..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pr-10 pl-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3">
              {(
                [
                  ["all", "همه"],
                  ["published", "منتشرشده"],
                  ["draft", "پیش‌نویس"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={`rounded-xl px-2 py-2 text-xs font-bold transition ${
                    statusFilter === value
                      ? "bg-slate-950 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[calc(100vh-310px)] overflow-y-auto p-3">
            {loading ? (
              <div className="py-16 grid place-items-center text-slate-500">
                <Loader2 size={24} className="animate-spin" />
                <span className="mt-3 text-sm">در حال دریافت تحلیل‌ها...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center px-5">
                <FileBarChart size={34} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-600">
                  تحلیلی پیدا نشد
                </p>
                <p className="mt-2 text-xs text-slate-400 leading-6">
                  تحلیل جدید بساز یا فیلترهای جست‌وجو را تغییر بده.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((analysis) => (
                  <button
                    key={analysis.id}
                    onClick={() => selectAnalysis(analysis)}
                    className={`w-full rounded-2xl border p-4 text-right transition hover:border-emerald-300 hover:bg-emerald-50/40 ${
                      form.id === analysis.id
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-sm text-slate-900 leading-6 line-clamp-2">
                          {analysis.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-400 truncate" dir="ltr">
                          {analysis.slug}
                        </p>
                      </div>
                      <Pencil size={16} className="shrink-0 text-slate-400 mt-1" />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          analysis.status === "published"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {analysis.status === "published"
                          ? "منتشرشده"
                          : "پیش‌نویس"}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatPersianDate(analysis.updated_at)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-white border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-2 text-sm font-bold">
                <CheckCircle2 size={18} className="text-emerald-600" /> پیش‌نمایش تحلیل بازار
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                className="rounded-xl p-2 hover:bg-slate-100"
                aria-label="بستن پیش‌نمایش"
              >
                <X size={20} />
              </button>
            </div>
            {form.cover_image && /^https?:\/\//i.test(form.cover_image) && (
              <img
                src={form.cover_image}
                alt={form.title}
                className="w-full h-72 object-cover"
              />
            )}
            <article className="p-6 md:p-10" dir="rtl">
              <span className="inline-flex rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-bold">
                تحلیل بازار
              </span>
              <h1 className="mt-4 text-2xl md:text-4xl font-black leading-[1.45] text-slate-950">
                {form.title || "عنوان تحلیل بازار"}
              </h1>
              <p className="mt-4 text-base text-slate-500 leading-8">
                {form.excerpt || "خلاصه تحلیل در این قسمت نمایش داده می‌شود."}
              </p>
              <div className="mt-8 border-t border-slate-200 pt-7 space-y-5 text-slate-700 leading-9">
                {(form.content || "متن تحلیل در این قسمت نمایش داده می‌شود.")
                  .split(/\n\s*\n/)
                  .map((paragraph, index) => (
                    <p key={index} className="whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
              </div>
            </article>
          </div>
        </div>
      )}
    </div>
  );
}
