# PRD-mentors.md · 模块 B 导师库与套磁工具规格

> 状态：**草案 v0.3(待 Huan 审核后定稿为 v1.0)**
> 关联文档：`PRD.md` v1.0(模块 A) / `STATE.md` §-1, §H / `DECISIONS.md` / `MENTOR-PERPLEXITY-PROMPTS.md`(待建)
> 使用约定：本文档仅描述"是什么 / 长什么样 / 怎么验收"。"为什么这么定" 看 `DECISIONS.md` 和 `STATE.md` §4。

## 1. 修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|---|---|---|---|
| v0.1 | 2026-05-01 | Claude (草) → Huan (待审) | 基于 STATE §H 临时规格 + §4 Q7–Q12 决策落档 |
| v0.2 | 2026-05-01 | Claude (草) → Huan (待审) | 收敛 Q-mB-1~4 / 加 `tag_taxonomy_version` / 加主题扩张触发 / §5.3 加前端渲染细则 |
| v0.3 | 2026-05-01 | Claude (草) → Huan (待审) | **重大方向变更**：标注流程从"人工 SOP"改为"AI 主流程 + 人工质检"；废弃 MENTOR-SOP.md；新增 §6.4 AI 标注有效性边界；改写 §6.3 / §7.4 |
+ | v0.4 | 2026-05-01 | Claude (草) → Huan (待审) | 实测 35 条数据后修复 schema:url_homepage 改为可空 + 新增 url_faculty_listing 必填字段;§7 验收追加 url 校验项 |

## 2. 背景与目标

### 2.1 为什么要做这个模块

PRD v1.0(模块 A)解决"目标校的 DDL/文书/套磁信息在哪查"——它让用户拿到事实。但用户拿到事实之后还要做两件 PRD v1.0 不覆盖的事：

1. **按研究主题筛选导师**——一所大学院往往有几十位社会学方向教授，用户没法一个个读官网判断"谁做的研究和我相关"
2. **行动化套磁**——确认导师可关联之后，用户卡在"邮件怎么写、什么时候发、没回复怎么办"

模块 B 把这两步从"用户自己摸索"变成"平台引导"。

### 2.2 用户价值
- **筛选**：4 主题分类 × 二级标签 × 关键词，让用户 30 秒内找到 5–10 位候选导师
- **判断**：每位导师附 ≥1 条研究证据(论文/项目/主页段落)，用户能验证标签准确性、不靠平台单方面背书
- **行动**：每张卡片附固定 3 条套磁动作建议，把"该不该联系、什么时候发、没回怎么办"变成可执行清单

### 2.3 北极星指标(待 MVP 上线后定基线)
- 主指标：**每周点击导师证据链接的用户数**(代表"用户真的在用证据做判断")
- 辅指标：导师卡片 CTR、套磁动作建议展开率

## 3. 范围与边界

### 3.1 MVP 包含
- 4 主题筛选：Media / Gender / 社会福祉 / 文化
- 10–15 所学校 × 每校 5 位精选导师 = 50–75 位
- 每位导师卡片：基础信息 + 标签 + ≥1 条证据 + 接收信号(三态) + 3 条固定套磁动作建议
- 每所学校"教员列表入口"：外链官方教员页面，统一中文文案「查看全部教员 →」
- **标注流程**：AI(Perplexity)主流程 + Huan 质检；不需要人类编辑团队(详见 §6)

### 3.2 MVP 不做(明确砍掉)
- AI 自动匹配导师 ← 准确性要求高，不适合 MVP
- 用户站内联系导师/在站内发送邮件 ← 法律灰区，且不是平台核心价值
- 导师评分/评论 ← 同 PRD v1.0 砍社区的逻辑
- 自动爬取教员页 ← 与 PRD v1.0 一致，标注流程是 AI 辅助式人工录入，不是无监督爬取
- 邮件模板生成器 ← 套磁建议是行动指南，不是邮件代写
- **多人编辑团队** ← v0.3 决策：标注以 AI 为主流程，Huan 一人质检，无需扩编(详见 §6.4)

