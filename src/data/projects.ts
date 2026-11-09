export interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  /** Live or repo URL; null shows "Link coming soon" instead of a dead button */
  link: string | null;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "E-Commerce",
    tags: ["Next.js", "Tailwind", "Stripe"],
    link: null,
    description: "A full-stack e-commerce platform built with Next.js, featuring a robust shopping cart, secure Stripe payment integration, and a sleek user interface tailored for modern shoppers."
  },
  {
    id: 2,
    title: "Task Manager",
    tags: ["React", "Node.js", "MongoDB"],
    link: null,
    description: "A productivity-boosting task management application with drag-and-drop boards, real-time updates, and a responsive design designed to keep teams organized."
  },
  {
    id: 3,
    title: "Finance App",
    tags: ["React Native", "SQLite", "Expo"],
    link: null,
    description: "A mobile personal finance tracker that helps users manage budgets, track daily expenses, and view insightful financial reports directly from their mobile devices."
  },
  {
    id: 4,
    title: "Portfolio Maker",
    tags: ["Vue.js", "Firebase", "CSS"],
    link: null,
    description: "An intuitive drag-and-drop portfolio builder that allows creatives to showcase their work online without writing a single line of code."
  }
];
