import { DEFAULT_CHARS } from './data.js';
import { todayDateStr, addDaysToDateStr, uid } from './utils.js';

// Try to load character data with full information (pinyin, words, sentences)
let INITIAL_CHARS = DEFAULT_CHARS;
async function loadCharacterData() {
  try {
    const dataModule = await import('./character-data.js');
    if (dataModule.CHARACTER_DATA && dataModule.CHARACTER_DATA.length > 0) {
      INITIAL_CHARS = dataModule.CHARACTER_DATA.map(item => ({
        char: item.char,
        pinyin: item.pinyin || '',
        words: item.words || [],
        sentence: item.sentence || ''
      }));
      console.log(`✓ Loaded ${INITIAL_CHARS.length} characters with full data`);
      console.log(`Sample: ${INITIAL_CHARS[0].char} - words: ${INITIAL_CHARS[0].words.length}, sentence: ${INITIAL_CHARS[0].sentence ? 'yes' : 'no'}`);
    }
  } catch (e) {
    console.log('character-data.js not found, using default character list');
  }
}

// Storage key
const STORAGE_KEY = 'cn_cards_v1';

// 阶段偏移（天）
const OFFSETS = [0,1,2,7,14,30]; // stageIndex 0..5

const DEFAULTS = { 
  dailyNew: 4,
  stage1Limit: 10,  // 第二天复习上限
  stage2Limit: 10,  // 第三天复习上限
  stage3Limit: 10,  // 一星期复习上限
  stage4Limit: 10,  // 两星期复习上限
  stage5Limit: 10,  // 一个月复习上限
  randomCheckLimit: 5  // 抽查学会了上限
};

let cards = [];
let settings = {
  dailyNew: DEFAULTS.dailyNew,
  stage1Limit: DEFAULTS.stage1Limit,
  stage2Limit: DEFAULTS.stage2Limit,
  stage3Limit: DEFAULTS.stage3Limit,
  stage4Limit: DEFAULTS.stage4Limit,
  stage5Limit: DEFAULTS.stage5Limit,
  randomCheckLimit: DEFAULTS.randomCheckLimit
};
let currentOpenBox = null; // Track which box is currently open

// DOM elements (will be initialized when DOM is ready)
let todayEl, newCardsEl, todayCountEl, boxContent, newCountEl, reviewCountEl;

function loadAll() {
  // 尝试从主存储加载，如果失败则尝试从备份加载
  let raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    // 尝试从备份恢复
    raw = localStorage.getItem(STORAGE_KEY + '_backup');
    if (raw) {
      console.log('从备份恢复数据');
      // 恢复备份到主存储
      try {
        localStorage.setItem(STORAGE_KEY, raw);
      } catch (e) {
        console.error('恢复备份失败:', e);
      }
    }
  }
  if (!raw) {
    const arr = INITIAL_CHARS.map(item=>({
      id: uid(),
      char: item.char,
      pinyin: item.pinyin || '',
      createdDate: null,
      stageIndex: 0,
      words: item.words || [],
      sentence: item.sentence || "",
      lastShown: null
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    return arr;
  }
  try {
    const parsed = JSON.parse(raw);
    // Merge with INITIAL_CHARS to update words and sentences
    const charDataMap = new Map();
    INITIAL_CHARS.forEach(item => {
      charDataMap.set(item.char, item);
    });
    
    let updated = false;
    const updatedCards = parsed.map(card => {
      const initialData = charDataMap.get(card.char);
      if (initialData) {
        // Update words and sentence from INITIAL_CHARS if card doesn't have them
        const needsUpdate = !card.words || card.words.length === 0 || !card.sentence;
        if (needsUpdate) {
          updated = true;
          return {
            ...card,
            pinyin: card.pinyin || initialData.pinyin || '',
            words: (card.words && card.words.length > 0) ? card.words : (initialData.words || []),
            sentence: card.sentence || initialData.sentence || ""
          };
        }
        return {
          ...card,
          pinyin: card.pinyin || initialData.pinyin || ''
        };
      }
      return {
        ...card,
        pinyin: card.pinyin || ''
      };
    });
    
    // Save updated cards back to localStorage if we made changes
    if (updated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards));
    }
    
    return updatedCards;
  } catch(e){ console.error(e); return []; }
}
// 改进的保存函数，带错误处理和重试机制
function saveAll() {
  try {
    const dataToSave = JSON.stringify(cards);
    localStorage.setItem(STORAGE_KEY, dataToSave);
    // 验证保存是否成功
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== dataToSave) {
      console.warn('数据保存验证失败，尝试重新保存...');
      // 重试一次
      localStorage.setItem(STORAGE_KEY, dataToSave);
    }
    // 同时保存一个备份
    localStorage.setItem(STORAGE_KEY + '_backup', dataToSave);
    console.log('数据已保存到 localStorage');
  } catch (e) {
    console.error('保存数据失败:', e);
    // 如果 localStorage 已满，尝试清理备份后重试
    try {
      localStorage.removeItem(STORAGE_KEY + '_backup');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
      console.log('清理备份后保存成功');
    } catch (e2) {
      console.error('保存失败，可能是存储空间不足:', e2);
      alert('警告：数据保存失败！可能是浏览器存储空间不足。请尝试清理浏览器缓存或导出数据备份。');
    }
  }
}

