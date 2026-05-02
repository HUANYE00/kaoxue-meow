# mentors.json 数据清洗报告

**生成时间**: 2026-05-01
**输入**: data_mentor.md (raw)
**输出**: mentors.json (合法 JSON 数组)
**Schema 版本**: PRD-mentors v0.4

## 1. 总览

- 总条数: **35**
- 唯一 id 数: 35

## 2. 学校分布

| school_id | 数量 |
|---|---|
| hit-u | 17 |
| utokyo | 16 |
| waseda | 2 |

## 3. 研究科分布

| faculty_zh | 数量 |
|---|---|
| 社会学研究科 | 17 |
| 総合文化研究科 | 14 |
| 人文社会系研究科 | 2 |
| 社会科学研究科 | 2 |

## 4. URL 覆盖率

- `url_homepage` 已填: **11 / 35** (31%)
- `url_faculty_listing` 已填: **35 / 35** (100%)

## 5. tag_primary 分布

| tag_primary | 数量 | 占比 |
|---|---|---|
| 文化 | 11 | 31% |
| 社会福祉 | 9 | 25% |
| 其他 | 7 | 20% ⚠️ |
| Gender | 6 | 17% |
| Media | 2 | 5% |

> ⚠️ `其他` 占比超过 10% 阈值,触发 PRD-mentors §4.4 主题扩张评估。
> 但本批数据 `其他` 主要来自東大総合文化研究科(地域文化研究专攻),属学科范围错配,
> 不一定需要扩张主题树,可能需要重新评估是否纳入此研究科。

## 6. 数据质量问题清单

✅ 无问题。

## 7. 已做的修改(每条 mentor 都加了一行 changelog)

1. 4 块原始数据(2 个独立对象 + 3 个数组)合并为单一 JSON 数组
2. 每条 mentor 新增 `url_faculty_listing` 字段(从 evidence 推导 / 从 KNOWN_LISTINGS 兜底)
3. 字段顺序按 PRD-mentors v0.4 标准排列
4. `url_homepage` 空字符串归一化为 null
5. 每条加 changelog 一行,记录本次清洗操作

## 8. 下一步

- [ ] Huan 抽样审核 5 条数据的 `url_faculty_listing` 字段是否合理
- [ ] 决定是否要砍掉东大総合文化研究科(其他主题占比过高)
- [ ] mentors.json 入仓 + 写到 STATE 已完成