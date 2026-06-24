import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

interface PistachioPrice {
  id: number;
  variety: string;
  size: string;
  today_price: number;
  yesterday_price: number;
  weekly_change: number;
  weekly_change_percent: number;
  trend: "up" | "down";
  is_visible: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function formatToman(value: number): string {
  return value.toLocaleString("fa-IR");
}

export default function AdminPrices() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const [prices, setPrices] = useState<PistachioPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  const [newVariety, setNewVariety] = useState("");
  const [newSize, setNewSize] = useState("");
  const [newTodayPrice, setNewTodayPrice] = useState("");
  const [newYesterdayPrice, setNewYesterdayPrice] = useState("");
  const [addError, setAddError] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<PistachioPrice>>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchPrices();
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchPrices();
      else setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pistachio_prices")
      .select("*")
      .order("sort_order", { ascending: true });

    if (!error && data) setPrices(data as PistachioPrice[]);
    setLoading(false);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    if (authMode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setAuthError(error.message);
      else setAuthError("حساب ساخته شد. حالا می‌تونی لاگین کنی.");
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setPrices([]);
  };

  const handleAdd = async () => {
    if (!newVariety || !newSize || !newTodayPrice || !newYesterdayPrice) {
      setAddError("همه فیلدها الزامی هستند");
      return;
    }
    setAddError("");

    const today = parseFloat(newTodayPrice);
    const yesterday = parseFloat(newYesterdayPrice);
    const dailyChange = today - yesterday;
    const dailyPercent = yesterday > 0 ? (dailyChange / yesterday) * 100 : 0;

    const maxSort = prices.length > 0 ? Math.max(...prices.map((p) => p.sort_order)) : 0;

    const { error } = await supabase.from("pistachio_prices").insert({
      variety: newVariety,
      size: newSize,
      today_price: today,
      yesterday_price: yesterday,
      weekly_change: dailyChange,
      weekly_change_percent: parseFloat(dailyPercent.toFixed(2)),
      trend: dailyChange >= 0 ? "up" : "down",
      sort_order: maxSort + 1,
    });

    if (!error) {
      setNewVariety("");
      setNewSize("");
      setNewTodayPrice("");
      setNewYesterdayPrice("");
      fetchPrices();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("مطمئنی می‌خوای این ردیف رو حذف کنی؟")) return;
    const { error } = await supabase.from("pistachio_prices").delete().eq("id", id);
    if (!error) fetchPrices();
  };

  const handleToggleVisibility = async (id: number, current: boolean) => {
    await supabase.from("pistachio_prices").update({ is_visible: !current }).eq("id", id);
    fetchPrices();
  };

  const handleSaveEdit = async (id: number) => {
    setSaving(id);
    const updates: Record<string, unknown> = {};
    if (editForm.variety !== undefined) updates.variety = editForm.variety;
    if (editForm.size !== undefined) updates.size = editForm.size;
    if (editForm.today_price !== undefined) {
      updates.today_price = editForm.today_price;
      const yesterday = prices.find((p) => p.id === id)?.yesterday_price || 0;
      const change = (editForm.today_price as number) - yesterday;
      updates.weekly_change = change;
      updates.weekly_change_percent = yesterday > 0 ? parseFloat(((change / yesterday) * 100).toFixed(2)) : 0;
      updates.trend = change >= 0 ? "up" : "down";
    }
    if (editForm.yesterday_price !== undefined) {
      updates.yesterday_price = editForm.yesterday_price;
      const today = prices.find((p) => p.id === id)?.today_price || 0;
      const change = today - (editForm.yesterday_price as number);
      updates.weekly_change = change;
      updates.weekly_change_percent = (editForm.yesterday_price as number) > 0 ? parseFloat(((change / (editForm.yesterday_price as number)) * 100).toFixed(2)) : 0;
      updates.trend = change >= 0 ? "up" : "down";
    }
    updates.updated_at = new Date().toISOString();

    await supabase.from("pistachio_prices").update(updates).eq("id", id);
    setEditingId(null);
    setSaving(null);
    fetchPrices();
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const current = prices[index];
    const above = prices[index - 1];
    await supabase.from("pistachio_prices").update({ sort_order: above.sort_order }).eq("id", current.id);
    await supabase.from("pistachio_prices").update({ sort_order: current.sort_order }).eq("id", above.id);
    fetchPrices();
  };

  const handleMoveDown = async (index: number) => {
    if (index === prices.length - 1) return;
    const current = prices[index];
    const below = prices[index + 1];
    await supabase.from("pistachio_prices").update({ sort_order: below.sort_order }).eq("id", current.id);
    await supabase.from("pistachio_prices").update({ sort_order: current.sort_order }).eq("id", below.id);
    fetchPrices();
  };

  const startEditing = (price: PistachioPrice) => {
    setEditingId(price.id);
    setEditForm({
      variety: price.variety,
      size: price.size,
      today_price: price.today_price,
      yesterday_price: price.yesterday_price,
    });
  };

