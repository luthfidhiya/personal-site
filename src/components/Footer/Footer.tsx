const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-(--footer-bg) text-(--footer-text) py-6 relative overflow-hidden w-full border-t border-(--border-color)">
      {/* Thin Pixel Border */}
      <div
        className="absolute top-0 left-0 w-full h-[2px] opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, var(--footer-text) 0, var(--footer-text) 8px, transparent 8px, transparent 16px)",
        }}
      ></div>

      <div className="w-full mx-auto px-6 md:px-12 lg:px-18">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-4">
          
          {/* Left Side: Brand, Crafted & Copyright */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="flex flex-col items-center sm:items-start gap-1">
              <span className="font-pixel text-[10px] sm:text-xs tracking-widest opacity-80 pt-0.5">LYTCHER.DEV</span>
              <span className="font-mono text-[9px] opacity-40 text-center sm:text-left">
                Crafted with <span className="text-(--accent-pink)">♥</span> and lots of ☕
              </span>
            </div>
            
            {/* Vertical Line Spanning Both Rows */}
            <div className="hidden sm:block w-px h-8 bg-current opacity-20"></div>
            
            <span className="font-mono text-[10px] sm:text-xs opacity-50 text-center sm:text-left">
              © {currentYear} Lytcher All rights reserved
            </span>
          </div>

          {/* Right Side: Connect Links */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
            <a
              href="mailto:hello@example.com"
              className="font-mono text-xs opacity-60 hover:opacity-100 hover:text-(--accent-pink) transition-all inline-flex items-center gap-2"
            >
              <i className="hn hn-message-dots-solid text-sm"></i> Email
            </a>
            <a
              href="#"
              className="font-mono text-xs opacity-60 hover:opacity-100 hover:text-(--accent-cyan) transition-all inline-flex items-center gap-2"
            >
              <i className="hn hn-linkedin text-sm"></i> LinkedIn
            </a>
            <a
              href="#"
              className="font-mono text-xs opacity-60 hover:opacity-100 hover:text-(--accent-yellow) transition-all inline-flex items-center gap-2"
            >
              <i className="hn hn-github text-sm"></i> GitHub
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
