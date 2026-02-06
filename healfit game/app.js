// app.js (новая версия: 4 модуля + отдельный путь обучения для каждого модуля)
"use strict";

const LEVEL_STEP_XP = 200;
const QUESTIONS_PER_LESSON = 5;
const XP_PER_CORRECT = 10;

const LEVEL_NAMES = ["новичок", "старт", "привычки", "энергия", "система", "про"];

const BROCCI = {
  waiting: "assets/img/brocci_waiting.png",
  sad: "assets/img/brocci_sad.png",
  happy: "assets/img/brocci_happy.png",
};

const MODULES = [
  { id: "food",     title: "Питание",   sub: "Баланс и осознанность", total: 6 },
  { id: "activity", title: "Активность", sub: "Движение без перегруза", total: 6 },
  { id: "sleep",    title: "Сон",       sub: "Восстановление и режим", total: 6 },
  { id: "stress",   title: "Стресс",    sub: "Фокус и спокойствие", total: 6 },
];

const LESSON_TITLES = {
  food:     ["Порции", "Белок", "Овощи", "Сладкое", "Перекусы", "Осознанность"],
  activity: ["10 минут", "Силовые", "Шаги", "Разминка", "Спина", "Восстановление"],
  sleep:    ["Режим", "Свет", "Кофеин", "Ритуал", "Температура", "Выходные"],
  stress:   ["Дыхание", "Паузы", "Фокус", "Границы", "Эмоции", "Перезагрузка"],
};

function makeQuestions(moduleId, lessonTitle){
  const base = [
    {
      q: `Какой микро-шаг лучше начать сегодня для темы «${lessonTitle}»?`,
      a: ["Сделать идеальный план на месяц", "Сделать 1 маленькое действие за 60 секунд", "Ждать вдохновения"],
      c: 1
    },
    {
      q: "Что сильнее помогает закрепить привычку?",
      a: ["Случайная мотивация", "Чёткий триггер + простое действие", "Сила воли каждый раз"],
      c: 1
    },
    {
      q: "Если сорвался, что правильнее сделать?",
      a: ["Бросить всё до понедельника", "Вернуться к минимальной версии привычки", "Удвоить нагрузку"],
      c: 1
    },
    {
      q: "Что лучше для устойчивости?",
      a: ["Сложная привычка сразу", "Привычка, встроенная в рутину", "Редкие рывки"],
      c: 1
    },
    {
      q: "Как быстрее почувствовать прогресс?",
      a: ["Не отслеживать ничего", "Видимый трек: уроки/галочки/XP", "Сравнивать себя с другими"],
      c: 1
    }
  ];

  const tweak = {
    sleep: [
      { q: "Что чаще всего сбивает сон?", a: ["Стабильный режим", "Яркий свет и экраны вечером", "Тихая комната"], c: 1 },
      { q: "Что лучше сделать за 30 минут до сна?", a: ["Скроллить новости", "Лёгкий ритуал и приглушить свет", "Плотно поесть"], c: 1 },
    ],
    food: [
      { q: "Самый простой шаг к балансу питания?", a: ["Только диеты", "Добавить белок/овощи к привычной еде", "Полный запрет сладкого"], c: 1 },
      { q: "Что помогает меньше переедать?", a: ["Есть на бегу", "Осознанная пауза и нормальная порция", "Не завтракать всегда"], c: 1 },
    ],
    activity: [
      { q: "Что лучше для старта активности?", a: ["Сразу марафон", "10 минут движения ежедневно", "Ждать идеальной формы"], c: 1 },
      { q: "Что помогает не бросать?", a: ["Редкие тренировки", "Привязать движение к существующей привычке", "Спорить с собой"], c: 1 },
    ],
    stress: [
      { q: "Самый быстрый способ снизить стресс за 1 минуту?", a: ["Игнорировать", "Дыхание + короткая пауза", "Ещё кофе"], c: 1 },
      { q: "Что помогает удерживать фокус?", a: ["100 задач параллельно", "Одна задача + короткие перерывы", "Никакого плана"], c: 1 },
    ],
  };

  const extra = tweak[moduleId] || [];
  const mixed = [];
  for (let i = 0; i < Math.min(2, extra.length); i++) mixed.push(extra[i]);
  for (let i = 0; mixed.length < QUESTIONS_PER_LESSON && i < base.length; i++) mixed.push(base[i]);
  return mixed.slice(0, QUESTIONS_PER_LESSON);
}

