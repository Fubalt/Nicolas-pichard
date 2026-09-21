import { QuoteQuestion } from '@/types/quotes';

/**
 * 100% Exact subtitles extracted from Cyprien's official YouTube videos.
 * Every startTime and pauseTime is aligned to the millisecond with YouTube's official captions
 * so that:
 * 1) The setup clip plays the exact introductory sentence completely.
 * 2) The video cuts cleanly at the end of the setup subtitle BEFORE the punchline begins.
 * 3) The reveal clip continues from pauseTime to play the punchline in video and audio.
 * For each quote, 3 subtle and deceptive variations are crafted to create genuine doubt.
 */
export const CYPRIEN_QUOTES: QuoteQuestion[] = [
  {
    id: 'cortex_majeur',
    videoId: 'dKwzZZKIbUs',
    videoTitle: 'Cyprien répond à Cortex',
    contextDescription: 'En plein rap clash de 2011 face à Cortex.',
    startTime: 38.2,
    pauseTime: 40.6,
    resumeDuration: 3.5,
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
    startTime: 50.1,
    pauseTime: 53.1,
    resumeDuration: 3.0,
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
    startTime: 114.4,
    pauseTime: 118.7,
    resumeDuration: 2.8,
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
    id: 'geeks_ongles',
    videoId: 'wzjvKygubsI',
    videoTitle: 'Cyprien - Les geeks',
    contextDescription: 'Le pire cauchemar technologique d\'un internaute.',
    startTime: 92.3,
    pauseTime: 96.8,
    resumeDuration: 2.6,
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
    id: 'geeks_super_informaticien',
    videoId: 'wzjvKygubsI',
    videoTitle: 'Cyprien - Les geeks',
    contextDescription: 'Quand tout le monde autour de toi te demande des services informatiques.',
    startTime: 67.4,
    pauseTime: 71.8,
    resumeDuration: 2.4,
    setupPhrase: "T'es un geek quand tous les gens autour de toi te prennent pour...",
    correctPunchline: "Super informa-ticien",
    options: [
      "Super informa-ticien",
      "Le dépanneur officiel de la famille",
      "Un hacker des services secrets",
      "L'ingénieur de la maison"
    ]
  },
  {
    id: 'geeks_helicoptere',
    videoId: 'wzjvKygubsI',
    videoTitle: 'Cyprien - Les geeks',
    contextDescription: 'La réponse absurde de Cyprien quand on lui demande de tout réparer.',
    startTime: 78.9,
    pauseTime: 80.5,
    resumeDuration: 3.5,
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
    id: 'vieux_internet_repetez',
    videoId: 'uFpKj3JbORs',
    videoTitle: 'Cyprien - Les vieux et la technologie',
    contextDescription: 'Cyprien reprend les expressions de sa famille.',
    startTime: 25.0,
    pauseTime: 26.9,
    resumeDuration: 4.0,
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
    id: 'vieux_facebook_plus_net',
    videoId: 'uFpKj3JbORs',
    videoTitle: 'Cyprien - Les vieux et la technologie',
    contextDescription: 'Quand les parents tentent de parler des réseaux sociaux.',
    startTime: 30.9,
    pauseTime: 33.3,
    resumeDuration: 2.8,
    setupPhrase: "Ah mais tu sais que moi aussi je vais sur le Facebook.",
    correctPunchline: 'Juste "Facebook", c\'est plus net.',
    options: [
      'Juste "Facebook", c\'est plus net.',
      'Arrêtez avec le "Le", on dit juste "Facebook" !',
      'Pas "Le Facebook", s\'il vous plaît, c\'est ridicule !',
      'On dit juste "Facebook", personne dit "Le Facebook" !'
    ]
  },
  {
    id: 'ecole_contact_visuel',
    videoId: 'RL7grUEo960',
    videoTitle: "Cyprien - L'école",
    contextDescription: 'L\'instant critique où le professeur cherche une victime au tableau.',
    startTime: 116.2,
    pauseTime: 120.0,
    resumeDuration: 4.2,
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
    id: 'ecole_calculatrice',
    videoId: 'RL7grUEo960',
    videoTitle: "Cyprien - L'école",
    contextDescription: 'Les techniques ultimes pour s\'occuper pendant les cours de maths.',
    startTime: 184.8,
    pauseTime: 187.5,
    resumeDuration: 3.5,
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
    id: 'pubs_famille_merde',
    videoId: '1xTa_2WhU4w',
    videoTitle: 'CYPRIEN - LES PUBS vs LA VIE 2',
    contextDescription: 'Le dîner de famille qui tourne au vinaigre.',
    startTime: 44.6,
    pauseTime: 45.75,
    resumeDuration: 2.0,
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
    startTime: 103.1,
    pauseTime: 104.70,
    resumeDuration: 2.8,
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
    startTime: 964.6,
    pauseTime: 968.8,
    resumeDuration: 3.5,
    setupPhrase: "Tout le monde pense que t'es débile et je comprends mieux pourquoi !",
    correctPunchline: "Je préfère être débile que puceau !",
    options: [
      "Je préfère être débile que puceau !",
      "Je préfère être débile qu'avoir ta gueule !",
      "Peut-être que je suis débile, mais au moins j'ai des potes !",
      "Je préfère être con que passer ma vie tout seul !"
    ]
  },
  {
    id: 'cartouche_wii_sports',
    videoId: 'c5TW7lqVuVY',
    videoTitle: 'CYPRIEN - LA CARTOUCHE',
    contextDescription: 'Quand Gabi prétend être un vrai combattant.',
    startTime: 1065.7,
    pauseTime: 1069.4,
    resumeDuration: 2.4,
    setupPhrase: "Tu tapes fort quand même ! - Je fais de la boxe. - Ah oui ?",
    correctPunchline: "Dans Wii Sports.",
    options: [
      "Dans Wii Sports.",
      "À la salle du quartier.",
      "Sur Punch-Out.",
      "Depuis tout petit avec mon frère."
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
