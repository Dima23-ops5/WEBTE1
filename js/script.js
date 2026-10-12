const SEMESTER_START = "16.09.2026";
const SEMESTER_END = "09.12.2026";

const DAY_NAMES = { 1: "v pondelok", 2: "v utorok", 3: "v stredu", 4: "vo štvrtok", 5: "v piatok" };
const MINUTES_PER_DAY = 1440;
const MINUTES_PER_WEEK = 7 * MINUTES_PER_DAY;

document.addEventListener("DOMContentLoaded", () => {
  setupFilters();
  highlightCurrentClass();
  updateSemesterProgress();
});

function setupFilters() {
  const buttons = document.querySelectorAll(".filters .btn");
  const cells = document.querySelectorAll(".cell[data-type]");
  const tableWrap = document.querySelector(".table-scroll");
  const emptyMessage = document.getElementById("filterEmptyMessage");

  if (!buttons.length || !tableWrap || !emptyMessage) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((other) => {
        other.classList.remove("btn--active");
        other.setAttribute("aria-pressed", "false");
      });
      button.classList.add("btn--active");
      button.setAttribute("aria-pressed", "true");

      const filter = button.dataset.filter;
      let visibleCount = 0;

      cells.forEach((cell) => {
        const matches = filter === "all" || cell.dataset.type === filter;
        cell.classList.toggle("cell--hidden", !matches);
        if (matches) visibleCount++;
      });

      tableWrap.hidden = visibleCount === 0;
      emptyMessage.hidden = visibleCount !== 0;
    });
  });
}

function toWeekMinutes(day, time) {
  const [hours, minutes] = time.split(":").map(Number);
  return day * MINUTES_PER_DAY + hours * 60 + minutes;
}

function highlightCurrentClass() {
  const cells = Array.from(document.querySelectorAll(".cell[data-day]"));
  const status = document.getElementById("scheduleStatus");

  if (!cells.length || !status) return;

  const now = new Date();
  const today = now.getDay() === 0 ? 7 : now.getDay();
  const nowMinutes = toWeekMinutes(today, `${now.getHours()}:${now.getMinutes()}`);

  const activeCells = [];
  let nextCell = null;
  let nextDistance = Infinity;

  cells.forEach((cell) => {
    const day = Number(cell.dataset.day);
    const start = toWeekMinutes(day, cell.dataset.start);
    const end = toWeekMinutes(day, cell.dataset.end);

    if (nowMinutes >= start && nowMinutes < end) {
      activeCells.push(cell);
    }

    const distance = (start - nowMinutes + MINUTES_PER_WEEK) % MINUTES_PER_WEEK;
    if (distance > 0 && distance < nextDistance) {
      nextDistance = distance;
      nextCell = cell;
    }
  });

  if (activeCells.length) {
    const subjects = activeCells.map((cell) => {
      cell.classList.add("is-now");
      return `${cell.querySelector(".cell-subject").textContent} (do ${cell.dataset.end})`;
    });
    status.textContent = `Práve prebieha: ${subjects.join(", ")}.`;
  } else if (nextCell) {
    const subject = nextCell.querySelector(".cell-subject").textContent;
    const day = Number(nextCell.dataset.day) === today && nextDistance < MINUTES_PER_DAY ? "dnes" : DAY_NAMES[nextCell.dataset.day];
    status.textContent = `Momentálne nemám výučbu. Najbližšia hodina: ${subject}, ${day} o ${nextCell.dataset.start}.`;
  } else {
    status.textContent = "V rozvrhu momentálne nie sú žiadne hodiny.";
  }
}

function parseSemesterDate(value) {
  const [day, month, year] = value.split(".").map(Number);
  return new Date(year, month - 1, day);
}

function updateSemesterProgress() {
  const bar = document.getElementById("semesterProgress");
  const fill = document.getElementById("semesterProgressFill");
  const label = document.getElementById("semesterProgressLabel");

  if (!bar || !fill || !label) return;

  const start = parseSemesterDate(SEMESTER_START);
  const end = parseSemesterDate(SEMESTER_END);
  const now = new Date();

  const percent = Math.round(Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100)));

  fill.style.width = `${percent}%`;
  bar.setAttribute("aria-valuenow", String(percent));

  if (now < start) {
    label.textContent = `Semester ešte nezačal (začína ${SEMESTER_START}).`;
  } else if (now > end) {
    label.textContent = `Semester už skončil (${SEMESTER_END}).`;
  } else {
    label.textContent = `Uplynulo ${percent} % semestra (${SEMESTER_START} – ${SEMESTER_END}).`;
  }
}