### 3.3 与模块 A 的关系
- 模块 A 学校数最终 15 所；模块 B 学校数 10–15 所(子集)
- **模块 A 收录、模块 B 未收录的学校**：详情页 **不显示精选导师区块**，仅显示「查看全部教员 →」外链按钮
- **模块 B 收录的学校**：详情页显示双层结构——精选导师卡片网格 + 「查看全部教员 →」外链按钮
- 学校在模块 A / B 中分别进出由 `schools.json` 中 `has_mentor_library: true/false` 字段控制

## 4. 数据模型

### 4.1 存储拆分
- `data/schools.json`：学校 + 研究科/专攻数据(模块 A)
- `data/mentors.json`：导师数据(模块 B)
- 关联键：`mentors[].school_id` ↔ `schools[].id`

### 4.2 mentors.json 字段表

#### A. 基础信息(必填)
| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 唯一编号，格式 `<学校代号>_<3 位序号>`，如 `UTokyo_001` |
| `school_id` | string | 关联 `schools.json` 的 id |
| `name_zh` | string | 导师中文姓名(主) |
| `name_ja` | string | 日文姓名(原文，含假名) |
| `name_en` | string | 罗马字/英文姓名 |
| `title` | enum | `教授` / `准教授` / `讲师` / `助教`(`特任教授` / `名誉教授` 归类到 `教授`) |
| `faculty_zh` | string | 研究科/学院名(中文) |
| `specialization_zh` | string | 专攻/方向(中文，可空) |
| `url_homepage` | string \| null | 导师个人主页(若有,必须可打开;无个人主页则填 null。详见下方备注) |
| `url_faculty_listing` | string | **v0.4 新增** · 导师在所属研究科教员列表页的位置(必填,URL 必须可访问;此为"该导师真实存在"的最低验证锚点) |
| `url_lab` | string \| null | 研究室主页(若与主页不同) |
| `url_researchmap` | string \| null | researchmap.jp 档案页(若收录) |
**关于 url_homepage / url_faculty_listing 的设计意图(v0.4 关键)**:

实测发现日本大学教员普遍不维护个人主页(2026-05-01 数据 35 条中只有
31% 有 `url_homepage`)。因此把"导师真实存在性"的验证锚点从
`url_homepage` 转移到 `url_faculty_listing`:

- `url_homepage` 表示导师的个人主页(奢侈品,可空)
- `url_faculty_listing` 表示导师在研究科教员列表中的位置(必需品,必填)

前端渲染时,优先显示 `url_homepage`;无则 fallback 到 `url_faculty_listing`,
按钮文案对应改为"在教员列表中查看"。这样用户永远知道点击会去到哪种页面,
不会被误导。

#### B. 研究标签(必填，平台筛选引擎)
| 字段 | 类型 | 说明 |
|---|---|---|
| `tag_primary` | enum | `Media` / `Gender` / `社会福祉` / `文化` / `其他` (单选) |
| `tags_secondary` | string[] | 多选，最多 3 个，必须能被 `evidence` 支持 |
| `keywords` | string[] | 3–8 个中文用户搜索词 |
| `tag_taxonomy_version` | string | 标签分类树版本号，默认 `"v1"` |
| `tag_source` | enum | **v0.3 新增** · 标签来源：`homepage_primary_field` / `researchmap_keywords` / `inferred_from_evidence` / `manual_override` |

**校验规则**：`tag_primary` + `tags_secondary` + `keywords` 必须共同支撑"用户能筛到这位导师"，否则该数据不应入库。

**关于跨主题学者**：现实中确实有学者跨多个主题(如同时做 Gender 和 Media)。规格保持 `tag_primary` 单选——按"最主要的研究归属"打 1 个；其余主题靠 `tags_secondary` 表达。这避免筛选页同一位导师在多个主题下重复出现。

**关于 `tag_source` 字段(v0.3 新增的关键设计)**：
- `homepage_primary_field`：标签来自导师主页的「主な研究分野 / 専門分野 / Research interests」字段(导师本人填的) —— **最可靠**
- `researchmap_keywords`：标签来自 researchmap.jp 的「研究キーワード」(导师本人录入) —— **同样可靠**
- `inferred_from_evidence`：上述两者都没有时，从 evidence 推断 —— **次可靠，需 Huan 复查**
- `manual_override`：Huan 质检时人工改过 —— **完全可信**

