# 数据格式说明

## 格式要求

请将您的数据按照以下格式提供：

### JavaScript 文件格式（推荐）

创建一个文件 `src/character-data.js`，内容如下：

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
  // ... 继续添加，总共500个
];
```

### JSON 格式（备选）

也可以使用 JSON 格式，保存为 `src/character-data.json`：

```json
[
  {
    "char": "的",
    "pinyin": "de",
    "words": ["我的", "好的", "是的"],
    "sentence": "这是我的书包。"
  },
  {
    "char": "一",
    "pinyin": "yī",
    "words": ["一个", "一起", "一样"],
    "sentence": "我有一个好朋友。"
  }
]
```

## 字段说明

- **char**: 汉字（单个字符，必需）
- **pinyin**: 拼音（带声调，如 "yī", "shì", "de"，必需）
- **words**: 词组数组（必须包含3个词组，适合1-3年级学生，必需）
- **sentence**: 造句（一个简单的句子，适合1-3年级学生，必需）

## 如何提供数据

您可以通过以下方式提供：

1. **直接发送文件内容**：复制粘贴完整的 JavaScript 或 JSON 文件内容
2. **发送文件**：直接发送 `character-data.js` 或 `character-data.json` 文件
3. **分批次发送**：如果数据量大，可以分批发送

## 注意事项

- 确保每个对象都有 char, pinyin, words, sentence 四个字段
- words 必须是包含3个元素的数组
- sentence 必须是字符串
- 拼音使用标准格式（带声调，如 yī, èr, sān）
- 确保数据适合1-3年级学生水平





