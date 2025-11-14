// 汉字数据模板
// 格式说明：
// 每个对象包含：char (汉字), pinyin (拼音), words (三个词组，数组), sentence (一个造句，字符串)
// 适合1-3年级学生

// 示例格式：
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
  // ... 继续添加其他字符
  // 总共500个字符
];

// 使用方法：
// 1. 将上面的 CHARACTER_DATA 数组填满所有500个汉字的数据
// 2. 在 data.js 中导入这个文件
// 3. 系统会自动使用这些数据


