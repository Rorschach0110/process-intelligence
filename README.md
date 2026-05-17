# Process Intelligence

Process Intelligence 是一个面向工业流程的低碳优化原型平台。它把事件日志、流程挖掘、碳排核算、知识图谱和优化建议串成一条可运行闭环，用来回答一个很具体的问题：

```text
一条生产或业务流程中，哪些活动、资源和返工路径正在制造最多碳排，以及应该优先从哪里优化？
```

这个项目当前不是一个重型企业平台，而是一个可快速演示、验证和继续扩展的工业系统原型。后端已引入 FastAPI 与 SQLite 底座，前端已新增 `frontend/` 模块化产品界面，原 `web/` 保留为 legacy 工作台。

## 它能做什么

用户上传 CSV 事件日志后，系统会完成以下流程：

1. 读取 CSV 并预览字段和前 20 行数据。
2. 将用户字段映射到标准事件模型。
3. 基于 `case_id` 和 `timestamp` 重建流程路径。
4. 识别活动频次、直接跟随关系、流程变体和活动时长瓶颈。
5. 聚合活动级、资源级和总量级碳排。
6. 识别资源负载、利用率和通用返工循环。
7. 生成 Process、Activity、Resource、Metric 组成的知识图谱。
8. 导出图谱 JSON 或 Neo4j Cypher。
9. 生成带置信度和证据字段的优化建议。
10. 保存每次运行结果，形成可追溯历史。

## 闭环链路

```text
CSV 上传
  -> 字段映射
  -> 流程挖掘
  -> 碳排量化
  -> 知识图谱建模
  -> 优化建议
  -> 历史记录 / 报告摘要
```

示例数据的基线结果：

```text
事件数: 24
案例数: 5
总碳排: 260.53 kg CO2e
图谱节点: 15
图谱关系: 25
预计节省: 29.31 kg CO2e
```

## 当前界面

前端工作台包含：

- CSV 上传区
- 字段映射面板
- 可编辑碳排因子
- 流程挖掘结果
- 活动碳排排行
- Cytoscape.js 知识图谱视图
- 优化建议卡片
- 报告摘要
- 运行历史

这套界面仍偏原型，但已经能完成从真实 CSV 到分析结果的端到端操作。

## 输入数据

推荐 CSV 至少包含：

```text
case_id, activity, timestamp
```

完整标准字段为：

```text
case_id, activity, timestamp, resource, energy_kwh, material_kg, device
```

字段名不必完全一致，上传后可在前端映射。详细规则见 `docs\data-format.md`。

## 后端能力

后端目前提供：

- `GET /api/health`
- `GET /api/sample-log`
- `POST /api/upload-csv`
- `POST /api/run-pipeline`
- `GET /api/datasets`
- `GET /api/runs`
- `GET /api/graph/export`
- `GET /api/graph/query`

每次 `POST /api/run-pipeline` 都会把结果保存到 `data\runs`，并登记到 SQLite。上传文件保存到 `data\uploads`，并登记为数据集。

## 优化器设计

当前默认使用 `RuleBasedOptimizer`，它基于三类证据生成建议：

- 高碳排活动
- 返工或重复循环
- 高碳排/高负载资源

项目也已经预留 `OptimizerProvider` 接口和 OpenAI 兼容 provider。没有 API Key 或 LLM 输出不合规时，系统会自动回退到规则优化器。

## 项目结构

```text
backend
  api            HTTP 路由与请求解析
  graphing       图谱查询和导出
  optimization   优化器接口、规则兜底、OpenAI 兼容 provider
  pipeline       闭环编排
  repositories   SQLite repository
  services       CSV、流程挖掘、碳排、图谱构建
  storage        运行历史
data
  sample_event_log.csv
  uploads
  runs
  config
docs
tests
frontend
web
```

`frontend` 是新的 Next.js 产品界面，`web` 是旧版静态工作台。

## 运行

```powershell
cd D:\Desktop\new\process-intelligence
uv sync
cd backend
uv run uvicorn app.main:app --host 127.0.0.1 --port 8765
```

打开：

```text
http://127.0.0.1:8765
```

## 新前端

```powershell
cd D:\Desktop\new\process-intelligence\frontend
pnpm install
pnpm run dev
```

打开：

```text
http://localhost:3000
```

Next.js 已配置 `/api/*` rewrite 到 FastAPI 后端 `http://127.0.0.1:8765`。

## 测试

```powershell
uv run python -m unittest discover -s tests
uv run python -m compileall backend tests
python -m compileall backend tests
python -m unittest discover -s tests
```

## 当前边界

这个版本刻意保持轻量，因此暂不包含：

- 登录、多用户和权限
- 生产级任务队列
- PM4Py 高级流程挖掘
- Neo4j 强依赖
- 默认启用真实 LLM 调用

这些不是“不做”，而是留到闭环验证后再分阶段接入。

## 后续演进

建议下一阶段优先做：

1. 将剩余标准库 HTTP 路由完全迁移到 FastAPI。
2. 将当前 SQLite 表扩展为正式任务、数据集和报告模型。
3. 将 frontend 中的中心页面继续补成交互式表单和审核流。
4. 接入真实 LLM provider，并增加人工审核和结果版本管理。
5. 增加 Playwright 端到端测试。

## 更多文档

- `docs\development-guide.md`
- `docs\api-reference.md`
- `docs\data-format.md`
- `docs\knowledge-graph-schema.md`
- `docs\deployment.md`
- `docs\troubleshooting.md`
- `docs\system-roadmap.md`
- `docs\frontend\product-workbench-development.md`
