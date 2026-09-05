# AI 定制化编码规则 · 指南（VibeCoding · puffseed）

本文件是 **puffseed** 前端 AI 编码规则包的**唯一入口**，供智能体与开发者在目标业务仓库中协作时使用。

**规范定位**：面向 **前端工程**（原生 HTML/CSS/JS · Vue · React · Next.js · Nuxt.js · UniApp 等）的 AI 辅助编程约定，覆盖工程实现、界面设计与设计 Token。涉及业务域命名、注释、预览品牌时保留 **puffseed** 标识。

**冲突原则**：规范与目标业务仓库已定稿实现不一致时，以**业务仓库为准**。

---

## 使用说明（必读）

### 给开发者

| 步骤 | 做什么 |
|------|--------|
| 1. 接入规则包 | 将本仓库作为子模块、子目录，或把 `rules/` 同步到业务仓约定位置 |
| 2. 告知智能体入口 | 对话中 `@AGENTS.md`，或把本文件加入 Cursor Rules / 项目说明 |
| 3. 按任务引用细则 | 写业务代码 → `@rules/CodingSpec.md`；做 UI/样式 → `@rules/DESIGN.md`；改 Token → `@rules/WebVariable/SubjectAuthority.md` |
| 4. 引入样式 | 业务入口按固定顺序引入 `WebVariable/` 四个 CSS（见 §3） |
| 5. 视觉验收 | 浏览器打开 `rules/PreView/LightDesignSpec.html` 或 `DarkDesignSpec.html`（**勿**把预览 HTML 全文喂给 AI） |

**团队换肤 / 改 Token**：先改 `rules/WebVariable/SubjectAuthority.md`，再让 Agent 同步 CSS。推荐话术与路径见 `rules/WebVariable/README.md`。

### 给智能体（加载流程）

开始任何任务前，按下列顺序执行：

1. **读本文件**（`AGENTS.md`），确认项目模式与框架（§1）
2. **按任务类型加载对应规则**（见下表「最小加载集」），勿一次塞入全部文件
3. **以业务仓库已有实现为准**；缺 Token 时先在 `SubjectAuthority.md` 补行再同步 CSS，禁止在业务组件硬编码整套色板
4. **UI 验收**提示用户打开 PreView，不要把 PreView HTML 载入上下文

### 目录一览

```text
AGENTS.md                 ← 本入口（先读）
rules/
  CodingSpec.md           ← 前端工程与代码规范
  DESIGN.md               ← 界面设计规范（Token 用法 · UI 模式 · 禁令）
  WebVariable/            ← 设计 Token 唯一维护处
    SubjectAuthority.md   ← Token 权威表（先改表，再同步 CSS）
    ThemeVariable.css     ← 主题色 / 文本色
    SystemVariable.css    ← 间距 / 布局 / 字号·行高 / 阴影等
    ProjectReset.css      ← 全局重置
    Animation.css         ← 全局动画工具类
    README.md             ← Token 维护与 Agent 话术
  PreView/                ← 浅/深色视觉预览（浏览器打开）
    LightDesignSpec.html
    DarkDesignSpec.html
```

### 规范文件职责与选用

| 文件 | 职责 | 何时查阅 |
|------|------|---------|
| `AGENTS.md`（本文件） | 入口、项目识别、加载策略、样式概览、自检 | **任何任务开始前** |
| `rules/CodingSpec.md` | 工程实现：框架约定、目录、TS、组件、状态、性能、注释、门禁 | 编写或修改 **前端业务代码** |
| `rules/DESIGN.md` | 视觉与样式：分层、Token 引用、UI 模式、1:1 原则、动效 | **UI 布局、样式、主题、响应式** |
| `rules/WebVariable/` | Token 源码与权威表 | 改色值、间距、字号；入口引入 CSS |
| `rules/WebVariable/README.md` | Token 维护工作流与推荐话术 | 团队换肤、扩展套件、同步 CSS |
| `rules/PreView/*.html` | 浅/深色视觉对照 | 浏览器验收（勿全文载入 AI） |

### 最小加载集（节约 Token）

| 任务类型 | 应加载 | 通常不必加载 |
|---------|--------|-------------|
| 任意编码起步 | `AGENTS.md` | CodingSpec / DESIGN 全文 |
| 前端业务逻辑（无 UI） | + `CodingSpec.md` | DESIGN、PreView |
| 前端 UI / 样式 | + `DESIGN.md` + 相关 WebVariable CSS | PreView HTML 全文 |
| 改主题色 / 间距 / 字号 | + `SubjectAuthority.md` + 对应 CSS | CodingSpec 全文 |
| 深浅色视觉验收 | 浏览器打开 PreView | 勿将 HTML 载入 AI 上下文 |

