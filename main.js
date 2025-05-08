// 歩く・走る所要時間（分）
const WALK_TIME = 6;
const RUN_TIME  = 4;

// ボタンと結果表示領域
const btn    = document.getElementById('checkBtn');
const result = document.getElementById('result');

// メイン処理
async function checkTime() {
  // JSON 取得
  const res = await fetch('timetable.json');
  const data = await res.json();

  const now = new Date();
  // 平日 or 休日 の判定
  const day = now.getDay(); // 0=日曜, 6=土曜
  const list = (day === 0 || day === 6) ? data.holiday : data.weekday;

  // 次発を検索
  let nextTrain = null;
  for (let t of list) {
    const [h,m] = t.split(':').map(Number);
    const dep = new Date(now);
    dep.setHours(h, m, 0, 0);
    if (dep > now) { nextTrain = dep; break; }
  }

  if (!nextTrain) {
    result.textContent = '終電、なくなっちゃったね///';
    result.className = 'miss';
    return;
  }

  // 時間差（ミリ秒）
  const diffMs = nextTrain - now;
  const diffMin = diffMs / 1000 / 60;

  // 判定
  let text, cls;
  if (diffMin >= WALK_TIME) {
    text = `あと ${diffMin.toFixed(6)}分 → 歩いておｋ (${formatTime(nextTrain)}発)`;
    cls = 'walk';
  }
  else if (diffMin >= RUN_TIME) {
    text = `あと ${diffMin.toFixed(4)}分 → 走れ！!! (${formatTime(nextTrain)}発)`;
    cls = 'run';
  }
  else {
    text = `あと ${diffMin.toFixed(3)}分 → あきらめろ (${formatTime(nextTrain)}発)`;
    cls = 'miss';
  }

  result.textContent = text;
  result.className = cls;
}

// HH:MM 形式にフォーマット
function formatTime(d) {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

// ボタン・ロード時に実行
btn.addEventListener('click', checkTime);
window.addEventListener('load', checkTime);
