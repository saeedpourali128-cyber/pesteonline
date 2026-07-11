import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export default function AdminAuth({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  const verifySession = useCallback(async (nextSession: Session | null) => {
    if (!nextSession) {
      setSession(null);
      setAuthorized(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.rpc("is_pesteonline_admin");

    if (error || data !== true) {
      console.error(error);
      await supabase.auth.signOut();
      setSession(null);
      setAuthorized(false);
      setMessage("این حساب اجازه ورود به پنل مدیریت را ندارد.");
      setLoading(false);
      return;
    }

    setSession(nextSession);
    setAuthorized(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (active) void verifySession(data.session);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      window.setTimeout(() => {
        if (active) void verifySession(nextSession);
      }, 0);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [verifySession]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    if (resetMode) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin`,
      });
      setMessage(error ? error.message : "لینک بازیابی رمز به ایمیل شما ارسال شد.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage("ایمیل یا رمز عبور صحیح نیست.");
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 text-white">
        در حال بررسی دسترسی مدیر...
      </div>
    );
  }

  if (session && authorized) return <>{children}</>;

  return (
    <main dir="rtl" className="min-h-screen grid lg:grid-cols-2 bg-slate-950 text-white">
      <section className="hidden lg:flex relative overflow-hidden p-14 flex-col justify-between bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-900">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative">
          <div className="text-3xl font-black">
            Peste<span className="text-emerald-400">Online</span>
          </div>
          <p className="mt-4 max-w-md text-slate-300 leading-8">
            مرکز کنترل قیمت روز پسته، تاریخچه بازار، محتوا و آمار سایت.
          </p>
        </div>
        <div className="relative rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur">
          <p className="text-sm text-slate-400">نسخه مدیریت اختصاصی</p>
          <p className="mt-2 text-xl font-bold">
            سریع، ساده و بدون به‌هم‌ریختن ظاهر سایت
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 bg-slate-50 text-slate-900">
        <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 p-8">
          <div className="mb-8">
            <p className="text-sm text-emerald-600 font-bold">پنل مدیریت</p>
            <h1 className="text-2xl font-black mt-2">
              {resetMode ? "بازیابی رمز عبور" : "ورود مدیر"}
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              فقط حساب مدیر تأییدشده امکان ورود دارد.
            </p>
          </div>
          <form onSubmit={(event) => void submit(event)} className="space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">ایمیل</span>
              <input
                dir="ltr"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500"
              />
            </label>
            {!resetMode && (
              <label className="block">
                <span className="text-sm font-bold text-slate-700">رمز عبور</span>
                <input
                  dir="ltr"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500"
                />
              </label>
            )}
            {message && (
              <div className="rounded-xl bg-amber-50 text-amber-800 text-sm px-4 py-3">
                {message}
              </div>
            )}
            <button
              disabled={submitting}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 font-bold transition disabled:opacity-60"
            >
              {submitting
                ? "لطفاً صبر کنید..."
                : resetMode
                  ? "ارسال لینک بازیابی"
                  : "ورود به پنل"}
            </button>
          </form>
          <button
            onClick={() => {
              setResetMode(!resetMode);
              setMessage("");
            }}
            className="mt-5 text-sm text-emerald-700 font-bold"
          >
            {resetMode ? "بازگشت به ورود" : "رمز عبور را فراموش کرده‌ام"}
          </button>
        </div>
      </section>
    </main>
  );
}
