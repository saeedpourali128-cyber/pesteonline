# نصب Peste SEO Guardian

این بسته برای پروژه React/Vite فعلی PesteOnline ساخته شده است و بخش تولید مقاله ندارد.

## امکانات نسخه اول
- Build و Type Check خودکار
- بررسی کد منبع برای خطاهای متداول SEO، امنیت و Performance
- بررسی Runtime با Chromium و Playwright
- تشخیص صفحه سفید، خطاهای JavaScript، تصاویر خراب و درخواست‌های ناموفق
- بودجه حجم JavaScript/CSS/تصویر
- Lighthouse CI روی مسیرهای اصلی
- بررسی robots.txt و sitemap.xml نسخه آنلاین
- گزارش Markdown و Artifact در GitHub Actions
- Safe Fix دستی با ساخت Pull Request
- بازبینی هفتگی با GitHub Models و ساخت Issue

## نصب

فایل ZIP را در ریشه پروژه Extract کنید و سپس اجرا کنید:

```powershell
.\setup-seo-guardian.cmd
```

پس از موفقیت:

```powershell
git status -sb
npm.cmd run seo:audit:source
npm.cmd run seo:audit:runtime
npm.cmd run seo:audit:bundle
npm.cmd run seo:report
```

سپس فایل‌ها را روی یک Branch جدا Commit کنید:

```powershell
git switch -c feature/seo-guardian
git add .
git commit -m "feat: add automated technical SEO guardian"
git push -u origin feature/seo-guardian
```

در GitHub یک Pull Request به `main` بسازید.

## تنظیمات ضروری GitHub

Repository → Settings → Actions → General:

- Workflow permissions را روی **Read and write permissions** قرار دهید.
- گزینه **Allow GitHub Actions to create and approve pull requests** را فعال کنید.

برای محافظت از Production، Branch Protection شاخه main را نیز فعال کنید.

## اجرای دستی

GitHub → Actions → Peste SEO Guardian → Run workflow

حالت‌ها:
- `audit`: فقط گزارش
- `safe-fix`: اصلاحات قطعی کم‌ریسک و Pull Request
- `ai-review`: تحلیل گزارش با GitHub Models و ساخت Issue

## نکته

این سیستم رتبه گوگل را تضمین نمی‌کند. وظیفه آن حذف موانع فنی، جلوگیری از خطاهای Runtime، کنترل سرعت و بهبود قابلیت Crawl و Index است.
