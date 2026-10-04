import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'src/content/blog');
const files=(await fs.readdir(dir)).filter(f=>f.endsWith('.md'));
let warnings=0;
for(const f of files){
  const t=await fs.readFile(path.join(dir,f),'utf8');
  const front=t.match(/^---\n([\s\S]*?)\n---/)?.[1] || '';
  const get=(k)=>front.match(new RegExp(`^${k}:\\s*["']?(.+?)["']?$`,'m'))?.[1]?.trim();
  const title=get('seoTitle')||get('title')||''; const desc=get('seoDescription')||get('description')||'';
  const checks=[];
  if(title.length<30||title.length>65) checks.push(`SEO title length ${title.length}`);
  if(desc.length<110||desc.length>165) checks.push(`meta description length ${desc.length}`);
  if(!get('imageAlt')) checks.push('missing featured image alt text');
  if(!get('canonical')) checks.push('missing canonical URL');
  if(checks.length){ warnings++; console.log(`${f}: ${checks.join('; ')}`); }
}
console.log(warnings ? `SEO check finished with ${warnings} post(s) needing review.` : 'SEO check passed.');
