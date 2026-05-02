**MENTOR-PERPLEXITY-PROMPTS.md**

> 草案 v0.1 · 关联 `PRD-mentors.md` §6 · `data/mentors.json`
> 用途：把一位导师的主页 URL 喂给 Perplexity，拿回一条可入 `mentors.json` 的数据。

---

## 使用方法

1. 拿到导师的主页 URL（你整理）。
2. 复制 **主提示词**，把 `<...>` 换成实际值，粘进 Perplexity。
3. Perplexity 返回 JSON → 按下方质检清单过一遍 → 通过就贴进 `mentors.json`。
4. 遇到问题（主页太空、标签跨主题、接收信号模糊），用对应的追问提示词。

---

## 主提示词

```
访问以下导师主页，按给定 schema 输出一条 JSON：

- 中文名：<填写>
- 日文原名：<填写>
- 学校 school_id：<填写，如 utokyo>
- 学校中文名：<填写，如 东京大学>
- 主页 URL：<填写>
- 内部编号 id：<填写，如 utokyo_001>

【一级标签 tag_primary · 五选一】
Media：媒介、传播、新闻、平台、数字社会、算法
Gender：性别、女性研究、酷儿研究、家庭性别分工
社会福祉：福祉政策、贫困、照护、不登校、障碍、心理健康、儿童青少年福祉
文化：文化社会学、亚文化、消费文化、艺术社会学
其他：以上均不合适时使用

【标签来源优先级】
1. 主页「研究分野 / Research interests」→ tag_source = "homepage_primary_field"
2. researchmap.jp「研究キーワード」→ tag_source = "researchmap_keywords"
3. 从代表作/项目推断 → tag_source = "inferred_from_evidence"，附 ≤100 字说明

【接收信号 · 搜索以下关键词】
受け入れ / 修士 / 大学院生 / 相談 / 指導 / 募集 / 院試
- mentioned：页面明确出现接收相关描述
- not_mentioned：全页无相关描述
- unclear：有提及但语义模糊（如仅写「相談に応じる」）

【输出 schema】
{
  "id": "<给定的 id>",
  "school_id": "<给定的 school_id>",
  "name_zh": "<中文名>",
  "name_ja": "<日文原名>",
  "name_en": "<罗马字，无则 null>",
  "title": "<教授/准教授/讲师/助教>",
  "faculty_zh": "<研究科中文名，无则 null>",
  "specialization_zh": "<专攻中文，无则 null>",
  "url_homepage": "<主页 URL>",
  "url_lab": "<研究室 URL，无则 null>",
  "url_researchmap": "<researchmap URL，无则 null>",
  "tag_primary": "<五选一>",
  "tags_secondary": ["<最多 3 个，不重复 tag_primary>"],
  "keywords": ["<3-8 个中文搜索词，避免过于学术的术语>"],
  "tag_taxonomy_version": "v1",
  "tag_source": "<三选一>",
  "evidence": [
    {
      "title_zh": "<中文简述>",
      "title_original": "<原标题>",
      "url": "<可访问的真实 URL>",
      "source_type": "<homepage_research_interest / lab_project / publication / researchmap_publication / other>"
    }
  ],
  "reception_signal": "<mentioned / not_mentioned / unclear>",
  "reception_excerpt_zh": "<中文转述，not_mentioned 为空字符串>",
  "reception_excerpt_original": "<原文摘录，not_mentioned 为空字符串>",
  "reception_url": "<指向该段落的 URL，not_mentioned 为空字符串>",
  "last_verified_at": "<YYYY-MM-DD>",
  "verified_by": "perplexity_v1",
  "status": "active",
  "changelog": ["<日期>: 首次录入，by perplexity_v1"]
}

【规则】
- URL 必须可访问，找不到的信息填 null 或 ""，不要用“未知”占位
- tag_primary 选“其他”时，在 JSON 后附 ≤100 字原因
- 先输出 JSON 代码块（```json），再有判断说明则放在代码块外
```

---

## 追问提示词

### 主页几乎无内容

```
依次尝试：
1. researchmap.jp 搜索「<日文原名>」+ 学校名
2. Google Scholar 搜索「<日文原名> + 社会学」近五年代表作
3. CiNii (ci.nii.ac.jp) 搜索该导师论文

