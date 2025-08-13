// Authentication functionality
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is already logged in
  const currentUser = localStorage.getItem("csuCurrentUser")
  if (currentUser) {
    window.location.href = "dashboard.html"
    return
  }

  const loginForm = document.getElementById("loginForm")
  const emailInput = document.getElementById("email")
  const passwordInput = document.getElementById("password")
  const emailError = document.getElementById("emailError")
  const passwordError = document.getElementById("passwordError")

  // Valid credentials (in a real app, this would be handled by a backend)
  const validCredentials = {
    "kirsteingenzen.nojapa@carsu.edu.ph": "kirsteingenzen.nojapa123!",
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const email = emailInput.value.trim()
    const password = passwordInput.value

    // Clear previous errors
    emailError.textContent = ""
    passwordError.textContent = ""

    // Validate email domain
    if (!email.endsWith("@carsu.edu.ph")) {
      emailError.textContent = "Please use your Caraga State University email address (@carsu.edu.ph)"
      return
    }

    // Check credentials
    if (!validCredentials[email]) {
      emailError.textContent = "This email is not registered in our system."
      return
    }

    if (validCredentials[email] !== password) {
      passwordError.textContent = "Incorrect password."
      return
    }

    // Successful login
    localStorage.setItem("csuCurrentUser", email)
    window.location.href = "dashboard.html"
  })

  // Real-time email validation
  emailInput.addEventListener("input", () => {
    const email = emailInput.value.trim()
    if (email && !email.endsWith("@carsu.edu.ph")) {
      emailError.textContent = "Must be a @carsu.edu.ph email address"
    } else {
      emailError.textContent = ""
    }
  })
})
