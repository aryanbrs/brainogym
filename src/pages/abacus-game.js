import "../styles/tokens.css";
import "../styles/base.css";
import "../styles/components.css";
import "../styles/abacus-game.css";
import { renderHeader } from "../components/header.js";
import { renderFooter } from "../components/footer.js";
import { initNavigation } from "../components/navigation.js";

const STORE_KEY = "brainogym.abacus.v1";
const PLACE_LABELS = ["Units", "Tens", "Hundreds", "Thousands"];

const LEVELS = [
  { id: 1, title: "Single Digit Formation", rods: 1, mode: "form", minAccuracy: 75, count: 8, hints: true },
  { id: 2, title: "Two Digit Formation", rods: 2, mode: "form", minAccuracy: 75, count: 8, hints: true },
  { id: 3, title: "Addition Without Carry", rods: 2, mode: "strict", op: "addNoCarry", minAccuracy: 80, count: 6, hints: true },
  { id: 4, title: "Subtraction Without Borrow", rods: 2, mode: "strict", op: "subNoBorrow", minAccuracy: 80, count: 6, hints: true },
  { id: 5, title: "Addition With Carry", rods: 2, mode: "strict", op: "addCarry", minAccuracy: 82, count: 6, hints: true },
  { id: 6, title: "Subtraction With Borrow", rods: 2, mode: "strict", op: "subBorrow", minAccuracy: 82, count: 6, hints: true },
  { id: 7, title: "Mixed Operations", rods: 3, mode: "solve", op: "mixed", minAccuracy: 85, count: 8, hints: false, timeLimit: 160 },
  { id: 8, title: "Speed Practice", rods: 3, mode: "solve", op: "mixed", minAccuracy: 88, count: 10, hints: false, timeLimit: 120 },
  { id: 9, title: "Mental Flash Mode", rods: 3, mode: "mental", minAccuracy: 85, count: 8, hints: false, timeLimit: 120 },
  { id: 10, title: "Master Challenge", rods: 4, mode: "master", op: "mixed", minAccuracy: 90, count: 10, hints: false, timeLimit: 90 },
];

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
  progress: null,
  settings: null,
  currentLevel: 1,
  levelSession: null,
  timerRef: null,
  timerLeft: 0,
  currentDigits: [0, 0, 0, 0],
  boardHidden: false,
  dragState: null,
  mentalRevealRef: null,
  mentalTickRef: null,
};

function defaultProgress() {
  const levels = {};
  LEVELS.forEach((level) => {
    levels[level.id] = {
      completed: false,
      bestAccuracy: 0,
      bestTimeSec: null,
      attempts: 0,
      mistakes: {
        wrongRod: 0,
        wrongBeadType: 0,
        illegalMove: 0,
        wrongState: 0,
        sequenceError: 0,
      },
    };
  });
  return {
    unlockedLevel: 1,
    levels,
  };
}

function normalizeProgress(progress) {
  const base = defaultProgress();
  if (!progress || typeof progress !== "object") return base;

  const unlockedRaw = Number(progress.unlockedLevel) || 1;
  base.unlockedLevel = Math.min(LEVELS.length, Math.max(1, unlockedRaw));

  LEVELS.forEach((level) => {
    const incoming = progress.levels?.[level.id] || {};
    base.levels[level.id] = {
      ...base.levels[level.id],
      ...incoming,
      bestAccuracy: Math.max(0, Math.min(100, Number(incoming.bestAccuracy) || 0)),
      attempts: Math.max(0, Number(incoming.attempts) || 0),
      bestTimeSec:
        incoming.bestTimeSec === null || incoming.bestTimeSec === undefined
          ? null
          : Math.max(0, Number(incoming.bestTimeSec) || 0),
      mistakes: {
        ...base.levels[level.id].mistakes,
        ...(incoming.mistakes || {}),
      },
    };
  });

  return base;
}

function loadStore() {
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) {
    state.progress = defaultProgress();
    state.settings = { soundOn: true };
    persistStore();
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    state.progress = normalizeProgress(parsed.progress);
    state.settings = { soundOn: parsed.settings?.soundOn !== false };
  } catch {
    state.progress = defaultProgress();
    state.settings = { soundOn: true };
    persistStore();
  }
}

function persistStore() {
  localStorage.setItem(
    STORE_KEY,
    JSON.stringify({
      progress: state.progress,
      settings: state.settings,
    })
  );
}

function playTone(kind) {
  if (!state.settings.soundOn) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;

  try {
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = kind === "ok" ? "triangle" : "sawtooth";
    osc.frequency.value = kind === "ok" ? 640 : 220;
    gain.gain.value = 0.05;
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // Silent fallback if audio context is blocked by browser policy.
  }
}

function digitsToNumber(digits, rods) {
  let n = 0;
  for (let i = 0; i < rods; i += 1) n += digits[i] * 10 ** i;
  return n;
}

