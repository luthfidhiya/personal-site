import { useRef } from "react";
import { useParallax } from "../../hooks/useParallax";
import { profile } from "../../data/profile";
import Backdrop from "../art/Backdrop";

// Below the peak, at the foot of the falls: the ronin sits still by the water.
// The words take the right side, so the falls keep the left.
const About = () => {
  const ref = useRef<HTMLElement>(null);
  useParallax(ref);

  return (
    <section ref={ref} id="about" className="scene scene-about" aria-labelledby="about-title">
      <Backdrop
        name="about"
        alt="A ronin kneels in meditation on a rock beside a waterfall, under red moonlight"
      />
      <div className="scene-copy about-copy">
        <p className="kicker">
          <span className="kanji" aria-hidden="true">壱</span> About
        </p>
        <h2 id="about-title" className="scene-title">
          Stillness
        </h2>
        <p className="scene-lead">
          I'm {profile.name}, a fullstack web developer who builds digital products that are not only functional but
          also beautiful and intuitive.
        </p>
        <ul className="trait-list">
          {["Problem solver", "Detail oriented", "Continuous learner", "Team player"].map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className="scene-note">Based in {profile.location}.</p>
      </div>
    </section>
  );
};

export default About;
