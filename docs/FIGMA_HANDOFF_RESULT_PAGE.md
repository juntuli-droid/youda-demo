# Result Page Figma Handoff

## Frame
- Desktop: 1440 × 900
- Tablet: 1024 × 768
- Mobile: 390 × 844

## Auto Layout
- Root: Vertical, gap 16, padding 16
- Hero: 2 columns on desktop, 1 column on mobile
- Metrics: 4 cards desktop / 2 cards mobile
- Bottom: memory card + action column desktop

## Tokens
- Import from: `design/tokens/game-ui.tokens.json`
- Radius: 8
- Border: rgba(117,138,178,0.24)
- Shadow: 0 16 40 rgba(6,10,21,0.45)

## Components
- `Result Hero Copy`
- `Result Hero Image`
- `Metric Card`
- `Memory Card`
- `CTA Primary / CTA Secondary`
- `Guide Chip`

## Pixel Density
- 1x, 2x, 3x 导出策略：
  - PNG export scales: 1x / 2x / 3x
  - Keep stroke aligned to whole pixels