function numberToDigits(number, rods) {
  const out = [0, 0, 0, 0];
  let n = number;
  for (let i = 0; i < rods; i += 1) {
    out[i] = n % 10;
    n = Math.floor(n / 10);
  }
  return out;
}

function cloneDigits(d = state.currentDigits) {
  return [d[0], d[1], d[2], d[3]];
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getLevelById(id) {
  return LEVELS.find((lvl) => lvl.id === id);
}

function isLevelUnlocked(id) {
  return id <= state.progress.unlockedLevel;
}

function setNodeText(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
}

function setFeedback(text, kind = "neutral") {
  const node = document.querySelector("[data-feedback]");
  if (!node) return;
  node.textContent = text;
  node.className = `feedback ${kind === "ok" ? "good" : kind === "bad" ? "bad" : ""}`;
  node.classList.remove("pulse");
  void node.offsetWidth;
  node.classList.add("pulse");
}

function bumpMistake(type) {
  const stat = state.progress.levels[state.currentLevel];
  if (stat?.mistakes?.[type] !== undefined) stat.mistakes[type] += 1;
}

function applyMoveVirtual(digits, rod, delta, allowCarryBorrow) {
  const out = cloneDigits(digits);
  if (rod < 0 || rod > 3) return null;
  const next = out[rod] + delta;

  if (next >= 0 && next <= 9) {
    out[rod] = next;
    return out;
  }

  if (!allowCarryBorrow) return null;

  if (next > 9) {
    if (rod + 1 > 3) return null;
    out[rod] = next - 10;
    out[rod + 1] += 1;
    if (out[rod + 1] > 9) return null;
    return out;
  }

  if (next < 0) {
    if (rod + 1 > 3 || out[rod + 1] <= 0) return null;
    out[rod] = next + 10;
    out[rod + 1] -= 1;
    return out;
  }

  return null;
}

function applyMove(rod, delta, allowCarryBorrow = false) {
  const next = applyMoveVirtual(state.currentDigits, rod, delta, allowCarryBorrow);
  if (!next) return false;
  state.currentDigits = next;
  if (state.levelSession) {
    state.levelSession.lastMove = { rod, delta, at: Date.now() };
  }
  return true;
}

function makeAddSteps(startDigits, addDigits, rods, allowCarryBorrow) {
  const steps = [];
  let cur = cloneDigits(startDigits);
  for (let rod = 0; rod < rods; rod += 1) {
    let rem = addDigits[rod];
    while (rem > 0) {
      const step = { rod, delta: 1 };
      const next = applyMoveVirtual(cur, rod, 1, allowCarryBorrow);
      if (!next) break;
      steps.push(step);
      cur = next;
      rem -= 1;
    }
  }
  return steps;
}

function makeSubSteps(startDigits, subDigits, rods, allowCarryBorrow) {
  const steps = [];
  let cur = cloneDigits(startDigits);
  for (let rod = 0; rod < rods; rod += 1) {
    let rem = subDigits[rod];
    while (rem > 0) {
      const step = { rod, delta: -1 };
      const next = applyMoveVirtual(cur, rod, -1, allowCarryBorrow);
      if (!next) break;
      steps.push(step);
      cur = next;
      rem -= 1;
    }
  }
  return steps;
}

function generateOperation(level) {
  const rods = level.rods;

  if (level.op === "addNoCarry") {
    let a = 0;
    let b = 0;
    while (true) {
      a = rand(10, 49);
      b = rand(10, 39);
      const ad = numberToDigits(a, rods);
      const bd = numberToDigits(b, rods);
      if (ad[0] + bd[0] < 10 && ad[1] + bd[1] < 10) break;
    }

    const startDigits = numberToDigits(a, rods);
    const addDigits = numberToDigits(b, rods);
    const targetNumber = a + b;
    return {
      prompt: `Start at ${a}. Add ${b} on the abacus.`,
      explain: "Addition without carry means each rod stayed below 10.",
      startDigits,
      targetDigits: numberToDigits(targetNumber, rods),
      steps: makeAddSteps(startDigits, addDigits, rods, false),
      strict: true,
      allowCarryBorrow: false,
    };
  }

  if (level.op === "subNoBorrow") {
    let a = 0;
    let b = 0;
    while (true) {
      a = rand(30, 89);
      b = rand(10, 49);
      const ad = numberToDigits(a, rods);
      const bd = numberToDigits(b, rods);
      if (ad[0] >= bd[0] && ad[1] >= bd[1]) break;
    }

    const startDigits = numberToDigits(a, rods);
    const subDigits = numberToDigits(b, rods);
    return {
      prompt: `Start at ${a}. Subtract ${b} by removing beads.`,
      explain: "Subtraction without borrow means every rod had enough beads to remove directly.",
      startDigits,
      targetDigits: numberToDigits(a - b, rods),
      steps: makeSubSteps(startDigits, subDigits, rods, false),
      strict: true,
      allowCarryBorrow: false,
    };
  }

  if (level.op === "addCarry") {
    let a = 0;
    let b = 0;
    while (true) {
      a = rand(15, 79);
      b = rand(6, 29);
      const ad = numberToDigits(a, rods);
      const bd = numberToDigits(b, rods);
      if (ad[0] + bd[0] >= 10) break;
    }

    const startDigits = numberToDigits(a, rods);
    const addDigits = numberToDigits(b, rods);
    return {
      prompt: `Start at ${a}. Add ${b}. Watch carry from units to tens.`,
      explain: "Carry happens when a rod crosses 9 and resets while the next rod increases by 1.",
      startDigits,
      targetDigits: numberToDigits(a + b, rods),
      steps: makeAddSteps(startDigits, addDigits, rods, true),
      strict: true,
      allowCarryBorrow: true,
    };
  }

  if (level.op === "subBorrow") {
    let a = 0;
    let b = 0;
    while (true) {
      a = rand(30, 95);
      b = rand(11, 39);
      if (a <= b) continue;
      const ad = numberToDigits(a, rods);
      const bd = numberToDigits(b, rods);
      if (ad[0] < bd[0]) break;
    }

    const startDigits = numberToDigits(a, rods);
    const subDigits = numberToDigits(b, rods);
    return {
      prompt: `Start at ${a}. Subtract ${b}. Use borrow when needed.`,
      explain: "Borrow happens when a rod is short and you break 1 from the next place value.",
      startDigits,
      targetDigits: numberToDigits(a - b, rods),
      steps: makeSubSteps(startDigits, subDigits, rods, true),
      strict: true,
      allowCarryBorrow: true,
    };
  }

  if (level.mode === "mental") {
    const n = rand(30, 999);
    return {
      prompt: "Flash mode: memorize the abacus value and enter the number when hidden.",
      explain: "Mental abacus needs visualization. See, hold, then answer.",
      startDigits: numberToDigits(n, level.rods),
      targetDigits: numberToDigits(n, level.rods),
      answerNumber: n,
      strict: false,
      allowCarryBorrow: false,
    };
  }

  const add = Math.random() >= 0.5;
  if (add) {
    const a = rand(100, 699);
    const b = rand(20, 199);
    return {
      prompt: `Start at ${a}. Add ${b}.`,
      explain: "Check place value transitions carefully.",
      startDigits: numberToDigits(a, level.rods),
      targetDigits: numberToDigits(a + b, level.rods),
      strict: false,
      allowCarryBorrow: true,
    };
  }

  const a = rand(220, 899);
  let b = rand(20, 199);
  if (b >= a) b = Math.floor(a / 2);
  return {
    prompt: `Start at ${a}. Subtract ${b}.`,
    explain: "Borrow if any rod does not have enough beads.",
    startDigits: numberToDigits(a, level.rods),
    targetDigits: numberToDigits(a - b, level.rods),
    strict: false,
    allowCarryBorrow: true,
  };
}

function generateQuestion(level) {
  if (level.id === 1) {
    const target = rand(0, 9);
    return {
      prompt: `Form the number ${target} on the Units rod.`,
      explain: "Single digit uses one rod: lower beads count 1s and upper bead counts 5.",
      startDigits: [0, 0, 0, 0],
      targetDigits: [target, 0, 0, 0],
      strict: false,
      allowCarryBorrow: false,
    };
  }

  if (level.id === 2) {
    const target = rand(10, 99);
    return {
      prompt: `Form the number ${target}. Tens rod is place value 10.`,
      explain: "Right rod is Units, left rod is Tens.",
      startDigits: [0, 0, 0, 0],
      targetDigits: numberToDigits(target, 2),
      strict: false,
      allowCarryBorrow: false,
    };
  }

  return generateOperation(level);
}

function buildLevelSession(levelId) {
  const level = getLevelById(levelId);
  const questions = Array.from({ length: level.count }).map(() => generateQuestion(level));
  return {
    levelId,
    index: 0,
    questions,
    correct: 0,
    wrong: 0,
    streak: 0,
    bestStreak: 0,
    startedAt: Date.now(),
    strictStepIndex: 0,
    completed: false,
    lastMove: null,
  };
}

function formatTime(sec) {
  const safe = Math.max(0, sec);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getCurrentLevel() {
  return getLevelById(state.currentLevel);
}

function getCurrentQuestion() {
  if (!state.levelSession) return null;
  return state.levelSession.questions[state.levelSession.index] || null;
}

function computeSessionAccuracy() {
  if (!state.levelSession) return 100;
  const totalActions = state.levelSession.correct + state.levelSession.wrong;
  if (!totalActions) return 100;
  return Math.max(0, Math.round((state.levelSession.correct / totalActions) * 100));
}

function computeSessionScore() {
  if (!state.levelSession) return 0;
  return Math.max(0, state.levelSession.correct * 12 - state.levelSession.wrong * 6 + state.levelSession.bestStreak * 4);
}

function completedLevelsCount() {
  return LEVELS.filter((level) => state.progress.levels[level.id]?.completed).length;
}

function renderLevelButtons() {
  const wrap = document.querySelector("[data-level-grid]");
  if (!wrap) return;

  wrap.innerHTML = LEVELS.map((level) => {
    const stat = state.progress.levels[level.id] || defaultProgress().levels[level.id];
    const locked = !isLevelUnlocked(level.id);
    const active = level.id === state.currentLevel;
    const complete = !!stat.completed;
    const bestAcc = stat.bestAccuracy ? `${stat.bestAccuracy}%` : "--";

    return `
      <button class="level-btn ${locked ? "is-locked" : ""} ${active ? "is-active" : ""} ${complete ? "is-complete" : ""}" data-level-btn="${
      level.id
    }" ${locked ? "disabled" : ""} style="--level-delay:${level.id * 40}ms">
        <div class="level-btn-head">
          <strong>Level ${level.id}</strong>
          <span class="state-badge">${locked ? "Locked" : complete ? "Cleared" : "Open"}</span>
        </div>
        <span class="level-title">${level.title}</span>
        <span class="level-meta">Best accuracy: ${bestAcc}</span>
      </button>
    `;
  }).join("");

  updateJourneyMeter();
}

function beadMarkup(rodIndex, digit, renderStamp) {
  const upperActive = digit >= 5;
  const lowerActive = digit % 5;
  const lastMove = state.levelSession?.lastMove;
  const rodMoved =
    !!lastMove && lastMove.rod === rodIndex && Math.abs(renderStamp - lastMove.at) <= 500;

  return `
    <div class="rod ${rodMoved ? `is-updated ${lastMove.delta > 0 ? "is-up" : "is-down"}` : ""}" data-rod="${rodIndex}">
      <div class="rod-track"></div>
      <div class="upper-zone">
        <button class="bead ${upperActive ? "active" : ""}" data-bead="upper" data-rod="${rodIndex}" aria-label="${
    PLACE_LABELS[rodIndex]
  } upper bead"></button>
      </div>
      <div class="beam"></div>
      <div class="lower-zone">
        ${[0, 1, 2, 3]
          .map(
            (i) =>
              `<button class="bead ${i < lowerActive ? "active" : ""}" data-bead="lower" data-index="${i}" data-rod="${rodIndex}" aria-label="${
                PLACE_LABELS[rodIndex]
              } lower bead ${i + 1}"></button>`
          )
          .join("")}
      </div>
      <div class="rod-label">${PLACE_LABELS[rodIndex]}</div>
    </div>
  `;
}

function renderBoard() {
  const level = getCurrentLevel();
  if (!level) return;

  const board = document.querySelector("[data-abacus-board]");
  if (!board) return;

  const rods = [];
  const stamp = Date.now();
  for (let i = level.rods - 1; i >= 0; i -= 1) {
    rods.push(beadMarkup(i, state.currentDigits[i], stamp));
  }

  board.className = `abacus-board rods-${level.rods}`;
  board.innerHTML = rods.join("");
}

function updateJourneyMeter() {
  const ring = document.querySelector("[data-level-progress]");
  const label = document.querySelector("[data-level-progress-label]");
  if (!ring || !label) return;

  const completed = completedLevelsCount();
  const pct = Math.round((completed / LEVELS.length) * 100);
  ring.style.setProperty("--progress", `${pct}%`);
  label.textContent = `${completed}/${LEVELS.length}`;
}

function syncSessionStats() {
  if (!state.levelSession) return;

  const level = getCurrentLevel();
  const accuracy = computeSessionAccuracy();
  const score = computeSessionScore();
  const qProgressPct = Math.round(((state.levelSession.index + 1) / level.count) * 100);

  setNodeText("[data-accuracy]", `${accuracy}%`);
  setNodeText("[data-session-score]", score.toLocaleString("en-IN"));
  setNodeText("[data-streak]", `${state.levelSession.streak}x`);
  setNodeText("[data-best-streak]", `${state.levelSession.bestStreak}x`);
  setNodeText("[data-mistakes]", String(state.levelSession.wrong));

  const progressBar = document.querySelector("[data-question-progress]");
  if (progressBar) {
    progressBar.style.width = `${Math.max(6, qProgressPct)}%`;
  }
}

function syncMeta() {
  if (!state.levelSession) return;

  const level = getCurrentLevel();
  const question = getCurrentQuestion();
  if (!level || !question) return;

  setNodeText("[data-level-name]", `Level ${level.id}: ${level.title}`);
  setNodeText("[data-level-pill]", `L${level.id}`);
  setNodeText("[data-q-index]", `${state.levelSession.index + 1}/${level.count}`);
  setNodeText("[data-prompt]", question.prompt);
  setNodeText("[data-target]", String(digitsToNumber(question.targetDigits, level.rods)));
  setNodeText("[data-coach-tip]", question.explain);

  const stat = state.progress.levels[level.id];
  setNodeText("[data-attempts]", String(stat?.attempts || 0));
  setNodeText("[data-requirement]", `${level.minAccuracy}%`);
  setNodeText("[data-hints-status]", level.hints ? "Enabled" : "Locked");

  const hintBtn = document.querySelector("[data-hint]");
  if (hintBtn) {
    hintBtn.disabled = !level.hints;
    hintBtn.textContent = level.hints ? "Hint" : "Hints Locked";
  }

  syncSessionStats();
}

function restartClassAnimation(target, className) {
  if (!target) return;
  target.classList.remove(className);
  void target.offsetWidth;
  target.classList.add(className);
}

function triggerArenaFx(kind = "good") {
  const root = document.querySelector("[data-game-root]");
  const layer = document.querySelector("[data-fx-layer]");
  if (!root || !layer) return;

  root.classList.remove("fx-good", "fx-bad");
  void root.offsetWidth;
  root.classList.add(kind === "good" ? "fx-good" : "fx-bad");

  if (prefersReducedMotion) return;

  const colors =
    kind === "good"
      ? ["#ffe389", "#f5c84f", "#a4e097", "#ffc468"]
      : ["#ff9b9b", "#ffcf7a", "#ffd4d4", "#ffb5a7"];

  for (let i = 0; i < 14; i += 1) {
    const particle = document.createElement("span");
    particle.className = "fx-particle";
    const dx = rand(-170, 170);
    const dy = rand(-120, 110);
    const rot = rand(-280, 280);
    particle.style.setProperty("--dx", `${dx}px`);
    particle.style.setProperty("--dy", `${dy}px`);
    particle.style.setProperty("--rot", `${rot}deg`);
    particle.style.setProperty("--bg", colors[rand(0, colors.length - 1)]);
    particle.style.left = `${rand(35, 65)}%`;
    particle.style.top = `${rand(30, 70)}%`;
    layer.appendChild(particle);
    setTimeout(() => particle.remove(), 860);
  }
}

function handleWrong(reason, text) {
  if (!state.levelSession) return;

  state.levelSession.wrong += 1;
  state.levelSession.streak = 0;
  bumpMistake(reason);
  playTone("bad");
  setFeedback(text, "bad");
  triggerArenaFx("bad");

  const panel = document.querySelector("[data-work-panel]");
  restartClassAnimation(panel, "shake");
  syncSessionStats();
}

function handleCorrectMove(message) {
  if (!state.levelSession) return;

  state.levelSession.correct += 1;
  state.levelSession.streak += 1;
  state.levelSession.bestStreak = Math.max(state.levelSession.bestStreak, state.levelSession.streak);
  playTone("ok");
  setFeedback(message, "ok");
  triggerArenaFx("good");

  const panel = document.querySelector("[data-work-panel]");
  restartClassAnimation(panel, "glow");
  syncSessionStats();
}

function getMoveDelta(beadType, index, rod) {
  const digit = state.currentDigits[rod];
  if (beadType === "upper") {
    return digit >= 5 ? -5 : 5;
  }

  const active = digit % 5;
  if (index === active) return 1;
  if (index === active - 1) return -1;
  return null;
}

function nextStrictInstruction() {
  const q = getCurrentQuestion();
  if (!q || !q.strict || !q.steps || q.steps.length === 0) return "";
  if (state.levelSession.strictStepIndex >= q.steps.length) return "Sequence complete. Continue.";
  const step = q.steps[state.levelSession.strictStepIndex];
  const action = step.delta > 0 ? "add" : "remove";
  return `Next move: ${action} 1 on ${PLACE_LABELS[step.rod]}.`;
}

function onBeadAction(rod, beadType, index) {
  const q = getCurrentQuestion();
  if (!q) return;

  const delta = getMoveDelta(beadType, index, rod);
  if (delta === null) {
    handleWrong("wrongBeadType", "That bead cannot move now. Use the bead closest to the bar for +/-1.");
    return;
  }

  if (q.strict && q.steps?.length) {
    const expected = q.steps[state.levelSession.strictStepIndex];
    if (!expected) return;

    if (expected.rod !== rod || expected.delta !== delta) {
      handleWrong("sequenceError", `${nextStrictInstruction()} You must follow the guided sequence.`);
      return;
    }

    const applied = applyMove(rod, delta, q.allowCarryBorrow);
    if (!applied) {
      handleWrong("illegalMove", "Illegal move for current bead state.");
      return;
    }

    state.levelSession.strictStepIndex += 1;
    renderBoard();

    if (state.levelSession.strictStepIndex >= q.steps.length) {
      const level = getCurrentLevel();
      const matched = digitsToNumber(state.currentDigits, level.rods) === digitsToNumber(q.targetDigits, level.rods);
      if (matched) {
        handleCorrectMove(`Correct sequence. ${q.explain}`);
        setTimeout(nextQuestion, 850);
      } else {
        handleWrong("wrongState", "Sequence ended but state is incorrect. Retry this question.");
      }
    } else {
      handleCorrectMove(nextStrictInstruction());
    }
    return;
  }

  const applied = applyMove(rod, delta, q.allowCarryBorrow);
  if (!applied) {
    handleWrong("illegalMove", "Illegal move. Check place value carry/borrow requirement.");
    return;
  }

  renderBoard();
  handleCorrectMove("Move accepted.");
}

function checkCurrentAnswer() {
  const level = getCurrentLevel();
  const q = getCurrentQuestion();
  if (!level || !q) return;

  const value = digitsToNumber(state.currentDigits, level.rods);
  const target = digitsToNumber(q.targetDigits, level.rods);

  if (value === target) {
    handleCorrectMove(`Correct. ${q.explain}`);
    setTimeout(nextQuestion, 720);
    return;
  }

  handleWrong("wrongState", `Current value is ${value}. Target is ${target}. ${q.explain}`);
}

function useHint() {
  const level = getCurrentLevel();
  const q = getCurrentQuestion();
  if (!level || !q || !level.hints) return;

  if (q.strict && q.steps?.length) {
    setFeedback(nextStrictInstruction(), "neutral");
    return;
  }

  const current = digitsToNumber(state.currentDigits, level.rods);
  const target = digitsToNumber(q.targetDigits, level.rods);
  if (target > current) {
    setFeedback("Hint: add beads on the lowest place where values differ.", "neutral");
  } else {
    setFeedback("Hint: remove beads from the rod where you have extra value.", "neutral");
  }
}

function startTimer(seconds) {
  clearInterval(state.timerRef);
  state.timerLeft = seconds;
  setNodeText("[data-time]", formatTime(state.timerLeft));

  state.timerRef = setInterval(() => {
    state.timerLeft -= 1;
    setNodeText("[data-time]", formatTime(Math.max(0, state.timerLeft)));
    if (state.timerLeft <= 0) {
      clearInterval(state.timerRef);
      finishLevel();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(state.timerRef);
  state.timerRef = null;
}

function clearMentalTimers() {
  clearTimeout(state.mentalRevealRef);
  clearInterval(state.mentalTickRef);
  state.mentalRevealRef = null;
  state.mentalTickRef = null;
}

function prepMentalMode(level) {
  const root = document.querySelector("[data-game-root]");
  const countdownNode = document.querySelector("[data-mental-countdown]");
  if (!root || !countdownNode) return;

  if (level.mode !== "mental") {
    root.classList.remove("hidden-board", "show-mental", "show-countdown");
    countdownNode.textContent = "";
    return;
  }

  root.classList.add("hidden-board", "show-countdown");
  let count = 3;
  countdownNode.textContent = String(count);
  setFeedback("Memorize now. The board will hide shortly.", "neutral");

  state.mentalTickRef = setInterval(() => {
    count -= 1;
    countdownNode.textContent = String(Math.max(0, count));
    if (count <= 0) {
      clearInterval(state.mentalTickRef);
      state.mentalTickRef = null;
    }
  }, 800);

  state.mentalRevealRef = setTimeout(() => {
    if (!state.levelSession) return;
    root.classList.remove("show-countdown");
    root.classList.add("show-mental");
    setFeedback("Board hidden. Enter the value mentally.", "neutral");
  }, 2500);
}

function prepareQuestion() {
  const level = getCurrentLevel();
  const q = getCurrentQuestion();
  if (!level || !q) return;

  clearMentalTimers();
  state.currentDigits = cloneDigits(q.startDigits);
  state.levelSession.strictStepIndex = 0;
  state.boardHidden = false;

  const root = document.querySelector("[data-game-root]");
  if (root) root.classList.remove("hidden-board", "show-mental", "show-countdown", "fx-good", "fx-bad");

  const mentalInput = document.querySelector("[data-mental-input]");
  if (mentalInput) mentalInput.value = "";

  renderBoard();
  syncMeta();
  setFeedback(q.strict ? nextStrictInstruction() : "Adjust the abacus and press Check.", "neutral");

  const panel = document.querySelector("[data-work-panel]");
  restartClassAnimation(panel, "question-shift");
  prepMentalMode(level);
}

function nextQuestion() {
  if (!state.levelSession || state.levelSession.completed) return;

  state.levelSession.index += 1;
  if (state.levelSession.index >= state.levelSession.questions.length) {
    finishLevel();
    return;
  }

  prepareQuestion();
}

function finishLevel() {
  if (!state.levelSession || state.levelSession.completed) return;

  clearMentalTimers();
  stopTimer();
  state.levelSession.completed = true;

  const level = getCurrentLevel();
  const stat = state.progress.levels[level.id];
  const accuracy = computeSessionAccuracy();
  const elapsedSec = Math.round((Date.now() - state.levelSession.startedAt) / 1000);
  const score = computeSessionScore();

  stat.attempts += 1;
  stat.bestAccuracy = Math.max(stat.bestAccuracy, accuracy);
  stat.bestTimeSec = stat.bestTimeSec === null ? elapsedSec : Math.min(stat.bestTimeSec, elapsedSec);

  if (accuracy >= level.minAccuracy) {
    stat.completed = true;
    state.progress.unlockedLevel = Math.max(state.progress.unlockedLevel, Math.min(LEVELS.length, level.id + 1));
  }

  persistStore();
  renderLevelButtons();
  syncMeta();

  setFeedback(
    accuracy >= level.minAccuracy
      ? `Level complete in ${formatTime(elapsedSec)}. Accuracy ${accuracy}% and score ${score}. Next level unlocked.`
      : `Accuracy ${accuracy}% is below required ${level.minAccuracy}%. Score ${score}. Retry this level.`,
    accuracy >= level.minAccuracy ? "ok" : "bad"
  );

  setNodeText("[data-q-index]", `${level.count}/${level.count}`);
}

function startLevel(levelId) {
  if (!isLevelUnlocked(levelId)) return;

  clearMentalTimers();
  state.currentLevel = levelId;
  state.levelSession = buildLevelSession(levelId);

  renderLevelButtons();
  const level = getCurrentLevel();

  if (level.timeLimit) {
    startTimer(level.timeLimit);
  } else {
    stopTimer();
    setNodeText("[data-time]", "--:--");
  }

  prepareQuestion();
}

function submitMentalAnswer() {
  const q = getCurrentQuestion();
  if (!q) return;

  const field = document.querySelector("[data-mental-input]");
  const val = parseInt(field?.value || "", 10);

  if (Number.isNaN(val)) {
    handleWrong("wrongState", "Enter a valid number.");
    return;
  }

  if (val === q.answerNumber) {
    handleCorrectMove(`Correct mental answer. ${q.explain}`);
  } else {
    handleWrong("wrongState", `Incorrect. Correct value was ${q.answerNumber}.`);
  }

  setTimeout(nextQuestion, 760);
}

function toggleSound() {
  state.settings.soundOn = !state.settings.soundOn;
  persistStore();
  setNodeText("[data-sound]", state.settings.soundOn ? "Sound: On" : "Sound: Off");
}

function resetProgress() {
  if (!window.confirm("Reset all game progress stored on this browser?")) return;

  localStorage.removeItem(STORE_KEY);
  loadStore();
  renderLevelButtons();
  startLevel(1);
}

function initRevealAnimations() {
  const revealTargets = Array.from(document.querySelectorAll("[data-reveal]"));
  if (revealTargets.length === 0) return;

  if (prefersReducedMotion) {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
  );

  revealTargets.forEach((el, idx) => {
    el.style.setProperty("--reveal-delay", `${(idx % 6) * 80}ms`);
    observer.observe(el);
  });
}

function attachEvents() {
  const levelGrid = document.querySelector("[data-level-grid]");
  const board = document.querySelector("[data-abacus-board]");
  const mentalField = document.querySelector("[data-mental-input]");

  levelGrid?.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-level-btn]");
    if (!btn) return;
    startLevel(parseInt(btn.dataset.levelBtn, 10));
  });

  board?.addEventListener("pointerdown", (event) => {
    const bead = event.target.closest("[data-bead]");
    if (!bead) return;
    state.dragState = { y: event.clientY };
  });

  board?.addEventListener("pointerup", (event) => {
    const bead = event.target.closest("[data-bead]");
    if (!bead || !state.levelSession) return;

    const rod = parseInt(bead.dataset.rod, 10);
    const beadType = bead.dataset.bead;
    const index = parseInt(bead.dataset.index || "-1", 10);
    onBeadAction(rod, beadType, index);
    state.dragState = null;
  });

  document.querySelector("[data-check]")?.addEventListener("click", () => {
    const level = getCurrentLevel();
    if (level.mode === "mental") {
      submitMentalAnswer();
      return;
    }
    checkCurrentAnswer();
  });

  document.querySelector("[data-next]")?.addEventListener("click", nextQuestion);
  document.querySelector("[data-hint]")?.addEventListener("click", useHint);
  document.querySelector("[data-sound]")?.addEventListener("click", toggleSound);
  document.querySelector("[data-reset-progress]")?.addEventListener("click", resetProgress);

  mentalField?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    submitMentalAnswer();
  });
}

function renderShell() {
  const app = document.getElementById("app");
  app.innerHTML = `
    ${renderHeader({ active: "game", ctaHref: "/contact.html", ctaLabel: "Enquire Now" })}
    <main id="main-content" tabindex="-1" class="game-shell">
      <div class="container">
        <section class="panel game-stage" data-reveal>
          <div class="game-stage__head">
            <div class="game-title">
              <p class="kicker">Web Abacus Trainer</p>
              <h1>Abacus Game Lab</h1>
              <p>Move from basic number formation to mental flash arithmetic with animated, level-based practice.</p>
            </div>
            <div class="game-toolbar">
              <button class="btn btn-outline" data-sound>Sound: On</button>
              <button class="btn btn-outline" data-reset-progress>Reset Progress</button>
            </div>
          </div>
          <div class="hud-strip">
            <article class="hud-card hud-card-ring">
              <p class="hud-label">Journey</p>
              <div class="hud-ring" data-level-progress style="--progress:0%">
                <span data-level-progress-label>0/10</span>
              </div>
            </article>
            <article class="hud-card">
              <p class="hud-label">Level</p>
              <p class="hud-value" data-level-pill>L1</p>
            </article>
            <article class="hud-card">
              <p class="hud-label">Question</p>
              <p class="hud-value" data-q-index>1/1</p>
              <div class="question-meter"><span data-question-progress></span></div>
            </article>
            <article class="hud-card">
              <p class="hud-label">Accuracy</p>
              <p class="hud-value" data-accuracy>100%</p>
            </article>
            <article class="hud-card">
              <p class="hud-label">Timer</p>
              <p class="hud-value" data-time>--:--</p>
            </article>
            <article class="hud-card">
              <p class="hud-label">Score</p>
              <p class="hud-value" data-session-score>0</p>
            </article>
            <article class="hud-card">
              <p class="hud-label">Streak</p>
              <p class="hud-value" data-streak>0x</p>
            </article>
            <article class="hud-card">
              <p class="hud-label">Mistakes</p>
              <p class="hud-value" data-mistakes>0</p>
            </article>
          </div>
        </section>

        <section class="game-arena" data-game-root>
          <aside class="panel level-rail" data-reveal>
            <div class="rail-head">
              <h2>Level Map</h2>
              <p>Unlock each challenge by hitting the minimum required accuracy.</p>
            </div>
            <div class="level-grid" data-level-grid></div>
          </aside>

          <section class="panel play-panel" data-work-panel data-reveal>
            <div class="fx-layer" data-fx-layer aria-hidden="true"></div>
            <div class="play-head">
              <h2 data-level-name>Level</h2>
              <p class="target-chip">Target <strong data-target>0</strong></p>
            </div>
            <div class="prompt-box">
              <p data-prompt>Prompt</p>
            </div>
            <div class="feedback" data-feedback>Use hints when needed and move beads carefully.</div>
            <div class="abacus-wrap">
              <div class="mental-overlay" aria-hidden="true">
                <p>Memorize the board</p>
                <strong data-mental-countdown></strong>
              </div>
              <div class="abacus-board rods-4" data-abacus-board></div>
            </div>
            <div class="mental-answer">
              <label for="mental-answer-field">Enter the hidden value</label>
              <input id="mental-answer-field" data-mental-input type="number" placeholder="Type your mental answer" />
            </div>
            <div class="actions">
              <button class="btn btn-solid" data-check>Check</button>
              <button class="btn btn-outline" data-hint>Hint</button>
              <button class="btn btn-outline" data-next>Skip Question</button>
            </div>
          </section>

          <aside class="panel coach-panel" data-reveal>
            <h3>Coach Console</h3>
            <p class="coach-tip" data-coach-tip>Use place value logic and keep your movement sequence clean.</p>
            <div class="stats-box">
              <div class="stat-row"><span>Best streak this run</span><strong data-best-streak>0x</strong></div>
              <div class="stat-row"><span>Attempts on this level</span><strong data-attempts>0</strong></div>
              <div class="stat-row"><span>Required accuracy</span><strong data-requirement>75%</strong></div>
              <div class="stat-row"><span>Hints</span><strong data-hints-status>Enabled</strong></div>
            </div>
            <h4>Core Rules</h4>
            <ul class="coach-list">
              <li>Upper bead is value 5 and each lower bead is value 1.</li>
              <li>Use the bead nearest to the bar for valid +/-1 actions.</li>
              <li>Carry and borrow are introduced in advanced levels.</li>
              <li>Mental mode hides the board after a short countdown.</li>
            </ul>
          </aside>
        </section>
      </div>
    </main>
    ${renderFooter()}
  `;
}

function init() {
  loadStore();
  renderShell();
  initNavigation();
  initRevealAnimations();

  setNodeText("[data-sound]", state.settings.soundOn ? "Sound: On" : "Sound: Off");
  renderLevelButtons();
  attachEvents();
  startLevel(state.progress.unlockedLevel);
}

init();
