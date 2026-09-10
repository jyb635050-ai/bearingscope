import type { BrandScaleRecord, SalesRankingYear, SalesSource } from './salesRankings';

export const annualSalesSources: SalesSource[] = [
  {
    id: 'skf-2025', publisher: 'SKF', evidence: 'audited', published: '2026-03-06',
    title: { zh: 'SKF 2025 年年度与可持续发展报告', en: 'SKF Annual and Sustainability Report 2025' },
    url: 'https://www.skf.com/financial-reports-service/download/2242/report/Annual%20Report%202025',
    supports: { zh: '2025 年集团、工业与汽车业务收入', en: '2025 Group, Industrial and Automotive sales' },
  },
  {
    id: 'schaeffler-2025', publisher: 'Schaeffler', evidence: 'audited', published: '2026-03-03',
    title: { zh: '舍弗勒集团 2025 年年度报告', en: 'Schaeffler Group Annual Report 2025' },
    url: 'https://www.schaeffler.com/en/investor-relations/events-publications/ir-releases/ir_releases_detail.jsp?id=88175301',
    supports: { zh: '2025 年轴承与工业解决方案收入及可比口径说明', en: '2025 Bearings & Industrial Solutions revenue and comparability notes' },
  },
  {
    id: 'nsk-fy2025', publisher: 'NSK', evidence: 'official', published: '2026-05-13',
    title: { zh: 'NSK 2025 财年全年业绩（截至 2026 年 3 月）', en: 'NSK FY2025 Results (year ended March 2026)' },
    url: 'https://www.nsk.com/content/dam/nsk/common/company/investors/library/pdf/financial_announcement/2025/fy2025q4e.pdf',
    supports: { zh: '2025 财年集团及分部销售额', en: 'FY2025 group and segment sales' },
  },
  {
    id: 'timken-2025', publisher: 'Timken', evidence: 'official', published: '2026-02-04',
    title: { zh: '铁姆肯 2025 年全年业绩', en: 'Timken Full-Year 2025 Results' },
    url: 'https://news.timken.com/2026-02-04-Timken-Reports-Fourth-Quarter-and-Full-Year-2025-Results',
    supports: { zh: '2025 年工程轴承分部净销售额', en: '2025 Engineered Bearings segment net sales' },
  },
  {
    id: 'timken-2023', publisher: 'Timken', evidence: 'official', published: '2024-02-05',
    title: { zh: '铁姆肯 2023 年全年业绩', en: 'Timken Full-Year 2023 Results' },
    url: 'https://news.timken.com/2024-02-05-Timken-Reports-Strong-Fourth-Quarter-Results-to-Close-Out-a-Record-2023',
    supports: { zh: '2023 年工程轴承分部净销售额', en: '2023 Engineered Bearings segment net sales' },
  },
  {
    id: 'ntn-fy2025', publisher: 'NTN', evidence: 'official', published: '2026-05-14',
    title: { zh: 'NTN 2025 财年全年业绩', en: 'NTN FY2025 Financial Results' },
    url: 'https://www.ntnglobal.com/en/investors/pdf/fin/2026q4e.pdf',
    supports: { zh: '2025 财年轴承及其他业务净销售额', en: 'FY2025 Bearings and Others business net sales' },
  },
  {
    id: 'jtekt-fy2025', publisher: 'JTEKT', evidence: 'official', published: '2026-05-20',
    title: { zh: '捷太格特 2025 财年全年业绩资料', en: 'JTEKT FY2025 Financial Results' },
    url: 'https://www.jtekt.co.jp/e/assets/uploads/2026/05/files/20260520_IR_4Q_en_1.pdf',
    supports: { zh: '2023—2025 财年工业与轴承业务收入', en: 'FY2023–FY2025 Industrial & Bearings revenue' },
  },
  {
    id: 'minebea-fy2025', publisher: 'MinebeaMitsumi', evidence: 'official', published: '2026-08-14',
    title: { zh: '美蓓亚三美 2025 财年补充财务资料', en: 'MinebeaMitsumi FY2025 Supplementary Financial Data' },
    url: 'https://www.minebeamitsumi.com/english/corp/investors/disclosure/financial/p2026/__icsFiles/afieldfile/2026/08/14/e2026_hosoku_en.pdf',
    supports: { zh: '2025 财年滚珠轴承销售额', en: 'FY2025 ball-bearing sales' },
  },
  {
    id: 'minebea-fy2023', publisher: 'MinebeaMitsumi', evidence: 'official', published: '2024-05-31',
    title: { zh: '美蓓亚三美 2023 财年补充财务资料', en: 'MinebeaMitsumi FY2023 Supplementary Financial Data' },
    url: 'https://www.minebeamitsumi.com/english/corp/investors/disclosure/financial/p2024/__icsFiles/afieldfile/2024/05/31/e2024_hosoku_en.pdf',
    supports: { zh: '2023 财年滚珠轴承销售额', en: 'FY2023 ball-bearing sales' },
  },
  {
    id: 'nachi-2025', publisher: 'NACHI-FUJIKOSHI', evidence: 'official', published: '2026-09-10', dateBasis: 'verified',
    title: { zh: '不二越 2026 公司概览', en: 'NACHI-FUJIKOSHI Corporate Profile 2026' },
    url: 'https://www.nachi-fujikoshi.co.jp/dcms_media/other/profile_2026en.pdf',
    supports: { zh: '2021—2025 年轴承产品销售额', en: '2021–2025 bearing product sales' },
  },
  {
    id: 'zwz-2025', publisher: '巨潮资讯 / 瓦房店轴承', evidence: 'audited', published: '2026-04-28',
    title: { zh: '瓦房店轴承股份有限公司 2025 年年度报告', en: 'Wafangdian Bearing 2025 Annual Report' },
    url: 'https://static.cninfo.com.cn/finalpage/2026-04-28/1225199843.PDF',
    supports: { zh: '2025 年上市主体营业收入', en: '2025 listed-entity operating revenue' },
  },
];

