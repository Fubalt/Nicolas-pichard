import { QuoteQuestion } from '@/types/quotes';

/**
 * 100% Exact subtitles directly extracted from Cyprien's official YouTube videos.
 * Each setup clip is short (~3 seconds) before the cut.
 */
export const CYPRIEN_QUOTES: QuoteQuestion[] = [
  {
    id: 'cortex_majeur',
    videoId: 'dKwzZZKIbUs',
    videoTitle: 'Cyprien répond à Cortex',
    contextDescription: 'En plein rap clash de 2011 face à Cortex.',
    startTime: 37,
    pauseTime: 40.5,
    resumeDuration: 4.5,
    setupPhrase: "Ça y est ça me revient ta tête d'obèse moqueur !",
    correctPunchline: "On était ensemble au CP mais, t'étais déjà majeur !",
    options: [
      "On était ensemble au CP mais, t'étais déjà majeur !",
      "On t'a donné rendez-vous sur les Champs-Élysées !",
      "Tes vidéos on s'en tape, retourne à l'école !",
      "T'as aucun talent et tu parles fort pour te faire remarquer !"
    ]
  },
  {
    id: 'cortex_bateau_mouche',
    videoId: 'dKwzZZKIbUs',
    videoTitle: 'Cyprien répond à Cortex',
    contextDescription: 'Cyprien critique la carrière de rappeur de son rival.',
    startTime: 50,
    pauseTime: 53.2,
    resumeDuration: 4.5,
    setupPhrase: "Tu t'dis rappeur mais ta carrière décolle pas d'un pouce...",
    correctPunchline: "la seule scène que tu montes, c'est sur un bateau-mouche !",
    options: [
      "la seule scène que tu montes, c'est sur un bateau-mouche !",
      "t'es officiellement le Magloire du rap Français !",
      "ma mère m'a toujours interdit de taper sur les handicapés !",
      "t'écris pas une ligne sans faire une faute d'orthographe !"
    ]
  },
  {
    id: 'cortex_podcast',
    videoId: 'dKwzZZKIbUs',
    videoTitle: 'Cyprien répond à Cortex',
    contextDescription: 'La toute dernière phrase de la vidéo après le coup de feu.',
    startTime: 114,
    pauseTime: 117.8,
    resumeDuration: 4,
    setupPhrase: "Tu fais des possecast, moi j'vais faire des possecast...",
    correctPunchline: "On dit PODCAST.",
    options: [
      "On dit PODCAST.",
      "Tu vas voir j'vais te montrer !",
      "Retourne matter les dessins animés !",
      "Laisse-moi deviner, tu cherches des amis ?"
    ]
  },
  {
    id: 'geeks_harry_potter',
    videoId: 'wzjvKygubsI',
    videoTitle: 'Cyprien - Les geeks',
    contextDescription: 'Cyprien s\'énerve contre la fausse mode des geeks.',
    startTime: 12,
    pauseTime: 15.6,
    resumeDuration: 4,
    setupPhrase: "C'est pas parce que tu passes ton temps sur Facebook et que t'as aimé le dernier Harry Potter...",
    correctPunchline: "que t'es un geek.",
    options: [
      "que t'es un geek.",
      "que tu t'y connais en nouvelles technologies.",
      "que tu peux te la raconter sur Twitter.",
      "que t'as le droit de porter ces lunettes."
    ]
  },
  {
    id: 'geeks_helicoptere',
    videoId: 'wzjvKygubsI',
    videoTitle: 'Cyprien - Les geeks',
    contextDescription: 'Quand tout le monde te prend pour Super Informaticien.',
    startTime: 78,
    pauseTime: 80.6,
    resumeDuration: 5,
    setupPhrase: "Tu peux réparer mon ordinateur ?",
    correctPunchline: "J'ai un trombone et une ficelle, tu peux me construire un hélicoptère ?",
    options: [
      "J'ai un trombone et une ficelle, tu peux me construire un hélicoptère ?",
      "Tu peux m'installer un antivirus et me défragmenter mon PC ?",
      "J'ai cliqué sur un bouton rouge et tout a disparu !",
      "Mon écran est bleu et y'a de la fumée qui sort !"
    ]
  },
  {
    id: 'geeks_chaine_mails',
    videoId: 'wzjvKygubsI',
    videoTitle: 'Cyprien - Les geeks',
    contextDescription: 'Le pire cauchemar technologique d\'un internaute.',
    startTime: 93,
    pauseTime: 96.8,
    resumeDuration: 4.5,
    setupPhrase: "T'es un geek quand tu préfères qu'on t'arrache les ongles un par un, lentement...",
    correctPunchline: "plutôt que de recevoir une chaîne de mails de tes parents.",
    options: [
      "plutôt que de recevoir une chaîne de mails de tes parents.",
      "plutôt que de voir quelqu'un taper avec un seul doigt sur un clavier.",
      "plutôt que d'attendre qu'une page se charge en 56k.",
      "plutôt que d'expliquer comment fonctionne une souris d'ordinateur."
    ]
  },
  {
    id: 'technophobe_allergie',
    videoId: 'wNRUzu4fTgw',
    videoTitle: 'CYPRIEN - TECHNOPHOBE',
    contextDescription: 'Le pote d\'Arthur découvre enfin le diagnostic après les tests.',
    startTime: 109,
    pauseTime: 112.4,
    resumeDuration: 4.5,
    setupPhrase: "Alors... cigarette. Bon tu fumes pas...",
    correctPunchline: "J'ai compris. T'es allergique à la technologie !",
    options: [
      "J'ai compris. T'es allergique à la technologie !",
      "Attention, mon téléphone va encore me brûler la main !",
      "Moi ça va, heureusement moi ça va.",
      "T'arrêtes tes conneries un peu et tu me laisses jouer ?"
    ]
  },
  {
    id: 'vieux_internet_repetez',
    videoId: 'uFpKj3JbORs',
    videoTitle: 'Cyprien - Les vieux et la technologie',
    contextDescription: 'Cyprien reprend les expressions de sa famille.',
    startTime: 24,
    pauseTime: 26.8,
    resumeDuration: 4.5,
    setupPhrase: "Vas-y montre moi ton truc sur l'Internet.",
    correctPunchline: '"Internet". Pas "L\'internet". Répétez après moi : "Internet".',
    options: [
      '"Internet". Pas "L\'internet". Répétez après moi : "Internet".',
      'Juste "Facebook", c\'est plus net.',
      'Oui, parce qu\'elle pense que "LOL" ça veut dire "Oui" sur Internet.',
      'Goo...gle...point...com'
    ]
  },
  {
    id: 'ecole_calculatrice',
    videoId: 'RL7grUEo960',
    videoTitle: "Cyprien - L'école",
    contextDescription: 'Les techniques ultimes pour s\'occuper pendant les cours de maths.',
    startTime: 183,
    pauseTime: 186.8,
    resumeDuration: 4.5,
    setupPhrase: "Pour les filles, écrire SOLEIL avec sa calculatrice.",
    correctPunchline: "Pour les mecs, écrire ELLE BAISE avec sa calculatrice.",
    options: [
      "Pour les mecs, écrire ELLE BAISE avec sa calculatrice.",
      "Pour les mecs, dessiner des bonhommes bâtons dans la marge.",
      "Pour les mecs, faire rebondir le stylo quatre couleurs.",
      "Pour les mecs, pincer son doigt dans les anneaux du classeur."
    ]
  },
  {
    id: 'ecole_contact_visuel',
    videoId: 'RL7grUEo960',
    videoTitle: "Cyprien - L'école",
    contextDescription: 'L\'instant critique où le professeur cherche une victime au tableau.',
    startTime: 117,
    pauseTime: 120.7,
    resumeDuration: 4.5,
    setupPhrase: 'Quand le prof veut interroger quelqu\'un... "Bon, qui passe au tableau ?"',
    correctPunchline: "Alors là, la technique, c'est d'éviter tout contact visuel avec le professeur.",
    options: [
      "Alors là, la technique, c'est d'éviter tout contact visuel avec le professeur.",
      "Tu fais semblant de chercher frénétiquement dans ta trousse.",
      "Tout le monde baisse la tête et prie pour pas se faire appeler.",
      "Et là comme par hasard, le prof dit : Cyprien !"
    ]
  },
  {
    id: 'pubs_famille_merde',
    videoId: '1xTa_2WhU4w',
    videoTitle: 'CYPRIEN - LES PUBS vs LA VIE 2',
    contextDescription: 'Le dîner de famille qui tourne au vinaigre.',
    startTime: 42.5,
    pauseTime: 45.6,
    resumeDuration: 4,
    setupPhrase: "T'façon, j'ai plus faim...",
    correctPunchline: "QUELLE FAMILLE DE MERDE !",
    options: [
      "QUELLE FAMILLE DE MERDE !",
      "MERDE, ON CHANTE PAS DANS UNE BANQUE !",
      "Dans les pubs, les gens sont bizarres.",
      "Je veux ces lunettes, c'est mes lunettes !"
    ]
  },
  {
    id: 'pubs_banque_chante',
    videoId: '1xTa_2WhU4w',
    videoTitle: 'CYPRIEN - LES PUBS vs LA VIE 2',
    contextDescription: 'La réaction d\'un banquier quand un client se met à pousser la chansonnette.',
    startTime: 101.5,
    pauseTime: 104.5,
    resumeDuration: 4,
    setupPhrase: "*en chantant* Pour une boîte, ça demande du temps...",
    correctPunchline: "MERDE, ON CHANTE PAS DANS UNE BANQUE !",
    options: [
      "MERDE, ON CHANTE PAS DANS UNE BANQUE !",
      "Votre dossier est zéro, là !",
      "QUELLE FAMILLE DE MERDE !",
      "Dans la vraie vie ça se passe jamais comme ça !"
    ]
  },
  {
    id: 'cartouche_puceau',
    videoId: 'c5TW7lqVuVY',
    videoTitle: 'CYPRIEN - LA CARTOUCHE',
    contextDescription: 'L\'échange d\'insultes mythique entre Flo et Cyprien après avoir perdu la cartouche.',
    startTime: 960,
    pauseTime: 963.2,
    resumeDuration: 4.5,
    setupPhrase: "Tout le monde pense que t'es débile et je comprends mieux pourquoi !",
    correctPunchline: "Je préfère être débile que puceau !",
    options: [
      "Je préfère être débile que puceau !",
      "À cause de toi on a perdu la cartouche !",
      "Tu tapes fort quand même !",
      "On a peut-être perdu une cartouche mais tu viens de retrouver un ami !"
    ]
  }
];