function computeAndRender() {
  // Safety check: ensure DOM elements are available
  if (!todayEl || !newCardsEl || !todayCountEl || !newCountEl || !reviewCountEl) {
    console.warn('DOM elements not ready yet');
    return;
  }
  
  const today = todayDateStr();
  todayEl.textContent = today;
  
  // Update random check button text
  const randomCheckCountEl = document.getElementById('randomCheckCount');
  if (randomCheckCountEl) {
    randomCheckCountEl.textContent = settings.randomCheckLimit;
  }

  // Create order map for sorting
  const charOrderMap = new Map();
  INITIAL_CHARS.forEach((item, index) => {
    charOrderMap.set(item.char, index);
  });
  
  // Find cards that were created today and are still at stage 0 (today's new cards)
  let todayNew = cards.filter(c => {
    return c.stageIndex === 0 && c.createdDate === today;
  });
  
  // Sort by the order in INITIAL_CHARS (original character-data.js order)
  todayNew.sort((a, b) => {
    const orderA = charOrderMap.get(a.char) ?? 9999;
    const orderB = charOrderMap.get(b.char) ?? 9999;
    return orderA - orderB;
  });
  
  // Check if any cards were created today (even if they've been learned)
  const anyCardsCreatedToday = cards.some(c => c.createdDate === today);
  
  // If no cards were created today AND no cards were created today at all, create new ones for today
  if (todayNew.length === 0 && !anyCardsCreatedToday) {
    // Find cards that haven't been learned yet (stage 0, no createdDate)
    const unlearned = cards.filter(c => {
      return c.stageIndex === 0 && !c.createdDate;
    });
    
    // Sort by INITIAL_CHARS order
    unlearned.sort((a, b) => {
      const orderA = charOrderMap.get(a.char) ?? 9999;
      const orderB = charOrderMap.get(b.char) ?? 9999;
      return orderA - orderB;
    });
    
    // Take first 4 and mark them as created today
    const toCreateToday = unlearned.slice(0, settings.dailyNew);
    if (toCreateToday.length > 0) {
      toCreateToday.forEach(c => {
        c.createdDate = today;
        c.lastShown = today;
      });
      todayNew = toCreateToday;
      saveAll(); // Save the new createdDate values
    }
  }

  // render new cards
  newCardsEl.innerHTML = '';
  if (todayNew.length === 0) {
    // All today's new cards have been learned
    const completionMsg = document.createElement('div');
    completionMsg.className = 'completion-message';
    completionMsg.textContent = '今天的新字任务完成啦！明天继续加油！';
    newCardsEl.appendChild(completionMsg);
  } else {
    todayNew.forEach(c => newCardsEl.appendChild(cardElement(c)));
  }

  // compute stage counts (total available)
  const stageItems = {};
  for (let i=1;i<=5;i++) stageItems[i]=[];
  cards.forEach(c=>{
    if (c.stageIndex===6) return;
    if (!c.createdDate) return;
    const next = addDaysToDateStr(c.createdDate, OFFSETS[c.stageIndex]);
    if (next <= today && c.stageIndex>=1 && c.stageIndex<=5) stageItems[c.stageIndex].push(c);
  });
  for (let i=1;i<=5;i++){
    const countEl = document.getElementById('count-s'+i);
    if (countEl) {
      countEl.textContent = stageItems[i].length;
    } else {
      console.error(`Element count-s${i} not found`);
    }
  }
  const learnedCount = cards.filter(c => c.stageIndex === 6).length;
  const countLearnedEl = document.getElementById('count-learned');
  if (countLearnedEl) {
    countLearnedEl.textContent = learnedCount;
  } else {
    console.warn('Element count-learned not found (this is optional)');
  }
  
  // Update learned count in stat card
  const learnedCountEl = document.getElementById('learnedCount');
  if (learnedCountEl) {
    learnedCountEl.textContent = learnedCount;
  }
  
  // Calculate today's total task (new cards + limited review cards)
  let reviewTotal = 0;
  for (let i=1;i<=5;i++){
    const limitKey = `stage${i}Limit`;
    const limit = settings[limitKey] || 999;
    const available = stageItems[i].length;
    reviewTotal += limit > 0 ? Math.min(available, limit) : available;
  }
  const total = todayNew.length + reviewTotal;
  
  // Update DOM elements - ensure they exist and update them
  if (todayCountEl) {
    todayCountEl.textContent = total || 0;
  } else {
    console.error('todayCountEl is null! ID: todayCount');
    // Try to get it again
    todayCountEl = document.getElementById('todayCount');
    if (todayCountEl) {
      todayCountEl.textContent = total || 0;
    }
  }
  
  // Update detailed counts
  if (newCountEl) {
    newCountEl.textContent = todayNew.length || 0;
  } else {
    console.error('newCountEl is null! ID: newCount');
    // Try to get it again
    newCountEl = document.getElementById('newCount');
    if (newCountEl) {
      newCountEl.textContent = todayNew.length || 0;
    }
  }
  
  if (reviewCountEl) {
    reviewCountEl.textContent = reviewTotal || 0;
  } else {
    console.error('reviewCountEl is null! ID: reviewCount');
    // Try to get it again
    reviewCountEl = document.getElementById('reviewCount');
    if (reviewCountEl) {
      reviewCountEl.textContent = reviewTotal || 0;
    }
  }
  
  // Show warning if total exceeds 30 (soft limit)
  if (total > 30) {
    todayCountEl.style.color = '#d9534f';
    todayCountEl.title = '今日任务超过30个，建议合理安排学习时间';
  } else {
    todayCountEl.style.color = '';
    todayCountEl.title = '';
  }

  saveAll();
}

