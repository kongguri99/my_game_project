const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 게임 설정
const screenWidth = canvas.width;
const screenHeight = canvas.height;
const dinoWidth = 80;
const dinoHeight = 80;
const dinoSpeed = 10;
const obstacleWidth = 100;
const obstacleHeight = 100; // 장애물 높이를 원래대로 유지
const obstacleSpeed = 5 * 1.2; // 장애물 속도를 1.2배로 증가
let obstacleTimer = 0;

let dinoX = screenWidth / 2;
let dinoY = screenHeight - dinoHeight - 10;
let obstacles = [];
let gameOver = false;
let score = 0;
let startTime = Date.now();
let showInstructions = true;
let recentScores = [];
let blinkTimer = 0;
let isAccelerating = false; // 스페이스바로 가속하는 기능 추가
let specialImageDisplayed = false; // 특정 이미지를 표시했는지 여부

// 깜빡임 설정
let blinkStartTime = Date.now();
let isBlinking = false;

const BLINK_INTERVAL = 10000; // 10초 간격
const BLINK_DURATION = 3000; // 3초 동안 깜빡임

// 이미지 로드
const dinoImageNormal = new Image();
dinoImageNormal.src = 'dino.png';
const dinoImageBroken = new Image();
dinoImageBroken.src = 'dino_broken.png';
const obstacleImage1 = new Image();
obstacleImage1.src = 'obstacle1.png';
const obstacleImage2 = new Image();
obstacleImage2.src = 'obstacle2.png';
const backgroundImage = new Image();
backgroundImage.src = 'background.png';
const instructionsImage = new Image();
instructionsImage.src = 'instructions.png';
const specialImage = new Image();
specialImage.src = 'special.png'; // 특정 이미지 파일 로드

function createObstacle() {
    for (let i = 0; i < 8; i++) { // 장애물 수를 2배로 증가 (원래는 4개였음)
        let obstacleX = Math.random() * (screenWidth - obstacleWidth);
        let obstacleY = -obstacleHeight - (i * 200); // 장애물들이 서로 겹치지 않게 y 위치를 조정
        let obstacleImg = Math.random() > 0.5 ? obstacleImage1 : obstacleImage2;
        obstacles.push({ x: obstacleX, y: obstacleY, img: obstacleImg });
    }
}

function updateObstacles() {
    for (let obstacle of obstacles) {
        obstacle.y += obstacleSpeed;
    }
    obstacles = obstacles.filter(obstacle => obstacle.y < screenHeight); // 화면을 벗어난 장애물 제거
}

function detectCollision() {
    if (isBlinking) return; // 깜빡이는 동안 충돌 감지 무시
    for (let obstacle of obstacles) {
        if (dinoX < obstacle.x + obstacleWidth &&
            dinoX + dinoWidth > obstacle.x &&
            dinoY < obstacle.y + obstacleHeight &&
            dinoY + dinoHeight > obstacle.y) {
            gameOver = true;
        }
    }
}

function updateScore() {
    score = Math.floor((Date.now() - startTime) / 1000) * 10;
}

