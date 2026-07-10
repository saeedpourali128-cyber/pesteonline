import { Construction } from "lucide-react";

export default function SectionPlaceholder({ eyebrow, title, description, items }: { eyebrow: string; title: string; description: string; items: string[] }) {
  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
      <p className="text-sm text-emerald-700 font-bold">{eyebrow}</p>
      <h1 className="text-3xl font-black mt-1">{title}</h1>
      <p className="text-slate-500 mt-3 max-w-3xl leading-7">{description}</p>
      <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((item) => <div key={item} className="rounded-2xl bg-white border border-slate-200 p-5 flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center shrink-0"><Construction size={19}/></div><div><h3 className="font-black">{item}</h3><p className="text-xs text-slate-500 mt-2">ساختار این قابلیت در نسخه اول آماده شده و در فاز بعد به دیتابیس متصل می‌شود.</p></div></div>)}
      </div>
    </div>
  );
}