function cardElement(card) {
  const div = document.createElement('div');
  div.className = 'card';
  div.dataset.id = card.id;
  div.innerHTML = `<div class="char">${card.char}</div>`;
  div.addEventListener('click', ()=>openModal(card));
  return div;
}
function stageName(idx){
  return ["new","第二天","第三天","一周","两周","一月","学会了"][idx] || '';
}

function openModal(card) {
  // Find the actual card in the array to ensure we're modifying the right one
  const actualCard = cards.find(c => c.id === card.id) || card;
  
  const modalRoot = document.getElementById('modalRoot');
  modalRoot.innerHTML = '';
  modalRoot.style.display = 'block';
  const overlay = document.createElement('div'); overlay.className='overlay';
  const modal = document.createElement('div'); modal.className='modal';
  modal.innerHTML = `
    <h2 style="font-family:KaiTi;font-size:80px">${actualCard.char}</h2>
    <div><strong>组词：</strong> ${(actualCard.words || []).join('、') || '（暂无）'}</div>
    <div><strong>造句：</strong> ${actualCard.sentence || '（暂无）'}</div>
  `;
  const actions = document.createElement('div'); actions.className='actions';

  if (actualCard.stageIndex === 0) {
    const know = document.createElement('button'); know.textContent='我认识啦！';
    know.onclick = (e)=>{ 
      e.stopPropagation(); 
      // 第一天看到的新字，点击"我认识啦"后：
      // - stageIndex变为1（第二天复习）
      // - createdDate保持不变（不修改）
      // - 这样明天（createdDate + 1天）会出现在"第二天复习"
      const today = todayDateStr();
      actualCard.stageIndex = 1; 
      actualCard.lastShown = today; 
      // 确保createdDate已设置（如果是在"今日新字"中，createdDate应该已经是今天）
      // 但不要修改已存在的createdDate
      if (!actualCard.createdDate) {
        // 只有在createdDate不存在时才设置（理论上不应该发生，但作为保护）
        actualCard.createdDate = today;
      }
      // createdDate保持不变，不修改
      saveAll(); 
      modalRoot.style.display='none'; 
      // Re-render to update the display (this card will be removed from "今日新字")
      computeAndRender();
      if (currentOpenBox !== null) {
        showBox(currentOpenBox);
      } else {
        // Remove box-open class from all boxes when closing
        document.querySelectorAll('.treasure-box').forEach(box => {
          box.classList.remove('box-open');
        });
      }
    };
    actions.appendChild(know);
    
    // 添加"已经学会了！"按钮
    const alreadyKnow = document.createElement('button'); 
    alreadyKnow.textContent='已经学会了！';
    alreadyKnow.style.marginLeft = '8px';
    alreadyKnow.onclick = (e)=>{ 
      e.stopPropagation(); 
      // TODO: 二次确认功能（备用）
      // if (confirm('确认：这个字已经学会了？')) {
      // 直接进入"学会了"库，不计入今日新字
      actualCard.stageIndex = 6; 
      actualCard.createdDate = null; // 不计入今天的新字
      actualCard.lastShown = todayDateStr(); 
      saveAll(); 
      modalRoot.style.display='none'; 
      
      // 查找下一个未学习的字来替换（按INITIAL_CHARS顺序）
      const today = todayDateStr();
      // 创建顺序映射
      const charOrderMap = new Map();
      INITIAL_CHARS.forEach((item, index) => {
        charOrderMap.set(item.char, index);
      });
      
      // 找到当前字在INITIAL_CHARS中的位置
      const currentCharOrder = charOrderMap.get(actualCard.char) ?? 9999;
      
      // 找到所有未学习的字（stageIndex = 0, createdDate = null）
      const unlearned = cards.filter(c => {
        return c.stageIndex === 0 && !c.createdDate;
      });
      
      // 按INITIAL_CHARS顺序排序，找到在当前字之后的下一个未学习的字
      unlearned.sort((a, b) => {
        const orderA = charOrderMap.get(a.char) ?? 9999;
        const orderB = charOrderMap.get(b.char) ?? 9999;
        return orderA - orderB;
      });
      
      // 找到在当前字顺序之后的下一个未学习的字
      let nextCard = null;
      for (const card of unlearned) {
        const cardOrder = charOrderMap.get(card.char) ?? 9999;
        if (cardOrder > currentCharOrder) {
          nextCard = card;
          break;
        }
      }
      
      // 如果找到了下一个字，设置为今天的新字来替换
      if (nextCard && nextCard.stageIndex === 0 && !nextCard.createdDate) {
        nextCard.createdDate = today;
        nextCard.lastShown = today;
      } else if (unlearned.length > 0) {
        // 如果当前字是最后一个，按顺序取第一个未学习的字
        const firstCard = unlearned[0];
        if (firstCard && firstCard.stageIndex === 0 && !firstCard.createdDate) {
          firstCard.createdDate = today;
          firstCard.lastShown = today;
        }
      }
      
      saveAll();
      // Re-render to update the display
      computeAndRender();
      if (currentOpenBox !== null) {
        showBox(currentOpenBox);
      } else {
        // Remove box-open class from all boxes when closing
        document.querySelectorAll('.treasure-box').forEach(box => {
          box.classList.remove('box-open');
        });
      }
      // }
    };
    actions.appendChild(alreadyKnow);
  } else if (actualCard.stageIndex>=1 && actualCard.stageIndex<=5) {
    const ok = document.createElement('button'); ok.textContent='我记住啦！';
    ok.onclick = (e)=>{ 
      e.stopPropagation(); 
      // 复习阶段点击"我记住啦"：
      // - stageIndex+1（移动到下一阶段）
      // - createdDate保持不变（不修改）
      // - 这样会在下一次对应的时间出现（例如：第二天复习→第三天复习，会在createdDate+2天出现）
      // - 当前复习阶段不会再出现（因为stageIndex已经改变）
      const today = todayDateStr();
      // 如果已经是第5阶段（一个月复习），点击后进入"学会了"（stageIndex=6）
      // 否则进入下一阶段
      actualCard.stageIndex = actualCard.stageIndex === 5 ? 6 : actualCard.stageIndex + 1; 
      actualCard.lastShown = today; 
      // createdDate保持不变，不修改
      saveAll(); 
      modalRoot.style.display='none'; 
      computeAndRender();
      if (currentOpenBox !== null) showBox(currentOpenBox);
    };
    const forget = document.createElement('button'); forget.textContent='有点忘了';
    forget.onclick = (e)=>{ 
      e.stopPropagation(); 
      // 复习阶段点击"有点忘了"：
      // - stageIndex设为0（回到新字库）
      // - createdDate设为null（清空）
      // - 等重新认识时（点击"我认识啦"）会重写createdDate
      const originalStage = actualCard.stageIndex; // 保存原始stageIndex，用于刷新对应的宝箱
      actualCard.stageIndex = 0; 
      actualCard.createdDate = null; // 清空createdDate，等待重新认识时重写
      actualCard.lastShown = null; 
      saveAll(); 
      modalRoot.style.display='none'; 
      // 先重新渲染，更新计数等
      computeAndRender();
      // 如果当前有打开的宝箱，立即重新显示它（这个卡片会从列表中消失，因为stageIndex已改变）
      if (currentOpenBox !== null && currentOpenBox === originalStage) {
        // 如果当前打开的宝箱就是卡片原来的stage，重新显示它
        showBox(currentOpenBox);
      }
    };
    actions.appendChild(ok); actions.appendChild(forget);
  } else {
    const note = document.createElement('div'); note.className='small'; note.textContent='此字已标记为学会了，可供抽查。';
    modal.appendChild(note);
  }
  const close = document.createElement('button'); close.textContent='关闭';
  close.onclick = ()=>{ modalRoot.style.display='none'; };
  actions.appendChild(close);
  modal.appendChild(actions);
  overlay.appendChild(modal);
  modalRoot.appendChild(overlay);
}

