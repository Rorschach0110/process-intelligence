# API 参考

基础地址：

```text
http://127.0.0.1:8765
```

## GET `/api/health`

返回服务状态。

## GET `/api/sample-log`

返回示例 CSV 的事件列表。

兼容说明：该接口当前仍由标准库入口提供；P7 FastAPI 入口优先覆盖上传、运行、数据集、历史和图谱接口。

## POST `/api/upload-csv`

`multipart/form-data` 上传字段名为 `file` 的 CSV。文件会保存到 `data\uploads`。

响应包含：

- `file`：保存后的相对路径。
- `dataset_id`：SQLite 中登记的数据集 ID。
- `fields`：CSV 字段列表。
- `preview`：前 20 行预览。

## POST `/api/run-pipeline`

按指定文件、字段映射和碳排因子运行闭环分析，并保存 JSON 结果。

请求示例：

```json
{
  "file": "data/uploads/event_log.csv",
  "mapping": {
    "case_id": "case_id",
    "activity": "activity",
    "timestamp": "timestamp",
    "resource": "resource",
    "energy_kwh": "energy_kwh",
    "material_kg": "material_kg",
    "device": "device"
  },
  "factors": {
    "electricity_kg_per_kwh": 0.581,
    "material_kg_per_kg": 1.82
  }
}
```

响应顶层字段：

```text
source, process, carbon, knowledge_graph, optimization, history
```

## GET `/api/runs`

返回最近 20 次运行摘要。

## GET `/api/datasets`

返回 SQLite 中登记的数据集摘要，包含名称、相对路径、字段数量、预览行数量和创建时间。

## GET `/api/datasets/{id}`

返回数据集详情、字段映射和数据质量报告。

## GET `/api/datasets/{id}/preview`

分页预览数据集。参数：`page`、`page_size`。

## GET/POST `/api/mapping-templates`

读取或保存字段映射模板。

## GET/POST `/api/carbon/factors`

读取或新增碳因子库条目。

## GET `/api/carbon/summary`

返回示例 pipeline 的碳排摘要和多维聚合。

## GET `/api/process/summary`

返回流程中心摘要，包括 timing、变体详情、返工路径、合规偏差和健康评分。

## GET `/api/process/compare`

返回流程对比结果。当前最小实现使用示例数据自对比。

## GET `/api/graph/export`

导出当前示例数据的图谱。

- 默认返回 JSON。
- `?format=cypher` 返回 Neo4j Cypher 语句文本。

## GET `/api/graph/query`

按节点类型和关键词查询图谱。

参数：

- `kind`：可选，`activity`、`resource`、`metric`、`process`。
- `q`：可选，节点文本关键词。
- `relation`：可选，关系类型。
- `min_carbon`：可选，最低碳排。

## GET `/api/graph/subgraph`

按 `node_id` 返回邻居子图。

## GET `/api/graph/neo4j-plan`

返回 Neo4j 可选适配器导入计划和 Cypher。

## GET/POST `/api/optimization/providers`

读取或保存 LLM provider 配置。

## GET `/api/optimization/recommendations`

返回已持久化的优化建议。

## GET/POST `/api/simulation/scenarios`

读取或创建 What-if 仿真场景。

## GET/POST `/api/reports`

读取报告历史或生成 HTML 报告。

## GET `/api/ops/diagnostics`

返回健康检查、目录状态和数据库统计。

## GET `/api/ops/backup-manifest`

返回备份清单。

## POST `/api/ops/settings/{key}`

保存配置中心键值，并写入审计日志。
