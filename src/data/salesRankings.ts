import type { LocalizedText } from '../shared/types';

export type EvidenceLevel = 'audited' | 'official' | 'company-claim' | 'derived';

export interface SalesSource {
  id: string;
  publisher: string;
  title: LocalizedText;
  url: string;
  evidence: EvidenceLevel;
  published: string;
  dateBasis?: 'published' | 'verified';
  supports: LocalizedText;
}

export interface BrandScaleRecord {
  rank: number;
  brand: string;
  country: LocalizedText;
  fiscalYear: string;
  scope: LocalizedText;
  reported: LocalizedText;
  approxUsdBn: number;
  confidence: number;
  sourceIds: string[];
  caveat: LocalizedText;
}

export const salesRankingYears = [2025, 2024, 2023] as const;
export type SalesRankingYear = (typeof salesRankingYears)[number];

export interface VolumeDisclosure {
  brand: string;
  value: LocalizedText;
  annualizedBn: number;
  fiscalYear: string;
  scope: LocalizedText;
  basis: LocalizedText;
  confidence: number;
  sourceIds: string[];
}

export interface TrendSeries {
  id: string;
  brand: string;
  metric: LocalizedText;
  unit: LocalizedText;
  color: string;
  points: Array<{ year: number; value: number }>;
  sourceIds: string[];
}

export interface CategoryFinding {
  id: string;
  category: LocalizedText;
  verdict: 'supported' | 'indicative' | 'insufficient';
  leader: string;
  headline: LocalizedText;
  evidence: LocalizedText;
  limitations: LocalizedText;
  confidence: number;
  sourceIds: string[];
}