function showBox(stageIndex) {
  currentOpenBox = stageIndex;
  boxContent.innerHTML = '';
  const title = document.createElement('div'); title.innerHTML = `<strong>${boxTitle(stageIndex)}</strong>`;
  boxContent.appendChild(title);
  const grid = document.createElement('div'); grid.className='grid';
  const today = todayDateStr();
  let items = cards.filter(c=> c.stageIndex===stageIndex && c.createdDate && addDaysToDateStr(c.createdDate, OFFSETS[c.stageIndex]) <= today);
  
  // Apply daily limit based on stageIndex
  const limitKey = `stage${stageIndex}Limit`;
  const limit = settings[limitKey] || 999;
  if (limit > 0 && items.length > limit) {
    items = items.slice(0, limit);
    const limitMsg = document.createElement('div');
    limitMsg.className = 'small';
    limitMsg.style.marginTop = '8px';
    limitMsg.textContent = `今日上限：${limit} 个（共 ${cards.filter(c=> c.stageIndex===stageIndex && c.createdDate && addDaysToDateStr(c.createdDate, OFFSETS[c.stageIndex]) <= today).length} 个待复习）`;
    boxContent.appendChild(limitMsg);
  }
  
  // Update treasure box images to open state
  document.querySelectorAll('.treasure-box').forEach(box => {
    box.classList.remove('box-open');
  });
  const activeBox = document.querySelector(`.treasure-box[data-stage="${stageIndex}"]`);
  if (activeBox) {
    activeBox.classList.add('box-open');
  }
  
  if (items.length===0) {
    boxContent.appendChild(Object.assign(document.createElement('div'),{className:'small',textContent:'没有待复习的字'}));
    // Remove box-open class when there are no items
    document.querySelectorAll('.treasure-box').forEach(box => {
      box.classList.remove('box-open');
    });
    currentOpenBox = null;
    return;
  }
  items.forEach(c=> grid.appendChild(cardElement(c)));
  boxContent.appendChild(grid);
}
function boxTitle(i){
  return {1:'第二天复习',2:'第三天复习',3:'一星期复习',4:'两星期复习',5:'一个月复习'}[i];
}

