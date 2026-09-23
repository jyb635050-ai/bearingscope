import { useMemo, useState } from 'react';
import { ExternalLink, Globe2, MapPin, Search, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../components/content';
import { brandWebsiteRegions, brandWebsites, type BrandWebsiteRegion } from '../data/brandWebsites';
import { localize } from '../lib/i18n';
import '../brandWebsites.css';
import type { PageLanguageProps } from './HomePage';

type RegionFilter = 'all' | BrandWebsiteRegion;

export function BrandWebsitesPage({ language }: PageLanguageProps) {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<RegionFilter>('all');

  const visibleBrands = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(language === 'zh' ? 'zh-CN' : 'en');
    return brandWebsites.filter((brand) => {
      if (region !== 'all' && brand.region !== region) return false;
      if (!normalized) return true;
      return [brand.mark, brand.name.zh, brand.name.en, brand.company.zh, brand.company.en, brand.country.zh, brand.country.en]
        .join(' ')
        .toLocaleLowerCase(language === 'zh' ? 'zh-CN' : 'en')
        .includes(normalized);
    });
  }, [language, query, region]);

  return (
    <main className="page page--brand-websites">
      <PageHeader
        language={language}
        title={{ zh: '品牌官网直达', en: 'Official brand websites' }}
        description={{ zh: '汇集全球主要轴承制造商的官方入口，点击品牌方块即可访问厂商官网。', en: 'Direct links to official websites of major bearing manufacturers worldwide.' }}
        meta={<span><ShieldCheck aria-hidden="true" />{language === 'zh' ? `${brandWebsites.length} 个厂商官方域名 · 不是经销商目录` : `${brandWebsites.length} manufacturer-owned domains · not a distributor directory`}</span>}
      />

      <section className="brand-directory-toolbar" aria-label={language === 'zh' ? '品牌官网筛选' : 'Official website filters'}>
        <label className="brand-directory-search">
          <Search aria-hidden="true" />
          <span className="sr-only">{language === 'zh' ? '搜索品牌、公司或国家' : 'Search brand, company or country'}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={language === 'zh' ? '搜索品牌、公司或国家' : 'Search brand, company or country'}
          />
        </label>

        <div className="brand-region-filter" role="group" aria-label={language === 'zh' ? '按地区筛选' : 'Filter by region'}>
          {brandWebsiteRegions.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={region === item.id}
              onClick={() => setRegion(item.id)}
            >
              {localize(item.label, language)}
            </button>
          ))}
        </div>

        <p className="brand-directory-count" aria-live="polite">
          {language === 'zh' ? `显示 ${visibleBrands.length} 个品牌` : `${visibleBrands.length} brands shown`}
        </p>
      </section>

      {visibleBrands.length > 0 ? (
        <section className="brand-site-grid" aria-label={language === 'zh' ? '全球轴承品牌官网' : 'Global bearing brand websites'}>
          {visibleBrands.map((brand) => {
            const hostname = new URL(brand.url).hostname.replace(/^www\./, '');
            const name = localize(brand.name, language);
            return (
              <a
                className="brand-site-card"
                href={brand.url}
                key={brand.id}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={language === 'zh' ? `打开${name}官网（新窗口）` : `Open the ${name} website in a new tab`}
              >
                <header>
                  <span className="brand-site-card__mark" aria-hidden="true">{brand.mark}</span>
                  <ExternalLink aria-hidden="true" />
                </header>
                <div className="brand-site-card__body">
                  <h2>{name}</h2>
                  <p>{localize(brand.company, language)}</p>
                </div>
                <footer>
                  <span><MapPin aria-hidden="true" />{localize(brand.country, language)}</span>
                  <span>{hostname}</span>
                </footer>
              </a>
            );
          })}
        </section>
      ) : (
        <section className="brand-site-empty">
          <Globe2 aria-hidden="true" />
          <h2>{language === 'zh' ? '没有匹配的品牌' : 'No matching brands'}</h2>
          <p>{language === 'zh' ? '请更换地区或搜索关键词。' : 'Try another region or search term.'}</p>
        </section>
      )}

      <aside className="brand-directory-note">
        <ShieldCheck aria-hidden="true" />
        <p>
          <strong>{language === 'zh' ? '官网核验说明' : 'Verification note'}</strong>
          <span>{language === 'zh' ? '仅收录制造商或所属集团控制的公开域名；名单用于快速访问，不代表规模、质量或销量排名。链接于 2026 年 9 月核验。' : 'Only public domains controlled by manufacturers or their parent groups are listed. This directory is not a ranking of size, quality or sales. Links were verified in September 2026.'}</span>
        </p>
      </aside>
    </main>
  );
}
