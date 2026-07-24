# 小学学习

面向小学阶段学生的英语与数学练习应用。项目为纯前端单页应用，学习进度、错题和设置保存在浏览器 `localStorage` 中，无需后端服务。

## 主要功能

- 小学一至六年级英语词库、例句和情景对话
- 单词卡片、浏览器语音朗读和多档语速
- 选择、听力、拼写、配对、例句和对话闯关
- 关卡解锁、星级、学习统计、成就和英语错题重练
- 一升二六周暑假计划、分段诊断、掌握度与到期复习
- 一年级百以内口算、20 题快速练、100 题整卷和数学错题重练
- 按本地周一至周日生成的家长周报与下周建议
- 移动端优先布局，支持静态站点部署

## 技术栈

- React 19
- TypeScript 5
- Vite 8
- React Router 7
- Tailwind CSS 4
- Framer Motion
- Vitest

## 本地开发

```bash
npm install
npm run dev
```

开发服务器默认监听 `0.0.0.0`，终端会显示本机访问地址。

## 质量检查

```bash
npm test
npm run lint
npm run build
```

自动化测试覆盖存储迁移、学习日期与连续天数、掌握度和诊断状态机、每日任务、英语题目生成、数学配置与模式隔离、家长周报，以及词库目录和 ID 一致性。

## 构建与部署

```bash
npm run build
npm run preview
```

生产文件输出到 `dist/`。应用使用 Hash Router，可直接部署到 Nginx、GitHub Pages、Netlify、Vercel 等静态托管服务。

## 数据说明

- 英语进度：`english_app_data`
- 数学进度：`english_app_math_data`
- 应用设置与暑假计划：`english_app_settings`

三个 key 均通过版本号和逐字段规范化保持向后兼容。数学练习历史与英语学习会话只保留最近 180 天，避免 `localStorage` 无限增长。词库源数据位于 `src/data/grades/`，轻量目录位于 `src/data/gradeCatalog.ts`，两者的一致性由测试校验。

暑假衔接功能的迭代范围、数据模型和验收标准见 [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)。
