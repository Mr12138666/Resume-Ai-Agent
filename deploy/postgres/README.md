# PostgreSQL 与 PGvector

本地数据库建议使用 `pgvector/pgvector` 镜像，保证 PostgreSQL 和向量扩展版本一致。

Flyway 迁移脚本位于：

```text
backend/src/main/resources/db/migration
```

首个迁移会启用 `vector` 扩展，并创建简历、岗位、分析报告、改写草稿、知识文档和向量分块等核心表。正常连接空库时不需要手动执行这些 SQL，后端启动时会自动迁移。
