# BearingScope · 轴承视界

面向全球轴承行业从业者的双语情报工作台。BearingScope 将企业新闻、财务与资本市场动态、新产品和新技术、市场趋势、论文与期刊研究聚合到一个可检索、可筛选、可收藏的界面中。

在线演示：[https://jyb635050-ai.github.io/bearingscope/](https://jyb635050-ai.github.io/bearingscope/)

> GitHub Pages 版本使用真实公开内容快照：构建时同步 40 组多地区新闻检索、专业媒体/企业官方 RSS、人本集团公开新闻接口、GDELT、Crossref 与 OpenAlex 元数据，并每 3 小时自动更新。线上快照不混入演示条目；真实内容不足时构建会失败并保留上一个可用版本。

微信公众号仍遵循合规边界：不使用登录态、验证码或隐藏接口抓取。公开文章需要微信官方授权接口、合规商业数据服务或人工提交并审核的 URL；站点会明确显示该来源当前是否已接入。

## 功能

- 六个独立页面：精选、全部动态、品牌雷达、市场未来、论文研究、收藏。
- 默认中文和深色工业主题；支持中英文及明暗主题切换，并在浏览器中保留选择。
- 中文模式的新闻、趋势和论文主标题均生成独立中文字段；英文模式保留来源原题。品牌、作者、期刊和 DOI 等正式标识不强制翻译。
- 按关键词、类别、品牌、地区、来源类型、时间范围和排序方式筛选；筛选条件保存在 URL 中，可刷新和分享。
- 侧边详情面板展示双语摘要、关键事实、来源等级、原始语言、发布时间、抓取时间和原文链接。
- 本地收藏，无需账号；收藏保存在 `localStorage`。
- 响应式桌面侧栏与移动抽屉导航，支持键盘操作、清晰焦点状态及减少动态效果。
- Express 聚合 API，以及面向官网/RSS、新闻服务、论文元数据和合规微信公众号数据源的适配器边界。
- GitHub Actions 构建期真实数据同步；线上仅保存标题、来源、日期、必要元数据和原文链接，不复制新闻或论文全文。

## 技术栈

- React 19、React Router、TypeScript、Vite
- TanStack Query、i18next、Lucide React
- Node.js、Express、Zod
- Vitest、Testing Library、Supertest、Playwright

## 快速开始

要求：Node.js 20 或更高版本，pnpm 11。

```powershell
pnpm install
Copy-Item .env.example .env
pnpm run dev
```

打开：

- Web：`http://127.0.0.1:4173`
- API：`http://127.0.0.1:8787/api/v1`

Vite 会把 `/api` 请求代理到本地 Express 服务。样例模式不需要任何外部 API 密钥。

## 可用命令

```powershell
pnpm run dev          # 同时启动 Vite 与 Express（监听文件变化）
pnpm run typecheck    # TypeScript 静态检查
pnpm test             # 运行单元、组件和 API 合约测试
pnpm run test:watch   # 监听模式运行 Vitest
pnpm run test:e2e     # 运行桌面与移动端 Playwright 测试
pnpm run build        # 类型检查并构建 Web 与服务端产物
pnpm run sync:content # 同步并校验真实新闻与论文快照
pnpm run build:pages  # 构建 GitHub Pages 真实快照版
pnpm start            # 启动构建后的 Express 服务
```

生产构建生成 `dist/`（Web）和 `dist-server/`（API）。在部署环境中先运行 `pnpm run build`，再运行 `pnpm start`；默认 API 端口为 `8787`。仓库内置 GitHub Actions 工作流，推送到 `main` 或定时任务触发后会同步真实公开元数据、测试、构建并部署 GitHub Pages。

## 环境变量

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `PORT` | `8787` | Express 服务端口 |
| `BEARINGSCOPE_DATA_MODE` | `sample` | `sample` 使用本地演示数据；未来连接真实来源时改为相应运行模式 |
| `NEWS_API_KEY` | 空 | 可选 NewsAPI 连接器密钥 |
| `OPENALEX_API_KEY` | 空 | 可选 OpenAlex 认证/配额配置 |
| `WECHAT_PROVIDER_KEY` | 空 | 可选、已获授权的微信数据服务商密钥 |
| `BEARINGSCOPE_LIVE_SNAPSHOT_URL` | 当前 GitHub Pages 快照 | 构建时复用上一版已校验中文标题，减少重复翻译请求 |

不要把真实密钥提交到版本库。V1 的测试和演示不得因缺少密钥而失败，也不得在样例模式中意外发起外网请求。

## 页面与 API

| 页面 | 路径 | 主要用途 |
| --- | --- | --- |
| 精选 | `/` | 热点排行、重点报道、时间线与品牌关注度 |
| 全部动态 | `/news` | 搜索、复合筛选与排序 |
| 品牌雷达 | `/brands` | 十个重点关注品牌及其相关新闻 |
| 市场未来 | `/market` | 技术信号和未来方向 |
| 论文研究 | `/research` | 论文元数据、双语摘要与合法原文入口 |
| 收藏 | `/saved` | 当前浏览器保存的内容 |

API 前缀为 `/api/v1`：

- `GET /feed`：内容搜索、筛选、排序和分页。
- `GET /trending`：热点与七日品牌关注度。
- `GET /brands`：十品牌关注配置及相关动态。
- `GET /market`：市场与技术趋势信号。
- `GET /research`：论文元数据。
- `GET /sources`：官网、RSS、微信、期刊和监管来源名录。
- `POST /imports/wechat`：校验公开微信文章 URL，并创建待审核导入项。

## 项目原则

1. **来源先于结论**：每条事实都应能回到公开、合法的原始链接。
2. **官方来源优先**：企业官网、交易所/监管公告、期刊与 DOI 元数据优先于二次报道。
3. **演示不冒充事实**：涉及真实公司的样例不虚构亏损、倒闭、销量或财务数字。
4. **元数据优先**：论文和微信文章只保存必要元数据、摘要和链接；没有授权不复制全文。
5. **广覆盖而非绝对完整**：“全球”指可持续扩展的多地区、多语言来源网络，不承诺互联网信息零遗漏。

## 文档

- [PRODUCT.md](./PRODUCT.md)：产品定位、信息架构和验收边界。
- [DESIGN.md](./DESIGN.md)：视觉系统、组件规则、响应式和无障碍规范。
- [docs/CONNECTORS.md](./docs/CONNECTORS.md)：真实数据连接器、微信公众号合规流程及去重策略。

## V1 边界

V1 不包含实时行情/K 线、交易、登录、付费、邮件推送、后台编辑器、定时采集或论文全文阅读器。股市内容仅限公司公告、财报盈亏、并购重组和股价异动相关新闻。
