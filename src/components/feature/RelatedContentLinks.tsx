interface InternalLink {
  text: string;
  href: string;
  title: string;
}

interface RelatedContentLinksProps {
  links: InternalLink[];
  variant?: "light" | "dark";
}

export default function RelatedContentLinks({ links, variant = "light" }: RelatedContentLinksProps) {
  if (!links || links.length === 0) return null;

  const isDark = variant === "dark";

  return (
    <div className="mt-8 pt-6 border-t" style={{
      borderColor: isDark ? "rgba(255,255,255,0.1)" : undefined,
    }}>
      <span className={`block text-xs font-semibold mb-3 ${isDark ? "text-white/50" : "text-foreground-400"}`}>
        مطالب مرتبط:
      </span>
      <div className="flex flex-wrap gap-2">
        {links.map((link, idx) => (
          <a
            key={idx}
            href={link.href}
            title={link.title}
            className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-colors duration-200 whitespace-nowrap ${
              isDark
                ? "bg-white/10 hover:bg-white/20 text-white"
                : "bg-primary-50 hover:bg-primary-100 text-primary-700"
            }`}
          >
            <i className="ri-arrow-left-line w-3.5 h-3.5 flex items-center justify-center"></i>
            <span>{link.text}</span>
          </a>
        ))}
      </div>
    </div>
  );
}