import { QuoteQuestion } from '@/types/quotes';

/**
 * 100% Exact subtitles directly extracted from Cyprien's official YouTube videos.
 * For each quote, 3 subtle and deceptive variations are crafted to create genuine doubt.
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
      "On était ensemble au CP mais t'étais au fond de la classe !",
      "On était ensemble au collège mais t'avais déjà 18 ans !",
      "On était ensemble en maternelle mais t'avais déjà du poil au menton !"
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
      "la seule scène que tu fais, c'est au fond d'une péniche !",
      "la seule scène que tu montes, c'est pour passer l'aspirateur !",
      "le seul public que tu touches, c'est les pigeons de ton quartier !"
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
      "Ça se prononce PODCAST !",
      "Apprends à parler, c'est un PODCAST !",
      "Déjà, on dit PODCAST !"
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
      "que t'es devenu un vrai geek.",
      "que tu fais partie des geeks.",
      "que t'as un côté geek."
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
      "J'ai un trombone et un élastique, tu peux me réparer la fusée Ariane ?",
      "J'ai une pile et un câble USB, tu peux me pirater la NASA ?",
      "J'ai un bout de carton et du scotch, tu peux me fabriquer un avion de chasse ?"
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
      "plutôt que de devoir trier la boîte mail de tes parents.",
      "plutôt que de regarder tes parents envoyer un mail avec un seul doigt.",
      "plutôt que de recevoir un diaporama PowerPoint de ta tante."
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
      "C'est bon j'ai trouvé : ton corps rejette toute la technologie !",
      "Cherche plus : t'es devenu allergique aux ondes et à l'électronique !",
      "C'est officiel : t'es phobique de la technologie moderne !"
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
      '"Internet", sans le "L" apostrophe, s\'il vous plaît !',
      'On dit juste "Internet", arrêtez de dire "L\'internet" !',
      'C\'est "Internet" tout court, pourquoi vous rajoutez toujours un article ?'
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
      "Pour les mecs, taper 713705 pour afficher un gros mot à l'envers.",
      "Pour les mecs, écrire BEBE ou CASSE-TOI avec les chiffres.",
      "Pour les mecs, essayer d'écrire des insultes en retournant l'écran."
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
      "La seule technique, c'est de fixer intensément sa trousse sans cligner des yeux.",
      "Là tu baisses la tête et tu fais semblant d'écrire le truc le plus important de ta vie.",
      "La règle d'or, c'est surtout de ne jamais croiser le regard du prof."
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
      "MAIS QUELLE BANDE DE CONS !",
      "PUTAIN, QUELLE FAMILLE DE DÉBILES !",
      "JE PEUX PLUS VOUS SUPPORTER DANS CETTE MAISON !"
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
      "MAIS TA GUEULE, ON CHANTE PAS CHEZ LE BANQUIER !",
      "ARRÊTE DE CHANTER, ON EST DANS UN ÉTABLISSEMENT BANCAIRE !",
      "C'EST PAS UNE COMÉDIE MUSICALE, C'EST UN CRÉDIT IMMOBILIER !"
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
      "Je préfère être débile qu'avoir ta gueule !",
      "Peut-être que je suis débile, mais au moins j'ai des potes !",
      "Je préfère être con que passer ma vie tout seul !"
    ]
  }
];

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
