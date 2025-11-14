# Vercel 部署图片404问题修复

## 🐛 问题

访问 Vercel 部署的网站时，图片显示 404 错误：
- 请求路径：`/assets/red_closed.png`（没有哈希）
- 实际文件：`/assets/red_closed-BTijrlJq.png`（带哈希）

## 🔍 原因

这通常是因为：
1. **Vercel 缓存了旧的构建**
2. **浏览器缓存了旧的 HTML**
3. **构建没有正确执行**

## ✅ 解决方案

### 方法1：强制重新部署（推荐）

1. **在 Vercel Dashboard 中**：
   - 进入你的项目
   - 点击 "Deployments" 标签
   - 找到最新的部署
   - 点击 "..." 菜单
   - 选择 "Redeploy"
   - 勾选 "Use existing Build Cache" 的**反选**（清除缓存）
   - 点击 "Redeploy"

2. **或者通过 Git 触发重新部署**：
   ```bash
   # 做一个空提交来触发重新部署
   git commit --allow-empty -m "Force redeploy to clear cache"
   git push
   ```

### 方法2：清除浏览器缓存

1. **强制刷新页面**：
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **或者清除浏览器缓存**：
   - 打开浏览器设置
   - 清除浏览数据
   - 选择"缓存的图片和文件"

### 方法3：检查 Vercel 构建日志

1. **在 Vercel Dashboard 中**：
   - 进入你的项目
   - 点击 "Deployments" 标签
   - 点击最新的部署
   - 查看 "Build Logs"
   - 确认构建命令 `npm run build` 成功执行
   - 确认输出目录 `dist` 包含所有文件

### 方法4：验证构建输出

在本地验证构建是否正确：

```bash
# 清理并重新构建
rm -rf dist
npm run build

# 检查构建后的 HTML
cat dist/index.html | grep "red_closed"

# 应该看到带哈希的路径，例如：
# src="/assets/red_closed-BTijrlJq.png"

# 检查文件是否存在
ls -la dist/assets/red_closed*.png
```

## 🔧 如果问题仍然存在

### 检查 Vercel 配置

确保 `vercel.json` 配置正确：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "buildCommand": "npm run build"
}
```

### 检查 Vite 配置

确保 `vite.config.js` 中 `base` 设置为 `/`：

```javascript
export default defineConfig({
  base: '/',  // 绝对路径，适用于 Vercel
  // ...
})
```

### 检查构建脚本

确保 `package.json` 中的构建脚本正确：

```json
{
  "scripts": {
    "build": "vite build && npm run build:fix"
  }
}
```

## 📝 验证修复

部署完成后，验证：

1. **打开浏览器开发者工具（F12）**
2. **进入 Network 标签页**
3. **刷新页面**
4. **检查图片请求**：
   - 应该请求 `/assets/red_closed-BTijrlJq.png`（带哈希）
   - 状态码应该是 200（成功）
   - 不应该有 404 错误

5. **检查 HTML 源码**：
   - 右键页面 → "查看页面源代码"
   - 搜索 `red_closed`
   - 应该看到带哈希的路径

## 🚨 常见问题

### Q: 为什么本地可以，Vercel 不行？

A: 可能是 Vercel 使用了缓存的旧构建。强制重新部署（清除缓存）应该能解决。

### Q: 构建日志显示成功，但图片还是404？

A: 检查浏览器缓存，强制刷新页面（Ctrl+Shift+R 或 Cmd+Shift+R）。

### Q: 如何确认 Vercel 使用了最新的构建？

A: 在 Vercel Dashboard 中查看部署时间，确保是最新的。或者查看构建日志中的文件列表。

## 💡 预防措施

为了避免将来出现类似问题：

1. **每次部署前清理构建**：
   ```bash
   rm -rf dist
   npm run build
   ```

2. **在 Vercel 设置中禁用构建缓存**（如果经常遇到问题）：
   - 项目设置 → Build & Development Settings
   - 取消勾选 "Use Build Cache"

3. **使用版本控制**：
   - 确保所有更改都提交到 Git
   - 让 Vercel 从 Git 触发部署，而不是手动上传