const shared = {
  skf: {
    brand: 'SKF', country: { zh: '瑞典', en: 'Sweden' },
    scope: { zh: '集团净销售额（轴承为核心，含密封、润滑、监测与服务）', en: 'Group net sales (bearing-centric; includes seals, lubrication, monitoring and services)' },
  },
  schaeffler: {
    brand: 'Schaeffler / FAG / INA', country: { zh: '德国', en: 'Germany' },
    scope: { zh: '轴承与工业解决方案事业部', en: 'Bearings & Industrial Solutions division' },
  },
  nsk: {
    brand: 'NSK', country: { zh: '日本', en: 'Japan' },
    scope: { zh: '集团销售额（工业机械与汽车相关业务）', en: 'Group sales (Industrial Machinery and Automotive-related businesses)' },
  },
  timken: {
    brand: 'Timken', country: { zh: '美国', en: 'United States' },
    scope: { zh: '工程轴承分部净销售额', en: 'Engineered Bearings segment net sales' },
  },
  jtekt: {
    brand: 'JTEKT / Koyo', country: { zh: '日本', en: 'Japan' },
    scope: { zh: '工业与轴承业务单元收入', en: 'Industrial & Bearings business-unit revenue' },
  },
  ntn: {
    brand: 'NTN', country: { zh: '日本', en: 'Japan' },
    scope: { zh: '轴承及其他业务净销售额', en: 'Bearings and Others business net sales' },
  },
  cu: {
    brand: 'C&U 人本', country: { zh: '中国', en: 'China' },
    scope: { zh: '人本股份合并营业收入', en: 'C&U consolidated operating revenue' },
  },
  minebea: {
    brand: 'MinebeaMitsumi / NMB', country: { zh: '日本', en: 'Japan' },
    scope: { zh: '滚珠轴承销售额', en: 'Ball-bearing sales' },
  },
  nachi: {
    brand: 'NACHI', country: { zh: '日本', en: 'Japan' },
    scope: { zh: '轴承产品销售额', en: 'Bearing product sales' },
  },
  zwz: {
    brand: 'ZWZ 瓦轴', country: { zh: '中国', en: 'China' },
    scope: { zh: '瓦房店轴承上市主体营业收入', en: 'Wafangdian Bearing listed-entity operating revenue' },
  },
} as const;

