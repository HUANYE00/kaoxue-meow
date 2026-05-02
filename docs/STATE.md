# 考学喵 · STATE.md

> 📍 **这是什么**：项目运营状态。当前进度 + 任务 + 未决问题 + agent 工作协议。
> 📍 **不是什么**：决策(`DECISIONS.md`) / 功能规格(`PRD.md` / `PRD-mentors.md`) / 代码组织(`PROJECT_STRUCTURE.md`)
> 🕐 **最后更新**：2026-05-02 · Cursor agent（模块 A 前端接入 + mentors `school_id` 对齐导入；供 Claude Code 接力见 §6）

---

## §-1 · 产品方向 (任何 agent 开工前必读)

### 当前定位 · DOUBLE CORE
考学喵 = **模块 A (信息工具) + 模块 B (套磁工具)** 双核并重

#### 模块 A · DDL / 文书 / 套磁信息
- 用户用它 **收集事实**：目标校的出愿期间、文书清单、是否需事前接触、官方 PDF/官网链接
- 落档来源：`Users/yehuan/desktop/考学喵/PRD.md` v1.0 (2026-04-28)
- 状态：✅ 已规格化，可开工

#### 模块 B · 主题化导师库 + 套磁动作工具
- 用户用它 **选老师并行动**：按 4 主题筛导师 → 看证据 → 生成"信息确认型套磁"动作建议
- 4 主题：**Media / Gender / 社会福祉 / 文化**
- 数据单元：一行一位导师，含 一级标签(单选) / 二级标签(多选≤3) / 关键词(3-8) / 证据(≥1条) / 接收信号(三态：出现/未出现/不清楚)
- 规模目标：10-15 校 × 5 导师/校 = **50-75 位**
- 落档来源：⚠️ **暂无文档**，目前仅存在于 2026-05-01 Huan 与 Cursor 的对话中
- 状态：⚠️ **必须先落档为 `Users/yehuan/desktop/考学喵/docs/PRD-mentors.md`(草案)，然后才能开工**
 **2026-05-01(下午)** · Huan 决定:
  - 标注流程从"人工 SOP"改为"AI 主流程 + Huan 单人质检"(详见 PRD-mentors v0.3 §6)
  - 模块 B 规模从"每校 5-10 位"调整为"每校 5 位"

### 最近一次方向变更
**2026-05-01** · Huan 确认新增模块 B(导师库) · STATE 同步加入 §-1 节追踪机制

### 修改 §-1 的协议 (重要)
- 任何"产品定位"层级的变化(新增/砍掉/重定位 一个主功能)，**必须先改这一节**
- 仅 Huan 可改 §-1，agent 不得擅自动
- 改完后必须在 PRD / DECISIONS 同步落档，否则 §-1 是孤证、随时丢失

---

## 0. 工作协议

### 文档分工
| 文档 | 角色 | 谁能改 |
|---|---|---|
| `STATE.md` (本文件) | 运营层 | agent 收工时更新 + Huan 审核；**§-1 仅 Huan** |
| `DECISIONS.md` | 决策层 | 仅 Huan |
| `PRD.md` | 模块 A 规格 | 仅 Huan |
| `PRD-mentors.md` ⚠️待建 | 模块 B 规格 | 仅 Huan |
| `MENTOR-PERPLEXITY-PROMPTS.md` | 模块 B 标注 AI 提示词手册 | 仅 Huan |
| `PROJECT_STRUCTURE.md` | 代码组织 | agent 提议 → Huan 确认 |
| `README.md` | 对外门面 | 仅 Huan |

### 启动一次 agent 会话
1. **先读 §-1**，确认你今天在做模块 A 还是模块 B
2. 看 §3 任务队列 · 待领取，选一条
3. 复制：任务描述 + 它指定的上下文片段
4. 粘进 agent
5. 让 agent **先复述它要做什么、读了哪份文档**，再开干

### 结束一次 agent 会话
让 agent 输出：
```
✅ 完成: ...
🆕 待 Huan 确认的决策: ...
❓ 新开放问题: ...
📂 改动文件: ...
⚠️ 与已有文档冲突 (如有): ...
```
你贴回 STATE.md 对应区块 + 更新顶部时间戳。

### 何时该停下来质询
- §-1 / DECISIONS / PRD / PRD-mentors 里没有的事 → 停，加 ❓
- 任务队列里没有的事 → 不要做
- 模块 B 任何具体规格未落档 → 停，把任务挪回 P-1，要求 Huan 先落档

### 何时该闭嘴照办
- §-1 / DECISIONS / PRD 已定的事 → 不重新讨论
- 任务标了上下文段落 → 按段落走，不要脑补