export const salesSources: SalesSource[] = [
  {
    id: 'skf-2024',
    publisher: 'SKF',
    title: { zh: 'SKF 2024 年年度与可持续发展报告', en: 'SKF Annual and Sustainability Report 2024' },
    url: 'https://cdn.skfmediahub.skf.com/api/public/098d89215847ae43/pdf_preview_medium/098d89215847ae43_pdf_preview_medium.pdf?download=false&published=false',
    evidence: 'audited',
    published: '2025-04-01',
    supports: { zh: '集团、工业与汽车业务收入；2018—2024 七年回顾', en: 'Group, Industrial and Automotive sales; 2018–2024 review' },
  },
  {
    id: 'skf-2019',
    publisher: 'SKF',
    title: { zh: 'SKF 2019 年年度报告', en: 'SKF Annual Report 2019' },
    url: 'https://cdn.skfmediahub.skf.com/api/public/0994a17fc46d4f45/pdf_preview_medium/0994a17fc46d4f45_pdf_preview_medium.pdf?download=false&published=false',
    evidence: 'audited',
    published: '2020-03-05',
    supports: { zh: '2015—2019 经重述集团收入', en: 'Restated 2015–2019 group sales' },
  },
  {
    id: 'schaeffler-2024',
    publisher: 'Schaeffler',
    title: { zh: '舍弗勒集团 2024 年年度报告', en: 'Schaeffler Group Annual Report 2024' },
    url: 'https://www.schaeffler.com/remotemedien/media/_shared_media_rwd/08_investor_relations/reports/2024_ar/2024_schaeffler_annual_report_en_4lcd3b.pdf',
    evidence: 'audited',
    published: '2025-03-05',
    supports: { zh: '轴承与工业解决方案、汽车轴承收入', en: 'Bearings & Industrial Solutions and Automotive Bearings revenue' },
  },
  {
    id: 'nsk-2025',
    publisher: 'NSK',
    title: { zh: 'NSK 2025 综合报告（截至 2025 年 3 月）', en: 'NSK Report 2025 (year ended March 2025)' },
    url: 'https://www.nsk.com/content/dam/nsk/common/company/investors/library/pdf/nsk_report/NSK2025_web_en_A3.pdf',
    evidence: 'audited',
    published: '2025-12-26',
    supports: { zh: '集团及业务收入的 2015—2024 财年序列', en: 'FY2015–FY2024 group and segment sales series' },
  },
  {
    id: 'timken-2024',
    publisher: 'Timken',
    title: { zh: '铁姆肯 2024 年全年业绩', en: 'Timken Full-Year 2024 Results' },
    url: 'https://news.timken.com/2025-02-05-Timken-Reports-Fourth-Quarter-and-Full-Year-2024-Results',
    evidence: 'official',
    published: '2025-02-05',
    supports: { zh: '工程轴承分部收入', en: 'Engineered Bearings segment sales' },
  },
  {
    id: 'timken-category',
    publisher: 'Timken',
    title: { zh: '铁姆肯 2025 投资者演示材料', en: 'Timken 2025 Investor Presentation' },
    url: 'https://investors.timken.com/files/doc_presentations/2025/03/Investor-Presentation-DA-Davidson-Conference-2025_TKR.pdf',
    evidence: 'company-claim',
    published: '2025-03-01',
    supports: { zh: '圆锥滚子轴承领先地位声明', en: 'Tapered roller bearing leadership statement' },
  },
  {
    id: 'ntn-2025',
    publisher: 'NTN',
    title: { zh: 'NTN 2025 综合报告', en: 'NTN Report 2025' },
    url: 'https://www.ntnglobal.com/en/investors/pdf/annual/ntn_report2025_en.pdf',
    evidence: 'audited',
    published: '2025-09-30',
    supports: { zh: '轴承及其他业务收入', en: 'Bearings and Others business sales' },
  },
  {
    id: 'jtekt-2024',
    publisher: 'JTEKT',
    title: { zh: '捷太格特 2024 财年业绩资料', en: 'JTEKT FY2024 Financial Results' },
    url: 'https://www.jtekt.co.jp/e/assets/uploads/2025/05/files/0514_Financial_results_EN_2.pdf',
    evidence: 'official',
    published: '2025-05-14',
    supports: { zh: '工业与轴承业务收入', en: 'Industrial & Bearings business-unit revenue' },
  },
  {
    id: 'minebea-2025',
    publisher: 'MinebeaMitsumi',
    title: { zh: '美蓓亚三美 2025 年综合报告', en: 'MinebeaMitsumi Integrated Report 2025' },
    url: 'https://www.minebeamitsumi.com/english/corp/investors/disclosure/integrated_report/a2025/__icsFiles/afieldfile/2025/11/12/2025_integrated_report_en.pdf',
    evidence: 'audited',
    published: '2025-11-12',
    supports: { zh: '滚珠轴承收入与月均外销量', en: 'Ball-bearing sales and monthly average external unit sales' },
  },
  {
    id: 'minebea-share',
    publisher: 'MinebeaMitsumi',
    title: { zh: '精密机械部件产品页面', en: 'Precision Mechanical Components product page' },
    url: 'https://product.minebeamitsumi.com/en/product/category/pmc/pmc/index.html',
    evidence: 'company-claim',
    published: '2026-09-10',
    dateBasis: 'verified',
    supports: { zh: '外径 22mm 以下微小型滚珠轴承全球份额声明', en: 'Global-share claim for miniature and small ball bearings up to 22 mm' },
  },
  {
    id: 'nachi-2024',
    publisher: 'NACHI-FUJIKOSHI',
    title: { zh: '不二越财务亮点', en: 'NACHI-FUJIKOSHI Financial Highlights' },
    url: 'https://www.nachi-fujikoshi.co.jp/eng/ir/highlights.html',
    evidence: 'audited',
    published: '2025-02-05',
    supports: { zh: '2019—2024 轴承产品收入', en: '2019–2024 bearing product sales' },
  },
  {
    id: 'cu-prospectus',
    publisher: '上海证券交易所 / 人本股份',
    title: { zh: '人本股份招股说明书', en: 'C&U Company Limited Prospectus' },
    url: 'https://static.sse.com.cn/stock/disclosure/announcement/c/202606/002162_20260612_99AQ.pdf',
    evidence: 'audited',
    published: '2026-06-12',
    supports: { zh: '2023—2025 营业收入与行业数据', en: '2023–2025 revenue and industry data' },
  },
  {
    id: 'cu-volume',
    publisher: '人本股份',
    title: { zh: '人本股份生产园区与产能概览', en: 'C&U production footprint and capacity overview' },
    url: 'https://www.cugroup.com/About?id=4b626132-7d12-4b71-93f1-3ffbcc15f7c0',
    evidence: 'company-claim',
    published: '2026-09-10',
    dateBasis: 'verified',
    supports: { zh: '年轴承产量超过 21 亿套', en: 'Annual bearing production above 2.1 billion sets' },
  },
  {
    id: 'zwz-2024',
    publisher: '巨潮资讯 / 瓦房店轴承',
    title: { zh: '瓦房店轴承股份有限公司 2024 年年度报告', en: 'Wafangdian Bearing 2024 Annual Report' },
    url: 'https://static.cninfo.com.cn/finalpage/2025-04-29/1223373615.PDF',
    evidence: 'audited',
    published: '2025-04-29',
    supports: { zh: '上市主体营业收入及应用分部', en: 'Listed-entity revenue and application segments' },
  },
];

