import type {
  BaseContentItem,
  Brand,
  ContentCategory,
  FeedItem,
  FinanceItem,
  LocalizedText,
  MarketItem,
  NewsItem,
  ResearchItem,
  SourceRecord,
} from '../src/shared/types';

const text = (zh: string, en: string): LocalizedText => ({ zh, en });

export const brands: Brand[] = [
  ['skf', 'SKF', '瑞典 / Sweden'],
  ['schaeffler', 'Schaeffler', '德国 / Germany'],
  ['timken', 'Timken', '美国 / United States'],
  ['nsk', 'NSK', '日本 / Japan'],
  ['ntn', 'NTN', '日本 / Japan'],
  ['jtekt-koyo', 'JTEKT / Koyo', '日本 / Japan'],
  ['minebeamitsumi', 'MinebeaMitsumi', '日本 / Japan'],
  ['nachi', 'Nachi', '日本 / Japan'],
  ['cu', 'C&U', '中国 / China'],
  ['zwz', 'ZWZ', '中国 / China'],
].map(([id, shortName, country]) => ({
  id,
  slug: id,
  name: text(shortName, shortName),
  shortName,
  country: text(country.split(' / ')[0], country.split(' / ')[1]),
  aliases: id === 'jtekt-koyo' ? ['JTEKT', 'Koyo', '光洋'] : [shortName],
  attentionList: true,
  wechatDisplayNames: [`${shortName} 品牌微信来源（待核验）`],
}));

const wechatSources: SourceRecord[] = brands.map((brand) => ({
  id: `wechat-${brand.id}`,
  name: text(
    `${brand.shortName} 品牌微信来源（演示映射）`,
    `${brand.shortName} brand WeChat source (demo mapping)`,
  ),
  type: 'wechat',
  tier: 'official',
  verified: false,
  brandId: brand.id,
  homepage: 'https://mp.weixin.qq.com/',
  notes: text(
    '仅为待核验的显示标签；未存储或臆造公众号 ID，文章通过授权接口、合规数据服务或人工 URL 导入。',
    'Display label pending verification; no account ID is stored or invented. Articles require an authorized API, licensed provider, or manual URL import.',
  ),
}));

const officialSources: SourceRecord[] = brands.map((brand) => ({
  id: `official-${brand.id}`,
  name: text(`${brand.shortName} 官方新闻源（演示连接器）`, `${brand.shortName} newsroom (demo connector)`),
  type: 'official',
  tier: 'official',
  verified: false,
  brandId: brand.id,
  homepage: `https://example.invalid/bearingscope/sources/${brand.id}`,
  notes: text('演示源，不代表已抓取官方网站。', 'Demo source; it does not represent a live newsroom fetch.'),
}));

const sharedSources: SourceRecord[] = [
  {
    id: 'demo-industry-rss',
    name: text('全球轴承行业 RSS（演示）', 'Global bearing industry RSS (demo)'),
    type: 'rss',
    tier: 'secondary',
    verified: false,
    homepage: 'https://example.invalid/bearingscope/sources/industry-rss',
  },
  {
    id: 'demo-regulator',
    name: text('交易所与监管公告索引（演示）', 'Exchange and regulatory filing index (demo)'),
    type: 'regulator',
    tier: 'primary',
    verified: false,
    homepage: 'https://example.invalid/bearingscope/sources/regulator',
  },
  {
    id: 'demo-wire',
    name: text('全球工业通讯社（演示）', 'Global industrial wire (demo)'),
    type: 'wire',
    tier: 'secondary',
    verified: false,
    homepage: 'https://example.invalid/bearingscope/sources/wire',
  },
  {
    id: 'demo-journal',
    name: text('轴承技术期刊目录（演示）', 'Bearing technology journal index (demo)'),
    type: 'journal',
    tier: 'academic',
    verified: false,
    homepage: 'https://example.invalid/bearingscope/sources/journal',
  },
];

