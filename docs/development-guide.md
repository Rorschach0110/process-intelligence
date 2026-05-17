# Process Intelligence 开发指南

## 项目目标

Process Intelligence 聚焦一条轻量但完整的工业流程低碳优化闭环：

```text
CSV 事件日志 -> 流程挖掘 -> 碳排量化 -> 知识图谱 -> 优化建议 -> 报告/历史
```

当前版本保留标准库后端兼容入口，并已在 P7 引入 FastAPI 与 SQLite 底座。前端已新增 `frontend/` Next.js 工作台，`web/` 保留为 legacy 静态工作台。

## 目录结构

```text
D:\Desktop\new\process-intelligence
├── backend
│   ├── api            # HTTP 路由、请求解析
│   ├── graphing       # 图谱查询与导出
│   ├── optimization   # 优化器接口、规则兜底、OpenAI 兼容 provider
│   ├── pipeline       # 闭环编排
│   ├── repositories   # SQLite 数据访问
│   ├── services       # CSV、流程挖掘、碳排、图谱构建
│   ├── storage        # 运行历史落盘
│   ├── config.py
│   ├── models.py
│   └── server.py
├── data
│   ├── config
│   ├── runs
│   ├── uploads
│   └── sample_event_log.csv
├── docs
│   ├── frontend     # 新前端产品化开发方案
├── tests
├── frontend         # Next.js 模块化产品界面
└── web
```

## 后端流程

`pipeline.runner.run_pipeline()` 是核心编排函数，顺序为：

```text
load_events -> mine_process -> quantify_carbon -> build_knowledge_graph -> optimize
```

关键增强：

- CSV 上传保存到 `data\uploads`。
- 字段映射使用 `FieldMapping`。
- 碳排因子使用 `CarbonFactors`，请求参数优先，配置文件可持久化。
- 每次 POST 运行结果保存到 `data\runs`。
- P7 同步写入 SQLite：数据集表和运行摘要表。
- 优化器通过 `OptimizerProvider` 协议扩展，规则优化器始终作为离线兜底。

## 前端流程

legacy 静态工作台位于 `web`：

- 上传 CSV 并预览前 20 行。
- 为 7 个标准字段选择源列。
- 编辑电力与物料碳排因子。
- 运行 pipeline，展示流程、瓶颈、碳排、图谱、建议和报告摘要。
- Cytoscape.js 用于图谱可视化；CDN 不可用时回退到简化节点列表。
- 运行历史来自 `GET /api/runs`。

新产品工作台位于 `frontend`：

- Next.js App Router、React、TypeScript Strict、Tailwind CSS 4。
- 服务端组件通过 `PROCESS_INTELLIGENCE_API_BASE_URL` 直连 FastAPI。
- 浏览器端请求通过 `/api/*` rewrite 到 FastAPI。
- 后续产品化蓝图见 `docs/frontend/product-workbench-development.md`。

## 工程约束

继续遵守 `AGENTS.md`：

- Python、JS、CSS 等动态文件不超过 200 行。
- 单个文件夹不超过 8 个文件。
- 字符串优先使用单引号，Python 必须保留类型标注。
- FastAPI、SQLite 和 Next.js 已作为当前底座引入；Neo4j、PM4Py、G6/Three.js 等能力按工作台阶段逐步接入。

## 验证

推荐验证顺序：

```powershell
python -m compileall backend tests
python -m unittest discover -s tests
uv sync
uv run uvicorn --app-dir backend app.main:app --host 127.0.0.1 --port 8765
cd frontend
pnpm run lint
pnpm run build
```

服务启动后检查：

```powershell
Invoke-WebRequest http://127.0.0.1:8765/api/health
Invoke-WebRequest http://127.0.0.1:8765/
```

关键基线：

```text
events = 24
cases = 5
total_carbon_kg = 260.53
knowledge_graph.nodes = 15
knowledge_graph.edges = 25
estimated_saving_kg = 29.31
```