function draw() {
    ctx.clearRect(0, 0, screenWidth, screenHeight); // 캔버스를 깨끗하게 지움
    ctx.drawImage(backgroundImage, 0, 0, screenWidth, screenHeight);

    if (showInstructions) {
        ctx.drawImage(instructionsImage, 0, 0, screenWidth, screenHeight);
    } else if (specialImageDisplayed) {
        ctx.drawImage(specialImage, 0, 0, screenWidth, screenHeight); // 특정 이미지를 표시
    } else if (gameOver) {
        ctx.font = '110px Arial';
        ctx.fillStyle = 'red';
        blinkTimer++;
        if (blinkTimer % 30 < 15) {
            ctx.font = 'bold 110px Arial'; // "YOU'RE DEAD!!"의 글자 굵기를 두 배로 설정
            ctx.fillText("YOU'RE DEAD!!", screenWidth / 6 - 60, screenHeight / 3 - 50); // 왼쪽으로 3cm 이동
        }
        ctx.font = '55px Arial';
        ctx.fillText("Press 'R' to Restart", screenWidth / 6, screenHeight / 3 + 50);
        ctx.fillStyle = 'black';
        ctx.fillText(`$${score}`, screenWidth - 200 + 20, 20 + 45); // 오른쪽으로 2cm, 아래로 3cm 이동
        ctx.fillStyle = 'red';
        ctx.fillText("Recent Scores:", screenWidth / 6, screenHeight / 2);

        // 현재 점수 포함하여 최근 3회 기록 표시
        const displayScores = [...recentScores, score].slice(-3); 
        for (let i = 0; i < displayScores.length; i++) {
            ctx.fillText(`${i + 1}. $${displayScores[i]}`, screenWidth / 6, screenHeight / 2 + 40 + (i * 40)); // 1cm씩 간격 띄움
        }
    } else {
        ctx.font = '55px Arial'; // 게임 중의 글자 크기를 게임 오버 화면과 일치시킴
        ctx.fillStyle = 'black';
        ctx.fillText(`$${score}`, screenWidth - 200 + 20, 20 + 45); // 오른쪽으로 2cm, 아래로 3cm 이동

        if (isBlinking) {
            if (Math.floor(Date.now() / 200) % 2) { // 0.2초 간격으로 깜빡임
                ctx.globalAlpha = 0.5; // 반투명 효과
            } else {
                ctx.globalAlpha = 1.0;
            }
        } else {
            ctx.globalAlpha = 1.0;
        }

        ctx.drawImage(dinoImageNormal, dinoX, dinoY, dinoWidth, dinoHeight);
        ctx.globalAlpha = 1.0; // 다시 불투명으로 설정

        for (let obstacle of obstacles) {
            ctx.drawImage(obstacle.img, obstacle.x, obstacle.y, obstacleWidth, obstacleHeight);
        }
    }
}

function gameLoop() {
    if (!showInstructions && !gameOver) {
        if (obstacleTimer <= 0) {
            createObstacle();
            obstacleTimer = 150; // 장애물 생성 주기
        }
        obstacleTimer--;
        updateObstacles();
        detectCollision();
        updateScore();

        // 특정 점수 이상 시 specialImage 표시
        if (score > 1100 && !specialImageDisplayed) {
            specialImageDisplayed = true;
        }

        // 깜빡임 상태 관리
        if (!isBlinking && Date.now() - blinkStartTime >= BLINK_INTERVAL) {
            isBlinking = true;
            blinkStartTime = Date.now();
        }
        if (isBlinking && Date.now() - blinkStartTime >= BLINK_DURATION) {
            isBlinking = false;
            blinkStartTime = Date.now();
        }
    }
    draw();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (e) => {
    if (showInstructions) {
        showInstructions = false;
        startTime = Date.now();
    } else if (gameOver && e.key === 'r') {
        recentScores.push(score);
        if (recentScores.length > 2) {
            recentScores.shift();
        }
        dinoX = screenWidth / 2;
        dinoY = screenHeight - dinoHeight - 10;
        obstacles = [];
        gameOver = false;
        score = 0;
        specialImageDisplayed = false; // 게임 재시작 시 specialImage 초기화
        blinkStartTime = Date.now(); // 깜빡임 타이머 초기화
        startTime = Date.now();
    } else {
        switch (e.key) {
            case 'ArrowLeft':
                dinoX = Math.max(dinoX - (isAccelerating ? dinoSpeed * 2 : dinoSpeed), 0);
                break;
            case 'ArrowRight':
                dinoX = Math.min(dinoX + (isAccelerating ? dinoSpeed * 2 : dinoSpeed), screenWidth - dinoWidth);
                break;
            case 'ArrowUp':
                dinoY = Math.max(dinoY - (isAccelerating ? dinoSpeed * 2 : dinoSpeed), 0);
                break;
            case 'ArrowDown':
                dinoY = Math.min(dinoY + (isAccelerating ? dinoSpeed * 2 : dinoSpeed), screenHeight - dinoHeight);
                break;
            case ' ':
                isAccelerating = true; // 스페이스바로 가속 시작
                break;
        }
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === ' ') {
        isAccelerating = false; // 스페이스바로 가속 종료
    }
});

gameLoop();
