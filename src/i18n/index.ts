import { zh } from './zh';
import { en } from './en';

export type Locale = 'zh' | 'en';

const dicts = { zh, en } as const;

export function t(locale: Locale) {
  return dicts[locale];
}

export function getLocaleFromUrl(url: URL): Locale {
  const path = url.pathname;
  return path === '/en' || path === '/en/' || path.startsWith('/en/') ? 'en' : 'zh';
}

/**
 * 给定当前 URL 和当前 locale，返回另一语言的 URL 路径
 */
export function getOtherLocaleUrl(url: URL, currentLocale: Locale): string {
  const path = url.pathname;
  if (currentLocale === 'zh') {
    if (path === '/') return '/en/';
    return `/en${path}`;
  } else {
    if (path === '/en' || path === '/en/') return '/';
    return path.replace(/^\/en/, '') || '/';
  }
}

/**
 * 给一个中文路径加上 locale 前缀（中文不加，英文加 /en）
 */
export function localizePath(path: string, locale: Locale): string {
  if (locale === 'zh') return path;
  if (path === '/') return '/en/';
  return `/en${path}`;
}
