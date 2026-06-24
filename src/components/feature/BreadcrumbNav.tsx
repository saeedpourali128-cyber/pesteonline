interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function BreadcrumbNav({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="مسیر صفحه" className="w-full bg-white border-b border-background-200/60 py-3 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-xs md:text-sm text-foreground-400">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <span key={idx} className="flex items-center gap-2">
                {idx > 0 && (
                  <i className="ri-arrow-left-s-line w-4 h-4 flex items-center justify-center"></i>
                )}
                {item.href && !isLast ? (
                  <a
                    href={item.href}
                    className="hover:text-primary-600 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className={`font-medium whitespace-nowrap ${isLast ? "text-foreground-700" : ""}`}>
                    {item.label}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </nav>
  );
}