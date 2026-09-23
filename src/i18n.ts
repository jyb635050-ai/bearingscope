import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  zh: {
    translation: {
      brand: { name: 'BearingScope', cn: '轴承视界', descriptor: '全球轴承情报' },
      nav: {
        home: '精选',
        news: '全部动态',
        brands: '品牌雷达',
        market: '市场未来',
        research: '论文研究',
        saved: '收藏',
        salesRankings: '全球销量榜',
        brandWebsites: '品牌官网',
      },
      topbar: {
        search: '搜索品牌、技术、论文或事件',
        searchAction: '搜索',
        menu: '打开导航',
        language: '切换为英文',
        themeLight: '切换为浅色模式',
        themeDark: '切换为深色模式',
      },
      common: {
        demo: '演示数据',
        demoNote: '所有数据仅用于产品演示',
        live: '真实内容快照',
        liveNote: '公开来源，每 3 小时自动更新',
        close: '关闭',
      },
    },
  },
  en: {
    translation: {
      brand: { name: 'BearingScope', cn: 'Bearing Intelligence', descriptor: 'Global bearing intelligence' },
      nav: {
        home: 'Briefing',
        news: 'All updates',
        brands: 'Brand radar',
        market: 'Market outlook',
        research: 'Research',
        saved: 'Saved',
        salesRankings: 'Global sales',
        brandWebsites: 'Official sites',
      },
      topbar: {
        search: 'Search brands, technology, papers or events',
        searchAction: 'Search',
        menu: 'Open navigation',
        language: '切换为中文',
        themeLight: 'Switch to light mode',
        themeDark: 'Switch to dark mode',
      },
      common: {
        demo: 'Sample data',
        demoNote: 'All data is for product demonstration only',
        live: 'Live source snapshot',
        liveNote: 'Public sources, refreshed every 3 hours',
        close: 'Close',
      },
    },
  },
} as const;

const storedLanguage = typeof window === 'undefined' ? null : window.localStorage.getItem('bearingscope.language');

void i18n.use(initReactI18next).init({
  resources,
  lng: storedLanguage === 'en' ? 'en' : 'zh',
  fallbackLng: 'zh',
  interpolation: { escapeValue: false },
});

export default i18n;
