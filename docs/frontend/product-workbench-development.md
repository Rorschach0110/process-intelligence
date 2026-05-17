# 模块化产品工作台开发方案

## 背景

当前 `frontend/` 已经完成产品壳和九个中心页面，但多数模块仍偏“指标贴图”：页面能展示后端结果，却缺少真实工作流、对象列表、编辑入口、运行状态、历史追踪和跨模块联动。

后续前端应直接借鉴 `D:\Desktop\chat\chat-process` 的功能组织和排版经验。参考重点不是复制技术栈，而是复制它的产品形态：

- 多应用工作台入口。
- 左侧分类或资源树，右侧内容区。
- 顶部搜索、刷新、新增、导出工具栏。
- 卡片网格、可筛选表格、详情页、抽屉和模态框。
- 分步骤业务向导。
- 图谱、流程图、甘特图、时间线和 3D 视图的真实交互。
- Zustand store 管理业务状态，service/client 封装 API。

## 参考模块

### 多应用壳

`chat-process/client/app/apps/layout.jsx` 提供了完整工作台形态：

- 可折叠侧边栏。
- 顶部数据展示区。
- 用户入口和反馈入口。
- 每个功能模块作为独立 app route。
- 内容区域使用 `overflow: auto`，适合重型图表和表格。

本项目应保留现有 Next.js App Router，但把 `frontend/src/components/layout` 升级为更接近工作台：

- 导航分组：数据与知识、流程与碳、优化与仿真、资产与运维。
- 顶部栏增加当前数据集、当前运行任务、后端状态、快捷运行按钮。
- 页面主体支持“全屏图谱/表格/详情抽屉”。

### 能耗知识库

参考 `chat-process/client/app/apps/energykb` 和 `components/EnergyKB`：

- 列表页：分类侧栏、搜索、刷新、上传、卡片网格。
- 详情页：返回、编辑、删除、文档结构树、文档内容、参数提取表。
- 数据文件详情：列名概览、数据预览、CSV/JSON/XES 导出。
- XES 详情：事件表、时间线、时间范围裁剪、裁剪后创建新文档。
- 因子库：统计卡、搜索、表格、多选、添加、编辑、删除、导出。
- 根因库：原因到结果的关系表、置信度、证据、来源文档、详情弹窗。

本项目应将它迁移为“数据与知识中心”，不要只展示数据集数量。

### 能耗多尺度

参考 `chat-process/client/app/apps/energymultiscale`：

- Step 1 量化模型构建。
- Step 2 多尺度模型生成与分析。
- 文件选择、列映射、因子库选择、映射预览、量化结果预览。
- 保存本地、同步知识库、进入下一步。
- 双图工作区：左侧 GCE_DFG 能耗跟随图，右侧 LCE_KG 能耗知识图谱。
- 选中左侧活动后，右侧展示订单、碳类别、资源四层追溯。
- 支持筛选、时间滑块、历史抽屉、分析弹窗、全屏、图片和 JSON 导出。

本项目应把 `/carbon`、`/process`、`/graph` 之间的孤立页面升级为联动工作流。

### 柔性调度

参考 `chat-process/client/app/apps/scheduling`：

- Step 1 数据加载。
- Step 2 策略配置。
- Step 3 AI 方案生成。
- Step 4 方案对比。
- Step 5 仿真执行。
- 甘特图、资源面板、订单面板、配置面板、方案卡片、导出弹窗、仿真控制器、数字孪生场景。

本项目 `/simulation` 与 `/optimization` 后续应合并成“优化仿真向导”，让用户从建议进入仿真场景，再比较方案并导出报告。

### 三维资产

参考 `chat-process/client/app/apps/asset3d`：

- 分类侧栏。
- 搜索、刷新、上传资产。
- 资产卡片网格。
- 上传/编辑/删除模态框。
- 详情页可预览 GLB/GLTF，展示层级结构、聚焦、高亮、隔离。

本项目可以将设备、产线、车间和工厂对象发展成“资产中心”。短期先做对象台账和关联碳排，后期再接 3D。

## 信息架构

建议将新前端从“九个静态中心页”升级为以下工作台结构：

