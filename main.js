// main.js
const WALK_MINUTES = 3;
const RUN_MINUTES = 2;
let timetableData = null;

async function initializeApp() {
  try {
    const response = await fetch('timetable.json');
    const rawData = await response.json();
    timetableData = processTimetable(rawData);
    updateDisplay();
    startAutoUpdate();
  } catch (error) {
    console.error('データの読み込みに失敗しました:', error);
    showError('時刻表情報の取得に失敗しました');
  }
}

function processTimetable(rawData) {
  const processed = { weekday: [], holiday: [] };
  
  const processHours = (hoursObj) => {
    const times = [];
    for (const [hour, minutes] of Object.entries(hoursObj)) {
      minutes.forEach(min => {
        times.push(`${hour.padStart(2, '0')}:${min.padStart(2, '0')}`);
      });
    }
    return times.sort();
  };

  processed.weekday = processHours(rawData.weekday);
  processed.holiday = processHours(rawData.holiday);
  
  return processed;
}

function findNextTrains(now) {
  const isHoliday = [0, 6].includes(now.getDay());
  const schedule = timetableData[isHoliday ? 'holiday' : 'weekday'];
  
  const currentTime = now.toTimeString().substr(0,5);
  const nextIndex = schedule.findIndex(time => time > currentTime);
  
  if (nextIndex === -1) return null;
  
  return {
    next: schedule[nextIndex],
    upcoming: schedule.slice(nextIndex, nextIndex + 3)
  };
}

function calculateStatus(now, departureTime) {
  const departsAt = new Date(now);
  const [h, m] = departureTime.split(':');
  departsAt.setHours(h, m, 0, 0);
  
  const diffMs = departsAt - now;
  const diffMinutes = diffMs / 1000 / 60;
  
  if (diffMinutes >= WALK_MINUTES) return 'walk';
  if (diffMinutes >= RUN_MINUTES) return 'run';
  return 'miss';
}

function updateDisplay() {
  const now = new Date();
  const trains = findNextTrains(now);
  
  // 現在時刻表示
  document.getElementById('current-time').textContent = 
    `現在時刻: ${now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;

  if (!trains) {
    showNoTrains();
    return;
  }

  const status = calculateStatus(now, trains.next);
  updateStatusBox(status, trains.next);
  updateTrainList(trains.upcoming);
}

function updateStatusBox(status, nextTime) {
  const box = document.getElementById('status-box');
  const messageEl = document.getElementById('result-message');
  
  const messages = {
    walk: `🚶♀️ 歩いてOK！ (${nextTime}発)`,
    run: `🏃♂️ 走ればOK！ (${nextTime}発)`,
    miss: `😢 間に合いません (${nextTime}発)`
  };

  box.className = `walk-bg ${status}-bg`;
  messageEl.textContent = messages[status];
}

function updateTrainList(upcoming) {
  const listEl = document.getElementById('train-list');
  listEl.innerHTML = upcoming.map(time => `
    <li class="train-item">
      <span>${time} 発</span>
      <span>${calculateRemainingTime(time)}</span>
    </li>
  `).join('');
}

function calculateRemainingTime(targetTime) {
  const now = new Date();
  const [h, m] = targetTime.split(':');
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  
  const diffMs = target - now;
  const minutes = Math.floor(diffMs / 1000 / 60);
  return `${minutes}分後`;
}

function showNoTrains() {
  document.getElementById('result-message').textContent = '本日の運行は終了しました';
  document.getElementById('status-box').className = 'miss-bg';
  document.getElementById('train-list').innerHTML = '';
}

function showError(message) {
  const box = document.getElementById('status-box');
  box.style.backgroundColor = '#ff4444';
  document.getElementById('result-message').textContent = message;
}

function startAutoUpdate() {
  setInterval(updateDisplay, 1000);
}

// アプリ起動
initializeApp();