// Show learned cards in modal
function showLearnedCards() {
  const learned = cards.filter(c => c.stageIndex === 6);
  if (learned.length === 0) {
    alert('还没有学会的字');
    return;
  }
  
  const modalRoot = document.getElementById('modalRoot');
  modalRoot.innerHTML = '';
  modalRoot.style.display = 'block';
  
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.onclick = (e) => {
    if (e.target.classList.contains('overlay')) {
      modalRoot.style.display = 'none';
    }
  };
  
  const modal = document.createElement('div');
  modal.className = 'modal learned-modal';
  modal.style.maxWidth = '900px';
  modal.style.width = '95%';
  
  const title = document.createElement('h3');
  title.textContent = `已经学会了（共 ${learned.length} 个字）`;
  modal.appendChild(title);
  
  const gridWrapper = document.createElement('div');
  gridWrapper.className = 'learned-grid-wrapper';

  const grid = document.createElement('div');
  grid.className = 'grid learned-grid';
  
  learned.forEach(card => {
    grid.appendChild(cardElement(card));
  });
  
  gridWrapper.appendChild(grid);
  modal.appendChild(gridWrapper);
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '关闭';
  closeBtn.style.marginTop = '24px';
  closeBtn.onclick = () => {
    modalRoot.style.display = 'none';
  };
  modal.appendChild(closeBtn);
  
  overlay.appendChild(modal);
  modalRoot.appendChild(overlay);
}

// 随机抽查学会了
function randomCheck() {
  const learned = cards.filter(c=>c.stageIndex===6);
  if (learned.length===0){ alert('学会了库为空'); return; }
  const picks = [];
  const pool = [...learned];
  const limit = settings.randomCheckLimit || 5;
  while (picks.length < limit && pool.length>0) {
    const idx = Math.floor(Math.random()*pool.length);
    picks.push(pool.splice(idx,1)[0]);
  }
  // 简单串行展示
  let i=0;
  function showOne(){
    openModal(picks[i]);
    const root = document.getElementById('modalRoot');
    const btn = document.createElement('button'); btn.textContent = i<picks.length-1? '下一个' : '完成';
    btn.style.marginTop='8px';
    btn.onclick = ()=>{ root.style.display='none'; i++; if (i<picks.length) showOne(); };
    setTimeout(()=>{ const modal = root.querySelector('.modal'); if (modal) modal.appendChild(btn); },50);
  }
  showOne();
}