export const brandScaleRanking: BrandScaleRecord[] = [
  {
    rank: 1, brand: 'SKF', country: { zh: '瑞典', en: 'Sweden' }, fiscalYear: '2024',
    scope: { zh: '集团净销售额（轴承为核心，含密封、润滑、监测与服务）', en: 'Group net sales (bearing-centric; includes seals, lubrication, monitoring and services)' },
    reported: { zh: '987.22 亿瑞典克朗', en: 'SEK 98.722bn' }, approxUsdBn: 9.31, confidence: 92, sourceIds: ['skf-2024'],
    caveat: { zh: '并非纯轴承收入；工业业务占 70%。', en: 'Not pure bearing revenue; Industrial represented 70%.' },
  },
  {
    rank: 2, brand: 'Schaeffler / FAG / INA', country: { zh: '德国', en: 'Germany' }, fiscalYear: '2024',
    scope: { zh: '轴承与工业解决方案事业部', en: 'Bearings & Industrial Solutions division' },
    reported: { zh: '65.70 亿欧元', en: 'EUR 6.570bn' }, approxUsdBn: 7.10, confidence: 93, sourceIds: ['schaeffler-2024'],
    caveat: { zh: '含工业驱动、线性运动与服务；其中汽车轴承 26.33 亿欧元。', en: 'Includes industrial drive, linear motion and services; Automotive Bearings were EUR 2.633bn.' },
  },
  {
    rank: 3, brand: 'NSK', country: { zh: '日本', en: 'Japan' }, fiscalYear: 'FY2024',
    scope: { zh: '集团销售额（工业机械与汽车业务）', en: 'Group sales (Industrial Machinery and Automotive businesses)' },
    reported: { zh: '7,966.67 亿日元', en: 'JPY 796.667bn' }, approxUsdBn: 5.26, confidence: 88, sourceIds: ['nsk-2025'],
    caveat: { zh: '含精密机械产品及部分汽车系统，不能视为纯轴承收入。', en: 'Includes precision machinery products and some automotive systems; not pure bearing revenue.' },
  },
  {
    rank: 4, brand: 'Timken', country: { zh: '美国', en: 'United States' }, fiscalYear: '2024',
    scope: { zh: '工程轴承分部净销售额', en: 'Engineered Bearings segment net sales' },
    reported: { zh: '30.343 亿美元', en: 'USD 3.0343bn' }, approxUsdBn: 3.03, confidence: 96, sourceIds: ['timken-2024'],
    caveat: { zh: '口径接近轴承业务，但仍包含相关工程产品。', en: 'Close to a bearing-business scope, but includes related engineered products.' },
  },
  {
    rank: 5, brand: 'JTEKT / Koyo', country: { zh: '日本', en: 'Japan' }, fiscalYear: 'FY2024',
    scope: { zh: '工业与轴承业务单元收入', en: 'Industrial & Bearings business-unit revenue' },
    reported: { zh: '3,522 亿日元', en: 'JPY 352.2bn' }, approxUsdBn: 2.32, confidence: 82, sourceIds: ['jtekt-2024'],
    caveat: { zh: '混合口径，包含工业业务，未单列纯轴承收入。', en: 'Mixed scope includes industrial business; pure bearing revenue is not separated.' },
  },
  {
    rank: 6, brand: 'NTN', country: { zh: '日本', en: 'Japan' }, fiscalYear: 'FY2024',
    scope: { zh: '轴承及其他业务净销售额', en: 'Bearings and Others business net sales' },
    reported: { zh: '3,407 亿日元', en: 'JPY 340.7bn' }, approxUsdBn: 2.25, confidence: 90, sourceIds: ['ntn-2025'],
    caveat: { zh: '不含等速万向节/车轴业务，但“其他”未完全拆分。', en: 'Excludes CVJ/Axle business, while “Others” is not fully separated.' },
  },
  {
    rank: 7, brand: 'C&U 人本', country: { zh: '中国', en: 'China' }, fiscalYear: '2024',
    scope: { zh: '人本股份合并营业收入', en: 'C&U consolidated operating revenue' },
    reported: { zh: '119.60 亿元人民币', en: 'CNY 11.960bn' }, approxUsdBn: 1.68, confidence: 91, sourceIds: ['cu-prospectus'],
    caveat: { zh: '以轴承为主，但含轴承零部件及相关业务。', en: 'Bearing-led, but includes bearing components and related operations.' },
  },
  {
    rank: 8, brand: 'MinebeaMitsumi / NMB', country: { zh: '日本', en: 'Japan' }, fiscalYear: 'FY2024',
    scope: { zh: '滚珠轴承销售额', en: 'Ball-bearing sales' },
    reported: { zh: '1,718 亿日元', en: 'JPY 171.8bn' }, approxUsdBn: 1.13, confidence: 96, sourceIds: ['minebea-2025'],
    caveat: { zh: '这是纯滚珠轴承口径，不含同事业部的航空部件与 PMC。', en: 'Pure ball-bearing scope; excludes aerospace parts and PMC in the same segment.' },
  },
  {
    rank: 9, brand: 'NACHI', country: { zh: '日本', en: 'Japan' }, fiscalYear: '2024',
    scope: { zh: '轴承产品销售额', en: 'Bearing product sales' },
    reported: { zh: '857.27 亿日元', en: 'JPY 85.727bn' }, approxUsdBn: 0.57, confidence: 96, sourceIds: ['nachi-2024'],
    caveat: { zh: '纯轴承产品口径，可比性较高。', en: 'A relatively comparable pure bearing-product scope.' },
  },
  {
    rank: 10, brand: 'ZWZ 瓦轴', country: { zh: '中国', en: 'China' }, fiscalYear: '2024',
    scope: { zh: '瓦房店轴承上市主体营业收入', en: 'Wafangdian Bearing listed-entity operating revenue' },
    reported: { zh: '20.536 亿元人民币', en: 'CNY 2.0536bn' }, approxUsdBn: 0.29, confidence: 95, sourceIds: ['zwz-2024'],
    caveat: { zh: '仅为上市公司口径，不代表瓦轴集团全部销售。', en: 'Listed company only; not the entire ZWZ Group.' },
  },
];

