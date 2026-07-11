import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  History,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { PistachioPrice } from "../types";

const DEFAULT_SOURCE = "میانگین بازار ایران";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("fa-IR").format(value || 0);

const getLocalIsoDate = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
};

type Notice = {
  kind: "success" | "error" | "info";
  text: string;
} | null;

export default function AdminPrices() {
  const [prices, setPrices] = useState<PistachioPrice[]>([]);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [sources, setSources] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({
    variety: "",
    size: "",
    price: "",
    source: DEFAULT_SOURCE,
    isVisible: true,
  });

  const applyRows = useCallback((rows: PistachioPrice[]) => {
    const list = [...rows].sort((a, b) => a.sort_order - b.sort_order);
    setPrices(list);
    setDrafts(
      Object.fromEntries(list.map((price) => [price.id, String(price.today_price)])),
    );
    setSources(
      Object.fromEntries(
        list.map((price) => [price.id, price.source || DEFAULT_SOURCE]),
      ),
    );
  }, []);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    setNotice(null);

    const { data, error } = await supabase
      .from("pistachio_prices")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error(error);
      setPrices([]);
      setDrafts({});
      setSources({});
      setNotice({
        kind: "error",
        text: `دریافت قیمت‌ها ناموفق بود: ${error.message}`,
      });
    } else {
      applyRows((data ?? []) as PistachioPrice[]);
    }

    setLoading(false);
  }, [applyRows]);

  useEffect(() => {
    void fetchPrices();
  }, [fetchPrices]);

  const filtered = useMemo(
    () =>
      prices.filter((price) =>
        `${price.variety} ${price.size}`.includes(search.trim()),
      ),
    [prices, search],
  );

  const changedCount = prices.filter(
    (price) =>
      Number(drafts[price.id]) !== price.today_price ||
      (sources[price.id] || "") !== (price.source || DEFAULT_SOURCE),
  ).length;

  const toggleVisibility = async (price: PistachioPrice) => {
    setNotice(null);

    const { error } = await supabase
      .from("pistachio_prices")
      .update({ is_visible: !price.is_visible })
      .eq("id", price.id);

    if (error) {
      console.error(error);
      setNotice({
        kind: "error",
        text: `تغییر وضعیت نمایش انجام نشد: ${error.message}`,
      });
      return;
    }

    setPrices((current) =>
      current.map((item) =>
        item.id === price.id
          ? { ...item, is_visible: !item.is_visible }
          : item,
      ),
    );
  };

  const validatePublication = () => {
    if (!prices.length) return "هنوز محصولی برای انتشار وجود ندارد.";

    for (const price of prices) {
      const rawPrice = drafts[price.id]?.trim() ?? "";
      const source = (sources[price.id] || DEFAULT_SOURCE).trim();

      if (!/^\d+$/.test(rawPrice)) {
        return `قیمت «${price.variety}» باید یک عدد صحیح و غیرمنفی باشد.`;
      }

      if (!source) {
        return `منبع استعلام «${price.variety}» نمی‌تواند خالی باشد.`;
      }

      if (source.length > 200) {
        return `منبع استعلام «${price.variety}» نباید بیشتر از ۲۰۰ نویسه باشد.`;
      }
    }

    return null;
  };

  const publish = async () => {
    const validationError = validatePublication();
    if (validationError) {
      setNotice({ kind: "error", text: validationError });
      return;
    }

    setSaving(true);
    setNotice(null);

    const items = prices.map((price) => ({
      product_id: price.id,
      price: Number(drafts[price.id]),
      source: (sources[price.id] || DEFAULT_SOURCE).trim(),
      is_visible: price.is_visible,
      sort_order: price.sort_order,
    }));

    const { data, error } = await supabase.rpc("publish_pistachio_prices", {
      p_items: items,
      p_price_date: getLocalIsoDate(),
    });

    if (error) {
      console.error(error);
      setNotice({
        kind: "error",
        text: `انتشار انجام نشد و هیچ تغییر ناقصی ثبت نشد: ${error.message}`,
      });
      setSaving(false);
      return;
    }

    applyRows((data ?? []) as PistachioPrice[]);
    setPreview(false);
    setNotice({
      kind: "success",
      text: "همه قیمت‌ها به‌صورت یکجا منتشر و تاریخچه امروز ثبت شد.",
    });
    setSaving(false);
  };

  const confirmUnchanged = () => {
    setDrafts(
      Object.fromEntries(
        prices.map((price) => [price.id, String(price.today_price)]),
      ),
    );
    setNotice({
      kind: "info",
      text: "قیمت‌های فعلی برای ثبت امروز آماده‌اند. برای ثبت تاریخچه روی «انتشار قیمت‌ها» بزنید.",
    });
  };

  const createProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);

    const price = newProduct.price.trim();
    const variety = newProduct.variety.trim();
    const size = newProduct.size.trim();
    const source = newProduct.source.trim() || DEFAULT_SOURCE;

    if (!variety || !size) {
      setNotice({
        kind: "error",
        text: "نام محصول و سایز را کامل وارد کن.",
      });
      return;
    }

    if (!/^\d+$/.test(price)) {
      setNotice({
        kind: "error",
        text: "قیمت محصول باید یک عدد صحیح و غیرمنفی باشد.",
      });
      return;
    }

    if (source.length > 200) {
      setNotice({
        kind: "error",
        text: "منبع استعلام نباید بیشتر از ۲۰۰ نویسه باشد.",
      });
      return;
    }

    setAdding(true);

    const { data, error } = await supabase.rpc("create_pistachio_product", {
      p_variety: variety,
      p_size: size,
      p_price: Number(price),
      p_source: source,
      p_is_visible: newProduct.isVisible,
      p_sort_order: null,
    });

    if (error) {
      console.error(error);
      setNotice({
        kind: "error",
        text: `محصول ساخته نشد: ${error.message}`,
      });
      setAdding(false);
      return;
    }

    const created = (Array.isArray(data) ? data[0] : data) as PistachioPrice | null;
    if (!created) {
      setNotice({
        kind: "error",
        text: "محصول ساخته شد اما پاسخ معتبر از سرور دریافت نشد. صفحه را تازه‌سازی کن.",
      });
      setAdding(false);
      return;
    }

    applyRows([...prices, created]);
    setNewProduct({
      variety: "",
      size: "",
      price: "",
      source: DEFAULT_SOURCE,
      isVisible: true,
    });
    setAddOpen(false);
    setAdding(false);
    setNotice({
      kind: "success",
      text: "محصول جدید با موفقیت ساخته و قیمت اولیه آن در تاریخچه ثبت شد.",
    });
  };

  if (loading) {
    return <div className="p-10">در حال دریافت قیمت‌ها...</div>;
  }

  const noticeClass =
    notice?.kind === "error"
      ? "bg-rose-50 border-rose-200 text-rose-800"
      : notice?.kind === "success"
        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
        : "bg-sky-50 border-sky-200 text-sky-800";

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-emerald-700 font-bold">مدیریت روزانه بازار</p>
          <h1 className="text-2xl md:text-3xl font-black mt-1">قیمت‌های روز پسته</h1>
          <p className="text-slate-500 text-sm mt-2">
            قیمت جدید را وارد کن، پیش‌نمایش بگیر و سپس همه قیمت‌ها را یک‌جا منتشر کن.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={confirmUnchanged}
            className="rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm font-bold flex items-center gap-2"
          >
            <CheckCircle2 size={18} /> تأیید بدون تغییر
          </button>
          <button
            onClick={() => setPreview(true)}
            disabled={!prices.length}
            className="rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm font-bold flex items-center gap-2 disabled:opacity-50"
          >
            <Eye size={18} /> پیش‌نمایش
          </button>
          <button
            onClick={() => void publish()}
            disabled={saving || !prices.length}
            className="rounded-xl bg-emerald-600 text-white px-5 py-3 text-sm font-black flex items-center gap-2 disabled:opacity-60"
          >
            <Send size={18} /> {saving ? "در حال انتشار..." : "انتشار قیمت‌ها"}
          </button>
        </div>
      </header>

      {notice && (
        <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${noticeClass}`}>
          {notice.text}
        </div>
      )}

      <section className="grid sm:grid-cols-3 gap-4 mb-5">
        <div className="rounded-2xl bg-slate-950 text-white p-5">
          <p className="text-xs text-slate-400">تعداد محصولات</p>
          <p className="text-3xl font-black mt-2">
            {prices.length.toLocaleString("fa-IR")}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <p className="text-xs text-slate-500">تغییرات آماده انتشار</p>
          <p className="text-3xl font-black mt-2 text-violet-700">
            {changedCount.toLocaleString("fa-IR")}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <p className="text-xs text-slate-500">آخرین بروزرسانی</p>
          <p className="text-lg font-black mt-2">
            امروز،{" "}
            {new Date().toLocaleTimeString("fa-IR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </section>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute right-3 top-3 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جستجو در محصولات..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pr-10 pl-4 py-2.5 outline-none focus:border-emerald-500"
            />
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <History size={16} /> هر انتشار یک رکورد روزانه برای نمودار تاریخی می‌سازد.
          </div>
        </div>

        {prices.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-right p-4">محصول</th>
                  <th className="text-right p-4">سایز</th>
                  <th className="text-right p-4">قیمت فعلی</th>
                  <th className="text-right p-4">قیمت جدید</th>
                  <th className="text-right p-4">تغییر</th>
                  <th className="text-right p-4">منبع استعلام</th>
                  <th className="text-center p-4">نمایش</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((price) => {
                  const next = Number(drafts[price.id] || 0);
                  const change = next - price.today_price;

                  return (
                    <tr
                      key={price.id}
                      className="border-t border-slate-100 hover:bg-slate-50/70"
                    >
                      <td className="p-4 font-black">{price.variety}</td>
                      <td className="p-4 text-slate-500">{price.size}</td>
                      <td className="p-4 font-bold">
                        {formatPrice(price.today_price)}{" "}
                        <span className="text-xs text-slate-400">تومان</span>
                      </td>
                      <td className="p-3">
                        <input
                          inputMode="numeric"
                          dir="ltr"
                          value={drafts[price.id] || ""}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [price.id]: event.target.value.replace(/[^0-9]/g, ""),
                            }))
                          }
                          className="w-44 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left font-black outline-none focus:border-emerald-500"
                        />
                      </td>
                      <td
                        className={`p-4 font-bold ${
                          change > 0
                            ? "text-emerald-600"
                            : change < 0
                              ? "text-rose-600"
                              : "text-slate-400"
                        }`}
                      >
                        {change === 0
                          ? "بدون تغییر"
                          : `${change > 0 ? "+" : ""}${formatPrice(change)}`}
                      </td>
                      <td className="p-3">
                        <input
                          value={sources[price.id] || ""}
                          onChange={(event) =>
                            setSources((current) => ({
                              ...current,
                              [price.id]: event.target.value,
                            }))
                          }
                          className="w-48 rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-emerald-500"
                        />
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => void toggleVisibility(price)}
                          className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${
                            price.is_visible
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {price.is_visible ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="font-black text-lg">هنوز محصولی ثبت نشده است.</p>
            <p className="text-sm text-slate-500 mt-2">
              اولین محصول را از دکمه «افزودن محصول جدید» بساز.
            </p>
          </div>
        )}

        <div className="p-4 border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={() => setAddOpen(true)}
            className="text-sm font-bold text-emerald-700 flex items-center gap-2"
          >
            <Plus size={18} /> افزودن محصول جدید
          </button>
          <button
            onClick={() => void fetchPrices()}
            className="text-sm text-slate-500 flex items-center gap-2"
          >
            <RefreshCw size={16} /> تازه‌سازی
          </button>
        </div>
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 p-4 flex items-center justify-center"
          onClick={() => setPreview(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-5xl max-h-[90vh] overflow-auto rounded-3xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 p-5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black">پیش‌نمایش قیمت‌های امروز</h2>
                <p className="text-sm text-slate-500 mt-1">
                  نمایی نزدیک به جدول سایت قبل از انتشار
                </p>
              </div>
              <button
                onClick={() => setPreview(false)}
                className="w-10 h-10 rounded-xl bg-slate-100 grid place-items-center"
              >
                <X />
              </button>
            </div>
            <div className="p-5">
              <div className="rounded-2xl overflow-hidden border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-emerald-700 text-white">
                    <tr>
                      <th className="p-4 text-right">محصول</th>
                      <th className="p-4 text-right">سایز</th>
                      <th className="p-4 text-right">قیمت امروز</th>
                      <th className="p-4 text-right">منبع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices
                      .filter((price) => price.is_visible)
                      .map((price) => (
                        <tr key={price.id} className="border-t border-slate-100">
                          <td className="p-4 font-black">{price.variety}</td>
                          <td className="p-4">{price.size}</td>
                          <td className="p-4 text-lg font-black">
                            {formatPrice(Number(drafts[price.id]))} تومان
                          </td>
                          <td className="p-4 text-slate-500">
                            {sources[price.id]}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => setPreview(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 font-bold"
                >
                  بازگشت به ویرایش
                </button>
                <button
                  onClick={() => void publish()}
                  disabled={saving}
                  className="rounded-xl bg-emerald-600 text-white px-5 py-3 font-black flex items-center gap-2 disabled:opacity-60"
                >
                  <Save size={18} /> {saving ? "در حال انتشار..." : "تأیید و انتشار"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {addOpen && (
        <div
          className="fixed inset-0 z-[110] bg-black/50 p-4 flex items-center justify-center"
          onClick={() => setAddOpen(false)}
        >
          <form
            onSubmit={(event) => void createProduct(event)}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-white shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black">افزودن محصول جدید</h2>
                <p className="text-sm text-slate-500 mt-1">
                  قیمت اولیه محصول هم‌زمان در تاریخچه ثبت می‌شود.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="w-10 h-10 rounded-xl bg-slate-100 grid place-items-center"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold">نام محصول</span>
                <input
                  required
                  value={newProduct.variety}
                  onChange={(event) =>
                    setNewProduct((current) => ({
                      ...current,
                      variety: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                  placeholder="مثلاً پسته اکبری"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold">سایز</span>
                <input
                  required
                  value={newProduct.size}
                  onChange={(event) =>
                    setNewProduct((current) => ({
                      ...current,
                      size: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                  placeholder="مثلاً ۲۸-۳۰"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold">قیمت اولیه (تومان)</span>
                <input
                  required
                  dir="ltr"
                  inputMode="numeric"
                  value={newProduct.price}
                  onChange={(event) =>
                    setNewProduct((current) => ({
                      ...current,
                      price: event.target.value.replace(/[^0-9]/g, ""),
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-left font-black outline-none focus:border-emerald-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold">منبع استعلام</span>
                <input
                  required
                  value={newProduct.source}
                  onChange={(event) =>
                    setNewProduct((current) => ({
                      ...current,
                      source: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                />
              </label>

              <label className="flex items-center gap-3 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={newProduct.isVisible}
                  onChange={(event) =>
                    setNewProduct((current) => ({
                      ...current,
                      isVisible: event.target.checked,
                    }))
                  }
                  className="w-5 h-5 accent-emerald-600"
                />
                محصول بلافاصله در سایت نمایش داده شود
              </label>
            </div>

            <button
              disabled={adding}
              className="mt-6 w-full rounded-xl bg-emerald-600 text-white py-3 font-black disabled:opacity-60"
            >
              {adding ? "در حال ساخت محصول..." : "ساخت محصول"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
