const STORAGE_KEY = "five-year-journal-v3";
const TEMPLATE_DATE = "2026-03-17";
const LATEST_DIARY_DATE = "2026-07-02";
const LATEST_DIARY_IMPORT = "clean-pwa-v1";
const LATEST_APP_VERSION = "moji-49";
const IMAGE_MAX_SIZE = 1200;

const defaultState = {
  latestDiaryImport: LATEST_DIARY_IMPORT,
  tree: {
    title: "总目标",
    note: "成为健康、自律、有财务增长，并且越来越认识自己的人。",
    branches: [
      {
        title: "健康活力",
        progress: 43,
        layers: [
          "五年：长期保持身体能量和稳定作息",
          "年度：做个活力满满的中年少女",
          "今日：冥想、跑步、照顾身体",
        ],
      },
      {
        title: "学习成长",
        progress: 36,
        layers: [
          "五年：成为知识且自律的人",
          "年度：读完10本书，做读书卡片200张",
          "今日：读书、卡片、复盘",
        ],
      },
      {
        title: "财务增长",
        progress: 49,
        layers: [
          "五年：财务自由增长",
          "年度：业绩300万，利润40万，存款20万",
          "今日：客户、订单、回款、经营推进",
        ],
      },
      {
        title: "认识自己",
        progress: 32,
        layers: [
          "五年：观察、照顾、认识自己",
          "年度：找到一个自己的爱好",
          "今日：记录感受、小确幸和家庭生活",
        ],
      },
    ],
  },
  goals: [
    {
      key: "fiveYear",
      label: "五年主线",
      note: "健康是我在这个世界上最大的财富。\n长期主线：健康活力、学习自律、财务增长、认识自己。",
      progress: 28,
    },
    {
      key: "year",
      label: "2026年年度目标（11个结果）",
      note:
        "目标一：做个活力满满的中年少女\n关键结果1：每周冥想2小时，一年108小时\n关键结果2：跑步250公里\n\n目标二：做一个知性且自律的人\n关键结果1：读完10本书，关于成长和管理财务养生书籍，并做读书卡片200张\n\n目标三：财务日益增长\n关键结果1：公司业绩达到300万，利润达到40万\n关键结果2：客户拜访5次\n关键结果3：存款20万\n\n目标四：爱家庭爱自己\n关键结果1：找到一个自己的爱好",
      progress: 31,
    },
  ],
  planSections: [
    {
      key: "year",
      title: "年度目标",
      subtitle: "2026年年度目标（11个结果）",
      items: [
        { text: "目标一：做个活力满满的中年少女", progress: 0 },
        { text: "关键结果1：每周冥想2小时，一年108小时", progress: 0, note: "" },
        { text: "关键结果2：跑步250公里", progress: 40, note: "目前100公里。" },
        { text: "目标二：做一个知性且自律的人", progress: 0 },
        {
          text: "关键结果1：读完10本书，关于成长和管理财务养生书籍，并做读书卡片200张",
          progress: 30,
          note: "1.有钱人和你想的不一样。\n2.反脆弱\n3.穷查理宝典",
        },
        { text: "目标三：财务日益增长", progress: 0 },
        { text: "关键结果1：公司业绩达到300万，利润达到40万", progress: 50, note: "截止到7月9号，销售额未税151万" },
        { text: "关键结果2：客户拜访5次", progress: 10, note: "1.郑州机场客户。" },
        { text: "关键结果3：存款20万", progress: 50, note: "10万" },
        { text: "目标四：爱家庭爱自己", progress: 0 },
        { text: "关键结果1：找到一个自己的爱好", progress: 0, note: "目前还没有找到。" },
      ],
    },
  ],
  entries: {},
};

const $ = (selector) => document.querySelector(selector);

function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function readState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(defaultState);
  try {
    const parsed = JSON.parse(raw);
    const normalized = {
      latestDiaryImport: parsed.latestDiaryImport || "",
      tree: normalizeTree(parsed.tree),
      goals: normalizeGoals(parsed.goals),
      planSections: normalizePlanSections(parsed.planSections),
      entries: parsed.entries && typeof parsed.entries === "object" ? parsed.entries : {},
    };
    applyLatestDiaryImport(normalized);
    return normalized;
  } catch {
    return structuredClone(defaultState);
  }
}

function applyLatestDiaryImport(targetState) {
  if (targetState.latestDiaryImport === LATEST_DIARY_IMPORT) return;
  const latestDefaultEntry = defaultState.entries?.[LATEST_DIARY_DATE];
  if (latestDefaultEntry && !targetState.entries[LATEST_DIARY_DATE]) {
    targetState.entries[LATEST_DIARY_DATE] = structuredClone(latestDefaultEntry);
  }
  targetState.latestDiaryImport = LATEST_DIARY_IMPORT;
}

function normalizeTree(tree) {
  if (!tree || typeof tree !== "object") return structuredClone(defaultState.tree);
  return {
    ...defaultState.tree,
    title: tree.title || defaultState.tree.title,
    note: tree.note || defaultState.tree.note,
    branches: defaultState.tree.branches.map((base, index) => {
      const existing = Array.isArray(tree.branches) ? tree.branches[index] : null;
      if (!existing) return { ...base, layers: [...base.layers] };
      return {
        ...base,
        title: existing.title || base.title,
        progress: Number.isFinite(Number(existing.progress)) ? Number(existing.progress) : base.progress,
        layers: (Array.isArray(existing.layers) && existing.layers.length ? existing.layers : [...base.layers]).filter(
          (layer) => !String(layer).trim().startsWith("今日："),
        ),
      };
    }),
  };
}

