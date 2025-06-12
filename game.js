// CONFIGURAÇÕES DO JOGO
const config = {
    gravity: 0.5,
    batmanSpeed: 6,
    jumpForce: 14,
    batarangSpeed: 12,
    batarangCooldown: 500,
    enemySpeed: 2.5,
    spawnInterval: 3000
};

// ELEMENTOS DO DOM
const gameScreen = document.getElementById('game-screen');
const batman = document.getElementById('batman');
const hud = document.getElementById('hud');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScore = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');

// ESTADO DO JOGO
let gameState = {
    score: 0,
    lives: 3,
    isJumping: false,
    velocityY: 0,
    direction: 'right',
    batarangActive: false,
    batarangCooldown: false,
    batarang: null,
    platforms: [],
    buildings: [],
    enemies: [],
    gameRunning: false,
    spawnTimer: null,
    batarangTrailInterval: null,
    keys: {
        left: false,
        right: false,
        jump: false,
        shoot: false
    }
};

// INICIALIZAÇÃO DO JOGO
function initGame() {
    // Reseta o estado do jogo
    gameState = {
        score: 0,
        lives: 3,
        isJumping: false,
        velocityY: 0,
        direction: 'right',
        batarangActive: false,
        batarangCooldown: false,
        batarang: null,
        platforms: [],
        buildings: [],
        enemies: [],
        gameRunning: true,
        spawnTimer: null,
        batarangTrailInterval: null,
        keys: {
            left: false,
            right: false,
            jump: false,
            shoot: false
        }
    };
    
    // Limpa a tela
    while (gameScreen.firstChild) {
        if (gameScreen.firstChild.id !== 'hud' && 
            gameScreen.firstChild.id !== 'batman') {
            gameScreen.removeChild(gameScreen.firstChild);
        } else {
            gameScreen.firstChild = gameScreen.firstChild.nextSibling;
        }
    }
    
    // Posiciona o Batman
    batman.style.left = '100px';
    batman.style.top = '300px';
    batman.className = '';
    
    // Cria cenário
    createPlatform(0, 380, 800, 20); // Chão principal
    
    // Plataformas
    createPlatform(100, 300, 200, 20);
    createPlatform(400, 250, 150, 20);
    createPlatform(200, 200, 100, 20);
    createPlatform(600, 150, 150, 20);
    createPlatform(50, 100, 100, 20);
    
    // Prédios no fundo
    createBuilding(50, 100, 80, 280, 3);
    createBuilding(300, 150, 120, 230, 4);
    createBuilding(600, 80, 100, 300, 5);
    
    // Inimigos iniciais
    createEnemy(300, 340);
    createEnemy(500, 190);
    createEnemy(700, 100);
    
    // Sistema de spawn de inimigos
    gameState.spawnTimer = setInterval(() => {
        if (gameState.gameRunning && gameState.enemies.length < 5) {
            createEnemy(Math.random() > 0.5 ? 800 : -40, 
                        Math.random() * 200 + 100);
        }
    }, config.spawnInterval);
    
    // Atualiza HUD
    updateHUD();
    
    // Esconde telas de menu/game over
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
}

// CRIA ELEMENTOS DO JOGO
function createPlatform(x, y, width, height) {
    const platform = document.createElement('div');
    platform.className = 'platform';
    platform.style.left = x + 'px';
    platform.style.top = y + 'px';
    platform.style.width = width + 'px';
    gameScreen.appendChild(platform);
    
    gameState.platforms.push({
        element: platform,
        x: x,
        y: y,
        width: width,
        height: height
    });
}

function createBuilding(x, y, width, height, windows) {
    const building = document.createElement('div');
    building.className = 'building';
    building.style.left = x + 'px';
    building.style.top = y + 'px';
    building.style.width = width + 'px';
    building.style.height = height + 'px';
    gameScreen.appendChild(building);
    
    // Adiciona janelas
    for (let i = 0; i < windows; i++) {
        const window = document.createElement('div');
        window.className = 'window';
        window.style.left = (x + 10 + (i * (width / windows))) + 'px';
        window.style.top = (y + 20) + 'px';
        gameScreen.appendChild(window);
    }
    
    gameState.buildings.push(building);
}