// Utility: Inspect tasks for arbitrary date (debugging / planning)
function debugTasksForDate(dateStr) {
  if (!cards || cards.length === 0) {
    console.warn('No cards loaded yet.');
    return null;
  }
  const targetDate = dateStr || todayDateStr();
  const config = settings || DEFAULTS;

  // Clone cards to avoid mutating real data
  const clonedCards = cards.map(c => ({ ...c }));

  // Map character order based on initial list
  const charOrderMap = new Map();
  INITIAL_CHARS.forEach((item, index) => {
    charOrderMap.set(item.char, index);
  });

  // Helper to sort by original order
  const sortByInitialOrder = (a, b) => {
    const orderA = charOrderMap.get(a.char) ?? 9999;
    const orderB = charOrderMap.get(b.char) ?? 9999;
    return orderA - orderB;
  };

  // Determine today's new cards (following normal logic, but on cloned data)
  let todayNew = clonedCards.filter(c => c.stageIndex === 0 && c.createdDate === targetDate);
  const anyCardsCreatedToday = clonedCards.some(c => c.createdDate === targetDate);

  if (todayNew.length === 0 && !anyCardsCreatedToday) {
    const dailyNewLimit = config.dailyNew || DEFAULTS.dailyNew;
    const unlearned = clonedCards
      .filter(c => c.stageIndex === 0 && !c.createdDate)
      .sort(sortByInitialOrder);
    const toCreateToday = unlearned.slice(0, dailyNewLimit);
    toCreateToday.forEach(c => {
      c.createdDate = targetDate;
      c.lastShown = targetDate;
    });
    todayNew = toCreateToday;
  }

  todayNew.sort(sortByInitialOrder);

  // Determine review cards due on target date
  const reviewTasks = {};
  for (let i = 1; i <= 5; i++) {
    reviewTasks[i] = clonedCards
      .filter(c => c.stageIndex === i && c.createdDate)
      .filter(c => addDaysToDateStr(c.createdDate, OFFSETS[c.stageIndex]) <= targetDate)
      .sort(sortByInitialOrder);
  }

  const learnedCount = clonedCards.filter(c => c.stageIndex === 6).length;

  const result = {
    date: targetDate,
    summary: {
      newCount: todayNew.length,
      reviewCounts: {
        stage1: reviewTasks[1].length,
        stage2: reviewTasks[2].length,
        stage3: reviewTasks[3].length,
        stage4: reviewTasks[4].length,
        stage5: reviewTasks[5].length
      },
      learnedCount,
      totalDue: todayNew.length +
        reviewTasks[1].length +
        reviewTasks[2].length +
        reviewTasks[3].length +
        reviewTasks[4].length +
        reviewTasks[5].length
    },
    newCards: todayNew.map(card => ({
      char: card.char,
      words: card.words || [],
      sentence: card.sentence || '',
      createdDate: card.createdDate
    })),
    review: {
      stage1: reviewTasks[1].map(card => ({
        char: card.char,
        createdDate: card.createdDate,
        dueDate: addDaysToDateStr(card.createdDate, OFFSETS[1]),
        words: card.words || [],
        sentence: card.sentence || ''
      })),
      stage2: reviewTasks[2].map(card => ({
        char: card.char,
        createdDate: card.createdDate,
        dueDate: addDaysToDateStr(card.createdDate, OFFSETS[2]),
        words: card.words || [],
        sentence: card.sentence || ''
      })),
      stage3: reviewTasks[3].map(card => ({
        char: card.char,
        createdDate: card.createdDate,
        dueDate: addDaysToDateStr(card.createdDate, OFFSETS[3]),
        words: card.words || [],
        sentence: card.sentence || ''
      })),
      stage4: reviewTasks[4].map(card => ({
        char: card.char,
        createdDate: card.createdDate,
        dueDate: addDaysToDateStr(card.createdDate, OFFSETS[4]),
        words: card.words || [],
        sentence: card.sentence || ''
      })),
      stage5: reviewTasks[5].map(card => ({
        char: card.char,
        createdDate: card.createdDate,
        dueDate: addDaysToDateStr(card.createdDate, OFFSETS[5]),
        words: card.words || [],
        sentence: card.sentence || ''
      }))
    }
  };

  console.log('Tasks for date', targetDate, result);
  return result;
}

// 导入：接收每行一个汉字（纯汉字），为每个生成默认占位词句
function importText(txt) {
  const lines = txt.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  let added=0;
  lines.forEach(ch => {
    if (cards.find(c=>c.char===ch)) return;
    cards.push({ id: uid(), char: ch, pinyin: '', createdDate: null, stageIndex: 0, words: [], sentence: "" });
    added++;
  });
  saveAll();
  alert(`导入完成，新增 ${added} 个汉字`);
  computeAndRender();
}

