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
const weekSummary = document.querySelector("#week-summary");
const weekGrid = document.querySelector("#week-grid");
const courseNameInput = document.querySelector("#course-name");
const courseRoomInput = document.querySelector("#course-room");
const courseTeacherInput = document.querySelector("#course-teacher");
const courseForm = document.querySelector(".course-form");
const courseCancelButton = document.querySelector("#course-cancel");
const courseDoneButton = document.querySelector("#course-done");
const openWeekPickerButton = document.querySelector("#open-week-picker");
const weekCancelButton = document.querySelector("#week-cancel");
const weekDoneButton = document.querySelector("#week-done");
const weekModeButtons = document.querySelectorAll(".week-mode");

const totalWeeks = 16;
const selectedWeeks = new Set(Array.from({ length: totalWeeks }, (_, index) => index + 1));
const courseColors = Array.from({ length: 15 }, (_, index) => `card-${index + 1}`);
let activeSlot = { day: 1, period: 1 };

function getWeekdayName(day) {
  return weekdays.find((weekday) => weekday.day === day)?.name || "";
}

function getPeriod(period) {
  return periods.find((item) => item.period === period);
}

function getRandomCourseColor() {
  return courseColors[Math.floor(Math.random() * courseColors.length)];
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

function resetCourseForm() {
  courseNameInput.value = "";
  courseRoomInput.value = "";
  courseTeacherInput.value = "";
}

function getSelectedWeeksText() {
  if (selectedWeeks.size === totalWeeks) {
    return `第01-${String(totalWeeks).padStart(2, "0")}周`;
  }

  if (selectedWeeks.size === 0) {
    return "未选择周数";
  }

  return `第${[...selectedWeeks]
    .sort((a, b) => a - b)
    .map((week) => String(week).padStart(2, "0"))
    .join("、")}周`;
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
  activeSlot = { day, period };
  resetCourseForm();
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
    <button class="course-delete" type="button" aria-label="删除 ${course.name}">×</button>
    <span class="course-title">${course.name}</span>
    <span class="course-detail">${course.weeksText}</span>
    <span class="course-detail">
      <svg class="course-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4Zm7 8c0-3.3-3.1-6-7-6s-7 2.7-7 6" />
      </svg>
      ${course.teacher || "未填写老师"}
    </span>
    <span class="course-detail">
      <svg class="course-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 21V7l8-4 8 4v14M9 21v-6h6v6M8 10h.01M12 10h.01M16 10h.01" />
      </svg>
      ${course.room || "未填写地点"}
    </span>
  `;
  return card;
}

function createSlot(day, period) {
  const slot = document.createElement("div");
  slot.className = "schedule-slot";
  slot.dataset.day = day;
  slot.dataset.period = period;
  const slotCourses = courses.filter((course) => course.day === day && course.period === period);

  if (slotCourses.length > 0) {
    slot.classList.add("has-course");
  }

  slotCourses.forEach((course) => {
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
  if (event.target.closest(".course-card")) {
    return;
  }

  const slot = event.target.closest(".schedule-slot");

  if (!slot) {
    return;
  }

  openCourseEditor(Number(slot.dataset.day), Number(slot.dataset.period));
});

courseCancelButton.addEventListener("click", () => closeModal(courseModal));
courseForm.addEventListener("submit", (event) => event.preventDefault());
courseDoneButton.addEventListener("click", () => {
  const courseName = courseNameInput.value.trim() || "未命名课程";

  courses.push({
    id: `course-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: courseName,
    teacher: courseTeacherInput.value.trim(),
    room: courseRoomInput.value.trim(),
    day: activeSlot.day,
    period: activeSlot.period,
    weeksText: getSelectedWeeksText(),
    color: getRandomCourseColor()
  });

  closeModal(courseModal);
  renderSchedule();
});
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

scheduleGrid.addEventListener("click", (event) => {
  const deleteButton = event.target.closest(".course-delete");

  if (!deleteButton) {
    return;
  }

  event.stopPropagation();
  const card = deleteButton.closest(".course-card");
  const courseIndex = courses.findIndex((course) => course.id === card.dataset.id);

  if (courseIndex !== -1) {
    courses.splice(courseIndex, 1);
    renderSchedule();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  closeModal(weekModal);
  closeModal(courseModal);
});
