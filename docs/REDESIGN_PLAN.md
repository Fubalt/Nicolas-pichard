# Plan de refonte — Nicolas Pichard

> Statut : **v2, ajustée après ta relecture** (2026-11-12). Branche dédiée : `claude/practical-goodall-14au8o`. Aucun code applicatif n'est modifié tant que tu n'as pas validé l'étape correspondante.

## Règles de conduite du chantier

1. **Priorité absolue : qualité du design, expérience utilisateur et fiabilité des trois modes existants** (Blindtest Solo, Battle, Complète la réplique). Les nouveautés secondaires (défi du jour, statistiques, saisie libre, Marathon, QR code…) vont dans le *backlog* (§8) et ne seront abordées qu'après.
2. **Le site reste utilisable à chaque étape.** Chaque étape se termine sur une version jouable des trois modes. La nouvelle interface est d'abord construite à côté de l'ancienne, sur des routes de prévisualisation, et ne la remplace qu'après validation.
3. **Rien directement sur `main`. Aucun déploiement en production sans ton autorisation explicite.** Le travail se fait sur la branche dédiée. Les prévisualisations Vercel des branches ne sont utilisées que si tu le demandes.
4. **La direction artistique BOBINE est validée visuellement par toi** (maquette fonctionnelle + captures) avant d'être appliquée à toute l'application.
5. **Les contraintes officielles de l'API YouTube sont vérifiées et citées** avant de choisir la stratégie de lecture et d'affichage.
6. Dépendances minimales. Aucun changement de fournisseur ou d'infrastructure sans t'en exposer les conséquences et sans ton accord.

## Contexte

Le site (Next 16 / React 19 / Tailwind 4, sur Vercel) propose trois modes autour des vidéos de Cyprien. Il fonctionne en partie, mais il est fragile. `src/app/page.tsx` (664 lignes) mélange navigation, solo et battle. Il existe deux lecteurs YouTube dupliqués (`YouTubePlayer.tsx` 580 l., `QuotePlayer.tsx` 646 l.). Le multijoueur passe par le service public ntfy.sh sans aucune autorité. L'interface ressemble à un template sombre générique. Le contenu est à préserver intégralement : 205 vidéos (`data/cyprien-videos.json`) et 520 répliques sur 73 vidéos (`src/data/classic-quotes.json`).

---

## 1. Diagnostic priorisé

**[C]** = confirmé par lecture du code ou par un script. **[H]** = hypothèse à vérifier par un test.

### P0 — Fiabilité et équité des modes existants
1. **[C] Validation des réponses trop permissive** (`page.tsx:229-237`, `lib/utils.ts:matchesSearch`). La comparaison se fait par inclusion de sous-chaînes dans les deux sens. **70 paires de titres** donnent une fausse victoire (« Le Japon » pour « Le Japon 3 »…). La vidéo « Cyprien - X » se normalise en `x` et gagne pour tout titre contenant la lettre x.
2. **[C] Battle : l'hôte peut passer à la manche suivante avant que les autres aient fini** (`BattleRoundRecap.tsx:233`, bouton toujours actif).
3. **[C] Battle : chaque client calcule et annonce lui-même son score.** N'importe qui connaissant le code peut publier n'importe quelle action, sous n'importe quelle identité. **Aucun message n'est authentifié.**
4. **[C] Codes de salon devinables** (5 préfixes × 9 000) et **historique rejoué** (`since=all` relit environ 12 h de cache ntfy, anciennes parties comprises, dans un ordre non garanti).
5. **[C] Aucune présence ni reprise.** Si l'hôte part, la partie est morte. Les erreurs de publication sont silencieuses.
6. **[C] Bonus de vitesse injuste.** Le chrono inclut le chargement de l'iframe.
7. **[C] Erreurs YouTube sans issue.** Une vidéo non intégrable ou supprimée affiche un écran rouge définitif.

