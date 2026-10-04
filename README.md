# Mohammad Fatemi secure static CMS

Production domain: **https://mohfatemi.com**  
Hosting: **SiteGround**  
Content source: **GitHub**  
Blog editor: **Pages CMS**

This package keeps the premium animated HTML/CSS/JavaScript profile website and adds an Astro-powered static blog, browser-based CMS editing, Yoast-style SEO controls, automatic sitemap/RSS generation, SiteGround security headers, analytics/advertising integrations, local brand SVG icons, and automatic GitHub-to-SiteGround deployment.

## Editing blogs

Use Pages CMS after connecting this GitHub repository. Each blog post includes title, slug, content, featured image, image alt text, category/tags, SEO title, meta description, canonical URL, social title, social description, optional social-share override image, noindex and draft status.

Social-image fallback: **Social Share Image -> Featured Image -> default site image**.

## Publishing

See `DEPLOY-SITEGROUND.md`. The included GitHub Actions workflow builds the static site and deploys `dist/` to SiteGround over SSH whenever `main` changes.

## SEO

The build creates canonical tags, Open Graph/X metadata, BlogPosting structured data, sitemap.xml, robots.txt and RSS. `sitemap.xml` is regenerated automatically on every build and includes every indexable generated page/blog article. Run `npm run seo:check` locally or let GitHub Actions run it before deployment.

## Security

`public/.htaccess` adds HSTS, Content Security Policy, anti-clickjacking, MIME-sniffing protection, referrer policy, permissions policy and restrictive cross-origin headers. The CSP has explicit allowances for the configured Google, Meta, LinkedIn, YouTube, Maps and reCAPTCHA services rather than allowing arbitrary external scripts.

SiteGround should also have Let's Encrypt SSL active and HTTPS Enforce enabled. Never commit passwords, SSH private keys, API secrets or SSL private keys to GitHub.

## Analytics, ads and embeds

In Pages CMS open **Site & SEO Settings -> Analytics, Ads & Embeds**. Supported settings include:

- Google Search Console verification
- Google Tag Manager
- Google Analytics 4
- Google Ads and optional WhatsApp conversion tracking
- Facebook/Meta domain verification and Meta Pixel
- LinkedIn Insight Tag
- Google reCAPTCHA v3 client integration
- Featured YouTube embed
- Google Maps embed

The Google Tag Manager container supplied for this site is already configured as **GTM-K33TZDCG**. The GTM loader is placed at the top of `<head>` and its noscript iframe is placed immediately after `<body>` on static pages and blog pages.

If GA4, Google Ads, Meta Pixel or LinkedIn are managed inside GTM, leave their direct fields blank to avoid duplicate tracking.

Brand icons for WhatsApp, Instagram, Facebook, LinkedIn, TikTok, X and YouTube are stored locally as SVG files and inherit the site's black/gold/silver visual styling.

See `INTEGRATIONS.md` for details.