这个字段的作用是让 Huan 在质检时能**按可信度优先级排序**：先扫 `inferred_from_evidence` 的(最可能出错)，再抽样看其他来源。

#### C. 证据(必填)
| 字段 | 类型 | 说明 |
|---|---|---|
| `evidence` | array of object | 至少 1 条，最多 3 条 |
| `evidence[].title_zh` | string | 论文/项目/研究主题说明(中文一行解释) |
| `evidence[].title_original` | string | **v0.3 新增** · 原文标题(日文/英文)，便于核对 |
| `evidence[].url` | string | 对应网页或 PDF 入口 |
| `evidence[].source_type` | enum | `homepage_research_interest` / `lab_project` / `publication` / `researchmap_publication` / `other` |

**证据优先级(取入时遵循)**：导师主页 Research interests → researchmap 代表作 → 研究室项目页 → 单篇论文。**1 条强证据 > 10 条弱证据**。

#### D. 接收信号(必填，三态)
| 字段 | 类型 | 说明 |
|---|---|---|
| `reception_signal` | enum | `mentioned`(页面明确出现接收相关描述) / `not_mentioned`(页面未出现) / `unclear`(信息不清楚) |
| `reception_excerpt_zh` | string | 从页面摘一句中文转述(让用户看懂为什么这么标) |
| `reception_excerpt_original` | string | **v0.3 新增** · 原文摘录(日文)，便于 Huan 质检对照 |
| `reception_url` | string | 指向出现该描述的页面位置 |

**重要语言规范**：写"页面是否出现接收相关描述"，**不写"收/不收"**。平台不替导师做承诺，只标信号。

#### E. 维护字段(必填)
| 字段 | 类型 | 说明 |
|---|---|---|
| `last_verified_at` | YYYY-MM-DD | 最后核验日期，硬上限 90 天 |
| `verified_by` | string | **v0.3 调整**：可填 `Huan` / `perplexity_v1` / `huan_after_perplexity_v1`(后者表 AI 起草 + Huan 质检) |
| `status` | enum | `active`(有效) / `pending_review`(待复核) / `link_broken`(链接失效) |
| `changelog` | array of string | 简短变更记录 |

### 4.3 schools.json 增补字段
- 在每个学校对象增加：`has_mentor_library: boolean` —— 控制详情页是否显示精选导师区块

### 4.4 主题分类树扩张机制

**字段层面已留扩张余地**：
- `tag_primary` 是 enum，新增主题就是加 enum 选项，不改 schema
- `tags_secondary` 是开放数组，本身就是"未来一级主题的预备役"
- `tag_taxonomy_version` 字段用于在主题树重大调整时区分新旧数据

**触发评估的硬条件**(满足任一即触发，由 Huan 决定是否扩张)：
1. `tag_primary === "其他"` 的导师占比 > 10%
2. 某个 `tags_secondary` 标签累计出现在 ≥ 10 位导师身上
3. 用户反馈中出现 ≥ 5 次"找不到 XX 主题的导师"

**扩张操作步骤**(触发后)：
1. Huan 决定新增的一级主题名
2. 升 `tag_taxonomy_version` 到 `v2`，新数据按新主题树打
3. 旧数据保留 `v1` 标记不动；逐批重打 v1 → v2(此时可批量重跑 Perplexity 提示词)
4. 在 `DECISIONS.md` 记录主题扩张决策

**MVP 阶段不强制扩张**：第一年 4 主题做扎实优先。

## 5. UI 与交互

> 视觉硬约束(无彩色/无登录/无社区/学士帽猫 logo)沿用 PRD v1.0 §5.1, §3.3，本节不重复，仅描述模块 B 新增内容。

### 5.1 学校详情页 · 导师区块(双层结构)