### P1 — Fragilités techniques
8. **[C] Deux lecteurs dupliqués**, avec des chronos différents (horloge murale contre `getCurrentTime`), un chargement d'API par chaînage de `onYouTubeIframeAPIReady` (risque de course) et **une iframe recréée à chaque manche**.
9. **[C] Le chrono solo mesure le temps réel, pas le temps vidéo.** Une mise en mémoire tampon fausse la durée entendue.
10. **[H] Le palier 0,1 s n'est probablement pas fiable** (latence du seek, du décodage et de l'audio).
11. **[H] iOS : `setTimeout(…, 50)` avant `playContinuation`** (`page.tsx:217,282`) casse la chaîne « geste utilisateur ». Le son risque de ne pas démarrer.
12. **[C] Catalogue « Classique » défini par des index** (`slice(106, 194)`), fragile si le JSON est réordonné.
13. **[C] Aucun test, aucune CI.** La logique métier est dans les composants. Les mélanges `sort(() => 0.5 - Math.random())` sont biaisés. L'anti-répétition est un état global au module.
14. **[C] `youtube-transcript` n'est utilisé nulle part.**
15. **[H] Limites de ntfy.sh** (taille des messages, quotas anonymes, débit). À mesurer, pas à supposer.

### P2 — Design, UX, mobile, accessibilité
16. **[C] Identité générique** : 32 dégradés, 10 animations `pulse`/`ping`, emojis dans les boutons, Geist par défaut.
17. **[C] Hiérarchie** : 56 occurrences de `text-[8–11px]`, une seule colonne même sur grand écran, onglets sans URL.
18. **[C] 0 attribut `aria-*`.** L'autocomplétion n'est pas un combobox ARIA, il n'y a ni région live, ni gestion du focus, ni `prefers-reduced-motion`.
19. **[H] Mobile** : clavier qui masque les suggestions, cibles tactiles < 44 px, vidéo qui sort de l'écran pendant la saisie.
20. **[C] États incomplets** : pas de squelette de chargement, pas d'état réseau ou de reconnexion en battle.

### Incohérences documentation ↔ code [C]
- README : salon « 5 lettres » ; en réalité `CYP-1234`.
- README : recadrage « 1.20x » ; en réalité `scale-[1.32]`.
- README : « SSE / Sockets » ; en réalité ntfy.sh public.
- README : branche `dev` ; elle n'existe pas dans le flux actuel.
- `quotes.ts` : « 71 vidéos » ; en réalité 73.
- `CLAUDE.md` présente « Complète la réplique » comme à venir alors qu'elle existe déjà en QCM.
- `layout.tsx` : métadonnées « 2 modes ».

---

## 2. Contraintes YouTube — vérification obligatoire avant toute décision de lecture

**État actuel : non vérifié.** Les sources officielles n'ont pas pu être consultées depuis cette session (`developers.google.com` est hors des domaines réseau autorisés). Rien ci-dessous n'est tenu pour acquis.

