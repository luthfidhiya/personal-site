import { SECTIONS } from "../data/sections";
import { profile } from "../data/profile";

// One quiet bar over the art: the mark on the left, the four stops of the descent on the
// right. On phones the stops move to a short bar along the bottom, within thumb reach.
const TopNav = () => (
  <header className="topnav">
    <a href="#top" className="brand">
      <span className="brand-moon" aria-hidden="true" />
      <span className="brand-name">{profile.handle}</span>
    </a>
    <nav aria-label="Sections">
      <ul className="nav-list">
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className={s.id === "contact" ? "nav-link nav-cta" : "nav-link"}>
              <span className="nav-kanji" aria-hidden="true">
                {s.kanji}
              </span>
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  </header>
);

export default TopNav;
