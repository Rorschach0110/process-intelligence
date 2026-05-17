# 知识图谱 Schema

图谱是纯 JSON，可导出为 Cypher。Neo4j 当前是可选适配方向，不是运行时强依赖。

## 节点

统一结构：

```json
{
  "id": "activity:Assembly",
  "label": "Assembly",
  "kind": "activity",
  "properties": {}
}
```

节点类型：

- `process`：流程总览节点。
- `activity`：活动或工序节点。
- `resource`：资源、设备、产线或人员节点。
- `metric`：碳排等指标节点。

## 关系

统一结构：

```json
{
  "source": "activity:Assembly",
  "target": "carbon:total",
  "relation": "CONTRIBUTES_TO",
  "properties": {}
}
```

关系类型：

- `HAS_ACTIVITY`：流程包含活动。
- `NEXT`：直接跟随关系。
- `USES_RESOURCE`：活动使用资源。
- `CONTRIBUTES_TO`：活动贡献到碳排指标。

## Cypher 映射

节点 `kind` 映射为 Neo4j label，关系 `relation` 映射为 relationship type。

示例：

```cypher
MERGE (:activity {id: "activity:Assembly", label: "Assembly"});
MATCH (a {id: "activity:Assembly"}), (b {id: "carbon:total"})
MERGE (a)-[:CONTRIBUTES_TO {carbonKg: 108.63}]->(b);
```