---

## 1. 项目模式与框架识别（开发前必做）

### 1.1 前端附加模式

| 模式 | 识别信号 | 支持技术栈 | 说明 |
|------|---------|-----------|------|
| **普通项目** | **无** `public/plugin.json` | 原生 HTML + CSS + JS · Vue · React · Next.js · Nuxt.js · UniApp | 通用 Web / 多端应用 |
| **uTools 生态插件** | **存在** `public/plugin.json` | **仅** React · Vue（2 / 3） | uTools 插件模板 |

### 1.2 识别流程

1. 检查是否存在 `public/plugin.json`（§1.1）
2. 根据依赖与入口文件判断框架（§1.3）
3. 加载 `CodingSpec.md`；若涉及 UI / 样式，再加载 `DESIGN.md` 与 `WebVariable/`
4. 冲突时以目标业务仓库已定稿实现为准

### 1.3 框架识别信号

| 技术栈 | 识别信号 | 规范落点 |
|--------|---------|---------|
| 原生 HTML/CSS/JS | 无框架依赖、`index.html` 直引脚本 | CodingSpec 共性 / DESIGN 样式章节 |
| Vue 2 | `vue@2`、Options API | CodingSpec · Vue 2 |
| Vue 3 | `vue@3`、`<script setup>` | CodingSpec · Vue 3 |
| React 18+ | `react`、Hooks | CodingSpec · React |
| Next.js | `next`、`app/` 或 `pages/` | CodingSpec · Next.js |
| Nuxt.js | `nuxt`、`app/` 或 `pages/`、`nuxt.config.ts` | CodingSpec · Nuxt.js |
| UniApp | `pages.json`、`manifest.json`、`@dcloudio/uni-*` | CodingSpec · UniApp |

**跨框架共性（摘要）**

- **语言**：TypeScript 优先；公共 API 须有明确类型
- **目录**：按业务域划分；路由集中配置（含 UniApp `pages.json`）
- **事件**：业务处理函数 `handle` 前缀；Vue / UniApp 对外事件 kebab-case；React / Next `onXxx`
- **样式**：引用 **WebVariable** Token，禁止业务组件硬编码整套色板
- **注释**：模板 `<!-- 区块说明 -->`；关键业务可用 `// puffseed：说明`

细则见 `rules/CodingSpec.md`。

---

## 2. AI 编码行为约定

1. **先思考，再编码**：明确假设；不确定时先提问
2. **简洁优先**：最少代码解决问题，不做推测性扩展
3. **精准修改**：只动必须动的部分，匹配仓库已有风格
4. **目标驱动**：定义成功标准并验证（lint / typecheck / 预览）
5. **Token 优先**：缺色值或尺寸时，先改 `SubjectAuthority.md` 再同步 CSS，禁止在组件内散落魔法数

---

## 3. 样式系统概览（与 DESIGN / WebVariable 联动）

涉及 **UI 布局、样式、组件视觉、主题色** 时，遵守 `rules/DESIGN.md`，Token 以 **`rules/WebVariable/`** 为准。

### 3.1 样式分层与 1:1 原则

| 层级 | 文件 / 位置 | 内容 | 可否在业务项目中重复定义 |
|------|-------------|------|------------------------|
| 主题 Token | `WebVariable/ThemeVariable.css` | 标准色板 + 文本色 | **禁止** |
| 系统 Token | `WebVariable/SystemVariable.css` | 间距 · 布局 · 字号 · 图标 · 阴影 | **禁止** |
| 全局重置 | `WebVariable/ProjectReset.css` | 盒模型、`html`/`body` | **禁止** |
| 全局动画 | `WebVariable/Animation.css` | 入场 / 强调 / 加载 / 骨架屏工具类 | 动效需求时在此增补 |
| 应用补充 | 各仓库入口 CSS | 仅应用级补充 | 按需 |
| 布局 / 页面 / 组件 | 对应模块内 | 1:1 作用域样式，引用 Token | 仅本模块内 |

**1:1 原则**：组件 / 页面 / 布局样式各写在其作用域内。**全局 Token / reset / 动画仅在 `WebVariable/` 维护。**

**字阶 + 行高**：凡设置 `--fs-*`，必须成对设置权威表中对应的 `--lh-*`（见 `SubjectAuthority.md` §1.4）。

### 3.2 引入顺序（强制）

**ThemeVariable → SystemVariable → ProjectReset → Animation → 应用 CSS**

