# 快速开始指南

## ✅ 已完成的改进

### 1. 数据持久化 ✅
- ✅ 每次操作后立即保存到 localStorage
- ✅ 每30秒自动保存
- ✅ 切换标签页时自动保存
- ✅ 页面关闭前自动保存
- ✅ 自动备份机制（主数据 + 备份数据）
- ✅ 错误处理和恢复机制

**现在关闭页面后重新打开，数据不会丢失！**

### 2. 部署配置 ✅
- ✅ 支持 GitHub Pages 部署
- ✅ 支持 Vercel 部署
- ✅ 支持 Netlify 部署
- ✅ 构建脚本已配置完成

## 🚀 立即部署（3步完成）

### 方法一：Vercel（最简单，推荐）

1. **访问 [vercel.com](https://vercel.com)**，用 GitHub 账号登录

2. **点击 "Add New Project"**，选择你的仓库

3. **点击 "Deploy"**，完成！

   访问地址：`https://你的项目名.vercel.app`

### 方法二：GitHub Pages

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

### 方法三：Netlify

1. **访问 [netlify.com](https://netlify.com)**，用 GitHub 登录

2. **导入项目**
   - 点击 "Add new site" → "Import an existing project"
   - 选择你的仓库

3. **构建设置**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - 点击 "Deploy site"

## 📦 本地测试

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 预览构建结果
npm run preview
```

## 🔍 验证数据保存

1. 打开应用，学习几个汉字
2. 关闭浏览器标签页
3. 重新打开应用
4. **数据应该还在！** ✅

## 📝 数据存储位置

- 数据保存在浏览器的 **localStorage**
- 存储键：`cn_cards_v1`（主数据）
- 备份键：`cn_cards_v1_backup`（自动备份）

### 查看/备份数据

1. 打开浏览器开发者工具（F12）
2. 进入 Application → Local Storage
3. 找到你的网站域名
4. 可以看到 `cn_cards_v1` 和 `cn_cards_v1_backup`
5. 可以复制 JSON 数据作为备份

## ⚠️ 重要提示

- ✅ 同一浏览器、同一域名下，数据会持久保存
- ⚠️ 不同浏览器之间数据不共享
- ⚠️ 清除浏览器缓存会删除数据
- ⚠️ 无痕模式下关闭窗口会删除数据

## 🆘 遇到问题？

查看 [DEPLOY.md](./DEPLOY.md) 获取详细部署说明和故障排除指南。