按主提示词 schema 重新生成 JSON。若三条路径均无有效信息，返回“建议跳过此导师”。
```

### 标签跨多个主题

```
上一轮显示该导师横跨多个主题。请：
1. 从 evidence 中判断主要内容偏向哪个主题
2. 统计 researchmap 关键词各主题出现频次
3. 查看担当科目核心主题
推荐 tag_primary，次要主题填入 tags_secondary，重新输出 JSON。
```

### 接收信号语义模糊

```
你给出的原文是「<粘贴原文>」。判定：
1. 明确表达接收/拒绝，还是模糊的“可咨询”？
2. 针对修士、博士，还是泛指？
3. 是否附加条件？

若 1 为模糊，将 reception_signal 改为 "unclear"，更新中文转述，重新输出 JSON。
```

---

## 质检清单

```
□ 访问 url_homepage，确认导师存在
□ 点开 evidence[0].url，确认链接有效
□ tag_source = inferred_from_evidence → 人工复核标签，其余抽样
□ reception_signal = mentioned → 对照原文确认摘录真实存在
□ 通过：verified_by 改为 "huan_after_perplexity_v1"，changelog 追加记录，贴进 mentors.json
□ 不通过：用追问修正或人工接手
```
## 迭代记录追加条目
v0.1 实测复盘(2026-05-01,35 条数据)
迭代记录 1 · url_homepage 字段约束太严
现象:35 条数据中 24 条 url_homepage = null(覆盖率 31%)。提示词原本要求"主页 URL 必须可打开",但日本大学教员普遍不维护个人主页,导致 Perplexity 大量填 null。
根因:不是提示词问题,是 schema 与现实不符。
修正方案:

Schema 已升 v0.4:新增 url_faculty_listing 必填字段,url_homepage 改为可空
主提示词需更新:把"主页 URL 必须可打开"改为"先找个人主页填 url_homepage(无则 null);必须从教员列表页找出该导师的位置填 url_faculty_listing"

待 Huan 决定:是否现在就把 v0.1 提示词升级为 v0.2 加入 url_faculty_listing 字段。

迭代记录 2 · tags_secondary 大量为空
现象:35 条数据大多数 tags_secondary: [],仅极少数有值。
根因:提示词写"必须能被 evidence 支持",Perplexity 在保守判断下选择"宁可不打也不打错"。但实际上很多导师 keywords 字段已经反映了多主题特征(如同时出现"性别"和"福祉"),只是 Perplexity 没把这些主题归入 secondary。
修正方案:

v2 提示词追加约束:"如果 evidence 或 keywords 反映出 ≥2 个研究方向,tags_secondary 至少填 1 个不重复 tag_primary 的主题"
旧 35 条数据不重打(成本不划算),让 v2 自然产生更好的新数据

示例对比:
v1 输出(保守):
  tag_primary: "Gender"
  tags_secondary: []

v2 期望输出(基于 keywords 同时含"福祉"和"性别"):
  tag_primary: "Gender"
  tags_secondary: ["社会福祉"]

迭代记录 3 · reception_signal 100% 是 not_mentioned
现象:35 条全部 reception_signal: "not_mentioned",无一例外。
两种可能(待 Huan 实测验证):

真实情况:日本教员页普遍不写"接收"相关描述,这是真相
提示词缺陷:Perplexity 没认真翻找,默认填 not_mentioned

验证步骤(待 Huan 做):

手动打开 3-5 位有 url_homepage 的导师页(赤川学/井口高志/稲葉哲郎)
Ctrl-F 搜:受け入れ / 修士 / 大学院生 / 相談 / 指導
若手动也找不到 → 真实情况,提示词无需改
若手动能找到但 Perplexity 没找到 → 提示词需要在 reception 那一段加"逐页全文搜索这 5 个关键词"

根据验证结果决定 v2 提示词改不改。

迭代记录 4 · 结构化字段命中率高,确认 AI 主流程可行
现象:tag_source 100% 是 homepage_primary_field,无一例 inferred_from_evidence。
含义:这次实测数据集(东大社会学/総合文化、一橋社会学、早大社会科学)全部命中"导师主页有结构化字段"。说明在国立核心 + 私立核心校 + 教授级群体里,AI 主流程的有效性边界判断(PRD-mentors §6.4)是成立的——这是好消息,也是 v0.1 提示词的最大成功。
结论:AI 主流程方向不变,后续优化都是参数调整,不是路线变更。
风险提示:扩到地方国立校时(神户/名古屋/北海道等),inferred_from_evidence 占比会上升,届时可能需要在主提示词外加边界追问。