function createEnemy(x, y) {
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    enemy.style.left = x + 'px';
    enemy.style.top = y + 'px';
    gameScreen.appendChild(enemy);
    
    gameState.enemies.push({
        element: enemy,
        x: x,
        y: y,
        width: 40,
        height: 40,
        direction: x > 400 ? -1 : 1, // Direção baseada na posição
        speed: config.enemySpeed + Math.random() * 1
    });
}

// ATUALIZA HUD
function updateHUD() {
    hud.textContent = `Vidas: ${gameState.lives} | Pontos: ${gameState.score} | Batarangues: ∞`;
}

// FÍSICA DO JOGO
function applyPhysics() {
    if (!gameState.gameRunning) return;
    
    // Movimento horizontal
    if (gameState.keys.left) {
        const newLeft = parseInt(batman.style.left) - config.batmanSpeed;
        if (newLeft > 0) {
            batman.style.left = newLeft + 'px';
            gameState.direction = 'left';
        }
    }
    if (gameState.keys.right) {
        const newLeft = parseInt(batman.style.left) + config.batmanSpeed;
        if (newLeft < 750) {
            batman.style.left = newLeft + 'px';
            gameState.direction = 'right';
        }
    }
    
    // Gravidade e pulo
    gameState.velocityY += config.gravity;
    let newTop = parseInt(batman.style.top) + gameState.velocityY;
    batman.style.top = newTop + 'px';
    
    // Verifica colisão com plataformas
    let onGround = false;
    const batmanRect = {
        x: parseInt(batman.style.left),
        y: newTop,
        width: 50,
        height: 80
    };
    
    for (const platform of gameState.platforms) {
        if (checkCollision(batmanRect, platform)) {
            if (gameState.velocityY > 0 && batmanRect.y + batmanRect.height > platform.y) {
                batman.style.top = (platform.y - batmanRect.height) + 'px';
                gameState.velocityY = 0;
                gameState.isJumping = false;
                batman.classList.remove('jumping');
                onGround = true;
            }
        }
    }
    
    // Verifica se caiu no vazio
    if (parseInt(batman.style.top) > 400) {
        loseLife();
    }
    
    // Movimenta inimigos
    moveEnemies();
    
    // Movimenta batarangue
    if (gameState.batarangActive) {
        moveBatarang();
    }
}

// VERIFICA COLISÃO
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// MOVIMENTAÇÃO DOS INIMIGOS
function moveEnemies() {
    for (let i = 0; i < gameState.enemies.length; i++) {
        const enemy = gameState.enemies[i];
        
        // Muda direção se atingir borda da plataforma
        let onPlatform = false;
        for (const platform of gameState.platforms) {
            if (enemy.y + enemy.height >= platform.y && 
                enemy.y + enemy.height <= platform.y + 10 &&
                enemy.x + enemy.width > platform.x && 
                enemy.x < platform.x + platform.width) {
                onPlatform = true;
                
                if ((enemy.direction > 0 && enemy.x + enemy.width >= platform.x + platform.width) ||
                    (enemy.direction < 0 && enemy.x <= platform.x)) {
                    enemy.direction *= -1;
                }
            }
        }
        
        // Se não estiver em plataforma, cai
        if (!onPlatform) {
            enemy.y += 5;
            enemy.element.style.top = enemy.y + 'px';
        } else {
            enemy.x += enemy.direction * enemy.speed;
            enemy.element.style.left = enemy.x + 'px';
        }
        
        // Verifica colisão com Batman
        const batmanRect = {
            x: parseInt(batman.style.left),
            y: parseInt(batman.style.top),
            width: 50,
            height: 80
        };
        
        if (checkCollision(batmanRect, enemy)) {
            loseLife();
        }
        
        // Verifica colisão com batarangue
        if (gameState.batarangActive) {
            const batarangRect = {
                x: parseInt(gameState.batarang.style.left),
                y: parseInt(gameState.batarang.style.top),
                width: 30,
                height: 15
            };
            
            if (checkCollision(batarangRect, enemy)) {
                // Inimigo atingido
                gameScreen.removeChild(enemy.element);
                gameState.enemies.splice(i, 1);
                i--;
                
                gameState.score += 100;
                updateHUD();
                
                // Remove batarangue
                clearInterval(gameState.batarangTrailInterval);
                gameScreen.removeChild(gameState.batarang);
                gameState.batarangActive = false;
            }
        }
    }
}

