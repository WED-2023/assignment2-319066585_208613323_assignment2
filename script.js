var canvas;
var context;

var users = [ { username: "p", password: "testuser" } ];
var keysPressed = {};
var shootKey = ' ';

var timeElapsed;
var timeLeft;
var timerInterval;
var score = 0;
var noFirstGame = false;

var currUser = null;
var gameHistory = [];
var playerBullets = [];

var gameDuration;
var enemies = [];
var enemySpeed = 4;
var enemyDirection = 1; // 1 for right, -1 for left
var lastEnemyBullet = null;


var enemyShootInterval = 2000;
var enemyShootSpeed = 8; // speed of enemy bullets
var enemyBullets = [];
var lives = 3;
var lastEnemyShotTime = 0;

var shootPlayerSound = new Audio("retro-laser-1-236669.mp3");
var shootEnemySound = new Audio("laser-104024.mp3");
var hitSound = new Audio("small-explosion-94980.mp3");
var explosionSound = new Audio("explosion-312361.mp3");
var backgroundMusic = new Audio("game-music-loop-4-144341.mp3");
backgroundMusic.loop = true;

var playerImage = new Image();
playerImage.src = "mySpaceship.png";

var enemyImage = new Image();
enemyImage.src = "enemySpaceship.png";

var player = {
  x: 400,
  y: 550,
  width: 60,
  height: 80,
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


function validateRegForm() {
  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPass").value;
  const confirmPassword = document.getElementById("regPassConf").value;
  const firstName = document.getElementById("regFirstName").value.trim();
  const lastName = document.getElementById("regLastName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const errorDiv = document.getElementById("regError");

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
  if (users.some(user => user.username === username)) {
    errorDiv.textContent = "Username already exists.";
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
  alert("Login successful!");
  showScreen("config");
  return false;
}


function createEnemies() {
  enemies = [];
  var rows = 4;
  var cols = 5;
  var spacing = 70;
  var startX = 100;
  var startY = 50;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      enemies.push({
        x: startX + col * spacing,
        y: startY + row * spacing,
        width: 60,
        height: 80,
        alive: true,
        row: row
      });
    }
  }
}


function updateEnemies() {
  var shouldReverse = false;
  enemies.forEach(enemy => {
    if (enemy.alive) {
      const nextX = enemy.x + enemySpeed * enemyDirection;
      if (nextX <= 0 || nextX + enemy.width >= canvas.width) {
        shouldReverse = true;
      }
    }
  });
  if (shouldReverse) {
    enemyDirection *= -1;
  } else {
    enemies.forEach(enemy => {
      if (enemy.alive) {
        enemy.x += enemySpeed * enemyDirection;
      }
    });
  }
}


function drawEnemies() {
  enemies.forEach(enemy => {
    if (enemy.alive) {
      context.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
    }
  });
}


function startGame() {
    shootKey = document.getElementById("shootKey").value.trim();
    gameDuration = parseInt(document.getElementById("gameTime").value) * 60;
    if (gameDuration < 120) {
      alert("Minimum duration is 2 minutes.");
      return;
    }
    score = 0;
    timeElapsed = 0;
    timeLeft = gameDuration;
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;
    playerBullets = [];
    enemyBullets = [];
    lastEnemyShotTime = 0;
    lastEnemyBullet = null;
    lives = 3;

    
    showScreen("game");
    createEnemies();
    backgroundMusic.currentTime = 0;
    backgroundMusic.play();
    startTimer();
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
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
  let message;
  if (score < 100) {
    message = "You can do better. Score: " + score;
  } else {
    message = "Winner! Score: " + score;
  }
  alert(message);
  showScreen("welcome");
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
    alert("You Lost!");
    endGame();
    return;
  }
  if (timeLeft <= 0) {
    clearInterval(timerInterval);
    endTime();
    endGame();
    return;
  }
  if (enemies.every(enemy => !enemy.alive)) {
    alert("You won! Score: " + score);
    endGame();
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
  context.drawImage(playerImage, player.x, player.y, player.width, player.height);
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
          bullet.x < enemy.x + enemy.width/2 &&
          bullet.x + bullet.width/2 > enemy.x &&
          bullet.y < enemy.y + enemy.height/2 &&
          bullet.y + bullet.height/2 > enemy.y) {
        enemy.alive = false;
        hitSound.currentTime = 0;
        hitSound.play();
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
      }
    });
  });
}


function enemyShoot() {
  if (lastEnemyBullet && lastEnemyBullet.y < canvas.height * 0.75) return;

  const aliveEnemies = enemies.filter(enemy => enemy.alive);
  if (aliveEnemies.length === 0) return;

  const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
  const newBullet = {
    x: shooter.x + shooter.width / 2 - 2,
    y: shooter.y + shooter.height,
    width: 8,
    height: 20
  };
  enemyBullets.push(newBullet);
  lastEnemyBullet = newBullet;

  shootEnemySound.currentTime = 0;
  shootEnemySound.play();
}



function updateEnemyBullets() {
  enemyBullets = enemyBullets.filter(bullet => bullet.y < canvas.height);

  enemyBullets.forEach(bullet => {
    bullet.y += 10;
    if (bullet.x < player.x + player.width && bullet.x + bullet.width > player.x && bullet.y < player.y + player.height && bullet.y + bullet.height > player.y) {
      lives--;
      explosionSound.currentTime = 0;
      explosionSound.play();
      bullet.y = canvas.height + 1;
      player.x = canvas.width / 2;
      player.y = canvas.height - 100;
    }
  });
}


function drawEnemyBullets() {
  context.fillStyle = "#ff0000";
  enemyBullets.forEach(bullet => {
    context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });
}


function endTime() {
    let message;
    if (score < 100) {
      message = "You can do better. Score: " + score;
    } else {
      message = "Winner! Score: " + score;
    }
}


function endGame() {
        console.log("Game Over! Score: " + score);
        gameHistory.push({ score: score, timeLeft: timeLeft });
        gameHistory.sort((a, b) => b.score - a.score);
        displayScoreTable();
        console.log("Game Over! Score: " + score);
        showScreen("scoreTable");

}


function displayScoreTable() {
  console.log("Displaying score table...");
  const tableDiv = document.getElementById("scoreBoard");
  let table = "<table border='1'><tr><th>Time (seconds)</th><th>Score</th></tr>";
  gameHistory.forEach(entry => {
      table += `<tr><td>${entry.timeLeft}</td><td>${entry.score}</td></tr>`;
  });
  table += "</table>";
  tableDiv.innerHTML = table;
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
  const keysToPrevent = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  if (keysToPrevent.includes(e.key)) {
    e.preventDefault();
  }

  if (e.key === "Escape") closeAbout();
  keysPressed[e.key] = true;

  if (e.key === shootKey) {
    shootPlayerSound.currentTime = 0;
    shootPlayerSound.play();
    playerBullets.push({
      x: player.x + player.width / 2 - 2,
      y: player.y,
      width: 6,
      height: 15
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
