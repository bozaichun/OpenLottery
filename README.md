# OpenLottery · 幸运大转盘

面向**活动促销、社交娱乐**等场景的抽奖轻应用，以红金喜庆风转盘呈现抽奖过程，支持奖品与中奖权重本地配置。

技术栈：**Vue 3 · Vite · SCSS · TypeScript · uTools 插件**，样式与编码约定遵循 **puffseed** 规则包。

---

## 功能概览

| 能力 | 说明 |
|------|------|
| 幸运大转盘 | 红金外环 + 白/米黄扇区交替；点击「开始抽奖」或中心「抽」按钮，加权随机停格 |
| 结果反馈 | 中奖 / 谢谢惠顾分别弹窗提示，并播放不同 Web Audio 合成音效 |
| 奖品配置 | 主界面点击「奖品配置」打开弹窗表格；可增删改名称、类型、权重、启用状态 |
| 概率控制 | 按相对权重加权随机；表格实时显示各奖品占比 |
| 本地持久化 | 配置写入 `localStorage` / uTools `dbStorage`，下次进入保留 |
| 扇区配色 | 按序号自动白 / 米黄交替，保证转盘视觉协调 |

**uTools 指令**

- 抽奖：`幸运大转盘` / `抽奖` / `转盘`
- 配置页：`抽奖配置` / `奖品配置`（独立配置页入口仍保留）

---

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开终端提示的 Vite 地址（默认 `http://localhost:5173`）即可预览。

```bash
npm run build
```

构建产物输出到 `dist/`，可在 uTools 开发者工具中加载本项目目录进行联调（开发态 `plugin.json` 指向 `http://localhost:5173`）。

---

## 目录结构

```text
OpenLottery/
├── public/
│   ├── plugin.json          # uTools 插件声明与指令
│   └── preload/             # 预加载脚本
├── rules/
│   ├── CodingSpec.md        # 工程编码规范
│   ├── DESIGN.md            # 界面设计规范
│   ├── WebVariable/         # 设计 Token（主题 / 间距 / 动画）
│   └── Extensions/
│       └── LotteryTheme.css # 转盘红金主题扩展变量
├── src/
│   ├── App.vue              # 路由：抽奖页 / 配置页
│   ├── main.js              # 入口（按序引入 WebVariable + 主题）
│   └── Lottery/
│       ├── index.vue        # 抽奖主界面（含配置弹窗）
│       ├── Config.vue       # 独立配置页（uTools feature）
│       ├── components/      # LuckyWheel / PrizeConfig / ResultModal
│       ├── composables/     # 配置持久化 / 旋转算法 / 音效
│       └── constants/       # 默认奖品与扇区配色
├── AGENTS.md                # puffseed 规则入口
└── package.json
```

---

## 使用说明

### 抽奖

1. 进入主界面，确认转盘扇区与奖品正确  
2. 点击 **开始抽奖** 或中心 **抽**  
3. 转盘减速停格后弹出结果；转动过程中不可重复触发  

### 奖品配置

1. 主界面点击 **奖品配置**，打开配置弹窗  
2. 表格中可直接修改名称、类型、权重、启用  
3. **添加奖品** 通过子弹窗录入；删除后自动重排扇区颜色  
4. **保存配置** 后立即作用于下次抽奖；**恢复默认** 回到内置 8 扇区  

约束：至少保留 2 个启用中的奖品，且启用项权重之和大于 0。

---

## 技术要点

- **Vue 3** `<script setup lang="ts">` + Vite（`base: './'` 适配插件相对路径）
- **样式**：SCSS scoped；入口按序引入 `ThemeVariable` → `SystemVariable` → `ProjectReset` → `Animation` → `LotteryTheme`
- **主题**：标准红金喜庆风（正红外环、金饰灯珠、白/米黄扇区）
- **抽奖算法**：按权重加权随机；指针固定正上方，盘面旋转对准扇区中心
- **音效**：Web Audio API 合成，无外置音频资源
- **存储键**：`puffseed.openlottery.config.v5`

---

## 相关文档

| 文档 | 说明 |
|------|------|
| [AGENTS.md](./AGENTS.md) | puffseed 规则入口（编码 / 设计 / Token） |
| [rules/CodingSpec.md](./rules/CodingSpec.md) | 前端工程与代码规范 |
| [rules/DESIGN.md](./rules/DESIGN.md) | 界面设计与 Token 用法 |
| [rules/WebVariable/README.md](./rules/WebVariable/README.md) | Token 维护说明 |

---

## 许可与标识

业务域命名与预览品牌保留 **puffseed** 标识。按团队约定发布与使用。
