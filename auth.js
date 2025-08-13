// Enhanced Authentication functionality with registration
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is already logged in
  const currentUser = localStorage.getItem("csuCurrentUser")
  if (currentUser) {
    window.location.href = "dashboard.html"
    return
  }

  // Get form elements
  const loginTab = document.getElementById("loginTab")
  const registerTab = document.getElementById("registerTab")
  const loginForm = document.getElementById("loginForm")
  const registerForm = document.getElementById("registerForm")

  loginTab.addEventListener("click", () => {
    loginTab.classList.add("active")
    registerTab.classList.remove("active")
    loginForm.classList.remove("hidden")
    registerForm.classList.add("hidden")
  })

  registerTab.addEventListener("click", () => {
    registerTab.classList.add("active")
    loginTab.classList.remove("active")
    registerForm.classList.remove("hidden")
    loginForm.classList.add("hidden")
  })

  function getRegisteredUsers() {
    const users = localStorage.getItem("csuRegisteredUsers")
    return users ? JSON.parse(users) : {}
  }

  function saveUser(email, password) {
    const users = getRegisteredUsers()
    users[email] = password
    localStorage.setItem("csuRegisteredUsers", JSON.stringify(users))
  }

  function validateEmail(email) {
    return email.endsWith("@carsu.edu.ph")
  }

  function clearErrors() {
    document.querySelectorAll(".error-message").forEach((error) => {
      error.textContent = ""
    })
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault()
    clearErrors()

    const email = document.getElementById("loginEmail").value.trim()
    const password = document.getElementById("loginPassword").value
    const emailError = document.getElementById("loginEmailError")
    const passwordError = document.getElementById("loginPasswordError")

    // Validate email domain
    if (!validateEmail(email)) {
      emailError.textContent = "Please use your Caraga State University email address (@carsu.edu.ph)"
      return
    }

    // Check if user exists
    const registeredUsers = getRegisteredUsers()
    if (!registeredUsers[email]) {
      emailError.textContent = "This email is not registered. Please register first."
      return
    }

    // Check password
    if (registeredUsers[email] !== password) {
      passwordError.textContent = "Incorrect password."
      return
    }

    // Successful login
    localStorage.setItem("csuCurrentUser", email)
    window.location.href = "dashboard.html"
  })

  registerForm.addEventListener("submit", (e) => {
    e.preventDefault()
    clearErrors()

    const email = document.getElementById("registerEmail").value.trim()
    const password = document.getElementById("registerPassword").value
    const confirmPassword = document.getElementById("confirmPassword").value
    const emailError = document.getElementById("registerEmailError")
    const passwordError = document.getElementById("registerPasswordError")
    const confirmError = document.getElementById("confirmPasswordError")

    // Validate email domain
    if (!validateEmail(email)) {
      emailError.textContent = "Please use your Caraga State University email address (@carsu.edu.ph)"
      return
    }

    // Check if user already exists
    const registeredUsers = getRegisteredUsers()
    if (registeredUsers[email]) {
      emailError.textContent = "This email is already registered. Please sign in instead."
      return
    }

    // Validate password length
    if (password.length < 6) {
      passwordError.textContent = "Password must be at least 6 characters long."
      return
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      confirmError.textContent = "Passwords do not match."
      return
    }

    // Register user
    saveUser(email, password)

    // Auto login after registration
    localStorage.setItem("csuCurrentUser", email)
    window.location.href = "dashboard.html"
  })

  document.getElementById("loginEmail").addEventListener("input", (e) => {
    const email = e.target.value.trim()
    const emailError = document.getElementById("loginEmailError")
    if (email && !validateEmail(email)) {
      emailError.textContent = "Must be a @carsu.edu.ph email address"
    } else {
      emailError.textContent = ""
    }
  })

  document.getElementById("registerEmail").addEventListener("input", (e) => {
    const email = e.target.value.trim()
    const emailError = document.getElementById("registerEmailError")
    if (email && !validateEmail(email)) {
      emailError.textContent = "Must be a @carsu.edu.ph email address"
    } else {
      emailError.textContent = ""
    }
  })

  document.getElementById("confirmPassword").addEventListener("input", (e) => {
    const password = document.getElementById("registerPassword").value
    const confirmPassword = e.target.value
    const confirmError = document.getElementById("confirmPasswordError")

    if (confirmPassword && password !== confirmPassword) {
      confirmError.textContent = "Passwords do not match"
    } else {
      confirmError.textContent = ""
    }
  })
})
