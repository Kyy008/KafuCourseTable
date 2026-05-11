const weekdays = [
  { day: 1, name: "一" },
  { day: 2, name: "二" },
  { day: 3, name: "三" },
  { day: 4, name: "四" },
  { day: 5, name: "五" },
  { day: 6, name: "六", active: true },
  { day: 7, name: "日" }
];

const periods = [
  { period: 1, start: "08:00", end: "09:50" },
  { period: 2, start: "10:10", end: "12:00" },
  { period: 3, start: "12:10", end: "14:00" },
  { period: 4, start: "14:10", end: "16:00" },
  { period: 5, start: "16:20", end: "18:10" },
  { period: 6, start: "19:00", end: "20:50" },
  { period: 7, start: "21:00", end: "21:50" }
];

const courseStorageKey = "kafu_courses";

const weekdayRow = document.querySelector("#weekday-row");
const scheduleGrid = document.querySelector("#schedule-grid");
const currentWeekLabel = document.querySelector("#current-week-label");
const weekPrevButton = document.querySelector("#week-prev");
const weekNextButton = document.querySelector("#week-next");
const openCourseQueryButton = document.querySelector("#open-course-query");
const openDayQueryButton = document.querySelector("#open-day-query");
const courseModal = document.querySelector("#course-modal");
const courseQueryModal = document.querySelector("#course-query-modal");
const dayQueryModal = document.querySelector("#day-query-modal");
const weekModal = document.querySelector("#week-modal");
const deleteModal = document.querySelector("#delete-modal");
const deleteMessage = document.querySelector("#delete-message");
const weekSummary = document.querySelector("#week-summary");
const weekGrid = document.querySelector("#week-grid");
const courseNameInput = document.querySelector("#course-name");
const courseRoomInput = document.querySelector("#course-room");
const courseTeacherInput = document.querySelector("#course-teacher");
const courseForm = document.querySelector(".course-form");
const courseCancelButton = document.querySelector("#course-cancel");
const courseDoneButton = document.querySelector("#course-done");
const courseQueryNameInput = document.querySelector("#course-query-name");
const courseQueryCancelButton = document.querySelector("#course-query-cancel");
const courseQuerySubmitButton = document.querySelector("#course-query-submit");
const courseQueryResults = document.querySelector("#course-query-results");
const dayQueryCancelButton = document.querySelector("#day-query-cancel");
const dayQuerySubmitButton = document.querySelector("#day-query-submit");
const dayQueryResults = document.querySelector("#day-query-results");
const dayQueryWeekPrevButton = document.querySelector("#day-query-week-prev");
const dayQueryWeekNextButton = document.querySelector("#day-query-week-next");
const dayQueryWeekLabel = document.querySelector("#day-query-week-label");
const dayQueryDate = document.querySelector("#day-query-date");
const dayQueryDayButtons = document.querySelectorAll(".day-query-day");
const openWeekPickerButton = document.querySelector("#open-week-picker");
const weekCancelButton = document.querySelector("#week-cancel");
const weekDoneButton = document.querySelector("#week-done");
const deleteCancelButton = document.querySelector("#delete-cancel");
const deleteConfirmButton = document.querySelector("#delete-confirm");
const weekModeButtons = document.querySelectorAll(".week-mode");

const totalWeeks = 16;
const initialWeek = 11;
const semesterStartDate = new Date(2026, 1, 23);
const selectedWeeks = new Set(Array.from({ length: totalWeeks }, (_, index) => index + 1));
const courseColors = Array.from({ length: 15 }, (_, index) => `card-${index + 1}`);
const courses = loadCourses();
let currentWeek = initialWeek;
let activeSlot = { day: 1, period: 1 };
let draggingCourseId = "";
let pendingDeleteCourseId = "";
let scheduleAnimationTimer = 0;
let selectedDayQueryDay = weekdays.find((weekday) => weekday.active)?.day || 1;
let selectedDayQueryWeek = currentWeek;

