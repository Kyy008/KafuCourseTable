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