function normalizeGoals(goals) {
  if (!Array.isArray(goals)) return structuredClone(defaultState.goals);
  return defaultState.goals.map((base) => {
    const existing = goals.find((goal) => goal.key === base.key);
    if (!existing) return { ...base };
    return {
      ...base,
      note: existing.note || base.note,
      progress: Number.isFinite(Number(existing.progress)) ? Number(existing.progress) : base.progress,
    };
  });
}

function normalizePlanSections(planSections) {
  if (!Array.isArray(planSections)) return structuredClone(defaultState.planSections);
  return defaultState.planSections.map((base) => {
    const existing = planSections.find((section) => section.key === base.key);
    if (!existing) return structuredClone(base);
    const existingItems = Array.isArray(existing.items) ? existing.items : [];
    const usableExistingItems = hasUsablePlanItems(existingItems, base) ? existingItems : base.items;
    const baseItems = base.items.map((item, index) => normalizePlanItem(usableExistingItems[index], item));
    const extraItems = usableExistingItems
      .slice(base.items.length)
      .map((item) => normalizePlanItem(item, { text: "", progress: 0 }));
    return {
      ...base,
      title: existing.title || base.title,
      subtitle: existing.subtitle || base.subtitle,
      items: [...baseItems, ...extraItems],
    };
  });
}

function hasUsablePlanItems(items, fallback) {
  if (!Array.isArray(items) || !items.length) return false;
  const nonEmptyCount = items.filter((item) => String(item?.text || "").trim()).length;
  return nonEmptyCount >= Math.min(2, fallback.items.length);
}