**Étape 1a (bloquante pour l'étape 2)** : lire et **citer mot pour mot**, avec URL et date de consultation, dans `docs/YOUTUBE_CONSTRAINTS.md` :
- YouTube API Services — Developer Policies (`developers.google.com/youtube/terms/developer-policies`) ;
- YouTube API Services Terms of Service ;
- IFrame Player API reference (`developers.google.com/youtube/iframe_api_reference`) ;
- Player parameters (`developers.google.com/youtube/player_parameters`) ;
- toute règle spécifique aux jeux, quiz ou extraits si elle existe.

**Questions à trancher avec ces sources** (pistes de mémoire, *à confirmer ou infirmer*, sans les tenir pour vraies) :

| Question | Pratique actuelle | Ce qu'il faut confirmer |
|---|---|---|
| Peut-on recadrer, agrandir, superposer ou masquer des éléments du lecteur (titre, logo) ? | Agrandissement ×1,32 et dégradé noir en bas | S'il existe une interdiction de masquer ou modifier le lecteur et ses éléments |
| Taille minimale de la zone du lecteur | Variable | S'il existe un minimum (on parle souvent de 200×200 px) |
| Lecteur caché ou audio seul | Écran d'attente opaque par-dessus le lecteur | Si couvrir entièrement le lecteur est permis |
| Extraits courts et lecture contrôlée par programme (`seekTo`, pause automatique) | Cœur du jeu | Les conditions d'usage de la lecture pilotée |
| Lecture automatique et son sur mobile | `playVideo()` après un `setTimeout` | Les exigences de geste utilisateur |
| Paramètres obsolètes (`modestbranding`, `showinfo`, `rel`) | `modestbranding: 1` | Leur comportement actuel |
| Codes d'erreur | Seul un message est affiché | Liste complète (2, 5, 100, 101, 150, …) et sens de chacun |

**Ensuite seulement**, je te soumets une stratégie d'affichage parmi les options conformes. Exemples possibles, à confirmer : lecteur visible à taille réglementaire avec masquage limité à ce que les règles permettent ; extrait sans masquage mais avec des segments choisis pour ne pas révéler le titre ; lecteur complet visible à la révélation. **Tu choisis** avant l'étape 2.

> Pour débloquer cette vérification, il faut soit autoriser `developers.google.com` dans les paramètres réseau de l'environnement, soit que tu me fournisses les textes. Je te le redemanderai au début de l'étape 1a.

---

## 3. Direction artistique — « BOBINE » (proposition à valider visuellement)

**Idée** : une salle de montage croisée avec la culture pop des sketchs YouTube FR. Le joueur est le monteur : rushs, timecodes, sous-titres. Le cadre est cinéphile et artisanal, sans clin d'œil appuyé.

### Palette (thème sombre « salle obscure », contrastes AA vérifiés)

| Rôle | Token | Valeur | Usage |
|---|---|---|---|
| Fond | `--ink` | `#0F0E13` | Fond principal, légèrement violacé |
| Surfaces | `--ink-2` / `--ink-3` | `#18161E` / `#232030` | Panneaux, champs |
| Papier | `--paper` | `#F2ECE1` | Cartes « ticket », résultats |
| Sous-titre | `--subtitle` | `#FFD84A` | Accent principal, actions, bonne réplique |
| REC | `--rec` | `#FF4A3D` | Live, battle, chrono, erreur |
| Validé | `--ok` | `#5BE49B` | Bonne réponse |
| Neutre | `--mute` | `#8D8799` | Texte secondaire (≥ 4,5:1) |

Règles : un seul accent dominant par écran, aucun dégradé décoratif. Le jaune sert à l'action, le rouge au temps et au danger.

### Typographie (via `next/font/google`, auto-hébergée, sans dépendance)
- **Archivo** (variable : graisse et largeur). *Extra-Condensed Black* pour les titres et les scores ; largeur normale pour l'interface.
- **Instrument Serif Italic** : uniquement pour les répliques citées.
- **JetBrains Mono** : timecodes, compteurs, codes de salon.
- Échelle 12 / 14 / 16 / 20 / 25 / 31 / 39 / 61 px, **plancher à 12 px**. Grille de 4 px. Rayons de 6 px (interface) et 2 px (moniteur).

### Éléments signature
1. **Moniteur** : cadre de régie, repères de coupe aux coins, timecode, pastille REC, « ARRÊT SUR IMAGE ». *Sa forme exacte dépend du §2* : aucun élément ne recouvrira le lecteur au-delà de ce que les règles permettent.
2. **Pellicule** : timeline à quatre segments logarithmiques avec perforations, tête de lecture et paliers verrouillés.
3. **Sous-titre** : en mode Répliques, l'amorce de la réplique s'affiche en sous-titre jaune et `▁▁▁` clignote à l'endroit de la coupure.
4. **Ticket** : écrans de résultat façon ticket de cinéma.
5. **Clap** : compte à rebours du battle.
6. Grain statique discret, désactivable.

### Mouvement
Des cuts secs avec un balayage de 160 ms (API View Transitions si disponible, sinon CSS). Micro-interactions sobres : pression de 1 px, segment qui se verrouille, score qui s'incrémente, secousse de 180 ms sur une erreur. Aucune pulsation permanente. `prefers-reduced-motion` respecté. Uniquement du CSS.

### Mises en page
- **Accueil** : trois « affiches » de mode, une action principale.
- **Ordinateur (≥ 1024 px)** : Moniteur et Pellicule à gauche (60 %), panneau de jeu à droite.
- **Mobile** : Moniteur collant en haut, panneau d'action à portée du pouce, champ maintenu au-dessus du clavier (`visualViewport`), suggestions sous le champ.

### États
Squelette puis mire « RÉGLAGE EN COURS » ; « Bobine abîmée — on change de film » ; bandeau de connexion connecté / reconnexion / hors ligne ; toasts annoncés via `aria-live`.

### Validation visuelle (étape 3)
Une **maquette fonctionnelle** isolée sur une route de prévisualisation (`/labo/bobine`, non indexée, sans lien depuis le site) :
- tokens, polices et primitives ;
- un écran de manche Blindtest complet et jouable sur le vrai lecteur ;
- l'écran de question Répliques ;
- un lobby et un récapitulatif Battle (données simulées) ;
- les états chargement, erreur et hors ligne.

**Captures fournies** : desktop 1440×900 et mobile 390×844 (et 360 px de large pour le cas extrême), état par état, prises avec Playwright à `deviceScaleFactor: 2`.

**Point d'arrêt** : tu valides, ou tu demandes des ajustements, avant que BOBINE ne soit appliquée au reste du site.

---

## 4. Les trois modes : fiabiliser et clarifier (prioritaire)

### 4.1 Blindtest Solo
- **Réponse = identifiant de vidéo.** Choix dans une liste filtrée, victoire par égalité d'`id`. Le texte libre n'est accepté que s'il désigne une seule vidéo. *(Corrige le P0 n°1.)*
- Le filtre d'époque est conservé, défini par des flags explicites et non plus par des index.
- **Lecture coupée sur le temps vidéo**, et `playVideo()` appelé de façon synchrone dans le geste utilisateur.
- Paliers 0,1 / 2,1 / 10,1 / 26,1 s conservés **si les mesures sont concluantes**. Sinon, je te propose une alternative documentée, sans l'imposer.
- Vidéo en erreur : remplacement automatique, consigné pour la maintenance du catalogue.
- Fin de partie : révélation selon la stratégie validée au §2, lien vers YouTube, partage emoji conservé.

### 4.2 Battle multijoueur — deux niveaux bien distincts

**Niveau 1 — Synchronisation coordonnée par l'hôte (ce qui est atteignable avec ntfy.sh).**
- L'hôte est le **coordinateur** : il calcule les scores à partir des réponses reçues, diffuse des snapshots numérotés (`seq`) et pilote les phases (lobby, compte à rebours, manche de 45 s maximum ou fin anticipée, récapitulatif de 8 s, podium).
- Les clients n'envoient que des intentions : rejoindre, réponse, prêt, quitter.
- Le chrono de chaque joueur démarre à sa première lecture effective.
- Détection d'absence et reprise par le joueur le plus ancien si l'hôte disparaît.
- Code de salon non devinable (6 caractères, environ 10⁹ combinaisons). Messages antérieurs à la création du salon ignorés. Messages compacts.
- **Ce que ce niveau ne garantit pas, et que l'interface ne prétendra pas garantir** :
  - Les messages **ne sont pas authentifiés**. Sur ntfy.sh public, toute personne qui connaît le code peut publier sur le même sujet en se faisant passer pour l'hôte ou pour un joueur. Le champ « émetteur » est déclaratif et donc falsifiable.
  - L'hôte calcule les scores, mais à partir de réponses déclarées par les clients (bonne vidéo, palier). Un client modifié peut mentir. Avec un client honnête, la cohérence est assurée ; la triche, elle, n'est pas empêchée.
  - Une signature côté client (clé générée par l'hôte) n'apporte pas de vraie sécurité : la clé circule dans le même canal que le code de salon. Je ne la présenterai pas comme telle.
  - **Usage visé : parties entre amis.** Ce niveau corrige tous les bugs de synchronisation (P0 n° 2, 4, 5, 6) mais pas la falsification (P0 n° 3).

**Niveau 2 — Autorité sécurisée (nécessite un serveur, donc ta décision).**
- Un serveur de salon (par exemple Cloudflare Durable Objects / PartyKit, Supabase Realtime, ou une route Vercel avec un stockage temps réel) détient l'état. Il **émet des jetons de session signés** à chaque joueur, vérifie l'identité de l'émetteur de chaque message, **connaît la bonne réponse sans l'envoyer aux clients avant la fin de la manche**, horodate lui-même et calcule les scores.
- Conséquences : un nouveau fournisseur ou service, un compte, des secrets, un déploiement et une surveillance supplémentaires, des plafonds de plan gratuit. Une partie du catalogue doit vivre côté serveur.
- **Ce niveau n'est pas lancé sans ton accord explicite**, après un comparatif chiffré.

**Architecture commune** : interface `RoomTransport` et protocole partagé. Le passage du niveau 1 au niveau 2 ne touche que le transport et la validation, pas l'interface du jeu.

### 4.3 Complète la réplique
- Le même moteur de lecture que le solo (suppression du doublon).
- Le QCM à 4 choix est conservé et rendu irréprochable sur mobile et au clavier. Combos et formats 5/10 conservés.
- La révélation joue la scène jusqu'au bout et affiche la réplique complète. On peut rejouer la scène.
- L'anti-répétition passe en `localStorage` versionné.
- Option sous-titres pour l'amorce, si elle est confirmée utile pendant la maquette. Les autres ajouts (saisie libre, indice, Marathon) sont dans le backlog.

---

## 5. Architecture cible

```
data/  videos.json · quotes.json (déplacé, contenu intact) · catalog-meta.json (flags classic, exclusions)
scripts/  fetch-videos.mjs (conservé, ne perd plus les flags) · validate-data.mjs
src/
  app/  page.tsx (accueil) · solo/ · repliques/ · battle/ · battle/[code]/ · labo/bobine/ (maquette, non indexée)
  features/
    player/     engine.ts (chargeur d'API unique, lecteur persistant via cueVideoById, coupure sur temps vidéo,
                états et erreurs) · usePlayer.ts · Monitor.tsx
    blindtest/  round.ts (reducer pur, partagé solo/battle) · scoring.ts · Pellicule.tsx · GuessPicker.tsx
    quotes/     session.ts (reducer pur) · QuoteStage.tsx
    battle/     protocol.ts (types + validation de forme) · hostMachine.ts · clientMachine.ts
                transport/{types.ts, ntfy.ts} · useRoom.ts
  ui/       Button, Card, Ticket, Sheet, Toast, Dialog, Kbd, ConnectionBadge
  lib/      rng.ts (mulberry32 + Fisher-Yates) · search.ts · storage.ts (localStorage versionné)
  styles/   tokens.css (@theme Tailwind 4) · grain.css
tests/      Vitest (logique) · Playwright (e2e avec faux window.YT)
```

Principes : des reducers purs testables ; un lecteur unique et persistant ; le geste utilisateur appelle `playVideo()` de façon synchrone ; des routes App Router. Avant chaque étape, lire `node_modules/next/dist/docs/` (Next 16, consigne d'`AGENTS.md`).

### Conserver / modifier / remplacer

| Élément | Décision |
|---|---|
| Données vidéos et répliques, `fetch-videos` | **Conserver** (fichier déplacé et validé, contenu intact) |
| Paliers, filtre d'époque, partage emoji, QCM, combos, formats 5/10, raccourcis | **Conserver** |
| Validation par sous-chaînes | **Remplacer** par l'égalité d'`id` |
| Deux lecteurs | **Remplacer** par `features/player` (stratégie d'affichage selon le §2) |
| `page.tsx` à onglets | **Remplacer** par des routes (l'ancienne page reste en place jusqu'à la bascule) |
| `useMultiplayerRoom` | **Remplacer** par le niveau 1 (ntfy conservé) ; niveau 2 sur décision |
| Composants visuels | **Remplacer** après validation de la maquette |
| canvas-confetti, youtube-transcript, Geist | **Retirer** |

Dépendances ajoutées : `vitest` et `@playwright/test` (dev uniquement). Aucune dépendance d'exécution.

---

## 6. Risques et contraintes

1. **Règles YouTube (§2)** : la stratégie d'affichage peut devoir changer le ressenti du jeu (masquage). Décision après lecture des textes officiels.
2. **Sécurité du Battle** : le niveau 1 n'empêche pas la triche. Il est présenté comme un mode « entre amis ». Le niveau 2 implique un nouveau fournisseur (§4.2).
3. **Lecture mobile** : son et autoplay sur iOS, publicités YouTube avant l'extrait (non contrôlables, à observer), vidéos retirées.
4. **Next 16 / React 19** : des API ont changé, documentation locale à lire.
5. **Continuité** : la nouvelle interface est construite à côté de l'ancienne. Bascule seulement après validation, avec retour arrière possible par simple revert.

---

## 7. Étapes (chacune vérifiable, avec un point d'arrêt)

| # | Étape | Contenu | Vérification | Arrêt |
|---|---|---|---|---|
| 0 | **Plan** | Ce document | Relu par toi | ✅ ton accord pour 1 |
| 1a | **Contraintes YouTube** | `docs/YOUTUBE_CONSTRAINTS.md` avec citations officielles + options d'affichage conformes | Chaque règle sourcée (URL + date) | ✅ ton choix de stratégie |
| 1b | **Fondations** (sans changement visuel) | Vitest, CI (lint, typecheck, test, build), `validate-data.mjs`, flags `classic`, `lib/rng`, **correction du matching par `id`**, extraction des reducers, retrait de `youtube-transcript` | Tests verts. Non-régression sur les 70 paires. Build OK. Site actuel inchangé visuellement | — |
| 2 | **Moteur de lecture** | `features/player` selon la stratégie validée, branché sur les modes **actuels** (Solo et Répliques) | e2e avec faux YT. Mesures réelles Chrome / Safari macOS / Safari iOS / Chrome Android | ✅ résultats des mesures (paliers) |
| 3 | **Maquette BOBINE** | `/labo/bobine` : tokens, polices, primitives, Moniteur, Pellicule, écrans clés des 3 modes, états | Captures desktop 1440 et mobile 390/360. Contraste AA | ✅ **ta validation visuelle** |
| 4 | **Solo refondu** | Nouvelle interface sur `/solo`, combobox ARIA, mobile, états | e2e : victoire, défaite, passer, rejouer, erreur vidéo. Lighthouse a11y ≥ 95 | — |
| 5 | **Répliques refondu** | Nouvelle interface sur `/repliques`, sur le moteur unique | e2e : bonne et mauvaise réponse, combo, fin de session | — |
| 6 | **Battle niveau 1** | Mesure des limites ntfy, protocole, machines hôte et client, phases à échéance, présence, reprise, interface | Tests du protocole. e2e à 3 navigateurs : départ de l'hôte, coupure réseau, joueur lent | ✅ décision sur le niveau 2 |
| 7 | **Bascule et finitions** | Accueil, l'ancienne `page.tsx` remplacée, accessibilité, `reduced-motion`, métadonnées, README et `CLAUDE.md` alignés | Checklist §9 cochée | ✅ **ton autorisation avant tout merge sur `main` / mise en production** |

---

## 8. Backlog (après stabilisation, sur ta demande)

Bobine du jour (graine par date) · statistiques locales · ticket de partage en image · saisie libre tolérante et indice en mode Répliques (souhait `CLAUDE.md`) · mode Marathon · QR code d'invitation · signalement « extrait mal calé » · image OG dynamique · Battle niveau 2.

---

## 9. Critères d'acceptation

- [ ] Choisir une autre vidéo que la bonne n'est **jamais** une victoire (test sur tout le catalogue).
- [ ] Aucune manche de battle ne se termine pour un joueur avant qu'il ait fini ou que les 45 s soient écoulées.
- [ ] Le départ de l'hôte ne casse pas la partie (reprise en moins de 20 s).
- [ ] La documentation et l'interface n'affirment aucune sécurité que le niveau de battle ne fournit pas.
- [ ] La stratégie de lecture et d'affichage est conforme aux règles YouTube citées dans `docs/YOUTUBE_CONSTRAINTS.md`.
- [ ] Durée d'extrait jouée à ±150 ms du palier (paliers ≥ 2 s) sur les 4 navigateurs cibles.
- [ ] Une vidéo non intégrable est remplacée automatiquement.
- [ ] Les trois modes sont jouables au clavier seul et sur un écran de 360 px, sans défilement horizontal.
- [ ] Aucun texte sous 12 px. Cibles tactiles ≥ 44 px. Contraste AA. `prefers-reduced-motion` respecté.
- [ ] 205 vidéos et 520 répliques intactes, validées par `validate-data.mjs`.
- [ ] CI verte (lint, typecheck, unitaires, e2e smoke, build).
- [ ] À chaque commit de la branche, le site se construit et les trois modes restent jouables.
- [ ] Aucun commit sur `main`, aucun déploiement en production sans ton accord.

---

## Prochaine action
Étape 1a (validée le 2026-11-12) : vérifier les contraintes officielles YouTube et documenter les options d'affichage conformes dans `docs/YOUTUBE_CONSTRAINTS.md`. Aucune autre étape sans accord explicite.
