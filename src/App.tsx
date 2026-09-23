import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/shell/AppShell';
import { useTheme } from './hooks/usePreferences';
import type { Language } from './lib/i18n';
import { BrandsPage, BrandWebsitesPage, HomePage, MarketPage, NewsPage, ResearchPage, SalesRankingsPage, SavedPage } from './pages';

export default function App() {
  const { i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const language = useMemo<Language>(() => (i18n.language.startsWith('en') ? 'en' : 'zh'), [i18n.language]);

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    window.localStorage.setItem('bearingscope.language', language);
  }, [language]);

  const changeLanguage = (next: Language) => {
    void i18n.changeLanguage(next);
  };

  return (
    <AppShell language={language} theme={theme} onLanguageChange={changeLanguage} onThemeToggle={toggleTheme}>
      <Routes>
        <Route path="/" element={<HomePage language={language} />} />
        <Route path="/news" element={<NewsPage language={language} />} />
        <Route path="/brands" element={<BrandsPage language={language} />} />
        <Route path="/market" element={<MarketPage language={language} />} />
        <Route path="/research" element={<ResearchPage language={language} />} />
        <Route path="/saved" element={<SavedPage language={language} />} />
        <Route path="/sales-rankings" element={<SalesRankingsPage language={language} />} />
        <Route path="/brand-websites" element={<BrandWebsitesPage language={language} />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </AppShell>
  );
}