function normalizePlanItem(saved, fallback) {
  return {
    text: saved?.text || fallback.text,
    progress: Number.isFinite(Number(saved?.progress)) ? Number(saved.progress) : fallback.progress,
    note: typeof saved?.note === "string" ? saved.note : fallback.note || "",
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = readState();
const searchParams = new URLSearchParams(window.location.search);
const requestedVersion = searchParams.get("v");
const requestedDate = searchParams.get("date");
const shouldUseDailyTemplate = !requestedDate || (requestedVersion && requestedVersion !== LATEST_APP_VERSION);
let activeDate = shouldUseDailyTemplate ? todayISO() : requestedDate;
let pendingPlanFocus = null;

function getEntry(date) {
  if (!state.entries[date]) {
    state.entries[date] = {
      photos: [],
      photoNote: "",
      tasks: "",
      done: "",
      progress: 50,
      taskStatuses: [],
      doneStatuses: [],
      yesterdaySummary: "",
      reflection: "",
      tomorrow: "",
    };
  }
  normalizeEntry(state.entries[date]);
  return state.entries[date];
}

function normalizeEntry(entry) {
  if (typeof entry.photoNote !== "string") entry.photoNote = "";
  if (!Array.isArray(entry.taskStatuses)) entry.taskStatuses = [];
  if (!Array.isArray(entry.doneStatuses)) entry.doneStatuses = [];
  if (typeof entry.yesterdaySummary !== "string") entry.yesterdaySummary = extractYesterdaySummary(entry.done);
  syncTaskStatuses(entry);
  syncDoneStatuses(entry);
}

function syncTaskStatuses(entry) {
  const lines = getTaskLines(entry.tasks);
  entry.taskStatuses = lines.map((_, index) => (entry.taskStatuses[index] === "done" ? "done" : "todo"));
}

function syncDoneStatuses(entry) {
  const lines = getDoneLines(entry.done);
  entry.doneStatuses = lines.map((line, index) => {
    if (entry.doneStatuses[index] === "done") return "done";
    if (entry.doneStatuses[index] === "todo") return "todo";
    return line.includes("✅") ? "done" : "todo";
  });
}

function average(numbers) {
  if (!numbers.length) return 0;
  return Math.round(numbers.reduce((sum, n) => sum + Number(n || 0), 0) / numbers.length);
}

function sectionProgress(section) {
  return average((section.items || []).filter(isProgressItem).map((item) => item.progress));
}

function isStatusSection(section) {
  return section?.key === "month" || section?.key === "week";
}

function ensureStatusDraftRow(section) {
  if (!isStatusSection(section)) return;
  section.items = cleanStatusItems(section.items);
}

function cleanStatusItems(items) {
  return (Array.isArray(items) ? items : []).filter((item) => {
    const text = String(item?.text || "").trim();
    return text && !text.includes("请填写计划内容") && !/^\d+[.、]\s*$/.test(text);
  });
}

function isProgressItem(item) {
  const text = String(item?.text || "")
    .trim()
    .replace(/^\d+[.、]\s*/, "");
  return !text.startsWith("目标");
}

function setBar(bar, value) {
  bar.style.width = `${Math.max(0, Math.min(100, value))}%`;
}

function renderDateLine() {
  const date = new Date(`${activeDate}T00:00:00`);
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
  const monthFormatter = new Intl.DateTimeFormat("zh-CN", { month: "long" });
  $("#dateLine").textContent = formatter.format(date);
  $("#dateDay").textContent = String(date.getDate()).padStart(2, "0");
  $("#dateMonth").textContent = monthFormatter.format(date);
  $("#dateYear").textContent = toChineseYear(date.getFullYear());
}

function renderGoals() {
  const list = $("#goalList");
  if (!list) return;
  list.innerHTML = "";
  state.goals.forEach((goal, index) => {
    const card = document.createElement("article");
    card.className = "goal-card";
    card.innerHTML = `
      <div class="goal-top">
        <div class="goal-title"><i class="goal-dot"></i>${goal.label}</div>
        <span class="goal-percent">${goal.progress}%</span>
      </div>
      <div class="bar"><i style="width: ${goal.progress}%"></i></div>
      <textarea aria-label="${goal.label}计划">${goal.note || ""}</textarea>
      <input type="range" min="0" max="100" step="5" value="${goal.progress}" aria-label="${goal.label}进度" />
      <div class="goal-meta">当前推进 · ${goal.progress}%</div>
    `;
    const textarea = card.querySelector("textarea");
    const range = card.querySelector("input");
    autoGrow(textarea);
    textarea.addEventListener("input", () => {
      state.goals[index].note = textarea.value;
      autoGrow(textarea);
      saveAndRenderLight();
    });
    range.addEventListener("input", () => {
      state.goals[index].progress = Number(range.value);
      saveAndRenderLight();
      render();
    });
    list.appendChild(card);
  });
}

function renderPlanSections() {
  const root = $("#planSections");
  if (!root) return;
  root.innerHTML = "";
  state.planSections.forEach((section, sectionIndex) => {
    const sectionEl = document.createElement("section");
    sectionEl.className = "diary-section plan-section";
    sectionEl.innerHTML = `
      <h2><input class="section-title-input" value="${escapeHTML(section.title)}" aria-label="${escapeHTML(section.title)}标题" /></h2>
      <div class="leaf-divider"></div>
      <div class="plan-head">
        <textarea class="section-subtitle-input" rows="1" aria-label="${escapeHTML(section.title)}说明">${escapeHTML(section.subtitle)}</textarea>
      </div>
      <div class="plan-list"></div>
    `;
    const titleInput = sectionEl.querySelector(".section-title-input");
    const subtitleInput = sectionEl.querySelector(".section-subtitle-input");
    titleInput.addEventListener("input", () => {
      state.planSections[sectionIndex].title = titleInput.value;
      saveState();
    });
    subtitleInput.addEventListener("input", () => {
      state.planSections[sectionIndex].subtitle = subtitleInput.value;
      autoGrow(subtitleInput);
      saveState();
    });
    autoGrow(subtitleInput);
    ensureStatusDraftRow(section);
    const list = sectionEl.querySelector(".plan-list");
    section.items.forEach((item, itemIndex) => {
      const statusMode = isStatusSection(section);
      if (statusMode && !String(item.text || "").trim()) return;
      const hasKeyResultRecord = !statusMode && isProgressItem(item);
      const done = Number(item.progress) >= 100;
      const row = document.createElement("div");
      row.className = statusMode ? "plan-item status-only" : hasKeyResultRecord ? "plan-item" : "plan-item goal-only";
      row.innerHTML = `
        <div class="plan-line${statusMode ? " status-line" : " no-progress"}">
          <textarea class="plan-text-input" rows="1" aria-label="计划内容">${escapeHTML(item.text)}</textarea>
          ${
            statusMode
              ? statusSelect(done ? "done" : "todo", escapeHTML(item.text))
              : ""
          }
        </div>
        ${
          hasKeyResultRecord
            ? `<label class="key-result-document">
                 <textarea class="key-result-note" rows="1" placeholder="记录具体数据、完成情况、下一步">${escapeHTML(item.note || "")}</textarea>
               </label>`
            : ""
        }
      `;
      if (statusMode) {
        const textInput = row.querySelector(".plan-text-input");
        textInput.addEventListener("input", () => {
          state.planSections[sectionIndex].items[itemIndex].text = textInput.value;
          autoGrow(textInput);
          saveState();
        });
        textInput.addEventListener("blur", () => {
          if (itemIndex === state.planSections[sectionIndex].items.length - 1 && textInput.value.trim()) {
            ensureStatusDraftRow(state.planSections[sectionIndex]);
            saveState();
            renderPlanSections();
          }
        });
        autoGrow(textInput);
        const select = row.querySelector(".status-select");
        select.addEventListener("change", () => {
          const done = select.value === "done";
          state.planSections[sectionIndex].items[itemIndex].progress = done ? 100 : 0;
          select.classList.toggle("done", done);
          select.classList.toggle("todo", !done);
          saveState();
          renderProgress();
        });
        list.appendChild(row);
        return;
      }
      const textInput = row.querySelector(".plan-text-input");
      textInput.addEventListener("input", () => {
        state.planSections[sectionIndex].items[itemIndex].text = textInput.value;
        autoGrow(textInput);
        saveState();
      });
      autoGrow(textInput);
      const note = row.querySelector(".key-result-note");
      if (note) {
        note.addEventListener("input", () => {
          state.planSections[sectionIndex].items[itemIndex].note = note.value;
          autoGrow(note);
          saveState();
        });
        autoGrow(note);
      }
      list.appendChild(row);
    });
    if (isStatusSection(section)) {
      const addButton = document.createElement("button");
      addButton.type = "button";
      addButton.className = "add-plan-item";
      addButton.textContent = "+ 再添加一行";
      addButton.addEventListener("click", () => {
        state.planSections[sectionIndex].items = cleanStatusItems(state.planSections[sectionIndex].items);
        const filledCount = state.planSections[sectionIndex].items.length;
        const nextNumber = filledCount + 1;
        const newIndex = state.planSections[sectionIndex].items.length;
        state.planSections[sectionIndex].items.push({
          text: `${nextNumber}. 新增计划`,
          progress: 0,
          note: "",
        });
        pendingPlanFocus = { sectionIndex, itemIndex: newIndex, prefixLength: `${nextNumber}. `.length };
        saveState();
        renderPlanSections();
      });
      list.appendChild(addButton);
    }
    root.appendChild(sectionEl);
  });
  focusPendingPlanItem();
}

function focusPendingPlanItem() {
  if (!pendingPlanFocus) return;
  const { sectionIndex, itemIndex, prefixLength = 0 } = pendingPlanFocus;
  pendingPlanFocus = null;
  const sectionEl = document.querySelectorAll(".plan-section")[sectionIndex];
  const input = sectionEl?.querySelectorAll(".plan-text-input")[itemIndex];
  if (!input) return;
  input.focus();
  input.setSelectionRange(prefixLength, input.value.length);
  input.scrollIntoView({ block: "center", behavior: "smooth" });
}

function renderDailyForm() {
  const entry = getEntry(activeDate);
  syncTaskStatuses(entry);
  syncDoneStatuses(entry);
  $("#entryDate").value = activeDate;
  $("#photoNote").value = entry.photoNote;
  $("#todayTasks").value = entry.tasks;
  $("#doneText").value = entry.done;
  if ($("#yesterdaySummary")) $("#yesterdaySummary").value = entry.yesterdaySummary || "";
  if ($("#reflection")) $("#reflection").value = entry.reflection;
  renderPhotos();
  document.querySelectorAll("textarea").forEach(autoGrow);
}

function renderTaskStatusList() {
  const root = $("#todayTaskStatusList");
  if (!root) return;
  const entry = getEntry(activeDate);
  syncTaskStatuses(entry);
  const lines = getTaskLines(entry.tasks);
  if (!lines.length) {
    root.innerHTML = "";
    return;
  }
  root.innerHTML = lines
    .map((line, index) => {
      const status = entry.taskStatuses[index] === "done" ? "done" : "todo";
      return `
        <div class="task-status-row">
          <span title="${escapeHTML(line)}">${escapeHTML(line)}</span>
          ${statusSelect(status, escapeHTML(line), "task", index)}
        </div>
      `;
    })
    .join("");
  root.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("change", () => {
      const index = Number(select.dataset.taskIndex);
      getEntry(activeDate).taskStatuses[index] = select.value === "done" ? "done" : "todo";
      saveState();
    });
  });
}

