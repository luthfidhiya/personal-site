import { useRef } from "react";
import { useParallax } from "../../hooks/useParallax";
import { skills } from "../../data/skills";
import Backdrop from "../art/Backdrop";

// The bamboo grove: the tools, laid out like blades on a rack, on the left;
// the assassin waits on his stone at the right.
const Arsenal = () => {
  const ref = useRef<HTMLElement>(null);
  useParallax(ref);

  return (
    <section ref={ref} id="arsenal" className="scene scene-arsenal" aria-labelledby="arsenal-title">
      <Backdrop
        name="arsenal"
        alt="A masked shinobi crouches on a mossy stone in a bamboo grove under a red moon, fireflies around him"
      />
      <div className="scene-copy arsenal-copy">
        <p className="kicker">
          <span className="kanji" aria-hidden="true">弐</span> Arsenal
        </p>
        <h2 id="arsenal-title" className="scene-title">
          Steel
        </h2>
        <p className="scene-lead">The tools I reach for, from interface to server.</p>
        <ul className="skill-rack">
          {skills.map((skill) => (
            <li key={skill.id}>
              <i className={`${skill.icon} skill-icon`} aria-hidden="true"></i>
              <span>{skill.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Arsenal;
