type Level = { id:number; name:string; threshold:number; motto:string };
export const LEVELS: readonly Level[] = [
  { id: 0, name: 'Départ — Garçon', threshold: 0, motto: "On pose des bases en douceur." },
  { id: 1, name: 'Découverte — Androgyne chic', threshold: 120, motto: "Premiers réflexes, premiers reflets." },
  { id: 2, name: 'Éclosion — Féminin discret', threshold: 280, motto: "La douceur s'installe." },
  { id: 3, name: 'Assurance — Féminité affirmée', threshold: 500, motto: "Présence, posture, voix stable." },
  { id: 4, name: 'Signature — Glow pop', threshold: 800, motto: "Couleurs qui te vont, style qui te suit." },
  { id: 5, name: 'Étoile — Sabrina Vibes', threshold: 1200, motto: "Charme, espièglerie, contrôle de scène." },
  { id: 6, name: 'Final — Sabrina Carpenter', threshold: 1700, motto: "Fluidité totale, signature personnelle." },
] as const;
