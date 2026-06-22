# 前端应用

这里是简历优化智能体的 Next.js 前端，提供中文化的上传、分析、知识库、改写对比、导出、设置和记录管理界面。

## 页面

- `/`：首页
- `/dashboard`：工作台和历史记录
- `/upload`：简历上传、岗位录入和分析创建
- `/resumes/[resumeId]`：简历详情
- `/jobs/[jobId]`：岗位详情
- `/analyses/[analysisId]`：匹配分析报告
- `/rewrites/[rewriteId]`：改写草稿、差异对比、事实校验和导出
- `/knowledge`：RAG 知识库管理
- `/settings`：运行配置和组件状态

## 本地启动

```powershell
.\scripts\start-frontend.ps1 -Install
```

如需指定后端地址：

```powershell
.\scripts\start-frontend.ps1 -ApiBaseUrl "http://localhost:8080/api/v1"
```

## 类型检查

```powershell
cd frontend
npm run typecheck
```
