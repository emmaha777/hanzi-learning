const fs = require('fs');
const path = require('path');

// 将 dist/src/index.html 移动到 dist/index.html
const srcHtml = path.join(__dirname, '../dist/src/index.html');
const distHtml = path.join(__dirname, '../dist/index.html');

if (fs.existsSync(srcHtml)) {
  // 读取 HTML 内容
  let content = fs.readFileSync(srcHtml, 'utf8');
  
  // 由于图片现在在 public 目录中，路径已经是绝对路径 (/assets/)
  // 只需要确保路径是绝对路径，不修改 public 目录的文件路径
  // 修复可能的相对路径问题（从 ../assets/ 改为 /assets/）
  content = content.replace(/\.\.\/assets\//g, '/assets/');
  // 确保所有 assets 路径都是绝对路径（如果还有相对路径）
  content = content.replace(/src="\.\/assets\//g, 'src="/assets/');
  // 确保 logo 路径是绝对路径
  content = content.replace(/src="\.\/logo\.png"/g, 'src="/logo.png"');
  
  // 写入到根目录
  fs.writeFileSync(distHtml, content, 'utf8');
  
  // 删除 src 目录
  try {
    const srcDir = path.join(__dirname, '../dist/src');
    if (fs.existsSync(srcDir)) {
      fs.rmSync(srcDir, { recursive: true, force: true });
    }
  } catch (e) {
    // 如果删除失败，忽略错误
    console.warn('⚠ 无法删除 dist/src 目录:', e.message);
  }
  
  console.log('✓ 已移动 index.html 到 dist 根目录并修复资源路径');
} else {
  console.warn('⚠ 未找到 dist/src/index.html，跳过修复');
}

