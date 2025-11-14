# 图片显示问题修复说明

## 🐛 问题原因

图片文件名称大小写不匹配：
- **HTML 引用**：小写 `blue_closed.png`, `red_closed.png` 等
- **实际文件**：大写 `Blue_closed.png`, `Red_closed.png` 等

**为什么本地能显示，部署后不显示？**
- macOS 文件系统默认**不区分大小写**，所以本地能正常工作
- Linux 服务器（Vercel/GitHub Pages）**区分大小写**，找不到文件就显示不出来

## ✅ 已修复

所有图片文件已重命名为小写，与 HTML 引用一致：

- ✅ `Blue_closed.png` → `blue_closed.png`
- ✅ `Blue_open.png` → `blue_open.png`
- ✅ `Pink_closed.png` → `pink_closed.png`
- ✅ `Pink_open.png` → `pink_open.png`
- ✅ `Purple_closed.png` → `purple_closed.png`
- ✅ `Purple_open.png` → `purple_open.png`
- ✅ `Red_closed.png` → `red_closed.png`
- ✅ `Red_open.png` → `red_open.png`
- ✅ `Turquoise_closed.png` → `turquoise_closed.png`
- ✅ `Turquoise_open.png` → `turquoise_open.png`

## 🚀 重新部署

修复后需要重新部署才能生效：

### Vercel

1. **提交更改到 GitHub**
   ```bash
   git add .
   git commit -m "Fix image file names (case sensitivity)"
   git push
   ```

2. **Vercel 会自动重新部署**
   - 等待几分钟
   - 访问你的 Vercel 域名
   - 图片应该正常显示了！

### GitHub Pages

1. **提交更改到 GitHub**
   ```bash
   git add .
   git commit -m "Fix image file names (case sensitivity)"
   git push
   ```

2. **GitHub Actions 会自动重新部署**
   - 在仓库页面查看 Actions 标签页
   - 等待部署完成
   - 访问你的 GitHub Pages 域名
   - 图片应该正常显示了！

## ✅ 验证修复

部署完成后，检查：

1. **打开你的部署网站**
2. **查看"复习宝箱"部分**
3. **所有宝箱图片应该正常显示**：
   - ✅ 红色宝箱（第二天复习）
   - ✅ 粉色宝箱（第三天复习）
   - ✅ 紫色宝箱（一星期复习）
   - ✅ 蓝色宝箱（两星期复习）
   - ✅ 青色宝箱（一个月复习）

4. **打开浏览器开发者工具（F12）**
   - 进入 Network 标签页
   - 刷新页面
   - 检查图片资源是否都成功加载（状态码 200）

## 🔍 如果还有问题

如果重新部署后图片还是不显示：

1. **清除浏览器缓存**
   - 按 `Ctrl+Shift+R` (Windows) 或 `Cmd+Shift+R` (Mac) 强制刷新

2. **检查浏览器控制台**
   - 按 F12 打开开发者工具
   - 查看 Console 标签页是否有错误
   - 查看 Network 标签页，检查图片请求是否失败

3. **检查构建输出**
   - 在本地运行 `npm run build`
   - 检查 `dist/assets/` 目录是否有所有图片文件

## 📝 技术说明

Vite 在构建时会：
1. 处理所有资源文件（图片、CSS、JS）
2. 添加内容哈希到文件名（用于缓存控制）
3. 更新 HTML 中的引用路径

构建后的文件名示例：
- `blue_closed.png` → `blue_closed-Dy3ZMVEn.png`
- `red_closed.png` → `red_closed-BTijrlJq.png`

这是正常的，Vite 会自动更新 HTML 中的引用。