export const sources: SourceRecord[] = [...wechatSources, ...officialSources, ...sharedSources];

const sourceById = (id: string): SourceRecord => {
  const source = sources.find((candidate) => candidate.id === id);
  if (!source) throw new Error(`Unknown fixture source: ${id}`);
  return source;
};

interface FeedSeed {
  zh: string;
  en: string;
  sourceId: string;
  brandIds?: string[];
  categories: ContentCategory[];
  region: string;
  kind?: 'news' | 'finance';
  newsType?: NewsItem['newsType'];
  eventType?: FinanceItem['eventType'];
}

const feedSeeds: FeedSeed[] = [
  { zh: '高速电驱轴承内容观察', en: 'High-speed e-drive bearing content watch', sourceId: 'wechat-skf', brandIds: ['skf'], categories: ['technology'], region: 'Europe' },
  { zh: '低摩擦材料技术内容观察', en: 'Low-friction material technology watch', sourceId: 'wechat-schaeffler', brandIds: ['schaeffler'], categories: ['technology'], region: 'Europe' },
  { zh: '重载工况维护知识观察', en: 'Heavy-duty maintenance knowledge watch', sourceId: 'wechat-timken', brandIds: ['timken'], categories: ['product'], region: 'North America' },
  { zh: '精密轴承应用内容观察', en: 'Precision bearing application content watch', sourceId: 'wechat-nsk', brandIds: ['nsk'], categories: ['product'], region: 'Asia' },
  { zh: '风电轴承技术内容观察', en: 'Wind bearing technology content watch', sourceId: 'wechat-ntn', brandIds: ['ntn'], categories: ['technology'], region: 'Asia' },
  { zh: '汽车底盘轴承应用观察', en: 'Automotive chassis bearing application watch', sourceId: 'wechat-jtekt-koyo', brandIds: ['jtekt-koyo'], categories: ['product'], region: 'Asia' },
  { zh: '微型轴承技术内容观察', en: 'Miniature bearing technology content watch', sourceId: 'wechat-minebeamitsumi', brandIds: ['minebeamitsumi'], categories: ['technology'], region: 'Asia' },
  { zh: '工业机器人轴承内容观察', en: 'Industrial robot bearing content watch', sourceId: 'wechat-nachi', brandIds: ['nachi'], categories: ['technology'], region: 'Asia' },
  { zh: '制造工艺科普内容观察', en: 'Manufacturing process explainer watch', sourceId: 'wechat-cu', brandIds: ['cu'], categories: ['company'], region: 'China' },
  { zh: '大型轴承应用内容观察', en: 'Large bearing application content watch', sourceId: 'wechat-zwz', brandIds: ['zwz'], categories: ['product'], region: 'China' },
  { zh: '状态监测传感器集成情景', en: 'Condition-monitoring sensor integration scenario', sourceId: 'official-skf', brandIds: ['skf'], categories: ['product', 'technology'], region: 'Europe' },
  { zh: '电驱动热管理研发情景', en: 'E-drive thermal-management R&D scenario', sourceId: 'official-schaeffler', brandIds: ['schaeffler'], categories: ['technology'], region: 'Europe' },
  { zh: '工程服务网络信息监测情景', en: 'Engineering service network monitoring scenario', sourceId: 'official-timken', brandIds: ['timken'], categories: ['company'], region: 'North America' },
  { zh: '机床主轴精度技术观察', en: 'Machine-tool spindle precision watch', sourceId: 'official-nsk', brandIds: ['nsk'], categories: ['technology'], region: 'Asia' },
  { zh: '轨道交通轴承维护趋势观察', en: 'Rail bearing maintenance trend watch', sourceId: 'official-ntn', brandIds: ['ntn'], categories: ['market'], region: 'Asia' },
  { zh: '转向系统低扭矩技术情景', en: 'Low-torque steering technology scenario', sourceId: 'official-jtekt-koyo', brandIds: ['jtekt-koyo'], categories: ['product'], region: 'Asia' },
  { zh: '小型化设计研发信息观察', en: 'Miniaturization R&D information watch', sourceId: 'official-minebeamitsumi', brandIds: ['minebeamitsumi'], categories: ['technology'], region: 'Asia' },
  { zh: '自动化产线能力信息情景', en: 'Automated production capability scenario', sourceId: 'official-nachi', brandIds: ['nachi'], categories: ['capacity'], region: 'Asia' },
  { zh: '数字化质量追溯内容观察', en: 'Digital quality traceability watch', sourceId: 'official-cu', brandIds: ['cu'], categories: ['company'], region: 'China' },
  { zh: '大型装备配套研发情景', en: 'Large-equipment bearing R&D scenario', sourceId: 'official-zwz', brandIds: ['zwz'], categories: ['technology'], region: 'China' },
  { zh: '全球电机轴承需求信号监测', en: 'Global motor-bearing demand signal monitor', sourceId: 'demo-industry-rss', categories: ['market'], region: 'Global' },
  { zh: '航空轴承材料研究动态监测', en: 'Aerospace bearing material research monitor', sourceId: 'demo-wire', categories: ['technology'], region: 'Global' },
  { zh: '供应链交付周期信息监测', en: 'Supply-chain lead-time information monitor', sourceId: 'demo-industry-rss', categories: ['supply-chain'], region: 'Global', newsType: 'supply-chain' },
  { zh: '轴承钢与陶瓷材料成本信号', en: 'Bearing steel and ceramic material cost signals', sourceId: 'demo-wire', categories: ['supply-chain', 'market'], region: 'Global', newsType: 'supply-chain' },
  { zh: '公开财报要点进入信息流的示例', en: 'Example of ingesting public filing highlights', sourceId: 'demo-regulator', categories: ['finance'], region: 'Global', kind: 'finance', eventType: 'earnings' },
  { zh: '上市公司公告分类监测示例', en: 'Listed-company filing classification example', sourceId: 'demo-regulator', categories: ['listing'], region: 'Global', kind: 'finance', eventType: 'listing' },
  { zh: '股价异动新闻核验流程示例', en: 'Stock-move news verification workflow example', sourceId: 'demo-regulator', categories: ['listing', 'finance'], region: 'Global', kind: 'finance', eventType: 'stock-move' },
  { zh: '行业并购公告去重流程示例', en: 'Industry merger filing deduplication example', sourceId: 'demo-regulator', categories: ['merger'], region: 'Global', kind: 'finance', eventType: 'merger' },
  { zh: '亏损预警关键词监测方法', en: 'Loss-warning keyword monitoring method', sourceId: 'demo-regulator', categories: ['loss'], region: 'Global', kind: 'finance', eventType: 'loss' },
  { zh: '企业重组与倒闭信息核验方法', en: 'Restructuring and insolvency verification method', sourceId: 'demo-regulator', categories: ['restructuring'], region: 'Global', kind: 'finance', eventType: 'restructuring' },
  { zh: '再制造与循环利用技术观察', en: 'Remanufacturing and circular-use technology watch', sourceId: 'demo-industry-rss', categories: ['technology'], region: 'Global' },
  { zh: '预测性维护平台互操作趋势', en: 'Predictive-maintenance interoperability trend', sourceId: 'demo-wire', categories: ['technology', 'market'], region: 'Global' },
  { zh: '密封结构与污染控制技术观察', en: 'Seal architecture and contamination-control watch', sourceId: 'demo-industry-rss', categories: ['product', 'technology'], region: 'Global' },
  { zh: '航空应用认证标准动态观察', en: 'Aerospace application certification watch', sourceId: 'demo-wire', categories: ['company', 'technology'], region: 'Global' },
  { zh: '润滑剂兼容性研究动态观察', en: 'Lubricant compatibility research watch', sourceId: 'demo-industry-rss', categories: ['technology'], region: 'Global' },
  { zh: '区域仓储与交付网络信号监测', en: 'Regional warehousing and delivery-network signal monitor', sourceId: 'demo-wire', categories: ['supply-chain', 'capacity'], region: 'Global', newsType: 'supply-chain' },
];

