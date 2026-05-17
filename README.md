# Process Intelligence

Process Intelligence 是一个面向工业流程的低碳过程智能平台原型。项目把事件日志上传、流程挖掘、碳排放量化、知识图谱建模、优化建议、方案仿真和报告输出串成一条可运行的闭环，帮助使用者回答一个核心问题：

```text
在一条生产或业务流程中，哪些活动、资源和返工路径正在制造最多碳排放，以及应该优先从哪里优化？
```

本项目当前定位为可演示、可验证、可继续扩展的系统原型，而不是重型企业级平台。后端使用 FastAPI 和 SQLite，前端使用 Next.js 工作台界面，仓库中也保留了早期静态 `web/` 工作台作为 legacy 入口。

## 核心闭环

```text
CSV 事件日志
  -> 数据集登记与字段预览
  -> 字段映射
  -> 流程挖掘
  -> 碳排放量化
  -> 知识图谱建模
  -> 优化建议生成
  -> What-if 仿真
  -> 报告与历史记录
```

系统会从事件日志中重建流程路径，识别活动频次、直接跟随关系、流程变体、瓶颈、返工循环和资源负载，再结合能耗与物料数据计算碳排放，并生成带证据、置信度、风险和验证方式的优化建议。

## 功能总览

| 模块 | 功能 | 作用 |
| --- | --- | --- |
| 数据资产 | 上传 CSV、登记数据集、预览字段和行数据 | 让原始事件日志进入平台，并为后续分析建立可追溯的数据来源 |
| 字段映射 | 将用户 CSV 字段映射到标准事件模型 | 支持不同命名习惯的数据表，降低导入门槛 |
| 快速量化 | 选择数据集、配置字段映射和碳因子，一键运行分析闭环 | 快速从原始日志得到流程、碳、图谱和优化结果 |
| 流程地图 | 展示活动节点、流程边、变体、瓶颈、耗时和返工路径 | 帮助定位流程复杂度、等待时间、重复劳动和异常路径 |
| 碳因子 | 管理电力、物料等排放因子，查看碳排放聚合结果 | 将流程事件转化为可比较的 kg CO2e 指标 |
| 知识图谱 | 构建 Process、Activity、Resource、Metric 等节点和关系 | 把流程结构、资源、指标和碳排证据组织成可查询图谱 |
| 优化建议 | 基于高碳活动、返工循环和高负载资源生成建议 | 输出可执行的减排动作、预估节省、风险和验证口径 |
| 方案仿真 | 创建 What-if 场景并比较方案影响 | 在真正改造前评估节能、减排和流程表现的可能变化 |
| 报告中心 | 生成和查看 HTML 分析报告 | 用于汇报流程基线、问题发现、优化方向和结果摘要 |
| 资产中心 | 管理与流程相关的设备、资源和业务资产视图 | 为资源负载、活动归属和后续设备级分析提供入口 |
| 运维中心 | 健康检查、诊断、备份清单和系统设置 | 帮助开发和演示时快速确认系统状态 |

## 当前前端页面

Next.js 前端位于 `frontend/`，主要页面包括：

- `/`：驾驶舱首页，汇总数据集数量、运行记录、总碳排、流程健康度和系统状态。
- `/data`：数据资产工作台，用于查看数据集、预览数据和触发上传流程。
- `/quantification`：快速量化入口，用于选择字段映射、配置碳因子并运行 pipeline。
- `/process-map`：流程地图，用于查看流程活动、边关系、瓶颈、耗时、变体和返工路径。
- `/carbon`：碳因子和碳排分析，用于维护因子库并查看活动、资源、维度级碳排。
- `/graph-workbench`：知识图谱工作台，用于查看图谱节点、关系和节点详情。
- `/optimization`：优化建议页面，用于查看减排建议、证据、风险和预计节省。
- `/simulation`：方案仿真页面，用于创建场景并查看模拟结果。
- `/reports`：报告中心，用于生成和浏览分析报告。
- `/assets`：资产中心，用于管理流程相关资源和资产视图。
- `/ops`：系统运维页面，用于查看健康检查、诊断和备份信息。

## 数据输入格式

推荐上传 CSV 事件日志。最小字段建议包含：

```csv
case_id,activity,timestamp
```

完整标准字段建议包含：

```csv
case_id,activity,timestamp,resource,energy_kwh,material_kg,device
```

字段说明：

| 字段 | 含义 | 是否必需 |
| --- | --- | --- |
| `case_id` | 流程实例、订单、批次或工单 ID | 是 |
| `activity` | 当前事件对应的活动名称 | 是 |
| `timestamp` | 事件发生时间 | 是 |
| `resource` | 执行该活动的人、设备、产线或资源 | 否 |
| `energy_kwh` | 活动消耗电量 | 否 |
| `material_kg` | 活动消耗物料重量 | 否 |
| `device` | 设备或装置名称 | 否 |

CSV 字段名不必和标准字段完全一致，上传后可以在前端进行字段映射。示例数据位于 `data/sample_event_log.csv`。

## 后端能力

FastAPI 后端位于 `backend/`，核心能力包括：

