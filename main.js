const WALK_TIME = 6;
const RUN_TIME  = 4;
const btn    = document.getElementById('checkBtn');
const info   = document.getElementById('info');
const result = document.getElementById('result');

async function checkTime() {
  const res  = await fetch('timetable.json');
  const data = await res.json();
  const now  = new Date();
  const day  = now.getDay();
  const list = (day === 0 || day === 6) ? data.holiday : data.weekday;

  // 時刻リストをDate化、現在以降のみ抽出
  const times = list.map(t => {
    const [h, m] = t.split(':').map(Number);
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    return d;
  }).filter(d => d > now);

  const nextTrain   = times[0] || null;
  const secondTrain = times[1] || null;

  // 終電なし
  if (!nextTrain) {
    info.textContent   = '';
    result.textContent = '終電、なくなっちゃったね///';
    result.className   = 'miss';
    return;
  }

  const diffMin = (nextTrain - now) / 1000 / 60;
  let status, cls;

  if (diffMin >= WALK_TIME) {
    status = 'Walk';
    cls    = 'walk';
  }
  else if (diffMin >= RUN_TIME) {
    status = 'Dash!!!';
    cls    = 'run';
  }
  else {
    status = 'Give up!!!!!';
    cls    = 'miss';
  }

  // ボックス外のテキスト
  let infoText = `In ${diffMin.toFixed(1)}min (${formatTime(nextTrain)} Dep.)`;
  if (secondTrain) {
    infoText += `<br>Following → ${formatTime(secondTrain)}`;
  }
  info.innerHTML   = infoText;

  // ボックス内のステータス
  result.textContent = status;
  result.className   = ｀result ${cls1}`;
}

function formatTime(d) {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

btn.addEventListener('click', checkTime);
window.addEventListener('load', checkTime);