const publishedAt = (index: number): string => new Date(Date.UTC(2026, 6, 11, 10 - index * 4)).toISOString();
const fetchedAt = (index: number): string => new Date(Date.parse(publishedAt(index)) + 20 * 60_000).toISOString();

function feedBase(seed: FeedSeed, index: number): Omit<BaseContentItem, 'kind'> {
  const id = `demo-feed-${String(index + 1).padStart(3, '0')}`;
  const originalTitle = `演示情景：${seed.zh}`;
  return {
    id,
    demo: true,
    title: text(originalTitle, `Demo scenario: ${seed.en}`),
    originalTitle,
    summary: text(
      '这是一条用于展示聚合、筛选与来源标注能力的合成内容，不陈述真实企业事件或经营数字。',
      'Synthetic content demonstrating aggregation, filtering, and provenance; it makes no claim about a real company event or operating figure.',
    ),
    keyFacts: [
      text('演示数据，不用于商业决策。', 'Demo data; not for business decisions.'),
      text('正式接入后应返回原始来源核验。', 'Verify against the original source after production connectors are enabled.'),
    ],
    brandIds: seed.brandIds ?? [],
    region: seed.region,
    categories: seed.categories,
    source: sourceById(seed.sourceId),
    originalLanguage: index < 10 ? 'zh' : 'en',
    publishedAt: publishedAt(index),
    fetchedAt: fetchedAt(index),
    url: `https://example.invalid/bearingscope/feed/${id}`,
    canonicalUrl: `https://example.invalid/bearingscope/feed/${id}`,
    confidence: index < 20 ? 0.94 : 0.78,
    relatedSourceUrls: [],
  };
}

