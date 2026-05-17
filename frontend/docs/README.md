# Process Intelligence Frontend

`frontend/` 是 Process Intelligence 的新一代模块化产品界面。原有 `web/` 目录保留为 legacy 工作台，用于兼容旧的静态演示能力。

## 技术栈

- Next.js 16 App Router
- React 19
- TypeScript Strict
- Tailwind CSS 4
- Zustand
- Cytoscape.js
- lucide-react

## 产品模块

当前 App Shell 已按工业系统的中心化能力拆分：

- 总览 Dashboard：系统健康、数据资产、运行任务、流程健康和碳排摘要。
- 数据知识库：分类侧栏、搜索、上传、卡片/表格切换、详情抽屉和当前数据源选择。
- 量化建模：数据选择、字段映射、碳因子覆盖、pipeline 运行和结果跳转。
- 流程地图：活动阈值、路径阈值、指标切换、活动详情和图谱联动。
- 图谱追溯：Cytoscape.js 图谱、节点类型过滤、碳排滑块、节点详情和 Neo4j 导入计划。
- 碳排核算中心：碳因子库管理、根因库、图谱/建议沉淀和 JSON 导出。
- 优化决策中心：建议审核、采纳/拒绝、转仿真、生成报告。
- 仿真评估中心：五步方案向导、场景生成、方案对比和时间线导出。
- 报告中心：搜索、刷新、新建报告、HTML 预览和审计信息。
- 资产中心：从图谱抽取工厂/产线/资源/设备台账，预留 GLB/GLTF 接入。
- 系统运维：健康检查、数据库统计和备份清单。

## 目录说明

```text
src/app                 App Router 页面
src/components/layout   产品级导航和工作区栏
src/components/ui       通用展示组件
src/components/graph    图谱可视化组件
src/lib/api             API client
src/lib/stores          前端工作区状态
src/lib/formatters      展示格式化工具
src/types               后端响应类型
config                  ESLint、Vitest、Playwright 配置
docs                    前端说明文档
```

## 后端连接

服务端组件会通过 `PROCESS_INTELLIGENCE_API_BASE_URL` 直连 FastAPI，默认值为：

```text
http://127.0.0.1:8765
```

浏览器端请求仍可使用 `/api/*`，Next.js 会 rewrite 到同一个 FastAPI 后端。

## 本地运行

先启动后端：

```powershell
cd D:\Desktop\new\process-intelligence
uv run uvicorn --app-dir backend app.main:app --host 127.0.0.1 --port 8765
```

再启动前端：

```powershell
cd D:\Desktop\new\process-intelligence\frontend
pnpm install
pnpm run dev --hostname 127.0.0.1 --port 3000
```

打开：

```text
http://127.0.0.1:3000
```

## 验证

```powershell
pnpm run lint
pnpm run test
pnpm run test:e2e
pnpm run build
```

页面冒烟检查：

```text
/
/data
/graph
/ops
/api/health
```
