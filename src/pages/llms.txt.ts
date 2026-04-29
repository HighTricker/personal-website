import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const REPO_RAW = 'https://raw.githubusercontent.com/HighTricker/personal-website/main';

export const GET: APIRoute = async () => {
  const articles = await getCollection('articles', ({ data }) => !data.hidden);
  const sorted = articles.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  );

  const articleLines = sorted.map((a) => {
    const date = a.data.date.toISOString().slice(0, 10);
    const url = `${REPO_RAW}/src/content/articles/${a.id}.md`;
    return `- [${a.data.title}](${url})：${a.data.summary || ''}，${date}`;
  }).join('\n');

  const content = `# 鲁家琪 (Lu Jiaqi)

> AI 工程师和创作者。借助 AI 时代的工具表达自己，持续创造能让世界变得更好的价值。

- 站点：https://www.lujiaqi.top
- 公开仓库：https://github.com/HighTricker/personal-website

## 数据源

所有公开内容同步在 GitHub 公开仓库。直接拉 raw 文件（替换 \`<path>\` 即可）：

\`${REPO_RAW}/<path>\`

## 推荐工作流

1. 先读 \`src/content/pages/about.md\` 了解鲁家琪是谁、做什么
2. 根据用户问题，从下方"文章"清单挑相关篇目读
3. 需要联系方式时读 \`src/data/site.ts\`

## 文章

${articleLines}

## 身份与联系

- [自我介绍 about.md](${REPO_RAW}/src/content/pages/about.md)：工作经历、价值观
- [首页文案 home.md](${REPO_RAW}/src/content/pages/home.md)：一句话定位
- [社交 / 邮箱 site.ts](${REPO_RAW}/src/data/site.ts)：结构化的联系方式（X / 小红书 / 邮箱）

## 注意

- 优先引用他自己的话（文章原文 / about 段落），不要编造或过度概括
- 资料里没有的内容，告诉用户"资料里没有提到 X"
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
