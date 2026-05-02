# 项目结构（考学喵 · 申请平台 V0）

考学喵/
├── docs/                      # 产品设计文档
│   ├── PRD.md                 # 需求文档（新版）
│   ├── README.md              # 项目介绍（新版）
│   └── DECISIONS.md           # 决策记录（沿用已有）
├── data/                      # 数据文件
│   ├── schools.json           # 学校及出愿信息（4 校）
│   ├── professors.json        # 导师库（每位导师一条记录）
│   └── schema/                # JSON Schema 验证文件（可选）
├── prototype/                 # 前端原型
│   ├── index.html             # 首页（学校卡片网格）
│   ├── school.html            # 学校详情页（含导师列表）
│   ├── professor.html         # 导师详情页（模态框或独立页）
│   ├── style.css              # 样式（极简，区分核验状态）
│   └── script.js              # 加载 JSON 并渲染
├── tools/                     # 辅助脚本
│   ├── fetch_professors.js    # 调用 Perplexity/Cursor 生成导师 JSON 的半自动工具
│   └── validate_data.py       # 校验 JSON 是否符合 schema
└── README.md                  # 项目入口说明（新版）