```text
/
  dashboard                 总览驾驶舱
  datasets                  数据与文件知识库
    [id]                    数据集/文档详情
    factors                 碳因子库
    root-causes             根因库
  quantification            量化建模向导
  process-map               流程地图工作区
  graph-workbench           图谱追溯工作区
  recommendations           优化建议与审核
  simulation                方案仿真与调度
  reports                   报告中心
  assets                    资产中心
  ops                       运维与配置
```

保留当前 `/data`、`/process`、`/carbon`、`/graph` 等路由作为过渡路径，逐步重定向或替换到新工作区。

## 页面蓝图

### Dashboard

目标：成为生产入口，而不是展示墙。

布局：

- 顶部全局状态条：当前数据集、当前运行、后端健康、最近报告、快捷运行。
- 四个核心 KPI：总碳排、流程健康、优化节省、数据质量。
- 三个队列：待处理数据、待审核建议、最近异常。
- 一张趋势图：最近运行碳排与节省趋势。
- 一张工作流状态图：数据接入到报告输出的闭环进度。

交互：

- 点击 KPI 跳到对应模块。
- 点击最近运行恢复上下文。
- 点击待审核建议进入建议详情抽屉。

### 数据与文件知识库

借鉴 EnergyKB。

列表页：

- 左侧分类：全部、事件日志、量化结果、报告、因子来源、设备资料。
- 顶部工具栏：搜索、类型过滤、刷新、上传文件。
- 内容区：卡片网格或表格视图切换。
- 卡片动作：详情、设为当前数据源、编辑元数据、删除。

详情页：

- 文档/数据基础信息头。
- 左侧结构树或列名列表。
- 右侧内容预览。
- 底部抽取区：字段映射、参数抽取、因子候选、根因候选。
- 数据文件支持分页、导出、转换为标准事件日志。

必须接入的后端能力：

- `GET /api/datasets`
- `GET /api/datasets/{id}`
- `GET /api/datasets/{id}/preview`
- `GET/POST /api/mapping-templates`
- `POST /api/upload-csv`

需要补齐的前端对象：

- `DatasetCard`
- `DatasetCategorySidebar`
- `DatasetUploadModal`
- `DatasetDetailShell`
- `DatasetPreviewTable`
- `MappingTemplateEditor`

### 量化建模向导

借鉴 EnergyMultiScale StepQuantification。

步骤一：数据选择。

- 从数据知识库选择事件日志。
- 支持上传新 CSV。
- 展示字段、样本、数据质量。

步骤二：列映射。

- 自动建议标准字段映射。
- 映射表支持手动改。
- 必填字段检查：case_id、activity、timestamp。
- 冲突检查：一个标准字段只能被一个原始字段映射。
- 映射预览对比。

步骤三：因子库选择。

- 选择碳因子版本。
- 展示电力、物料、设备、工序因子。
- 支持临时覆盖因子。

步骤四：执行量化。

- 调用 pipeline。
- 显示进度、错误、结果摘要。
- 结果保存到运行历史。
- 可同步到知识库。

关键状态：

```text
currentStep
selectedDataset
columnMapping
mappingConfirmed
factorVersion
factorOverrides
runResult
saveOptions
```

### 流程地图工作区

借鉴 ProcessMap 和 EnergyMultiScale 的 GCE_DFG。

布局：

- 顶部工具栏：数据集、运行记录、活动阈值、路径阈值、指标切换。
- 左侧过滤器：时间范围、产线、资源、订单。
- 中央流程图：节点代表活动，边代表流转。
- 右侧详情抽屉：选中活动的时长、碳排、资源负载、返工、建议。
- 底部面板：变体列表、瓶颈列表、合规偏差。

交互：

- 节点点击联动图谱追溯。
- 右键菜单：查看详情、高亮上下游、生成建议、导出子图。
- 双击画布重置。
- 支持 PNG/JSON 导出。

后端：

- `GET /api/process/summary`
- `GET /api/process/compare`
- 后续新增 `GET /api/process/map`、`GET /api/process/activity/{name}`

### 图谱追溯工作区

借鉴 LCE_KG。

布局：

- 左侧查询和过滤。
- 中央图谱画布。
- 右侧节点详情抽屉。
- 底部路径/证据/建议面板。

图谱层级：