// BATARANGUE
function shootBatarang() {
    if (gameState.batarangActive || gameState.batarangCooldown) return;
    
    gameState.batarangActive = true;
    
    const batarang = document.createElement('div');
    batarang.className = 'batarang';
    
    const startX = gameState.direction === 'right' ? 
        parseInt(batman.style.left) + 50 : 
        parseInt(batman.style.left) - 30;
        
    batarang.style.left = startX + 'px';
    batarang.style.top = (parseInt(batman.style.top) + 35) + 'px';
    
    gameScreen.appendChild(batarang);
    gameState.batarang = batarang;
    
    // Cria partículas de rastro
    gameState.batarangTrailInterval = setInterval(() => {
        if (gameState.batarangActive) {
            createBatarangTrail();
        }
    }, 100);
    
    // Cooldown
    gameState.batarangCooldown = true;
    setTimeout(() => {
        gameState.batarangCooldown = false;
    }, config.batarangCooldown);
}

function moveBatarang() {
    const batarang = gameState.batarang;
    let newLeft = parseInt(batarang.style.left) + 
                 (gameState.direction === 'right' ? config.batarangSpeed : -config.batarangSpeed);
    
    batarang.style.left = newLeft + 'px';
    
    // Verifica se saiu da tela
    if (newLeft < -30 || newLeft > 830) {
        clearInterval(gameState.batarangTrailInterval);
        gameScreen.removeChild(batarang);
        gameState.batarangActive = false;
    }
}

function createBatarangTrail() {
    if (!gameState.batarang || !gameState.batarangActive) return;
    
    const trail = document.createElement('div');
    trail.className = 'batarang-trail';
    
    const batarangRect = gameState.batarang.getBoundingClientRect();
    const gameRect = gameScreen.getBoundingClientRect();
    
    trail.style.left = (batarangRect.left - gameRect.left) + 'px';
    trail.style.top = (batarangRect.top - gameRect.top + 7) + 'px';
    
    gameScreen.appendChild(trail);
    
    // Remove a partícula após a animação
    setTimeout(() => {
        if (trail.parentNode) {
            gameScreen.removeChild(trail);
        }
    }, 500);
}

// SISTEMA DE VIDAS E GAME OVER
function loseLife() {
    gameState.lives--;
    updateHUD();
    
    if (gameState.lives <= 0) {
        gameOver();
    } else {
        // Reseta posição
        batman.style.left = '100px';
        batman.style.top = '300px';
        gameState.velocityY = 0;
        gameState.isJumping = false;
        batman.classList.remove('jumping');
    }
}

function gameOver() {
    gameState.gameRunning = false;
    clearInterval(gameState.spawnTimer);
    
    if (gameState.batarangTrailInterval) {
        clearInterval(gameState.batarangTrailInterval);
    }
    
    finalScore.textContent = `Pontuação: ${gameState.score}`;
    gameOverScreen.style.display = 'flex';
}

// CONTROLES
document.addEventListener('keydown', (e) => {
    if (!gameState.gameRunning) return;
    
    switch (e.key) {
        case 'ArrowLeft':
            gameState.keys.left = true;
            break;
        case 'ArrowRight':
            gameState.keys.right = true;
            break;
        case ' ':
            if (!gameState.isJumping) {
                gameState.velocityY = -config.jumpForce;
                gameState.isJumping = true;
                batman.classList.add('jumping');
            }
            break;
        case 'f':
            shootBatarang();
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'ArrowLeft':
            gameState.keys.left = false;
            break;
        case 'ArrowRight':
            gameState.keys.right = false;
            break;
    }
});

// EVENT LISTENERS
startButton.addEventListener('click', initGame);
restartButton.addEventListener('click', initGame);

// LOOP PRINCIPAL
function gameLoop() {
    if (gameState.gameRunning) {
        applyPhysics();
    }
    requestAnimationFrame(gameLoop);
}

// INICIA O JOGO
gameLoop();