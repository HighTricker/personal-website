---
title: 用大模型分析我
description: 大模型如何通过 GitHub 公开仓库 + 一份目录指引，按需 fetch 鲁家琪网站内容回答关于他的问题。
lang: zh
---

## 1. 怎么用

复制下面这段提示词，给 ChatGPT / Claude / 通义千问 / 豆包 / Kimi 等任何大模型：

```
请阅读 https://www.lujiaqi.top/llms.txt 了解鲁家琪的网站结构。按指引去 GitHub 公开仓库的 raw 文件按需 fetch 内容，回答关于他的问题。
```

然后问任何关于我的问题，大模型会基于我提供的真实资料回答。

## 2. 大模型会获得什么

- **全部公开文章**：3 篇文章的原始 markdown（`src/content/articles/`）
- **自我介绍**：`about.md`（工作经历、价值观）
- **联系方式 + 社交链接**：`site.ts`（X / 小红书 / 邮箱）

## 3. 我的思路

不在网站上重新打包内容，而是**直接利用 GitHub 公开仓库**：

`https://github.com/HighTricker/personal-website`

所有公开内容已经同步在那里。大模型可以直接拉 raw URL 拿到原始 markdown：

`https://raw.githubusercontent.com/HighTricker/personal-website/main/<路径>`

我只需要给大模型一份"目录指引"（即 `https://www.lujiaqi.top/llms.txt`），告诉它：

- 仓库在哪
- 用 raw URL 怎么拉文件
- 哪些内容值得读、哪些跳过（比如照片墙不读）
- 推荐工作流：先读 about，再按需读文章

大模型按需 fetch，不浪费 context；我加新内容只要 push 到仓库，网站自动同步——零维护成本。
