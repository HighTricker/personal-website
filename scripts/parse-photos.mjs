// 一次性脚本：解析 真实数据文件/照片/照片说明.md → src/data/photos.json
// 运行：node scripts/parse-photos.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SOURCE = path.resolve(PROJECT_ROOT, '..', '真实数据文件', '照片', '照片说明.md');
const OUTPUT = path.join(PROJECT_ROOT, 'src', 'data', 'photos.json');

if (!fs.existsSync(SOURCE)) {
  console.error(`Source not found: ${SOURCE}`);
  process.exit(1);
}

const raw = fs.readFileSync(SOURCE, 'utf-8');

// 跳过首个 frontmatter 块
const fmEnd = raw.indexOf('---', 3);
const body = raw.slice(fmEnd + 3);

const lines = body.split('\n');
const photos = [];
let current = null;

for (const rawLine of lines) {
  const line = rawLine.trim();
  if (!line) continue;

  // 跳过 H2 年份分组
  if (/^##\s+\d{4}\b/.test(line)) continue;

  // H3 = 文件名
  if (line.startsWith('### ')) {
    if (current) photos.push(current);
    const filename = line.slice(4).trim();
    const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
    current = {
      filename,
      date: dateMatch?.[1] ?? '',
      caption: '',
      note: '',
      _content: [], // 临时累积
    };
    continue;
  }

  // 累积内容到当前照片
  if (current) {
    current._content.push(line);
  }
}

if (current) photos.push(current);

// 后处理：每张的 _content 最后一行 = caption，前面的拼为 note
for (const photo of photos) {
  const content = photo._content;
  if (content.length === 0) {
    photo.caption = '';
    photo.note = '';
  } else {
    photo.caption = content[content.length - 1];
    photo.note = content.slice(0, -1).join('\n');
  }
  delete photo._content;
}

// 按日期倒序（最新在前）
photos.sort((a, b) => b.date.localeCompare(a.date));

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(photos, null, 2), 'utf-8');

console.log(`Parsed ${photos.length} photos → ${OUTPUT}`);
console.log(`First entry:`, photos[0]);
console.log(`Last entry:`, photos[photos.length - 1]);
