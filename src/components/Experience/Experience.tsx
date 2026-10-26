import { SectionTitle } from '../ui/SectionTitle';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { experiences } from '../../data/experience';

type Experience = (typeof experiences)[number];

const ExperienceCard = ({ exp, index }: { exp: Experience; index: number }) => {
  const [ref, isVisible] = useScrollAnimation();

  return (
    <div 
      ref={ref}
      className={`reveal reveal-up flex flex-col md:flex-row gap-6 md:gap-12 w-full ${isVisible ? 'visible' : ''}`}
      style={{ transitionDelay: `${index * 0.15}s` }}
    >
      <div className="md:w-1/4 shrink-0 flex md:justify-end">
        <div className="font-pixel text-(--accent-pink) text-lg md:text-xl mb-2">{exp.year}</div>
      </div>
      
      <div className="md:w-3/4 bg-(--bg-card-alt) p-6 md:p-8 rounded-3xl border border-(--border-color) shadow-lg relative hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_10px_40px_rgba(0,0,0,0.3)] transition-all duration-500">
        <div className="absolute top-8 left-[-27px] md:left-[-51px] w-4 h-4 rounded-full bg-(--accent-pink) shadow-[0_0_10px_var(--accent-pink)] hidden md:block z-10"></div>
        
        <h3 className="text-xl md:text-2xl text-(--text-primary) font-pixel mb-2">{exp.role}</h3>
        <h4 className="text-sm md:text-base text-(--accent-cyan) font-pixel mb-4 pt-1">{exp.company}</h4>
        
        <p className="text-(--text-secondary) font-body leading-relaxed mb-6 text-base md:text-lg">
          {exp.description}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {exp.tags.map((tag, i) => (
            <span key={i} className="bg-(--bg-primary) px-3 py-1.5 text-[8px] sm:text-[10px] font-pixel text-(--text-secondary) border border-(--border-color) rounded-full pt-2">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const Experience = () => {
  const [titleRef, titleVisible] = useScrollAnimation();

  return (
    <section id="experience" className="bg-(--bg-card) py-24 min-h-screen flex flex-col justify-center items-center w-full relative">
      <div className="w-full max-w-[1200px] mx-auto px-8 max-md:px-6 relative z-10 flex flex-col items-center">
        <div ref={titleRef} className={`reveal reveal-up ${titleVisible ? 'visible' : ''} w-full`}>
          <SectionTitle subtitle="My professional journey so far">Experience</SectionTitle>
        </div>
        
        <div className="w-full max-w-[900px] mt-12 flex flex-col gap-12 relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-[calc(25%+11px)] top-4 bottom-4 w-[2px] bg-(--border-color) opacity-50 hidden md:block"></div>
          
          {experiences.map((exp, index) => (
            <ExperienceCard key={exp.id} exp={exp} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
