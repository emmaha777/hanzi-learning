# 本地访问网页指南

## ⚠️ 问题说明

如果你关闭了 VSCode/Cursor，网页显示 "This site can't be reached"，这是因为：

- **本地开发需要开发服务器运行**
- 关闭 VSCode/Cursor 会停止开发服务器
- 没有服务器，浏览器就无法访问网页

## 🔧 解决方案

### 方案1：保持开发服务器运行（临时方案）

**步骤**：

1. **在 Terminal 中运行开发服务器**（不要关闭 Terminal）
   ```bash
   npm start
   ```
   或
   ```bash
   npm run dev
   ```

2. **访问网页**
   - `http://localhost:3000/src/index.html`（使用 `npm start`）
   - `http://localhost:3000`（使用 `npm run dev`）

3. **保持 Terminal 窗口打开**
   - ⚠️ 关闭 Terminal 会停止服务器
   - ⚠️ 关闭 VSCode/Cursor 也会停止服务器

**缺点**：必须保持开发服务器运行，关闭 VSCode 就无法访问。

### 方案2：部署到网络（推荐！✅）

**这是最佳方案！** 部署后：
- ✅ 不需要本地开发服务器
- ✅ 关闭 VSCode/Cursor 不影响访问
- ✅ 任何设备都可以访问
- ✅ 数据依然保存在浏览器中（localStorage）

**快速部署（3步）**：

#### 使用 Vercel（最简单）

1. **访问 [vercel.com](https://vercel.com)**，用 GitHub 账号登录

2. **点击 "Add New Project"**，选择你的仓库

3. **点击 "Deploy"**，完成！

   访问地址：`https://你的项目名.vercel.app`

#### 使用 GitHub Pages

1. **推送代码到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的用户名/hanzi-learning.git
   git push -u origin main
   ```

2. **启用 GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source 选择 "GitHub Actions"
   - 工作流会自动运行并部署

3. **访问网站**
   - 地址：`https://你的用户名.github.io/hanzi-learning/`

详细步骤请查看 [DEPLOY.md](./DEPLOY.md)

### 方案3：构建后直接打开（有限制）

**步骤**：

1. **构建项目**
   ```bash
   npm run build
   ```

2. **直接用浏览器打开**
   - 找到 `dist/index.html` 文件
   - 右键 → 用浏览器打开

**⚠️ 限制**：
- 某些功能可能无法正常工作（因为路径问题）
- 不推荐此方案

## 🎯 推荐方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| 保持服务器运行 | 简单 | 必须保持运行 | ⭐⭐ |
| **部署到网络** | 永久可用，任何设备访问 | 需要部署步骤 | ⭐⭐⭐⭐⭐ |
| 直接打开 HTML | 不需要服务器 | 功能可能受限 | ⭐ |

## 💡 最佳实践

**推荐工作流程**：

1. **开发阶段**：使用 `npm run dev` 在本地开发
2. **部署阶段**：部署到 Vercel/GitHub Pages
3. **日常使用**：访问部署后的网站，不需要本地服务器

这样：
- ✅ 开发时可以在本地测试
- ✅ 使用时访问部署的网站，不受 VSCode 影响
- ✅ 数据保存在浏览器中，本地和部署环境可以互相迁移

## 📝 数据迁移

如果你在本地积累了很多数据，可以：

1. **在本地导出数据**：点击"导出数据"按钮
2. **部署网站后导入数据**：点击"导入数据"按钮，选择导出的文件

详细说明请查看 [STORAGE_EXPLAINED.md](./STORAGE_EXPLAINED.md)

