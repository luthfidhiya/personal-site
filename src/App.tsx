import TopNav from "./components/TopNav";
import Hero from "./components/Hero";
import About from "./components/sections/About";
import Arsenal from "./components/sections/Arsenal";
import Work from "./components/sections/Work";
import Contact from "./components/sections/Contact";
import Atmosphere from "./components/Atmosphere";

function App() {
  return (
    <>
      <a href="#about" className="skip-link">
        Skip to content
      </a>
      <TopNav />
      <main id="top">
        <Hero />
        <About />
        <Arsenal />
        <Work />
        <Contact />
      </main>
      <Atmosphere />
    </>
  );
}

export default App;