export const volumeDisclosures: VolumeDisclosure[] = [
  {
    brand: 'MinebeaMitsumi / NMB',
    value: { zh: '月均外销量 2.37 亿件；按 12 个月年化约 28.44 亿件', en: '237m external units/month; about 2.844bn annualized over 12 months' },
    annualizedBn: 2.844,
    fiscalYear: 'FY2024',
    scope: { zh: '微小型及小型滚珠轴承为主', en: 'Primarily miniature and small-sized ball bearings' },
    basis: { zh: '月均外销量为公司披露；年化值为 BearingScope 计算，不是公司公布的全年合计。', en: 'Monthly external volume is company-reported; the annualized figure is a BearingScope calculation, not a reported annual total.' },
    confidence: 94,
    sourceIds: ['minebea-2025'],
  },
  {
    brand: 'C&U 人本',
    value: { zh: '年轴承产量超过 21 亿套', en: 'Annual bearing production above 2.1bn sets' },
    annualizedBn: 2.1,
    fiscalYear: '2026 snapshot',
    scope: { zh: '全品类轴承生产量', en: 'All bearing categories, production volume' },
    basis: { zh: '这是企业公布的产量，不是最终客户销量；不可与美蓓亚三美的外销量直接比较。', en: 'This is company-stated production, not end-customer sales, and is not directly comparable with MinebeaMitsumi external sales.' },
    confidence: 76,
    sourceIds: ['cu-volume'],
  },
];