function renderDoneStatusList() {
  const root = $("#doneStatusList");
  if (!root) return;
  const entry = getEntry(activeDate);
  syncDoneStatuses(entry);
  const lines = getDoneLines(entry.done);
  if (!lines.length) {
    root.innerHTML = "";
    return;
  }
  root.innerHTML = lines
    .map((line, index) => {
      const status = entry.doneStatuses[index] === "done" ? "done" : "todo";
      const cleanLine = cleanStatusMark(line);
      return `
        <div class="task-status-row">
          <span title="${escapeHTML(cleanLine)}">${escapeHTML(cleanLine)}</span>
          ${statusSelect(status, escapeHTML(cleanLine), "done", index)}
        </div>
      `;
    })
    .join("");
  root.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("change", () => {
      const index = Number(select.dataset.doneIndex);
      getEntry(activeDate).doneStatuses[index] = select.value === "done" ? "done" : "todo";
      saveState();
    });
  });
}

function statusSelect(status, label, type = "", index = "") {
  const dataAttr = type ? `data-${type}-index="${index}"` : "";
  return `
    <select class="status-select ${status === "done" ? "done" : "todo"}" ${dataAttr} aria-label="${label}完成状态">
      <option value="done" ${status === "done" ? "selected" : ""}>✓</option>
      <option value="todo" ${status === "todo" ? "selected" : ""}>×</option>
    </select>
  `;
}

function bindDailyForm() {
  document.addEventListener("change", (event) => {
    if (!event.target.classList?.contains("status-select")) return;
    event.target.classList.toggle("done", event.target.value === "done");
    event.target.classList.toggle("todo", event.target.value !== "done");
  });

  $("#entryDate").addEventListener("change", (event) => {
    activeDate = event.target.value || todayISO();
    render();
  });

  const mapping = [
    ["photoNote", "photoNote"],
    ["todayTasks", "tasks"],
    ["doneText", "done"],
    ["yesterdaySummary", "yesterdaySummary"],
  ];

  mapping.forEach(([id, key]) => {
    const field = $(`#${id}`);
    if (!field) return;
    field.addEventListener("input", (event) => {
      getEntry(activeDate)[key] = event.target.value;
      if (event.target.tagName === "TEXTAREA") autoGrow(event.target);
      saveAndRenderLight();
    });
  });

  $("#photoInput").addEventListener("change", async (event) => {
    const files = [...event.target.files].slice(0, 6);
    if (!files.length) return;
    const entry = getEntry(activeDate);
    entry.photos = entry.photos || [];
    for (const file of files) {
      const dataUrl = await resizeImage(file, IMAGE_MAX_SIZE);
      entry.photos.push(dataUrl);
    }
    event.target.value = "";
    saveAndRenderLight();
    renderDailyForm();
    showToast("照片已加入今天的日记");
  });
}

