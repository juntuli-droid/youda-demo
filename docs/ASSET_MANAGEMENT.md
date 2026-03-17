# SyncUp 图片资源管理方案

## 目标
- 支持人格角色图、头像、横幅的统一管理
- 支持前端运行时读取资源清单并动态更新
- 支持失败回退和懒加载

## 目录结构
- `public/assets/personality/*.svg`：角色图、头像、横幅
- `public/assets/catalog.json`：资源清单
- `app/lib/personalityAssets.ts`：默认映射
- `app/lib/assetCatalogClient.ts`：前端清单加载缓存逻辑

## 动态更新机制
- 修改 `public/assets/catalog.json` 即可替换人格资源路径
- 前端优先读取本地缓存，不命中则拉取清单并缓存
- 更新清单版本号后可触发新资源生效

## 性能策略
- 图片组件统一 `loading="lazy"` + `decoding="async"`
- 静态资源交由浏览器缓存，避免重复下载
- 首屏仅加载关键横幅和头像，角色大图延后

## 兜底策略
- 每个资源类型均提供默认占位图
- 图片加载失败自动切换 `default-*` 资源

## 版权策略
- 当前仓库使用项目自制 SVG 资源
- 外部素材接入前必须确认可商用授权并保留来源记录
- 建议新增 `license` 字段写入清单，便于审计

## 素材采集脚本
- `scripts/asset-crawler.mjs` 用于批量抓取公开授权页面中的图片链接
- 脚本执行后应进行人工审核，确认授权和质量后再入库
