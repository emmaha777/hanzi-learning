# 汉字移动逻辑说明

## 📋 核心逻辑

### 阶段定义

- **stageIndex = 0**: 新字库（未学习）
- **stageIndex = 1**: 第二天复习（createdDate + 1天）
- **stageIndex = 2**: 第三天复习（createdDate + 2天）
- **stageIndex = 3**: 一星期复习（createdDate + 7天）
- **stageIndex = 4**: 两星期复习（createdDate + 14天）
- **stageIndex = 5**: 一个月复习（createdDate + 30天）
- **stageIndex = 6**: 学会了（永久）

**OFFSETS = [0, 1, 2, 7, 14, 30]** 对应 stageIndex 0..5

## 🔄 状态转换规则

### 1. 第一天看到的新字（stageIndex=0, createdDate=今天）

#### 点击"我认识啦！"
- ✅ **stageIndex**: 0 → 1（移动到第二天复习）
- ✅ **createdDate**: **保持不变**（不修改）
- ✅ **结果**: 明天（createdDate + 1天）会出现在"第二天复习"
- ✅ **今天**: 从"今日新字"中移除，不会出现在任何复习阶段

#### 点击"已经学会了！"
- ✅ **stageIndex**: 0 → 6（进入"学会了"字库）
- ✅ **createdDate**: 设为 null（不计入今天的新字）
- ✅ **结果**: 进入"学会了"字库，可以抽查
- ✅ **替换**: 自动查找下一个未学习的字来替换（按INITIAL_CHARS顺序）

### 2. 复习阶段（stageIndex 1-5）

#### 点击"我记住啦！"
- ✅ **stageIndex**: +1（移动到下一阶段）
  - stageIndex 1 → 2（第二天复习 → 第三天复习）
  - stageIndex 2 → 3（第三天复习 → 一星期复习）
  - stageIndex 3 → 4（一星期复习 → 两星期复习）
  - stageIndex 4 → 5（两星期复习 → 一个月复习）
  - stageIndex 5 → 6（一个月复习 → 学会了）
- ✅ **createdDate**: **保持不变**（不修改）
- ✅ **结果**: 
  - 会在下一次对应的时间出现（例如：第二天复习→第三天复习，会在 createdDate + 2天 出现）
  - **当前复习阶段不会再出现**（因为 stageIndex 已经改变）
  - 例如：今天在"第二天复习"点击"我记住啦"，stageIndex 变为 2，今天不会再出现在"第二天复习"，会在后天（createdDate + 2天）出现在"第三天复习"

#### 点击"有点忘了"
- ✅ **stageIndex**: 1-5 → 0（回到新字库）
- ✅ **createdDate**: 设为 null（清空）
- ✅ **lastShown**: 设为 null
- ✅ **结果**: 
  - 回到新字库，等待重新分配
  - 等重新认识时（点击"我认识啦"）会重写 createdDate 为当天

## 📅 复习时间计算

复习阶段的显示逻辑：
```javascript
const next = addDaysToDateStr(c.createdDate, OFFSETS[c.stageIndex]);
if (next <= today && c.stageIndex >= 1 && c.stageIndex <= 5) {
  // 显示在对应的复习阶段
}
```

**示例**：
- createdDate = 2024-01-15
- stageIndex = 1（第二天复习）
- OFFSETS[1] = 1
- next = 2024-01-15 + 1 = 2024-01-16
- 如果 today >= 2024-01-16，则显示在"第二天复习"

## ✅ 关键保证

1. **createdDate 在复习阶段保持不变**
   - 新字点击"我认识啦"：createdDate 不变
   - 复习阶段点击"我记住啦"：createdDate 不变
   - 只有"有点忘了"时才会清空 createdDate

2. **次日再出现的逻辑**
   - 点击"我记住啦"后，stageIndex 立即改变
   - 当前复习阶段不会再出现（因为 stageIndex 已改变）
   - 会在下一次对应的时间出现（根据新的 stageIndex 和 OFFSETS 计算）

3. **回到新字库的逻辑**
   - 点击"有点忘了"后，stageIndex 变为 0，createdDate 清空
   - 等待重新分配为"今日新字"
   - 重新认识时会重写 createdDate

## 🧪 测试场景

### 场景1：新字学习流程
1. 今天（2024-01-15）看到新字"的"
2. 点击"我认识啦"
   - stageIndex: 0 → 1
   - createdDate: 2024-01-15（不变）
3. 明天（2024-01-16）会出现在"第二天复习"
4. 点击"我记住啦"
   - stageIndex: 1 → 2
   - createdDate: 2024-01-15（不变）
5. 后天（2024-01-17）会出现在"第三天复习"

### 场景2：复习阶段忘记
1. 在"第二天复习"看到"的"
2. 点击"有点忘了"
   - stageIndex: 1 → 0
   - createdDate: null（清空）
3. 回到新字库，等待重新分配
4. 某天重新分配为"今日新字"
5. 点击"我认识啦"
   - stageIndex: 0 → 1
   - createdDate: 新的日期（重写）

### 场景3：直接学会
1. 今天看到新字"的"
2. 点击"已经学会了！"
   - stageIndex: 0 → 6
   - createdDate: null
3. 进入"学会了"字库
4. 自动替换为下一个未学习的字