```javascript
// 路径按业务仓库相对位置调整
import "../rules/WebVariable/ThemeVariable.css";
import "../rules/WebVariable/SystemVariable.css";
import "../rules/WebVariable/ProjectReset.css";
import "../rules/WebVariable/Animation.css";
import "./main.css";
```

| 技术栈 | 引入位置 |
|--------|---------|
| 原生 HTML/CSS/JS | `index.html` 中 `<link>` |
| Vue 2 / Vue 3 | `main.js` / `main.ts` 中 `import` |
| Nuxt.js | `app.vue` `<style>` 或 `nuxt.config.ts` 的 `css` 数组 |
| UniApp | `App.vue` / `uni.scss` 或入口引入（注意小程序 CSS 变量） |
| React 18+ | `index.jsx` / `main.tsx` 中 `import` |
| Next.js | `app/layout.tsx`（App Router）或 `pages/_app.tsx`（Pages Router） |

### 3.3 Token 要点

| 类别 | 变量示例 | 来源 |
|------|---------|------|
| 标准色 / 功能色 | `--primary` · `--success` · `--error` | ThemeVariable |
| 文本色 | `--title` · `--main-text` · `--title-dark` | ThemeVariable |
| 间距 / 布局 / 字号·行高 / 阴影 | `--size-16` · `--layout-header` · `--fs-14`/`--lh-22` · `--shadow` | SystemVariable |

### 3.4 Token 扩展（规则拔插）

- **核心套件**：`ThemeVariable.css` + `SystemVariable.css` + `ProjectReset.css` + `Animation.css`
- **扩展套件**：可在 `WebVariable/` 或同级 `Extensions/` **追加** CSS，入口在核心套件之后引入，**不修改核心文件**
- 未明确要求时，AI **仅使用核心套件**
- 维护流程与 Agent 话术见 `rules/WebVariable/README.md`

---

## 4. 各框架落地对照（摘要）

| 场景 | Vue 3 | Nuxt.js | UniApp | React 18+ | Next.js |
|------|-------|---------|--------|-----------|---------|
| 组件 | `<script setup>` SFC | Vue SFC + `<ClientOnly>` | Vue SFC + `view`/`text` 等 | 函数组件 + Hooks | Server / Client Component 边界 |
| 路由 | `vue-router` | `pages/` 或 `app/` | `pages.json` | React Router | `app/` 或 `pages/` |
| 状态 | `ref` / Pinia | `useState` / Pinia | Pinia / Vuex | `useState` / Zustand 等 | 服务端数据 + 客户端状态分离 |
| 样式 | SCSS scoped | 入口引 WebVariable | Token + rpx / 条件编译 | CSS Modules | 根 layout 引 WebVariable |

完整约定见 `rules/CodingSpec.md`；视觉落点见 `rules/DESIGN.md`。

---

## 5. 业务注释规范（puffseed）

- **前端模板**：`<!-- 区块说明 -->`
- **脚本关键路径**：`// puffseed：说明`
- **原则**：只注释「做什么 / 为什么」；完整示例见 `CodingSpec.md` §14
- **品牌**：业务预览与产品文案保留 **puffseed** / **puffseed-ui**

---

## 6. 自检清单（提交前）

- [ ] 已识别项目模式（普通 / uTools）与框架
- [ ] 已按任务加载 `CodingSpec.md` 和/或 `DESIGN.md`（未无谓加载 PreView HTML）
- [ ] format / lint / typecheck 已通过，未绕过提交钩子
- [ ] 分层正确；目录落点符合约定
- [ ] 强类型与入口校验到位；无未登记技术债 / 临时代码
- [ ] **WebVariable** 已按顺序引入，且未在业务侧重复定义 Token
- [ ] 使用 `--fs-*` 处已成对设置对应 `--lh-*`
- [ ] 样式 1:1；无密钥硬编码；副作用 / 资源已清理
- [ ] 关键业务路径注释含 **puffseed**；新人可据注释与 README 上手
- [ ] UI 视觉正常（可对照 PreView）

---

## 7. 开发与调试

| 场景 | 操作 |
|------|------|
| 前端本地开发 | 以业务仓脚本为准（常见 `npm run dev`） |
| Token 视觉预览 | 打开 `rules/PreView/LightDesignSpec.html` 或 `DarkDesignSpec.html` |
| Token 维护 | 改 `SubjectAuthority.md` → Agent 同步 CSS → PreView 验收（见 `WebVariable/README.md`） |
| uTools 调试 | 开发者工具 → 插件开发 → 加载项目目录 |

---

*最后同步：`AGENTS.md` · `rules/CodingSpec.md` · `rules/DESIGN.md` · `rules/WebVariable/` · `rules/PreView/` · puffseed*
