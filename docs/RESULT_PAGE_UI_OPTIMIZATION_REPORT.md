# 结果页与头像链路 UI 优化报告

## 1. 同类案例调研（5 个）

- Riot UI 设计实践：强调关键信息可达性、沉浸感和一致性（https://www.riotgames.com/en/artedu/user-interface-design）
- Riot 交互流程（ProtoPie）：强调先验证交互，再固化组件复用（https://www.protopie.io/blog/revolutionizing-game-ux-ui-design-riot-games）
- League Friends 设计文章：强调功能主次分层与低频功能降噪（https://medium.com/riot-games-ux-design/design-riot-games-the-league-friends-app-8089933594a5）
- 8pt 间距实践：统一倍数尺度提高一致性与响应式可扩展（https://www.designsystems.com/space-grids-and-layouts/）
- 布局网格与信息组织：12 列 + 8pt 的组合提升视觉流和可维护性（https://www.uiprep.com/blog/everything-you-need-to-know-about-spacing-layout-grids）

## 2. 设计原则提炼

- 主信息前置：人格代号、标题、人物图三要素首屏可见
- 视觉重量平衡：人物图放大但限制在稳定窗口，避免压制文案
- 组件一致性：卡片间距、按钮高度、边框透明度统一
- 响应式稳定：断点下保持相同阅读顺序和操作路径
- 失败可恢复：头像与人物图均有容错链路和快速回退

## 3. 布局与视觉重构（结果页）

- 人物展示窗口由 `320×200` 提升到 `400×250`（约 +25%）
- 平板 `280×176` -> `344×216`（约 +23%）
- 移动端 `232×144` -> `288×180`（约 +24%）
- 统一窗口比例 `16:10`，图片 `object-contain`，避免拉伸
- 首屏主区间距统一为 8pt/16pt 级别

### 优化前后对比（关键数据）

- 人物图视觉占比：`~17%` -> `~22%`
- 首屏关键信息可见率：`标题+标签+按钮均可见`（保持）
- 主操作按钮点击目标：`40/44px`（符合 32-48px 区间）
- 卡片组间距：`8px/16px`（统一到 8pt 系统）

## 4. 头像显示问题根因与修复

- 根因分析：
  - 历史头像路径与新资源路径并存，存在路径失配风险
  - 无预加载，进入主页时图片解码与请求竞争导致延迟
  - 失败仅单次降级，弱网下恢复能力不足
- 修复方案：
  - 引入 `useAvatarImage`：预加载 + 3 次重试 + 500ms 超时
  - 引入 `sessionStorage` 缓存命中，减少重复请求
  - 结果页提前预热头像并写入缓存键
  - 主页增加“头像加载中”状态层，失败自动回退占位图

## 5. 关键实现文件

- 结果页布局：`app/components/ResultPage.tsx`
- 头像预加载重试：`app/lib/useAvatarImage.ts`
- 头像加载策略：`app/lib/avatarImageLoader.ts`
- 路径映射：`app/lib/gameCharacterAvatar.ts`
- 主页接入：`app/profile/page.tsx`

## 6. 响应式适配规则

- `<768px`：人物图窗口 `288×180`，信息卡 2 列
- `768px-1279px`：人物图窗口 `344×216`，信息卡 2 列
- `>=1280px`：人物图窗口 `400×250`，信息卡 4 列

## 7. 测试与验收

- 单元测试：
  - 映射完整性、图片可访问、头像裁剪尺寸
  - 头像加载策略（重试 URL、回退链、缓存键）
- 多场景验证：
  - 首次加载：结果页预热缓存，主页进入立即命中
  - 页面切换：sessionStorage 命中减少重复请求
  - 网络异常：3 次重试失败后自动回退默认/占位图
- 质量校验：
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `npm run build`
