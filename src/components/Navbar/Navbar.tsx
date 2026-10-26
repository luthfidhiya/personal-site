import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../hooks/useTheme";

const Navbar = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [isGameActive, setIsGameActive] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Listen for game state from Hero section
  useEffect(() => {
    const handleGameState = (e: Event) => {
      const { detail } = e as CustomEvent<string>;
      setIsGameActive(detail === "playing" || detail === "gameover");
    };
    window.addEventListener("arcade-game-state", handleGameState);
    return () => window.removeEventListener("arcade-game-state", handleGameState);
  }, []);
  
  // For the sliding indicator
  const navRef = useRef<HTMLUListElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left?: number; width?: number }>({});

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "about", "projects", "experience", "contact", "ask-me-anything"];
      let current = "";

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            current = section;
          }
        }
      }
      if (current) setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update sliding indicator position
  useEffect(() => {
    if (!navRef.current) return;
    const activeBtn = navRef.current.querySelector<HTMLElement>(`[data-section="${activeSection}"]`);
    if (activeBtn) {
      setIndicatorStyle({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
      });
    }
  }, [activeSection]);

  const scrollTo = (id: string) => {
    // Notify the game to stop if it's playing
    window.dispatchEvent(new CustomEvent("arcade-nav-click"));
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navItems = [
    { id: "home", label: "Home", icon: "hn-home-solid" },
    { id: "about", label: "About", icon: "hn-user-solid" },
    { id: "projects", label: "Projects", icon: "hn-branch-solid" },
    { id: "experience", label: "Experience", icon: "hn-briefcase-solid" },
    { id: "contact", label: "Contact", icon: "hn-message-dots-solid" },
    { id: "ask-me-anything", label: "AMA", icon: "hn-message-solid" },
  ];

  return (
    <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-1000 transition-all duration-500 w-max max-w-[95vw] ${
      isGameActive ? "opacity-0 translate-y-[-150%] pointer-events-none" : "opacity-100 translate-y-0"
    }`}>
      <div className="rounded-full px-2 py-1.5 flex items-center justify-between gap-2 sm:gap-4 bg-(--bg-card) border border-(--border-color) shadow-[4px_4px_0px_0px_var(--pixel-shadow)]">
        
        {/* Nav Links */}
        <ul ref={navRef} className="relative flex items-center gap-1 list-none m-0 p-0">
          {/* Sliding Indicator */}
          <div 
            className="absolute h-full rounded-full bg-(--bg-primary) border border-(--border-color) shadow-[2px_2px_0px_0px_var(--pixel-shadow)] transition-all duration-300 ease-in-out z-0"
            style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
          />

          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <li key={item.id} data-section={item.id} className="relative z-10 flex">
                <button
                  onClick={() => scrollTo(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full font-pixel text-[0.65rem] sm:text-[0.75rem] uppercase transition-colors duration-200 cursor-pointer ${
                    isActive 
                      ? "text-(--accent-pink)" 
                      : "text-(--text-primary) opacity-70 hover:opacity-100"
                  }`}
                >
                  <i className={`hn ${item.icon} text-[16px]`}></i>
                  <span className="hidden sm:block">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Separator */}
        <div className="w-px h-6 transition-colors duration-300 bg-(--border-color)"></div>

        {/* Theme Toggle */}
        <div className="pr-2 sm:pr-3 pl-1 flex items-center gap-2 sm:gap-3">
          <i className="hn hn-moon-solid text-(--text-primary) opacity-70 text-[16px] hidden sm:block"></i>
          <button 
            onClick={toggleTheme}
            className={`w-[36px] h-[20px] rounded-full p-[2px] transition-colors duration-200 ease-in-out flex items-center border ${
               theme === "dark" ? "bg-(--bg-card-alt) border-(--border-color)" : "bg-gray-300 border-gray-400"
            }`}
            aria-label="Toggle Theme"
          >
            <div 
              className={`w-[14px] h-[14px] rounded-full transition-transform duration-200 ease-in-out ${
                theme === "dark" ? "translate-x-[16px] bg-(--accent-yellow)" : "translate-x-0 bg-white"
              }`}
            ></div>
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
