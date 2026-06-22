# 简历优化智能体

一个面向求职者的 AI 简历优化平台。用户上传原始简历并填写目标岗位 JD 后，系统会解析简历与岗位要求，进行关键词、语义和 ATS 维度匹配，结合 RAG 知识库给出修改建议，并可生成忠于原始经历的改写草稿与 Markdown/PDF 导出文件。

## 核心能力

- 简历上传与解析：支持 PDF、DOCX、TXT，原文件写入 MinIO，正文由 Apache Tika 提取并保存到 PostgreSQL。
- 岗位描述管理：创建目标岗位，调用大模型结构化岗位职责、技能要求和加分项。
- 匹配分析报告：输出整体分、关键词分、语义分、ATS 分、缺失关键词、证据映射和优化建议。
- RAG 知识库：维护简历写作规则、岗位指南等知识文档，分块后写入 PGvector，并在分析阶段检索引用。
- 智能体改写：基于 Spring AI Tool Calling 调用简历解析、岗位解析、检索、评分和改写工具，生成可解释的优化段落。
- 事实校验与对比：展示原文和改写后的差异，高亮增删内容，提醒需要人工复核的事实。
- 导出文件：支持将改写结果导出为 Markdown 或 PDF，并通过 MinIO 临时下载链接获取。
- 记录管理：简历、岗位、分析报告、改写草稿和知识文档都支持列表查看和删除。

## 技术栈

- 后端：Java 21、Spring Boot 4.1、Spring AI 2.0、Spring Data JPA、Flyway
- AI：OpenAI 兼容接口、DeepSeek 聊天模型、阿里云 DashScope 向量模型、Ollama 本地模型可选
- 数据：PostgreSQL 17、PGvector、Redis/ReBloom、MinIO
- 文档解析：Apache Tika、PDFBox、docx4j
- 前端：Next.js 16、React 19、TypeScript、Tailwind CSS

## 目录结构

```text
Resume-Ai-Agent/
  backend/   后端 Spring Boot 服务
  frontend/  前端 Next.js 应用
  deploy/    本地基础设施和远程环境模板
  docs/      架构、接口、技术选型和路线图
  samples/   可选的本地体验输入素材
  scripts/   前后端启动脚本
```

`参考/` 目录只用于本地参考，已被 `.gitignore` 忽略，不会进入公开仓库。

## 环境要求

- JDK 21
- Maven 3.9+
- Node.js 20+
- PostgreSQL + PGvector
- MinIO
- Redis 可选，但建议开启，用于运行状态检查和后续异步能力扩展
- 一个可用的大模型 API Key，以及一个 1024 维向量模型

## 配置方式

项目默认通过 Spring Boot `application.yml` 读取配置，并会额外导入根目录 `.env` 与 `backend/src/main/resources/application-private.yml`。真实密钥不要提交到 Git。

推荐本地配置方式：

```powershell
Copy-Item .env.example .env
Copy-Item backend\src\main\resources\application-private.example.yml backend\src\main\resources\application-private.yml
```

然后按自己的数据库、MinIO、Redis 和模型服务填写 `.env` 或 `application-private.yml`。公开仓库中的示例文件只保留占位符。

常用关键配置：

```env
POSTGRES_URL=jdbc:postgresql://localhost:5432/resume_ai
POSTGRES_USER=resume_ai
POSTGRES_PASSWORD=resume_ai

MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=resume-ai

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

SPRING_AI_CHAT_MODEL=openai
SPRING_AI_EMBEDDING_MODEL=openai
OPENAI_API_KEY=replace-with-your-api-key
OPENAI_BASE_URL=https://api.deepseek.com
OPENAI_CHAT_MODEL=deepseek-v4-flash
OPENAI_EMBEDDING_MODEL=text-embedding-v4
RAG_EMBEDDING_DIMENSIONS=1024
```

如果使用远程数据库且库里已有对象，可以开启 Flyway baseline：

```env
FLYWAY_BASELINE_ON_MIGRATE=true
FLYWAY_BASELINE_VERSION=0
```

数据库表和 PGvector 扩展由 Flyway 自动初始化，正常情况下不需要手工运行 `V1__init_core_schema.sql`。

## 启动项目

后端：

```powershell
.\scripts\start-backend.ps1
```

前端：

```powershell
.\scripts\start-frontend.ps1 -Install
```

浏览器打开：

```text
http://localhost:3000
```

后端默认地址：

```text
http://localhost:8080/api/v1
```

## 使用流程

1. 打开“简历定制”，上传原始简历。
2. 粘贴目标岗位 JD，创建岗位记录。
3. 点击生成匹配分析，查看分数、关键词覆盖、证据映射和建议。
4. 如需 RAG 增强，先到“知识库”新增或编辑规则文档，并点击索引。
5. 在分析报告页创建改写草稿。
6. 在改写页查看左右对比、事实校验和改写理由。
7. 导出 Markdown 或 PDF。

`samples/` 目录提供了一份简历文本、岗位 JD 和知识库规则，可用于本地快速体验完整流程。

## 知识库索引说明

- 文档保存后不会自动进入向量库，需要点击“索引”。
- 重新索引同一文档会先清理旧分块，再写入新的分块和向量，因此适合修改内容后的更新。
- 删除知识文档时，会同时清理业务记录和对应向量分块。
- 如果向量模型不可用，检索会退化为文本搜索；控制台会出现相应 warning。

## 常用命令

后端测试：

```powershell
mvn -f backend\pom.xml test
```

前端类型检查：

```powershell
cd frontend
npm run typecheck
```

敏感信息自查：

```powershell
git grep -n -I -E "<your-secret-pattern>|<your-server-address>" -- .
```

## 公开仓库注意事项

- 不要提交 `.env`、`application-private.yml`、MinIO/Redis/PostgreSQL 密码或模型 API Key。
- 不要提交 `frontend/node_modules/`、`backend/target/`、`.next/` 等构建产物。
- `参考/` 目录已忽略，只保留本项目源码、文档、脚本和必要示例素材。

## 更多文档

- [架构说明](docs/architecture.md)
- [技术选型](docs/tech-stack.md)
- [接口设计](docs/api-design.md)
- [路线图](docs/roadmap.md)
