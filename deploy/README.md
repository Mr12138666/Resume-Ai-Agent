# Deploy

This directory contains local development and deployment assets.

## Local Infrastructure

The intended local stack is:

- PostgreSQL with PGvector
- Redis or Redis Stack/ReBloom
- MinIO
- Ollama

## Remote Infrastructure

You can point the backend at a remote PGvector, Redis, and MinIO environment exposed through a tunnel:

| Service | Local Container Port | Tunnel Endpoint |
|---|---:|---|
| PGvector/PostgreSQL | 5432 | `<remote-host>:<postgres-port>` |
| Redis/ReBloom | 6379 | `<remote-host>:<redis-port>` |
| MinIO API | 9000 | `<remote-host>:<minio-api-port>` |
| MinIO Console | 9090 | `<remote-host>:<minio-console-port>` |

Use [env.remote.example](env.remote.example) as the backend environment template.

Required secrets are intentionally placeholders:

- `POSTGRES_PASSWORD`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`

The remote `robot` database may already contain objects in `public`. For that case, enable Flyway baselining without skipping the first migration:

```env
FLYWAY_BASELINE_ON_MIGRATE=true
FLYWAY_BASELINE_VERSION=0
```

PowerShell example:

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

For the current server, the database name is `robot`, so use:

```powershell
$env:POSTGRES_URL="jdbc:postgresql://<remote-host>:<postgres-port>/robot"
```

## Verified Remote Startup Checklist

Verified on 2026-06-22:

- PostgreSQL/PGvector endpoint configured
- Database `robot`
- Flyway baseline at version `0`
- Flyway migration `V1__init_core_schema.sql`
- JPA schema validation
- Spring AI PGVectorStore initialization
- MinIO endpoint configuration
- Redis/ReBloom endpoint configured

Run from PowerShell:

```powershell
Get-Content ..\.env | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
  $parts = $_.Split('=', 2)
  [Environment]::SetEnvironmentVariable($parts[0], $parts[1], 'Process')
}
$env:SPRING_DOCKER_COMPOSE_ENABLED='false'
mvn -f ..\backend\pom.xml spring-boot:run
```

## Files

```text
deploy/
  docker-compose.yml
  env.remote.example
  postgres/
    README.md
  minio/
    README.md
```

## Notes

`docker-compose.yml` remains useful for local-only development. When using the remote services, do not start local PostgreSQL or MinIO on the same ports unless you intentionally want to override them.
