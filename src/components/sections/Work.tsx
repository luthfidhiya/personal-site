import { useRef, useState } from "react";
import { useParallax } from "../../hooks/useParallax";
import { projects } from "../../data/projects";
import Backdrop from "../art/Backdrop";

// The dojo, where the work is laid out as a hand of cards. The chosen project lies face
// up in the middle; its neighbours lie face down on either side and turn it over when
// picked. The card back carries the site's mark: the moon with two crossed blades.

const CardBack = () => (
  <svg viewBox="0 0 200 280" className="card-back-art" aria-hidden="true">
    <rect x="6" y="6" width="188" height="268" rx="6" fill="#140a0d" stroke="#8f141c" strokeWidth="3" />
    <rect x="16" y="16" width="168" height="248" rx="3" fill="none" stroke="#3a1219" strokeWidth="2" />
    <circle cx="100" cy="140" r="38" fill="#c8202a" />
    <g stroke="#ece3d3" strokeWidth="4" strokeLinecap="round">
      <line x1="46" y1="216" x2="150" y2="64" />
      <line x1="154" y1="216" x2="50" y2="64" />
    </g>
    <g stroke="#8f141c" strokeWidth="8" strokeLinecap="round">
      <line x1="46" y1="216" x2="58" y2="198" />
      <line x1="154" y1="216" x2="142" y2="198" />
    </g>
  </svg>
);

const Work = () => {
  const ref = useRef<HTMLElement>(null);
  useParallax(ref);
  const [active, setActive] = useState(0);
  const count = projects.length;
  const go = (i: number) => setActive((i + count) % count);
  const project = projects[active];

  return (
    <section ref={ref} id="work" className="scene scene-work" aria-labelledby="work-title">
      <Backdrop name="work" alt="Inside a dark dojo, red paper lanterns glow in front of shoji screens lit by the moon" />
      <div className="scene-copy work-copy">
        <p className="kicker">
          <span className="kanji" aria-hidden="true">参</span> Work
        </p>
        <h2 id="work-title" className="scene-title">
          Kata
        </h2>
        <p className="scene-lead">Forms I have practised until they held. Pick a card to turn it over.</p>
      </div>

      {count === 0 ? (
        <p className="work-empty">Projects are being written up. Check back soon.</p>
      ) : (
        <div className="hand" role="group" aria-roledescription="carousel" aria-label="Projects">
          <div className="hand-cards">
            {count > 1 && (
              <button type="button" className="card card-side" onClick={() => go(active - 1)} aria-label={`Previous project: ${projects[(active - 1 + count) % count].title}`}>
                <CardBack />
              </button>
            )}
            <article key={project.id} className="card card-face" aria-live="polite">
              <p className="card-num">
                {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </p>
              <h3 className="card-title">{project.title}</h3>
              <p className="card-desc">{project.description}</p>
              <p className="card-tags">{project.tags.join(" · ")}</p>
              {project.link ? (
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="btn btn-red">
                  Open {project.title}
                </a>
              ) : (
                <p className="card-soon">Link coming soon</p>
              )}
            </article>
            {count > 1 && (
              <button type="button" className="card card-side" onClick={() => go(active + 1)} aria-label={`Next project: ${projects[(active + 1) % count].title}`}>
                <CardBack />
              </button>
            )}
          </div>

          {count > 1 && (
            <div className="hand-controls">
              <button type="button" className="hand-step" onClick={() => go(active - 1)}>
                Previous
              </button>
              <ol className="hand-dots">
                {projects.map((p, i) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="hand-dot"
                      aria-label={`Project ${i + 1}: ${p.title}`}
                      aria-current={i === active || undefined}
                      onClick={() => go(i)}
                    />
                  </li>
                ))}
              </ol>
              <button type="button" className="hand-step" onClick={() => go(active + 1)}>
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default Work;
