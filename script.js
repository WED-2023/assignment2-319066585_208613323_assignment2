var canvas;
var context;

var users = [ { username: "p", password: "testuser" } ];
var keysPressed = {};
var shootKey = ' ';

var timeElapsed;
var timeLeft;
var timerInterval;
var score = 0;

var currUser = null;
var history = [];
var shipColor = "#00ffcc";
var playerBullets = [];

var enemyColor = "#ff4444";
var gameDuration = 120;
var enemies = [];
var enemySpeed = 2;
var enemyDirection = 1; // 1 for right, -1 for left
var enemyMoveInterval = 1000; // milliseconds


var enemyMoveTimer = null;
var enemyShootInterval = 2000; // milliseconds
var enemyShootTimer = null;
var enemyShootSpeed = 5; // speed of enemy bullets
var enemyBullets = [];
var lives = 3;
var lastEnemyShotTime = 0;



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
  const yearSelect = document.getElementById("birthYear");
  const monthSelect = document.getElementById("birthMonth");
  const daySelect = document.getElementById("birthDay");

  for (let y = 1950; y <= new Date().getFullYear(); y++) {
    yearSelect.append(new Option(y, y));
  }
  for (let m = 1; m <= 12; m++) {
    monthSelect.append(new Option(m, m));
  }
  for (let d = 1; d <= 31; d++) {
    daySelect.append(new Option(d, d));
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
  currUser = username;
  history = [];
  alert("Login successful!");
  showScreen("config");
  return false;
}


function createEnemies() {
  enemies = [];
  let rows = 4;
  let cols = 5;
  let spacing = 70;
  let startX = 100;
  let startY = 50;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      enemies.push({
        x: startX + col * spacing,
        y: startY + row * spacing,
        width: 40,
        height: 20,
        alive: true,
        row: row // לשם ניקוד
      });
    }
  }
}


function updateEnemies() {
  if (timeElapsed === 5) {
    enemySpeed = 4;
  }
  if (timeElapsed === 10) {
    enemySpeed = 6;
  }
  if (timeElapsed === 15) {
    enemySpeed = 8;
  }
  if (timeElapsed === 20) {
    enemySpeed = 10;
  }
  enemies.forEach(enemy => {
    if (enemy.alive) {
      enemy.x += enemySpeed * enemyDirection;
      if (enemy.x + enemy.width >= canvas.width || enemy.x <= 0) {
        enemyDirection *= -1;
      }
    }
  });
}


function drawEnemies() {
  context.fillStyle = enemyColor;
  enemies.forEach(enemy => {
    if (enemy.alive) {
      context.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }
  });
}


function startGame() {
  shootKey = document.getElementById("shootKey").value.trim() || ' ';
  gameDuration = parseInt(document.getElementById("gameTime").value) * 60;
  shipColor = document.getElementById("shipColor").value;
  enemyColor = document.getElementById("enemyColor").value;
  timeElapsed = 0;
  timeLeft = gameDuration;
  score = 0;
  playerBullets = [];
  startTimer();
  if (gameDuration < 120) {
    alert("Minimum duration is 2 minutes.");
    return;
  }

  showScreen("game");
  createEnemies();
  gameLoop();
}


function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endTime();
    }
  }, 1000);
}


function endTime() {
  let message;
  if (score < 100) {
    message = "You can do better. Score: " + score;
  } else {
    message = "Winner! Score: " + score;
  }
  alert(message);
  showScreen("welcome"); //להוסיף מסך של טבלת השיאים האישית של השחקן וכפתור למשחק חדש
}



