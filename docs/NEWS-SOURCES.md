# 每日新闻来源与热点

新闻采集现在包含 40 组 Google News RSS 查询：10 个品牌、5 个中文行业主题、14 个海外工业媒体域名、4 个人本/C&U 专项通道及 7 个全球综合与细分行业主题。搜索查询是同一搜索服务的不同通道，并非 40 家独立 API 提供商。

独立直连来源包括：

- 人本集团官网“新闻资讯”公开分页接口：读取标题、官网摘要、发布时间和详情 URL；当前每次最多取 60 条并做行业/企业信号过滤。
- SKF 与 Timken 官方新闻页，以及 RBC Bearings 官方新闻 RSS。
- SKF Evolution、Design World、Bearing Tips、Motion Control Tips RSS。
- GDELT DOC 2.0 两组全球发现查询；遇到限流时只记录失败，不阻断其他来源。
- NewsAPI Everything 可选增强源；仅在配置 `NEWS_API_KEY` 时启用。

海外媒体域名检索覆盖 Bearing News、Bearing Tips、Design World、Power Transmission、BearingNet、Motion Control Tips、Reliable Plant、Plant Services、Machine Design、OEM Off-Highway、Windpower Engineering、Railway Gazette、Offshore Wind 与 Maintworld。所有结果仍需通过机械轴承语义、来源质量和未来日期过滤。

来源故障或没有近期文章时记录健康状态。来源原始日期保留；未来日期不进入新闻流。去重后最多保留 600 条自动采集新闻，人工核验的微信条目另外保留。中文标题翻译失败的文章不发布；人本集团官网官方条目少于 10 条时禁止发布新快照，线上继续保留上一版可用内容。

GitHub Pages 现有计划每 3 小时同步一次，成功同步、测试和构建后发布，理论上每天 8 次。GitHub 的计划任务可能排队延迟，不保证精确到分钟。

每日行业热点从近七日文章中选择最多 10 条，综合新鲜度、官方来源和产品、技术、产能、财务等行业事件排序。这是编辑规则排序，不是未经验证的全网阅读热度。没有近七日新闻时允许为空，不把旧新闻改成今天。

人本集团新闻已通过集团官网公开接口自动更新；人本微信公众号仍通过人工核验的公开 URL 接入。官网自动更新不等同于已实现公众号全量自动发现，也不会绕过微信登录态、验证码或隐藏接口。