- 数据集管理：上传 CSV、登记数据集、分页预览、查看数据质量和字段信息。
- 映射模板：保存常用字段映射，减少重复配置。
- Pipeline 编排：执行 `load_events -> mine_process -> quantify_carbon -> build_knowledge_graph -> optimize`。
- 流程分析：统计案例数、事件数、活动数、直接跟随关系、流程变体、耗时、等待、返工和合规偏差。
- 碳排量化：按活动、资源和维度聚合碳排，计算总量和排序结果。
- 知识图谱：生成图谱 JSON，支持子图查询、条件查询和 Neo4j Cypher 导出计划。
- 优化器：默认使用规则优化器，根据高碳活动、返工循环和高负载资源生成建议。
- LLM Provider 预留：支持保存 OpenAI 兼容 provider 配置，后续可接入真实模型。
- 仿真与报告：支持保存 What-if 场景、评估场景结果并生成报告。
- 运维诊断：提供健康检查、目录状态、数据库统计和备份清单。

## 主要 API

默认后端地址：

```text
http://127.0.0.1:8765
```

常用接口：

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/health` | 服务健康检查和运行状态 |
| `GET` | `/api/datasets` | 数据集列表 |
| `GET` | `/api/datasets/{dataset_id}` | 数据集详情、字段和质量信息 |
| `GET` | `/api/datasets/{dataset_id}/preview` | 分页预览数据集内容 |
| `POST` | `/api/upload-csv` | 上传 CSV 文件 |
| `GET` | `/api/mapping-templates` | 获取字段映射模板 |
| `POST` | `/api/mapping-templates` | 保存字段映射模板 |
| `POST` | `/api/run-pipeline` | 运行完整分析闭环 |
| `GET` | `/api/runs` | 查看历史运行记录 |
| `GET` | `/api/carbon/factors` | 获取碳因子库 |
| `POST` | `/api/carbon/factors` | 新增碳因子 |
| `GET` | `/api/carbon/summary` | 获取当前碳排摘要 |
| `GET` | `/api/process/summary` | 获取当前流程摘要 |
| `GET` | `/api/process/compare` | 获取流程对比结果 |
| `GET` | `/api/graph/export` | 导出图谱 JSON 或 Cypher |
| `GET` | `/api/graph/query` | 查询图谱节点和关系 |
| `GET` | `/api/graph/subgraph` | 获取指定节点的邻域子图 |
| `GET` | `/api/graph/neo4j-plan` | 获取 Neo4j 导入计划 |
| `GET` | `/api/optimization/recommendations` | 获取优化建议 |
| `GET` | `/api/optimization/providers` | 获取 LLM provider 配置 |
| `POST` | `/api/optimization/providers` | 保存 LLM provider 配置 |
| `GET` | `/api/simulation/scenarios` | 查看仿真场景 |
| `POST` | `/api/simulation/scenarios` | 创建仿真场景 |
| `GET` | `/api/reports` | 查看报告历史 |
| `POST` | `/api/reports` | 生成报告 |
| `GET` | `/api/ops/diagnostics` | 运维诊断 |
| `GET` | `/api/ops/backup-manifest` | 备份清单 |
| `POST` | `/api/ops/settings/{key}` | 保存系统设置 |

## 技术栈

后端：

- Python 3.11+
- FastAPI
- Uvicorn
- SQLite
- Pydantic v2
- uv

前端：

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand
- Cytoscape.js
- lucide-react
- pnpm 10+

## 项目结构

```text
process-intelligence
  backend\              FastAPI 后端、流程分析、碳排量化、图谱和优化器
  data\                 示例数据、运行结果、报告和本地 SQLite 数据
  docs\                 API、数据格式、部署、开发和路线图文档
  frontend\             Next.js 产品工作台
  scripts\              本地脚本
  tests\                后端功能测试和平台测试
  web\                  legacy 静态工作台
  pyproject.toml        Python 项目配置
  uv.lock               Python 依赖锁定文件
  Dockerfile            容器构建入口
```

后端关键目录：

```text
backend\app\            FastAPI 应用和路由
backend\centers\        面向业务模块的服务中心
backend\graphing\       图谱查询、导出和 Neo4j 计划
backend\optimization\   规则优化器和 provider 接口
backend\pipeline\       分析闭环编排
backend\repositories\   SQLite 数据访问层
backend\services\       CSV 解析、流程挖掘、碳排和图谱构建
backend\storage\        当前结果和历史运行记录
```

## 本地运行

### 1. 启动后端

```powershell
cd "process-intelligence"
uv sync
uv run uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8765
```

后端启动后可以访问：

```text
http://127.0.0.1:8765
```

### 2. 启动前端

```powershell
cd "process-intelligence\frontend"
pnpm install
pnpm run dev
```

前端启动后可以访问：

```text
http://localhost:3000
```

Next.js 已配置 `/api/*` rewrite 到 FastAPI 后端 `http://127.0.0.1:8765`。

## 测试与质量检查

后端测试：

```powershell
cd "process-intelligence"
uv run pytest
```

前端检查：

```powershell
cd "process-intelligence\frontend"
pnpm run lint
pnpm run test
```

端到端测试：

```powershell
cd "process-intelligence\frontend"
pnpm run test:e2e
```

## 适用场景

这个项目适合用于：

- 工业流程低碳优化原型演示。
- 事件日志到流程洞察的端到端验证。
- 流程挖掘、碳核算和知识图谱融合实验。
- 面向比赛、课程设计、毕业设计或内部 PoC 的系统展示。
- 作为后续接入真实设备、真实排放因子和真实 LLM 决策助手的基础框架。
