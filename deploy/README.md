# Deploy

This directory contains local development and deployment assets.

## Local Infrastructure

The intended local stack is:

- PostgreSQL with PGvector
- Redis or Redis Stack/ReBloom
- MinIO
- Ollama

## Remote Infrastructure

The user has a remote PGvector and MinIO environment exposed through FRP:

| Service | Local Container Port | Tunnel Endpoint |
|---|---:|---|
| PGvector/PostgreSQL | 5432 | `120.53.242.78:15432` |
| Redis/ReBloom | 6379 | `120.53.242.78:16379` |
| MinIO API | 9000 | `120.53.242.78:19000` |
| MinIO Console | 9090 | `120.53.242.78:19090` |

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
$env:POSTGRES_URL="jdbc:postgresql://120.53.242.78:15432/resume_ai"
$env:POSTGRES_USER="postgres"
$env:POSTGRES_PASSWORD="<server-password>"
$env:REDIS_HOST="120.53.242.78"
$env:REDIS_PORT="16379"
$env:REDIS_PASSWORD="<redis-password>"
$env:MINIO_ENDPOINT="http://120.53.242.78:19000"
$env:MINIO_ACCESS_KEY="<minio-access-key>"
$env:MINIO_SECRET_KEY="<minio-secret-key>"
$env:MINIO_BUCKET="resume-ai"
mvn -f ..\backend\pom.xml spring-boot:run
```

For the current server, the database name is `robot`, so use:

```powershell
$env:POSTGRES_URL="jdbc:postgresql://120.53.242.78:15432/robot"
```

## Verified Remote Startup

Verified on 2026-06-22:

- PostgreSQL/PGvector endpoint `120.53.242.78:15432`
- Database `robot`
- Flyway baseline at version `0`
- Flyway migration `V1__init_core_schema.sql`
- JPA schema validation
- Spring AI PGVectorStore initialization
- MinIO endpoint configuration
- Redis/ReBloom endpoint `120.53.242.78:16379`

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