```
[ 学校详情页 - 模块 A 部分 ]
   出愿期间 / 文书清单 / 套磁信息 / PDF / 官网链接
————————————————————————————————————————
[ 模块 B 部分 - 仅当 has_mentor_library === true 时显示 ]
   精选导师 (5–10 张卡片网格)
   ↓
   〔 查看全部教员 → 〕  ← 外链官方教员页
————————————————————————————————————————
[ 模块 B 部分 - 当 has_mentor_library === false ]
   〔 查看全部教员 → 〕  ← 仅外链按钮，无精选区块
```

### 5.2 导师卡片(精选区块内)

每张卡片含 4 个区域：

1. **头部**:姓名 / 职称 / 研究科·专攻 / 链接按钮
+    - 若 `url_homepage` 非 null:显示"访问个人主页"
+    - 若 `url_homepage` 为 null:fallback 到 `url_faculty_listing`,显示"在教员列表中查看"
2. **标签区**：一级标签徽章(无彩色) + 二级标签 + 关键词(最多展示 5 个，多余折叠)
3. **证据区**：默认展开第 1 条证据(标题 + 链接)，第 2、3 条折叠
4. **接收信号 + 套磁动作**：信号三态文字标识 + 套磁建议折叠展开

**接收信号视觉规范**：
- `mentioned`：方框文字"页面提及接收信息"+ 摘录预览
- `not_mentioned`：灰色文字"页面未提及接收信息"
- `unclear`：灰色文字"信息不清楚"
- 三态共用同一种视觉容器，**不用红/绿/黄区分**

### 5.3 套磁动作建议(MVP 固定 3 条，前端硬编码)

**渲染策略**：3 条建议由前端常量提供，不写入 `mentors.json`。

- **常量文件**：`prototype/constants/submission_guide.js`
- **导出名**：`SUBMISSION_GUIDE`
- **结构**：数组，每条 `{ icon, title, body }`

```javascript
export const SUBMISSION_GUIDE = [
  {
    icon: "1️⃣",
    title: "联系目的",
    body: "建议联系去确认：今年是否接收修士 / 是否建议该主题报考。不要在首封邮件中要求评价研究计划。"
  },
  {
    icon: "2️⃣",
    title: "发送前自检",
    body: "至少引用本卡片 1 条证据，说明你为什么联系这位导师。只问 2–3 个封闭式问题(可 yes/no 或简答)。邮件不超过 200 字。"
  },
  {
    icon: "3️⃣",
    title: "无回复策略",
    body: "5–7 天后发 1 次 follow-up。仍无回复则止损，换下一位导师，不要追问超过 2 次。"
  }
];
```

文案变动只改 `submission_guide.js` 一个文件，同步更新本 PRD §5.3。

### 5.4 主题筛选入口(P2)
全站顶部 4 个主题标签作为快速筛选入口——MVP 后期视用量决定是否做。

## 6. 标注流程(v0.3 重写)

### 6.1 流程总览

**全 AI 主流程，Huan 单人质检**。无人类编辑团队。

```
Huan 给一份学校 + 导师姓名 + 主页 URL 的清单
    ↓
对每位导师，运行 MENTOR-PERPLEXITY-PROMPTS.md 中的主提示词
    ↓
Perplexity 输出一条完整的 mentors.json 草稿(JSON 格式)
    ↓
Huan 质检(详见 §6.3)
    ↓
合并进 mentors.json
```

### 6.2 为什么这套流程能成立

模块 B 的标注本质是**搬运 + 翻译 + 映射**，不是"判断 + 归纳"。原因：

- 日本大学教员页普遍有结构化字段「主な研究分野 / 専門分野 / Research interests」——**导师本人填的**
- researchmap.jp 收录大部分有学术活动的导师，「研究キーワード」字段同样**导师本人填的**
- 这些已存在的结构化数据 → 我们 4 主题 enum 的映射，绝大多数情况是直接对应

Perplexity 在这套流程里**不做归纳判断**，只做「找到结构化字段 → 翻译 → 映射 enum」。它的擅长项。

### 6.3 Huan 的质检规则

Perplexity 不是无误的——它会偶尔编造 URL 或论文标题。质检规则按**可信度分层**：