- L1 Process/Activity。
- L2 Case/Order/Product。
- L3 CarbonMetric/Bottleneck/Risk。
- L4 Resource/Device/Material/Person。

交互：

- 从流程地图选中活动后自动聚焦。
- 支持矩形与圆形模式切换。
- 支持时间滑块过滤。
- 支持资源列配置。
- 支持邻居展开、聚焦、隐藏、导出。
- 点击 L4 设备打开设备详情。

后端：

- `GET /api/graph/export`
- `GET /api/graph/query`
- `GET /api/graph/subgraph`
- `GET /api/graph/neo4j-plan`

### 碳因子库与根因库

借鉴 FactorLibrary 和 RootCauseLibrary。

碳因子库：

- 顶部统计：因子总数、来源数、单位类型数、启用版本数。
- 表格：名称、值、单位、类型、Scope、来源、版本、状态、创建时间。
- 操作：新增、编辑、启用/停用、批量删除、导出。
- 行详情：来源证据、适用范围、版本历史。

根因库：

- 表格：原因、结果、置信度、证据、来源数据集、关联建议。
- 操作：新增、详情、删除、导出。
- 可从优化建议和图谱路径反向沉淀根因。

### 优化建议与审核

借鉴调度方案卡片和根因库详情弹窗。

布局：

- 顶部状态筛选：待审核、已采纳、已拒绝、已实施。
- 左侧建议列表或卡片网格。
- 右侧详情：证据、影响、风险、验证方式、关联图谱路径。
- 底部动作栏：采纳、拒绝、转仿真、生成报告。

交互：

- 点击卡片打开详情模态框。
- 卡片展示综合评分、减排量、风险等级、实施难度。
- 采纳后写入审计记录。

后端：

- `GET /api/optimization/recommendations`
- `GET/POST /api/optimization/providers`
- 后续新增建议审核 PATCH 接口。

### 方案仿真与调度

借鉴 Scheduling 五步。

步骤：

1. 选择基线运行和建议。
2. 配置场景参数：资源、返工率、产能、因子、成本。
3. 生成候选方案。
4. 方案对比：减排、产能、成本、风险。
5. 仿真与导出：甘特图、时间线、报告、JSON。

页面组件：

- `ScenarioStepNavigator`
- `BaselineSelector`
- `ScenarioConfigPanel`
- `ScenarioGenerator`
- `ScenarioComparison`
- `ScenarioGantt`
- `SimulationController`
- `ExportModal`

### 报告中心

借鉴 EnergyKB 的列表和详情模式。

列表：

- 报告类型、关联运行、生成时间、状态、导出动作。
- 支持搜索、刷新、新建报告。

详情：

- 左侧目录。
- 右侧 HTML 预览。
- 底部审计信息：数据来源、映射规则、因子版本、算法版本。
- 导出 HTML/PDF/JSON。

### 资产中心

借鉴 Asset3D。

短期：

- 工厂、车间、产线、设备四类资产。
- 分类侧栏、搜索、卡片网格。
- 资产详情：关联活动、碳排、故障/维护、图谱节点。

中期：

- 支持 GLB/GLTF 上传。
- 模型预览。
- 设备节点聚焦和隔离。
- 与图谱 L4 设备节点互跳。

## 前端工程结构

建议将当前 `src/app/*/page.tsx` 单文件页面拆为功能目录：

```text
frontend/src
  app
    datasets
    quantification
    process-map
    graph-workbench
    recommendations
    simulation
    reports
    assets
    ops
  components
    layout
    ui
    datasets
    quantification
    process-map
    graph
    recommendations
    simulation
    reports
    assets
  lib
    api
      client.ts
      datasets.ts
      carbon.ts
      process.ts
      graph.ts
      optimization.ts
      simulation.ts
      reports.ts
      ops.ts
    stores
    formatters
  types
```

注意：仓库要求单目录最多 8 个文件，因此每个业务域内部继续拆 `_components`、`_hooks`、`_lib` 或子目录。

## 状态管理

借鉴 `chat-process` 的 Zustand store，但按本项目做轻量化：

- `useWorkspaceStore`：当前数据集、当前运行、全局筛选。
- `useDatasetStore`：数据集列表、分类、搜索、上传状态。
- `useQuantificationStore`：向导步骤、字段映射、因子选择、运行结果。
- `useGraphWorkbenchStore`：选中节点、过滤条件、图谱模式、时间范围。
- `useSimulationStore`：场景参数、候选方案、选中方案、仿真状态。