### Agent 默认分工
| Agent | 适合 |
|---|---|
| **Claude Code 终端** | 写代码、跑命令、多文件改动 |
| **Cursor** | IDE 内单文件即时编辑 |
| **Claude Desktop** | 架构决策、写 PRD/SOP、整理上下文 |
| **Perplexity** | 搜外部信息(学校官网、募集要項、教员页) |
| **DeepSeek 网页** | 备用问答 |

---

## 1. 当前状态

PRD v1.0（模块 A）+ PRD-mentors（模块 B）已落档；DECISIONS 已合并 Q1–Q12 等。

**代码仓库（`kaoxue-meow/app`）**：模块 A 已接入结构化 `schools.json`（季节、DDL、材料、warnings、官方链接字段）；首页与学校详情页已展示倒计时横幅（ISO 日期）、核验摘要、分区内容。**模块 B**：`app/src/data/mentors.json` 已从根目录 `data/mentors.json` 同步导入，`school_id` 已与 `schools.json` 的 `id` 对齐（见 §6）；四所学校的 `has_mentor_library` 已置为 `true`。已移除 Saved/Tracker 路由与半吊子 localStorage，与「无账户」MVP 一致。

下一步可选：模块 B 导师卡 UI  polish、埋点、或继续扩充 `schools.json` 核验字段。

---

