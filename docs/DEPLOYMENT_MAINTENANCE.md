# SyncUp 部署与维护指南

## 本地运行
- 安装依赖：`npm install`
- 生成 Prisma Client：`npm run prisma:generate`
- 启动开发：`npm run dev`

## 环境变量
- `DATABASE_URL`：PostgreSQL 连接
- `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`：可选
- `AUTH_JWT_SECRET`：本地认证签名密钥

## 发布流程
- 执行校验：`npm run test && npm run lint && npm run typecheck && npm run build`
- 合并主分支后触发部署
- 若更新数据库结构，先执行迁移再部署应用

## 浏览器兼容建议
- Chrome、Edge、Safari、Firefox 各验证登录、匹配、房间、主页
- 检查输入焦点、按钮 hover、图片回退、移动端布局

## 性能维护
- 保持资源清单最小化，避免首屏大图
- 监控图片请求失败率，定期替换低质量资源
- 对长列表页引入分页或虚拟列表

## 运营维护
- 每次素材更新同步更新 `catalog.json` 版本
- 保留素材授权记录和来源链接
- 对登录失败日志设告警阈值，防止异常暴力请求
