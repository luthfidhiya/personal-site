export interface ContactLink {
  label: string;
  href: string;
  /** devicon class for the brand mark, if any */
  icon?: string;
}

export const profile = {
  name: "Luthfi Dhiya",
  handle: "Lytcher.dev",
  role: "Fullstack Web Developer",
  location: "Yogyakarta, Indonesia",
};

// TODO: fill in real addresses. Only entries listed here are shown on the page.
export const contactLinks: ContactLink[] = [
  // { label: "you@domain.com", href: "mailto:you@domain.com" },
  // { label: "GitHub", href: "https://github.com/<username>", icon: "devicon-github-original" },
  // { label: "LinkedIn", href: "https://www.linkedin.com/in/<username>", icon: "devicon-linkedin-plain" },
];
