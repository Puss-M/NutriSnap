# 🍽️ NutriSnap AI

> 极速记录 + 场景化决策的智能饮食助手

一款基于视觉 AI 的饮食管理 PWA，帮助大学生和年轻白领在便利店、食堂、外卖等场景下，快速识别热量并获得即时选购建议。

## ✨ 核心特色

- **📸 极速识别**: 拍照 → AI 分析 → 保存，全程 < 10 秒
- **🎛️ Magic Edit**: 滑块实时调整份量，无需重新计算
- **🧠 场景感知**: 懂得"全家"和"食堂"的区别，给出针对性建议
- **📊 智能统计**: 环形进度图、营养素分析、饮食记录
- **💬 AI 顾问**: 对话式建议："差 20g 蛋白质？买两个茶叶蛋"
- **📱 PWA 即开即用**: 无需下载 App，添加到主屏幕即可

## 🚀 快速开始

### 前置要求

- Node.js 18+
- Supabase 账号
- Silicon Flow API 密钥

### 安装运行

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量 (见 ENV_SETUP.md)
cp .env.example .env.local

# 3. 运行数据库脚本 (见 supabase-schema.sql)

# 4. 启动开发服务器
npm run dev
```

访问 http://localhost:3000

**详细教程**: 查看 [QUICKSTART.md](./QUICKSTART.md)

## 📱 技术栈

- **前端**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **UI 组件**: shadcn/ui (Drawer, Slider, Card, Badge)
- **状态管理**: Zustand
- **AI**: Vercel AI SDK + Silicon Flow (Qwen2-VL + Qwen2.5)
- **数据库**: Supabase (PostgreSQL + Storage)
- **部署**: Vercel

## 📐 项目结构

```
nutrisnap/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (AI endpoints)
│   ├── chat/              # AI顾问页面
│   ├── stats/             # 统计页面
│   └── page.tsx           # 主页
├── components/            # React组件
│   ├── ui/                # shadcn/ui基础组件
│   ├── camera-capture.tsx # 相机捕获
│   └── food-result-drawer.tsx # Magic Edit抽屉
├── lib/                   # 工具函数
│   ├── supabase.ts        # 数据库客户端
│   ├── store.ts           # Zustand状态
│   └── prompts.ts         # AI提示词
└── public/                # 静态资源 (icons, manifest)
```

## 🎯 核心功能

### 1. AI 食物识别

```typescript
// 使用 Vercel AI SDK 的 generateObject 确保结构化输出
const result = await generateObject({
  model: qwen2VL,
  schema: foodSchema, // Zod验证
  messages: [...]
})
```

### 2. Magic Edit 系统

实时计算，无需 API 调用：

```typescript
const ratio = newWeight / originalWeight;
calories = Math.round(originalCalories * ratio);
```

### 3. 场景化 AI 顾问

上下文注入的智能推荐：

```typescript
const prompt = CHAT_SYSTEM_PROMPT(
  context: "便利店",
  macroDeficit: { protein: 20, carbs: 30, fat: 5 }
)
```

## 📊 数据流

```
[用户拍照]
  → [Camera Capture组件]
  → [/api/analyze-food]
  → [Qwen2-VL处理]
  → [返回JSON]
  → [Magic Edit抽屉]
  → [用户调整]
  → [保存到Supabase]
```

## 🚢 部署

### Vercel (推荐)

1. Push 到 GitHub
2. 在 Vercel 导入项目
3. 添加环境变量
4. 一键部署!

### 环境变量

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SILICON_FLOW_API_KEY=sk-xxx
```

## 📝 开发路线图

### ✅ MVP (v1.0)

- [x] AI 食物识别
- [x] Magic Edit 微调
- [x] 场景化 AI 顾问
- [x] 统计仪表板
- [x] PWA 支持

### 🔜 P1 (v1.1)

- [ ] 使用限制 (每日 3 次免费)
- [ ] 激活码系统
- [ ] 周数据红黑榜
- [ ] 数据导出

### 💡 未来特性

- [ ] 微信登录
- [ ] 支付集成 (微信/支付宝)
- [ ] 膳食计划
- [ ] 社交分享

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

---

**立即开始**: 查看 [QUICKSTART.md](./QUICKSTART.md) 快速上手

**详细文档**: 参考 [walkthrough.md](./walkthrough.md) 了解实现细节

**问题反馈**: 通过 GitHub Issues 联系我们
