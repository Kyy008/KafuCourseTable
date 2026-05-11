const weekdays = [
  { day: 1, name: "一", date: 4 },
  { day: 2, name: "二", date: 5 },
  { day: 3, name: "三", date: 6 },
  { day: 4, name: "四", date: 7 },
  { day: 5, name: "五", date: 8 },
  { day: 6, name: "六", date: 9, active: true },
  { day: 7, name: "日", date: 10 }
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

const courses = [];

const weekdayRow = document.querySelector("#weekday-row");
const scheduleGrid = document.querySelector("#schedule-grid");
const courseModal = document.querySelector("#course-modal");
const weekModal = document.querySelector("#week-modal");
const slotSummary = document.querySelector("#slot-summary");
const weekSummary = document.querySelector("#week-summary");
const weekGrid = document.querySelector("#week-grid");
const courseNameInput = document.querySelector("#course-name");
const courseCancelButton = document.querySelector("#course-cancel");
const courseDoneButton = document.querySelector("#course-done");
const openWeekPickerButton = document.querySelector("#open-week-picker");
const weekCancelButton = document.querySelector("#week-cancel");
const weekDoneButton = document.querySelector("#week-done");
const weekModeButtons = document.querySelectorAll(".week-mode");

const totalWeeks = 16;
const selectedWeeks = new Set(Array.from({ length: totalWeeks }, (_, index) => index + 1));

function getWeekdayName(day) {
  return weekdays.find((weekday) => weekday.day === day)?.name || "";
}

function openModal(modal) {
  modal.hidden = false;
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

function openCourseEditor(day, period) {
  slotSummary.textContent = `周${getWeekdayName(day)} 第 ${period} 节`;
  openModal(courseModal);
  courseNameInput.focus();
}

function renderWeekdays() {
  weekdayRow.innerHTML = '<div class="month-cell">5 月</div>';

  weekdays.forEach((weekday) => {
    const cell = document.createElement("div");
    cell.className = `weekday-cell${weekday.active ? " is-active" : ""}`;
    cell.innerHTML = `
      <span class="weekday-name">${weekday.name}</span>
      <span class="date-number">${weekday.date}</span>
    `;
    weekdayRow.appendChild(cell);
  });
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
  card.innerHTML = `
    <span class="course-title">${course.name}</span>
    <span class="course-meta">@ ${course.room}<br>${course.teacher}</span>
  `;
  return card;
}

function createSlot(day, period) {
  const slot = document.createElement("div");
  slot.className = "schedule-slot";
  slot.dataset.day = day;
  slot.dataset.period = period;

  courses
    .filter((course) => course.day === day && course.period === period)
    .forEach((course) => {
      slot.appendChild(createCourseCard(course));
    });

  return slot;
}

function renderSchedule() {
  scheduleGrid.innerHTML = "";

  periods.forEach((period) => {
    scheduleGrid.appendChild(createTimeAxis(period));

    weekdays.forEach((weekday) => {
      scheduleGrid.appendChild(createSlot(weekday.day, period.period));
    });
  });
}

renderWeekdays();
renderSchedule();
renderWeekPicker();

scheduleGrid.addEventListener("click", (event) => {
  const slot = event.target.closest(".schedule-slot");

  if (!slot) {
    return;
  }

  openCourseEditor(Number(slot.dataset.day), Number(slot.dataset.period));
});

courseCancelButton.addEventListener("click", () => closeModal(courseModal));
courseDoneButton.addEventListener("click", () => closeModal(courseModal));
openWeekPickerButton.addEventListener("click", () => openModal(weekModal));
weekCancelButton.addEventListener("click", () => closeModal(weekModal));
weekDoneButton.addEventListener("click", () => {
  updateWeekSummary();
  closeModal(weekModal);
});

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

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  closeModal(weekModal);
  closeModal(courseModal);
});
