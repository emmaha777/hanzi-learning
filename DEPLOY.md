# 部署指南

本项目已经配置好本地存储机制，每次操作后会自动保存到浏览器的 localStorage，即使关闭页面也不会丢失数据。

## 📦 本地存储机制

项目已经实现了以下保存机制：
- ✅ 每次操作后立即保存
- ✅ 每30秒自动保存
- ✅ 切换标签页时保存
- ✅ 页面关闭前保存
- ✅ 自动备份机制（主存储 + 备份存储）
- ✅ 错误处理和恢复机制

**重要提示**：数据保存在浏览器的 localStorage 中，这意味着：
- ✅ 同一浏览器、同一域名下，数据会持久保存
- ⚠️ 不同浏览器之间数据不共享
- ⚠️ 清除浏览器缓存会删除数据
- ⚠️ 无痕模式下关闭窗口会删除数据

## 🚀 部署到网络

### 方法一：GitHub Pages（免费，推荐）

1. **准备项目**
   ```bash
   # 安装依赖
   npm install
   
   # 构建项目
   npm run build
   ```

2. **推送到 GitHub**
   ```bash
   # 如果还没有初始化 git
   git init
   git add .
   git commit -m "Initial commit"
   
   # 在 GitHub 上创建新仓库，然后：
   git remote add origin https://github.com/你的用户名/hanzi-learning.git
   git branch -M main
   git push -u origin main
   ```

3. **启用 GitHub Pages**
   - 进入 GitHub 仓库页面
   - 点击 `Settings` → `Pages`
   - 在 `Source` 中选择 `GitHub Actions`
   - 工作流会自动运行并部署

4. **访问你的网站**
   - 部署完成后，访问：`https://你的用户名.github.io/hanzi-learning/`
   - 首次部署可能需要几分钟

### 方法二：Vercel（免费，最简单）

1. **安装 Vercel CLI**（可选，也可以直接用网页）
   ```bash
   npm i -g vercel
   ```

2. **部署**
   ```bash
   # 在项目根目录运行
   vercel
   ```
   或者直接访问 [vercel.com](https://vercel.com)，用 GitHub 账号登录，导入你的仓库即可。

3. **自动部署**
   - 每次推送到 GitHub，Vercel 会自动重新部署
   - 访问地址：`https://你的项目名.vercel.app`

### 方法三：Netlify（免费）

1. **访问 Netlify**
   - 访问 [netlify.com](https://netlify.com)
   - 用 GitHub 账号登录

2. **部署**
   - 点击 `Add new site` → `Import an existing project`
   - 选择你的 GitHub 仓库
   - 构建设置：
     - Build command: `npm run build`
     - Publish directory: `dist`
   - 点击 `Deploy site`

3. **访问你的网站**
   - 部署完成后会得到一个 `.netlify.app` 域名
   - 可以自定义域名

### 方法四：其他静态托管服务

你也可以将 `dist` 文件夹的内容上传到任何静态网站托管服务：
- Cloudflare Pages
- Firebase Hosting
- AWS S3 + CloudFront
- 阿里云 OSS
- 腾讯云 COS

## 🔧 本地开发

```bash
# 使用 live-server（原有方式）
npm start

# 或使用 Vite 开发服务器（推荐）
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 📝 注意事项

1. **数据持久化**：
   - 部署后，每个用户的数据都保存在他们自己的浏览器中
   - 不同设备之间数据不共享（除非使用同步浏览器）
   - 建议定期导出数据备份（可以添加导出功能）

2. **浏览器兼容性**：
   - 需要支持 localStorage 的现代浏览器
   - 建议使用 Chrome、Firefox、Safari、Edge 等

3. **HTTPS 要求**：
   - 某些浏览器功能（如 Service Worker）需要 HTTPS
   - 所有推荐的部署平台都自动提供 HTTPS

## 🆘 常见问题

**Q: 部署后数据会丢失吗？**
A: 不会。数据保存在用户的浏览器 localStorage 中，与部署无关。

**Q: 如何备份数据？**
A: 可以在浏览器开发者工具中查看 localStorage，或添加导出功能。

**Q: 可以多设备同步吗？**
A: 当前版本不支持。如需多设备同步，需要添加后端服务（如 Firebase）。

**Q: 部署后访问 404？**
A: 检查路由配置，确保所有路径都指向 `index.html`（已配置在 `netlify.toml` 和 `vercel.json` 中）。

## 📚 下一步建议

- [ ] 添加数据导出/导入功能
- [ ] 添加多设备同步（Firebase/Supabase）
- [ ] 添加学习统计和进度可视化
- [ ] 添加拼音和语音功能
- [ ] 优化移动端体验