#### 必检项(每位导师必看)
1. **`url_homepage` 实际访问一次**——确认页面存在、确认这位导师是真人
2. **`evidence[0].url` 实际点开一次**——核对论文/页面真实存在
3. **`tag_source` 是 `inferred_from_evidence` 的导师**——这意味着 Perplexity 没找到主页 primary field 也没找到 researchmap，**这种最容易出错**，必须人工复查 `tag_primary` 是否合理
4. **`reception_signal === "mentioned"` 的导师**——对照 `reception_excerpt_original` 和 `reception_url`，确认原文真的存在那句话(防止 Perplexity 编造接收承诺)

#### 抽样项(每 10 位抽 1 位)
- `tag_source` 是 `homepage_primary_field` 或 `researchmap_keywords` 的导师——抽样验证翻译/映射准确性
- `evidence[1]`、`evidence[2]` 的 URL(因为通常会先检查 `evidence[0]`，靠后的容易被忽略)

#### 全局检查(每批数据导入后)
- 4 主题分布是否符合预期(社会福祉占比应该最高)
- `其他` 主题占比是否 > 10%(若是，触发 §4.4 主题扩张评估)
- 同一所学校 5–10 位导师是否覆盖到 2–3 个主题(避免单主题扎堆)

### 6.4 AI 辅助标注的有效性边界

**这套流程在以下场景下成立(MVP 主流程)**：
- 国立核心校(东大 / 京大 / 阪大 / 一桥 / 东北 / 名古屋 / 九大)→ 教员页结构化程度高
- 私立核心校(早大 / 庆应)→ 教员页有英文版，researchmap 收录率高
- 教授 / 准教授 → researchmap 收录率 90%+

**这套流程在以下场景下退化(需更多 Huan 质检甚至放弃自动)**：
- 助教 / 特任研究员 → 主页常常极简，researchmap 未必收录 → `tag_source` 大概率是 `inferred_from_evidence`，建议跳过或人工补
- 地方国立校的小研究科 → 教员页可能仅"姓名 + 邮箱"，无任何研究信息 → 无法标注，**直接不入库**
- 跨学科研究者(如 STS、医疗社会学边缘领域)→ 主页 primary field 可能写"社会学 + 公共卫生"等多分类 → Perplexity 输出 `tag_primary === "其他"` 的概率高，需 Huan 决定归到 4 主题中哪个

**退化场景的处理原则**：宁可少录 5 位，不要录入劣质数据。MVP 80–120 位的目标里，**质量 > 数量**。

### 6.5 维护核验(沿用 v0.2)
- 每位导师 `last_verified_at` 不超过 90 天
- 90 天到了，**批量重跑 Perplexity 提示词**(成本极低)，对比新旧数据，有变化的进 `pending_review`
- 用户上报 → 立即 `pending_review` → Huan 处理(参 6.6)

### 6.6 用户上报处理
- 每张导师卡片底部反馈链接 → 飞书表单 / 邮箱
- 上报内容固定 3 类：链接失效 / 标签不准 / 信息过期
- **MVP 阶段反馈派单**：Huan 直接处理，30 天内核实
- 核实后：修正字段 + `verified_by` 改 `huan_after_perplexity_v1`(如果是改 AI 输出)或 `Huan`(纯人工)

## 7. 验收标准

### 7.1 数据层
- [ ] `mentors.json` 至少录入 30 位导师(覆盖 5 所学校，每校 5–6 位)以验证主流程
- [ ] 每位导师 A/B/C/D/E 五块字段全部满足必填
- [ ] 每位导师至少 1 条 `evidence` 链接可访问
- [ ] 主题分布满足策略：社会福祉优先，每校至少 1–2 位其他主题导师
- [ ] 所有导师 `tag_taxonomy_version === "v1"`
- [ ] 每位导师 `tag_source` 字段已填(`inferred_from_evidence` 占比 < 30%)
- [ ] 每位导师 `url_faculty_listing` 必须填且可访问;`url_homepage` 可为 null 但若非 null 必须可访问