export const trendSeries: TrendSeries[] = [
  {
    id: 'skf', brand: 'SKF', unit: { zh: '百万瑞典克朗', en: 'MSEK' }, color: 'var(--cyan)',
    metric: { zh: '集团净销售额', en: 'Group net sales' }, sourceIds: ['skf-2019', 'skf-2024'],
    points: [
      { year: 2015, value: 75788 }, { year: 2016, value: 72589 }, { year: 2017, value: 77938 },
      { year: 2018, value: 85713 }, { year: 2019, value: 86013 }, { year: 2020, value: 74852 },
      { year: 2021, value: 81732 }, { year: 2022, value: 96993 }, { year: 2023, value: 103881 },
      { year: 2024, value: 98722 },
    ],
  },
  {
    id: 'nsk', brand: 'NSK', unit: { zh: '百万日元', en: 'JPY million' }, color: 'var(--brass)',
    metric: { zh: '集团销售额', en: 'Group sales' }, sourceIds: ['nsk-2025'],
    points: [
      { year: 2015, value: 975319 }, { year: 2016, value: 949170 }, { year: 2017, value: 1020338 },
      { year: 2018, value: 991365 }, { year: 2019, value: 831034 }, { year: 2020, value: 747559 },
      { year: 2021, value: 865166 }, { year: 2022, value: 776762 }, { year: 2023, value: 788867 },
      { year: 2024, value: 796667 },
    ],
  },
  {
    id: 'nachi', brand: 'NACHI', unit: { zh: '百万日元', en: 'JPY million' }, color: 'var(--success)',
    metric: { zh: '轴承产品销售额', en: 'Bearing product sales' }, sourceIds: ['nachi-2024'],
    points: [
      { year: 2019, value: 77206 }, { year: 2020, value: 64400 }, { year: 2021, value: 74390 },
      { year: 2022, value: 84480 }, { year: 2023, value: 91767 }, { year: 2024, value: 85727 },
    ],
  },
];

