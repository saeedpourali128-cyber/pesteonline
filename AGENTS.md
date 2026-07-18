# PesteOnline Agent Rules

## Safety
- Never push directly to `main`.
- Never merge or deploy production without explicit human approval.
- Use a separate branch for every automated fix.
- Never read, print, upload, or commit `.env` files or secrets.
- Never expose Supabase service-role keys in frontend code.
- Never delete Supabase records or Storage objects automatically.
- Never change DNS, Cloudflare production settings, billing, or authentication policies automatically.

## Required checks
Before proposing a code change:
1. Run `npm ci`.
2. Run `npm run type-check`.
3. Run `npm run build`.
4. Run the SEO source audit.
5. Run the runtime audit against a production-like preview.
6. Review the generated report.

## Technical SEO priorities
- Prevent blank-page/runtime failures.
- Preserve crawlable `<a href>` links.
- Keep titles, descriptions, canonicals, robots directives, and headings consistent.
- Prevent admin routes from being indexable.
- Avoid broken images, missing alt text, duplicate JSX attributes, and insecure URLs.
- Prefer local WebP/AVIF assets or Supabase Storage over slow third-party image hosts.
- Avoid unnecessary third-party scripts and bundle regressions.
- Do not promise rankings; remove technical barriers and improve user experience.

## Automated fixes
Safe automation may:
- Run ESLint auto-fixes.
- Add `rel="noopener noreferrer"` to external links opened in a new tab.
- Add `decoding="async"` to already lazy-loaded images.
- Upgrade hard-coded `http://pesteonline.com` URLs to HTTPS.
- Remove exact duplicate JSX `loading` attributes.

Anything else must be reported for human review or delivered as a pull request.
