import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const site = JSON.parse(await fs.readFile(path.join(root, 'src/data/site.json'), 'utf8'));

const esc = (value='') => String(value)
  .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
  .replaceAll('"','&quot;').replaceAll("'",'&#39;');

function integrationHead() {
  const i = site.integrations || {};
  const tags = [];
  if (i.googleTagManagerId) tags.push(`<script src="/gtm-init.js" data-gtm-id="${esc(i.googleTagManagerId)}"></script>`);
  if (i.googleSiteVerification) tags.push(`<meta name="google-site-verification" content="${esc(i.googleSiteVerification)}">`);
  if (i.facebookDomainVerification) tags.push(`<meta name="facebook-domain-verification" content="${esc(i.facebookDomainVerification)}">`);

  const directGoogleId = i.googleAnalyticsId || i.googleAdsId;
  if (directGoogleId) tags.push(`<script async src="https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(directGoogleId)}"></script>`);
  if (i.googleAnalyticsId) tags.push(`<script src="/analytics-init.js" data-ga-id="${esc(i.googleAnalyticsId)}" defer></script>`);
  if (i.googleAdsId) tags.push(`<script src="/google-ads-init.js" data-google-ads-id="${esc(i.googleAdsId)}" defer></script>`);
  if (i.metaPixelId) tags.push(`<script src="/meta-pixel-init.js" data-pixel-id="${esc(i.metaPixelId)}" defer></script>`);
  if (i.linkedinPartnerId) tags.push(`<script src="/linkedin-init.js" data-partner-id="${esc(i.linkedinPartnerId)}" defer></script>`);
  if (i.recaptchaSiteKey) tags.push(`<script src="/recaptcha-init.js" data-site-key="${esc(i.recaptchaSiteKey)}" defer></script>`);
  return tags.length ? `\n  ${tags.join('\n  ')}\n` : '';
}

function integrationBodyTop() {
  const i = site.integrations || {};
  const tags = [];
  if (i.googleTagManagerId) {
    tags.push(`<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(i.googleTagManagerId)}" height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe></noscript>`);
  }
  return tags.length ? `\n  ${tags.join('\n  ')}\n` : '';
}

function integrationBodyEnd() {
  const i = site.integrations || {};
  const tags = [];
  if (i.metaPixelId) tags.push(`<noscript><img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=${encodeURIComponent(i.metaPixelId)}&ev=PageView&noscript=1"></noscript>`);
  if (i.linkedinPartnerId) tags.push(`<noscript><img height="1" width="1" style="display:none" alt="" src="https://px.ads.linkedin.com/collect/?pid=${encodeURIComponent(i.linkedinPartnerId)}&fmt=gif"></noscript>`);
  return tags.length ? `\n  ${tags.join('\n  ')}\n` : '';
}

function addIntegrations(html) {
  const head = integrationHead();
  if (head) html = html.replace(/<head>/i, `<head>${head}`);
  const bodyTop = integrationBodyTop();
  if (bodyTop) html = html.replace(/(<body[^>]*>)/i, `$1${bodyTop}`);
  const bodyEnd = integrationBodyEnd();
  if (bodyEnd) html = html.replace('</body>', `${bodyEnd}</body>`);
  return html;
}

function socialLink(url, icon, label) {
  if (!url) return '';
  const rel = icon === 'linkedin' ? 'noopener noreferrer me' : 'noopener noreferrer';
  return `<a href="${esc(url)}" target="_blank" rel="${rel}" aria-label="${esc(label)}"><span class="brand-icon brand-icon-${icon}" aria-hidden="true"></span></a>`;
}

function socialLinksMarkup() {
  return `<div class="social-links" aria-label="Social media profiles">
          ${socialLink(site.instagram,'instagram','Instagram')}
          ${socialLink(site.tiktok,'tiktok','TikTok')}
          ${socialLink(site.facebook,'facebook','Facebook')}
          ${socialLink(site.linkedin,'linkedin','LinkedIn')}
          ${socialLink(site.x,'x','X')}
          ${socialLink(site.youtube,'youtube','YouTube')}
        </div>`;
}

function replaceSocialLinks(html) {
  html = html.replace(/<div class="social-links" aria-label="Social media profiles">[\s\S]*?<\/div>/g, socialLinksMarkup());
  return html;
}

function emailCard(subject = 'Strategic Enquiry from mohfatemi.com') {
  const email = esc(site.contactEmail || 'contact@mohfatemi.com');
  const encodedSubject = encodeURIComponent(subject);
  return `<div class="contact-form reveal-up">
          <p class="card-label">Direct Email</p>
          <h3>Contact Mohammad Fatemi</h3>
          <p>For strategic enquiries, partnerships, investor relations, Web3 consulting and business opportunities, please contact Mohammad directly by email.</p>
          <a class="button button-gold magnetic" href="mailto:${email}?subject=${encodedSubject}">${email} <span aria-hidden="true">↗</span></a>
        </div>`;
}

