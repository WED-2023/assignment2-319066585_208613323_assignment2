var canvas;
var context;

var users = [ { username: "p", password: "testuser" } ];
var keysPressed = {};
var shootKey = ' ';

var shipColor = "#00ffcc";
var enemyColor = "#ff4444";
var gameDuration = 120;

var player = {
  x: 400,
  y: 550,
  width: 40,
  height: 20,
  speed: 5
};

window.addEventListener("load", setupGame, false);


function setupGame() {
  canvas = document.getElementById("gameCanvas");
  context = canvas.getContext("2d");
  loadBirthDateOptions();
  showScreen("welcome");
}


function loadBirthDateOptions() {
  const yearSelect = document.getElementById("birthDay");
  const monthSelect = document.getElementById("birthMonth");
  const daySelect = document.getElementById("birthYear");

  for (let d = 1; d <= 31; d++) {
    daySelect.append(new Option(d, d));
  }
  for (let m = 1; m <= 12; m++) {
    monthSelect.append(new Option(m, m));
  }
  for (let y = 1900; y <= new Date().getFullYear(); y++) {
    yearSelect.append(new Option(y, y));
  }
}


function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.style.display = screen.id === screenId ? "block" : "none";
  });
}


function validateRegisterForm() {
  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPass").value;
  const confirmPassword = document.getElementById("regPassConf").value;
  const firstName = document.getElementById("regFirstName").value.trim();
  const lastName = document.getElementById("regLastName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const errorDiv = document.getElementById("registerError");

  if (!username || !password || !confirmPassword || !firstName || !lastName || !email) {
    errorDiv.textContent = "All fields are required.";
    return false;
  }
  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
    errorDiv.textContent = "Password must be at least 8 characters and include letters and numbers.";
    return false;
  }
  if (password !== confirmPassword) {
    errorDiv.textContent = "Passwords do not match.";
    return false;
  }
  if (!/^[A-Za-z]+$/.test(firstName) || !/^[A-Za-z]+$/.test(lastName)) {
    errorDiv.textContent = "First and Last name must contain only letters.";
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errorDiv.textContent = "Invalid email format.";
    return false;
  }
  users.push({ username, password });
  alert("Registration successful! You can now log in.");
  showScreen("login");
  return false;
}


function validateLoginForm() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPass").value;
  const errorDiv = document.getElementById("loginError");
  const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    errorDiv.textContent = "Invalid username or password.";
    return false;
  }
  alert("Login successful!");
  showScreen("config");
  return false;
}


function startGame() {
  shootKey = document.getElementById("shootKey").value.trim() || ' ';
  gameDuration = parseInt(document.getElementById("gameTime").value) * 60;
  shipColor = document.getElementById("shipColor").value;
  enemyColor = document.getElementById("enemyColor").value;

  if (gameDuration < 120) {
    alert("Minimum duration is 2 minutes.");
    return;
  }

  showScreen("game");
  gameLoop();
}


function gameLoop() {
  clearCanvas();
  updatePlayer();
  drawPlayer();
  requestAnimationFrame(gameLoop);
}


function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}


function updatePlayer() {
  if (keysPressed["ArrowLeft"] && player.x > 0) player.x -= player.speed;
  if (keysPressed["ArrowRight"] && player.x + player.width < canvas.width) player.x += player.speed;
  if (keysPressed["ArrowUp"] && player.y > canvas.height * 0.6) player.y -= player.speed;
  if (keysPressed["ArrowDown"] && player.y + player.height < canvas.height) player.y += player.speed;
}


function drawPlayer() {
  context.fillStyle = shipColor;
  context.fillRect(player.x, player.y, player.width, player.height);
}


function openAbout() {
  document.getElementById("aboutModal").style.display = "block";
}


function closeAbout() {
  document.getElementById("aboutModal").style.display = "none";
}


window.addEventListener("keydown", e => {
  if (e.key === "Escape") closeAbout();
  keysPressed[e.key] = true;
});


window.addEventListener("keyup", e => {
  keysPressed[e.key] = false;
});


window.addEventListener("click", e => {
  const modal = document.getElementById("aboutModal");
  if (e.target === modal) closeAbout();
});
