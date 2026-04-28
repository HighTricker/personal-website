// 一次性脚本：压缩 public/photos/ 下原图 + 生成 public/thumbs/ 缩略图
// 运行：node scripts/compress-photos.mjs
//
// 处理：
// 1. 大图（覆盖原文件）：1920 长边 + JPG quality 88 + 清 EXIF（GPS 等隐私）
// 2. 缩略图（public/thumbs/）：200×200 cover-crop + WebP quality 80

import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PHOTOS_DIR = path.join(PROJECT_ROOT, 'public', 'photos');
const THUMBS_DIR = path.join(PROJECT_ROOT, 'public', 'thumbs');

await fs.mkdir(THUMBS_DIR, { recursive: true });

const files = await fs.readdir(PHOTOS_DIR);
const photos = files.filter((f) => /\.(jpg|jpeg|png)$/i.test(f));

console.log(`Found ${photos.length} photos in ${PHOTOS_DIR}`);

let processed = 0;
let totalOriginal = 0;
let totalCompressed = 0;
let totalThumb = 0;

const fmtKB = (b) => `${(b / 1024).toFixed(0)}KB`;
const fmtMB = (b) => `${(b / 1024 / 1024).toFixed(1)}MB`;

for (const filename of photos) {
  const sourcePath = path.join(PHOTOS_DIR, filename);
  const stat = await fs.stat(sourcePath);
  totalOriginal += stat.size;

  // 1. 压缩大图：1920 长边，JPG q=88，清 EXIF（含 GPS 隐私）
  // 先 readFile 到 buffer 避免 sharp 持有文件 handle 导致 writeFile 锁定（Windows + dev server 在跑）
  const buf = await fs.readFile(sourcePath);
  const compressed = await sharp(buf)
    .rotate() // 自动按 EXIF orientation 旋转，旋转后 EXIF orientation 标记清除
    .resize({
      width: 1920,
      height: 1920,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer(); // 默认不保留 EXIF（GPS 等隐私字段全清）

  await fs.writeFile(sourcePath, compressed);
  totalCompressed += compressed.length;

  // 2. 缩略图：200×200 cover-crop（实际渲染 400 高 dpr 友好），WebP q=80
  const thumbName = filename.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const thumbPath = path.join(THUMBS_DIR, thumbName);
  const thumb = await sharp(compressed)
    .resize({ width: 400, height: 400, fit: 'cover', position: 'attention' })
    .webp({ quality: 80 })
    .toBuffer();

  await fs.writeFile(thumbPath, thumb);
  totalThumb += thumb.length;

  processed++;
  if (processed % 10 === 0 || processed === photos.length) {
    console.log(
      `[${processed}/${photos.length}] last: ${filename} ${fmtKB(stat.size)} → ${fmtKB(compressed.length)}`
    );
  }
}

console.log(`
================ 压缩完成 ================
处理：${processed} 张
原图总大小：${fmtMB(totalOriginal)}
压缩后大图：${fmtMB(totalCompressed)} (${PHOTOS_DIR})
缩略图：    ${fmtMB(totalThumb)} (${THUMBS_DIR})
压缩率：    大图 ${((1 - totalCompressed / totalOriginal) * 100).toFixed(0)}% / 缩略图 ${((1 - totalThumb / totalOriginal) * 100).toFixed(0)}%
==========================================
`);
