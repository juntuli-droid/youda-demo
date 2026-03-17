# Badge API 接口文档

## 存储模型
- localStorage key: `profileBadgeConfig`
- 结构：
  - `manualBadges: BadgeItem[]`
  - `autogenBadges: BadgeItem[]`

## BadgeItem
- `id: string`
- `name: string`
- `description: string`
- `iconUrl: string`
- `blurDataURL?: string`
- `type: "manual" | "auto"`
- `game?: string`
- `rank?: string`
- `createdAt: string`

## 自动同步
- 来源：`gameCareerRecords`
- 入口：`createAutogenBadgesFromCareer(records)`
- 规则：同游戏+段位去重，按创建时间倒序

## 手动管理
- 新增：`addManualBadge`
- 官方预设新增：`addManualBadgeFromPreset`
- 删除：`removeBadgeById`
- 替换：`replaceManualBadge`

## 展示排序
- `toDisplayBadges(store)`
- 手动项优先，类型内按时间倒序
