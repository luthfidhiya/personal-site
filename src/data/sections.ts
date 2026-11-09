export type SectionId = "about" | "arsenal" | "work" | "contact";

export interface SectionMeta {
  id: SectionId;
  kanji: string;
  label: string;
}

// Order of the descent; the menus link to these anchors
export const SECTIONS: SectionMeta[] = [
  { id: "about", kanji: "壱", label: "About" },
  { id: "arsenal", kanji: "弐", label: "Arsenal" },
  { id: "work", kanji: "参", label: "Work" },
  { id: "contact", kanji: "肆", label: "Contact" },
];

export const sectionById = (id: SectionId) => SECTIONS.find((s) => s.id === id)!;