## 2. 关键引用
- 决策：`Users/yehuan/desktop/考学喵/DECISIONS.md` (注意：学校数条款可能需修订，见 ❓Q7)
- 模块 A 规格：`Users/yehuan/desktop/考学喵/PRD.md` v1.0(仅 DDL/文书/套磁信息工具部分)
- 模块 B 规格：`Users/yehuan/desktop/考学喵/PRD-mentors.md` v.1.0 SOP：`Users/yehuan/desktop/考学喵/MENTOR-PERPLEXITY-PROMPTS.md v0.1
- 代码组织：`Users/yehuan/desktop/考学喵/PROJECT_STRUCTURE.md` (未含 mentors.json 等模块 B 产物)
- 对外门面：`Users/yehuan/desktop/考学喵/README.md` (未提模块 B)

---

## 3. 任务队列

### 🚨 P-1 · 落档优先 (必须先做，否则模块 B 任何代码任务都无法启动)

- [x] **落档模块 B 规格 → `Users/yehuan/desktop/考学喵/PRD-mentors.md`(草案)**
  把 2026-05-01 对话中的导师库设计整理成正式规格：数据模型 5 块 / 标签体系 / 接收信号三态规则 / 套磁动作生成逻辑 / UI two-tier 结构(精选 + 教员列表入口) / 维护字段
  推荐: Claude Desktop — 上下文: §H
- [x] **落档导师标注 SOP → `Users/yehuan/desktop/考学喵/MENTOR-SOP.md`**
  给编辑/助教用：标签优先级 / 证据优先级 / 关键词写法 / 核验频率(90 天) / 用户上报后流程
  推荐: Claude Desktop — 上下文: §H
- [x] **更新 DECISIONS.md(由 Huan 操作)**
  模块 B 落档后，把已确认的决策合并进 DECISIONS：4 主题 / 数据模型字段 / 规模 80-120 / 学校数究竟 10-15 还是 15-20
  

### 🟢 P0 · 模块 A (信息工具)
- [x] schools.json 初版（4 研究科 + `seasons` / `deadlines` / `materials` 等）— 上下文: §B — **2026-05-02 已接入前端，部分 DDL 仍为 pending + referenceNote**
- [x] 首页卡片网格（季节标签 + 核验摘要 + 最近 ISO 节点横幅）— 上下文: §A、§D
- [x] 详情页骨架（出愿日程 / 材料 / 套磁信息 / 官方链接 / warnings；导师块保留）— 上下文: §C

### 🟢 P0 · 模块 B (导师库工具)
- [x] **mentors.json schema 设计**(只出字段表，不录数据) — 上下文: §H — ⚠️ 依赖 P-1 落档完成
- [x] **第一批学校名单冻结**(国立核心 + 私立核心 + 补位 ; 10 校 or 15 校先决) — 推荐 Huan + Claude Desktop — ⚠️ 见 ❓Q7
先不做目前学校名单以外的学校,考虑第二次迭代的时候再增加
- [x] **导师选择策略二选一**(A 覆盖 4 主题广度 vs B 优先学生踩坑最多) — 推荐 Huan 决定 — ⚠️ 见 ❓Q8 导师其实已决策完,主要是按照领域进行选择
- [x] **🧪 实测 Perplexity 提示词**——挑 3 位你最熟悉的东大导师跑主提示词,
  记录翻车点,产出 PROMPTS v0.2 迭代依据 — 上下文: §H +
  MENTOR-PERPLEXITY-PROMPTS §3 — ⏰ 优先级最高,因为它会影响后续所有标注
提示词已产出，范围仅限当前四校
### 🟡 P1
- [ ] 速览指南模态框 — 上下文: §D
- [ ] 新手浮层(localStorage) — 上下文: §D
- [ ] 异常占位符 — 上下文: §E
- [ ] **导师卡片 UI**(标签/证据/接收信号/套磁动作建议) — 上下文: §H — ⚠️ 依赖 P0「实测 Perplexity 提示词」完成 + 至少 5 位导师入库

### 🟡 P2
- [ ] 移动端 375px 响应式 — 上下文: §D
- [ ] 埋点 4+2 事件(新增 click_mentor_card / click_evidence_link) — 上下文: §F — ⚠️ 见 ❓Q4
- [ ] 数据扩展(模块 A 到 15 校 / 模块 B 到 50-75 导师)

### 🟡 进行中
*(空)*

### ✅ 已完成
- 2026-04-28 PRD v1.0(模块 A) 定稿 — 叶欢
- 2026-04-28 DECISIONS v1 落地(7 条)
- 2026-05-01 STATE 架构升级:§-1 产品方向追踪机制建立,模块 B 纳入
- 2026-05-01 Q1-Q12 + Q-mB-1~4 决策收敛,合并进 DECISIONS.md
- 2026-05-01 PRD-mentors v0.3 落档(从 v0.1 → v0.2 → v0.3 三次迭代)
- 2026-05-01 MENTOR-PERPLEXITY-PROMPTS v0.1 落档(替代废弃的 MENTOR-SOP)
- 2026-05-01 模块 B 规模决策:每校 5 位,总 50-75 位
- 2026-05-02 模块 A 前端：`Home.jsx` / `SchoolPage.jsx` 接入新 `schools.json`；新增 `utils/schools.js`、`components/ui/DataStatusBadge`、`WarningCard`；`npm run build` 通过
- 2026-05-02 导师数据：`scripts/sync-mentors-school-ids.mjs` 将旧键 `utokyo`→按 `faculty_zh` 分为 `todai-bunkei` / `todai-sogo`，`hit-u`→`hitotsubashi`；根目录 `data/mentors.json` 与 `app/src/data/mentors.json` 同步；`schools.json` 四校 `has_mentor_library: true`；`api/mentors.js` 查询兼容 `hit-u`；`MentorPage.jsx` 展示学校中文名链接
- 2026-05-02 MVP 收敛：删除 `SavedPage` / `TrackerPage`、`useLocalStorage` 及相关路由/导航；`MentorPage` 去掉收藏逻辑
---

## 4. 待澄清问题

### 4. 待澄清问题

### ✅ 已决策（2026-05-01 收敛）
- **Q1** README “每周自动更新” vs PRD “不自动化” → **以 PRD 为准，MVP 不自动化**，README 加 “(规划中)”
- **Q2** MVP 上线门槛 → **3 所学校起步**
- **Q3** PROJECT_STRUCTURE 漏列 DECISIONS.md → **立即补入** (同步操作)
- **Q4** 埋点上报方案 → **MVP 用 console + 本地 CSV 占位**
- **Q5** 部署方案 → **GitHub Pages**
- **Q6** sources.csv 角色 → **保留为数据溯源记录，前端不展示**
- **Q7** 学校总数 → **模块 A 最终 15 校，模块 B 最终 10-15 校**
- **Q8** 第一批导师选择策略 → **B 优先（学生踩坑最多）+ 每校至少 1-2 位其他主题导师** 
- **Q9** 数据存储 → **拆分为 `schools.json` + `mentors.json`，通过 `school_id` 关联**
- **Q10** 多语言字段 → **schema 预留 `name_ja`, `name_en` 等字段，初始为空**
- **Q11** 教员列表入口 → **外链官方教员页面，不嵌入**
- **Q12** 套磁动作建议 → **MVP 固定 3 条模板**

### ❓ 仍需澄清
(无)

---

## 5. 上下文片段索引

### §A · 项目目标与北极星 (模块 A)
- 阅读: `PRD.md` §2.1, §2.2, §2.3
- 一句话: DIY 日本大学院考生工具，砍掉社区/AI/登录/彩色

### §B · 数据模型 (模块 A)
- 阅读: `DECISIONS.md` 全部 + (待建) `data/schools.json`
- 单元: 学校（每校一个独立数据对象，其下按专攻/研究科组织信息，数据文件以学校为顶层粒度）
- 关键字段（顶层）: `name`（学校名）、`departments`（包含研究科/专攻数组）、`url_official`、`url_admission`
- 每个研究科/专攻节点包含: `deadlines` 数组 / `has_sgu` / `require_prior_contact` 等

### §C · 详情页规格 (模块 A)
- 阅读: `PRD.md` §5.3
- 5 区块: 出愿期间 / 文书清单 / 套磁信息 / 募集要項 PDF 链接 / 官网入试页

### §D · 视觉/交互约束 (全局)
- 阅读: `PRD.md` §5.1, §5.2, §3.3 "彩色强调 UI"那条
- **硬约束**: 无彩色 / 无登录 / 无社区 / 学士帽猫 logo

### §E · 异常处理 (全局)
- 阅读: `PRD.md` §5.4

### §F · 埋点 (全局)
- 阅读: `PRD.md` §5.5
- 模块 A: view_home / click_guide / click_school_card / click_feedback
- 模块 B 新增建议: click_mentor_card / click_evidence_link
- 上报方案: MVP 阶段 console.log + 本地 CSV，后期接入正式方案（Q4 已决策）

### §G · 验收清单 (模块 A)
- 阅读: `PRD.md` §7.1

### §H · 模块 B 临时规格 ⚠️
- ✅ **已落档为 docs/PRD-mentors.md v0.3**
- 本节保留作为产品方向溯源,实际开工请直接读 PRD-mentors.md
- 标注流程参 docs/MENTOR-PERPLEXITY-PROMPTS.md
- 核心要点(供 P-1 落档时参考):
    - **数据模型 5 块**：基础信息 / 研究标签(一级单选+二级多选≤3+关键词3-8) / 证据(≥1强证据带链接) / 接收信号(三态) / 维护字段(核验日期/状态/变更记录)
    - **4 主题**: Media / Gender / 社会福祉 / 文化
    - **规模**: 10-15 校 × 5-10 导师 = 80-120 位
    - **第一批导师选择**: 优先学生研究方向（社会福祉/不登校），每校至少覆盖 1-2 位其他主题（Q8 已决策）
    - **UI 双层**: 精选导师卡片(≤10/校，人工标注带证据) + 教员列表入口(**外链官方教员页面**，Q11 已决策)
    - **套磁动作**: 每张导师卡片固定显示 3 条模板——“联系去确认接收/主题”、“发送前检查证据+封闭问题”、“5-7 天 follow-up，仍无则止损”（Q12 已决策）
    - **核验频率**: 每位导师不超 90 天 / 用户上报后立即"待复核"
    - **接收信号语言**: 写"页面是否出现接收相关描述"，不写"收/不收"
- agent 做模块 B 任务时，**第一件事**确认 `docs/PRD-mentors.md` 是否已存在；不存在则拒绝开工，把任务挪回 P-1

## 6. 实施日志 · 给 Claude Code / 终端 agent 接力（最近）

> 本节记录**已实现行为与文件**，避免下一会话重复造轮或与文档脱节。更细决策仍以 DECISIONS / PRD 为准。

### 2026-05-02

| 主题 | 摘要 |
|------|------|
| 数据关联 | `mentors[].school_id` 使用与 `schools[].id` 相同的 canonical id：`todai-bunkei`、`todai-sogo`、`hitotsubashi`、`waseda`。旧 Perplexity 键已在对 JSON 的脚本中映射完毕。 |
| 双份 mentors | 权威清洗入口：`data/mentors.json`（仓库根）。同步命令：`node scripts/sync-mentors-school-ids.mjs`（会覆盖写入 `app/src/data/mentors.json`）。 |
| 模块 A UI | 详情页含：最近 ISO 倒计时（附免责声明）、风险提示、按季节的 DDL/材料、套磁信息、`pdfUrl` / `admissionPageUrl` / `facultyListingUrl`、去重后的其他 `officialUrls`。 |
| API 兼容 | `getMentorsBySchoolId('hit-u')` 仍指向 `hitotsubashi`；路由参数来自 `schools.json` 时均为新 id。 |
| 构建 | 在 `app/` 目录执行 `npm run build` 作为回归检查。 |

**接力时注意**：部分 DDL 为「区间→示例 ISO」展示，UI 已提示以 PDF 为准；非 ISO 的 `date` 字符串不进入倒计时逻辑。

## 附录 · agent 收工模板

```
请按以下格式输出本次工作的更新，若无此汇报，本次会话视为未完成，后续会话不得以此为起点：

✅ 完成的任务:
（任务名 + 一句话结果）

🆕 待 Huan 确认的决策:
（决策内容 + 背景理由 + 建议归入 DECISIONS.md 哪条）

❓ 新开放问题:
（问题 + 影响哪些任务）

📂 修改/新建的文件:
（路径 + 一句话说明）

⚠️ 与已有文档冲突 (如有):
（哪份文档哪一节 + 冲突点）
```