function buildLessons(){
  const lessons = [];
  for (const m of MODULES){
    const titles = LESSON_TITLES[m.id] || [];
    for (let i = 0; i < m.total; i++){
      const title = titles[i] || `Урок ${i+1}`;
      lessons.push({
        id: `${m.id}_${i+1}`,
        moduleId: m.id,
        moduleTitle: m.title,
        title,
        // ✅ у каждого модуля свой “путь”: первый урок доступен сразу
        status: (i === 0) ? "next" : "locked",
        questions: makeQuestions(m.id, title),
        xpTotal: QUESTIONS_PER_LESSON * XP_PER_CORRECT,
      });
    }
  }
  return lessons;
}

const state = {
  xp: 0,
  streak: 0,       // ✅ серия правильных ответов подряд (без ошибок)
  level: 1,
  levelPct: 0,
  selectedModuleId: "food", // ✅ выбранный модуль (по умолчанию)
  modules: Object.fromEntries(MODULES.map(m => [m.id, { done: 0, total: m.total }])),
  lessons: buildLessons(),

  // runtime
  activeLessonId: null,
  activeQIndex: 0,
  selected: null,        // { idx, correct }
  earnedThisLesson: 0,
};

const el = {
  xpValue: document.getElementById("xpValue"),
  streakValue: document.getElementById("streakValue"),
  levelLabel: document.getElementById("levelLabel"),
  levelPct: document.getElementById("levelPct"),
  levelBar: document.getElementById("levelBar"),
  nextLessonLabel: document.getElementById("nextLessonLabel"),
  doneTotalLabel: document.getElementById("doneTotalLabel"),

  modulesGrid: document.getElementById("modulesGrid"),
  activeModuleHint: document.getElementById("activeModuleHint"),
  pathTitle: document.getElementById("pathTitle"),
  pathList: document.getElementById("pathList"),

  btnContinue: document.getElementById("btnContinue"),
  btnShowPath: document.getElementById("btnShowPath"),

  backdrop: document.getElementById("modalBackdrop"),
  btnCloseModal: document.getElementById("btnCloseModal"),
  lessonModule: document.getElementById("lessonModule"),
  lessonTitle: document.getElementById("lessonTitle"),
  qCounter: document.getElementById("qCounter"),
  lessonXp: document.getElementById("lessonXp"),
  brocciImg: document.getElementById("brocciImg"),
  questionText: document.getElementById("questionText"),
  answers: document.getElementById("answers"),
  feedback: document.getElementById("feedback"),
  btnNextQuestion: document.getElementById("btnNextQuestion"),

  toastHost: document.getElementById("toastHost"),
};

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[s]));
}

function toast(title, subtitle = ""){
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `<strong>${escapeHtml(title)}</strong>${subtitle ? `<small>${escapeHtml(subtitle)}</small>` : ""}`;
  el.toastHost.appendChild(t);

  setTimeout(() => {
    t.style.animation = "toastOut .22s ease forwards";
    setTimeout(() => t.remove(), 220);
  }, 1400);
}

function setBrocci(mood){
  if (!el.brocciImg) return;
  const src = BROCCI[mood] || BROCCI.waiting;
  el.brocciImg.src = src;

  el.brocciImg.classList.remove("bounce");
  void el.brocciImg.offsetWidth;
  el.brocciImg.classList.add("bounce");
}

function levelName(level){
  const idx = Math.min(level - 1, LEVEL_NAMES.length - 1);
  return LEVEL_NAMES[idx] || "уровень";
}

function calcLevel(){
  const level = Math.floor(state.xp / LEVEL_STEP_XP) + 1;
  const pct = Math.floor(((state.xp % LEVEL_STEP_XP) / LEVEL_STEP_XP) * 100);
  state.level = level;
  state.levelPct = pct;
}

function countDoneTotal(){
  return state.lessons.filter(l => l.status === "done").length;
}

function getModuleNextLesson(moduleId){
  return state.lessons.find(l => l.moduleId === moduleId && l.status === "next") || null;
}

function getSelectedModule(){
  return MODULES.find(m => m.id === state.selectedModuleId) || MODULES[0];
}

function getNextLessonForContinue(){
  // 1) пытаемся продолжить в выбранном модуле
  const inSelected = getModuleNextLesson(state.selectedModuleId);
  if (inSelected) return inSelected;

  // 2) иначе — найдём любой доступный "next" в других модулях
  return state.lessons.find(l => l.status === "next") || null;
}

function renderTop(){
  calcLevel();
  el.xpValue.textContent = String(state.xp);
  el.streakValue.textContent = String(state.streak);

  el.levelLabel.textContent = `Lv ${state.level} — ${levelName(state.level)}`;
  el.levelPct.textContent = `${state.levelPct}%`;
  el.levelBar.style.width = `${state.levelPct}%`;

  const next = getNextLessonForContinue();
  el.nextLessonLabel.textContent = next
    ? `${next.moduleTitle}: ${next.title}`
    : "Все уроки пройдены ✅";

  el.doneTotalLabel.textContent = String(countDoneTotal());
}

