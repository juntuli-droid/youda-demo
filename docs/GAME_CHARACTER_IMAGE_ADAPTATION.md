# 游戏人物图片展示适配说明

## 源数据
- 来源目录：`/game_chars_png`
- 总数：27 张
- 尺寸统计结果：见 [game-char-size-analysis.json](file:///Users/lijuntu/syncup-demo/youda-demo/docs/game-char-size-analysis.json)

## 统一窗口策略
- 结果页展示窗口比例：`16:10`
- 结果页窗口尺寸：
  - Mobile：`232 × 144`
  - Tablet：`280 × 176`
  - Desktop：`320 × 200`
- 结果图处理：统一输出到 `display/`，`640 × 640` 透明底 `contain`，避免拉伸
- 头像图处理：统一输出到 `avatar/`，`512 × 512` `cover + attention`，突出面部

## 映射规则
- 人物名与文件名映射：`app/data/gameCharacterMap.json`
- 人格编码映射来源：`app/lib/personalityEngine.ts` 中 `CHARACTER_MAP`
- 路径规则：
  - 结果页图：`/images/avatars/game-characters/display/<file>`
  - 头像图：`/images/avatars/game-characters/avatar/<file>`

## 容错机制
- 映射缺失：回退到 `/images/avatars/default.png`
- 图片加载失败：回退到 `/images/avatars/placeholder.png` 并 `console.warn`

## 响应式与不变形保障
- 结果页图片容器固定 `aspect-[16/10]`
- 图片样式使用 `object-contain`
- 头像样式使用 `object-cover` + `object-position` 聚焦上半区域
