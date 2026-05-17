# 用户数据格式指南

上传文件必须是 CSV，建议使用 UTF-8 或 UTF-8 BOM 编码。

## 标准字段

| 标准字段 | 含义 | 必填 |
| --- | --- | --- |
| `case_id` | 订单、工单或流程实例编号 | 是 |
| `activity` | 活动、工序或步骤名称 | 是 |
| `timestamp` | 事件发生时间 | 是 |
| `resource` | 设备、产线、人员或工位 | 否 |
| `energy_kwh` | 事件能耗，单位 kWh | 否 |
| `material_kg` | 事件物料消耗，单位 kg | 否 |
| `device` | 设备展示名 | 否 |

CSV 字段名可以不同，但运行前必须在前端映射到上述标准字段。

## 时间格式

支持：

```text
2026-01-05 08:10:00
2026/01/05 08:10:00
2026-01-05
2026/01/05
ISO 8601
```

## 校验规则

- `case_id`、`activity`、`timestamp` 不能为空。
- `energy_kwh` 和 `material_kg` 如有值，必须能解析为数字。
- 时间字段必须能被支持格式解析。
- 校验错误会在运行 pipeline 前返回，不会写入运行历史。

## 示例

```csv
case_id,activity,timestamp,resource,energy_kwh,material_kg,device
ORD-001,Cutting,2026-01-05 08:10:00,CNC-01,12.4,4.1,Cutter A
ORD-001,Assembly,2026-01-05 09:20:00,LINE-02,18.7,6.5,Assembly Line 2
```
