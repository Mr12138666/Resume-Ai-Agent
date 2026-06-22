# 后端服务

这里是简历优化智能体的 Spring Boot 后端，负责文档上传解析、岗位结构化、匹配分析、RAG 检索、改写草稿、事实校验、导出和记录删除。

## 主要模块

- `interfaces`：REST Controller、异常处理、跨域配置。
- `application`：简历、岗位、分析、知识库、改写和设置等用例编排。
- `domain`：核心业务实体和状态枚举。
- `infrastructure`：JPA、PGvector、MinIO、Redis、文档解析和大模型适配。
- `agent`：Spring AI 工具调用相关能力。

## 本地启动

先准备 `.env` 或 `backend/src/main/resources/application-private.yml`，再运行：

```powershell
.\scripts\start-backend.ps1
```

后端默认监听 `http://localhost:8080`，接口前缀为 `/api/v1`。

## 数据库初始化

Flyway 会在启动时自动执行 `src/main/resources/db/migration` 下的迁移脚本。首次连接空库时不需要手动执行 SQL；连接已有对象的数据库时，可设置：

```env
FLYWAY_BASELINE_ON_MIGRATE=true
FLYWAY_BASELINE_VERSION=0
```

## 测试

```powershell
mvn -f backend\pom.xml test
```
