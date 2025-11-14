const fs = require('fs');
const path = require('path');

// 将 dist/src/index.html 移动到 dist/index.html
const srcHtml = path.join(__dirname, '../dist/src/index.html');
const distHtml = path.join(__dirname, '../dist/index.html');

if (fs.existsSync(srcHtml)) {
  // 读取 HTML 内容
  let content = fs.readFileSync(srcHtml, 'utf8');
  
  // 修复资源路径（从 ../assets/ 改为 ./assets/）
  content = content.replace(/\.\.\/assets\//g, './assets/');
  
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

