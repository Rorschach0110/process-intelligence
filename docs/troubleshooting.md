# 故障排查指南

## 端口被占用

现象：服务启动失败或请求命中旧接口。

排查：

```powershell
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'backend/server.py|backend\\server.py' }
```

停止旧进程后重启：

```powershell
Stop-Process -Id <PID> -Force
python backend/server.py
```

## 上传后无法运行

检查：

- CSV 是否已保存到 `data\uploads`。
- 前端字段映射是否包含 `case_id`、`activity`、`timestamp`。
- 数值列是否包含非数字文本。
- 时间列是否符合支持格式。

## 图谱为空

先确认 pipeline 是否有事件：

```powershell
Invoke-WebRequest http://127.0.0.1:8765/api/run-pipeline
```

如果浏览器中 Cytoscape.js CDN 不可用，页面会显示简化节点列表，不应完全空白。

## 历史记录为空

只有 `POST /api/run-pipeline` 会写入 `data\runs`。旧的 `GET /api/run-pipeline` 只用于快速示例，不写历史。

## LLM 没有生效

默认规则优化器是兜底方案。确认：

- `OPENAI_API_KEY` 已配置。
- `OPENAI_BASE_URL` 是 OpenAI 兼容接口。
- provider 返回的是结构化 JSON。

如果 LLM 响应校验失败，系统会自动回退到规则优化器。

## 诊断包信息

FastAPI 入口提供：

```text
GET /api/ops/diagnostics
GET /api/ops/backup-manifest
```

如果系统异常，先检查数据库、上传目录、运行目录和报告目录是否都为 `true`。

## 备份恢复

先运行：

```powershell
powershell -ExecutionPolicy Bypass -File scripts\backup.ps1
```

恢复时把备份目录中的 `process_intelligence.sqlite3`、`uploads`、`runs` 和 `reports` 放回 `data` 目录。
