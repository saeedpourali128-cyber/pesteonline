import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  FileText,
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
  articleTypeLabel,
  formatPersianDate,
  type ArticleContentType,
  type ArticleRecord,
  type ArticleStatus,
} from "@/lib/articles";

type Notice = {
  kind: "success" | "error" | "info";
  text: string;
} | null;

type ArticleForm = {
  id: number | null;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  content_type: ArticleContentType;
  status: ArticleStatus;
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  is_indexable: boolean;
  published_at: string | null;
};

const EMPTY_FORM: ArticleForm = {
  id: null,
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: "",
  content_type: "news",
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

function rowToForm(article: ArticleRecord): ArticleForm {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? "",
    content: article.content ?? "",
    cover_image: article.cover_image ?? "",
    content_type: article.content_type,
    status: article.status,
    meta_title: article.meta_title ?? "",
    meta_description: article.meta_description ?? "",
    canonical_url: article.canonical_url ?? "",
    is_indexable: article.is_indexable,
    published_at: article.published_at,
  };
}

export default function AdminArticles() {
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [form, setForm] = useState<ArticleForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ArticleStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | ArticleContentType>("all");
  const [notice, setNotice] = useState<Notice>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setNotice(null);

    const { data, error } = await supabase
      .from("admin_articles")
      .select(ARTICLE_SELECT)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error(error);
      setNotice({
        kind: "error",
        text: `دریافت مقالات انجام نشد: ${error.message}`,
      });
      setArticles([]);
    } else {
      setArticles((data ?? []) as ArticleRecord[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchArticles();
  }, [fetchArticles]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return articles.filter((article) => {
      const matchesQuery =
        !query ||
        `${article.title} ${article.slug} ${article.excerpt ?? ""}`
          .toLowerCase()
          .includes(query);
      const matchesStatus =
        statusFilter === "all" || article.status === statusFilter;
      const matchesType =
        typeFilter === "all" || article.content_type === typeFilter;
      return matchesQuery && matchesStatus && matchesType;
    });
  }, [articles, search, statusFilter, typeFilter]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setNotice(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectArticle = (article: ArticleRecord) => {
    setForm(rowToForm(article));
    setSlugTouched(true);
    setNotice(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setField = <K extends keyof ArticleForm>(key: K, value: ArticleForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validate = (nextStatus: ArticleStatus) => {
    if (!form.title.trim()) return "عنوان مقاله را وارد کن.";
    if (!normalizeSlug(form.slug)) return "اسلاگ معتبر وارد کن.";
    if (nextStatus === "published" && !form.excerpt.trim())
      return "برای انتشار، خلاصه مقاله را وارد کن.";
    if (nextStatus === "published" && !form.content.trim())
      return "برای انتشار، متن کامل مقاله را وارد کن.";
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

  const saveArticle = async (nextStatus: ArticleStatus) => {
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
      content_type: form.content_type,
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
      const duplicate = error.code === "23505";
      setNotice({
        kind: "error",
        text: duplicate
          ? "این اسلاگ قبلاً استفاده شده است. یک اسلاگ دیگر وارد کن."
          : `ذخیره مقاله انجام نشد: ${error.message}`,
      });
      setSaving(false);
      return;
    }

    const saved = data as ArticleRecord;
    setArticles((current) => {
      const withoutSaved = current.filter((item) => item.id !== saved.id);
      return [saved, ...withoutSaved];
    });
    setForm(rowToForm(saved));
    setSlugTouched(true);
    setNotice({
      kind: "success",
      text:
        nextStatus === "published"
          ? "مقاله با موفقیت منتشر شد و در سایت قابل مشاهده است."
          : "پیش‌نویس با موفقیت ذخیره شد.",
    });
    setSaving(false);
  };

  const deleteArticle = async () => {
    if (!form.id) return;
    if (!window.confirm(`مقاله «${form.title}» حذف شود؟ این کار قابل بازگشت نیست.`))
      return;

    setDeleting(true);
    setNotice(null);

    const { error } = await supabase
      .from("admin_articles")
      .delete()
      .eq("id", form.id);

    if (error) {
      console.error(error);
      setNotice({ kind: "error", text: `حذف انجام نشد: ${error.message}` });
      setDeleting(false);
      return;
    }

    setArticles((current) => current.filter((item) => item.id !== form.id));
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setNotice({ kind: "success", text: "مقاله حذف شد." });
    setDeleting(false);
  };

  const noticeClass =
    notice?.kind === "error"
      ? "bg-rose-50 border-rose-200 text-rose-800"
      : notice?.kind === "success"
        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
        : "bg-sky-50 border-sky-200 text-sky-800";

  return (
    <div className="p-4 md:p-8 xl:p-10">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">
        <div>
          <p className="text-sm font-bold text-emerald-600">مدیریت محتوا</p>
          <h1 className="text-2xl md:text-3xl font-black mt-1">مقالات و اخبار</h1>
          <p className="text-sm text-slate-500 mt-2">
            ساخت، ویرایش، پیش‌نمایش و انتشار مستقیم محتوای سایت
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void fetchArticles()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold hover:bg-slate-50"
          >
            <RefreshCw size={17} /> تازه‌سازی
          </button>
          <button
            onClick={resetForm}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
          >
            <Plus size={17} /> محتوای جدید
          </button>
        </div>
      </header>

      {notice && (
        <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${noticeClass}`}>
          {notice.text}
        </div>
      )}

      <div className="grid xl:grid-cols-[390px_minmax(0,1fr)] gap-6 items-start">
        <aside className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden xl:sticky xl:top-6">
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="relative">
              <Search
                size={17}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="جست‌وجوی عنوان یا اسلاگ"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as "all" | ArticleStatus)
                }
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="draft">پیش‌نویس</option>
                <option value="published">منتشرشده</option>
              </select>
              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value as "all" | ArticleContentType)
                }
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
              >
                <option value="all">همه انواع</option>
                <option value="news">خبر</option>
                <option value="article">مقاله</option>
                <option value="analysis">تحلیل</option>
              </select>
            </div>
          </div>

          <div className="max-h-[65vh] overflow-y-auto p-2">
            {loading ? (
              <div className="py-12 flex items-center justify-center gap-2 text-sm text-slate-500">
                <Loader2 size={18} className="animate-spin" /> در حال دریافت محتوا...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                هنوز محتوایی ثبت نشده است.
              </div>
            ) : (
              filtered.map((article) => (
                <button
                  key={article.id}
                  onClick={() => selectArticle(article)}
                  className={`w-full text-right rounded-2xl p-3.5 mb-1.5 border transition ${
                    form.id === article.id
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 line-clamp-2">
                        {article.title}
                      </h3>
                      <p dir="ltr" className="text-xs text-slate-400 mt-1 truncate text-left">
                        /articles/{article.slug}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${
                        article.status === "published"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {article.status === "published" ? "منتشرشده" : "پیش‌نویس"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{articleTypeLabel(article.content_type)}</span>
                    <span>{formatPersianDate(article.updated_at)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-5 md:px-7 py-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center">
                {form.id ? <Pencil size={19} /> : <FileText size={19} />}
              </div>
              <div>
                <h2 className="font-black">
                  {form.id ? "ویرایش محتوا" : "محتوای جدید"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {form.id ? `شناسه ${form.id}` : "اطلاعات را کامل و سپس ذخیره یا منتشر کن"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewOpen(true)}
                disabled={!form.title.trim()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-bold hover:bg-slate-50 disabled:opacity-40"
              >
                <Eye size={16} /> پیش‌نمایش
              </button>
              {form.id && (
                <button
                  onClick={() => void deleteArticle()}
                  disabled={deleting || saving}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-sm font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                >
                  <Trash2 size={16} /> حذف
                </button>
              )}
            </div>
          </div>

          <div className="p-5 md:p-7 space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">عنوان *</span>
                <input
                  value={form.title}
                  onChange={(event) => {
                    const title = event.target.value;
                    setForm((current) => ({
                      ...current,
                      title,
                      slug: slugTouched ? current.slug : normalizeSlug(title),
                    }));
                  }}
                  placeholder="مثلاً چشم‌انداز قیمت پسته در هفته آینده"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">نوع محتوا</span>
                <select
                  value={form.content_type}
                  onChange={(event) =>
                    setField("content_type", event.target.value as ArticleContentType)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500"
                >
                  <option value="news">خبر</option>
                  <option value="article">مقاله آموزشی</option>
                  <option value="analysis">تحلیل بازار</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">اسلاگ *</span>
              <div className="mt-2 flex rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:border-emerald-500">
                <span dir="ltr" className="px-3 py-3 text-xs text-slate-400 bg-slate-100 border-l border-slate-200">
                  /articles/
                </span>
                <input
                  dir="ltr"
                  value={form.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setField("slug", normalizeSlug(event.target.value));
                  }}
                  placeholder="pistachio-market-outlook"
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-left outline-none"
                />
              </div>
            </label>

            <label className="block">
              <div className="flex justify-between gap-3">
                <span className="text-sm font-bold text-slate-700">خلاصه *</span>
                <span className="text-xs text-slate-400">{form.excerpt.length} نویسه</span>
              </div>
              <textarea
                value={form.excerpt}
                onChange={(event) => setField("excerpt", event.target.value)}
                rows={3}
                placeholder="خلاصه‌ای کوتاه و جذاب برای کارت مقاله و نتایج جست‌وجو"
                className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 leading-7 outline-none focus:border-emerald-500"
              />
            </label>

            <label className="block">
              <div className="flex justify-between gap-3">
                <span className="text-sm font-bold text-slate-700">متن کامل *</span>
                <span className="text-xs text-slate-400">{form.content.length} نویسه</span>
              </div>
              <textarea
                value={form.content}
                onChange={(event) => setField("content", event.target.value)}
                rows={14}
                placeholder="متن مقاله را بنویس. برای ساخت پاراگراف جدید یک خط خالی بگذار."
                className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 leading-8 outline-none focus:border-emerald-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">آدرس تصویر شاخص</span>
              <input
                dir="ltr"
                value={form.cover_image}
                onChange={(event) => setField("cover_image", event.target.value)}
                placeholder="https://..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left outline-none focus:border-emerald-500"
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
                  <div className="flex justify-between">
                    <span className="text-sm font-bold text-slate-700">عنوان سئو</span>
                    <span className={`text-xs ${form.meta_title.length > 70 ? "text-rose-600" : "text-slate-400"}`}>
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
                    onChange={(event) => setField("canonical_url", event.target.value)}
                    placeholder="https://www.pesteonline.com/articles/..."
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left outline-none focus:border-emerald-500"
                  />
                </label>
              </div>
              <label className="block">
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-slate-700">توضیحات سئو</span>
                  <span className={`text-xs ${form.meta_description.length > 170 ? "text-rose-600" : "text-slate-400"}`}>
                    {form.meta_description.length}/170
                  </span>
                </div>
                <textarea
                  value={form.meta_description}
                  onChange={(event) => setField("meta_description", event.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 leading-7 outline-none focus:border-emerald-500"
                />
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_indexable}
                  onChange={(event) => setField("is_indexable", event.target.checked)}
                  className="w-4 h-4 accent-emerald-600"
                />
                <span className="text-sm font-bold text-slate-700">
                  اجازه ایندکس‌شدن این صفحه در موتورهای جست‌وجو
                </span>
              </label>
            </div>
          </div>

          <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white/95 backdrop-blur px-5 md:px-7 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-xs text-slate-500">
              وضعیت فعلی: {form.status === "published" ? "منتشرشده" : "پیش‌نویس"}
              {form.published_at ? ` · ${formatPersianDate(form.published_at)}` : ""}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => void saveArticle("draft")}
                disabled={saving || deleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold hover:bg-slate-50 disabled:opacity-50"
              >
                {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                ذخیره پیش‌نویس
              </button>
              <button
                onClick={() => void saveArticle("published")}
                disabled={saving || deleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                انتشار در سایت
              </button>
            </div>
          </div>
        </section>
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-white border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-2 text-sm font-bold">
                <CheckCircle2 size={18} className="text-emerald-600" /> پیش‌نمایش محتوا
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
              <img src={form.cover_image} alt={form.title} className="w-full h-72 object-cover" />
            )}
            <article className="p-6 md:p-10" dir="rtl">
              <span className="inline-flex rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-bold">
                {articleTypeLabel(form.content_type)}
              </span>
              <h1 className="mt-4 text-2xl md:text-4xl font-black leading-[1.45] text-slate-950">
                {form.title || "عنوان مقاله"}
              </h1>
              <p className="mt-4 text-base text-slate-500 leading-8">
                {form.excerpt || "خلاصه مقاله در این قسمت نمایش داده می‌شود."}
              </p>
              <div className="mt-8 border-t border-slate-200 pt-7 space-y-5 text-slate-700 leading-9">
                {(form.content || "متن مقاله در این قسمت نمایش داده می‌شود.")
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