const caveats = {
  skf: { zh: '并非纯轴承收入；还包含密封、润滑、监测与服务。', en: 'Not pure bearing revenue; also includes seals, lubrication, monitoring and services.' },
  schaeffler: { zh: '含工业驱动、线性运动与服务；组织调整会影响跨年可比性。', en: 'Includes industrial drive, linear motion and services; organizational changes affect comparability.' },
  nsk: { zh: '含精密机械产品及部分汽车系统，不能视为纯轴承收入。', en: 'Includes precision machinery products and some automotive systems; not pure bearing revenue.' },
  timken: { zh: '口径接近轴承业务，但仍包含相关工程产品。', en: 'Close to a bearing-business scope, but includes related engineered products.' },
  jtekt: { zh: '混合口径，包含工业业务，未单列纯轴承收入。', en: 'Mixed scope includes industrial business; pure bearing revenue is not separated.' },
  ntn: { zh: '不含等速万向节/车轴业务，但“其他”未完全拆分。', en: 'Excludes CVJ/Axle business, while “Others” is not fully separated.' },
  cu: { zh: '以轴承为主，但含轴承零部件及相关业务。', en: 'Bearing-led, but includes bearing components and related operations.' },
  minebea: { zh: '纯滚珠轴承口径，不含同事业部的航空部件与 PMC。', en: 'Pure ball-bearing scope; excludes aerospace parts and PMC in the same segment.' },
  nachi: { zh: '纯轴承产品口径，可比性较高。', en: 'A relatively comparable pure bearing-product scope.' },
  zwz: { zh: '仅为上市公司口径，不代表瓦轴集团全部销售。', en: 'Listed company only; not the entire ZWZ Group.' },
} as const;

const ranking2025: BrandScaleRecord[] = [
  { rank: 1, ...shared.skf, fiscalYear: '2025', reported: { zh: '915.83 亿瑞典克朗', en: 'SEK 91.583bn' }, approxUsdBn: 8.64, confidence: 92, sourceIds: ['skf-2025'], caveat: caveats.skf },
  { rank: 2, ...shared.schaeffler, fiscalYear: '2025', reported: { zh: '63.68 亿欧元', en: 'EUR 6.368bn' }, approxUsdBn: 6.88, confidence: 91, sourceIds: ['schaeffler-2025'], caveat: caveats.schaeffler },
  { rank: 3, ...shared.nsk, fiscalYear: 'FY2025', reported: { zh: '9,116.44 亿日元', en: 'JPY 911.644bn' }, approxUsdBn: 6.02, confidence: 84, sourceIds: ['nsk-fy2025'], caveat: { zh: '新增并表转向业务，集团口径与前两年不完全可比。', en: 'Steering was newly consolidated, so group scope is not fully comparable with prior years.' } },
  { rank: 4, ...shared.timken, fiscalYear: '2025', reported: { zh: '30.181 亿美元', en: 'USD 3.0181bn' }, approxUsdBn: 3.02, confidence: 96, sourceIds: ['timken-2025'], caveat: caveats.timken },
  { rank: 5, ...shared.ntn, fiscalYear: 'FY2025', reported: { zh: '3,488.90 亿日元', en: 'JPY 348.890bn' }, approxUsdBn: 2.30, confidence: 90, sourceIds: ['ntn-fy2025'], caveat: caveats.ntn },
  { rank: 6, ...shared.jtekt, fiscalYear: 'FY2025', reported: { zh: '3,470 亿日元', en: 'JPY 347.0bn' }, approxUsdBn: 2.29, confidence: 80, sourceIds: ['jtekt-fy2025'], caveat: { zh: '混合口径；欧洲滚针轴承业务出售亦影响跨年比较。', en: 'Mixed scope; disposal of the European needle-roller-bearing business also affects comparability.' } },
  { rank: 7, ...shared.cu, fiscalYear: '2025', reported: { zh: '132.22 亿元人民币', en: 'CNY 13.222bn' }, approxUsdBn: 1.86, confidence: 91, sourceIds: ['cu-prospectus'], caveat: caveats.cu },
  { rank: 8, ...shared.minebea, fiscalYear: 'FY2025', reported: { zh: '1,864.13 亿日元', en: 'JPY 186.413bn' }, approxUsdBn: 1.23, confidence: 96, sourceIds: ['minebea-fy2025'], caveat: caveats.minebea },
  { rank: 9, ...shared.nachi, fiscalYear: '2025', reported: { zh: '854.19 亿日元', en: 'JPY 85.419bn' }, approxUsdBn: 0.56, confidence: 94, sourceIds: ['nachi-2025'], caveat: caveats.nachi },
  { rank: 10, ...shared.zwz, fiscalYear: '2025', reported: { zh: '23.511 亿元人民币', en: 'CNY 2.351bn' }, approxUsdBn: 0.33, confidence: 95, sourceIds: ['zwz-2025'], caveat: caveats.zwz },
];

