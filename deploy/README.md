# 部署与基础设施

该目录保存本地开发和远程部署相关的辅助文件。

## 本地基础设施

推荐本地启动以下组件：

- PostgreSQL + PGvector
- Redis 或 Redis Stack/ReBloom
- MinIO
- Ollama，可选，用于本地模型调用

`docker-compose.yml` 可作为本地基础设施参考。如果使用远程 PostgreSQL、Redis 或 MinIO，不要在同一端口重复启动本地服务，除非你明确想覆盖连接目标。

## 远程环境

后端可以连接通过隧道暴露的远程 PGvector、Redis 和 MinIO。公开仓库只保留占位符，不包含真实主机、端口或密钥。

| 服务 | 容器默认端口 | 配置占位符 |
|---|---:|---|
| PostgreSQL/PGvector | 5432 | `<remote-host>:<postgres-port>` |
| Redis/ReBloom | 6379 | `<remote-host>:<redis-port>` |
| MinIO API | 9000 | `<remote-host>:<minio-api-port>` |
| MinIO Console | 9090 | `<remote-host>:<minio-console-port>` |

可以复制 [env.remote.example](env.remote.example) 作为远程环境变量模板。

## 必填密钥

以下配置必须使用真实值，但只能写入本地 `.env` 或 `application-private.yml`：

- `POSTGRES_PASSWORD`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `REDIS_PASSWORD`，如果 Redis 开启密码
- `OPENAI_API_KEY` 或兼容模型服务的 API Key

## Flyway baseline

如果远程数据库不是空库，且 `public` schema 已经存在对象，可以启用 Flyway baseline：

```env
FLYWAY_BASELINE_ON_MIGRATE=true
FLYWAY_BASELINE_VERSION=0
```

这样 Flyway 会从版本 `0` 开始接管迁移，仍然会执行项目内的正式迁移脚本。

## PowerShell 示例

```powershell
$env:POSTGRES_URL="jdbc:postgresql://<remote-host>:<postgres-port>/resume_ai"
$env:POSTGRES_USER="postgres"
$env:POSTGRES_PASSWORD="<server-password>"
$env:REDIS_HOST="<remote-host>"
$env:REDIS_PORT="<redis-port>"
$env:REDIS_PASSWORD="<redis-password>"
$env:MINIO_ENDPOINT="http://<remote-host>:<minio-api-port>"
$env:MINIO_ACCESS_KEY="<minio-access-key>"
$env:MINIO_SECRET_KEY="<minio-secret-key>"
$env:MINIO_BUCKET="resume-ai"
mvn -f ..\backend\pom.xml spring-boot:run
```

也可以从根目录 `.env` 读取配置：

```powershell
Get-Content ..\.env | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
  $parts = $_.Split('=', 2)
  [Environment]::SetEnvironmentVariable($parts[0], $parts[1], 'Process')
}
$env:SPRING_DOCKER_COMPOSE_ENABLED='false'
mvn -f ..\backend\pom.xml spring-boot:run
```

## 文件说明

```text
deploy/
  docker-compose.yml      本地基础设施编排
  env.remote.example      远程环境变量模板
  postgres/
    README.md             PostgreSQL/PGvector 说明
```