function normalizeCourse(course) {
  const weeks = getCourseWeeks(course);

  return {
    id: String(course.id || `course-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    name: String(course.name || "未命名课程"),
    teacher: String(course.teacher || ""),
    room: String(course.room || ""),
    day: Number(course.day) || 1,
    period: Number(course.period) || 1,
    weeks,
    weeksText: getWeeksText(weeks),
    color: courseColors.includes(course.color) ? course.color : getRandomCourseColor()
  };
}

function loadCourses() {
  try {
    const savedCourses = JSON.parse(localStorage.getItem(courseStorageKey));

    if (!Array.isArray(savedCourses)) {
      return [];
    }

    return savedCourses.map(normalizeCourse);
  } catch (error) {
    console.warn("课程数据读取失败，已使用空课程表。", error);
    return [];
  }
}

function saveCourses() {
  localStorage.setItem(courseStorageKey, JSON.stringify(courses));
}

function getWeekdayName(day) {
  return weekdays.find((weekday) => weekday.day === day)?.name || "";
}

function getPeriod(period) {
  return periods.find((item) => item.period === period);
}

function getPeriodText(periodNumber) {
  const period = getPeriod(periodNumber);

  if (!period) {
    return `第 ${periodNumber} 节`;
  }

  return `第 ${period.period} 节 ${period.start}-${period.end}`;
}

function getRandomCourseColor() {
  return courseColors[Math.floor(Math.random() * courseColors.length)];
}

function getAllWeeks() {
  return Array.from({ length: totalWeeks }, (_, index) => index + 1);
}

function normalizeWeeks(weeks) {
  return [...new Set(weeks
    .map((week) => Number(week))
    .filter((week) => Number.isInteger(week) && week >= 1 && week <= totalWeeks))]
    .sort((a, b) => a - b);
}

function parseWeeksText(weeksText) {
  if (typeof weeksText !== "string") {
    return [];
  }

  if (weeksText.includes("未选择")) {
    return [];
  }

  const rangeMatch = weeksText.match(/(\d{1,2})\s*-\s*(\d{1,2})/);

  if (rangeMatch) {
    const startWeek = Number(rangeMatch[1]);
    const endWeek = Number(rangeMatch[2]);
    const rangeWeeks = [];

    for (let week = startWeek; week <= endWeek; week += 1) {
      rangeWeeks.push(week);
    }

    return normalizeWeeks(rangeWeeks);
  }

  return normalizeWeeks(weeksText.match(/\d{1,2}/g) || []);
}

function getCourseWeeks(course) {
  if (Array.isArray(course.weeks)) {
    return normalizeWeeks(course.weeks);
  }

  if (typeof course.weeksText === "string") {
    const parsedWeeks = parseWeeksText(course.weeksText);
    return course.weeksText.includes("未选择") ? [] : parsedWeeks.length > 0 ? parsedWeeks : getAllWeeks();
  }

  return getAllWeeks();
}

function getWeeksText(weeks) {
  const normalizedWeeks = normalizeWeeks(weeks);

  if (normalizedWeeks.length === totalWeeks) {
    return `第01-${String(totalWeeks).padStart(2, "0")}周`;
  }

  if (normalizedWeeks.length === 0) {
    return "未选择周数";
  }

  return `第${normalizedWeeks
    .map((week) => String(week).padStart(2, "0"))
    .join("、")}周`;
}

function isCourseVisibleInCurrentWeek(course) {
  return course.weeks.includes(currentWeek);
}

function getWeekDates(week) {
  return weekdays.map((weekday) => {
    const date = new Date(semesterStartDate);
    date.setDate(semesterStartDate.getDate() + (week - 1) * 7 + weekday.day - 1);
    return date;
  });
}

function updateWeekControls(direction) {
  currentWeekLabel.textContent = `第 ${currentWeek} 周`;
  weekPrevButton.disabled = currentWeek === 1;
  weekNextButton.disabled = currentWeek === totalWeeks;

  if (!direction) {
    return;
  }

  currentWeekLabel.classList.remove("week-label-slide-left", "week-label-slide-right");
  void currentWeekLabel.offsetWidth;
  currentWeekLabel.classList.add(direction === "next" ? "week-label-slide-left" : "week-label-slide-right");
}

function switchWeek(direction) {
  const nextWeek = direction === "next" ? currentWeek + 1 : currentWeek - 1;

  if (nextWeek < 1 || nextWeek > totalWeeks) {
    return;
  }

  currentWeek = nextWeek;
  updateWeekControls(direction);
  renderWeekdays(direction);
  renderSchedule();
  animateScheduleCards(direction);
}

function openCourseQuery() {
  courseQueryNameInput.value = "";
  courseQueryResults.innerHTML = "";
  courseQueryResults.classList.remove("is-updated");
  openModal(courseQueryModal, openCourseQueryButton);
  courseQueryNameInput.focus();
}

function renderCourseQueryMessage(message) {
  courseQueryResults.innerHTML = "";

  const empty = document.createElement("p");
  empty.className = "query-empty";
  empty.textContent = message;
  courseQueryResults.appendChild(empty);
}

function createCourseQueryResult(course) {
  const item = document.createElement("article");
  item.className = "query-result-card";
  item.dataset.color = course.color;

  const title = document.createElement("h3");
  title.textContent = course.name;

  const meta = document.createElement("p");
  meta.className = "query-result-meta";
  meta.textContent = `${course.weeksText} · 星期${getWeekdayName(course.day)} · ${getPeriodText(course.period)}`;

  const detail = document.createElement("p");
  detail.className = "query-result-detail";
  const roomText = course.room || "未填写教室";
  const teacherText = course.teacher || "未填写老师";
  detail.textContent = `${roomText} / ${teacherText}`;

  item.append(title, meta, detail);
  return item;
}

function queryCourseTime() {
  const keyword = courseQueryNameInput.value.trim();

  if (!keyword) {
    renderCourseQueryMessage("请输入课程名称。");
    courseQueryNameInput.focus();
    return;
  }

  const results = courses
    .filter((course) => course.name.includes(keyword))
    .sort((a, b) => a.day - b.day || a.period - b.period);

  courseQueryResults.innerHTML = "";
  courseQueryResults.classList.remove("is-updated");
  void courseQueryResults.offsetWidth;
  courseQueryResults.classList.add("is-updated");

  if (results.length === 0) {
    renderCourseQueryMessage(`没有找到「${keyword}」的课程安排。`);
    return;
  }

  results.forEach((course) => {
    courseQueryResults.appendChild(createCourseQueryResult(course));
  });
}

function getDayQueryDateText(day) {
  const date = getWeekDates(selectedDayQueryWeek)[day - 1];
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function updateDayQueryDisplay(direction) {
  dayQueryWeekLabel.textContent = `第 ${selectedDayQueryWeek} 周`;
  dayQueryWeekPrevButton.disabled = selectedDayQueryWeek === 1;
  dayQueryWeekNextButton.disabled = selectedDayQueryWeek === totalWeeks;
  dayQueryDate.textContent = `星期${getWeekdayName(selectedDayQueryDay)} · ${getDayQueryDateText(selectedDayQueryDay)}`;

  if (!direction) {
    return;
  }

  dayQueryWeekLabel.classList.remove("week-label-slide-left", "week-label-slide-right");
  dayQueryDate.classList.remove("week-label-slide-left", "week-label-slide-right");
  void dayQueryWeekLabel.offsetWidth;
  const animationClass = direction === "next" ? "week-label-slide-left" : "week-label-slide-right";
  dayQueryWeekLabel.classList.add(animationClass);
  dayQueryDate.classList.add(animationClass);
}

function clearDayQueryResults() {
  dayQueryResults.innerHTML = "";
  dayQueryResults.classList.remove("is-updated");
}

function updateDayQuerySelection(day, direction) {
  selectedDayQueryDay = Number(day);
  dayQueryDayButtons.forEach((button) => {
    button.classList.toggle("is-selected", Number(button.dataset.day) === selectedDayQueryDay);
  });
  updateDayQueryDisplay(direction);
}

function changeDayQueryWeek(direction) {
  const nextWeek = direction === "next" ? selectedDayQueryWeek + 1 : selectedDayQueryWeek - 1;

  if (nextWeek < 1 || nextWeek > totalWeeks) {
    return;
  }

  selectedDayQueryWeek = nextWeek;
  updateDayQueryDisplay(direction);
  clearDayQueryResults();
}

function openDayQuery() {
  selectedDayQueryWeek = currentWeek;
  updateDayQuerySelection(selectedDayQueryDay);
  clearDayQueryResults();
  openModal(dayQueryModal, openDayQueryButton);
}

function renderDayQueryMessage(message) {
  dayQueryResults.innerHTML = "";

  const empty = document.createElement("p");
  empty.className = "query-empty";
  empty.textContent = message;
  dayQueryResults.appendChild(empty);
}

function createDayQueryResult(course) {
  const item = document.createElement("article");
  item.className = "query-result-card";
  item.dataset.color = course.color;

  const title = document.createElement("h3");
  title.textContent = getPeriodText(course.period);

  const meta = document.createElement("p");
  meta.className = "query-result-meta";
  const roomText = course.room || "未填写教室";
  meta.textContent = `${course.name} · ${roomText}`;

  const detail = document.createElement("p");
  detail.className = "query-result-detail";
  const teacherText = course.teacher || "未填写老师";
  detail.textContent = `${teacherText} · ${course.weeksText}`;

  item.append(title, meta, detail);
  return item;
}

function queryDaySchedule() {
  const results = courses
    .filter((course) => {
      return course.day === selectedDayQueryDay && course.weeks.includes(selectedDayQueryWeek);
    })
    .sort((a, b) => a.period - b.period);

  dayQueryResults.innerHTML = "";
  dayQueryResults.classList.remove("is-updated");
  void dayQueryResults.offsetWidth;
  dayQueryResults.classList.add("is-updated");

  if (results.length === 0) {
    renderDayQueryMessage(`第 ${selectedDayQueryWeek} 周 星期${getWeekdayName(selectedDayQueryDay)}没有课程安排。`);
    return;
  }

  results.forEach((course) => {
    dayQueryResults.appendChild(createDayQueryResult(course));
  });
}

function openModal(modal, sourceElement) {
  modal.hidden = false;
  modal.classList.remove("modal-fade-in");

  const dialog = modal.querySelector(".course-editor, .week-picker, .confirm-dialog");

  if (!dialog) {
    return;
  }

  dialog.classList.remove("modal-grow-from-cell");
  dialog.style.removeProperty("--modal-start-x");
  dialog.style.removeProperty("--modal-start-y");

  if (!sourceElement) {
    return;
  }

  void modal.offsetWidth;
  modal.classList.add("modal-fade-in");

  const sourceRect = sourceElement.getBoundingClientRect();
  const dialogRect = dialog.getBoundingClientRect();
  const sourceCenterX = sourceRect.left + sourceRect.width / 2;
  const sourceCenterY = sourceRect.top + sourceRect.height / 2;
  const dialogCenterX = dialogRect.left + dialogRect.width / 2;
  const dialogCenterY = dialogRect.top + dialogRect.height / 2;

  dialog.style.setProperty("--modal-start-x", `${sourceCenterX - dialogCenterX}px`);
  dialog.style.setProperty("--modal-start-y", `${sourceCenterY - dialogCenterY}px`);
  void dialog.offsetWidth;
  dialog.classList.add("modal-grow-from-cell");
  dialog.addEventListener("animationend", () => {
    dialog.classList.remove("modal-grow-from-cell");
  }, { once: true });
}

function closeModal(modal) {
  modal.hidden = true;
}

function updateWeekSummary() {
  if (selectedWeeks.size === totalWeeks) {
    weekSummary.textContent = `第 1-${totalWeeks} 周`;
    return;
  }

  if (selectedWeeks.size === 0) {
    weekSummary.textContent = "请选择周数";
    return;
  }

  const weeks = [...selectedWeeks].sort((a, b) => a - b);
  weekSummary.textContent = `第 ${weeks.join("、")} 周`;
}

function resetCourseForm() {
  courseNameInput.value = "";
  courseRoomInput.value = "";
  courseTeacherInput.value = "";
}

function resetWeekSelection() {
  selectedWeeks.clear();

  for (let week = 1; week <= totalWeeks; week += 1) {
    selectedWeeks.add(week);
  }

  weekModeButtons.forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.mode === "all");
  });
  updateWeekSummary();
  renderWeekPicker();
}

function getSelectedWeeksText() {
  return getWeeksText([...selectedWeeks]);
}

function renderWeekPicker() {
  weekGrid.innerHTML = "";

  for (let week = 1; week <= totalWeeks; week += 1) {
    const button = document.createElement("button");
    button.className = `week-item${selectedWeeks.has(week) ? " is-selected" : ""}`;
    button.type = "button";
    button.textContent = week;
    button.dataset.week = week;
    weekGrid.appendChild(button);
  }
}

function setWeekMode(mode) {
  selectedWeeks.clear();

  for (let week = 1; week <= totalWeeks; week += 1) {
    if (mode === "all" || (mode === "odd" && week % 2 === 1) || (mode === "even" && week % 2 === 0)) {
      selectedWeeks.add(week);
    }
  }

  weekModeButtons.forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.mode === mode);
  });
  updateWeekSummary();
  renderWeekPicker();
}

function openCourseEditor(day, period, sourceElement) {
  activeSlot = { day, period };
  resetCourseForm();
  resetWeekSelection();
  openModal(courseModal, sourceElement);
  courseNameInput.focus();
}

function openDeleteConfirm(courseId) {
  const course = courses.find((item) => item.id === courseId);

  if (!course) {
    return;
  }

  pendingDeleteCourseId = courseId;
  deleteMessage.textContent = `确定要删除「${course.name}」吗？删除后该课程将从课程表中移除。`;
  openModal(deleteModal);
  deleteModal.classList.remove("confirm-fade-in");
  deleteModal.querySelector(".confirm-dialog").classList.remove("confirm-pop-in");
  void deleteModal.offsetWidth;
  deleteModal.classList.add("confirm-fade-in");
  deleteModal.querySelector(".confirm-dialog").classList.add("confirm-pop-in");
}

function deletePendingCourse() {
  const courseIndex = courses.findIndex((course) => course.id === pendingDeleteCourseId);

  if (courseIndex !== -1) {
    courses.splice(courseIndex, 1);
    saveCourses();
    renderSchedule();
  }

  pendingDeleteCourseId = "";
  closeModal(deleteModal);
}

function renderWeekdays(direction) {
  const weekDates = getWeekDates(currentWeek);
  const mondayMonth = weekDates[0].getMonth() + 1;
  const previousMonth = weekdayRow.querySelector(".month-number")?.textContent;
  const shouldAnimateMonth = direction && previousMonth !== String(mondayMonth);

  weekdayRow.classList.remove("weekdays-slide-left", "weekdays-slide-right");
  weekdayRow.innerHTML = `
    <div class="month-cell">
      <span class="month-number${shouldAnimateMonth ? " is-changing" : ""}">${mondayMonth}</span>
      <span class="month-unit">月</span>
    </div>
  `;

  weekdays.forEach((weekday, index) => {
    const cell = document.createElement("div");
    cell.className = `weekday-cell${weekday.active ? " is-active" : ""}`;
    cell.style.setProperty("--day-index", index);
    cell.innerHTML = `
      <span class="weekday-name">${weekday.name}</span>
      <span class="date-number">${weekDates[index].getDate()}</span>
    `;
    weekdayRow.appendChild(cell);
  });

  if (direction) {
    void weekdayRow.offsetWidth;
    weekdayRow.classList.add(direction === "next" ? "weekdays-slide-left" : "weekdays-slide-right");
  }
}

function createTimeAxis(period) {
  const axis = document.createElement("button");
  axis.className = "time-axis";
  axis.type = "button";
  axis.dataset.period = period.period;
  axis.innerHTML = `
    <span class="period-number">${period.period}</span>
    <span class="period-time">${period.start}</span>
    <span class="period-time">${period.end}</span>
  `;
  return axis;
}

function createCourseCard(course) {
  const card = document.createElement("article");
  card.className = "course-card";
  card.draggable = true;
  card.dataset.id = course.id;
  card.dataset.color = course.color;

  const deleteButton = document.createElement("button");
  deleteButton.className = "course-delete";
  deleteButton.type = "button";
  deleteButton.setAttribute("aria-label", `删除 ${course.name}`);
  deleteButton.textContent = "×";

  const title = document.createElement("span");
  title.className = "course-title";
  title.textContent = course.name;

  const weeks = document.createElement("span");
  weeks.className = "course-detail";
  weeks.textContent = course.weeksText;

  const teacher = createIconDetail("teacher", course.teacher);
  const room = createIconDetail("room", course.room);

  card.append(deleteButton, title, weeks, teacher, room);
  return card;
}

function createIconDetail(type, text) {
  const detail = document.createElement("span");
  detail.className = "course-detail";

  if (!text) {
    detail.classList.add("is-empty");
    return detail;
  }

  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

  icon.classList.add("course-icon");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  path.setAttribute(
    "d",
    type === "teacher"
      ? "M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4Zm7 8c0-3.3-3.1-6-7-6s-7 2.7-7 6"
      : "M4 21V7l8-4 8 4v14M9 21v-6h6v6M8 10h.01M12 10h.01M16 10h.01"
  );

  icon.appendChild(path);
  detail.append(icon, document.createTextNode(text));
  return detail;
}

function createSlot(day, period) {
  const slot = document.createElement("div");
  slot.className = "schedule-slot";
  slot.dataset.day = day;
  slot.dataset.period = period;
  const slotCourses = courses.filter((course) => {
    return course.day === day && course.period === period && isCourseVisibleInCurrentWeek(course);
  });

  if (slotCourses.length > 0) {
    slot.classList.add("has-course");
  }

  slotCourses.forEach((course) => {
    slot.appendChild(createCourseCard(course));
  });

  return slot;
}

function renderSchedule() {
  scheduleGrid.classList.remove("course-cards-slide-left", "course-cards-slide-right");
  scheduleGrid.innerHTML = "";

  periods.forEach((period) => {
    scheduleGrid.appendChild(createTimeAxis(period));

    weekdays.forEach((weekday) => {
      scheduleGrid.appendChild(createSlot(weekday.day, period.period));
    });
  });
}

function animateScheduleCards(direction) {
  if (!direction) {
    return;
  }

  window.clearTimeout(scheduleAnimationTimer);
  scheduleGrid.classList.remove("course-cards-slide-left", "course-cards-slide-right");
  void scheduleGrid.offsetWidth;
  scheduleGrid.classList.add(direction === "next" ? "course-cards-slide-left" : "course-cards-slide-right");
  scheduleAnimationTimer = window.setTimeout(() => {
    scheduleGrid.classList.remove("course-cards-slide-left", "course-cards-slide-right");
  }, 360);
}

function clearDragState() {
  draggingCourseId = "";
  scheduleGrid.querySelectorAll(".drag-over").forEach((slot) => {
    slot.classList.remove("drag-over");
    delete slot.dataset.dropColor;
  });
  scheduleGrid.querySelectorAll(".drop-pulse").forEach((pulse) => {
    pulse.remove();
  });
  scheduleGrid.querySelectorAll(".is-dragging").forEach((card) => {
    card.classList.remove("is-dragging");
  });
}

function showDropPulse(slot) {
  if (slot.querySelector(".drop-pulse")) {
    return;
  }

  const pulse = document.createElement("span");
  const pulseInner = document.createElement("span");
  pulse.className = "drop-pulse";
  pulseInner.className = "drop-pulse drop-pulse-secondary";
  slot.append(pulse, pulseInner);
}

function applyDropColor(slot) {
  const course = courses.find((item) => item.id === draggingCourseId);

  if (course) {
    slot.dataset.dropColor = course.color;
  }
}

function removeDropPulse(slot) {
  slot.querySelectorAll(".drop-pulse").forEach((pulse) => {
    pulse.remove();
  });
}

renderWeekdays();
updateWeekControls();
renderSchedule();
renderWeekPicker();

weekPrevButton.addEventListener("click", () => switchWeek("prev"));
weekNextButton.addEventListener("click", () => switchWeek("next"));
openCourseQueryButton.addEventListener("click", openCourseQuery);
openDayQueryButton.addEventListener("click", openDayQuery);

scheduleGrid.addEventListener("click", (event) => {
  if (event.target.closest(".course-card")) {
    return;
  }

  const slot = event.target.closest(".schedule-slot");

  if (!slot) {
    return;
  }

  openCourseEditor(Number(slot.dataset.day), Number(slot.dataset.period), slot);
});

scheduleGrid.addEventListener("dragstart", (event) => {
  const card = event.target.closest(".course-card");

  if (!card || event.target.closest(".course-delete")) {
    return;
  }

  draggingCourseId = card.dataset.id;
  card.classList.add("is-dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", draggingCourseId);
});

scheduleGrid.addEventListener("dragover", (event) => {
  const slot = event.target.closest(".schedule-slot");

  if (!slot || !draggingCourseId) {
    return;
  }

  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  scheduleGrid.querySelectorAll(".drag-over").forEach((item) => {
    if (item !== slot) {
      item.classList.remove("drag-over");
      delete item.dataset.dropColor;
      removeDropPulse(item);
    }
  });
  slot.classList.add("drag-over");
  applyDropColor(slot);
  showDropPulse(slot);
});

scheduleGrid.addEventListener("dragleave", (event) => {
  const slot = event.target.closest(".schedule-slot");

  if (!slot || slot.contains(event.relatedTarget)) {
    return;
  }

  slot.classList.remove("drag-over");
  delete slot.dataset.dropColor;
  removeDropPulse(slot);
});

scheduleGrid.addEventListener("drop", (event) => {
  const slot = event.target.closest(".schedule-slot");
  const courseId = event.dataTransfer.getData("text/plain") || draggingCourseId;

  if (!slot || !courseId) {
    clearDragState();
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const course = courses.find((item) => item.id === courseId);

  if (course) {
    course.day = Number(slot.dataset.day);
    course.period = Number(slot.dataset.period);
    saveCourses();
    renderSchedule();
  }

  clearDragState();
});

scheduleGrid.addEventListener("dragend", clearDragState);

courseCancelButton.addEventListener("click", () => closeModal(courseModal));
courseForm.addEventListener("submit", (event) => event.preventDefault());
courseQueryCancelButton.addEventListener("click", () => closeModal(courseQueryModal));
courseQuerySubmitButton.addEventListener("click", queryCourseTime);
courseQueryNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    queryCourseTime();
  }
});
dayQueryCancelButton.addEventListener("click", () => closeModal(dayQueryModal));
dayQuerySubmitButton.addEventListener("click", queryDaySchedule);
dayQueryWeekPrevButton.addEventListener("click", () => changeDayQueryWeek("prev"));
dayQueryWeekNextButton.addEventListener("click", () => changeDayQueryWeek("next"));
dayQueryDayButtons.forEach((button) => {
  button.addEventListener("click", () => {
    updateDayQuerySelection(button.dataset.day);
    clearDayQueryResults();
  });
});
courseDoneButton.addEventListener("click", () => {
  const courseName = courseNameInput.value.trim() || "未命名课程";

  courses.push({
    id: `course-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: courseName,
    teacher: courseTeacherInput.value.trim(),
    room: courseRoomInput.value.trim(),
    day: activeSlot.day,
    period: activeSlot.period,
    weeks: normalizeWeeks([...selectedWeeks]),
    weeksText: getSelectedWeeksText(),
    color: getRandomCourseColor()
  });

  saveCourses();
  closeModal(courseModal);
  renderSchedule();
});
openWeekPickerButton.addEventListener("click", () => openModal(weekModal));
weekCancelButton.addEventListener("click", () => closeModal(weekModal));
weekDoneButton.addEventListener("click", () => {
  updateWeekSummary();
  closeModal(weekModal);
});
deleteCancelButton.addEventListener("click", () => {
  pendingDeleteCourseId = "";
  closeModal(deleteModal);
});
deleteConfirmButton.addEventListener("click", deletePendingCourse);