const ranking2023: BrandScaleRecord[] = [
  { rank: 1, ...shared.skf, fiscalYear: '2023', reported: { zh: '1,038.81 亿瑞典克朗', en: 'SEK 103.881bn' }, approxUsdBn: 9.80, confidence: 92, sourceIds: ['skf-2024'], caveat: caveats.skf },
  { rank: 2, ...shared.schaeffler, fiscalYear: '2023', reported: { zh: '69.60 亿欧元', en: 'EUR 6.960bn' }, approxUsdBn: 7.52, confidence: 91, sourceIds: ['schaeffler-2024'], caveat: caveats.schaeffler },
  { rank: 3, ...shared.nsk, fiscalYear: 'FY2023', reported: { zh: '7,888.67 亿日元', en: 'JPY 788.867bn' }, approxUsdBn: 5.21, confidence: 88, sourceIds: ['nsk-2025'], caveat: caveats.nsk },
  { rank: 4, ...shared.timken, fiscalYear: '2023', reported: { zh: '32.577 亿美元', en: 'USD 3.2577bn' }, approxUsdBn: 3.26, confidence: 96, sourceIds: ['timken-2023'], caveat: caveats.timken },
  { rank: 5, ...shared.jtekt, fiscalYear: 'FY2023', reported: { zh: '3,580 亿日元', en: 'JPY 358.0bn' }, approxUsdBn: 2.36, confidence: 80, sourceIds: ['jtekt-fy2025'], caveat: caveats.jtekt },
  { rank: 6, ...shared.ntn, fiscalYear: 'FY2023', reported: { zh: '3,467.77 亿日元', en: 'JPY 346.777bn' }, approxUsdBn: 2.29, confidence: 90, sourceIds: ['ntn-2025'], caveat: caveats.ntn },
  { rank: 7, ...shared.cu, fiscalYear: '2023', reported: { zh: '104.82 亿元人民币', en: 'CNY 10.482bn' }, approxUsdBn: 1.47, confidence: 91, sourceIds: ['cu-prospectus'], caveat: caveats.cu },
  { rank: 8, ...shared.minebea, fiscalYear: 'FY2023', reported: { zh: '1,487.51 亿日元', en: 'JPY 148.751bn' }, approxUsdBn: 0.98, confidence: 96, sourceIds: ['minebea-fy2023'], caveat: caveats.minebea },
  { rank: 9, ...shared.nachi, fiscalYear: '2023', reported: { zh: '917.67 亿日元', en: 'JPY 91.767bn' }, approxUsdBn: 0.61, confidence: 94, sourceIds: ['nachi-2025'], caveat: caveats.nachi },
  { rank: 10, ...shared.zwz, fiscalYear: '2023', reported: { zh: '21.933 亿元人民币', en: 'CNY 2.193bn' }, approxUsdBn: 0.31, confidence: 95, sourceIds: ['zwz-2024'], caveat: caveats.zwz },
];

export function createAnnualRankings(ranking2024: BrandScaleRecord[]): Record<SalesRankingYear, BrandScaleRecord[]> {
  return { 2025: ranking2025, 2024: ranking2024, 2023: ranking2023 };
}
