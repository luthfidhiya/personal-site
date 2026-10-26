import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { SectionTitle } from "../ui/SectionTitle";
import { skills } from "../../data/skills";

const SkillPill = ({ skill }: { skill: (typeof skills)[number] }) => {
  return (
    <div
      className={`flex items-center gap-3 bg-(--bg-card-alt) rounded-xl border border-(--border-color) px-4 py-3 sm:px-5 sm:py-4 hover:-translate-y-1 hover:bg-(--bg-primary) hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_16px_rgba(0,0,0,0.4)] transition-all duration-300 group`}
    >
      <i
        className={`${skill.icon} text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300`}
      ></i>
      <span className="font-pixel text-[10px] sm:text-xs text-(--text-primary)">
        {skill.label}
      </span>
    </div>
  );
};

const About = () => {
  const [aboutRef, aboutVisible] = useScrollAnimation();

  return (
    <section
      id="about"
      className="bg-(--bg-card) py-24 min-h-screen flex flex-col justify-center items-center w-full relative"
    >
      <div className="w-full max-w-[1100px] mx-auto px-8 max-md:px-6 flex flex-col items-center relative z-10">
        <div
          ref={aboutRef}
          className={`reveal reveal-up w-full ${aboutVisible ? "visible" : ""}`}
        >
          {/* Unified Section Title */}
          <SectionTitle subtitle="Turning complex problems into simple solutions">
            About Me
          </SectionTitle>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center lg:items-start bg-transparent mt-12">
            {/* Left Column: Avatar */}
            <div className="w-full lg:w-[40%] flex justify-center lg:justify-end relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-(--text-primary) opacity-[0.03] dark:opacity-5 blur-3xl rounded-full z-0 pointer-events-none transition-opacity duration-500"></div>

              <div className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 lg:w-full lg:max-w-[350px] aspect-square rounded-full overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.05)] dark:shadow-[0_0_40px_rgba(255,255,255,0.05)] group bg-(--bg-card-alt)">
                <img
                  src="/about-avatar.png"
                  alt="Luthfi Dhiya"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Right Column: Content */}
            <div className="w-full lg:w-[60%] flex flex-col items-start text-left z-10 pt-4">
              <p className="font-body text-base sm:text-lg text-(--text-secondary) leading-relaxed mb-8 opacity-90">
                Hi! I'm{" "}
                <strong className="font-pixel text-[10px] sm:text-xs font-semibold text-(--text-primary) bg-(--bg-primary) border border-(--border-color) px-3 py-2 rounded-lg inline-block mx-1 align-middle">
                  Luthfi Dhiya
                </strong>{" "}
                a fullstack web developer passionate about building digital
                products that are not only functional but also beautiful and
                intuitive. With a strong foundation in modern web technologies,
                I strive to write clean, maintainable code that scales.
              </p>

              {/* Traits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-10 w-full">
                {[
                  "Problem Solver",
                  "Detail Oriented",
                  "Continuous Learner",
                  "Team Player",
                ].map((trait, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-(--text-secondary)"
                  >
                    <i className="hn hn-check-circle text-(--text-primary) opacity-80 text-lg"></i>
                    <span className="font-pixel text-[10px] sm:text-xs opacity-90 leading-tight pt-1">
                      {trait}
                    </span>
                  </div>
                ))}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-4 mb-10">
                <div className="flex items-center gap-2 px-4 py-3 bg-(--bg-primary) border border-(--border-color) rounded-full text-(--text-secondary)">
                  <span className="text-[10px] opacity-50 font-mono">ID</span>
                  <span className="font-pixel text-[10px] leading-tight pt-1">
                    Based in Indonesia
                  </span>
                </div>

                <div className="flex items-center gap-2 px-4 py-3 bg-(--bg-primary) border border-(--border-color) rounded-full text-(--text-secondary)">
                  <span className="w-2 h-2 rounded-full bg-(--accent-green) animate-pulse shadow-[0_0_8px_var(--accent-green)]"></span>
                  <span className="font-pixel text-[10px] leading-tight pt-1">
                    Available for Work
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tech Stack (Skills) Section Inside Unified Animation */}
          <div className="mt-24 mb-8 text-center w-full">
            <h3 className="font-pixel text-xl sm:text-2xl text-(--text-primary) uppercase tracking-wider mb-2">Tech Stack</h3>
            <p className="font-mono text-sm text-(--text-secondary) opacity-70">Technologies I work with</p>
          </div>

          <div className="w-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {skills.map((skill) => (
                <SkillPill key={skill.id} skill={skill} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
