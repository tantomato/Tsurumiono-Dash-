// 歩く・走る所要時間（分）
const WALK_TIME = 6;
const RUN_TIME  = 4;

// ボタンと結果表示領域
const btn    = document.getElementById('checkBtn');
const result = document.getElementById('result');

// メイン処理
async function checkTime() {
  // JSON 取得
  const res  = await fetch('timetable.json');
  const data = await res.json();

  const now = new Date();
  const day = now.getDay(); // 0=日曜,6=土曜
  const list = (day === 0 || day === 6) ? data.holiday : data.weekday;

  // 1) 時刻文字列リスト → Dateオブジェクトの配列に変換
  const times = list.map(t => {
    const [h, m] = t.split(':').map(Number);
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    return d;
  });

  // 2) 現在時刻より後のものだけを抽出
  const upcoming = times.filter(d => d > now);

  // 3) 先頭2つを取得
  const nextTrain   = upcoming[0] || null;
  const secondTrain = upcoming[1] || null;

  // 終電ナシ
  if (!nextTrain) {
    result.textContent = '終電、なくなっちゃったね///';
    result.className = 'miss';
    return;
  }

  // 時差（分）
  const diffMin = (nextTrain - now) / 1000 / 60;

  // メイン表示判定
  let text, cls;
  if (diffMin >= WALK_TIME) {
    text = `あと ${diffMin.toFixed(1)}分 → 歩いておｋ`;
    cls = 'walk';
  }
  else if (diffMin >= RUN_TIME) {
    text = `あと ${diffMin.toFixed(1)}分 → 走れ！`;
    cls = 'run';
  }
  else {
    text = `あと ${diffMin.toFixed(1)}分 → あきらめろ`;
    cls = 'miss';
  }

  // 発車時刻を追記
  text += ` (${formatTime(nextTrain)}発)`;

  // 次の次があれば追加表示
  if (secondTrain) {
    text += ` ／ 次の次 → ${formatTime(secondTrain)}`;
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
