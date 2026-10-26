import { useState, useEffect } from "react";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import About from "./components/About/About";
import Projects from "./components/Projects/Projects";
import Experience from "./components/Experience/Experience";
import Contact from "./components/Contact/Contact";
import AskMeAnything from "./components/AskMeAnything/AskMeAnything";
import Footer from "./components/Footer/Footer";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Loading Screen */}
      <div className={`loading-screen ${!isLoading ? "loading-done" : ""}`}>
        <div className="loading-content">
          <h1 className="font-pixel text-2xl text-(--accent-pink)">
            LYTCHER.DEV
          </h1>
          <div className="loading-bar-container">
            <div className="loading-bar"></div>
          </div>
          <p className="font-pixel text-xs text-(--text-secondary)">
            LOADING...
          </p>
        </div>
      </div>

      <div className="relative w-full overflow-x-hidden transition-colors duration-300">
        <Navbar />
        <main>
          <Hero />
          <About />
          <Projects />
          <Experience />
          <Contact />
          <AskMeAnything />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;
