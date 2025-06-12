// Configurações do jogo
const config = {
    gravity: 0.5,
    batmanSpeed: 5,
    jumpForce: 12,
    batarangSpeed: 10
};

// Elementos do DOM
const gameScreen = document.getElementById('game-screen');
const batman = document.getElementById('batman');
const hud = document.getElementById('hud');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');

// Estado do jogo
let gameState = {
    score: 0,
    lives: 3,
    isJumping: false,
    velocityY: 0,
    direction: 'right',
    batarangActive: false,
    batarang: null,
    platforms: [],
    enemies: [],
    gameRunning: false
};

// Inicializa o jogo
function initGame() {
    // Posiciona o Batman
    batman.style.left = '100px';
    batman.style.top = '300px';
    
    // Cria plataformas
    createPlatform(0, 380, 800, 20); // Chão
    createPlatform(100, 300, 200, 20);
    createPlatform(400, 250, 150, 20);
    createPlatform(200, 200, 100, 20);
    createPlatform(600, 150, 150, 20);
    
    // Cria inimigos
    createEnemy(300, 340);
    createEnemy(500, 190);
    createEnemy(700, 100);
    
    // Atualiza HUD
    updateHUD();
    
    // Esconde tela de início
    startScreen.style.display = 'none';
    gameState.gameRunning = true;
}

// Cria uma plataforma
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

// Cria um inimigo
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
        direction: Math.random() > 0.5 ? 1 : -1,
        speed: 2
    });
}

// Atualiza o HUD
function updateHUD() {
    hud.textContent = `Vidas: ${gameState.lives} | Pontos: ${gameState.score}`;
}

// Lógica de pulo e gravidade
function applyPhysics() {
    if (!gameState.gameRunning) return;
    
    // Aplica gravidade
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
            // Colisão com plataforma - para a queda
            if (gameState.velocityY > 0 && batmanRect.y + batmanRect.height > platform.y) {
                batman.style.top = (platform.y - batmanRect.height) + 'px';
                gameState.velocityY = 0;
                gameState.isJumping = false;
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
    
    // Movimenta batarangue se estiver ativo
    if (gameState.batarangActive) {
        moveBatarang();
    }
}

// Verifica colisão entre dois retângulos
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Movimenta os inimigos
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
                width: 20,
                height: 10
            };
            
            if (checkCollision(batarangRect, enemy)) {
                // Inimigo atingido
                gameScreen.removeChild(enemy.element);
                gameState.enemies.splice(i, 1);
                i--;
                
                gameState.score += 100;
                updateHUD();
                
                // Remove batarangue
                gameScreen.removeChild(gameState.batarang);
                gameState.batarangActive = false;
                
                // Cria novo inimigo após um tempo
                setTimeout(() => {
                    createEnemy(Math.random() * 700, 0);
                }, 2000);
            }
        }
    }
}

// Movimenta o batarangue
function moveBatarang() {
    const batarang = gameState.batarang;
    let newLeft = parseInt(batarang.style.left) + 
                 (gameState.direction === 'right' ? config.batarangSpeed : -config.batarangSpeed);
    
    batarang.style.left = newLeft + 'px';
    
    // Verifica se saiu da tela
    if (newLeft < 0 || newLeft > 800) {
        gameScreen.removeChild(batarang);
        gameState.batarangActive = false;
    }
}

// Perde uma vida
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
    }
}

// Game Over
function gameOver() {
    gameState.gameRunning = false;
    startScreen.style.display = 'flex';
    startScreen.innerHTML = `
        <h1>GAME OVER</h1>
        <h2>Pontuação: ${gameState.score}</h2>
        <button id="start-button">TENTAR NOVAMENTE</button>
    `;
    
    // Remove todos os elementos do jogo
    while (gameScreen.firstChild) {
        if (gameScreen.firstChild.id !== 'hud') {
            gameScreen.removeChild(gameScreen.firstChild);
        } else {
            gameScreen.firstChild = gameScreen.firstChild.nextSibling;
        }
    }
    
    // Adiciona o HUD de volta
    gameScreen.appendChild(hud);
    
    // Configura o botão de reinício
    document.getElementById('start-button').addEventListener('click', () => {
        gameState = {
            score: 0,
            lives: 3,
            isJumping: false,
            velocityY: 0,
            direction: 'right',
            batarangActive: false,
            batarang: null,
            platforms: [],
            enemies: [],
            gameRunning: false
        };
        initGame();
    });
}

// Atira o batarangue
function shootBatarang() {
    gameState.batarangActive = true;
    
    const batarang = document.createElement('div');
    batarang.className = 'batarang';
    
    const startX = gameState.direction === 'right' ? 
        parseInt(batman.style.left) + 50 : 
        parseInt(batman.style.left) - 20;
        
    batarang.style.left = startX + 'px';
    batarang.style.top = (parseInt(batman.style.top) + 40) + 'px';
    
    gameScreen.appendChild(batarang);
    gameState.batarang = batarang;
}

// Event listeners
startButton.addEventListener('click', initGame);

document.addEventListener('keydown', (e) => {
    if (!gameState.gameRunning) return;
    
    const currentLeft = parseInt(batman.style.left);
    
    switch (e.key) {
        case 'ArrowLeft':
            batman.style.left = (currentLeft - config.batmanSpeed) + 'px';
            gameState.direction = 'left';
            break;
        case 'ArrowRight':
            batman.style.left = (currentLeft + config.batmanSpeed) + 'px';
            gameState.direction = 'right';
            break;
        case ' ':
            if (!gameState.isJumping) {
                gameState.velocityY = -config.jumpForce;
                gameState.isJumping = true;
            }
            break;
        case 'f':
            if (!gameState.batarangActive) {
                shootBatarang();
            }
            break;
    }
});

// Loop do jogo
function gameLoop() {
    if (gameState.gameRunning) {
        applyPhysics();
    }
    requestAnimationFrame(gameLoop);
}

// Inicia o loop do jogo
gameLoop();