const dial = document.querySelector("#dial");
const labels = document.querySelector("#labels");
const time = document.querySelector("#time");
const startButton = document.querySelector("#start");
const resetButton = document.querySelector("#reset");

const maxMinutes = 4 * 60;
let intervalId = null;
let alarmIntervalId = null;
let selectedMinutes = 25;
let totalSeconds = selectedMinutes * 60;
let remainingSeconds = totalSeconds;
let lastDragAngle = null;
let dragMinutes = selectedMinutes;
let audioContext = null;

function buildDialMarks() {
  const marks = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  labels.innerHTML = marks
    .map((value) => {
      const angle = value * -6;
      return `<span class="tick" style="--angle: ${angle}deg"></span><span class="label" style="--angle: ${angle}deg">${value}</span>`;
    })
    .join("");
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(restSeconds).padStart(2, "0")}`;
}

function getAngleFromPointer(event) {
  const rect = dial.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const x = event.clientX - centerX;
  const y = event.clientY - centerY;
  const angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
  return (360 - angle) % 360;
}

function getMinutesFromAngle(angle) {
  const minutes = Math.round(angle / 6);

  return minutes === 0 ? 60 : minutes;
}

function getShortestAngleDelta(previousAngle, nextAngle) {
  return ((nextAngle - previousAngle + 540) % 360) - 180;
}

function ensureAudioContext() {
  if (audioContext === null) {
    audioContext = new AudioContext();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function playBeep(startTime, frequency) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(0.32, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.32);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + 0.35);
}

function playAlarm() {
  ensureAudioContext();

  const now = audioContext.currentTime;
  playBeep(now, 880);
  playBeep(now + 0.4, 880);
  playBeep(now + 0.8, 1046);
  playBeep(now + 1.2, 1046);
  playBeep(now + 1.6, 880);
  playBeep(now + 2, 1175);
}

function startAlarm() {
  playAlarm();
  alarmIntervalId = setInterval(playAlarm, 2800);
  startButton.textContent = "Stop";
  dial.classList.add("is-alarming");
}

function stopAlarm() {
  clearInterval(alarmIntervalId);
  alarmIntervalId = null;
  dial.classList.remove("is-alarming");
}

function setTimerMinutes(minutes) {
  selectedMinutes = Math.min(Math.max(minutes, 1), maxMinutes);
  totalSeconds = selectedMinutes * 60;
  remainingSeconds = totalSeconds;
  updateUi();
}

function updateUi() {
  const progress = totalSeconds === 0 ? 0 : remainingSeconds / totalSeconds;
  const hourSeconds = 60 * 60;
  const secondsInCurrentHour = remainingSeconds > hourSeconds ? remainingSeconds % hourSeconds : remainingSeconds;
  const dialDegrees = remainingSeconds >= hourSeconds ? 360 : (remainingSeconds / hourSeconds) * 360;
  const handDegrees = (secondsInCurrentHour / hourSeconds) * 360;
  const elapsed = 1 - progress;
  const hue = 120 - elapsed * 120;
  const color = `hsl(${hue}, 78%, 42%)`;

  time.textContent = formatTime(remainingSeconds);
  dial.style.setProperty("--accent", color);
  dial.style.setProperty("--degrees", `${dialDegrees}deg`);
  dial.style.setProperty("--hand-degrees", `${-handDegrees}deg`);
}

function stopTimer() {
  clearInterval(intervalId);
  intervalId = null;
  startButton.textContent = "Start";
  dial.classList.remove("is-running");
}

function resetTimer() {
  stopTimer();
  stopAlarm();
  setTimerMinutes(selectedMinutes);
}

function tick() {
  remainingSeconds -= 1;

  if (remainingSeconds <= 0) {
    remainingSeconds = 0;
    stopTimer();
    startAlarm();
  }

  updateUi();
}

startButton.addEventListener("click", () => {
  if (alarmIntervalId !== null) {
    stopAlarm();
    startButton.textContent = "Start";
    return;
  }

  if (intervalId !== null) {
    stopTimer();
    return;
  }

  ensureAudioContext();

  if (remainingSeconds === 0) {
    resetTimer();
  }

  intervalId = setInterval(tick, 1000);
  startButton.textContent = "Pause";
  dial.classList.add("is-running");
  updateUi();
});

resetButton.addEventListener("click", resetTimer);

dial.addEventListener("pointerdown", (event) => {
  if (intervalId !== null || alarmIntervalId !== null) {
    return;
  }

  stopTimer();
  dial.classList.add("is-dragging");
  dial.setPointerCapture(event.pointerId);
  lastDragAngle = getAngleFromPointer(event);
  setTimerMinutes(Math.floor((selectedMinutes - 1) / 60) * 60 + getMinutesFromAngle(lastDragAngle));
  dragMinutes = selectedMinutes;
});

dial.addEventListener("pointermove", (event) => {
  if (!dial.classList.contains("is-dragging")) {
    return;
  }

  const nextAngle = getAngleFromPointer(event);
  const delta = getShortestAngleDelta(lastDragAngle, nextAngle);

  dragMinutes += delta / 6;
  lastDragAngle = nextAngle;
  setTimerMinutes(Math.round(dragMinutes));
});

dial.addEventListener("pointerup", (event) => {
  dial.classList.remove("is-dragging");
  dial.releasePointerCapture(event.pointerId);
  lastDragAngle = null;
  dragMinutes = selectedMinutes;
});

dial.addEventListener("pointercancel", (event) => {
  dial.classList.remove("is-dragging");
  dial.releasePointerCapture(event.pointerId);
  lastDragAngle = null;
  dragMinutes = selectedMinutes;
});

buildDialMarks();
updateUi();
