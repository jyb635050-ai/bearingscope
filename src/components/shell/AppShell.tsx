import { useState, type FormEvent, type ReactNode } from 'react';
import {
  Bookmark,
  Building2,
  FileText,
  Languages,
  ListFilter,
  Menu,
  Moon,
  Radar,
  Search,
  Sparkles,
  Sun,
  TrendingUp,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import type { Language } from '../../lib/i18n';
import type { Theme } from '../../hooks/usePreferences';
import { BearingMark } from './BearingMark';

interface AppShellProps {
  children: ReactNode;
  language: Language;
  theme: Theme;
  onLanguageChange: (language: Language) => void;
  onThemeToggle: () => void;
}

const navItems = [
  { to: '/', key: 'home', icon: Sparkles, end: true },
  { to: '/news', key: 'news', icon: ListFilter },
  { to: '/brands', key: 'brands', icon: Radar },
  { to: '/market', key: 'market', icon: TrendingUp },
  { to: '/research', key: 'research', icon: FileText },
  { to: '/saved', key: 'saved', icon: Bookmark },
] as const;

export function AppShell({ children, language, theme, onLanguageChange, onThemeToggle }: AppShellProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const normalized = query.trim();
    navigate(normalized ? `/news?q=${encodeURIComponent(normalized)}` : '/news');
    setMenuOpen(false);
  };

  const sidebar = (
    <>
      <NavLink className="brand-lockup" to="/" onClick={() => setMenuOpen(false)} aria-label="BearingScope home">
        <BearingMark />
        <span className="brand-lockup__type">
          <strong>{t('brand.name')}</strong>
          <small>{t('brand.cn')}</small>
        </span>
      </NavLink>

      <nav className="primary-nav" aria-label="Primary navigation">
        {navItems.map((item) => {
          const { to, key, icon: Icon } = item;
          const end = 'end' in item ? item.end : undefined;
          return (
          <NavLink
            key={key}
            to={to}
            end={end}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => `primary-nav__item${isActive ? ' is-active' : ''}`}
          >
            <Icon aria-hidden="true" size={19} strokeWidth={1.7} />
            <span>{t(`nav.${key}`)}</span>
          </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-foot">
        <div className="demo-notice">
          <span className="demo-notice__dot" />
          <div>
            <strong>{t('common.demo')}</strong>
            <span>{t('common.demoNote')}</span>
          </div>
        </div>
        <div className="source-promise">
          <Building2 size={16} aria-hidden="true" />
          <span>{language === 'zh' ? '官网 · 微信 · 期刊' : 'Pressrooms · WeChat · Journals'}</span>
        </div>
      </div>
    </>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">{sidebar}</aside>

      <div className="mobile-topbar">
        <button className="icon-button" type="button" aria-label={t('topbar.menu')} onClick={() => setMenuOpen(true)}>
          <Menu size={21} />
        </button>
        <NavLink className="mobile-brand" to="/">
          <BearingMark compact />
          <strong>BearingScope</strong>
        </NavLink>
      </div>

      {menuOpen && (
        <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label={t('topbar.menu')}>
          <button className="mobile-drawer__scrim" aria-label={t('common.close')} onClick={() => setMenuOpen(false)} />
          <aside className="mobile-drawer__panel">
            <button className="icon-button mobile-drawer__close" type="button" onClick={() => setMenuOpen(false)} aria-label={t('common.close')}>
              <X size={20} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="app-frame">
        <header className="utility-bar">
          <form className="global-search" role="search" onSubmit={submitSearch}>
            <Search size={17} aria-hidden="true" />
            <label className="sr-only" htmlFor="global-search-input">{t('topbar.search')}</label>
            <input
              id="global-search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('topbar.search')}
            />
            <kbd>⌘ K</kbd>
          </form>
          <div className="utility-actions">
            <button
              className="utility-button language-switch"
              type="button"
              aria-label={t('topbar.language')}
              onClick={() => onLanguageChange(language === 'zh' ? 'en' : 'zh')}
            >
              <Languages size={16} aria-hidden="true" />
              <span className={language === 'zh' ? 'is-current' : ''}>中</span>
              <span aria-hidden="true">/</span>
              <span className={language === 'en' ? 'is-current' : ''}>EN</span>
            </button>
            <button
              className="icon-button theme-switch"
              type="button"
              onClick={onThemeToggle}
              aria-label={theme === 'dark' ? t('topbar.themeLight') : t('topbar.themeDark')}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
