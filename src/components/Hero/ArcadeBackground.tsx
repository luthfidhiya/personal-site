import { useRef, useEffect } from "react";

type GameState = "idle" | "playing" | "gameover";

interface ArcadeBackgroundProps {
  gameState?: GameState;
  theme?: string;
  onGameOver?: (score: number) => void;
  onScoreUpdate?: (score: number) => void;
}

interface Obstacle {
  type: "pipe" | "enemy" | "spike";
  x: number;
  width: number;
  height: number;
  alive: boolean;
  walkPhase?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
}

const ArcadeBackground = ({
  gameState = "idle",
  theme = "dark",
  onGameOver,
  onScoreUpdate,
}: ArcadeBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);

  // Use refs so the animation loop always reads the latest values
  // without requiring effect re-mount
  const gameStateRef = useRef(gameState);
  const themeRef = useRef(theme);
  const onGameOverRef = useRef(onGameOver);
  const onScoreUpdateRef = useRef(onScoreUpdate);

  // Keep refs in sync with props
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);
  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);
  useEffect(() => {
    onScoreUpdateRef.current = onScoreUpdate;
  }, [onScoreUpdate]);

  useEffect(() => {
    // --- 8-BIT SFX ENGINE ---
    const AudioContext = window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof globalThis.AudioContext })
        .webkitAudioContext;
    const audioCtx = AudioContext ? new AudioContext() : null;

    const playSfx = (type: "jump" | "milestone" | "gameover") => {
      if (!audioCtx) return;
      if (audioCtx.state === "suspended") audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "square";
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);

      const now = audioCtx.currentTime;

      if (type === "jump") {
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === "milestone") {
        osc.frequency.setValueAtTime(523, now); // C5
        osc.frequency.setValueAtTime(659, now + 0.05); // E5
        osc.frequency.setValueAtTime(784, now + 0.1); // G5
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === "gameover") {
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    };

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;
    let w = (canvas.width = parent.clientWidth);
    let h = (canvas.height = parent.clientHeight);
    let isMobile = w < 768;

    const generateBuildings = (canvasWidth: number) => {
      const bldgs = [];
      let currentX = 0;
      while (currentX < canvasWidth + 200) {
        const bW = 50 + Math.random() * 80;
        bldgs.push({
          x: currentX,
          width: bW,
          height: 100 + Math.random() * 250,
          windows: Array.from({ length: 12 }, () => Math.random() > 0.6),
          colorDark: `hsl(222, 47%, ${10 + Math.random() * 8}%)`,
          colorLight: `hsl(215, 25%, ${65 + Math.random() * 15}%)`,
        });
        currentX += bW + (20 + Math.random() * 60);
      }
      return bldgs;
    };

    const s = {
      frame: 0,
      stars: Array.from({ length: 40 }, () => ({
        x: Math.random() * w,
        y: Math.random() * (h * 0.6),
        size: Math.random() * 2 + 1,
        blinkPhase: Math.random() * Math.PI * 2,
      })),
      clouds: Array.from({ length: 5 }, () => ({
        x: Math.random() * w,
        y: Math.random() * (h * 0.4),
        speed: 0.2 + Math.random() * 0.3,
        width: 40 + Math.random() * 60,
      })),
      buildings: generateBuildings(w),
      obstacles: [] as Obstacle[],
      lastDisplayScore: 0,
      hero: {
        y: 0,
        vy: 0,
        isJumping: false,
        trail: [] as TrailPoint[],
        stomping: false,
        stompTarget: null as Obstacle | null,
      },
      score: 0,
      difficultyMult: 1,
      particles: [] as Particle[],
    };

    // Input state for game
    const inputState = {
      jumpPressed: false,
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        gameStateRef.current === "playing" &&
        (e.code === "Space" || e.code === "ArrowUp" || e.key === "w")
      ) {
        inputState.jumpPressed = true;
        e.preventDefault();
      }
    };
    const handleTouchStart = (e: Event) => {
      if (gameStateRef.current === "playing") {
        if (e.type === "mousedown" && (e as MouseEvent).button !== 0) return; // Only left click jumps
        inputState.jumpPressed = true;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("mousedown", handleTouchStart);

    const resizeObserver = new ResizeObserver(() => {
      w = canvas.width = parent.clientWidth;
      h = canvas.height = parent.clientHeight;
      isMobile = w < 768;
      s.buildings = generateBuildings(w);
      // Reset hero to ground after resize
      s.hero.y = h - 80 + 60 - 55; // road center - HERO_HEIGHT
      s.hero.isJumping = false;
      s.hero.vy = 0;
    });
    resizeObserver.observe(parent);

    const drawPixelCloud = (x: number, y: number, cw: number, isDark: boolean) => {
      ctx.fillStyle = isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(255, 255, 255, 0.6)";
      const ch = cw * 0.3;
      ctx.fillRect(x, y, cw, ch);
      ctx.fillRect(x + cw * 0.2, y - ch * 0.6, cw * 0.4, ch);
      ctx.fillRect(x + cw * 0.5, y - ch * 0.3, cw * 0.3, ch);
    };

    // Draw Pixel Robot (facing right)
    const drawHero = (
      x: number,
      y: number,
      bob: number,
      isJumping: boolean,
      frame: number
    ) => {
      const px = 5; // pixel unit size

      // --- Head / Helm ---
      ctx.fillStyle = "#94a3b8"; // Silver/gray helm
      ctx.fillRect(x + px * 0.5, y + bob - px * 2, px * 4, px * 3.5);
      // Visor
      ctx.fillStyle = "#0ea5e9"; // Cyan glow
      ctx.fillRect(x + px * 2.5, y + bob - px * 1, px * 2.5, px * 1.5);
      // Antenna
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(x + px * 1.5, y + bob - px * 3.5, px * 0.5, px * 1.5);
      ctx.fillStyle = "#ef4444"; // Red tip
      ctx.fillRect(x + px * 1.25, y + bob - px * 4, px, px);

      // --- Body ---
      ctx.fillStyle = "#64748b"; // Darker gray body
      ctx.fillRect(x + px * 1, y + bob + px * 1.5, px * 3, px * 3.5);
      // Chest panel
      ctx.fillStyle = "#f59e0b"; // Yellow accent
      ctx.fillRect(x + px * 2, y + bob + px * 2.5, px * 2, px);
      ctx.fillStyle = "#10b981"; // Green accent
      ctx.fillRect(x + px * 2, y + bob + px * 3.8, px * 1.5, px);

      // --- Jetpack ---
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(x - px * 0.5, y + bob + px * 1.5, px * 1.5, px * 3);
      if (isJumping) {
        // Jetpack Fire
        ctx.fillStyle = "#f97316"; // Orange
        ctx.fillRect(
          x - px * 0.2,
          y + bob + px * 4.5,
          px,
          px * 1.5 + Math.random() * px
        );
        ctx.fillStyle = "#facc15"; // Yellow inner fire
        ctx.fillRect(x, y + bob + px * 4.5, px * 0.5, px + Math.random() * px);
      }

      // --- Arm ---
      if (isJumping) {
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(x + px * 2.5, y + bob + px * 1.5, px * 1, px * 2); // arm up/forward
      } else {
        ctx.fillStyle = "#94a3b8";
        if (frame % 16 < 8) {
          ctx.fillRect(x + px * 3, y + bob + px * 2.5, px * 1, px * 2); // arm back
        } else {
          ctx.fillRect(x + px * 1.5, y + bob + px * 2.5, px * 1, px * 2); // arm forward
        }
      }

      // --- Legs / Treads ---
      ctx.fillStyle = "#334155"; // Dark wheel/leg
      if (isJumping) {
        ctx.fillRect(x + px * 1.5, y + bob + px * 5, px * 1.5, px * 1.5);
      } else {
        if (frame % 12 < 6) {
          ctx.fillRect(x + px * 1, y + bob + px * 5, px * 1.5, px * 1.5);
          ctx.fillRect(x + px * 3, y + bob + px * 5, px * 1.5, px * 1.5);
        } else {
          ctx.fillRect(x + px * 0.5, y + bob + px * 5, px * 1.5, px * 1.5);
          ctx.fillRect(x + px * 2.5, y + bob + px * 5, px * 1.5, px * 1.5);
        }
      }
    };

    // Draw enemy (slime/goomba style)
    const drawEnemy = (
      x: number,
      y: number,
      w_size: number,
      isDark: boolean,
      alive: boolean
    ) => {
      if (!alive) return;
      const px = 5; // bigger enemy
      // Body - dome shape
      ctx.fillStyle = isDark ? "#e74c3c" : "#c0392b";
      ctx.fillRect(x + px, y - px * 5, w_size - px * 2, px); // top
      ctx.fillRect(x, y - px * 4, w_size, px * 4); // body
      // Eyes
      ctx.fillStyle = "white";
      ctx.fillRect(x + px * 1.5, y - px * 3.5, px * 1.5, px * 1.5);
      ctx.fillRect(x + w_size - px * 3, y - px * 3.5, px * 1.5, px * 1.5);
      // Pupils
      ctx.fillStyle = "#2D3436";
      ctx.fillRect(x + px * 2, y - px * 3, px * 0.8, px * 0.8);
      ctx.fillRect(x + w_size - px * 2.3, y - px * 3, px * 0.8, px * 0.8);
      // Feet
      ctx.fillStyle = isDark ? "#a93226" : "#922b21";
      ctx.fillRect(x, y, px * 2, px);
      ctx.fillRect(x + w_size - px * 2, y, px * 2, px);
    };

    // Draw pipe obstacle
    const drawPipe = (
      x: number,
      y: number,
      obsW: number,
      obsH: number,
      isDark: boolean
    ) => {
      ctx.fillStyle = isDark ? "#27ae60" : "#229954";
      ctx.fillRect(x, y - obsH, obsW, obsH);
      // Pipe cap
      ctx.fillStyle = isDark ? "#2ecc71" : "#27ae60";
      ctx.fillRect(x - 8, y - obsH, obsW + 16, 16);
      // Highlight
      ctx.fillStyle = isDark
        ? "rgba(255,255,255,0.15)"
        : "rgba(255,255,255,0.2)";
      ctx.fillRect(x + 5, y - obsH + 20, 7, obsH - 24);
    };

    // Draw spike obstacle
    const drawSpike = (x: number, y: number, isDark: boolean) => {
      ctx.fillStyle = isDark ? "#95a5a6" : "#7f8c8d";
      // Three bigger spikes
      for (let i = 0; i < 3; i++) {
        const sx = x + i * 20;
        ctx.beginPath();
        ctx.moveTo(sx, y);
        ctx.lineTo(sx + 10, y - 36);
        ctx.lineTo(sx + 20, y);
        ctx.closePath();
        ctx.fill();
      }
      // Base
      ctx.fillRect(x, y, 60, 6);
    };

    const getBaseSpeed = () => (isMobile ? 3.9 : 4.6);
    let spawnTimer = 0;
    let prevState: GameState = "idle";
    let gameOverFired = false;

    const loop = () => {
      const gs = gameStateRef.current;
      const baseRoadSpeed = getBaseSpeed();

      // Pause rendering when game over (freeze frame)
      if (gs === "gameover") {
        prevState = gs;
        animRef.current = requestAnimationFrame(loop);
        return;
      }

      // Transition logic
      if (prevState !== gs) {
        if (gs === "playing" || gs === "idle") {
          s.obstacles = [];
          s.hero.isJumping = false;
          s.hero.vy = 0;
          s.hero.y = canvas.height - 80 + 60 - 45; // groundY + 60 - HERO_HEIGHT
          inputState.jumpPressed = false;
        }
        if (prevState === "playing" && gs === "idle") {
          // Reset frame so the sun/moon matches the user's toggle
          const CYCLE_FRAMES = 2700;
          s.frame =
            themeRef.current === "dark"
              ? CYCLE_FRAMES * 0.75
              : CYCLE_FRAMES * 0.25;
        }
        if (gs === "playing") {
          const baseSpeed = getBaseSpeed();
          // Spawn first obstacle instantly and closer to the player so there is no long wait!
          // 80 frames away ensures it hits right before 10 points.
          s.obstacles = [
            {
              type: (Math.random() < 0.5 ? "pipe" : "enemy") as Obstacle["type"],
              x: Math.min(w + 50, w * 0.25 + 80 * baseSpeed),
              width: 48,
              height: 60 + Math.random() * 50,
              alive: true,
            },
          ];
          spawnTimer = 0; // Starts counting for the *next* obstacle

          s.score = 0;
          s.difficultyMult = 1;
          s.hero.trail = [];
          s.particles = [];
          gameOverFired = false;
          s.lastDisplayScore = 0;
          // Reset posisi matahari/bulan ke sebelah kanan saat mulai main
          const CYCLE_FRAMES = 2700;
          s.frame = themeRef.current === "dark" ? CYCLE_FRAMES * 0.5 : 0;
        }
      }
      prevState = gs;

      s.frame++;

      if (gs === "playing") {
        s.score += 1;
        s.difficultyMult = 1 + s.score / 3000; // Speed increases over time

        if (onScoreUpdateRef.current) {
          const displayScore = Math.floor(s.score / 10);
          // Ensure stable and exact 1-time trigger per displayScore
          if (!s.lastDisplayScore || s.lastDisplayScore !== displayScore) {
            onScoreUpdateRef.current(displayScore);
            if (displayScore > 0 && displayScore % 100 === 0) {
              playSfx("milestone");
            }
            s.lastDisplayScore = displayScore;
          }
        }
      } else {
        s.score = 0;
        s.difficultyMult = 1;
      }

      const currentRoadSpeed =
        gs === "playing" ? baseRoadSpeed * s.difficultyMult : baseRoadSpeed;

      // Automatic Day/Night Cycle (2700 frames = 45 seconds at 60fps)
      const CYCLE_FRAMES = 2700;
      const cycleProgress = (s.frame % CYCLE_FRAMES) / CYCLE_FRAMES;
      const isDay = cycleProgress < 0.5;

      // Idle & gameover: ikut toggle theme. Playing: auto cycle.
      const currentDark =
        gs === "playing" ? !isDay : themeRef.current === "dark";
      const groundY = h - 80;
      // Surface = vertical center of the road (road is 120px tall)
      const surface = groundY + 60;
      // Robot sprite actual height
      const HERO_HEIGHT = 45;
      const baseHeroY = surface - HERO_HEIGHT;
      // Idle: karakter di tengah. Playing: mundur sedikit ke kiri.
      const actualHeroX = gs === "playing" ? w * 0.25 : w * 0.5;

      // Initialize hero Y
      if (s.hero.y === 0) s.hero.y = baseHeroY;

      // --- SKY ---
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      if (currentDark) {
        skyGrad.addColorStop(0, "#0f172a");
        skyGrad.addColorStop(1, "#1e1b4b");
      } else {
        skyGrad.addColorStop(0, "#7dd3fc");
        skyGrad.addColorStop(1, "#bae6fd");
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Stars / Sun / Moon
      // Calculate X position: moves from w + 100 to -100 over half a cycle
      const phaseProgress = isDay
        ? cycleProgress / 0.5
        : (cycleProgress - 0.5) / 0.5;
      const celestialX = w + 100 - phaseProgress * (w + 200);

      if (currentDark) {
        ctx.fillStyle = "white";
        s.stars.forEach((star) => {
          star.x -= 0.1;
          if (star.x < 0) star.x = w;
          const alpha = (Math.sin(s.frame * 0.05 + star.blinkPhase) + 1) / 2;
          ctx.globalAlpha = alpha * 0.8;
          ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        ctx.globalAlpha = 1.0;
        // Moon
        ctx.fillStyle = "#fde047";
        ctx.beginPath();
        ctx.arc(celestialX, 100, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(celestialX - 10, 95, 25, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = "#fef08a";
        ctx.beginPath();
        ctx.arc(celestialX, 100, 40, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- CLOUDS ---
      s.clouds.forEach((cloud) => {
        cloud.x -= cloud.speed * (currentRoadSpeed / baseRoadSpeed);
        if (cloud.x + cloud.width < 0) {
          cloud.x = w;
          cloud.y = Math.random() * (h * 0.4);
        }
        drawPixelCloud(cloud.x, cloud.y, cloud.width, currentDark);
      });

      // --- BUILDINGS ---
      const scrollY = window.scrollY || 0;
      const buildingParallaxOffset = scrollY * 0.3; // Parallax effect

      s.buildings.forEach((b) => {
        b.x -= currentRoadSpeed * 0.25;
        if (b.x + b.width < 0) {
          const rightmost = Math.max(
            ...s.buildings.map((bg) => bg.x + bg.width)
          );
          b.x = Math.max(w, rightmost) + 20 + Math.random() * 60;
          b.width = 50 + Math.random() * 80;
          b.height = 100 + Math.random() * 250;
        }

        ctx.fillStyle = currentDark ? b.colorDark : b.colorLight;
        const bTop = groundY - b.height - buildingParallaxOffset;
        // Extend height so it doesn't detach from ground
        const bHeight = b.height + buildingParallaxOffset;

        ctx.fillRect(b.x, bTop, b.width, bHeight);

        if (currentDark) {
          ctx.fillStyle = "#fef08a";
          b.windows.forEach((winOn, i) => {
            if (winOn) {
              const wx = b.x + 10 + (i % 2) * 20;
              const wy = bTop + 20 + Math.floor(i / 2) * 30;
              if (wx + 10 < b.x + b.width && wy + 15 < groundY) {
                ctx.fillRect(wx, wy, 10, 15);
              }
            }
          });
        }
      });

      // --- GROUND ---
      ctx.fillStyle = currentDark ? "#1e293b" : "#475569";
      ctx.fillRect(0, groundY, w, 120);
      // Top border stripe
      ctx.fillStyle = currentDark ? "#334155" : "#94a3b8";
      ctx.fillRect(0, groundY, w, 4);
      // Center dashed line (road=120px, top stripe=4px, usable=116px, center at 62)
      const lineOffset = (s.frame * currentRoadSpeed) % 60;
      ctx.fillStyle = currentDark
        ? "rgba(203,213,225,0.35)"
        : "rgba(255,255,255,0.5)";
      for (let x = -lineOffset; x < w; x += 60) {
        ctx.fillRect(x, groundY + 60, 28, 4);
      }

      // --- OBSTACLES ---
      spawnTimer++;
      // Normalize spawn rate to physical distance (e.g. 468 pixels) to ensure consistent density regardless of base speed
      const baseSpawnFrames = 468 / baseRoadSpeed;
      const randomJitter = 312 / baseRoadSpeed;

      const spawnRate =
        gs === "playing" ? baseSpawnFrames / s.difficultyMult : baseSpawnFrames;
      if (
        spawnTimer >
        spawnRate + Math.random() * (randomJitter / s.difficultyMult)
      ) {
        spawnTimer = 0;
        const type = Math.random();
        if (type < 0.35) {
          // Pipe
          s.obstacles.push({
            type: "pipe",
            x: w,
            width: 48,
            height: 60 + Math.random() * 50,
            alive: true,
          });
        } else if (type < 0.7) {
          // Enemy
          s.obstacles.push({
            type: "enemy",
            x: w,
            width: 40,
            height: 30,
            alive: true,
            walkPhase: 0,
          });
        } else {
          // Spike
          s.obstacles.push({
            type: "spike",
            x: w,
            width: 60,
            height: 36,
            alive: true,
          });
        }
      }

      // Obstacles anchored at the surface (bottom of obstacle = surface)
      const obstacleY = surface;
      for (let i = s.obstacles.length - 1; i >= 0; i--) {
        const obs = s.obstacles[i];
        obs.x -=
          obs.type === "enemy" ? currentRoadSpeed + 0.5 : currentRoadSpeed;

        if (obs.type === "pipe") {
          drawPipe(obs.x, obstacleY, obs.width, obs.height, currentDark);
        } else if (obs.type === "enemy") {
          obs.walkPhase = (obs.walkPhase || 0) + 0.15 * s.difficultyMult;
          const enemyBob = Math.sin(obs.walkPhase) * 2;
          drawEnemy(
            obs.x,
            obstacleY - 8 + enemyBob,
            obs.width,
            currentDark,
            obs.alive
          );
        } else if (obs.type === "spike") {
          drawSpike(obs.x, obstacleY - 8, currentDark);
        }

        if (obs.x + obs.width < -50) {
          s.obstacles.splice(i, 1);
        }
      }

      // --- HERO LOGIC ---

      // Auto-jump logic (only in IDLE mode)
      if (gs === "idle") {
        let nearestObs = null;
        for (const o of s.obstacles) {
          if (!o.alive) continue;
          if (o.x > actualHeroX - 10 && o.x < actualHeroX + 120) {
            nearestObs = o;
            break;
          }
        }
        if (
          nearestObs &&
          !s.hero.isJumping &&
          nearestObs.x - actualHeroX < 50
        ) {
          s.hero.isJumping = true;
          s.hero.vy = isMobile ? -14 : -15;
          if ((gs as GameState) === "playing") playSfx("jump");
          if (nearestObs.type === "enemy") {
            s.hero.stompTarget = nearestObs;
          }
        }
      } else if (gs === "playing") {
        if (inputState.jumpPressed && !s.hero.isJumping) {
          s.hero.isJumping = true;
          s.hero.vy = isMobile ? -16 : -17; // slightly stronger jump for player
          playSfx("jump");
          inputState.jumpPressed = false;
        } else {
          inputState.jumpPressed = false;
        }

        // Collision Detection (only if game over hasn't been fired yet)
        if (!gameOverFired) {
          // Hero hitbox — generous to match visual sprite
          const hX = actualHeroX;
          const hY = s.hero.y - 15; // account for head/antenna
          const hW = 25;
          const hH = HERO_HEIGHT + 10;

          for (const o of s.obstacles) {
            if (!o.alive) continue;

            let oX = o.x;
            let oY, oH;

            // Match the DRAWN positions of obstacles
            if (o.type === "spike") {
              oX = o.x;
              oY = obstacleY - 8 - 36; // drawSpike uses obstacleY - 8, spikes are 36px tall
              oH = 36 + 6; // spike height + base
            } else if (o.type === "enemy") {
              oY = obstacleY - 8 - 25; // drawEnemy uses obstacleY - 8
              oH = 30;
            } else {
              // pipe
              oY = obstacleY - o.height;
              oH = o.height;
            }

            // AABB Collision
            if (
              hX < oX + o.width &&
              hX + hW > oX &&
              hY < oY + oH &&
              hY + hH > oY
            ) {
              gameOverFired = true;
              playSfx("gameover");
              if (onGameOverRef.current) {
                onGameOverRef.current(Math.max(0, Math.floor(s.score / 10)));
              }
              break;
            }
          }
        }
      }

      // Physics
      if (s.hero.isJumping) {
        s.hero.y += s.hero.vy;
        s.hero.vy += isMobile ? 0.65 : 0.72; // fast gravity for high, snappy jump

        // Trail
        if (s.frame % 3 === 0) {
          s.hero.trail.push({ x: actualHeroX, y: s.hero.y, alpha: 0.4 });
        }

        if (s.hero.y >= baseHeroY) {
          s.hero.y = baseHeroY;
          s.hero.isJumping = false;
          s.hero.vy = 0;
          s.hero.stompTarget = null;
        }
      }

      // Draw Trail
      ctx.fillStyle = "#4ECDC4";
      for (let i = s.hero.trail.length - 1; i >= 0; i--) {
        const t = s.hero.trail[i];
        t.x -= currentRoadSpeed;
        t.alpha -= 0.04;
        if (t.alpha <= 0) {
          s.hero.trail.splice(i, 1);
        } else {
          ctx.globalAlpha = t.alpha * 0.5;
          ctx.fillRect(t.x, t.y + 12, 15, 24);
        }
      }
      ctx.globalAlpha = 1.0;

      // Draw particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life--;
        ctx.globalAlpha = Math.max(0, p.life / 30);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 4, 4);
        if (p.life <= 0) s.particles.splice(i, 1);
      }
      ctx.globalAlpha = 1.0;

      // Draw Hero
      const bob = !s.hero.isJumping && s.frame % 10 < 5 ? -2 : 0;
      drawHero(actualHeroX, s.hero.y, bob, s.hero.isJumping, s.frame);

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      if (audioCtx) audioCtx.close();
      cancelAnimationFrame(animRef.current);
      resizeObserver.disconnect();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("mousedown", handleTouchStart);
    };
  }, []); // Effect runs ONCE — reads game state from refs

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full z-0 ${
        gameState === "playing" ? "pointer-events-auto" : "pointer-events-none"
      }`}
      style={{ imageRendering: "pixelated" }}
    />
  );
};

export default ArcadeBackground;