// Initialize when DOM is ready
async function init() {
  // Load character data first (with pinyin, words, sentences if available)
  await loadCharacterData();
  
  // Initialize DOM references
  todayEl = document.getElementById('todayLabel');
  newCardsEl = document.getElementById('newCards');
  todayCountEl = document.getElementById('todayCount');
  boxContent = document.getElementById('boxContent');
  newCountEl = document.getElementById('newCount');
  reviewCountEl = document.getElementById('reviewCount');
  
  // Debug: Check if all elements are found
  console.log('DOM elements initialized:', {
    todayEl: !!todayEl,
    newCardsEl: !!newCardsEl,
    todayCountEl: !!todayCountEl,
    boxContent: !!boxContent,
    newCountEl: !!newCountEl,
    reviewCountEl: !!reviewCountEl
  });
  
  // Logo should be visible by default, hide only if it fails to load
  const logoImg = document.getElementById('logoImg');
  if (logoImg) {
    logoImg.style.display = 'block';
    logoImg.onerror = () => {
      logoImg.style.display = 'none';
    };
  }
  
  // Load data
  cards = loadAll();
  console.log('Cards loaded:', cards.length, 'cards');
  console.log('Sample card:', cards[0]);
  
  // 验证数据是否从 localStorage 成功加载
  const hasExistingData = cards.length > 0 && cards.some(c => c.createdDate || c.stageIndex > 0);
  if (hasExistingData) {
    const learnedCount = cards.filter(c => c.stageIndex === 6).length;
    const inProgressCount = cards.filter(c => c.stageIndex > 0 && c.stageIndex < 6).length;
    console.log(`✓ 数据已从本地存储加载：共 ${cards.length} 个汉字，${learnedCount} 个已学会，${inProgressCount} 个学习中`);
  } else {
    console.log('ℹ 首次使用，已初始化默认数据');
  }
  
  // Load settings from localStorage
  settings = {
    dailyNew: Number(localStorage.getItem('dailyNew') || DEFAULTS.dailyNew),
    stage1Limit: Number(localStorage.getItem('stage1Limit') || DEFAULTS.stage1Limit),
    stage2Limit: Number(localStorage.getItem('stage2Limit') || DEFAULTS.stage2Limit),
    stage3Limit: Number(localStorage.getItem('stage3Limit') || DEFAULTS.stage3Limit),
    stage4Limit: Number(localStorage.getItem('stage4Limit') || DEFAULTS.stage4Limit),
    stage5Limit: Number(localStorage.getItem('stage5Limit') || DEFAULTS.stage5Limit),
    randomCheckLimit: Number(localStorage.getItem('randomCheckLimit') || DEFAULTS.randomCheckLimit)
  };
  console.log('Settings loaded:', settings);
  
  // Set up event listeners
  document.getElementById('importBtn').addEventListener('click', ()=> {
    document.getElementById('importModal').style.display='flex';
  });
  document.getElementById('doImport').addEventListener('click', ()=> {
    const t = document.getElementById('importArea').value;
    importText(t);
    document.getElementById('importArea').value='';
    document.getElementById('importModal').style.display='none';
  });
  document.getElementById('closeImport').addEventListener('click', ()=> document.getElementById('importModal').style.display='none');

  document.getElementById('settingsBtn').addEventListener('click', ()=>{
    document.getElementById('inputDailyNew').value = settings.dailyNew;
    document.getElementById('inputStage1Limit').value = settings.stage1Limit;
    document.getElementById('inputStage2Limit').value = settings.stage2Limit;
    document.getElementById('inputStage3Limit').value = settings.stage3Limit;
    document.getElementById('inputStage4Limit').value = settings.stage4Limit;
    document.getElementById('inputStage5Limit').value = settings.stage5Limit;
    document.getElementById('inputRandomCheckLimit').value = settings.randomCheckLimit;
    document.getElementById('settingsModal').style.display='flex';
  });
  document.getElementById('saveSettings').addEventListener('click', ()=>{
    settings.dailyNew = Number(document.getElementById('inputDailyNew').value) || DEFAULTS.dailyNew;
    settings.stage1Limit = Number(document.getElementById('inputStage1Limit').value) || DEFAULTS.stage1Limit;
    settings.stage2Limit = Number(document.getElementById('inputStage2Limit').value) || DEFAULTS.stage2Limit;
    settings.stage3Limit = Number(document.getElementById('inputStage3Limit').value) || DEFAULTS.stage3Limit;
    settings.stage4Limit = Number(document.getElementById('inputStage4Limit').value) || DEFAULTS.stage4Limit;
    settings.stage5Limit = Number(document.getElementById('inputStage5Limit').value) || DEFAULTS.stage5Limit;
    settings.randomCheckLimit = Number(document.getElementById('inputRandomCheckLimit').value) || DEFAULTS.randomCheckLimit;
    
    // Save to localStorage
    localStorage.setItem('dailyNew', String(settings.dailyNew));
    localStorage.setItem('stage1Limit', String(settings.stage1Limit));
    localStorage.setItem('stage2Limit', String(settings.stage2Limit));
    localStorage.setItem('stage3Limit', String(settings.stage3Limit));
    localStorage.setItem('stage4Limit', String(settings.stage4Limit));
    localStorage.setItem('stage5Limit', String(settings.stage5Limit));
    localStorage.setItem('randomCheckLimit', String(settings.randomCheckLimit));
    
    document.getElementById('settingsModal').style.display='none';
    computeAndRender();
    if (currentOpenBox !== null) showBox(currentOpenBox);
  });
  document.getElementById('closeSettings').addEventListener('click', ()=> {
    document.getElementById('settingsModal').style.display='none';
  });
  document.querySelectorAll('.boxBtn').forEach(b=>b.addEventListener('click', ()=> {
    const stage = Number(b.dataset.stage);
    // Toggle: if clicking the same box that's already open, close it
    if (currentOpenBox === stage) {
      boxContent.innerHTML = '';
      currentOpenBox = null;
      // Remove box-open class from all boxes
      document.querySelectorAll('.treasure-box').forEach(box => {
        box.classList.remove('box-open');
      });
    } else {
      showBox(stage);
    }
  }));
  document.getElementById('randCheckBtn').addEventListener('click', randomCheck);
  
  // Learned card view button handler
  const viewLearnedBtn = document.getElementById('viewLearnedBtn');
  if (viewLearnedBtn) {
    viewLearnedBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showLearnedCards();
    });
  }
  
  // Export data button - export all data to JSON file
  document.getElementById('exportBtn').addEventListener('click', ()=> {
    try {
      const dataToExport = {
        cards: cards,
        settings: settings,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      const jsonStr = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hanzi-learning-backup-${todayDateStr()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('数据已导出！文件已下载到你的下载文件夹。');
    } catch (e) {
      console.error('导出失败:', e);
      alert('导出失败：' + e.message);
    }
  });

  // Import data button - import data from JSON file
  document.getElementById('importDataBtn').addEventListener('click', ()=> {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          
          // 验证数据格式
          if (!imported.cards || !Array.isArray(imported.cards)) {
            throw new Error('数据格式不正确：缺少 cards 数组');
          }
          
          // 确认导入
          const cardCount = imported.cards.length;
          const learnedCount = imported.cards.filter(c => c.stageIndex === 6).length;
          const confirmMsg = `即将导入 ${cardCount} 个汉字的学习数据（其中 ${learnedCount} 个已学会）。\n\n这将覆盖当前所有数据！\n\n确定要继续吗？`;
          
          if (!confirm(confirmMsg)) {
            return;
          }
          
          // 导入数据
          cards = imported.cards;
          if (imported.settings) {
            settings = { ...settings, ...imported.settings };
            // 保存设置到 localStorage
            Object.keys(settings).forEach(key => {
              localStorage.setItem(key, String(settings[key]));
            });
          }
          
          // 保存到 localStorage
          saveAll();
          
          alert(`导入成功！已导入 ${cardCount} 个汉字的学习数据。`);
          computeAndRender();
          if (currentOpenBox !== null) showBox(currentOpenBox);
        } catch (e) {
          console.error('导入失败:', e);
          alert('导入失败：' + e.message + '\n\n请确保文件格式正确。');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });

  // Reset button - clear all data and start fresh
  document.getElementById('resetBtn').addEventListener('click', ()=> {
    if (confirm('确定要重置所有数据吗？这将清除所有学习进度，包括所有汉字的学习状态。此操作不可恢复！\n\n建议先导出数据备份。')) {
      if (confirm('再次确认：真的要重置吗？所有数据将被清除！')) {
        localStorage.clear();
        alert('数据已清除！页面将刷新，请重新开始学习。');
        location.reload();
      }
    }
  });

  document.addEventListener('click', (e)=> {
    const root = document.getElementById('modalRoot');
    if (root.style.display==='block' && e.target.classList.contains('overlay')) {
      root.style.display='none';
    }
  });
  
  // Render
  computeAndRender();
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM is already ready
  init();
}

// 页面卸载前保存
window.addEventListener('beforeunload', ()=> {
  if (cards && cards.length > 0) {
    saveAll();
    console.log('页面关闭前数据已保存');
  }
});

// 定期自动保存（每30秒）
setInterval(() => {
  if (cards && cards.length > 0) {
    saveAll();
  }
}, 30000);

// 页面可见性变化时保存（切换标签页时）
document.addEventListener('visibilitychange', () => {
  if (document.hidden && cards && cards.length > 0) {
    saveAll();
    console.log('切换标签页时数据已保存');
  }
});

// 验证 localStorage 可用性
function verifyLocalStorage() {
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error('localStorage 不可用:', e);
    return false;
  }
}

// 页面加载时验证 localStorage
if (typeof Storage !== 'undefined') {
  if (verifyLocalStorage()) {
    console.log('✓ localStorage 可用，数据将持久保存');
  } else {
    console.warn('⚠ localStorage 可能不可用，数据可能无法保存');
    alert('警告：浏览器存储可能不可用，数据可能无法保存。请检查浏览器设置。');
  }
} else {
  console.error('浏览器不支持 localStorage');
  alert('错误：您的浏览器不支持本地存储，数据无法保存。请使用现代浏览器（Chrome、Firefox、Safari、Edge）。');
}

// Expose debug helper for console usage
window.debugTasksForDate = debugTasksForDate;
