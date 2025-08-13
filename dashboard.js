// Dashboard functionality
document.addEventListener("DOMContentLoaded", () => {
  // Check authentication
  const currentUser = localStorage.getItem("csuCurrentUser")
  if (!currentUser) {
    window.location.href = "index.html"
    return
  }

  // Display user email
  document.getElementById("userEmail").textContent = currentUser

  // Initialize data
  let tasks = JSON.parse(localStorage.getItem("csuTasks")) || []
  let classes = JSON.parse(localStorage.getItem("csuClasses")) || []
  let currentFilter = "all"
  let editingTaskId = null

  // DOM elements
  const logoutBtn = document.getElementById("logoutBtn")
  const addTaskBtn = document.getElementById("addTaskBtn")
  const addClassBtn = document.getElementById("addClassBtn")
  const taskModal = document.getElementById("taskModal")
  const classModal = document.getElementById("classModal")
  const taskForm = document.getElementById("taskForm")
  const classForm = document.getElementById("classForm")
  const tasksList = document.getElementById("tasksList")
  const scheduleList = document.getElementById("scheduleList")
  const filterBtns = document.querySelectorAll(".filter-btn")

  // Event listeners
  logoutBtn.addEventListener("click", logout)
  addTaskBtn.addEventListener("click", () => openTaskModal())
  addClassBtn.addEventListener("click", () => openClassModal())
  taskForm.addEventListener("submit", saveTask)
  classForm.addEventListener("submit", saveClass)

  // Modal close events
  document.getElementById("closeTaskModal").addEventListener("click", closeTaskModal)
  document.getElementById("closeClassModal").addEventListener("click", closeClassModal)
  document.getElementById("cancelTask").addEventListener("click", closeTaskModal)
  document.getElementById("cancelClass").addEventListener("click", closeClassModal)

  // Filter events
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")
      currentFilter = btn.dataset.filter
      renderTasks()
    })
  })

  // Close modals when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === taskModal) closeTaskModal()
    if (e.target === classModal) closeClassModal()
  })

  // Functions
  function logout() {
    localStorage.removeItem("csuCurrentUser")
    window.location.href = "index.html"
  }

  function openTaskModal(task = null) {
    editingTaskId = task ? task.id : null
    const modalTitle = document.getElementById("modalTitle")

    if (task) {
      modalTitle.textContent = "Edit Task"
      document.getElementById("taskTitle").value = task.title
      document.getElementById("taskDescription").value = task.description
      document.getElementById("taskDueDate").value = task.dueDate
      document.getElementById("taskPriority").value = task.priority
      document.getElementById("taskCategory").value = task.category
    } else {
      modalTitle.textContent = "Add New Task"
      taskForm.reset()
    }

    taskModal.classList.add("active")
  }

  function closeTaskModal() {
    taskModal.classList.remove("active")
    taskForm.reset()
    editingTaskId = null
  }

  function openClassModal() {
    classModal.classList.add("active")
  }

  function closeClassModal() {
    classModal.classList.remove("active")
    classForm.reset()
  }

  function saveTask(e) {
    e.preventDefault()

    const taskData = {
      id: editingTaskId || Date.now(),
      title: document.getElementById("taskTitle").value,
      description: document.getElementById("taskDescription").value,
      dueDate: document.getElementById("taskDueDate").value,
      priority: document.getElementById("taskPriority").value,
      category: document.getElementById("taskCategory").value,
      completed: false,
      createdAt: editingTaskId ? tasks.find((t) => t.id === editingTaskId).createdAt : new Date().toISOString(),
    }

    if (editingTaskId) {
      const index = tasks.findIndex((t) => t.id === editingTaskId)
      tasks[index] = taskData
    } else {
      tasks.push(taskData)
    }

    localStorage.setItem("csuTasks", JSON.stringify(tasks))
    renderTasks()
    closeTaskModal()
  }

  function saveClass(e) {
    e.preventDefault()

    const selectedDays = Array.from(document.querySelectorAll("#classDays input:checked")).map((cb) => cb.value)

    const classData = {
      id: Date.now(),
      name: document.getElementById("className").value,
      instructor: document.getElementById("classInstructor").value,
      room: document.getElementById("classRoom").value,
      days: selectedDays,
      startTime: document.getElementById("classStartTime").value,
      endTime: document.getElementById("classEndTime").value,
    }

    classes.push(classData)
    localStorage.setItem("csuClasses", JSON.stringify(classes))
    renderSchedule()
    closeClassModal()
  }

  function deleteTask(id) {
    if (confirm("Are you sure you want to delete this task?")) {
      tasks = tasks.filter((t) => t.id !== id)
      localStorage.setItem("csuTasks", JSON.stringify(tasks))
      renderTasks()
    }
  }

  function toggleTask(id) {
    const task = tasks.find((t) => t.id === id)
    task.completed = !task.completed
    localStorage.setItem("csuTasks", JSON.stringify(tasks))
    renderTasks()
  }

  function deleteClass(id) {
    if (confirm("Are you sure you want to delete this class?")) {
      classes = classes.filter((c) => c.id !== id)
      localStorage.setItem("csuClasses", JSON.stringify(classes))
      renderSchedule()
    }
  }

  function isOverdue(dueDate) {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  function formatDate(dateString) {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  function formatTime(timeString) {
    const [hours, minutes] = timeString.split(":")
    const date = new Date()
    date.setHours(hours, minutes)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  function getTodayClasses() {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
    return classes.filter((c) => c.days.includes(today))
  }

  function renderTasks() {
    let filteredTasks = tasks

    switch (currentFilter) {
      case "pending":
        filteredTasks = tasks.filter((t) => !t.completed)
        break
      case "completed":
        filteredTasks = tasks.filter((t) => t.completed)
        break
      case "overdue":
        filteredTasks = tasks.filter((t) => !t.completed && isOverdue(t.dueDate))
        break
    }

    // Sort by due date
    filteredTasks.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate) - new Date(b.dueDate)
    })

    if (filteredTasks.length === 0) {
      tasksList.innerHTML = `
                <div class="empty-state">
                    <h3>No tasks found</h3>
                    <p>Add a new task to get started!</p>
                </div>
            `
      return
    }

    tasksList.innerHTML = filteredTasks
      .map(
        (task) => `
            <div class="task-item ${task.completed ? "completed" : ""} ${!task.completed && isOverdue(task.dueDate) ? "overdue" : ""}">
                <div class="task-header">
                    <div class="task-title">${task.title}</div>
                    <div class="task-priority ${task.priority}">${task.priority.toUpperCase()}</div>
                </div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ""}
                <div class="task-meta">
                    <div>
                        <span class="task-category">${task.category.toUpperCase()}</span>
                        ${task.dueDate ? ` • Due: ${formatDate(task.dueDate)}` : ""}
                    </div>
                    <div class="task-actions">
                        <button class="complete-btn" onclick="toggleTask(${task.id})">
                            ${task.completed ? "Undo" : "Complete"}
                        </button>
                        <button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
                        <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
                    </div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  function renderSchedule() {
    const todayClasses = getTodayClasses()

    if (classes.length === 0) {
      scheduleList.innerHTML = `
                <div class="empty-state">
                    <h3>No classes scheduled</h3>
                    <p>Add your class schedule to get started!</p>
                </div>
            `
      return
    }

    scheduleList.innerHTML = classes
      .map(
        (classItem) => `
            <div class="schedule-item ${todayClasses.includes(classItem) ? "today" : ""}">
                <div class="class-name">${classItem.name}</div>
                ${classItem.instructor ? `<div class="class-instructor">Prof. ${classItem.instructor}</div>` : ""}
                <div class="class-details">
                    <div>
                        <div class="class-time">${formatTime(classItem.startTime)} - ${formatTime(classItem.endTime)}</div>
                        <div>${classItem.days.map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(", ")}</div>
                    </div>
                    <div>
                        ${classItem.room ? `Room ${classItem.room}` : ""}
                        <button class="delete-btn" onclick="deleteClass(${classItem.id})" style="margin-left: 8px;">Delete</button>
                    </div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  // Make functions global for onclick handlers
  window.deleteTask = deleteTask
  window.toggleTask = toggleTask
  window.deleteClass = deleteClass
  window.editTask = (id) => {
    const task = tasks.find((t) => t.id === id)
    openTaskModal(task)
  }

  // Initial render
  renderTasks()
  renderSchedule()

  // Check for upcoming deadlines and show notifications
  function checkDeadlines() {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const upcomingTasks = tasks.filter((task) => {
      if (task.completed || !task.dueDate) return false
      const dueDate = new Date(task.dueDate)
      return dueDate <= tomorrow && dueDate > now
    })

    if (upcomingTasks.length > 0) {
      const taskNames = upcomingTasks.map((t) => t.title).join(", ")
      setTimeout(() => {
        alert(`Reminder: You have ${upcomingTasks.length} task(s) due soon: ${taskNames}`)
      }, 2000)
    }
  }

  checkDeadlines()
})