### 7.2 UI 层
- [ ] `has_mentor_library === true` 的学校详情页显示精选导师网格 + 「查看全部教员 →」外链
- [ ] `has_mentor_library === false` 的学校详情页只显示外链，无精选区块
- [ ] 每张导师卡片正确显示：姓名/职称/标签/证据/接收信号/套磁建议折叠展开
- [ ] 接收信号三态视觉无彩色区分
- [ ] 套磁建议固定 3 条，从 `submission_guide.js` 常量读取
- [ ] "查看全部教员"文案在所有学校统一中文

### 7.3 关联层
- [ ] `mentors[].school_id` 全部能在 `schools.json` 中找到对应学校
- [ ] 移动端 375px 宽度下导师卡片无溢出

### 7.4 标注流程层(v0.3 新增)
- [ ] `MENTOR-PERPLEXITY-PROMPTS.md` 已落档
- [ ] 至少跑通 5 位导师的端到端流程(Perplexity 输出 → Huan 质检 → 入库)
- [ ] 抽样质检的错误率(URL 失效 + 标签明显错误)< 10%；超过则需调整提示词或加严质检

## 8. 非功能需求

- 性能：学校详情页加载(含 5–10 位导师卡片) ≤ 2 秒(4G)
- 兼容性：同 PRD v1.0 §6
- 数据隐私：不存储用户行为，不收集个人信息
- 多语言扩展：A 块基础信息预留 `name_ja` / `name_en` 字段；evidence 和 reception 块预留 `_original` 字段(v0.3 新增)便于核对

## 9. 待澄清

> ✅ **v0.3 暂无新开放问题。Q-mB-1 ~ Q-mB-4 已收敛(详见 v0.2 历史决策留底)。**
+ - **v0.4 schema 修复**(2026-05-01)→ 实测 35 条数据后发现 url_homepage 必填约束
+   与现实(31% 覆盖率)不符。新增 url_faculty_listing 字段作为真实性锚点;
+   url_homepage 改为可空。Schema 校验 35 条数据 0 错误。

### 历史决策留底

- **Q-mB-1** 4 主题不够覆盖时如何扩张 → 详见 §4.4
- **Q-mB-2** 同导师跨主题 → `tag_primary` 单选，跨主题靠 `tags_secondary`
- **Q-mB-3** 教员列表入口文案 → 统一中文「查看全部教员 →」
- **Q-mB-4** 用户反馈派单 → MVP 阶段 Huan 直接处理
- **v0.3 标注流程方向变更**(2026-05-01)→ 由 Huan 基于"教员主页有结构化 primary field + researchmap 收录率高"的具体证据，决定废弃人工 SOP 路线，改为 AI 主流程 + 单人质检

## 附录 · 术语表

| 术语 | 含义 |
|---|---|
| **套磁** | 报考前与目标导师邮件联系、确认接收意向的动作 |
| **信息确认型套磁** | 与"作品评价型套磁"相对——只问封闭事实，不要求导师评价材料 |
| **接收信号** | 平台只标"导师官方页面是否出现接收相关描述"，不做"收/不收"的结论性判断 |
| **精选导师** | 平台编辑标注 + 证据的导师；区别于"教员列表"(全量、外链官方页面) |
| **募集要項** | 日本大学院出愿正式文件 |
| **researchmap** | researchmap.jp，日本国立情报学研究所运营的研究者档案系统，多数导师有结构化「研究キーワード」字段 |
| **primary field** | 导师主页常见的「主な研究分野 / 専門分野 / Research interests」字段 |
| **tag_taxonomy_version** | 标签分类树版本号；当主题树发生重大调整时升版本，便于识别需重打的旧数据 |
| **tag_source** | v0.3 新增·标签来源字段；让 Huan 质检时能按可信度排序 |
| **url_faculty_listing** | v0.4 新增·导师在研究科教员列表页的位置(URL,可带锚点);"导师真实存在"的最低验证锚点,所有数据必填 |
| **个人主页 vs 教员列表页** | 个人主页是导师本人维护的独立站(可空);教员列表页是研究科官方维护的总览页(必填)。两者语义不同,字段分开 |
