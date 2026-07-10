import { ArrowDownLeft, ArrowUpLeft, BarChart3, CalendarDays, Eye, MousePointerClick, RefreshCw, Search, Tags, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "react-router-dom";

const chartData = [
  { day: "شنبه", visits: 840, clicks: 210 },
  { day: "یکشنبه", visits: 1120, clicks: 284 },
  { day: "دوشنبه", visits: 970, clicks: 256 },
  { day: "سه‌شنبه", visits: 1480, clicks: 338 },
  { day: "چهارشنبه", visits: 1320, clicks: 310 },
  { day: "پنجشنبه", visits: 1710, clicks: 391 },
  { day: "جمعه", visits: 1540, clicks: 362 },
];

const metrics = [
  { title: "بازدید امروز", value: "۱٬۵۴۰", change: "+۱۲٪", icon: Eye, positive: true },
  { title: "کاربران امروز", value: "۹۸۳", change: "+۸٪", icon: Users, positive: true },
  { title: "کلیک گوگل", value: "۳۶۲", change: "+۶٪", icon: MousePointerClick, positive: true },
  { title: "میانگین رتبه", value: "۱۸٫۴", change: "-۱٫۲", icon: Search, positive: true },
];

export default function AdminDashboard() {
  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-emerald-700 font-bold">امروز، ۲۸ تیر ۱۴۰۵</p>
          <h1 className="text-2xl md:text-3xl font-black mt-1">داشبورد مدیریت</h1>
          <p className="text-slate-500 mt-2 text-sm">خلاصه وضعیت قیمت‌ها، محتوا و عملکرد سایت</p>
        </div>
        <div className="flex gap-3">
          <Link to="/" target="_blank" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold hover:border-emerald-400">مشاهده سایت</Link>
          <Link to="/admin/prices" className="rounded-xl bg-emerald-600 text-white px-4 py-3 text-sm font-bold hover:bg-emerald-700 flex items-center gap-2"><Tags size={18}/> ویرایش قیمت امروز</Link>
        </div>
      </header>

      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {metrics.map(({ title, value, change, icon: Icon, positive }) => (
          <article key={title} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center"><Icon size={21}/></div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{positive ? <ArrowUpLeft size={14}/> : <ArrowDownLeft size={14}/>} {change}</span>
            </div>
            <p className="text-sm text-slate-500 mt-5">{title}</p>
            <p className="text-3xl font-black mt-1">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid xl:grid-cols-3 gap-6 mb-6">
        <article className="xl:col-span-2 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-black text-lg">روند بازدید و کلیک</h2>
              <p className="text-xs text-slate-500 mt-1">نمایش آزمایشی؛ در مرحله اتصال، داده واقعی GA4 و Search Console جایگزین می‌شود.</p>
            </div>
            <BarChart3 className="text-emerald-600" />
          </div>
          <div className="h-80" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="visitFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  <linearGradient id="clickFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="visits" stroke="#10b981" fill="url(#visitFill)" strokeWidth={3} />
                <Area type="monotone" dataKey="clicks" stroke="#8b5cf6" fill="url(#clickFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl bg-slate-950 text-white p-6 shadow-sm relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-36 h-36 rounded-full bg-emerald-500/20 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-emerald-300 text-sm font-bold"><RefreshCw size={17}/> وضعیت به‌روزرسانی</div>
            <p className="text-4xl font-black mt-5">۲۷ از ۲۷</p>
            <p className="text-slate-300 text-sm mt-2">محصول برای امروز ثبت شده‌اند</p>
            <div className="mt-6 rounded-2xl bg-white/10 p-4 border border-white/10">
              <div className="flex items-center gap-2 text-sm"><CalendarDays size={17}/> آخرین انتشار</div>
              <p className="font-bold mt-2">امروز ساعت ۰۹:۴۲</p>
            </div>
            <Link to="/admin/prices" className="mt-5 block text-center rounded-xl bg-emerald-500 text-slate-950 py-3 font-black">مدیریت قیمت‌ها</Link>
          </div>
        </article>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        {[{title:"افزودن مقاله",text:"مقاله یا خبر جدید برای سئو منتشر کنید",to:"/admin/articles"},{title:"ثبت تحلیل بازار",text:"تحلیل امروز بازار پسته را آماده کنید",to:"/admin/analysis"},{title:"ویرایش طراحی",text:"بنر، متن‌ها، رنگ‌ها و سکشن‌ها را تغییر دهید",to:"/admin/design"}].map((item) => (
          <Link key={item.title} to={item.to} className="rounded-2xl bg-white border border-slate-200 p-5 hover:border-emerald-400 hover:shadow-md transition">
            <h3 className="font-black">{item.title}</h3>
            <p className="text-sm text-slate-500 mt-2 leading-6">{item.text}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
