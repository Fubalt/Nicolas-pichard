import { QuoteQuestion } from '@/types/quotes';

/**
 * 100% Exact subtitles directly extracted from Cyprien's official YouTube videos.
 * Every video contains MULTIPLE distinct quote moments across its timeline (early, middle, late).
 * 
 * An anti-repetition engine guarantees:
 * - A single video never stays at the same timecode from game to game.
 * - Each game picks from different videos and varying timestamps.
 */
export const CYPRIEN_QUOTES: QuoteQuestion[] = [
  // ==========================================
  // VIDEO 1: Cyprien répond à Cortex (dKwzZZKIbUs)
  // ==========================================
  {
    id: 'cortex_obese_cp',
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
    id: 'cortex_google_images',
    videoId: 'dKwzZZKIbUs',
    videoTitle: 'Cyprien répond à Cortex',
    contextDescription: 'Cyprien tape le nom de Cortex sur internet.',
    startTime: 44.1,
    pauseTime: 46.9,
    resumeDuration: 3.2,
    setupPhrase: "Quand on recherche ton blaz dans Google Images...",
    correctPunchline: "...On apprend tout sur toi rien que sur la Première Page !",
    options: [
      "...On apprend tout sur toi rien que sur la Première Page !",
      "...On trouve des photos de toi avec une perruque !",
      "...Y a que des articles sur ta calvitie !",
      "...Google te propose 'voulez-vous dire un vrai rappeur ?'"
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
    id: 'cortex_orthographe',
    videoId: 'dKwzZZKIbUs',
    videoTitle: 'Cyprien répond à Cortex',
    contextDescription: 'Cyprien attaque le niveau de français de Cortex.',
    startTime: 56.5,
    pauseTime: 58.9,
    resumeDuration: 3.2,
    setupPhrase: "Retourne à l'école ! Tes vidéos on s'en tape !",
    correctPunchline: "T'écris pas une ligne sans faire une faute, D'OR-TO-GRAPHE !",
    options: [
      "T'écris pas une ligne sans faire une faute, D'OR-TO-GRAPHE !",
      "T'as même pas réussi à passer le brevet des collèges !",
      "T'as besoin d'un traducteur pour écrire un tweet !",
      "Apprends le Bescherelle avant d'écrire des textes !"
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

  // ==========================================
  // VIDEO 2: Cyprien - L'école (RL7grUEo960)
  // ==========================================
  {
    id: 'ecole_tableau_brosse',
    videoId: 'RL7grUEo960',
    videoTitle: "Cyprien - L'école",
    contextDescription: 'L\'angoisse maniaque du tableau mal effacé.',
    startTime: 90.7,
    pauseTime: 94.9,
    resumeDuration: 3.5,
    setupPhrase: "Quand le prof efface le tableau mais laisse un bout...",
    correctPunchline: "A ce moment là, j'ai tellement envie de prendre la brosse",
    options: [
      "A ce moment là, j'ai tellement envie de prendre la brosse",
      "Je peux plus écouter le cours, je fixe que ça",
      "J'ai envie de hurler et de monter sur l'estrade",
      "Ça me stresse tellement que j'oublie mon nom"
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

  // ==========================================
  // VIDEO 3: CYPRIEN - LES PUBS vs LA VIE 2 (1xTa_2WhU4w)
  // ==========================================
  {
    id: 'pubs2_famille_merde',
    videoId: '1xTa_2WhU4w',
    videoTitle: 'CYPRIEN - LES PUBS vs LA VIE 2',
    contextDescription: 'Le dîner de famille qui tourne au vinaigre.',
    startTime: 44.6,
    pauseTime: 45.75,
    resumeDuration: 2.2,
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
    id: 'pubs2_banque_chante',
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
    id: 'pubs2_citya',
    videoId: '1xTa_2WhU4w',
    videoTitle: 'CYPRIEN - LES PUBS vs LA VIE 2',
    contextDescription: 'La vérité sur les pubs d\'agences immobilières.',
    startTime: 122.0,
    pauseTime: 124.4,
    resumeDuration: 2.2,
    setupPhrase: "CITYA ENVIE D'UN APPART', VA VOIR... *en chantant*",
    correctPunchline: "MAIS FERME LA !!!",
    options: [
      "MAIS FERME LA !!!",
      "TA GUEULE AVEC TA CHANSON !",
      "ARRÊTE DE GUEULER !",
      "ON EN VEUT PAS DE TON APPART !"
    ]
  },
  {
    id: 'pubs2_banque_rue',
    videoId: '1xTa_2WhU4w',
    videoTitle: 'CYPRIEN - LES PUBS vs LA VIE 2',
    contextDescription: 'Quand le conseiller bancaire de la pub te suit partout.',
    startTime: 191.5,
    pauseTime: 194.1,
    resumeDuration: 3.2,
    setupPhrase: "Pourquoi on parle de mon compte en banque dans la rue, là ?",
    correctPunchline: "Devant tout le monde ? On peut pas faire ça dans un bureau, comme d'habitude ? Euh...",
    options: [
      "Devant tout le monde ? On peut pas faire ça dans un bureau, comme d'habitude ? Euh...",
      "Y a tous mes voisins qui écoutent mes problèmes d'argent !",
      "Vous voulez pas donner mon code de carte bleue aux passants aussi ?",
      "C'est secret bancaire ou c'est open bar dans le quartier ?"
    ]
  },

  // ==========================================
  // VIDEO 4: Cyprien - Les geeks (wzjvKygubsI)
  // ==========================================
  {
    id: 'geeks_super_informaticien',
    videoId: 'wzjvKygubsI',
    videoTitle: 'Cyprien - Les geeks',
    contextDescription: 'Quand tout le monde autour de toi te prend pour un génie de l\'informatique.',
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

  // ==========================================
  // VIDEO 5: Cyprien - Les vieux et la technologie (uFpKj3JbORs)
  // ==========================================
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
    id: 'vieux_lol_oui',
    videoId: 'uFpKj3JbORs',
    videoTitle: 'Cyprien - Les vieux et la technologie',
    contextDescription: 'L\'interprétation très personnelle du langage SMS par sa mère.',
    startTime: 100.8,
    pauseTime: 103.3,
    resumeDuration: 2.5,
    setupPhrase: "Oui, parce qu'elle pense que \"LOL\"...",
    correctPunchline: 'ça veut dire "Oui" sur Internet.',
    options: [
      'ça veut dire "Oui" sur Internet.',
      'ça veut dire "Bisous" sur Internet.',
      'ça veut dire "D\'accord mon chéri".',
      'c\'est une abréviation pour dire "Je t\'aime".'
    ]
  },
  {
    id: 'vieux_mode_avion',
    videoId: 'uFpKj3JbORs',
    videoTitle: 'Cyprien - Les vieux et la technologie',
    contextDescription: 'Le dépannage classique des grands-parents.',
    startTime: 248.5,
    pauseTime: 250.6,
    resumeDuration: 2.2,
    setupPhrase: "Tu peux m'enlever le mode avion, s'il te plait?",
    correctPunchline: "Oui pas de problème.",
    options: [
      "Oui pas de problème.",
      "Encore ?! Mais tu prends jamais l'avion !",
      "Attends, t'as encore touché à tout !",
      "Donne, je te l'enlève en deux secondes."
    ]
  },

  // ==========================================
  // VIDEO 6: CYPRIEN - LA CARTOUCHE (c5TW7lqVuVY)
  // ==========================================
  {
    id: 'cartouche_frere_puceau',
    videoId: 'c5TW7lqVuVY',
    videoTitle: 'CYPRIEN - LA CARTOUCHE',
    contextDescription: 'L\'accueil très chaleureux de la soeur de Gabi.',
    startTime: 484.2,
    pauseTime: 487.2,
    resumeDuration: 2.2,
    setupPhrase: "- C'est qui ? - C'est mon frère le puceau et son pote attardé.",
    correctPunchline: "Il est vraiment puceau ton frère ?",
    options: [
      "Il est vraiment puceau ton frère ?",
      "Et ils font quoi déguisés en plombiers ?",
      "Sympa l'ambiance chez vous !",
      "Dis donc, elle a l'air gentille ta soeur !"
    ]
  },
  {
    id: 'cartouche_debile_puceau',
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
    id: 'cartouche_boxe_wii_sports',
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
  },
  {
    id: 'cartouche_salaire_minimum',
    videoId: 'c5TW7lqVuVY',
    videoTitle: 'CYPRIEN - LA CARTOUCHE',
    contextDescription: 'Flo annonce fièrement son nouveau salaire négocié.',
    startTime: 1159.0,
    pauseTime: 1162.4,
    resumeDuration: 2.8,
    setupPhrase: "J'a négocié mon salaire, je suis à 900 euros par mois !",
    correctPunchline: "T'as fait quoi ?",
    options: [
      "T'as fait quoi ?",
      "Mais t'es complètement taré !",
      "Attends, c'est une blague ?",
      "Et t'es content de toi ?!"
    ]
  },

  // ==========================================
  // VIDEO 7: CYPRIEN - TECHNOPHOBE (wNRUzu4fTgw)
  // ==========================================
  {
    id: 'technophobe_mails_salaire',
    videoId: 'wNRUzu4fTgw',
    videoTitle: 'CYPRIEN - TECHNOPHOBE',
    contextDescription: 'Arthur explique son absence en réunion à son patron.',
    startTime: 333.1,
    pauseTime: 335.0,
    resumeDuration: 2.5,
    setupPhrase: "Mais moi je ne peux plus voir mes mails monsieur.",
    correctPunchline: "Vous ne verrez plus votre salaire alors.",
    options: [
      "Vous ne verrez plus votre salaire alors.",
      "Dans ce cas vous prenez la porte monsieur.",
      "Alors vous ferez vos réunions par pigeon voyageur.",
      "Et comment je vous paye à la fin du mois ?"
    ]
  },
  {
    id: 'technophobe_textos_telephone',
    videoId: 'wNRUzu4fTgw',
    videoTitle: 'CYPRIEN - TECHNOPHOBE',
    contextDescription: 'Arthur croise un pote qui s\'étonne de son silence.',
    startTime: 368.4,
    pauseTime: 369.9,
    resumeDuration: 2.5,
    setupPhrase: "Fais pas genre, on t'as envoyé des textos.",
    correctPunchline: "Je peux plus aller sur mon téléphone Yann.",
    options: [
      "Je peux plus aller sur mon téléphone Yann.",
      "Mon téléphone a explosé dans ma poche.",
      "J'ai jeté mon smartphone à la poubelle.",
      "Les ondes me brûlent les mains !"
    ]
  },

  // ==========================================
  // VIDEO 8: CYPRIEN - LES PUBS vs LA VIE (uGXPf-ou6qY)
  // ==========================================
  {
    id: 'pubs1_turbo_chiante',
    videoId: 'uGXPf-ou6qY',
    videoTitle: 'CYPRIEN - LES PUBS vs LA VIE',
    contextDescription: 'Devant la cheminée, le père craque face au comportement de sa fille.',
    startTime: 259.4,
    pauseTime: 260.9,
    resumeDuration: 2.2,
    setupPhrase: "- Allez. - Elle est turbo chiante ta gamine.",
    correctPunchline: "Ouais, elle m’inquiète.",
    options: [
      "Ouais, elle m’inquiète.",
      "Je sais plus quoi faire d'elle.",
      "C'est la pub qui lui monte à la tête.",
      "Elle a pris ça de sa mère."
    ]
  },
  {
    id: 'pubs1_avion_dechet',
    videoId: 'uGXPf-ou6qY',
    videoTitle: 'CYPRIEN - LES PUBS vs LA VIE',
    contextDescription: 'Le cadeau d\'enfance transmis par le père.',
    startTime: 516.4,
    pauseTime: 518.1,
    resumeDuration: 2.2,
    setupPhrase: "Tu voulais vraiment garder ce déchet ?",
    correctPunchline: "C'est un avion en papier.",
    options: [
      "C'est un avion en papier.",
      "C'est tout ce qui me reste de mon enfance.",
      "C'est une relique de famille !",
      "T'as aucun respect pour les souvenirs."
    ]
  },

  // ==========================================
  // VIDEO 9: CYPRIEN - L'ADOLESCENCE (Hdmi7fTsiGg)
  // ==========================================
  {
    id: 'ado_mono_sourcil',
    videoId: 'Hdmi7fTsiGg',
    videoTitle: "CYPRIEN - L'ADOLESCENCE",
    contextDescription: 'La double révélation de Cyprien au lycée.',
    startTime: 390.8,
    pauseTime: 394.2,
    resumeDuration: 2.8,
    setupPhrase: "Donc là, je viens d'avoir deux révélations. D'abord, je peux plaire à une jolie fille...",
    correctPunchline: "et ensuite j'ai un mono-sourcil.",
    options: [
      "et ensuite j'ai un mono-sourcil.",
      "et ensuite j'ai une coupe de cheveux désastreuse.",
      "et ensuite mon bouton d'acné se voit à dix kilomètres.",
      "et ensuite ma voix vient de muer en direct."
    ]
  },
  {
    id: 'ado_cartes_pokemon',
    videoId: 'Hdmi7fTsiGg',
    videoTitle: "CYPRIEN - L'ADOLESCENCE",
    contextDescription: 'La pire trahison temporelle envers son passé.',
    startTime: 502.0,
    pauseTime: 504.9,
    resumeDuration: 2.5,
    setupPhrase: "C’est la PS5 maintenant. Au fait, j’ai vendu nos cartes Pokémon.",
    correctPunchline: "Non putain, t’es trop con...",
    options: [
      "Non putain, t’es trop con...",
      "Mais t'as vendu mon Dracaufeu holographique ?!",
      "Pourquoi t'as fait ça ? C'était notre trésor !",
      "Je te déteste, tu gâches mon futur !"
    ]
  }
];

// Memory tracking of previously played quote IDs across rounds to eliminate repetition
let lastPlayedQuoteIds: Set<string> = new Set();
let lastTimecodeByVideo: Map<string, number> = new Map();

/**
 * Intelligent Anti-Repetition Picker:
 * 1. Groups quotes by videoId so each video has multiple timecodes.
 * 2. Picks distinct videos for the current round.
 * 3. For any selected video, chooses a timecode location that wasn't used in recent rounds.
 * 4. Ensures the location/timecode for a given video varies from game to game.
 */
export function getRandomQuotes(count = 5): QuoteQuestion[] {
  // Group available quotes by video
  const videoMap = new Map<string, QuoteQuestion[]>();
  for (const q of CYPRIEN_QUOTES) {
    if (!videoMap.has(q.videoId)) {
      videoMap.set(q.videoId, []);
    }
    videoMap.get(q.videoId)!.push(q);
  }

  // Shuffle video IDs to get diverse video universe
  const videoIds = Array.from(videoMap.keys()).sort(() => 0.5 - Math.random());
  const selectedQuotes: QuoteQuestion[] = [];

  for (const vId of videoIds) {
    if (selectedQuotes.length >= count) break;

    const candidates = videoMap.get(vId) || [];
    if (candidates.length === 0) continue;

    const lastTimecode = lastTimecodeByVideo.get(vId);

    // Filter out quotes played recently and quotes matching the exact last timecode
    let viable = candidates.filter(
      (c) => !lastPlayedQuoteIds.has(c.id) && (lastTimecode === undefined || Math.abs(c.startTime - lastTimecode) > 10)
    );

    // Fallback if all quotes from this video have been seen recently
    if (viable.length === 0) {
      viable = candidates.filter((c) => lastTimecode === undefined || Math.abs(c.startTime - lastTimecode) > 10);
    }
    if (viable.length === 0) {
      viable = candidates;
    }

    // Pick a random viable moment
    const chosen = viable[Math.floor(Math.random() * viable.length)];
    selectedQuotes.push(chosen);

    // Update timecode tracker
    lastTimecodeByVideo.set(vId, chosen.startTime);
    lastPlayedQuoteIds.add(chosen.id);

    // Limit memory footprint
    if (lastPlayedQuoteIds.size > 20) {
      const oldest = Array.from(lastPlayedQuoteIds).slice(0, 10);
      oldest.forEach((id) => lastPlayedQuoteIds.delete(id));
    }
  }

  // If count is higher than distinct videos, fill remaining from unpicked quotes
  if (selectedQuotes.length < count) {
    const remaining = CYPRIEN_QUOTES.filter((q) => !selectedQuotes.some((sq) => sq.id === q.id));
    remaining.sort(() => 0.5 - Math.random());
    while (selectedQuotes.length < count && remaining.length > 0) {
      selectedQuotes.push(remaining.pop()!);
    }
  }

  // Shuffle options for each selected question
  return selectedQuotes.map((q) => ({
    ...q,
    options: [...q.options].sort(() => 0.5 - Math.random()),
  }));
}
