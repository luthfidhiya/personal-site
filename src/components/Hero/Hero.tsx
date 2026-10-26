import { useState, useEffect } from "react";
import { PixelButton } from "../ui/PixelButton";
import ArcadeBackground from "./ArcadeBackground";
import { useTheme } from "../../hooks/useTheme";

const Hero = () => {
  const [offsetY, setOffsetY] = useState(0);
  const { theme } = useTheme();

  // Game States
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem("arcade_high_score");
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new CustomEvent("arcade-game-state", { detail: "playing" }));
  };

  const endGame = (finalScore: number) => {
    setGameState("gameover");
    window.dispatchEvent(new CustomEvent("arcade-game-state", { detail: "gameover" }));
    if (finalScore > highScore) {
      setHighScore(finalScore);
      try {
        localStorage.setItem("arcade_high_score", finalScore.toString());
      } catch {
        // Storage blocked; high score only lasts this session
      }
    }
  };

  const backToIdle = () => {
    setGameState("idle");
    document.body.style.overflow = "";
    window.dispatchEvent(new CustomEvent("arcade-game-state", { detail: "idle" }));
  };

  useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Listen for navbar clicks to end game
  useEffect(() => {
    const handleNavClick = () => {
      if (gameState === "playing" || gameState === "gameover") {
        setGameState("idle");
        setScore(0);
        document.body.style.overflow = "";
      }
    };
    window.addEventListener("arcade-nav-click", handleNavClick);
    return () => window.removeEventListener("arcade-nav-click", handleNavClick);
  }, [gameState]);

  const scrollToExperience = () => {
    const element = document.getElementById("experience");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative pt-[80px] pb-12 bg-(--bg-primary) min-h-dvh flex items-center w-full overflow-hidden"
    >
      <ArcadeBackground
        gameState={gameState}
        theme={theme}
        onGameOver={endGame}
        onScoreUpdate={setScore}
      />

      {/* Score and Controls Display (Visible when playing or gameover) */}
      <div
        className={`absolute top-24 right-8 md:right-12 z-50 transition-opacity duration-300 flex flex-col items-end gap-2 ${
          gameState !== "idle" ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-(--bg-card) pixel-border px-4 py-2 font-pixel text-xl md:text-2xl text-(--accent-pink)">
          {score.toString().padStart(5, "0")}
        </div>
        <div
          className={`font-mono text-xs text-(--text-primary) opacity-70 bg-(--bg-card) p-2 pixel-border-sm transition-opacity duration-500 ${
            gameState === "playing" ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="max-md:hidden">
            Controls: [W] / [Space] / [↑] to jump
          </span>
          <span className="md:hidden">Tap screen to jump</span>
        </div>
      </div>

      {/* Invisible Overlay to block text selection, right clicks, and other buttons during gameplay */}
      {gameState === "playing" && (
        <div 
          className="fixed inset-0 z-40" 
          onContextMenu={(e) => e.preventDefault()}
          style={{ userSelect: "none", WebkitTouchCallout: "none", WebkitUserSelect: "none" }}
        />
      )}

      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 relative z-10 pointer-events-none">
        
        {/* LEFT COLUMN: Content */}
        <div 
          className={`w-full max-w-2xl flex flex-col items-start gap-8 transition-all duration-500 pointer-events-auto ${
            gameState === "idle"
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-8"
          }`}
          style={
            gameState === "idle"
              ? { transform: `translateY(${offsetY * 0.3}px)` }
              : {}
          }
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-(--bg-card) pixel-border-sm animate-slide-up">
            <span className="w-2 h-2 rounded-full bg-(--accent-green) animate-pulse"></span>
            <span className="font-mono text-xs text-(--text-primary)">Open Work</span>
          </div>

          {/* Jargon Heading */}
          <h1 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-pixel leading-normal sm:leading-[1.3] [text-shadow:2px_2px_0px_var(--pixel-shadow)] md:[text-shadow:4px_4px_0px_var(--pixel-shadow)] animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="text-white dark:text-(--text-primary)">Crafting </span>
            <span className="text-(--accent-pink)">Digital</span>
            <br />
            <span className="text-white dark:text-(--text-primary)">Experiences</span>
          </h1>

          {/* Subtitle */}
          <p 
            className="text-base md:text-lg text-(--text-primary) bg-black/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 font-mono leading-relaxed max-w-xl animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            I transform ideas into high-performance web applications. Blending creative design with robust engineering.
          </p>

          {/* Action Buttons */}
          <div 
            className="flex flex-wrap items-center gap-4 mt-2 animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <PixelButton
              variant="default"
              onClick={scrollToExperience}
              className="bg-white text-black hover:bg-gray-100 px-6 py-3"
            >
              View Work
            </PixelButton>
            
            <PixelButton
              variant="primary"
              onClick={startGame}
              className="px-6 py-3 group"
            >
              <span className="group-hover:animate-ping mr-2">▶</span> Play
            </PixelButton>
          </div>
        </div>
      </div>

      {/* Game Over Overlay */}
      <div
        className={`absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center transition-opacity duration-300 ${
          gameState === "gameover"
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-(--bg-card) pixel-border p-8 md:p-12 flex flex-col items-center gap-6 max-w-[90%] transform transition-transform duration-300 scale-100">
          <h2 className="font-pixel text-4xl text-(--accent-pink) drop-shadow-[4px_4px_0px_var(--pixel-shadow)] text-center">
            GAME OVER
          </h2>

          <div className="flex flex-col gap-2 w-full bg-(--bg-primary) pixel-border-sm p-4 my-2">
            <div className="flex justify-between items-center gap-8">
              <span className="font-mono text-(--text-primary)">SCORE</span>
              <span className="font-pixel text-(--accent-cyan)">{score}</span>
            </div>
            <div className="flex justify-between items-center gap-8">
              <span className="font-mono text-(--text-primary)">
                HIGH SCORE
              </span>
              <span className="font-pixel text-(--accent-cyan)">
                {highScore}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-2 w-full">
            <PixelButton
              variant="primary"
              onClick={startGame}
              className="flex-1 py-3 text-center justify-center"
            >
              PLAY AGAIN
            </PixelButton>
            <PixelButton
              variant="secondary"
              onClick={backToIdle}
              className="flex-1 py-3 text-center justify-center"
            >
              BACK
            </PixelButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