courseModal.addEventListener("click", (event) => {
  if (event.target === courseModal) {
    closeModal(courseModal);
  }
});

weekModal.addEventListener("click", (event) => {
  if (event.target === weekModal) {
    closeModal(weekModal);
  }
});

courseQueryModal.addEventListener("click", (event) => {
  if (event.target === courseQueryModal) {
    closeModal(courseQueryModal);
  }
});

dayQueryModal.addEventListener("click", (event) => {
  if (event.target === dayQueryModal) {
    closeModal(dayQueryModal);
  }
});

deleteModal.addEventListener("click", (event) => {
  if (event.target === deleteModal) {
    pendingDeleteCourseId = "";
    closeModal(deleteModal);
  }
});

weekModeButtons.forEach((button) => {
  button.addEventListener("click", () => setWeekMode(button.dataset.mode));
});

weekGrid.addEventListener("click", (event) => {
  const weekButton = event.target.closest(".week-item");

  if (!weekButton) {
    return;
  }

  const week = Number(weekButton.dataset.week);

  if (selectedWeeks.has(week)) {
    selectedWeeks.delete(week);
  } else {
    selectedWeeks.add(week);
  }

  weekModeButtons.forEach((button) => button.classList.remove("is-selected"));
  updateWeekSummary();
  renderWeekPicker();
});

scheduleGrid.addEventListener("click", (event) => {
  const deleteButton = event.target.closest(".course-delete");

  if (!deleteButton) {
    return;
  }

  event.stopPropagation();
  const card = deleteButton.closest(".course-card");
  openDeleteConfirm(card.dataset.id);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  closeModal(weekModal);
  closeModal(deleteModal);
  closeModal(courseModal);
  closeModal(courseQueryModal);
  closeModal(dayQueryModal);
  pendingDeleteCourseId = "";
});
