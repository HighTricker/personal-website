// 站点全局配置
// 2026-04-28 改为直接使用 163 邮箱（所有者选择，简化 Cloudflare Email Routing 配置）

export const SITE = {
  name: "鲁家琪",
  url: "https://lujiaqi.top",

  email: "ljq2603@163.com",

  social: {
    x: "https://x.com/LuJia5774",
    xiaohongshu: "https://xhslink.com/m/mud7FNpIsQ",
  },

  beian: {
    icp: "粤ICP备2025441652号-1",
    icpUrl: "https://beian.miit.gov.cn/",
    police: "粤公网安备44030002008021号",
    policeUrl: "https://beian.mps.gov.cn/#/",
  },

  assets: {
    avatar: "/avatar.jpg",
    ogDefault: "/og-default.jpg",
    policeBadge: "/icons/police-badge.png",
  },

  copyright: {
    year: 2026,
    holder: "鲁家琪",
  },
} as const;
