import type { Language } from '../../lib/i18n';

interface PageHeaderProps {
  language: Language;
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  meta?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({ language, title, description, meta, children }: PageHeaderProps) {
  const bearingHeroUrl = `${import.meta.env.BASE_URL}bearing-product.png`;
  return (
    <header className="page-header">
      <div className="page-header__copy">
        <h1>{title[language]}</h1>
        <p>{description[language]}</p>
        {meta && <div className="page-header__meta">{meta}</div>}
        {children && <div className="page-header__actions">{children}</div>}
      </div>
      <div className="page-header__visual">
        <img
          className="page-header__product"
          src={bearingHeroUrl}
          alt={language === 'zh' ? '精密深沟球轴承，展示钢制内外圈、钢球与保持架' : 'Precision deep-groove ball bearing with steel rings, balls and cage'}
          width="1536"
          height="1024"
          fetchPriority="high"
          decoding="async"
        />
      </div>
    </header>
  );
}
