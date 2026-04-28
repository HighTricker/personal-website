import { useState, useEffect, useCallback } from 'react';

interface Photo {
  filename: string;
  date: string;
  caption: string;
  note: string;
}

interface Props {
  photos: Photo[];
}

export default function PhotoLightbox({ photos }: Props) {
  const [index, setIndex] = useState<number | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(() => {
    setIndex((i) => (i === null || i <= 0 ? i : i - 1));
  }, []);
  const next = useCallback(() => {
    setIndex((i) => (i === null || i >= photos.length - 1 ? i : i + 1));
  }, [photos.length]);

  // 监听照片墙按钮的点击事件
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('[data-photo-filename]') as HTMLElement | null;
      if (!button) return;
      e.preventDefault();
      const filename = button.getAttribute('data-photo-filename');
      const idx = photos.findIndex((p) => p.filename === filename);
      if (idx !== -1) setIndex(idx);
    };

    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [photos]);

  // 键盘控制：ESC 关闭 / 左右箭头切换
  useEffect(() => {
    if (index === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [index, close, prev, next]);

  // 弹框打开时锁定 body 滚动
  useEffect(() => {
    document.body.style.overflow = index !== null ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [index]);

  if (index === null) return null;
  const photo = photos[index];
  if (!photo) return null;

  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 md:p-8"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption}
    >
      <div
        className="bg-white rounded-2xl flex flex-col md:flex-row overflow-hidden shadow-2xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 左：照片（弹框宽度跟图比例自适应，无黑边）*/}
        <div className="bg-black flex items-center justify-center flex-shrink-0">
          <img
            src={`/photos/${photo.filename}`}
            alt={photo.caption}
            className="block w-auto h-auto max-w-full md:max-w-[calc(90vw-320px-2rem)] max-h-[60vh] md:max-h-[90vh]"
          />
        </div>

        {/* 右：说明（note → caption 紧接 → 计数器在底）*/}
        <div className="w-full md:w-[320px] flex-shrink-0 p-6 md:p-8 overflow-y-auto flex flex-col gap-3">
          {photo.note && (
            <p className="text-base md:text-xl leading-relaxed text-charcoal whitespace-pre-line">
              {photo.note}
            </p>
          )}
          <p className="text-xs md:text-lg text-charcoal/55">
            {photo.caption}
          </p>
          <p className="text-xs text-charcoal/40 mt-auto pt-4">
            {index + 1} / {photos.length}
          </p>
        </div>
      </div>

      {/* 关闭叉 */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white text-charcoal flex items-center justify-center hover:bg-gray-100 shadow-lg text-xl leading-none"
        aria-label="关闭"
      >
        ✕
      </button>

      {/* 左箭头 */}
      {hasPrev && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white text-charcoal flex items-center justify-center hover:bg-gray-100 shadow-lg text-2xl leading-none"
          aria-label="上一张"
        >
          ‹
        </button>
      )}

      {/* 右箭头 */}
      {hasNext && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white text-charcoal flex items-center justify-center hover:bg-gray-100 shadow-lg text-2xl leading-none"
          aria-label="下一张"
        >
          ›
        </button>
      )}
    </div>
  );
}
