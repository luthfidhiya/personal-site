import { useRef } from "react";
import { useParallax } from "../../hooks/useParallax";
import { contactLinks, profile } from "../../data/profile";
import Backdrop from "../art/Backdrop";
import MotionToggle from "../MotionToggle";

// The end of the descent: travellers walk through the grass toward a torii under the moon,
// and the way to reach me waits on the near side of the gate.
const Contact = () => {
  const ref = useRef<HTMLElement>(null);
  useParallax(ref);

  return (
    <section ref={ref} id="contact" className="scene scene-contact" aria-labelledby="contact-title" data-fog>
      <Backdrop
        name="contact"
        alt="Three travellers in straw hats walk through tall grass toward a torii gate under a huge blood moon"
      />
      <div className="scene-copy contact-copy">
        <p className="kicker">
          <span className="kanji" aria-hidden="true">肆</span> Contact
        </p>
        <h2 id="contact-title" className="scene-title">
          The gate
        </h2>
        <p className="scene-lead">Have a project, a role, or a question? Reach me through any of these.</p>
        {contactLinks.length > 0 ? (
          <ul className="contact-list">
            {contactLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                  {link.icon && <i className={link.icon} aria-hidden="true"></i>}
                  <span>{link.label}</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="contact-soon">Contact links coming soon.</p>
        )}
      </div>

      <footer className="site-footer">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <MotionToggle />
      </footer>
    </section>
  );
};

export default Contact;