/**
 * Normalizes text for forgiving comparison:
 * lowercase, removes accents, strip punctuation, extra spaces.
 */
export function normalizeText(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics / accents
    .replace(/[^\w\s]/g, ' ') // replace punctuation with spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Verifies if user's manual input matches the authentic quote.
 * Flexible: exact match, substring inclusion, or major keyword overlap >= 60%.
 */
export function isQuoteMatch(userGuess: string, targetPunchline: string): boolean {
  const normUser = normalizeText(userGuess);
  const normTarget = normalizeText(targetPunchline);

  if (!normUser || !normTarget) return false;
  if (normUser === normTarget) return true;
  if (normTarget.includes(normUser) && normUser.length >= 5) return true;
  if (normUser.includes(normTarget)) return true;

  // Filter out tiny stop words
  const stopWords = new Set(['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'en', 'et', 'a', 'au', 'ce', 'que', 'qui', 'sa', 'se', 'son', 'ta', 'te', 'ton', 'on', 'il', 'je', 'tu', 'c', 'd', 'l', 'm', 'n', 's', 't', 'y']);
  const targetWords = normTarget.split(/\s+/).filter((w) => w.length >= 2 && !stopWords.has(w));
  const userWords = normUser.split(/\s+/).filter((w) => w.length >= 2 && !stopWords.has(w));

  if (targetWords.length === 0) {
    return normUser.length >= 2 && normTarget.includes(normUser);
  }

  let matchCount = 0;
  for (const tw of targetWords) {
    if (userWords.some((uw) => uw === tw || (uw.length >= 4 && (tw.includes(uw) || uw.includes(tw))))) {
      matchCount++;
    }
  }

  const ratio = matchCount / targetWords.length;
  return ratio >= 0.6; // At least 60% of significant words found
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getRandomQuotes(count = 5): QuoteQuestion[] {
  const shuffled = shuffleArray(CYPRIEN_QUOTES);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return selected.map((q) => ({
    ...q,
    options: shuffleArray(q.options),
  }));
}