function renderModules(){
  el.modulesGrid.innerHTML = "";

  for (const m of MODULES){
    const prog = state.modules[m.id];
    const pct = Math.floor((prog.done / prog.total) * 100);

    const card = document.createElement("div");
    card.className = `moduleCard glass selectable ${state.selectedModuleId === m.id ? "active" : ""}`;
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");

    card.innerHTML = `
      <div class="moduleTitleRow">
        <h3 class="moduleTitle">${escapeHtml(m.title)}</h3>
        <div class="moduleCount">${prog.done}/${prog.total}</div>
      </div>
      <div class="moduleSub">${escapeHtml(m.sub)}</div>
      <div class="moduleBar" aria-label="Прогресс модуля">
        <div class="moduleFill" style="width:${pct}%"></div>
      </div>
      <div class="badge">Прогресс: <strong>${pct}%</strong></div>
    `;

    const select = () => {
      state.selectedModuleId = m.id;
      toast("Модуль выбран", m.title);
      renderAll();
      scrollToPath();
    };

    card.addEventListener("click", select);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        select();
      }
    });

    el.modulesGrid.appendChild(card);
  }

  const selected = getSelectedModule();
  el.activeModuleHint.textContent = `Выбран: ${selected.title}`;
}

function statusLabel(status){
  if (status === "done") return "✅ пройден";
  if (status === "next") return "🔓 следующий";
  return "🔒 заблокирован";
}

function statusIcon(status){
  if (status === "done") return "✅";
  if (status === "next") return "▶";
  return "🔒";
}

function renderPath(){
  const selected = getSelectedModule();
  el.pathTitle.textContent = `Путь обучения — ${selected.title}`;

  el.pathList.innerHTML = "";

  const lessons = state.lessons.filter(l => l.moduleId === selected.id);

  for (const lesson of lessons){
    const btn = document.createElement("button");
    btn.className = `lessonBtn ${lesson.status}`;
    btn.disabled = (lesson.status === "locked");
    btn.type = "button";

    btn.innerHTML = `
      <div class="lessonLeft">
        <div class="lessonIcon">${statusIcon(lesson.status)}</div>
        <div class="lessonMeta">
          <div class="lessonTitle">${escapeHtml(lesson.title)}</div>
          <div class="lessonSub">${escapeHtml(lesson.moduleTitle)}</div>
        </div>
      </div>
      <div class="lessonStatus">${statusLabel(lesson.status)}</div>
    `;

    btn.addEventListener("click", () => {
      if (lesson.status === "locked") return;
      openLesson(lesson.id);
    });

    el.pathList.appendChild(btn);
  }
}

function renderAll(){
  renderTop();
  renderModules();
  renderPath();
}