export const categoryFindings: CategoryFinding[] = [
  {
    id: 'industrial', category: { zh: '工业轴承', en: 'Industrial bearings' }, verdict: 'supported', leader: 'SKF',
    headline: { zh: '审阅样本中，SKF 披露的工业业务规模最大', en: 'SKF has the largest disclosed industrial scale in the reviewed set' },
    evidence: { zh: 'SKF 2024 年工业业务净销售额 694.75 亿瑞典克朗，占集团销售额 70%；其年报称在铁路、航空航天、重工业和工业分销市场处于领先地位。', en: 'SKF reported SEK 69.475bn of Industrial net sales in 2024, 70% of group sales, and describes leading positions in railway, aerospace, heavy industries and industrial distribution.' },
    limitations: { zh: '工业业务还包含密封、润滑、监测和服务；不是纯轴承件数排名。', en: 'Industrial also includes seals, lubrication, monitoring and services; this is not a unit ranking.' },
    confidence: 84, sourceIds: ['skf-2024'],
  },
  {
    id: 'automotive', category: { zh: '汽车轴承', en: 'Automotive bearings' }, verdict: 'supported', leader: 'Schaeffler',
    headline: { zh: '可直接比较的纯汽车轴承披露中，舍弗勒规模领先', en: 'Schaeffler leads the directly comparable pure automotive-bearing disclosures' },
    evidence: { zh: '舍弗勒 2024 年单列汽车轴承收入 26.33 亿欧元。SKF 汽车业务为 292.47 亿瑞典克朗，但包含密封及相关产品；NSK 汽车业务也不是纯轴承口径。', en: 'Schaeffler separately disclosed EUR 2.633bn of Automotive Bearings revenue in 2024. SKF Automotive was SEK 29.247bn but includes seals and related products; NSK Automotive is also not a pure bearing scope.' },
    limitations: { zh: '结论仅限已找到的可比公开披露，不代表全球完整市场份额。', en: 'The finding is limited to comparable public disclosures found, not complete global market share.' },
    confidence: 80, sourceIds: ['schaeffler-2024', 'skf-2024', 'nsk-2025'],
  },
  {
    id: 'tapered', category: { zh: '圆锥滚子轴承', en: 'Tapered roller bearings' }, verdict: 'indicative', leader: 'Timken',
    headline: { zh: '铁姆肯是证据最强的全球领先者', en: 'Timken has the strongest evidence of global leadership' },
    evidence: { zh: '铁姆肯官方投资者材料明确写有“保持圆锥滚子轴承领先地位”，2024 年工程轴承收入 30.343 亿美元。', en: 'Timken investor materials explicitly state it is maintaining a leadership position in tapered roller bearings; 2024 Engineered Bearings sales were USD 3.0343bn.' },
    limitations: { zh: '未披露圆锥滚子轴承单独销量或第三方审计份额，因此标记为企业声明支持，而非精确份额。', en: 'No separate tapered-bearing units or third-party audited share is disclosed, so this is company-claim evidence, not an exact share.' },
    confidence: 82, sourceIds: ['timken-category', 'timken-2024'],
  },
  {
    id: 'miniature', category: { zh: '微小型深沟球/滚珠轴承', en: 'Miniature deep-groove / ball bearings' }, verdict: 'supported', leader: 'MinebeaMitsumi / NMB',
    headline: { zh: '外径 22mm 以下细分市场，美蓓亚三美为明确领先者', en: 'MinebeaMitsumi is the clear leader in the ≤22 mm subsegment' },
    evidence: { zh: '公司披露该细分市场全球份额超过 60%，FY2024 月均外销量 2.37 亿件、滚珠轴承销售额 1,718 亿日元。', en: 'The company reports over 60% global share in this subsegment, FY2024 monthly average external volume of 237m units and JPY 171.8bn in ball-bearing sales.' },
    limitations: { zh: '60% 为企业自行调研；不能外推为全部深沟球轴承市场份额。', en: 'The 60% figure is company-researched and cannot be extrapolated to all deep-groove ball bearings.' },
    confidence: 88, sourceIds: ['minebea-2025', 'minebea-share'],
  },
  {
    id: 'deep-groove', category: { zh: '全部深沟球轴承', en: 'All deep-groove ball bearings' }, verdict: 'insufficient', leader: '—',
    headline: { zh: '暂不能给出可信的全球第一名', en: 'No defensible global No.1 can currently be named' },
    evidence: { zh: '人本披露年轴承产量超过 21 亿套且多个园区生产深沟球轴承；美蓓亚三美披露的是 22mm 以下微小型细分。两者产品范围和“产量/外销量”口径不同。', en: 'C&U reports annual bearing production above 2.1bn sets and deep-groove production across several sites; MinebeaMitsumi discloses the ≤22 mm subsegment. Product scope and production/external-sales bases differ.' },
    limitations: { zh: 'SKF、NSK、NTN 等未公开该品类全球件数，强行排序会造成伪精确。', en: 'SKF, NSK, NTN and others do not disclose global units for this category; ranking them would create false precision.' },
    confidence: 35, sourceIds: ['cu-volume', 'minebea-2025'],
  },
  {
    id: 'needle', category: { zh: '滚针轴承', en: 'Needle roller bearings' }, verdict: 'insufficient', leader: 'Schaeffler / INA',
    headline: { zh: 'INA 技术与品牌证据强，但缺少当前销量份额', en: 'INA has strong technology and brand evidence, but current sales share is missing' },
    evidence: { zh: '舍弗勒是保持架滚针轴承的发明与规模化先驱，产品广泛覆盖汽车和工业场景。', en: 'Schaeffler pioneered the cage-guided needle roller bearing and serves broad automotive and industrial applications.' },
    limitations: { zh: '官方资料未给出当前全球件数或收入份额，因此不把历史技术地位当成销量第一。', en: 'Official material does not provide current global unit or revenue share, so historical technology leadership is not treated as a sales ranking.' },
    confidence: 55, sourceIds: ['schaeffler-2024'],
  },
];

export const fxAssumptions = {
  SEK: 10.6,
  EUR: 0.925,
  JPY: 151.5,
  CNY: 7.12,
} as const;

export const salesRankingVerifiedAt = '2026-09-10';
