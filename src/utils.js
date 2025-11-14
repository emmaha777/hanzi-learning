// 公共工具函数
export function todayDateStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  return `${yyyy}-${mm}-${dd}`;
}
export function parseDateStr(s) { return new Date(s + "T00:00:00"); }
export function addDaysToDateStr(s, days) {
  const d = parseDateStr(s);
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  return `${yyyy}-${mm}-${dd}`;
}
export function uid() { return Math.random().toString(36).slice(2,10); }