export const newsItems: FeedItem[] = feedSeeds.map((seed, index) => {
  const base = feedBase(seed, index);
  if (seed.kind === 'finance') {
    return {
      ...base,
      kind: 'finance',
      eventType: seed.eventType ?? 'earnings',
      metrics: {},
    };
  }
  return {
    ...base,
    kind: 'news',
    newsType: seed.newsType ?? (seed.categories.includes('technology') ? 'technology' : 'industry'),
  };
});

const marketSeeds: Array<{
  zh: string;
  en: string;
  horizon: MarketItem['horizon'];
  maturity: MarketItem['maturity'];
}> = [
  { zh: '电驱高速轴承', en: 'High-speed e-drive bearings', horizon: 'near', maturity: 'scaling' },
  { zh: '风电主轴承', en: 'Wind-turbine main bearings', horizon: 'mid', maturity: 'scaling' },
  { zh: '陶瓷混合轴承', en: 'Hybrid ceramic bearings', horizon: 'mid', maturity: 'scaling' },
  { zh: '轴承智能状态监测', en: 'Smart bearing condition monitoring', horizon: 'near', maturity: 'scaling' },
  { zh: '低摩擦材料与涂层', en: 'Low-friction materials and coatings', horizon: 'mid', maturity: 'emerging' },
  { zh: '剩余寿命预测', en: 'Remaining useful life prediction', horizon: 'mid', maturity: 'emerging' },
  { zh: '氢能装备低温轴承', en: 'Cryogenic bearings for hydrogen equipment', horizon: 'long', maturity: 'emerging' },
  { zh: '循环制造与可追溯材料', en: 'Circular manufacturing and traceable materials', horizon: 'long', maturity: 'emerging' },
];

