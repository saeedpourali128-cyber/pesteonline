import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, BookOpenText, ChevronLeft, FileText, LayoutDashboard, LogOut, Menu, Palette, Settings, Tags, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

const items = [
  { to: "/admin", label: "داشبورد", icon: LayoutDashboard, end: true },
  { to: "/admin/prices", label: "قیمت‌های روز", icon: Tags },
  { to: "/admin/articles", label: "مقالات و اخبار", icon: FileText },
  { to: "/admin/analysis", label: "تحلیل بازار", icon: BookOpenText },
  { to: "/admin/design", label: "طراحی و ظاهر", icon: Palette },
  { to: "/admin/analytics", label: "آمار سایت", icon: BarChart3 },
  { to: "/admin/settings", label: "تنظیمات", icon: Settings },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 text-slate-900">
      <button onClick={() => setOpen(true)} className="lg:hidden fixed top-4 right-4 z-50 bg-slate-950 text-white rounded-xl p-3 shadow-lg"><Menu size={20} /></button>
      {open && <div onClick={() => setOpen(false)} className="lg:hidden fixed inset-0 bg-black/40 z-40" />}

      <aside className={`fixed z-50 right-0 top-0 h-screen w-72 bg-slate-950 text-white transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
          <div>
            <div className="text-xl font-black">Peste<span className="text-emerald-400">Online</span></div>
            <div className="text-[11px] text-slate-400 mt-1">مرکز کنترل بازار پسته</div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden"><X /></button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-160px)]">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${isActive ? "bg-emerald-500 text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}>
              <Icon size={19} />
              <span className="flex-1">{label}</span>
              <ChevronLeft size={16} className="opacity-50" />
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-white/10">
          <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-300 hover:bg-rose-500/10">
            <LogOut size={18} /> خروج از حساب
          </button>
        </div>
      </aside>

      <main className="lg:mr-72 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