function enforceEmailOnlyContact(html, pageName) {
  const email = esc(site.contactEmail || 'contact@mohfatemi.com');
  const subject = pageName === 'ecosystem' ? 'Web3 Strategic Enquiry from mohfatemi.com' : 'Strategic Enquiry from mohfatemi.com';
  html = html.replace(/<form class="contact-form reveal-up" id="whatsapp-form">[\s\S]*?<\/form>/gi, emailCard(subject));
  html = html.replace(/<a class="whatsapp-float"[\s\S]*?<\/a>/gi, '');
  html = html.replace(/<a[^>]*href="https:\/\/(?:wa\.me|api\.whatsapp\.com)\/[^\"]*"[^>]*>[\s\S]*?<\/a>/gi, `<a href="mailto:${email}">${email}</a>`);
  html = html.replace(/<a[^>]*href="[^"]*linkedin\.com[^"]*"[^>]*>LinkedIn<\/a>/gi, '');
  html = html
    .replace(/through the website'?s WhatsApp inquiry button or his verified LinkedIn profile\./gi, `directly by email at ${email}.`)
    .replace(/send a direct message through WhatsApp\./gi, `contact Mohammad directly at ${email}.`)
    .replace(/The form opens a direct WhatsApp conversation\./gi, `Please contact Mohammad directly by email at ${email}.`)
    .replace(/This form opens WhatsApp\.[^<]*/gi, `Please contact Mohammad directly at ${email}.`)
    .replace(/This website works without JavaScript, but animations and the WhatsApp form enhancement require JavaScript\./gi, 'This website works without JavaScript; animations are enhanced when JavaScript is enabled.');
  return html;
}

function mediaEmbedsSection() {
  const i = site.integrations || {};
  const blocks = [];
  if (i.youtubeVideoId) {
    const id = esc(i.youtubeVideoId.trim());
    blocks.push(`<article class="embed-card embed-card-video reveal-up"><div class="embed-card-heading"><span class="brand-icon brand-icon-youtube" aria-hidden="true"></span><div><small>Featured Video</small><h3>Watch on YouTube</h3></div></div><div class="embed-frame"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="Mohammad Fatemi featured video" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div></article>`);
  }
  if (i.googleMapsEmbedUrl) {
    const url = esc(i.googleMapsEmbedUrl.trim());
    blocks.push(`<article class="embed-card embed-card-map reveal-up"><div class="embed-card-heading"><span class="mini-icon">◆</span><div><small>Location</small><h3>Google Maps</h3></div></div><div class="embed-frame"><iframe src="${url}" title="Mohammad Fatemi location on Google Maps" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div></article>`);
  }
  if (!blocks.length) return '';
  return `\n    <section class="section section-light connected-media-section" aria-labelledby="connected-media-title"><div class="container section-intro dark reveal-up"><div><p class="eyebrow dark"><span></span> Connected Media</p><h2 id="connected-media-title">Video and location.</h2></div><p>Official media and location embeds configured from Site & SEO Settings.</p></div><div class="container embed-grid">${blocks.join('')}</div></section>\n`;
}

function metaReplace(html, cfg) {
  const robots = cfg.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(cfg.seoTitle)}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(cfg.metaDescription)}">`);
  html = html.replace(/<meta name="robots" content="[^"]*">/, `<meta name="robots" content="${robots}">`);
  html = html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${esc(cfg.canonical)}">`);
  html = html.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${esc(cfg.canonical)}">`);
  html = html.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(cfg.ogTitle)}">`);
  html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(cfg.ogDescription)}">`);
  html = html.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${esc(cfg.ogImage)}">`);
  html = html.replace(/<meta property="og:image:secure_url" content="[^"]*">/, `<meta property="og:image:secure_url" content="${esc(cfg.ogImage)}">`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(cfg.ogTitle)}">`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(cfg.ogDescription)}">`);
  html = html.replace(/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${esc(cfg.ogImage)}">`);
  html = html.replaceAll('https://mohfatemi.com', site.siteUrl.replace(/\/$/, ''));
  html = html.replaceAll('https://www.linkedin.com/in/mohammad-fatemi-938a8835/', site.linkedin || '#');
  html = html.replaceAll('https://www.instagram.com/', site.instagram || '#');
  html = html.replaceAll('https://www.facebook.com/', site.facebook || '#');
  html = html.replaceAll('https://www.tiktok.com/', site.tiktok || '#');
  html = html.replaceAll('https://x.com/', site.x || '#');
  return html;
}

function addBlogLinks(html) {
  if (!html.includes('>Insights<')) {
    html = html.replace(/(<a href="(?:ecosystem\.html|#expertise)">[^<]+<\/a>)/, `$1\n        <a href="blog/">Insights</a>`);
  }
  if (!html.includes('Insights & Articles')) {
    html = html.replace(/(<a href="ecosystem\.html">RZ & Web3 Consulting<\/a>)/, `$1<a href="blog/">Insights & Articles</a>`);
  }
  return html;
}

for (const [name, cfg] of [['index', site.home], ['ecosystem', site.ecosystem]]) {
  let html = await fs.readFile(path.join(root, `static-pages/${name}.template.html`), 'utf8');
  html = metaReplace(html, cfg);
  html = addBlogLinks(html);
  html = enforceEmailOnlyContact(html, name);
  html = replaceSocialLinks(html);
  if (name === 'index') {
    const media = mediaEmbedsSection();
    if (media) html = html.replace(/\n\s*<section id="contact"/, `${media}\n    <section id="contact"`);
  }
  html = addIntegrations(html);
  await fs.writeFile(path.join(root, `public/${name}.html`), html);
}
