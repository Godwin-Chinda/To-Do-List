document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements
  const taskInput = document.getElementById("taskInput");
  const dueDateInput = document.getElementById("dueDate");
  const priorityInput = document.getElementById("priority");
  const addTaskBtn = document.getElementById("addTask");
  const taskList = document.getElementById("taskList");
  const allTasksBtn = document.getElementById("allTasks");
  const pendingTasksBtn = document.getElementById("pendingTasks");
  const completedTasksBtn = document.getElementById("completedTasks");
  const clearCompletedBtn = document.getElementById("clearCompleted");
  const filterPriority = document.getElementById("filterPriority");
  const sortBy = document.getElementById("sortBy");

  // Load tasks from localStorage
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // Save tasks to localStorage
  const saveTasks = () => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  };

  // Sort tasks
  const sortTasks = (tasksToSort) => {
    const sortType = sortBy.value;
    return tasksToSort.sort((a, b) => {
      if (sortType === "date") {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
    });
  };

  // Render tasks based on filters
  const renderTasks = (filter = "all") => {
    taskList.innerHTML = "";

    let filteredTasks = tasks.filter((task) => {
      if (filter === "completed") return task.completed;
      if (filter === "pending") return !task.completed;
      return true;
    });

    // Apply priority filter
    if (filterPriority.value !== "all") {
      filteredTasks = filteredTasks.filter(
        (task) => task.priority === filterPriority.value
      );
    }

    // Sort tasks
    filteredTasks = sortTasks(filteredTasks);

    filteredTasks.forEach((task) => {
      const li = document.createElement("li");
      li.className = "task-item";

      const taskContent = document.createElement("div");
      taskContent.className = "task-content";

      if (task.isEditing) {
        // Show edit form
        taskContent.innerHTML = `
                    <div class="edit-form">
                        <input type="text" class="edit-text" value="${
                          task.text
                        }">
                        <input type="date" class="edit-date" value="${
                          task.dueDate
                        }">
                        <select class="edit-priority">
                            <option value="low" ${
                              task.priority === "low" ? "selected" : ""
                            }>Low Priority</option>
                            <option value="medium" ${
                              task.priority === "medium" ? "selected" : ""
                            }>Medium Priority</option>
                            <option value="high" ${
                              task.priority === "high" ? "selected" : ""
                            }>High Priority</option>
                        </select>
                        <button onclick="saveEdit(${
                          task.id
                        })" class="btn-blue">Save</button>
                    </div>
                `;
      } else {
        // Show task details
        taskContent.innerHTML = `
                    <div class="task-text ${task.completed ? "completed" : ""}">
                        ${task.text}
                    </div>
                    <div class="task-details">
                        <span class="priority-${task.priority}">Priority: ${
          task.priority
        }</span>
                        ${
                          task.dueDate
                            ? ` | Due: ${new Date(
                                task.dueDate
                              ).toLocaleDateString()}`
                            : ""
                        }
                    </div>
                `;
      }

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "task-actions";

      if (!task.isEditing) {
        actionsDiv.innerHTML = `
                    <button class="btn-edit" onclick="editTask(${
                      task.id
                    })">Edit</button>
                    <button class="btn-complete" onclick="toggleTask(${
                      task.id
                    })">
                        ${task.completed ? "Undo" : "Complete"}
                    </button>
                    <button class="btn-delete" onclick="deleteTask(${
                      task.id
                    })">Delete</button>
                `;
      }

      li.appendChild(taskContent);
      li.appendChild(actionsDiv);
      taskList.appendChild(li);
    });
  };

  // Add new task
  const addTask = () => {
    const text = taskInput.value.trim();
    if (!text) return;

    const newTask = {
      id: Date.now(),
      text: text,
      completed: false,
      dueDate: dueDateInput.value,
      priority: priorityInput.value,
      isEditing: false,
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskInput.value = "";
    dueDateInput.value = "";
    priorityInput.value = "low";
  };

  // Toggle task completion
  window.toggleTask = (id) => {
    tasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
    renderTasks();
  };

  // Delete task
  window.deleteTask = (id) => {
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();
    renderTasks();
  };

  // Edit task
  window.editTask = (id) => {
    tasks = tasks.map((task) =>
      task.id === id ? { ...task, isEditing: true } : task
    );
    renderTasks();
  };

  // Save edit
  window.saveEdit = (id) => {
    const taskElement = document.querySelector(
      `li:has([onclick="saveEdit(${id})"])`
    );
    const newText = taskElement.querySelector(".edit-text").value;
    const newDate = taskElement.querySelector(".edit-date").value;
    const newPriority = taskElement.querySelector(".edit-priority").value;

    tasks = tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            text: newText,
            dueDate: newDate,
            priority: newPriority,
            isEditing: false,
          }
        : task
    );
    saveTasks();
    renderTasks();
  };

  // Clear completed tasks
  const clearCompleted = () => {
    tasks = tasks.filter((task) => !task.completed);
    saveTasks();
    renderTasks();
  };

  // Event Listeners
  addTaskBtn.addEventListener("click", addTask);
  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTask();
  });

  allTasksBtn.addEventListener("click", () => renderTasks("all"));
  pendingTasksBtn.addEventListener("click", () => renderTasks("pending"));
  completedTasksBtn.addEventListener("click", () => renderTasks("completed"));
  clearCompletedBtn.addEventListener("click", clearCompleted);

  filterPriority.addEventListener("change", () => renderTasks());
  sortBy.addEventListener("change", () => renderTasks());

  // Initial render
  renderTasks();
});
