import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const site = JSON.parse(await fs.readFile(path.join(root, 'src/data/site.json'), 'utf8'));
const contactEmail = String(site.contactEmail || 'contact@mohfatemi.com').trim();

async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    e.isDirectory() ? out.push(...await walk(p)) : out.push(p);
  }
  return out;
}

function esc(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function emailCard(subject = 'Strategic Enquiry from mohfatemi.com') {
  const encodedSubject = encodeURIComponent(subject);
  return `<div class="contact-form reveal-up">
          <p class="card-label">Direct Email</p>
          <h3>Contact Mohammad Fatemi</h3>
          <p>For strategic enquiries, partnerships, investor relations, Web3 consulting and business opportunities, please contact Mohammad directly by email.</p>
          <a class="button button-gold magnetic" href="mailto:${esc(contactEmail)}?subject=${encodedSubject}">${esc(contactEmail)} <span aria-hidden="true">↗</span></a>
        </div>`;
}

function enforceEmailOnlyContact(html) {
  const isEcosystem = /ecosystem\.html/i.test(html) || /Web3 & RZ Ecosystem Consulting/i.test(html);
  const subject = isEcosystem ? 'Web3 Strategic Enquiry from mohfatemi.com' : 'Strategic Enquiry from mohfatemi.com';

  html = html.replace(
    /<form class=["']contact-form reveal-up["'] id=["']whatsapp-form["']>[\s\S]*?<\/form>/gi,
    emailCard(subject)
  );

  html = html.replace(/<a class=["']whatsapp-float["'][\s\S]*?<\/a>/gi, '');

  html = html.replace(
    /<a[^>]*href=["']https:\/\/(?:wa\.me|api\.whatsapp\.com)\/[^"']*["'][^>]*>[\s\S]*?<\/a>/gi,
    `<a href="mailto:${esc(contactEmail)}">${esc(contactEmail)}</a>`
  );

  html = html.replace(
    /<a[^>]*href=["'][^"']*linkedin\.com[^"']*["'][^>]*>LinkedIn<\/a>/gi,
    ''
  );

  html = html
    .replace(/through the website'?s WhatsApp inquiry button or his verified LinkedIn profile\./gi, `directly by email at ${contactEmail}.`)
    .replace(/send a direct message through WhatsApp\./gi, `contact Mohammad directly at ${contactEmail}.`)
    .replace(/The form opens a direct WhatsApp conversation\./gi, `Please contact Mohammad directly by email at ${contactEmail}.`)
    .replace(/This form opens WhatsApp\.[^<]*/gi, `Please contact Mohammad directly at ${contactEmail}.`)
    .replace(/This website works without JavaScript, but animations and the WhatsApp form enhancement require JavaScript\./gi, 'This website works without JavaScript; animations are enhanced when JavaScript is enabled.')
    .replace(/\sdata-whatsapp-label=["'][^"']*["']/gi, '');

  return html;
}

async function cleanContactAssets() {
  const scriptPath = path.join(dist, 'script.js');
  try {
    let js = await fs.readFile(scriptPath, 'utf8');
    js = js.replace(
      /\n\s*const whatsappForm = document\.querySelector\('#whatsapp-form'\);[\s\S]*?(?=\n\s*\/\/ Keep official ecosystem cards usable)/,
      '\n'
    );
    await fs.writeFile(scriptPath, js);
  } catch {}

  const adsPath = path.join(dist, 'google-ads-init.js');
  try {
    const ads = `(() => {\n  'use strict';\n  const node = document.currentScript;\n  const adsId = node?.dataset?.googleAdsId?.trim();\n  if (!adsId) return;\n\n  window.dataLayer = window.dataLayer || [];\n  window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };\n  window.gtag('js', new Date());\n  window.gtag('config', adsId);\n\n  window.mfTrackGoogleAdsConversion = (label) => {\n    if (!label) return;\n    window.gtag('event', 'conversion', { send_to: \`\${adsId}/\${label}\` });\n  };\n})();\n`;
    await fs.writeFile(adsPath, ads);
  } catch {}

  const stylesPath = path.join(dist, 'styles.css');
  try {
    let css = await fs.readFile(stylesPath, 'utf8');
    css = css
      .replace(/\n?\s*\.whatsapp-float[^\n]*\n/g, '\n')
      .replace(/\n?\s*@keyframes whatsappPulse[^\n]*\n/g, '\n')
      .replace(/\n?\s*\.brand-icon-whatsapp[^\n]*\n/g, '\n');
    await fs.writeFile(stylesPath, css);
  } catch {}

  await fs.rm(path.join(dist, 'assets', 'icons', 'whatsapp.svg'), { force: true }).catch(() => {});
}

const files = (await walk(dist)).filter((f) => f.endsWith('.html'));
const urls = [];

for (const f of files) {
  let html = await fs.readFile(f, 'utf8');
  html = enforceEmailOnlyContact(html);
  await fs.writeFile(f, html);

  if (/<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) continue;

  let url = '';
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  if (canonical) url = canonical[1];
  if (!url) {
    let rel = path.relative(dist, f).replaceAll(path.sep, '/');
    if (rel === 'index.html') url = `${site.siteUrl.replace(/\/$/, '')}/`;
    else {
      if (rel.endsWith('/index.html')) rel = rel.slice(0, -'index.html'.length);
      url = `${site.siteUrl.replace(/\/$/, '')}/${rel}`;
    }
  }
  urls.push(url);
}

await cleanContactAssets();

const unique = [...new Set(urls)].sort();
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${unique.map((u) => `  <url><loc>${esc(u)}</loc></url>`).join('\n')}\n</urlset>\n`;
await fs.writeFile(path.join(dist, 'sitemap.xml'), xml);
await fs.writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.siteUrl.replace(/\/$/, '')}/sitemap.xml\n`);

const publicTextFiles = (await walk(dist)).filter((f) => /\.(?:html|js|css|json|xml|txt)$/i.test(f));
for (const f of publicTextFiles) {
  const text = await fs.readFile(f, 'utf8');
  if (/whatsapp|wa\.me|api\.whatsapp\.com/i.test(text)) {
    throw new Error(`Email-only contact policy failed: WhatsApp reference remains in ${path.relative(dist, f)}`);
  }
}
