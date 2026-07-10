import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, EyeOff, History, Plus, RefreshCw, Save, Search, Send, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { PistachioPrice } from "../types";

const demoPrices: PistachioPrice[] = [
  { id: 1, variety: "پسته اکبری", size: "۲۸-۳۰", today_price: 1850000, yesterday_price: 1820000, weekly_change: 30000, weekly_change_percent: 1.65, trend: "up", is_visible: true, sort_order: 1, source: "میانگین بازار ایران", updated_at: new Date().toISOString() },
  { id: 2, variety: "پسته احمد آقایی", size: "۲۸-۳۰", today_price: 1720000, yesterday_price: 1720000, weekly_change: 0, weekly_change_percent: 0, trend: "flat", is_visible: true, sort_order: 2, source: "میانگین بازار ایران", updated_at: new Date().toISOString() },
  { id: 3, variety: "پسته فندقی", size: "۳۰-۳۲", today_price: 1380000, yesterday_price: 1360000, weekly_change: 20000, weekly_change_percent: 1.47, trend: "up", is_visible: true, sort_order: 3, source: "میانگین بازار ایران", updated_at: new Date().toISOString() },
  { id: 4, variety: "پسته کله قوچی", size: "۲۸-۳۰", today_price: 1950000, yesterday_price: 1970000, weekly_change: -20000, weekly_change_percent: -1.02, trend: "down", is_visible: true, sort_order: 4, source: "میانگین بازار ایران", updated_at: new Date().toISOString() },
  { id: 5, variety: "مغز پسته درجه یک", size: "—", today_price: 2800000, yesterday_price: 2780000, weekly_change: 20000, weekly_change_percent: 0.72, trend: "up", is_visible: true, sort_order: 5, source: "میانگین بازار ایران", updated_at: new Date().toISOString() },
];

const formatPrice = (value: number) => new Intl.NumberFormat("fa-IR").format(value || 0);

