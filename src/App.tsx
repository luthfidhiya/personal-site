import { useCallback, useState } from "react";
import Hero from "./components/hero/Hero";
import Loader from "./components/Loader";
import About from "./components/about/About";
import { profile } from "./data/profile";
import { sectionById } from "./data/sections";
import { useSmoothScroll } from "./hooks/useSmoothScroll";

// v2 is built scene by scene (see DESIGN.md); each section gets its link in the bar once
// it exists
const BUILT = [sectionById("about")];

function App() {
  const [loading, setLoading] = useState(true);
  const done = useCallback(() => setLoading(false), []);
  useSmoothScroll(loading);
  return (
    <>
      {loading && <Loader onDone={done} />}
      <header className="topbar">
        <a href="#top" className="mark">
          <span className="mark-moon" aria-hidden="true" />
          {profile.handle}
        </a>
        <nav aria-label="Sections">
          <ul className="topnav">
            {BUILT.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>
                  <span className="kicker-kanji" aria-hidden="true">
                    {s.kanji}
                  </span>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="top">
        <Hero />
        <About />
      </main>
    </>
  );
}

export default App;
