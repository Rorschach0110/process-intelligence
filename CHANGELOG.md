# 更新日志

本文件用于记录 Process Intelligence 的重要变更。

日期格式使用 `YYYY-MM-DD`。

## [未发布]

### 新增

- 增加 `POST /api/upload-csv`，支持 CSV 上传、保存、字段列表和前 20 行预览。
- 增加 `POST /api/run-pipeline`，支持指定上传文件、字段映射和请求级碳排因子。
- 增加 `GET /api/runs`，读取最近 20 次 pipeline 运行历史。
- 增加 `GET /api/graph/export`，支持 JSON 和 Cypher 导出。
- 增加 `GET /api/graph/query`，支持按活动、资源、指标等节点类型查询图谱。
- 增加 `OptimizerProvider`、`RuleBasedOptimizer` 和 OpenAI 兼容 provider。
- 增加 Cytoscape.js 图谱可视化、上传映射界面、碳排因子控件、历史和报告视图。
- 增加 API、数据格式、图谱 schema、部署和故障排查文档。
- 增加 `docs/system-roadmap.md`，定义成熟工业系统模块和 P7-P15 路线图。
- 增加 FastAPI 应用入口 `backend/app/main.py`。
- 增加 SQLite repository 层，覆盖数据集和 pipeline 运行摘要。
- 增加 `pyproject.toml`、`uv.lock` 和 P7 repository 测试。
- 完成 P8-P15 工业系统中心能力：数据中心、流程挖掘中心、碳排核算中心、图谱中心、优化中心、仿真中心、报告中心和运维中心。
- 增加字段映射模板、数据质量报告、分页预览和数据集详情接口。
- 增加碳因子库、图谱快照、优化建议、LLM provider、仿真场景、报告、用户、审计和配置表。
- 增加 Dockerfile、备份脚本和冒烟测试脚本。
- 新增 `frontend/` Next.js 模块化产品界面，并保留 `web/` 作为 legacy 工作台。
- 新前端覆盖总览、数据中心、流程挖掘、碳排核算、知识图谱、优化决策、仿真评估、报告中心和系统运维模块。
- 增加 `frontend/README.md`，说明新前端模块边界、目录结构、后端连接和验证方式。
- 增加 `docs/frontend/product-workbench-development.md`，参考 `chat-process` 规划真正可交互的模块化产品工作台。
- 将 P17-P24 前端成熟化阶段写入 `TODO.md`。
- 完成 P17-P24：分组导航、数据知识库、量化建模向导、流程地图、图谱追溯、因子库、根因库、优化审核台、五步仿真、报告中心和资产中心。
- 增加 Vitest 单元/组件测试与 Playwright 页面冒烟和截图有效性检查。

### 变更

- 瓶颈识别从活动频次升级为活动持续时间。
- 流程分析新增资源负载、利用率和通用返工循环识别。
- 优化建议新增 `confidence` 和 `evidence` 字段。
- 碳排因子支持请求参数和 `data\config\carbon_factors.json` 配置。
- 每次 POST pipeline 运行结果保存为 `data\runs\<run_id>.json`。
- README、TODO 和开发指南已同步为 V0.2 当前状态。
- 上传接口会登记数据集；pipeline 运行会同步写入 JSON 文件和 SQLite 摘要。
- 部署文档已将推荐入口更新为 `uv run uvicorn app.main:app`。
- 业务中心服务拆分到 `backend/centers`，测试拆分到 `tests/feature_tests` 和 `tests/platform_tests`，保持目录密度限制。
- Next.js 通过 rewrite 将 `/api/*` 转发到 FastAPI 后端。
- 前端服务端组件直连 FastAPI，浏览器端请求继续通过 `/api/*` rewrite。
- 后端 API 主路由拆分到 `backend/app/routes/` 领域模块，保持单文件行数约束。
- 前端配置移动到 `frontend/config/`，前端说明移动到 `frontend/docs/README.md`，保持根目录密度约束。
- 前端测试环境从 jsdom 调整为 happy-dom，避免当前 Windows/Node 组合下的 ESM 依赖冲突。

### 已验证

- `python -m unittest discover -s tests`
- `python -m compileall backend`
- `GET /api/health`
- `POST /api/run-pipeline`
- `GET /api/runs`
- `POST /api/upload-csv`
- `GET /api/graph/export?format=cypher`
- `GET /api/graph/query?kind=activity&q=Assembly`
- `GET /`
- `uv sync`
- `uv run uvicorn app.main:app --host 127.0.0.1 --port 8765`
- `GET /api/datasets`
- `GET /api/carbon/factors`
- `POST /api/simulation/scenarios`
- `POST /api/reports`
- `GET /api/ops/diagnostics`
- `pnpm run lint`
- `pnpm run test`
- `pnpm run test:e2e`
- `pnpm run build`
- `uv run pytest`
- `GET http://127.0.0.1:3000/`
- `GET http://127.0.0.1:3000/data`
- `GET http://127.0.0.1:3000/graph`
- `GET http://127.0.0.1:3000/ops`
- `GET http://127.0.0.1:3000/api/health`

## [0.1.0] - 2026-05-12

### 新增

- 创建独立项目 `process-intelligence`。
- 增加只依赖 Python 标准库的最小后端。
- 增加静态前端工作台。
- 增加示例事件日志 `data/sample_event_log.csv`。
- 实现第一版闭环 pipeline：流程挖掘、多尺度碳排量化、知识图谱 JSON 建模和规则式 AI 优化建议。
- 增加 `GET /api/health`、`GET /api/sample-log`、`GET /api/run-pipeline`。
- 增加 `docs/function-selection.md` 和 `docs/development-guide.md`。
