const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");

// Sprites (substitua pelas suas imagens)
const playerImg = new Image();
playerImg.src = "assets/player.png"; // J11

const enemyImg = new Image();
enemyImg.src = "assets/enemy.png"; // F15

const bulletImg = new Image();
bulletImg.src = "assets/bullet.png";

// Configurações
const PLAYER_WIDTH = 60;
const PLAYER_HEIGHT = 40;
const ENEMY_WIDTH = 50;
const ENEMY_HEIGHT = 35;
const BULLET_SIZE = 8;

// Jogador (J11)
const player = {
    x: canvas.width / 2 - PLAYER_WIDTH / 2,
    y: canvas.height - 70,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: 8
};

// Inimigos (F15s)
let enemies = [];
let bullets = [];
let score = 0;
let enemyDirection = 1; // 1 = direita, -1 = esquerda
let enemySpeed = 1;
let gameOver = false;

// Inicializa inimigos em formação
function initEnemies() {
    enemies = [];
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 8; col++) {
            enemies.push({
                x: col * (ENEMY_WIDTH + 30) + 100,
                y: row * (ENEMY_HEIGHT + 20) + 50,
                width: ENEMY_WIDTH,
                height: ENEMY_HEIGHT,
                alive: true
            });
        }
    }
}

// Controles
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") player.x = Math.max(0, player.x - player.speed);
    if (e.key === "ArrowRight") player.x = Math.min(canvas.width - player.width, player.x + player.speed);
    if (e.key === " " && !gameOver) {
        bullets.push({
            x: player.x + player.width / 2 - BULLET_SIZE / 2,
            y: player.y,
            width: BULLET_SIZE,
            height: BULLET_SIZE * 3,
            speed: 12
        });
    }
    if (e.key === " " && gameOver) resetGame();
});

// Atualiza inimigos (movimento lateral)
function updateEnemies() {
    let moveDown = false;
    
    // Verifica se precisa descer
    enemies.forEach(enemy => {
        if (enemy.alive && (enemy.x + enemy.width > canvas.width || enemy.x < 0)) {
            moveDown = true;
        }
    });

    // Movimentação
    enemies.forEach(enemy => {
        if (enemy.alive) {
            enemy.x += enemySpeed * enemyDirection;
            if (moveDown) enemy.y += 20;
        }
    });

    if (moveDown) enemyDirection *= -1;
}

// Loop principal
function update() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Movimenta e desenha inimigos
    updateEnemies();
    enemies.forEach(enemy => {
        if (enemy.alive) {
            ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
        }
    });

    // Movimenta e desenha tiros
    bullets.forEach(bullet => {
        bullet.y -= bullet.speed;
        ctx.drawImage(bulletImg, bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Remove tiros fora da tela
    bullets = bullets.filter(bullet => bullet.y > -bullet.height);

    // Colisões
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (
                enemy.alive &&
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                enemy.alive = false;
                bullets.splice(bulletIndex, 1);
                score += 100;
                scoreElement.textContent = score;
            }
        });
    });

    // Verifica derrota (inimigos chegarem perto)
    if (enemies.some(enemy => enemy.alive && enemy.y + enemy.height > canvas.height - 100)) {
        gameOver = true;
        showMessage("MISSÃO FALHADA!");
    }

    // Verifica vitória
    if (enemies.every(enemy => !enemy.alive)) {
        gameOver = true;
        showMessage("VITÓRIA!");
    }

    // Desenha jogador
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    requestAnimationFrame(update);
}

// Mensagens
function showMessage(text) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f00";
    ctx.font = "36px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

// Reinicia
function resetGame() {
    score = 0;
    scoreElement.textContent = "0";
    bullets = [];
    gameOver = false;
    enemySpeed = 1;
    initEnemies();
    update();
}

// Carrega imagens antes de iniciar
window.onload = function() {
    initEnemies();
    update();
};