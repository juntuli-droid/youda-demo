# 页面升级与验收说明

## 本次升级范围
- 人格结果页：单屏布局、无滚动展示、响应式适配
- 人格结果页：新增重新测试按钮、状态重置、过渡动效、防重复点击
- 个人主页：头像工坊（上传、预览、滤镜、边框、保存）
- 房间页：同步显示用户自定义头像
- 资源链路：采集脚本、映射库、格式转换、版本化清单、CDN 地址支持

## 单屏布局策略
- 使用 `h-screen` + `overflow-hidden` 控制视窗内渲染
- 将结果页拆分为三段式网格：
  - 标题信息 + 角色图
  - 人格属性卡片
  - 记忆点与操作按钮
- 大屏优先双列，小屏自动改为单列压缩版

## 重新测试流程
- 点击“重新测试”后执行：
  - 清理 `personalityScores`
  - 清理 `personalityResultMeta`
  - 清理 `latestMatchDraft`、`latestMatchRequestId`、`currentRoomId`
  - 延迟 260ms 后跳转 `/personality/questions`
- 按钮在处理中禁用，防止重复触发

## 资源采集和处理
- 采集命令：`npm run assets:crawl`
- 来源配置：`scripts/assets-sources.json`
- 输出：
  - 链接清单：`tmp/crawled-assets/*.json`
  - 转码资源：`public/assets/crawled/*.{webp,png,jpg}`
- 处理能力：
  - 自动下载
  - 尺寸归一化（900x1200）
  - 自动导出 WebP/PNG/JPG

## 人格映射数据
- 映射数据：`public/assets/personality-mapping.json`
- 动态清单：`public/assets/catalog.json`
- 前端缓存键：
  - `assetCatalogCache`
  - `assetCatalogCacheVersion`

## CDN 与性能
- 配置 `NEXT_PUBLIC_ASSET_CDN_BASE_URL` 后自动改写静态资源地址
- 图片组件统一懒加载并带失败占位图回退
- 清单启用版本缓存，支持热更新后自动替换

## 兼容性测试建议
- 浏览器：Chrome / Edge / Safari / Firefox
- 分辨率：1920x1080、1366x768、1440x900、390x844
- 测试点：
  - 人格结果页是否无滚动
  - 重新测试按钮状态是否可控
  - 头像上传、切换、保存、跨页展示是否一致
  - 弱网下图片回退与页面可用性

## Code Review 清单
- 状态清理是否幂等
- 本地缓存键命名是否统一
- 资源路径是否支持 CDN 前缀
- 新增脚本是否可在 CI 环境运行
