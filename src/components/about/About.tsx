import { useRef, type SyntheticEvent } from "react";
import { about } from "../../data/about";
import { sectionById } from "../../data/sections";
import { useSceneParallax } from "../../hooks/useSceneParallax";

// The falls (DESIGN.md). The samurai rests after the cut; the words take the right, the
// falls the left. It rises over the end of the hero, starting in the same dark ground,
// so the two scenes share one stretch of shadow instead of meeting at an edge.

const art = (name: string, small: number, large: number) => ({
  src: `/art/about/${name}-${large}.webp`,
  srcSet: `/art/about/${name}-${small}.webp ${small}w, /art/about/${name}-${large}.webp ${large}w`,
});

// Until a component's art is generated (ART.md), its layer simply stays out of the picture
const hideMissing = (e: SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.hidden = true;
};

const About = () => {
  const rootRef = useRef<HTMLElement>(null);
  useSceneParallax(rootRef);
  const meta = sectionById("about");

  return (
    <section ref={rootRef} id="about" className="about" aria-labelledby="about-title">
      <div className="about-scene" aria-hidden="true">
        <div className="about-sky" />
        {/* The water sits in the cliff's cleft, so both live in one box sized like the cliff */}
        <div className="about-cliffbox" data-speed="-0.08">
          <img className="about-cliff" {...art("cliff", 960, 1920)} sizes="60vw" alt="" onError={hideMissing} />
          <div className="about-falls" />
        </div>
        <div className="about-pool" />
        <div className="about-mist" />
        {/* Likewise the samurai kneels on the raised rock */}
        <div className="about-ground" data-speed="0.04">
          <img className="about-rocks" {...art("rocks", 960, 1920)} sizes="110vw" alt="" onError={hideMissing} />
          <img className="about-figure" {...art("figure", 480, 960)} sizes="12vw" alt="" onError={hideMissing} />
        </div>
        <img className="about-front" data-speed="0.16" {...art("front", 960, 1920)} sizes="110vw" alt="" onError={hideMissing} />
      </div>

      <div className="about-copy">
        <p className="kicker">
          <span className="kicker-kanji" aria-hidden="true">
            {meta.kanji}
          </span>
          {meta.label}
        </p>
        <h2 id="about-title" className="scene-title">
          {about.title}
        </h2>
        {about.paragraphs.map((p) => (
          <p key={p} className="about-text">
            {p}
          </p>
        ))}
      </div>
    </section>
  );
};

export default About;