function gameLoop() {
  clearCanvas();
  updatePlayer();
  updateEnemies();
  updatePlayerBullets();
  updateEnemyBullets();
  checkCollisions();
  enemyShoot();
  drawPlayer();
  drawEnemies();
  drawPlayerBullets();
  drawEnemyBullets();
  drawInformation();

  if (lives <= 0) {
    showHistory();
    alert("You Lost!");
    showScreen("welcome"); //להוסיף מסך של טבלת השיאים האישית של השחקן וכפתור למשחק חדש
    return;
  }
  if (timeLeft <= 0) {
    showHistory();
    clearInterval(timerInterval);
    endTime();
    return;
  }
  if (enemies.every(enemy => !enemy.alive)) {
    showHistory();
    alert("You won! Score: " + score);
    showScreen("welcome"); //להוסיף מסך של טבלת השיאים האישית של השחקן וכפתור למשחק חדש
    return;
  }
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


function updatePlayerBullets() {
  playerBullets = playerBullets.filter(bullet => bullet.y > 0);
  playerBullets.forEach(bullet => {
    bullet.y -= 7;
  });
}


function drawPlayerBullets() {
  context.fillStyle = "#00ffff"; 
  playerBullets.forEach(bullet => {
    context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });
}


function checkCollisions() {
  playerBullets.forEach(bullet => {
    enemies.forEach(enemy => {
      if (enemy.alive &&
          bullet.x < enemy.x + enemy.width &&
          bullet.x + bullet.width > enemy.x &&
          bullet.y < enemy.y + enemy.height &&
          bullet.y + bullet.height > enemy.y) {
        enemy.alive = false;
        bullet.y = -100; 
        if (enemy.row === 0) {
          score += 20;
        } else if (enemy.row === 1) { 
          score += 15;
          }
        else if (enemy.row === 2) {
          score += 10;
        }
        else if (enemy.row === 3) {
          score += 5;
        }
        //להוסיף מנגינת רקע של פיצוץ
      }
    });
  });
}


function enemyShoot() {
  if (enemyBullets.length > 0) {
    var activeBullet = enemyBullets[0];
    if (activeBullet.y < canvas.height * 0.75) {
      return;
    }
  }
  var aliveEnemies = enemies.filter(enemy => enemy.alive);
  if (aliveEnemies.length === 0) {
    return;
  }
  var shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
  enemyBullets.push({
    x: shooter.x + shooter.width / 2 - 2,
    y: shooter.y + shooter.height,
    width: 4,
    height: 10
  });
}


function updateEnemyBullets() {
  enemyBullets = enemyBullets.filter(bullet => bullet.y < canvas.height);

  enemyBullets.forEach(bullet => {
    bullet.y += 5;
    if (bullet.x < player.x + player.width && bullet.x + bullet.width > player.x && bullet.y < player.y + player.height && bullet.y + bullet.height > player.y) {
      lives--;
      bullet.y = canvas.height + 1;
      player.x = canvas.width / 2;
      player.y = canvas.height - 80;
      // להוסיף אפקט או סאונד כאן
    }
  });
}


function drawEnemyBullets() {
  context.fillStyle = "#ff0000";
  enemyBullets.forEach(bullet => {
    context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });
}


function showHistory() {
  history.push(score);
  history.sort((a, b) => b - a);
  var html = "<h3>Your Scores:</h3><ol>";
  history.forEach((s, i) => {
    html += `<li>${s}${s === score ? " ← last game" : ""}</li>`;
  });
  html += "</ol>";
  var resultDiv = document.createElement("div");
  resultDiv.innerHTML = html;
  resultDiv.style.background = "#222";
  resultDiv.style.color = "#fff";
  resultDiv.style.padding = "20px";
  resultDiv.style.marginTop = "20px";
  resultDiv.style.border = "2px solid #ccc";
  resultDiv.style.textAlign = "left";
  document.body.appendChild(resultDiv);
}



function drawInformation() {
  context.fillStyle = "#ffffff";
  context.font = "20px Arial";
  context.fillText("Score: " + score, 20, 30);
  context.fillText("Time: " + Math.floor(timeLeft / 60) + ":" + (timeLeft % 60 < 10 ? "0" : "") + (timeLeft % 60), 20, 80);
  context.fillText("Lives: " + lives, 20, 55);
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
  if (e.key === shootKey) {
    playerBullets.push({
      x: player.x + player.width / 2 - 2,
      y: player.y,
      width: 4,
      height: 10
    });
  }
});


window.addEventListener("keyup", e => {
  keysPressed[e.key] = false;
});


window.addEventListener("click", e => {
  const modal = document.getElementById("aboutModal");
  if (e.target === modal) closeAbout();
});