function renderPhotos() {
  const entry = getEntry(activeDate);
  const photos = entry.photos || [];
  const grid = $("#photoGrid");
  if (!photos.length) {
    grid.innerHTML = "";
    return;
  }
  grid.innerHTML = photos
    .map(
      (photo, index) => `
        <figure class="photo-thumb">
          <img src="${photo}" alt="今日照片 ${index + 1}" />
          <button type="button" data-photo-index="${index}" aria-label="删除照片 ${index + 1}">×</button>
        </figure>
      `,
    )
    .join("");
  grid.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const idx = Number(button.dataset.photoIndex);
      getEntry(activeDate).photos.splice(idx, 1);
      saveAndRenderLight();
      renderDailyForm();
    });
  });
}

function renderProgress() {
  const entry = getEntry(activeDate);
  const overall = average([...state.planSections.map(sectionProgress), entry.progress]);
  const overallValue = $("#overallValue");
  const todayValue = $("#todayValue");
  const streakValue = $("#streakValue");
  const overallBar = $("#overallBar");
  const todayBar = $("#todayBar");
  if (overallValue) overallValue.textContent = `${overall}%`;
  if (todayValue) todayValue.textContent = `${entry.progress}%`;
  if (overallBar) setBar(overallBar, overall);
  if (todayBar) setBar(todayBar, entry.progress);
  if (streakValue) streakValue.textContent = `${calculateStreak()} 天`;
}

