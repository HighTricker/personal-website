---
title: Use AI to Analyze Me
description: How LLMs use a GitHub public repo + a directory guide to fetch Lu Jiaqi's website content on demand and answer questions about him.
lang: en
---

## 1. How to Use

Copy the prompt below and give it to any LLM (ChatGPT / Claude / Gemini / Grok / etc.):

```
Please read https://www.lujiaqi.top/llms.txt to understand the structure of Lu Jiaqi's website. Follow the guide to fetch raw files from the public GitHub repo on demand, then answer questions about him.
```

Then ask the LLM anything about me — it will answer based on real material I provide.

## 2. What the LLM Will Receive

- **All public articles**: 3 articles' raw markdown (`src/content/articles/`) — note: articles are in Chinese
- **Self-introduction**: `about.md` (work experience, values)
- **Contact + social links**: `site.ts` (X / Xiaohongshu / Email)

## 3. The Idea

Instead of repackaging content on the website, I **directly leverage the GitHub public repo**:

`https://github.com/HighTricker/personal-website`

All public content is already synced there. The LLM can directly fetch raw URLs to get original markdown:

`https://raw.githubusercontent.com/HighTricker/personal-website/main/<path>`

I just need to give the LLM a "directory guide" (i.e., `https://www.lujiaqi.top/llms.txt`), telling it:

- Where the repo lives
- How to fetch files via raw URL
- Which content is worth reading and which to skip (e.g., the photo wall is not read)
- Recommended workflow: read `about` first, then read articles on demand

The LLM fetches on demand, doesn't waste context; when I add new content, I just push to the repo and the website syncs automatically — zero maintenance cost.