export const marketItems: MarketItem[] = marketSeeds.map((seed, index) => {
  const id = `demo-market-${String(index + 1).padStart(2, '0')}`;
  return {
    id,
    kind: 'market',
    demo: true,
    title: text(seed.zh, seed.en),
    originalTitle: seed.en,
    summary: text(
      '基于行业常见研发主题构造的演示信号；未附带未经来源支持的市场规模或增长预测。',
      'A demo signal based on common industry R&D themes; it includes no unsupported market-size or growth forecast.',
    ),
    keyFacts: [text('方向性信号，不是投资建议。', 'Directional signal, not investment advice.')],
    brandIds: [],
    region: 'Global',
    categories: ['market', 'technology'],
    source: sourceById('demo-industry-rss'),
    originalLanguage: 'en',
    publishedAt: new Date(Date.UTC(2026, 6, 10 - index)).toISOString(),
    fetchedAt: new Date(Date.UTC(2026, 6, 10 - index, 0, 30)).toISOString(),
    url: `https://example.invalid/bearingscope/market/${id}`,
    canonicalUrl: `https://example.invalid/bearingscope/market/${id}`,
    confidence: 0.7,
    relatedSourceUrls: [],
    horizon: seed.horizon,
    maturity: seed.maturity,
  };
});

const researchSeeds = [
  ['高速滚动轴承热弹流建模方法', 'Thermo-elastohydrodynamic modeling for high-speed rolling bearings'],
  ['混合陶瓷轴承电蚀机理实验框架', 'Experimental framework for electrical erosion in hybrid ceramic bearings'],
  ['风电主轴承载荷谱识别方法', 'Load-spectrum identification for wind-turbine main bearings'],
  ['基于振动信号的早期故障诊断', 'Early fault diagnosis using vibration signals'],
  ['润滑脂退化与剩余寿命估计', 'Grease degradation and remaining-life estimation'],
  ['低摩擦涂层接触疲劳研究框架', 'Research framework for contact fatigue of low-friction coatings'],
  ['小样本条件下的轴承健康评估', 'Bearing health assessment with limited samples'],
  ['极端温度环境中的保持架动力学', 'Cage dynamics under extreme temperatures'],
  ['高速电机轴承电流路径建模', 'Modeling bearing-current paths in high-speed motors'],
  ['面向再制造的滚道缺陷量化', 'Quantifying raceway defects for remanufacturing'],
  ['数字孪生驱动的轴承维护决策', 'Digital-twin-driven bearing maintenance decisions'],
  ['多源传感融合的寿命预测基准', 'A multisensor fusion benchmark for life prediction'],
] as const;

export const researchItems: ResearchItem[] = researchSeeds.map(([zh, en], index) => {
  const id = `demo-research-${String(index + 1).padStart(3, '0')}`;
  return {
    id,
    kind: 'research',
    demo: true,
    title: text(`演示论文：${zh}`, `Demo paper: ${en}`),
    originalTitle: `Demo paper: ${en}`,
    summary: text(
      '用于展示论文元数据字段的合成摘要，不对应真实论文，且不包含受版权保护的全文。',
      'A synthetic abstract demonstrating research metadata; it does not represent a real paper or reproduce copyrighted full text.',
    ),
    keyFacts: [text('DOI 未提供，因为该记录为演示数据。', 'No DOI is supplied because this is a demo record.')],
    brandIds: [],
    region: 'Global',
    categories: ['technology'],
    source: sourceById('demo-journal'),
    originalLanguage: 'en',
    publishedAt: new Date(Date.UTC(2026, 5, 30 - index)).toISOString(),
    fetchedAt: new Date(Date.UTC(2026, 6, 1, index)).toISOString(),
    url: `https://example.invalid/bearingscope/research/${id}`,
    canonicalUrl: `https://example.invalid/bearingscope/research/${id}`,
    confidence: 0.65,
    relatedSourceUrls: [],
    authors: [`Demo Author ${index + 1}`, 'BearingScope Research Fixture Group'],
    journal: 'Demo Journal of Bearing Technology',
    citations: 0,
    openAccess: index % 2 === 0,
    paperUrl: `https://example.invalid/bearingscope/research/${id}`,
  };
});
