import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const site = JSON.parse(await fs.readFile(path.join(root,'src/data/site.json'),'utf8'));

async function walk(dir){
  const out=[];
  for(const e of await fs.readdir(dir,{withFileTypes:true})){
    const p=path.join(dir,e.name);
    e.isDirectory()?out.push(...await walk(p)):out.push(p);
  }
  return out;
}
function esc(s){return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');}
const files=(await walk(dist)).filter(f=>f.endsWith('.html'));
const urls=[];
for(const f of files){
  const html=await fs.readFile(f,'utf8');
  if(/<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) continue;
  let url='';
  const canonical=html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  if(canonical) url=canonical[1];
  if(!url){
    let rel=path.relative(dist,f).replaceAll(path.sep,'/');
    if(rel==='index.html') url=`${site.siteUrl.replace(/\/$/,'')}/`;
    else { if(rel.endsWith('/index.html')) rel=rel.slice(0,-'index.html'.length); url=`${site.siteUrl.replace(/\/$/,'')}/${rel}`; }
  }
  urls.push(url);
}
const unique=[...new Set(urls)].sort();
const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${unique.map(u=>`  <url><loc>${esc(u)}</loc></url>`).join('\n')}\n</urlset>\n`;
await fs.writeFile(path.join(dist,'sitemap.xml'),xml);
await fs.writeFile(path.join(dist,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${site.siteUrl.replace(/\/$/,'')}/sitemap.xml\n`);
