import os
import sys
import pygame
import random
import time

def resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)

# Pygame 초기화
pygame.init()

# 화면 크기 설정
screen_width = 1000
screen_height = 800
screen = pygame.display.set_mode((screen_width, screen_height))
pygame.display.set_caption("병역기피게임")

# 색상 설정
white = (255, 255, 255)
red = (255, 0, 0)

# 장애물과 공룡 크기 설정
obstacle_width = 100  # 두 배로 설정
obstacle_height = 100  # 두 배로 설정
dino_width = int(obstacle_width * 0.8)  # 현재의 0.8배로 설정
dino_height = int(obstacle_height * 0.8)  # 현재의 0.8배로 설정
dino_speed = 10

# 공룡 이미지 로드 및 크기 조정
dino_image_normal = pygame.image.load(resource_path('dino.png'))
dino_image_normal = pygame.transform.scale(dino_image_normal, (dino_width, dino_height))

dino_image_broken = pygame.image.load(resource_path('dino_broken.png'))
dino_image_broken = pygame.transform.scale(dino_image_broken, (dino_width, dino_height))

# 장애물 이미지 로드 및 크기 조정
obstacle_image1 = pygame.image.load(resource_path('obstacle1.png'))
obstacle_image1 = pygame.transform.scale(obstacle_image1, (obstacle_width, obstacle_height))

obstacle_image2 = pygame.image.load(resource_path('obstacle2.png'))
obstacle_image2 = pygame.transform.scale(obstacle_image2, (obstacle_width, obstacle_height))

obstacle_images = [obstacle_image1, obstacle_image2]

# 배경 이미지 로드
background_image = pygame.image.load(resource_path('background.png'))
background_image = pygame.transform.scale(background_image, (screen_width, screen_height))

# 게임 안내문 이미지 로드
instructions_image = pygame.image.load(resource_path('instructions.png'))
instructions_image = pygame.transform.scale(instructions_image, (screen_width, screen_height))

# 장애물 속도 설정
obstacle_speed = 20  # 장애물 속도를 두 배로 설정

# 게임 상태 변수
running = True

# 최근 3번의 스코어를 저장할 리스트
recent_scores = []

# 시계 객체 초기화
clock = pygame.time.Clock()

# 게임 초기화 함수
def init_game():
    global dino_x, dino_y, dino_image, game_over, obstacles, obstacle_timer, start_time, score, total_score, blink_timer, show_instructions
    dino_x = screen_width // 2
    dino_y = screen_height - dino_height - 10
    dino_image = dino_image_normal
    game_over = False
    obstacles = []
    obstacle_timer = 0
    start_time = time.time()
    score = 0
    total_score = 0
    blink_timer = 0
    show_instructions = True

# 새로운 장애물을 생성하는 함수
def create_obstacle():
    for _ in range(4):  # 한 번에 4개의 장애물을 생성
        obstacle_x = random.randint(0, screen_width - obstacle_width)
        obstacle_y = -obstacle_height
        obstacle_img = random.choice(obstacle_images)
        obstacles.append([obstacle_x, obstacle_y, obstacle_img])

# 장애물을 업데이트하는 함수
def update_obstacles():
    for obstacle in obstacles:
        obstacle[1] += obstacle_speed
    if len(obstacles) > 0 and obstacles[0][1] > screen_height:
        obstacles.pop(0)

# 게임 실행 함수
def run_game():
    global dino_x, dino_y, running, game_over, dino_image, clock, obstacle_timer, score, total_score, blink_timer, show_instructions, recent_scores

    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if show_instructions:
                    show_instructions = False  # 게임 안내문을 닫고 게임 시작
                    start_time = time.time()  # 게임 시작 시간을 재설정
                elif event.key == pygame.K_r and game_over:
                    recent_scores.append(total_score)  # 최근 스코어에 추가
                    if len(recent_scores) > 3:
                        recent_scores.pop(0)  # 최근 3개 스코어만 유지
                    init_game()

        keys = pygame.key.get_pressed()
        current_speed = dino_speed
        if keys[pygame.K_SPACE]:
            current_speed = dino_speed * 2

        if not show_instructions and not game_over:
            if keys[pygame.K_LEFT] and dino_x > 0:
                dino_x -= current_speed
            if keys[pygame.K_RIGHT] and dino_x < screen_width - dino_width:
                dino_x += current_speed
            if keys[pygame.K_UP] and dino_y > 0:
                dino_y -= current_speed
            if keys[pygame.K_DOWN] and dino_y < screen_height - dino_height:
                dino_y += current_speed

            obstacle_timer -= 1
            if obstacle_timer <= 0:
                create_obstacle()
                obstacle_timer = random.randint(10, 30)  # 장애물이 떨어지는 시간차를 조절

            update_obstacles()

            # 충돌 감지
            for obstacle in obstacles:
                if (dino_x < obstacle[0] + obstacle_width and
                    dino_x + dino_width > obstacle[0] and
                    dino_y < obstacle[1] + obstacle_height and
                    dino_y + dino_height > obstacle[1]):
                    game_over = True
                    dino_image = dino_image_broken
                    total_score = score  # 게임 종료 시 누적 점수 설정
                    recent_scores.append(total_score)  # 최근 스코어에 추가
                    if len(recent_scores) > 3:
                        recent_scores.pop(0)  # 최근 3개 스코어만 유지

            # 점수 계산
            score = int((time.time() - start_time) * 10)

        screen.blit(background_image, (0, 0))  # 배경 이미지 그리기

        if show_instructions:
            screen.blit(instructions_image, (0, 0))  # 게임 안내문 이미지 그리기
        elif game_over:
            # 큰 폰트 설정
            big_font = pygame.font.SysFont(None, 110, bold=True)
            font = pygame.font.SysFont(None, 55)
            blink_timer += 1
            if blink_timer % 30 < 15:  # 15프레임마다 깜빡임
                text1 = big_font.render("YOU'RE DEAD!!", True, red)
                screen.blit(text1, [screen_width // 6, screen_height // 3 - 50])
            text2 = font.render("Press 'R' to Restart", True, red)
            screen.blit(text2, [screen_width // 6, screen_height // 3 + 50])
            # 누적 점수 표시
            score_text = big_font.render(f"${total_score}", True, (0, 0, 0))
            screen.blit(score_text, [screen_width - 200, 20])
            # 최근 스코어 표시
            recent_scores_text = font.render("Recent Scores:", True, red)
            screen.blit(recent_scores_text, [screen_width // 6, screen_height // 2])
            for i, recent_score in enumerate(recent_scores):
                score_display = font.render(f"{i + 1}. ${recent_score}", True, red)
                screen.blit(score_display, [screen_width // 6, screen_height // 2 + 40 * (i + 1)])
        else:
            # 실시간 점수 표시
            score_font = pygame.font.SysFont(None, 110, bold=True)
            score_text = score_font.render(f"${score}", True, (0, 0, 0))
            screen.blit(score_text, [screen_width - 200, 20])

            screen.blit(dino_image, (dino_x, dino_y))

            for obstacle in obstacles:
                screen.blit(obstacle[2], (obstacle[0], obstacle[1]))  # 장애물 이미지 그리기

        pygame.display.update()
        clock.tick(30)

# 게임 초기화
init_game()

# 게임 루프 실행
run_game()

# Pygame 종료
pygame.quit()
