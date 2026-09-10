import { useMemo, useState } from 'react';
import {
  BarChart3,
  Boxes,
  Calculator,
  Database,
  ExternalLink,
  Factory,
  FileCheck2,
  Info,
  Scale,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { PageHeader } from '../components/content';
import {
  brandScaleRanking,
  categoryFindings,
  fxAssumptions,
  salesRankingVerifiedAt,
  salesSources,
  trendSeries,
  volumeDisclosures,
  type EvidenceLevel,
} from '../data/salesRankings';
import { localize, type Language } from '../lib/i18n';
import type { PageLanguageProps } from './HomePage';

type RankingView = 'scale' | 'volume' | 'trend' | 'categories' | 'method';

const viewLabels: Record<RankingView, { zh: string; en: string }> = {
  scale: { zh: '综合规模榜', en: 'Scale ranking' },
  volume: { zh: '件数披露', en: 'Unit disclosures' },
  trend: { zh: '十年趋势', en: '10-year trend' },
  categories: { zh: '细分品类', en: 'Categories' },
  method: { zh: '方法与信源', en: 'Method & sources' },
};

const evidenceLabels: Record<EvidenceLevel, { zh: string; en: string }> = {
  audited: { zh: '审计/交易所披露', en: 'Audited / filing' },
  official: { zh: '官方投资者资料', en: 'Official investor material' },
  'company-claim': { zh: '企业声明', en: 'Company claim' },
  derived: { zh: '推导值', en: 'Derived' },
};

const verdictLabels = {
  supported: { zh: '披露支持', en: 'Disclosure-supported' },
  indicative: { zh: '方向性结论', en: 'Indicative' },
  insufficient: { zh: '证据不足', en: 'Insufficient evidence' },
} as const;

const chartYears = [2015, 2018, 2021, 2024];
const chartTicks = [70, 90, 110, 130, 140];
const chartMin = 70;
const chartMax = 140;
const chartLeft = 54;
const chartRight = 738;
const chartTop = 18;
const chartBottom = 224;

function chartX(year: number) {
  return chartLeft + ((year - 2015) / 9) * (chartRight - chartLeft);
}

function chartY(index: number) {
  return chartTop + ((chartMax - index) / (chartMax - chartMin)) * (chartBottom - chartTop);
}

function normalizedPoints(points: Array<{ year: number; value: number }>) {
  const base = points[0]?.value ?? 1;
  return points.map((point) => ({ ...point, index: (point.value / base) * 100 }));
}

function pathFor(points: Array<{ year: number; index: number }>) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${chartX(point.year).toFixed(1)} ${chartY(point.index).toFixed(1)}`).join(' ');
}

function formatFiscalYear(value: string, language: Language) {
  if (language === 'en') return value;
  if (value.startsWith('FY')) return `${value.slice(2)} 财年`;
  if (value.endsWith('snapshot')) return `${value.replace(' snapshot', '')} 核验`;
  return `${value} 年`;
}
function formatSourceDate(value: string, language: Language) {
  return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value));
}

export function SalesRankingsPage({ language }: PageLanguageProps) {
  const [view, setView] = useState<RankingView>('scale');
  const sourceMap = useMemo(() => new Map(salesSources.map((source) => [source.id, source])), []);
  const maxScale = brandScaleRanking[0]?.approxUsdBn ?? 1;

  const sourceLink = (sourceId: string, compact = false) => {
    const source = sourceMap.get(sourceId);
    if (!source) return null;
    return (
      <a className={compact ? 'ranking-source-link ranking-source-link--compact' : 'ranking-source-link'} href={source.url} target="_blank" rel="noreferrer">
        {compact ? source.publisher : localize(source.title, language)}
        <ExternalLink aria-hidden="true" />
      </a>
    );
  };

  return (
    <main className="page page--sales-rankings">
      <PageHeader
        language={language}
        title={{ zh: '全球轴承销量榜', en: 'Global bearing sales intelligence' }}
        description={{
          zh: '以年报、交易所文件和企业原始披露，重建近十年销售规模与细分品类竞争格局。',
          en: 'Reconstruct ten-year sales scale and category competition from annual reports, exchange filings and first-party disclosures.',
        }}
        meta={<span><ShieldCheck aria-hidden="true" />{language === 'zh' ? '10 家品牌 · 2015—2024 · 每项可追溯' : '10 brands · 2015–2024 · source-auditable'}</span>}
      />

      <section className="ranking-disclosure" aria-label={language === 'zh' ? '统计口径说明' : 'Methodology disclosure'}>
        <Info aria-hidden="true" />
        <div>
          <strong>{language === 'zh' ? '先看口径：主榜不是全球出货件数榜' : 'Read the basis first: the main table is not a global unit-shipment ranking'}</strong>
          <p>{language === 'zh'
            ? '全球企业没有统一强制披露轴承件数。主榜把最近完整年度的“轴承相关公开销售口径”按统一汇率近似换算，只表示公开口径的规模序位，不等于市场份额。件数榜仅收录企业明确披露的数据。'
            : 'There is no uniform mandatory disclosure of bearing units. The main table converts each company’s latest complete public bearing-related sales scope using one FX basis. It is a public-scope scale ordering, not market share. The unit section only includes explicit disclosures.'}</p>
        </div>
      </section>

      <section className="ranking-kpis" aria-label={language === 'zh' ? '研究覆盖摘要' : 'Research coverage summary'}>
        <article><Database aria-hidden="true" /><div><strong>10</strong><span>{language === 'zh' ? '家重点品牌' : 'tracked brands'}</span></div></article>
        <article><FileCheck2 aria-hidden="true" /><div><strong>14</strong><span>{language === 'zh' ? '条原始信源' : 'primary sources'}</span></div></article>
        <article><TrendingUp aria-hidden="true" /><div><strong>10</strong><span>{language === 'zh' ? '年连续窗口' : 'year window'}</span></div></article>
        <article><Factory aria-hidden="true" /><div><strong>2</strong><span>{language === 'zh' ? '项直接件数披露' : 'direct unit disclosures'}</span></div></article>
      </section>

      <nav className="ranking-tabs" aria-label={language === 'zh' ? '销量榜视图' : 'Sales ranking views'}>
        {(Object.keys(viewLabels) as RankingView[]).map((item) => (
          <button key={item} type="button" className={view === item ? 'is-active' : ''} onClick={() => setView(item)} aria-pressed={view === item}>
            {viewLabels[item][language]}
          </button>
        ))}
      </nav>

      {view === 'scale' && (
        <section className="ranking-panel" aria-labelledby="scale-ranking-title">
          <header className="ranking-panel__header">
            <div><span className="ranking-eyebrow">{language === 'zh' ? '01 / 规模' : '01 / SCALE'}</span><h2 id="scale-ranking-title">{language === 'zh' ? '2024 公开口径规模序位' : '2024 public-scope scale ordering'}</h2></div>
            <p>{language === 'zh' ? '统一换算为十亿美元，仅供量级比较' : 'Converted to USD billions for scale comparison only'}</p>
          </header>

          <div className="ranking-table-wrap">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>{language === 'zh' ? '序位' : 'Order'}</th>
                  <th>{language === 'zh' ? '品牌 / 国家' : 'Brand / country'}</th>
                  <th>{language === 'zh' ? '公开口径' : 'Public scope'}</th>
                  <th>{language === 'zh' ? '原币披露' : 'Reported'}</th>
                  <th>{language === 'zh' ? '约合美元' : 'Approx. USD'}</th>
                  <th>{language === 'zh' ? '可信度' : 'Confidence'}</th>
                </tr>
              </thead>
              <tbody>
                {brandScaleRanking.map((record) => (
                  <tr key={record.brand}>
                    <td><span className="ranking-position">{String(record.rank).padStart(2, '0')}</span></td>
                    <td>
                      <strong className="ranking-brand">{record.brand}</strong>
                      <span className="ranking-subline">{localize(record.country, language)} · {formatFiscalYear(record.fiscalYear, language)}</span>
                    </td>
                    <td>
                      <span>{localize(record.scope, language)}</span>
                      <small>{localize(record.caveat, language)}</small>
                    </td>
                    <td>
                      <strong>{localize(record.reported, language)}</strong>
                      {sourceLink(record.sourceIds[0], true)}
                    </td>
                    <td>
                      <strong className="ranking-usd">{language === 'zh' ? `约 ${(record.approxUsdBn * 10).toFixed(1)} 亿美元` : `$${record.approxUsdBn.toFixed(2)}B`}</strong>
                      <span className="ranking-bar"><i style={{ width: `${(record.approxUsdBn / maxScale) * 100}%` }} /></span>
                    </td>
                    <td><span className={`confidence-chip confidence-chip--${record.confidence >= 90 ? 'high' : 'medium'}`}>{record.confidence}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="ranking-panel__note">
            <Calculator aria-hidden="true" />
            <span>{language === 'zh'
              ? `换算假设：1 美元 = ${fxAssumptions.SEK} 瑞典克朗 / ${fxAssumptions.EUR} 欧元 / ${fxAssumptions.JPY} 日元 / ${fxAssumptions.CNY} 人民币。汇率为四舍五入的研究假设，约 ±5% 变动不会改变前四名序位，但可能影响第 5—6 名。`
              : `FX assumptions: USD 1 = SEK ${fxAssumptions.SEK} / EUR ${fxAssumptions.EUR} / JPY ${fxAssumptions.JPY} / CNY ${fxAssumptions.CNY}. Rounded research assumptions; ±5% does not change the top four but may affect positions 5–6.`}</span>
          </footer>
        </section>
      )}

      {view === 'volume' && (
        <section className="ranking-panel" aria-labelledby="volume-ranking-title">
          <header className="ranking-panel__header">
            <div><span className="ranking-eyebrow">{language === 'zh' ? '02 / 件数' : '02 / UNITS'}</span><h2 id="volume-ranking-title">{language === 'zh' ? '可核验的件数披露' : 'Verifiable unit disclosures'}</h2></div>
            <p>{language === 'zh' ? '不把产量、外销量和总销量混为一谈' : 'Production, external sales and total sales remain distinct'}</p>
          </header>

          <div className="unit-context">
            <span>{language === 'zh' ? '中国轴承行业 2024' : 'China bearing industry 2024'}</span>
            <strong>{language === 'zh' ? '337 亿套产量' : '33.7bn sets produced'}</strong>
            <small>{language === 'zh' ? '中国轴承工业协会数据，经人本招股说明书引用；这是行业产量，不是品牌销量。' : 'China Bearing Industry Association data cited in the C&U prospectus; industry production, not brand sales.'}</small>
          </div>

          <div className="volume-grid">
            {volumeDisclosures.map((record, index) => (
              <article className="volume-card" key={record.brand}>
                <header><span>{String(index + 1).padStart(2, '0')}</span><strong>{formatFiscalYear(record.fiscalYear, language)}</strong></header>
                <div className="volume-card__brand">{record.brand}</div>
                <h3>{localize(record.value, language)}</h3>
                <div className="volume-gauge"><i style={{ width: `${Math.min(100, (record.annualizedBn / 3) * 100)}%` }} /></div>
                <p>{localize(record.scope, language)}</p>
                <aside><Info aria-hidden="true" />{localize(record.basis, language)}</aside>
                <footer><span>{language === 'zh' ? `口径可信度 ${record.confidence}%` : `Basis confidence ${record.confidence}%`}</span>{sourceLink(record.sourceIds[0], true)}</footer>
              </article>
            ))}
          </div>

          <div className="ranking-empty-evidence">
            <Boxes aria-hidden="true" />
            <div><strong>{language === 'zh' ? '其余八家为何没有件数？' : 'Why are the other eight brands missing?'}</strong><p>{language === 'zh' ? 'SKF、舍弗勒、NSK、NTN、JTEKT、Timken、NACHI、ZWZ 的公开年报主要披露金额，不披露全球轴承出货总件数。把收入除以假定单价会因尺寸、精度等级和售后服务差异产生巨大误差，因此本页拒绝做这种伪估算。' : 'Public reports from SKF, Schaeffler, NSK, NTN, JTEKT, Timken, NACHI and ZWZ mainly disclose revenue, not global bearing units. Dividing revenue by an assumed price would create large errors from size, precision grade and service mix, so this page rejects that false estimate.'}</p></div>
          </div>
        </section>
      )}

      {view === 'trend' && (
        <section className="ranking-panel" aria-labelledby="trend-ranking-title">
          <header className="ranking-panel__header">
            <div><span className="ranking-eyebrow">{language === 'zh' ? '03 / 2015—2024' : '03 / 2015—2024'}</span><h2 id="trend-ranking-title">{language === 'zh' ? '近十年公开销售趋势' : 'Ten-year public sales trend'}</h2></div>
            <p>{language === 'zh' ? '各序列首年 = 100，消除币种与规模差异' : 'First year of each series = 100 to remove currency and scale effects'}</p>
          </header>

          <div className="trend-layout">
            <div className="trend-chart-card">
              <div className="trend-legend">
                {trendSeries.map((series) => <span key={series.id}><i style={{ background: series.color }} />{series.brand}<small>{localize(series.metric, language)}</small></span>)}
              </div>
              <svg className="trend-chart" viewBox="0 0 760 260" role="img" aria-labelledby="trend-svg-title trend-svg-desc">
                <title id="trend-svg-title">{language === 'zh' ? '2015 至 2024 年销售指数趋势图' : 'Sales index trend from 2015 to 2024'}</title>
                <desc id="trend-svg-desc">{language === 'zh' ? 'SKF、NSK 与 NACHI 的公开销售数据，各自首年设为 100。' : 'Public sales data for SKF, NSK and NACHI, indexed to 100 in each series’ first year.'}</desc>
                {chartTicks.map((tick) => (
                  <g key={tick}>
                    <line x1={chartLeft} x2={chartRight} y1={chartY(tick)} y2={chartY(tick)} className="trend-gridline" />
                    <text x="44" y={chartY(tick) + 4} textAnchor="end" className="trend-axis-label">{tick}</text>
                  </g>
                ))}
                {chartYears.map((year) => <text key={year} x={chartX(year)} y="248" textAnchor="middle" className="trend-axis-label">{year}</text>)}
                {trendSeries.map((series) => {
                  const points = normalizedPoints(series.points);
                  return (
                    <g key={series.id}>
                      <path d={pathFor(points)} fill="none" stroke={series.color} className="trend-line" />
                      {points.map((point) => (
                        <circle key={point.year} cx={chartX(point.year)} cy={chartY(point.index)} r="3.5" fill={series.color} className="trend-point">
                          <title>{`${series.brand} ${point.year}: ${point.value.toLocaleString()} ${localize(series.unit, language)} / ${language === 'zh' ? '指数' : 'index'} ${point.index.toFixed(1)}`}</title>
                        </circle>
                      ))}
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="trend-summaries">
              {trendSeries.map((series) => {
                const first = series.points[0];
                const last = series.points[series.points.length - 1];
                const years = (last?.year ?? 0) - (first?.year ?? 0);
                const cagr = first && last && years > 0 ? (Math.pow(last.value / first.value, 1 / years) - 1) * 100 : 0;
                return (
                  <article key={series.id}>
                    <header><i style={{ background: series.color }} /><strong>{series.brand}</strong><span>{first?.year}—{last?.year}</span></header>
                    <div><strong>{cagr >= 0 ? '+' : ''}{cagr.toFixed(1)}%</strong><span>{language === 'zh' ? '名义复合增速' : 'nominal CAGR'}</span></div>
                    <p>{localize(series.metric, language)} · {localize(series.unit, language)}</p>
                    {sourceLink(series.sourceIds[series.sourceIds.length - 1], true)}
                  </article>
                );
              })}
            </div>
          </div>

          <footer className="ranking-panel__note"><Scale aria-hidden="true" /><span>{language === 'zh' ? '指数只反映各公司自身名义收入变化，不代表销量件数或市场份额；日元、瑞典克朗的通胀与汇率变化也会影响趋势。NACHI 仅从 2019 年起有连续可比的轴承产品口径。' : 'The index reflects each company’s own nominal revenue change, not unit volume or market share; inflation and FX also affect the trend. NACHI has a continuous comparable bearing-product series only from 2019.'}</span></footer>
        </section>
      )}

      {view === 'categories' && (
        <section className="ranking-panel" aria-labelledby="category-ranking-title">
          <header className="ranking-panel__header">
            <div><span className="ranking-eyebrow">{language === 'zh' ? '04 / 品类' : '04 / CATEGORY'}</span><h2 id="category-ranking-title">{language === 'zh' ? '细分品类证据榜' : 'Category evidence board'}</h2></div>
            <p>{language === 'zh' ? '把“有披露支持”与“行业印象”分开' : 'Separating disclosed evidence from industry perception'}</p>
          </header>

          <div className="category-grid">
            {categoryFindings.map((finding, index) => (
              <article className={`category-card category-card--${finding.verdict}`} key={finding.id}>
                <header>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <span className={`verdict-chip verdict-chip--${finding.verdict}`}>{verdictLabels[finding.verdict][language]}</span>
                </header>
                <div className="category-card__category">{localize(finding.category, language)}</div>
                <h3>{finding.leader}</h3>
                <strong>{localize(finding.headline, language)}</strong>
                <p>{localize(finding.evidence, language)}</p>
                <aside><Info aria-hidden="true" />{localize(finding.limitations, language)}</aside>
                <footer>
                  <span>{language === 'zh' ? `结论可信度 ${finding.confidence}%` : `Finding confidence ${finding.confidence}%`}</span>
                  <div>{finding.sourceIds.slice(0, 2).map((id) => <span key={id}>{sourceLink(id, true)}</span>)}</div>
                </footer>
              </article>
            ))}
          </div>
        </section>
      )}

      {view === 'method' && (
        <section className="ranking-panel" aria-labelledby="method-title">
          <header className="ranking-panel__header">
            <div><span className="ranking-eyebrow">{language === 'zh' ? '05 / 审计轨迹' : '05 / AUDIT TRAIL'}</span><h2 id="method-title">{language === 'zh' ? '方法、边界与原始信源' : 'Method, boundaries and original sources'}</h2></div>
            <p>{language === 'zh' ? `最近核验：${salesRankingVerifiedAt}` : `Last verified: ${salesRankingVerifiedAt}`}</p>
          </header>

          <div className="method-grid">
            <article><span>01</span><BarChart3 aria-hidden="true" /><h3>{language === 'zh' ? '主榜选值' : 'Main-table selection'}</h3><p>{language === 'zh' ? '优先轴承分部收入；没有分部时使用最接近轴承的业务单元或集团收入，并在同一行写清包含项。' : 'Prefer bearing-segment revenue; otherwise use the closest bearing-related business unit or group revenue and disclose inclusions in the same row.'}</p></article>
            <article><span>02</span><Calculator aria-hidden="true" /><h3>{language === 'zh' ? '统一换算' : 'Common conversion'}</h3><p>{language === 'zh' ? '用一组透明、可复算的近似汇率换算美元；不声称为会计报表汇率，也不由小数点制造虚假精度。' : 'Use one transparent, reproducible approximate FX basis; it is not presented as an accounting FX rate and decimals do not imply false precision.'}</p></article>
            <article><span>03</span><ShieldCheck aria-hidden="true" /><h3>{language === 'zh' ? '结论门槛' : 'Finding threshold'}</h3><p>{language === 'zh' ? '审计年报与交易所文件优先；企业份额声明单独标记。无法统一产品和数量口径时，结论必须是“证据不足”。' : 'Audited reports and exchange filings come first; company share claims are separately labelled. If product and quantity scopes cannot be aligned, the verdict must be “insufficient evidence”.'}</p></article>
          </div>

          <div className="source-register">
            <header><h3>{language === 'zh' ? '原始信源登记表' : 'Primary-source register'}</h3><span>{salesSources.length} {language === 'zh' ? '项' : 'items'}</span></header>
            <ol>
              {salesSources.map((source) => (
                <li key={source.id}>
                  <span className={`source-tier source-tier--${source.evidence}`}>{evidenceLabels[source.evidence][language]}</span>
                  <div><strong>{source.publisher}</strong><span>{localize(source.supports, language)}</span></div>
                  <time dateTime={source.published}>{source.dateBasis === 'verified' ? (language === 'zh' ? '核验 ' : 'Verified ') : (language === 'zh' ? '发布 ' : 'Published ')}{formatSourceDate(source.published, language)}</time>
                  {sourceLink(source.id)}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </main>
  );
}
