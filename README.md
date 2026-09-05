# OpenLottery · 幸运大转盘

活动促销 / 社交娱乐抽奖轻应用（uTools 插件 · Vue 3 · SCSS · puffseed）。

## 文档

- 产品需求：[抽奖-产品需求文档.md](./抽奖-产品需求文档.md)
- 编码规范入口：[AGENTS.md](./AGENTS.md)

## 功能

- **幸运大转盘**：点击中心「点击抽奖」，转盘加权随机停格，中奖 / 谢谢惠顾分别提示与音效
- **奖品配置**：自定义奖品名称、类型、颜色、权重，本地持久化

## 开发

```bash
npm install
npm run dev
```

浏览器打开 Vite 地址即可预览；在 uTools 开发者工具中加载本目录，使用指令「幸运大转盘」「抽奖配置」。

```bash
npm run build
```

## 技术要点

- Vue 3 `<script setup lang="ts">` + Vite
- 样式：SCSS scoped；入口按序引入 WebVariable + `rules/Extensions/LotteryTheme.css`
- 音效：Web Audio 合成（无外置音频文件）
