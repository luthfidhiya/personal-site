import { useState, useEffect } from 'react';
import { SectionTitle } from '../ui/SectionTitle';
import { ModernModal } from '../ui/ModernModal';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { projects } from '../../data/projects';

type Project = (typeof projects)[number];

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  return (
    <div 
      className="bg-(--bg-card-alt) border border-(--border-color) rounded-3xl flex flex-col hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_10px_40px_rgba(0,0,0,0.3)] transition-all duration-500 w-full shrink-0 lg:w-[calc(33.333%-1.33rem)] md:w-[calc(50%-1rem)] overflow-hidden group cursor-pointer"
      onClick={() => onClick(project)}
    >
      <div className="w-full aspect-video overflow-hidden bg-(--bg-primary) border-b border-(--border-color) relative">
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity z-10 pointer-events-none"></div>
        <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      </div>
      
      <div className="p-6 flex flex-col flex-1 gap-4">
        <h3 className="text-lg md:text-xl font-pixel text-(--text-primary) leading-relaxed truncate">{project.title}</h3>
        
        <div className="flex flex-wrap gap-2 mb-auto">
          {project.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="bg-(--bg-primary) px-3 py-1.5 text-[8px] sm:text-[10px] font-pixel text-(--text-secondary) rounded-full truncate max-w-[100px] border border-(--border-color) leading-tight pt-2">{tag}</span>
          ))}
        </div>
        
        <button 
          className="w-full mt-4 bg-(--text-primary) text-(--bg-primary) font-pixel text-[10px] sm:text-xs rounded-full py-4 hover:opacity-80 transition-opacity uppercase"
          onClick={(e) => {
            e.stopPropagation();
            onClick(project);
          }}
        >
          VIEW PROJECT
        </button>
      </div>
    </div>
  );
};

const Projects = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [cardsPerView, setCardsPerView] = useState(3);
  
  const [titleRef, titleVisible] = useScrollAnimation();
  const [carouselRef, carouselVisible] = useScrollAnimation();
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, projects.length - cardsPerView);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <section id="projects" className="bg-(--bg-card) py-24 min-h-screen flex flex-col justify-center items-center w-full relative overflow-hidden">
      <div className="w-full max-w-[1200px] mx-auto px-8 max-md:px-6 relative z-10 flex flex-col items-center">
        <div ref={titleRef} className={`w-full reveal reveal-up ${titleVisible ? 'visible' : ''}`}>
          <SectionTitle subtitle="A curated selection of my recent work">Projects</SectionTitle>
        </div>
        
        {/* Carousel Container */}
        <div ref={carouselRef} className={`w-full relative flex items-center justify-center mt-8 reveal reveal-up delay-200 ${carouselVisible ? 'visible' : ''}`}>
          
          {/* Left Arrow */}
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`absolute -left-4 md:-left-12 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-(--bg-primary) border border-(--border-color) text-(--text-primary) transition-all shadow-lg ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-xl hover:bg-(--accent-pink) hover:text-white hover:border-(--accent-pink)'}`}
            aria-label="Previous Project"
          >
            <i className="hn hn-arrow-left text-xl"></i>
          </button>

          {/* Cards Track */}
          <div className="w-full overflow-hidden px-4 py-8 -mx-4 -my-8">
            <div 
              className="flex gap-4 lg:gap-8 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{ transform: `translateX(calc(-${currentIndex * (100 / cardsPerView)}% - ${currentIndex > 0 ? (currentIndex * 1) : 0}rem))` }}
            >
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} onClick={setSelectedProject} />
              ))}
            </div>
          </div>

          {/* Right Arrow */}
          <button 
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
            className={`absolute -right-4 md:-right-12 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-(--bg-primary) border border-(--border-color) text-(--text-primary) transition-all shadow-lg ${currentIndex >= maxIndex ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-xl hover:bg-(--accent-pink) hover:text-white hover:border-(--accent-pink)'}`}
            aria-label="Next Project"
          >
            <i className="hn hn-arrow-right text-xl"></i>
          </button>

        </div>

        {/* Dot Indicators */}
        <div className="flex justify-center gap-3 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-(--accent-pink) scale-125 w-6' : 'bg-(--border-color) opacity-50 hover:opacity-80'}`}
              aria-label={`Go to slide ${i + 1}`}
            ></button>
          ))}
        </div>
      </div>

      {/* Project Detail Modal */}
      <ModernModal
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      >
        {selectedProject && (
          <div className="flex flex-col gap-6 p-2">
            <div className="w-full aspect-video bg-(--bg-primary) border border-(--border-color) rounded-2xl overflow-hidden shadow-inner">
              <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
            </div>
            
            <h3 className="font-pixel text-xl md:text-2xl text-(--text-primary)">
              {selectedProject.title}
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {selectedProject.tags.map((tag, i) => (
                <span key={i} className="bg-(--bg-card-alt) border border-(--border-color) px-3 py-1.5 text-[8px] sm:text-[10px] font-pixel text-(--text-secondary) rounded-full pt-2">
                  {tag}
                </span>
              ))}
            </div>
            
            <p className="font-body text-(--text-secondary) leading-relaxed text-base md:text-lg">
              {selectedProject.description}
            </p>

            <div className="mt-4 pt-6 border-t border-(--border-color) flex justify-end gap-4">
              <button 
                onClick={() => setSelectedProject(null)} 
                className="px-6 py-3 rounded-full border border-(--border-color) text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-card-alt) transition-colors font-pixel text-[10px]"
              >
                CLOSE
              </button>
              <a href={selectedProject.link} target="_blank" rel="noopener noreferrer" className="no-underline">
                <button className="px-6 py-3 rounded-full bg-(--text-primary) text-(--bg-primary) hover:opacity-80 transition-opacity font-pixel text-[10px] flex items-center gap-2">
                  <span className="pt-1">VISIT SITE</span>
                  <i className="hn hn-external-link"></i>
                </button>
              </a>
            </div>
          </div>
        )}
      </ModernModal>

    </section>
  );
};

export default Projects;
