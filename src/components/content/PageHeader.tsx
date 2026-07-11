import type { Language } from '../../lib/i18n';

interface PageHeaderProps {
  language: Language;
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  meta?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({ language, title, description, meta, children }: PageHeaderProps) {
  const bearingHeroUrl = `${import.meta.env.BASE_URL}bearing-hero.svg`;
  return (
    <header className="page-header" style={{ backgroundImage: `url("${bearingHeroUrl}")` }}>
      <div className="page-header__copy">
        <h1>{title[language]}</h1>
        <p>{description[language]}</p>
        {meta && <div className="page-header__meta">{meta}</div>}
      </div>
      {children && <div className="page-header__actions">{children}</div>}
      <div className="page-header__bearing" aria-hidden="true">
        <span className="bearing-ring bearing-ring--outer" />
        <span className="bearing-ring bearing-ring--inner" />
        <span className="bearing-ball bearing-ball--1" />
        <span className="bearing-ball bearing-ball--2" />
        <span className="bearing-ball bearing-ball--3" />
        <span className="bearing-ball bearing-ball--4" />
        <span className="bearing-ball bearing-ball--5" />
        <span className="bearing-ball bearing-ball--6" />
      </div>
    </header>
  );
}