function getLines(text) {
  return String(text || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function getTaskLines(text) {
  return getLines(text);
}

function getDoneLines(text) {
  return getLines(text).filter((line) => {
    const normalized = cleanStatusMark(line);
    if (!normalized) return false;
    if (normalized === "昨日计划") return false;
    if (normalized.startsWith("昨晚复盘")) return false;
    return true;
  });
}

function cleanStatusMark(text) {
  return String(text || "")
    .replace(/[✅❌]/g, "")
    .trim();
}

function extractYesterdaySummary(text) {
  return getLines(text)
    .filter((line) => cleanStatusMark(line).startsWith("昨晚复盘"))
    .map(cleanStatusMark)
    .join("\n");
}

function summarize(text) {
  const lines = getLines(text).filter((line) => !line.startsWith("关键结果"));
  const picked = lines.slice(0, 2).join(" / ");
  return picked.length > 72 ? `${picked.slice(0, 72)}...` : picked || "待填写";
}

function calculateStreak() {
  let streak = 0;
  const cursor = new Date(`${todayISO()}T00:00:00`);
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    const entry = state.entries[key];
    if (!entry) break;
    const hasContent = [entry.tasks, entry.done, entry.yesterdaySummary, entry.reflection].some((value) =>
      String(value || "").trim(),
    );
    if (!hasContent) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return Math.max(streak, 1);
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function autoGrow(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight + 2}px`;
}

function toChineseYear(year) {
  const digits = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  return `${String(year)
    .split("")
    .map((digit) => digits[Number(digit)])
    .join("")}年`;
}

function saveAndRenderLight() {
  saveState();
  renderProgress();
  renderPhotos();
}

function render() {
  renderDateLine();
  renderGoals();
  renderPlanSections();
  renderDailyForm();
  renderProgress();
  saveState();
}

function exportRecords() {
  const payload = JSON.stringify(state, null, 2);
  const blob = new Blob([payload], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `极简目标日记-${todayISO()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function hasEntryContent(entry) {
  return Boolean(
    entry &&
      [entry.tasks, entry.done, entry.yesterdaySummary, entry.reflection, entry.photoNote].some((value) =>
        String(value || "").trim(),
      ),
  );
}

function latestEntryDateBefore(date) {
  return Object.keys(state.entries || {})
    .filter((key) => key < date && hasEntryContent(state.entries[key]))
    .sort()
    .pop();
}

function createEntryFromTemplate(sourceDate, targetDate, { askBeforeOverwrite = true } = {}) {
  const source = getEntry(sourceDate);
  const existing = state.entries[targetDate];
  if (askBeforeOverwrite && hasEntryContent(existing) && !confirm("今天已经有记录了，要用当前页面重新生成今日模板吗？")) return false;
  syncTaskStatuses(source);
  state.entries[targetDate] = {
    photos: [],
    photoNote: "",
    tasks: "",
    done: source.tasks || "",
    progress: 50,
    taskStatuses: [],
    doneStatuses: [...(source.taskStatuses || [])],
    yesterdaySummary: "",
    reflection: "",
    tomorrow: "",
  };
  activeDate = targetDate;
  const url = new URL(window.location.href);
  url.searchParams.set("v", LATEST_APP_VERSION);
  url.searchParams.set("date", targetDate);
  window.history.replaceState({}, "", url);
  saveState();
  render();
  return true;
}

function createTodayFromCurrentTemplate() {
  const today = todayISO();
  if (createEntryFromTemplate(activeDate, today)) {
    showToast("已生成今天的复刻模板");
  }
}

function ensureDailyTemplate() {
  const today = todayISO();
  activeDate = today;
  const sourceDate = activeDate === today ? latestEntryDateBefore(today) : activeDate;
  if (!hasEntryContent(state.entries[today]) && sourceDate) {
    createEntryFromTemplate(sourceDate, today, { askBeforeOverwrite: false });
    return;
  }
  const url = new URL(window.location.href);
  url.searchParams.set("v", LATEST_APP_VERSION);
  url.searchParams.set("date", today);
  window.history.replaceState({}, "", url);
  getEntry(today);
  saveState();
}

async function generateMojiImage() {
  const dataUrl = await renderMojiCanvas();
  $("#generatedImage").src = dataUrl;
  $("#generatedSection").hidden = false;
  const link = document.createElement("a");
  const blob = dataUrlToBlob(dataUrl);
  const objectUrl = URL.createObjectURL(blob);
  link.href = objectUrl;
  link.download = `墨记日记-${activeDate}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 3000);
  showToast("墨记长图已生成");
}

function dataUrlToBlob(dataUrl) {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "image/png";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

async function renderMojiCanvas() {
  const width = 720;
  const maxHeight = 12000;
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = maxHeight * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.fillStyle = "#f3eee4";
  ctx.fillRect(0, 0, width, maxHeight);

  const entry = getEntry(activeDate);
  const date = new Date(`${activeDate}T00:00:00`);
  let y = 38;

  ctx.fillStyle = "#2f2a25";
  ctx.font = "72px Georgia, serif";
  ctx.fillText(String(date.getDate()).padStart(2, "0"), 42, y + 64);
  ctx.font = "14px -apple-system, BlinkMacSystemFont, PingFang SC, sans-serif";
  ctx.fillStyle = "#80766a";
  ctx.fillText(new Intl.DateTimeFormat("zh-CN", { month: "long" }).format(date), 168, y + 22);
  line(ctx, 168, y + 34, 340, y + 34);
  ctx.fillText(toChineseYear(date.getFullYear()), 168, y + 58);
  line(ctx, 168, y + 70, 340, y + 70);
  ctx.fillText(`${activeDate} ${new Intl.DateTimeFormat("zh-CN", { weekday: "long" }).format(date)}`, 468, y + 24);
  y += 110;
  line(ctx, 42, y, width - 42, y);
  y += 18;

  y = await drawPhotosOnCanvas(ctx, entry, 42, y, width - 84);
  y += 26;

  state.planSections.forEach((section) => {
  y = drawPlanSection(ctx, section, y, width);
  });
  y = drawTaskSection(ctx, entry, y, width);
  y = drawDoneSection(ctx, entry, y, width);
  y = drawTextSection(ctx, "昨日总结", entry.yesterdaySummary || "待补充", y, width);
  y += 26;

  const output = document.createElement("canvas");
  output.width = canvas.width;
  output.height = Math.ceil(y * scale);
  const outCtx = output.getContext("2d");
  outCtx.drawImage(canvas, 0, 0);
  return output.toDataURL("image/png");
}

function drawProgressCard(ctx, x, y, w, label, value, progress) {
  roundRect(ctx, x, y, w, 88, 7, "#fbf8f1", "#e5dacf");
  ctx.fillStyle = "#80766a";
  ctx.font = "13px -apple-system, BlinkMacSystemFont, PingFang SC, sans-serif";
  ctx.fillText(label, x + 12, y + 24);
  ctx.fillStyle = "#2f2a25";
  ctx.font = "bold 25px -apple-system, BlinkMacSystemFont, PingFang SC, sans-serif";
  ctx.fillText(value, x + 12, y + 56);
  drawBar(ctx, x + 12, y + 68, w - 24, progress);
}

async function drawPhotosOnCanvas(ctx, entry, x, y, w) {
  const photos = entry.photos || [];
  if (!photos.length) {
    roundRect(ctx, x, y, w, 320, 5, "#f8f4ed", "#cfc3b4", [6, 6]);
    ctx.fillStyle = "#2f2a25";
    ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, PingFang SC, sans-serif";
    centerText(ctx, "今日照片 / 状态", x + w / 2, y + 144);
    ctx.font = "14px -apple-system, BlinkMacSystemFont, PingFang SC, sans-serif";
    ctx.fillStyle = "#80766a";
    centerText(ctx, entry.photoNote || "写下今天照片里的状态或一句提醒", x + w / 2, y + 176);
    return y + 320;
  }
  for (const photo of photos) {
    const image = await loadImage(photo);
    const h = Math.min(520, (image.height / image.width) * w);
    clipRoundRect(ctx, x, y, w, h, 5);
    ctx.drawImage(image, x, y, w, h);
    ctx.restore();
    y += h + 10;
  }
  return y - 10;
}

function drawSectionTitle(ctx, title, y) {
  ctx.fillStyle = "#2f2a25";
  ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, PingFang SC, sans-serif";
  ctx.fillText(title, 42, y + 24);
  line(ctx, 42, y + 38, 678, y + 38, "#e5dacf");
  ctx.fillStyle = "#74865f";
  ctx.font = "12px -apple-system, BlinkMacSystemFont, PingFang SC, sans-serif";
  centerText(ctx, "////////", 360, y + 42);
  return y + 58;
}

function drawTextSection(ctx, title, text, y, width) {
  y = drawSectionTitle(ctx, title, y);
  const h = measureWrappedText(ctx, text, width - 108, 24) + 28;
  roundRect(ctx, 42, y, width - 84, h, 6, "rgba(255,253,248,0.82)", "#e5dacf");
  ctx.fillStyle = "#2f2a25";
  ctx.font = "15px -apple-system, BlinkMacSystemFont, PingFang SC, sans-serif";
  drawWrappedText(ctx, text, 58, y + 18, width - 116, 24);
  return y + h + 20;
}

function drawTaskSection(ctx, entry, y, width) {
  return drawTextSection(ctx, "今日任务", entry.tasks || "1.\n2.\n3.", y, width);
}

function drawDoneSection(ctx, entry, y, width) {
  return drawTextSection(ctx, "昨日计划", cleanStatusMark(entry.done) || "待补充", y, width);
}

function drawStatusSection(ctx, title, lines, statuses, y, width) {
  y = drawSectionTitle(ctx, title, y);
  if (!lines.length) return drawTextSection(ctx, title, title === "今日任务" ? "1.\n2.\n3." : "待补充", y - 58, width);
  const x = 42;
  const w = width - 84;
  const rowHeight = 42;
  const h = lines.length * rowHeight + 18;
  roundRect(ctx, x, y, w, h, 6, "rgba(255,253,248,0.82)", "#e5dacf");
  lines.forEach((lineText, index) => {
    const rowY = y + 14 + index * rowHeight;
    const done = statuses[index] === "done";
    ctx.fillStyle = "#2f2a25";
    ctx.font = "15px -apple-system, BlinkMacSystemFont, PingFang SC, sans-serif";
    ctx.fillText(ellipsizeText(ctx, lineText, w - 74), x + 14, rowY + 22);
    ctx.fillStyle = done ? "#26804f" : "#c2413a";
    ctx.font = "bold 19px -apple-system, BlinkMacSystemFont, PingFang SC, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(done ? "✓" : "×", x + w - 18, rowY + 23);
    ctx.textAlign = "left";
    if (index < lines.length - 1) line(ctx, x + 14, rowY + rowHeight - 2, x + w - 14, rowY + rowHeight - 2, "#eee5da");
  });
  return y + h + 20;
}

function drawPlanSection(ctx, section, y, width) {
  y = drawSectionTitle(ctx, section.title, y);
  const x = 42;
  const w = width - 84;
  const rowGap = 8;
  const headHeight = 42;
  const drawableItems = isStatusSection(section) ? section.items.filter((item) => String(item.text || "").trim()) : section.items;
  const rows = drawableItems.map((item) => {
    const statusMode = isStatusSection(section);
    const hasKeyResultRecord = !statusMode && isProgressItem(item);
    const textMaxWidth = statusMode ? w - 74 : w - 28;
    const textHeight = measureWrappedText(ctx, item.text, textMaxWidth, 21);
    const note = String(item.note || "").trim();
    const noteHeight = hasKeyResultRecord && note ? measureWrappedText(ctx, note, w - 28, 20) + 8 : 0;
    return { item, height: Math.max(42, textHeight + 20 + noteHeight), textHeight, noteHeight };
  });
  const h = headHeight + rows.reduce((sum, row) => sum + row.height + rowGap, 0) + 4;
  roundRect(ctx, x, y, w, h, 6, "rgba(255,253,248,0.82)", "#e5dacf");

  ctx.fillStyle = "#2f2a25";
  ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, PingFang SC, sans-serif";
  ctx.fillText(section.subtitle, x + 14, y + 25);

  let rowY = y + headHeight;
  rows.forEach(({ item, height, textHeight }) => {
    const statusMode = isStatusSection(section);
    const hasKeyResultRecord = !statusMode && isProgressItem(item);
    const textMaxWidth = statusMode ? w - 74 : w - 28;
    ctx.fillStyle = "#2f2a25";
    ctx.font = `${hasKeyResultRecord ? "" : "bold "}15px -apple-system, BlinkMacSystemFont, PingFang SC, sans-serif`;
    drawWrappedText(ctx, item.text, x + 14, rowY + 18, textMaxWidth, 21);
    if (statusMode) {
      const done = Number(item.progress) >= 100;
      ctx.fillStyle = done ? "#26804f" : "#c2413a";
      ctx.font = "bold 19px -apple-system, BlinkMacSystemFont, PingFang SC, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(done ? "✓" : "×", x + w - 18, rowY + 27);
      ctx.textAlign = "left";
    } else if (hasKeyResultRecord) {
      const note = String(item.note || "").trim();
      if (note) {
        ctx.fillStyle = "#80766a";
        ctx.font = "13px -apple-system, BlinkMacSystemFont, PingFang SC, sans-serif";
        drawWrappedText(ctx, note, x + 14, rowY + textHeight + 18, w - 28, 20);
      }
    }
    line(ctx, x + 14, rowY + height + 3, x + w - 14, rowY + height + 3, "#eee5da");
    rowY += height + rowGap;
  });
  return y + h + 20;
}

function ellipsizeText(ctx, text, maxWidth) {
  const chars = Array.from(String(text || ""));
  if (ctx.measureText(text).width <= maxWidth) return text;
  let current = "";
  for (const char of chars) {
    const next = `${current}${char}`;
    if (ctx.measureText(`${next}...`).width > maxWidth) return `${current}...`;
    current = next;
  }
  return current;
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, align = "left") {
  const originalAlign = ctx.textAlign;
  ctx.textAlign = align;
  const anchorX = align === "center" ? x + maxWidth / 2 : x;
  let lineCount = 0;
  String(text || "")
    .split("\n")
    .forEach((paragraph) => {
      const lines = wrapLine(ctx, paragraph, maxWidth);
      lines.forEach((lineText) => {
        ctx.fillText(lineText, anchorX, y + lineCount * lineHeight);
        lineCount += 1;
      });
      if (!paragraph) lineCount += 1;
    });
  ctx.textAlign = originalAlign;
  return Math.max(lineHeight, lineCount * lineHeight);
}

function measureWrappedText(ctx, text, maxWidth, lineHeight) {
  let lineCount = 0;
  String(text || "")
    .split("\n")
    .forEach((paragraph) => {
      lineCount += Math.max(1, wrapLine(ctx, paragraph, maxWidth).length);
    });
  return Math.max(lineHeight, lineCount * lineHeight);
}

function wrapLine(ctx, text, maxWidth) {
  const chars = Array.from(String(text || ""));
  const lines = [];
  let current = "";
  chars.forEach((char) => {
    const next = current + char;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = char;
    } else {
      current = next;
    }
  });
  lines.push(current);
  return lines;
}

function drawBar(ctx, x, y, w, progress) {
  roundRect(ctx, x, y, w, 8, 999, "#e5dccf");
  roundRect(ctx, x, y, (w * Math.max(0, Math.min(100, progress))) / 100, 8, 999, "#5f714f");
}

function roundRect(ctx, x, y, w, h, r, fill, stroke, dash) {
  ctx.save();
  ctx.beginPath();
  roundedPath(ctx, x, y, w, h, r);
  if (dash) ctx.setLineDash(dash);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
  ctx.restore();
}

function clipRoundRect(ctx, x, y, w, h, r) {
  ctx.save();
  ctx.beginPath();
  roundedPath(ctx, x, y, w, h, r);
  ctx.clip();
}

function roundedPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

function line(ctx, x1, y1, x2, y2, color = "#cfc3b4") {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function circle(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function centerText(ctx, text, x, y) {
  const old = ctx.textAlign;
  ctx.textAlign = "center";
  ctx.fillText(text, x, y);
  ctx.textAlign = old;
}

function buildMojiCardHTML() {
  const entry = getEntry(activeDate);
  const date = new Date(`${activeDate}T00:00:00`);
  const monthFormatter = new Intl.DateTimeFormat("zh-CN", { month: "long" });
  const weekdayFormatter = new Intl.DateTimeFormat("zh-CN", { weekday: "long" });
  return `
    <article class="moji-card">
      <header class="moji-header">
        <div class="moji-day">${String(date.getDate()).padStart(2, "0")}</div>
        <div class="moji-date-lines">
          <span>${monthFormatter.format(date)}</span>
          <span>${toChineseYear(date.getFullYear())}</span>
          <small>${activeDate} ${weekdayFormatter.format(date)}</small>
        </div>
      </header>
      ${buildMojiPhotos(entry)}
      <section class="moji-section">
        <h2>今日任务</h2>
        ${paragraphBlock(entry.tasks || "1.\\n2.\\n3.")}
      </section>
      <section class="moji-section">
        <h2>昨日计划</h2>
        ${statusBlock(getDoneLines(entry.done).map(cleanStatusMark), entry.doneStatuses)}
      </section>
    </article>
  `;
}

function statusBlock(lines, statuses) {
  if (!lines.length) return paragraphBlock("待补充");
  return paragraphBlock(lines.join("\n"));
}

function buildMojiPhotos(entry) {
  const photos = entry.photos || [];
  if (!photos.length) {
    return `
      <section class="moji-photo-empty">
        <strong>今日照片 / 状态</strong>
        <p>${escapeHTML(entry.photoNote || "写下今天照片里的状态或一句提醒")}</p>
      </section>
    `;
  }
  return `
    <section class="moji-photos">
      ${photos.map((photo, index) => `<img src="${photo}" alt="今日照片 ${index + 1}" />`).join("")}
    </section>
  `;
}

function paragraphBlock(text) {
  return `<div class="moji-text">${escapeHTML(text).replaceAll("\n", "<br>")}</div>`;
}

async function elementToPng(element) {
  const rect = element.getBoundingClientRect();
  const width = Math.ceil(rect.width);
  const height = Math.ceil(element.scrollHeight);
  const css = [...document.styleSheets]
    .map((sheet) => {
      try {
        return [...sheet.cssRules].map((rule) => rule.cssText).join("\n");
      } catch {
        return "";
      }
    })
    .join("\n");
  const html = new XMLSerializer().serializeToString(element.cloneNode(true));
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <style>${css}</style>
          ${html}
        </div>
      </foreignObject>
    </svg>
  `;
  const svgUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const image = await loadImage(svgUrl);
    const canvas = document.createElement("canvas");
    const scale = Math.min(2, 4096 / width);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const context = canvas.getContext("2d");
    context.fillStyle = "#f3eee4";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.scale(scale, scale);
    context.drawImage(image, 0, 0);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function waitForImages(root) {
  const images = [...root.querySelectorAll("img")];
  return Promise.all(
    images.map((image) => {
      if (image.complete) return Promise.resolve();
      return new Promise((resolve) => {
        image.onload = resolve;
        image.onerror = resolve;
      });
    }),
  );
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

function resizeImage(file, maxSize) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const ratio = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * ratio);
        canvas.height = Math.round(image.height * ratio);
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.86));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function finishEntry() {
  saveState();
  document.activeElement?.blur?.();
  showToast("今日已保存");
}

function resetDemo() {
  if (!confirm("要恢复成示例数据吗？当前本地记录会被清空。")) return;
  state = structuredClone(defaultState);
  activeDate = todayISO();
  saveState();
  render();
}

function boot() {
  if (shouldUseDailyTemplate) {
    ensureDailyTemplate();
  } else {
    activeDate = requestedDate || todayISO();
    const url = new URL(window.location.href);
    url.searchParams.set("v", LATEST_APP_VERSION);
    window.history.replaceState({}, "", url);
    getEntry(activeDate);
  }
  bindDailyForm();
  $("#todayTemplateBtn").addEventListener("click", createTodayFromCurrentTemplate);
  $("#finishBtn").addEventListener("click", finishEntry);
  $("#exportBtn").addEventListener("click", exportRecords);
  $("#imageBtn").addEventListener("click", generateMojiImage);
  $("#resetBtn").addEventListener("click", resetDemo);
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
  render();
}

boot();
