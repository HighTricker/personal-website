import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const articles = await getCollection('articles');
  return articles.map(article => ({
    params: { slug: article.id },
    props: { article },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { article } = props;
  const dateStr = article.data.date.toISOString().slice(0, 10);
  const tagsYaml = JSON.stringify(article.data.tags);
  const summaryYaml = JSON.stringify(article.data.summary);
  const titleYaml = JSON.stringify(article.data.title);

  const frontmatter = `---
title: ${titleYaml}
date: ${dateStr}
tags: ${tagsYaml}
summary: ${summaryYaml}
---

`;

  const body = article.body ?? '';
  const content = frontmatter + body;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${article.id}.md"`,
    },
  });
};
