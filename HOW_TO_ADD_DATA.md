# 如何添加汉字数据

## 数据格式

您需要创建一个文件 `src/character-data.js`，格式如下：

```javascript
export const CHARACTER_DATA = [
  {
    char: '的',
    pinyin: 'de',
    words: ['我的', '好的', '是的'],
    sentence: '这是我的书包。'
  },
  {
    char: '一',
    pinyin: 'yī',
    words: ['一个', '一起', '一样'],
    sentence: '我有一个好朋友。'
  },
  {
    char: '是',
    pinyin: 'shì',
    words: ['不是', '是的', '就是'],
    sentence: '这是苹果。'
  },
  // ... 继续添加所有500个汉字
];
```

## 字段说明

- **char**: 汉字（单个字符）
- **pinyin**: 拼音（带声调，如 "yī", "shì", "de"）
- **words**: 词组数组（必须包含3个词组，适合1-3年级学生）
- **sentence**: 造句（一个简单的句子，适合1-3年级学生）

## 如何提供数据

1. **直接粘贴内容**：将完整的 JavaScript 代码粘贴到 `src/character-data.js` 文件中
2. **分批次发送**：如果数据量大，可以分批发送，我会帮您整合

## 注意事项

- 确保每个对象都有 char, pinyin, words, sentence 四个字段
- words 必须是包含3个元素的数组
- sentence 必须是字符串
- 拼音使用标准格式（带声调）
- 确保数据适合1-3年级学生水平

## 文件位置

将文件保存为：`/Users/yuejiaoha/Projects/hanzi-learning/src/character-data.js`

## 功能

添加数据后，系统将自动：
- 在卡片上显示拼音
- 在模态框中显示拼音、词组和造句
- 移除日期标签（不再显示"new 2025-11-03"这样的标签）
- 改善卡片布局，使卡片均匀分布


