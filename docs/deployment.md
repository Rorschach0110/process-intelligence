# 部署指南

当前推荐使用 P7 FastAPI 入口部署。标准库 `backend/server.py` 仍保留为兼容入口，但后续成熟化工作会围绕 FastAPI 继续推进。

## 本地启动

```powershell
cd D:\Desktop\new\process-intelligence
uv sync
cd backend
uv run uvicorn app.main:app --host 127.0.0.1 --port 8765
```

访问：

```text
http://127.0.0.1:8765
```

## 目录准备

服务会自动使用这些目录：

```text
data\uploads   # 上传 CSV
data\runs      # pipeline 运行结果
data\config    # 可配置碳排因子
data\process_intelligence.sqlite3 # 数据集和运行摘要
```

## 内网访问

默认监听 `127.0.0.1`。如需内网访问，可将 uvicorn 的 `--host` 改为 `0.0.0.0`，并确认端口 `8765` 没有被防火墙阻止。

## OpenAI 兼容 provider

默认不调用 LLM。如需启用，可通过环境变量配置：

```powershell
$env:OPENAI_API_KEY = "..."
$env:OPENAI_BASE_URL = "https://api.openai.com/v1"
$env:OPENAI_MODEL = "gpt-4.1-mini"
```

当前 pipeline 默认仍使用规则兜底；接入真实 provider 前应先增加端到端验收。

## 生产化建议

- 完成剩余标准库 API 到 FastAPI 的迁移。
- 将 SQLite 表扩展为正式任务、数据集和报告模型。
- 将前端迁移到 Next.js + React + TypeScript + Tailwind CSS。
- 将 Neo4j 作为可选图谱适配器接入，而不是核心强依赖。

## Docker

项目已提供最小 `Dockerfile`：

```powershell
docker build -t process-intelligence .
docker run -p 8765:8765 process-intelligence
```

## 备份与冒烟测试

```powershell
powershell -ExecutionPolicy Bypass -File scripts\backup.ps1
powershell -ExecutionPolicy Bypass -File scripts\smoke.ps1
```

备份脚本会复制 SQLite、uploads、runs 和 reports。冒烟测试会检查服务健康、数据集接口和运行历史接口。
