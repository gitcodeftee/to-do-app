const addBtn = document.getElementById("addBtn");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

const allBtn = document.getElementById("allBtn");
const activeBtn = document.getElementById("activeBtn");
const completedBtn = document.getElementById("completedBtn");
const toggleBtn = document.getElementById("toggleMode");

let points = 0;
let level = 1;

window.onload = function () {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  points = parseInt(localStorage.getItem("points")) || 0;

  tasks.forEach(task => createTask(task.text, task.completed));

  updateGamification();

  if (localStorage.getItem("mode") === "light") {
    document.body.classList.add("light-mode");
    toggleBtn.textContent = "☀️";
  }
};

function saveTasks() {
  const allTasks = [];
  document.querySelectorAll("li").forEach(li => {
    allTasks.push({
      text: li.childNodes[0].textContent,
      completed: li.classList.contains("completed")
    });
  });

  localStorage.setItem("tasks", JSON.stringify(allTasks));
  localStorage.setItem("points", points);
}

function createTask(text, completed = false) {
  if (text === "") return;

  const li = document.createElement("li");
  li.textContent = text;
  li.setAttribute("draggable", "true");

  if (completed) li.classList.add("completed");

  // COMPLETE
  li.addEventListener("click", function () {
    li.classList.toggle("completed");

    if (li.classList.contains("completed")) points += 10;
    else points -= 10;

    updateGamification();
    saveTasks();
  });

  // EDIT
  const editBtn = document.createElement("button");
  editBtn.textContent = "✏️";

  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    const input = document.createElement("input");
    input.value = li.firstChild.textContent;

    li.firstChild.replaceWith(input);
    input.focus();

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        input.replaceWith(document.createTextNode(input.value));
        saveTasks();
      }
    });
  });

  // DELETE
  const delBtn = document.createElement("button");
  delBtn.textContent = "🗑";

  delBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    li.classList.add("remove");

    setTimeout(() => {
      li.remove();
      saveTasks();
    }, 300);
  });

  li.appendChild(editBtn);
  li.appendChild(delBtn);

  taskList.appendChild(li);

  saveTasks();

  // DRAG
  li.addEventListener("dragstart", () => li.classList.add("dragging"));
  li.addEventListener("dragend", () => {
    li.classList.remove("dragging");
    saveTasks();
  });
}

// DRAG LOGIC
taskList.addEventListener("dragover", (e) => {
  e.preventDefault();
  const after = getDragAfter(taskList, e.clientY);
  const dragging = document.querySelector(".dragging");

  if (after == null) taskList.appendChild(dragging);
  else taskList.insertBefore(dragging, after);
});

function getDragAfter(container, y) {
  const items = [...container.querySelectorAll("li:not(.dragging)")];

  return items.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;

    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// ADD TASK
addBtn.addEventListener("click", () => {
  createTask(taskInput.value);
  taskInput.value = "";
});

taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    createTask(taskInput.value);
    taskInput.value = "";
  }
});

// FILTERS
function filter(type) {
  document.querySelectorAll("li").forEach(li => {
    if (type === "all") li.style.display = "flex";
    else if (type === "active")
      li.style.display = li.classList.contains("completed") ? "none" : "flex";
    else
      li.style.display = li.classList.contains("completed") ? "flex" : "none";
  });
}

allBtn.onclick = () => filter("all");
activeBtn.onclick = () => filter("active");
completedBtn.onclick = () => filter("completed");

// DARK MODE
toggleBtn.onclick = () => {
  document.body.classList.toggle("light-mode");

  const mode = document.body.classList.contains("light-mode") ? "light" : "dark";
  localStorage.setItem("mode", mode);

  toggleBtn.textContent = mode === "light" ? "☀️" : "🌙";
};

// GAMIFICATION
function updateGamification() {
  document.getElementById("points").textContent = points;

  if (points >= 120) level = 3;
  else if (points >= 50) level = 2;
  else level = 1;

  document.getElementById("level").textContent = level;

  document.getElementById("progress").style.width =
    (points % 50) * 2 + "%";
}