不要把所有状态塞进一个 store。每个 store 对应一个工作区，跨模块共享只放 ID 和筛选条件。

## API Client

当前 `apiGet` 可保留为底层能力，但应加领域 client：

```text
datasetsClient.list()
datasetsClient.detail(id)
datasetsClient.preview(id, page, pageSize)
quantificationClient.run(payload)
carbonClient.listFactors()
graphClient.query(filters)
optimizationClient.review(id, action)
simulationClient.createScenario(payload)
reportsClient.generate(payload)
```

收益：

- 页面不直接拼 URL。
- 类型定义集中。
- 便于后续接入 loading/error/toast。

## 视觉与排版原则

可以借鉴 `chat-process` 的 Ant Design 排版，但本项目继续使用 Tailwind CSS 4，不引入 Ant Design，避免同时维护两套 UI 系统。

可复用的排版模式：

- 左分类栏 + 右内容区。
- 顶部工具栏固定，内容区滚动。
- 卡片网格用于资产、文档、建议。
- 表格用于因子、根因、报告、历史。
- 抽屉用于详情。
- 模态框用于上传、编辑、导出确认。
- 步骤条用于向导。
- 全屏图谱用于流程图、知识图谱、甘特图。

控件习惯：

- 上传使用按钮加拖拽区域。
- 开关使用 toggle。
- 指标选择用 radio/segmented control。
- 阈值使用 slider。
- 类型筛选使用 select。
- 批量操作使用表格多选。
- 图谱工具使用 icon button 和 tooltip。

## 实施阶段

### P17 工作台骨架升级

- 重构导航分组。
- 顶部栏加入当前数据集、当前运行、健康状态。
- 新增通用 Toolbar、SearchBox、EmptyState、DataTable、DrawerShell、StepShell。
- 保证所有页面有真实空状态和加载态。

### P18 数据与知识库

- 将 `/data` 升级为知识库式数据中心。
- 增加分类侧栏、搜索、上传 modal、卡片网格、详情页。
- 增加数据预览分页与字段映射模板编辑器。

### P19 量化建模向导

- 新增 `/quantification`。
- 实现数据选择、列映射、因子库选择、执行量化、结果预览。
- 复用现有 `/api/upload-csv` 和 `/api/run-pipeline`。

### P20 流程地图与图谱联动

- 新增流程图工作区。
- 增强 Cytoscape/G6 风格图谱交互。
- 实现活动选择后联动图谱追溯。
- 增加图谱详情抽屉、导出、过滤。

### P21 因子库与根因库

- 将 `/carbon` 从摘要页升级为因子库管理页。
- 增加根因库页面。
- 支持新增、编辑、删除、批量导出。

### P22 优化审核与仿真向导

- 将 `/optimization` 升级为建议审核台。
- 将 `/simulation` 升级为五步方案向导。
- 支持建议转场景、方案对比、导出报告。

### P23 报告与资产中心

- 报告中心增加列表、详情、预览、导出。
- 资产中心先做设备/产线台账，再预留 3D 模型接口。

### P24 前端质量闭环

- 增加 Vitest 或 Playwright 冒烟测试。
- 覆盖数据上传、量化向导、图谱页面、报告导出。
- 建立 screenshot 检查，防止页面退化成静态贴图。

## 验收标准

每个模块完成时必须满足：

- 有对象列表。
- 有新建或上传入口。
- 有详情页、抽屉或模态框。
- 有加载态、空状态、错误态。
- 有至少一个真实后端 API 写操作或状态变更。
- 有历史或审计入口。
- 有导出或报告能力。
- 通过 `pnpm run lint` 和 `pnpm run build`。

## 不做的事

短期不要直接搬入 `chat-process` 的 Ant Design、G6、Three.js 全套依赖。先复刻工作流和信息架构，图表库按需引入。

短期不要把所有功能都做成静态 mock。没有后端能力的地方可以使用禁用态、空状态或“待接入”提示，但页面结构必须为真实工作流预留入口。

短期不要重写 legacy `web/`。它继续作为对照和兼容工作台。
