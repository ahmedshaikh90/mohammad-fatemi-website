import rss from '@astrojs/rss';
export async function GET(context) {
  const modules = import.meta.glob('../content/blog/*.md', { eager: true });
  const items = Object.entries(modules).filter(([,m]) => !m.frontmatter.draft).map(([path,m]) => ({
    title:m.frontmatter.title,
    description:m.frontmatter.description,
    pubDate:new Date(m.frontmatter.date),
    link:`/blog/${path.split('/').pop().replace('.md','')}/`,
    categories:m.frontmatter.tags || []
  }));
  return rss({ title:'Mohammad Fatemi — Insights', description:'Business strategy, Web3 and growth insights by Mohammad Fatemi.', site:context.site, items });
}