  // --- Auth Screen ---
  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background-50 px-4" dir="rtl">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-background-200/70 p-8">
          <div className="text-center mb-6">
            <span className="text-xl font-black text-foreground-950 tracking-tighter">
              Peste<span className="text-primary-600">Online</span>
            </span>
            <p className="text-sm text-foreground-500 mt-2">پنل مدیریت قیمت‌ها</p>
          </div>

          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground-700 mb-1">ایمیل</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-background-200 bg-background-50 text-foreground-900 focus:outline-none focus:border-primary-400 transition-colors"
                placeholder="admin@example.com"
                required
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground-700 mb-1">رمز عبور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-background-200 bg-background-50 text-foreground-900 focus:outline-none focus:border-primary-400 transition-colors"
                placeholder="••••••"
                required
                dir="ltr"
              />
            </div>

            {authError && (
              <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{authError}</p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
            >
              {authLoading ? "در حال ورود..." : authMode === "login" ? "ورود" : "ثبت‌نام"}
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthError(""); }}
              className="text-xs text-primary-600 hover:text-primary-700 cursor-pointer text-center"
            >
              {authMode === "login" ? "حساب نداری؟ ثبت‌نام کن" : "حساب داری؟ ورود"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // --- Admin Panel ---
  return (
    <main className="min-h-screen bg-background-50 px-4 py-6" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black text-foreground-950 tracking-tighter">
              Peste<span className="text-primary-600">Online</span>
            </span>
            <span className="text-xs bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full font-semibold">پنل مدیریت</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-foreground-500 hover:text-red-500 cursor-pointer transition-colors whitespace-nowrap"
          >
            خروج
          </button>
        </div>

        <h1 className="text-xl font-black text-foreground-950 mb-6">مدیریت جدول قیمت پسته</h1>

        {/* Add New Row */}
        <div className="bg-white rounded-xl border border-background-200/70 p-4 mb-6">
          <h3 className="text-sm font-bold text-foreground-800 mb-3">افزودن ردیف جدید</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <input
              type="text"
              value={newVariety}
              onChange={(e) => setNewVariety(e.target.value)}
              placeholder="رقم (مثلاً: اکبری)"
              className="px-3 py-2 text-sm rounded-lg border border-background-200 bg-background-50 text-foreground-900 focus:outline-none focus:border-primary-400"
            />
            <input
              type="text"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              placeholder="سایز (مثلاً: ۲۸-۳۰)"
              className="px-3 py-2 text-sm rounded-lg border border-background-200 bg-background-50 text-foreground-900 focus:outline-none focus:border-primary-400"
            />
            <input
              type="number"
              value={newTodayPrice}
              onChange={(e) => setNewTodayPrice(e.target.value)}
              placeholder="قیمت امروز (تومان)"
              className="px-3 py-2 text-sm rounded-lg border border-background-200 bg-background-50 text-foreground-900 focus:outline-none focus:border-primary-400"
            />
            <input
              type="number"
              value={newYesterdayPrice}
              onChange={(e) => setNewYesterdayPrice(e.target.value)}
              placeholder="قیمت دیروز (تومان)"
              className="px-3 py-2 text-sm rounded-lg border border-background-200 bg-background-50 text-foreground-900 focus:outline-none focus:border-primary-400"
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              افزودن
            </button>
          </div>
          {addError && <p className="text-xs text-red-500 mt-2">{addError}</p>}
        </div>

        {/* Price List */}
        {loading ? (
          <div className="text-center py-10 text-foreground-400 text-sm">در حال بارگذاری...</div>
        ) : (
          <div className="bg-white rounded-xl border border-background-200/70 overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:flex items-center px-4 py-3 bg-background-100/70 border-b border-background-200/60 text-xs font-bold text-foreground-600">
              <div className="w-10 text-center">#</div>
              <div className="flex-1">رقم</div>
              <div className="w-24 text-center">سایز</div>
              <div className="w-36 text-left">قیمت امروز</div>
              <div className="w-36 text-left">قیمت دیروز</div>
              <div className="w-20 text-center">تغییر</div>
              <div className="w-16 text-center">نمایش</div>
              <div className="w-28 text-center">عملیات</div>
            </div>

            {prices.map((price, index) => (
              <div
                key={price.id}
                className={`flex flex-col md:flex-row md:items-center px-4 py-3 border-b border-background-200/40 last:border-b-0 gap-2 md:gap-0 ${
                  !price.is_visible ? "opacity-50 bg-background-50/50" : ""
                }`}
              >
                {editingId === price.id ? (
                  /* Edit Mode */
                  <div className="flex flex-col md:flex-row gap-2 md:gap-3 flex-1">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs text-foreground-400 w-8">{index + 1}</span>
                      <input
                        value={editForm.variety || ""}
                        onChange={(e) => setEditForm({ ...editForm, variety: e.target.value })}
                        className="flex-1 px-2 py-1.5 text-sm rounded border border-background-200 bg-white text-foreground-900"
                      />
                      <input
                        value={editForm.size || ""}
                        onChange={(e) => setEditForm({ ...editForm, size: e.target.value })}
                        className="w-20 px-2 py-1.5 text-sm rounded border border-background-200 bg-white text-foreground-900"
                      />
                      <input
                        type="number"
                        value={editForm.today_price || ""}
                        onChange={(e) => setEditForm({ ...editForm, today_price: parseFloat(e.target.value) })}
                        className="w-32 px-2 py-1.5 text-sm rounded border border-background-200 bg-white text-foreground-900 text-left"
                      />
                      <input
                        type="number"
                        value={editForm.yesterday_price || ""}
                        onChange={(e) => setEditForm({ ...editForm, yesterday_price: parseFloat(e.target.value) })}
                        className="w-32 px-2 py-1.5 text-sm rounded border border-background-200 bg-white text-foreground-900 text-left"
                      />
                      <span className="text-xs text-foreground-400 whitespace-nowrap">
                        {editForm.today_price && editForm.yesterday_price
                          ? ((editForm.today_price as number) - (editForm.yesterday_price as number) >= 0 ? "+" : "") +
                            (((editForm.today_price as number) - (editForm.yesterday_price as number)) / (editForm.yesterday_price as number) * 100).toFixed(2) + "%"
                          : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSaveEdit(price.id)}
                        disabled={saving === price.id}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
                      >
                        {saving === price.id ? "..." : "ذخیره"}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-lg bg-background-100 hover:bg-background-200 text-foreground-600 text-xs cursor-pointer whitespace-nowrap"
                      >
                        لغو
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <>
                    <div className="flex items-center gap-2 md:hidden text-xs text-foreground-500">
                      <span>ردیف {index + 1}</span>
                      {!price.is_visible && <span className="text-red-400">(مخفی)</span>}
                    </div>
                    <div className="flex items-center gap-2 md:w-auto flex-1">
                      <span className="hidden md:block w-10 text-center text-xs text-foreground-400">{index + 1}</span>
                      <span className="text-sm font-bold text-foreground-900 min-w-[80px]">{price.variety}</span>
                      <span className="text-xs bg-background-100 text-foreground-600 px-2 py-0.5 rounded-md">{price.size}</span>
                    </div>
                    <div className="flex items-center gap-3 md:w-auto mt-1 md:mt-0">
                      <span className="text-sm font-bold text-foreground-900 w-32 text-left tabular-nums">{formatToman(price.today_price)}</span>
                      <span className="text-sm text-foreground-500 w-32 text-left tabular-nums">{formatToman(price.yesterday_price)}</span>
                      <span
                        className={`text-xs font-bold w-20 text-center ${
                          price.trend === "up" ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {price.trend === "up" ? "+" : ""}
                        {price.weekly_change_percent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 mt-1 md:mt-0">
                      <button
                        onClick={() => handleToggleVisibility(price.id, price.is_visible)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                          price.is_visible
                            ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                            : "bg-red-50 text-red-400 hover:bg-red-100"
                        }`}
                        title={price.is_visible ? "مخفی کردن" : "نمایش دادن"}
                      >
                        <i className={`${price.is_visible ? "ri-eye-line" : "ri-eye-off-line"} w-4 h-4 flex items-center justify-center`}></i>
                      </button>
                      <button
                        onClick={() => startEditing(price)}
                        className="w-8 h-8 rounded-lg bg-background-100 hover:bg-primary-100 text-foreground-400 hover:text-primary-600 flex items-center justify-center cursor-pointer transition-colors"
                        title="ویرایش"
                      >
                        <i className="ri-pencil-line w-4 h-4 flex items-center justify-center"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(price.id)}
                        className="w-8 h-8 rounded-lg bg-background-100 hover:bg-red-100 text-foreground-400 hover:text-red-500 flex items-center justify-center cursor-pointer transition-colors"
                        title="حذف"
                      >
                        <i className="ri-delete-bin-line w-4 h-4 flex items-center justify-center"></i>
                      </button>
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="w-7 h-7 rounded-lg bg-background-100 text-foreground-400 flex items-center justify-center cursor-pointer hover:bg-background-200 disabled:opacity-30 disabled:cursor-default transition-colors"
                        title="جابجایی بالا"
                      >
                        <i className="ri-arrow-up-s-line w-4 h-4 flex items-center justify-center"></i>
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === prices.length - 1}
                        className="w-7 h-7 rounded-lg bg-background-100 text-foreground-400 flex items-center justify-center cursor-pointer hover:bg-background-200 disabled:opacity-30 disabled:cursor-default transition-colors"
                        title="جابجایی پایین"
                      >
                        <i className="ri-arrow-down-s-line w-4 h-4 flex items-center justify-center"></i>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {prices.length === 0 && (
              <div className="text-center py-10 text-foreground-400 text-sm">هیچ ردیفی وجود ندارد</div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}