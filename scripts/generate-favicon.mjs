// 一次性脚本：从 public/avatar.jpg 生成多尺寸 favicon + apple-touch-icon + OG 默认分享图
// 运行：node scripts/generate-favicon.mjs

import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');

const SOURCE = path.join(PUBLIC_DIR, 'avatar.jpg');
const buf = await fs.readFile(SOURCE);

const sizes = [
  { name: 'favicon-32.png', size: 32 },
  { name: 'favicon-192.png', size: 192 },
  { name: 'apple-touch-icon.png', size: 180 },
];

for (const { name, size } of sizes) {
  const out = path.join(PUBLIC_DIR, name);
  await sharp(buf)
    .resize(size, size, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toFile(out);
  const stat = await fs.stat(out);
  console.log(`Generated ${name} (${size}×${size}, ${(stat.size / 1024).toFixed(1)}KB)`);
}

// OG 默认分享图：1200×630（Open Graph 标准比例）
// avatar 居中放，左右用 Warm Cream 背景填充（与全站主色调一致）
const ogPath = path.join(PUBLIC_DIR, 'og-default.jpg');
await sharp(buf)
  .resize(1200, 630, { fit: 'contain', background: '#e9e5dd' })
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(ogPath);
const ogStat = await fs.stat(ogPath);
console.log(`Generated og-default.jpg (1200×630, ${(ogStat.size / 1024).toFixed(1)}KB)`);

console.log('\nDone.');
