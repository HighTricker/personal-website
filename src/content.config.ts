// Content Collections 配置 — Astro 6 loader API
// articles: 4 篇文章；pages: home / about
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    // slug：与文件名 stem 一致，显式记录在 frontmatter 中便于追踪
    // （URL 实际路由仍由 entry.id = 文件名决定，本字段仅文档化）
    slug: z.string().optional(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional().nullable(),
    summary: z.string(),
    // hidden: true 表示从首页 + 列表过滤，但 URL 仍可访问（用于不公开展示但可分享的文章）
    hidden: z.boolean().optional().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lang: z.string().default('zh'),
  }),
});

export const collections = { articles, pages };