export default function AdminPrices() {
  const [prices, setPrices] = useState<PistachioPrice[]>([]);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [sources, setSources] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [usingDemo, setUsingDemo] = useState(false);

  const fetchPrices = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("pistachio_prices").select("*").order("sort_order", { ascending: true });
    const list = !error && data?.length ? (data as PistachioPrice[]) : demoPrices;
    setUsingDemo(Boolean(error || !data?.length));
    setPrices(list);
    setDrafts(Object.fromEntries(list.map((p) => [p.id, String(p.today_price)])));
    setSources(Object.fromEntries(list.map((p) => [p.id, p.source || "میانگین بازار ایران"])));
    setLoading(false);
  };

  useEffect(() => { fetchPrices(); }, []);

  const filtered = useMemo(() => prices.filter((p) => `${p.variety} ${p.size}`.includes(search.trim())), [prices, search]);
  const changedCount = prices.filter((p) => Number(drafts[p.id]) !== p.today_price || (sources[p.id] || "") !== (p.source || "میانگین بازار ایران")).length;

  const toggleVisibility = async (price: PistachioPrice) => {
    if (usingDemo) {
      setPrices((prev) => prev.map((p) => p.id === price.id ? { ...p, is_visible: !p.is_visible } : p));
      return;
    }
    await supabase.from("pistachio_prices").update({ is_visible: !price.is_visible }).eq("id", price.id);
    fetchPrices();
  };

  const publish = async () => {
    setSaving(true);
    setNotice("");
    const publishedAt = new Date().toISOString();
    const next = prices.map((price) => {
      const newPrice = Number(drafts[price.id] || price.today_price);
      const change = newPrice - price.today_price;
      const percent = price.today_price ? Number(((change / price.today_price) * 100).toFixed(2)) : 0;
      return {
        ...price,
        yesterday_price: price.today_price,
        today_price: newPrice,
        weekly_change: change,
        weekly_change_percent: percent,
        trend: change > 0 ? "up" : change < 0 ? "down" : "flat",
        source: sources[price.id] || "میانگین بازار ایران",
        updated_at: publishedAt,
      } as PistachioPrice;
    });

    if (!usingDemo) {
      for (const item of next) {
        const { error } = await supabase.from("pistachio_prices").update({
          yesterday_price: item.yesterday_price,
          today_price: item.today_price,
          weekly_change: item.weekly_change,
          weekly_change_percent: item.weekly_change_percent,
          trend: item.trend === "flat" ? "up" : item.trend,
          source: item.source,
          updated_at: item.updated_at,
        }).eq("id", item.id);
        if (error) console.error(error);

        await supabase.from("daily_prices").upsert({
          product_id: item.id,
          price: item.today_price,
          source: item.source,
          price_date: new Date().toISOString().slice(0, 10),
          published_at: publishedAt,
        }, { onConflict: "product_id,price_date" });
      }
    }

    setPrices(next);
    setDrafts(Object.fromEntries(next.map((p) => [p.id, String(p.today_price)])));
    setNotice(usingDemo ? "پیش‌نمایش رابط با داده آزمایشی به‌روزرسانی شد. پس از اجرای SQL، داده‌ها در Supabase ذخیره می‌شوند." : "قیمت‌های امروز منتشر و در تاریخچه ثبت شدند.");
    setPreview(false);
    setSaving(false);
  };

  const confirmUnchanged = () => {
    setDrafts(Object.fromEntries(prices.map((p) => [p.id, String(p.today_price)])));
    setNotice("قیمت‌های فعلی برای ثبت امروز آماده شدند. برای ثبت تاریخچه روی «انتشار قیمت‌ها» بزنید.");
  };

  if (loading) return <div className="p-10">در حال دریافت قیمت‌ها...</div>;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-emerald-700 font-bold">مدیریت روزانه بازار</p>
          <h1 className="text-2xl md:text-3xl font-black mt-1">قیمت‌های روز پسته</h1>
          <p className="text-slate-500 text-sm mt-2">قیمت جدید را وارد کن، پیش‌نمایش بگیر و سپس همه قیمت‌ها را یک‌جا منتشر کن.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={confirmUnchanged} className="rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm font-bold flex items-center gap-2"><CheckCircle2 size={18}/> تأیید بدون تغییر</button>
          <button onClick={() => setPreview(true)} className="rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm font-bold flex items-center gap-2"><Eye size={18}/> پیش‌نمایش</button>
          <button onClick={publish} disabled={saving} className="rounded-xl bg-emerald-600 text-white px-5 py-3 text-sm font-black flex items-center gap-2 disabled:opacity-60"><Send size={18}/> {saving ? "در حال انتشار..." : "انتشار قیمت‌ها"}</button>
        </div>
      </header>

      {notice && <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 text-sm">{notice}</div>}
      {usingDemo && <div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 text-sm">جدول Supabase هنوز آماده یا دارای داده نیست؛ پنل فعلاً با داده آزمایشی نمایش داده می‌شود.</div>}

      <section className="grid sm:grid-cols-3 gap-4 mb-5">
        <div className="rounded-2xl bg-slate-950 text-white p-5"><p className="text-xs text-slate-400">تعداد محصولات</p><p className="text-3xl font-black mt-2">{prices.length.toLocaleString("fa-IR")}</p></div>
        <div className="rounded-2xl bg-white border border-slate-200 p-5"><p className="text-xs text-slate-500">تغییرات آماده انتشار</p><p className="text-3xl font-black mt-2 text-violet-700">{changedCount.toLocaleString("fa-IR")}</p></div>
        <div className="rounded-2xl bg-white border border-slate-200 p-5"><p className="text-xs text-slate-500">آخرین بروزرسانی</p><p className="text-lg font-black mt-2">امروز، {new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</p></div>
      </section>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute right-3 top-3 text-slate-400" size={18}/>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو در محصولات..." className="w-full rounded-xl border border-slate-200 bg-slate-50 pr-10 pl-4 py-2.5 outline-none focus:border-emerald-500" />
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2"><History size={16}/> هر انتشار یک رکورد روزانه برای نمودار تاریخی می‌سازد.</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-right p-4">محصول</th><th className="text-right p-4">سایز</th><th className="text-right p-4">قیمت فعلی</th><th className="text-right p-4">قیمت جدید</th><th className="text-right p-4">تغییر</th><th className="text-right p-4">منبع استعلام</th><th className="text-center p-4">نمایش</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((price) => {
                const next = Number(drafts[price.id] || 0);
                const change = next - price.today_price;
                return (
                  <tr key={price.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                    <td className="p-4 font-black">{price.variety}</td>
                    <td className="p-4 text-slate-500">{price.size}</td>
                    <td className="p-4 font-bold">{formatPrice(price.today_price)} <span className="text-xs text-slate-400">تومان</span></td>
                    <td className="p-3"><input inputMode="numeric" dir="ltr" value={drafts[price.id] || ""} onChange={(e) => setDrafts((d) => ({ ...d, [price.id]: e.target.value.replace(/[^0-9]/g, "") }))} className="w-44 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left font-black outline-none focus:border-emerald-500" /></td>
                    <td className={`p-4 font-bold ${change > 0 ? "text-emerald-600" : change < 0 ? "text-rose-600" : "text-slate-400"}`}>{change === 0 ? "بدون تغییر" : `${change > 0 ? "+" : ""}${formatPrice(change)}`}</td>
                    <td className="p-3"><input value={sources[price.id] || ""} onChange={(e) => setSources((s) => ({ ...s, [price.id]: e.target.value }))} className="w-48 rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-emerald-500" /></td>
                    <td className="p-4 text-center"><button onClick={() => toggleVisibility(price)} className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${price.is_visible ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>{price.is_visible ? <Eye size={18}/> : <EyeOff size={18}/>}</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 flex justify-between items-center">
          <button className="text-sm font-bold text-emerald-700 flex items-center gap-2"><Plus size={18}/> افزودن محصول جدید</button>
          <button onClick={fetchPrices} className="text-sm text-slate-500 flex items-center gap-2"><RefreshCw size={16}/> تازه‌سازی</button>
        </div>
      </div>

      {preview && (
        <div className="fixed inset-0 z-[100] bg-black/50 p-4 flex items-center justify-center" onClick={() => setPreview(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-5xl max-h-[90vh] overflow-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-5 flex justify-between items-center">
              <div><h2 className="text-xl font-black">پیش‌نمایش قیمت‌های امروز</h2><p className="text-sm text-slate-500 mt-1">نمایی نزدیک به جدول سایت قبل از انتشار</p></div>
              <button onClick={() => setPreview(false)} className="w-10 h-10 rounded-xl bg-slate-100 grid place-items-center"><X/></button>
            </div>
            <div className="p-5">
              <div className="rounded-2xl overflow-hidden border border-slate-200">
                <table className="w-full text-sm"><thead className="bg-emerald-700 text-white"><tr><th className="p-4 text-right">محصول</th><th className="p-4 text-right">سایز</th><th className="p-4 text-right">قیمت امروز</th><th className="p-4 text-right">منبع</th></tr></thead><tbody>{prices.filter((p) => p.is_visible).map((p) => <tr key={p.id} className="border-t border-slate-100"><td className="p-4 font-black">{p.variety}</td><td className="p-4">{p.size}</td><td className="p-4 text-lg font-black">{formatPrice(Number(drafts[p.id]))} تومان</td><td className="p-4 text-slate-500">{sources[p.id]}</td></tr>)}</tbody></table>
              </div>
              <div className="mt-5 flex justify-end gap-3"><button onClick={() => setPreview(false)} className="rounded-xl border border-slate-200 px-5 py-3 font-bold">بازگشت به ویرایش</button><button onClick={publish} className="rounded-xl bg-emerald-600 text-white px-5 py-3 font-black flex items-center gap-2"><Save size={18}/> تأیید و انتشار</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