function scrollToPath(){
  document.getElementById("pathSection").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------------- MODAL + LESSON FLOW ---------------- */

let lastFocused = null;

function openLesson(lessonId){
  const lesson = state.lessons.find(l => l.id === lessonId);
  if (!lesson || lesson.status === "locked") return;

  // при открытии урока — считаем, что пользователь “в этом модуле”
  state.selectedModuleId = lesson.moduleId;

  state.activeLessonId = lessonId;
  state.activeQIndex = 0;
  state.selected = null;
  state.earnedThisLesson = 0;

  lastFocused = document.activeElement;

  el.backdrop.classList.add("open");
  el.backdrop.setAttribute("aria-hidden", "false");

  setBrocci("waiting");
  renderLessonQuestion();

  el.btnCloseModal.focus();
  renderModules(); // обновим подсветку выбранного модуля
  renderTop();
}

function closeLesson(){
  el.backdrop.classList.remove("open");
  el.backdrop.setAttribute("aria-hidden", "true");

  state.activeLessonId = null;
  state.activeQIndex = 0;
  state.selected = null;

  if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
}

function getActiveLesson(){
  return state.lessons.find(l => l.id === state.activeLessonId) || null;
}

function renderLessonQuestion(){
  const lesson = getActiveLesson();
  if (!lesson) return;

  const qIndex = state.activeQIndex;
  const qObj = lesson.questions[qIndex];

  el.lessonModule.textContent = lesson.moduleTitle;
  el.lessonTitle.textContent = lesson.title;
  el.qCounter.textContent = `Вопрос ${qIndex + 1} / ${QUESTIONS_PER_LESSON}`;
  el.lessonXp.textContent = String(lesson.xpTotal);
  el.questionText.textContent = qObj.q;

  el.answers.innerHTML = "";
  el.feedback.textContent = "Выберите вариант ответа";
  el.feedback.classList.add("muted");
  el.btnNextQuestion.disabled = true;

  setBrocci("waiting");

  qObj.a.forEach((txt, idx) => {
    const b = document.createElement("button");
    b.className = "answerBtn";
    b.type = "button";
    b.textContent = txt;
    b.addEventListener("click", () => onAnswer(idx));
    el.answers.appendChild(b);
  });

  state.selected = null;
}

function onAnswer(answerIdx){
  const lesson = getActiveLesson();
  if (!lesson) return;

  const qObj = lesson.questions[state.activeQIndex];
  if (state.selected) return;

  const correct = (answerIdx === qObj.c);
  state.selected = { idx: answerIdx, correct };

  const buttons = [...el.answers.querySelectorAll(".answerBtn")];
  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === qObj.c) b.classList.add("correct");
    if (i === answerIdx && !correct) b.classList.add("wrong");
  });

  if (correct){
    state.xp += XP_PER_CORRECT;
    state.earnedThisLesson += XP_PER_CORRECT;

    // ✅ streak = правильные ответы подряд
    state.streak += 1;

    setBrocci("happy");
    el.feedback.textContent = `Супер! +${XP_PER_CORRECT} XP`;
    el.feedback.classList.remove("muted");
    toast("Супер! +XP", `+${XP_PER_CORRECT} XP`);
  } else {
    // ❌ ошибка сбрасывает streak
    state.streak = 0;

    setBrocci("sad");
    el.feedback.textContent = "Почти! Смотри правильный вариант ✅";
    el.feedback.classList.remove("muted");
    toast("Почти!", "Попробуем дальше");
  }

  renderTop();
  el.btnNextQuestion.disabled = false;
}

function nextQuestionOrFinish(){
  const lesson = getActiveLesson();
  if (!lesson) return;
  if (!state.selected) return;

  const isLast = state.activeQIndex >= QUESTIONS_PER_LESSON - 1;
  if (!isLast){
    state.activeQIndex += 1;
    state.selected = null;
    renderLessonQuestion();
    return;
  }

  completeLesson(lesson.id);
  closeLesson();
}

function completeLesson(lessonId){
  const idx = state.lessons.findIndex(l => l.id === lessonId);
  if (idx === -1) return;

  const lesson = state.lessons[idx];
  if (lesson.status === "done") return;

  lesson.status = "done";

  // модульный прогресс
  const mod = state.modules[lesson.moduleId];
  if (mod) mod.done = Math.min(mod.total, mod.done + 1);

  // ✅ разблокируем следующий урок ТОЛЬКО в этом модуле
  const nextInModule = state.lessons.find(l =>
    l.moduleId === lesson.moduleId && l.status === "locked"
    && parseInt(l.id.split("_")[1], 10) === (parseInt(lesson.id.split("_")[1], 10) + 1)
  );

  // Если id не гарантированно по порядку, используем индексный поиск внутри модуля:
  const moduleLessons = state.lessons.filter(l => l.moduleId === lesson.moduleId);
  const pos = moduleLessons.findIndex(l => l.id === lesson.id);
  const nextByPos = (pos >= 0) ? moduleLessons[pos + 1] : null;

  const next = (nextInModule && nextInModule.status === "locked") ? nextInModule : nextByPos;
  if (next && next.status === "locked") next.status = "next";

  toast("Урок пройден ✅", `Заработано: ${state.earnedThisLesson} XP`);
  renderAll();
}

/* ---------------- EVENTS ---------------- */

el.btnContinue.addEventListener("click", () => {
  const next = getNextLessonForContinue();
  if (!next){
    toast("Все уроки пройдены ✅", "Можно повторить для закрепления");
    return;
  }
  openLesson(next.id);
});

el.btnShowPath.addEventListener("click", () => scrollToPath());

el.btnCloseModal.addEventListener("click", closeLesson);

el.backdrop.addEventListener("click", (e) => {
  if (e.target === el.backdrop) closeLesson();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && el.backdrop.classList.contains("open")) closeLesson();
});

el.btnNextQuestion.addEventListener("click", nextQuestionOrFinish);

// простой фокус-трап
document.addEventListener("keydown", (e) => {
  if (!el.backdrop.classList.contains("open")) return;
  if (e.key !== "Tab") return;

  const focusable = el.backdrop.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first){
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && document.activeElement === last){
    e.preventDefault(); first.focus();
  }
});

/* ---------------- INIT ---------------- */

renderAll();