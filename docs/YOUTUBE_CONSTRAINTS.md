# Contraintes officielles YouTube — Étape 1a

> Consultation : **2026-11-12**, pages officielles téléchargées depuis `developers.google.com` (versions anglaises, `?hl=en`).
> Les citations sont **mot pour mot**. Ce qui relève de mon interprétation est signalé par **[Interprétation]**. Ce qui n'a pas pu être vérifié par l'observation est signalé par **[À tester]**.
> Ce document ne constitue pas un avis juridique.

## Sources

| Réf. | Document | URL | « Last updated » |
|---|---|---|---|
| RMF | YouTube API Services — Required Minimum Functionality | https://developers.google.com/youtube/terms/required-minimum-functionality | 2026-11-06 |
| POL | YouTube API Services — Developer Policies | https://developers.google.com/youtube/terms/developer-policies | 2026-11-06 |
| TOS | YouTube API Services — Terms of Service | https://developers.google.com/youtube/terms/api-services-terms-of-service | 2026-11-06 |
| IFR | YouTube IFrame Player API reference | https://developers.google.com/youtube/iframe_api_reference | 2026-10-15 |
| PAR | YouTube Embedded Players and Player Parameters | https://developers.google.com/youtube/player_parameters | 2026-11-01 |
| BRD | YouTube Branding Guidelines | https://developers.google.com/youtube/terms/branding-guidelines | 2025-08-20 |

---

## 1. Règles applicables (citations)

### 1.1 Aucun élément visuel devant le lecteur, aucune modification du lecteur
- **RMF, « Overlays and frames »** : « You must not display overlays, frames, or other visual elements in front of any part of a YouTube embedded player, including player controls. Similarly, you must not use overlays, frames or other visual elements to obscure any part of an embedded player, including player controls. »
- **RMF, « YouTube Player attributes »** : « Attributes and parameters of the YouTube player, including the appearance of YouTube branding in the player, are specified in YouTube API documentation and specifications (https://developers.google.com/youtube). You must not make changes to the YouTube player that are not explicitly described by the API documentation. »
- **POL, III.I « Additional Prohibitions »** : « modify, build upon, or block any portion or functionality of a YouTube player; » et « modify, interfere with, replace, or otherwise disable any functionality, data, or content made available as part of, or in connection with, YouTube API Services. For example, you must not remove, obscure, alter, or disable any links that appear in YouTube players or in API Data. »
- **POL, III.F « YouTube Look and Feel »** : « your API Clients must not change or interfere with user interfaces in YouTube Applications unless you have obtained YouTube's prior written approval. You can request that approval at this form. »
- **POL, III.F « Branding »** : « You and your API Clients must not, and must not encourage, enable or require others to, directly or indirectly, interfere with or obscure any attribution provided by YouTube, including attribution provided via or shown in embedded YouTube players. »

### 1.2 Taille minimale
- **RMF / IFR / PAR** : « Embedded players must have a viewport that is at least 200px by 200px. If the player displays controls, it must be large enough to fully display the controls without shrinking the viewport below the minimum size. We recommend 16:9 players be at least 480 pixels wide and 270 pixels tall. »

### 1.3 Lecteur caché, audio et vidéo séparés
- **POL, III.I** : « separate, isolate, or modify the audio or video components of any YouTube audiovisual content […] »
- **POL, III.I** : « create, include, or promote features that play content, including audio or video components, from a background player, meaning a player that is not displayed in the page, tab, or screen that the user is viewing; »

### 1.4 Lecture automatique et lecture déclenchée par script
- **RMF, « Autoplay and scripted playbacks »** : « an API Client must not initiate an automatic playback until the player is visible and more than half of the player is visible on the page or screen. » et « A page or screen must not have more than one YouTube player that automatically plays content simultaneously. »
- **IFR, `onAutoplayBlocked`** : « This event fires any time the browser blocks autoplay or scripted video playback features, collectively referred to as "autoplay". This includes playback attempted with any of the following player APIs: […] playVideo function […] Instances where this policy may be triggered include unmuted playback without user interaction […] »

### 1.5 Publicités, liens, accès à la vidéo
- **POL, III.I** : « modify, interfere with, replace, or block advertisements placed or served by YouTube […] or YouTube players; »
- **POL, III.F « Playback Integrity »** : « API Clients must not otherwise gate access to a video by requiring a user to take an action other than clicking the play button to view or continue playing YouTube audiovisual content. »
- **POL, III.F** : « API Clients must not offer or provide incentives, rewards, or other compensation to users for engaging with YouTube Applications (directly or indirectly) by performing actions like viewing content, liking content, sharing content, subscribing to channels, adding comments. »

### 1.6 Identification du client
- **RMF, « API Client Identity and Credentials »** : « API Clients that use the YouTube embedded player (including the YouTube IFrame Player API) must provide identification through the HTTP Referer request header. […] YouTube recommends using strict-origin-when-cross-origin Referrer-Policy […] »
- **IFR, `onError`** : « 153 – The request does not include the HTTP Referer header or equivalent API Client identification. »

### 1.7 Attribution
- **BRD** : « any YouTube logo used in an application must link back to YouTube content or a YouTube component within the application. »
- **TOS 10.3** : « All API Clients must provide proper attribution in accordance with the YouTube Branding Guidelines and these Terms of Service (where applicable) when using the YouTube Brand Features. »

### 1.8 Sanction
- **TOS 3.1** : « YouTube may suspend or terminate your access to, or use of, any aspect of the YouTube API Services […] for any violation of the Agreement […] »

### 1.9 Faits techniques utiles (IFR / PAR)
- **Paramètres** : `controls=0` est documenté (« Player controls do not display in the player »). `modestbranding` est « deprecated and has no effect ». Avec `rel=0`, « related videos will come from the same channel as the video that was just played » : on ne peut plus les désactiver.
- **Précision du positionnement (`start`)** : « similar to the seekTo function, the player will look for the closest keyframe to the time you specify. This means that sometimes the play head may seek to just before the requested time, usually no more than around two seconds. »
- **Arrêt à un instant donné** : `cueVideoById` / `loadVideoById` acceptent `endSeconds` en syntaxe objet. « If you specify an endSeconds value and then call seekTo(), the endSeconds value will no longer be in effect. »
- **Codes d'erreur** :
  - 2 : paramètre invalide ;
  - 5 : erreur du lecteur HTML5 ;
  - 100 : vidéo introuvable ou privée ;
  - 101 et 150 : intégration refusée par le propriétaire ;
  - 153 : Referer absent.
- **Sécurité** : le paramètre `origin` « protects against malicious third-party JavaScript being injected into your page and hijacking control of your YouTube player. »

---

## 2. Conformité de l'implémentation actuelle

| Pratique actuelle (fichier) | Règle concernée | Constat |
|---|---|---|
| Lecteur agrandi `scale-[1.32] -translate-y-[2.8%]` pour pousser le titre, la chaîne et le filigrane hors du cadre (`YouTubePlayer.tsx:491-496`) | RMF « Player attributes », POL « obscure any attribution », POL « remove, obscure… links » | **Non conforme** |
| Écran d'attente opaque `absolute inset-0 z-20` posé sur le lecteur avant la première lecture (`YouTubePlayer.tsx:505-526`) | RMF « Overlays and frames » | **Non conforme** |
| Zone cliquable transparente par-dessus le lecteur figé et dégradé noir en bas « ensuring suggestions / subtitles never leak » (`YouTubePlayer.tsx:529-553`) | RMF « Overlays and frames », POL « obscure » | **Non conforme** |
| `pointer-events-none` sur le lecteur pendant la manche | POL « block any portion or functionality of a YouTube player » | **[Interprétation]** très probablement non conforme |
| Badge « Lecteur complet débloqué » superposé en fin de partie (`YouTubePlayer.tsx:557-564`) | RMF « Overlays and frames » | **Non conforme** (élément devant le lecteur, même petit) |
| Désactivation forcée des sous-titres via `unloadModule('captions')` et `setOption` (`YouTubePlayer.tsx:112-125`), non documentés dans l'IFR | RMF « must not make changes… not explicitly described » | **[Interprétation]** probablement non conforme. `cc_load_policy` (paramètre documenté) reste utilisable |
| `QuotePlayer.tsx` : mêmes types de surcouches (à confirmer ligne par ligne à l'étape 2) | RMF « Overlays and frames » | **[À vérifier]** même famille de problèmes |
| Lecture lancée par un geste utilisateur, `controls=0`, `playsinline=1`, `origin` | IFR / PAR | Conforme (paramètres documentés) |
| `playVideo()` différé par `setTimeout` après « Passer » (`page.tsx:217,282`) | IFR `onAutoplayBlocked` | Conforme sur le principe, mais risque de blocage. L'événement n'est pas écouté |
| Pas d'attribution YouTube hors du lecteur | BRD / TOS 10.3 | **[Interprétation]** l'attribution intégrée au lecteur suffit *si on ne la masque pas*. Aujourd'hui, elle est justement masquée |
| Points de jeu attribués après le visionnage d'extraits | POL « incentives… for viewing content » | **[Interprétation]** les points récompensent une connaissance, pas un visionnage ni une interaction avec YouTube. Le risque me paraît faible, mais il n'est pas nul |

**Conclusion** : le mécanisme anti-triche actuel (recadrage et surcouches) **contredit directement** plusieurs règles explicites. Le maintenir expose à une suspension de l'accès (TOS 3.1). Les options ci-dessous sont celles qui respectent les textes cités.

---

## 3. Ce que je n'ai pas pu observer [À tester]

Un test automatisé (Chromium headless depuis le conteneur cloud) a reçu `onError 150` / « Video unavailable » pour une vidéo du catalogue. C'est probablement un refus lié à l'environnement (adresse IP de datacenter, navigateur automatisé), pas un vrai refus d'intégration : le site fonctionne en production. **Le comportement visuel du lecteur n'a donc pas pu être observé.** Questions à vérifier sur de vrais navigateurs (ordinateur et mobile) avant de choisir :

1. Avec `controls=0`, le lecteur affiche-t-il le **titre et la chaîne** : au chargement (état « cued ») ? pendant la lecture ? en pause ? à la fin ?
2. En pause, affiche-t-il un panneau « Plus de vidéos » ou des suggestions ?
3. Une **publicité** précède-t-elle parfois l'extrait ? À quelle fréquence ?
4. Écart réel entre le timecode demandé et le timecode joué (positionnement sur l'image clé, « jusqu'à environ 2 s » selon PAR).
5. Latence entre `playVideo()` et l'état PLAYING (impact sur le palier de 0,1 s).
6. Déclenchement d'`onAutoplayBlocked` sur iOS après un `setTimeout`.

---

## 4. Options d'implémentation conformes

Socle commun à toutes les options :
- lecteur toujours **visible**, au moins 480×270 (au minimum 200×200), **rien par-dessus** ;
- aucun recadrage, aucune transformation CSS, aucun `pointer-events-none` ;
- nos commandes (Lecture, Passer…) placées **autour** du lecteur ;
- paramètres documentés uniquement (`controls=0`, `cc_load_policy=0`, `playsinline=1`, `origin`, `rel=0`) ;
- `endSeconds` pour couper les extraits, écoute d'`onAutoplayBlocked`, gestion de toutes les erreurs (dont 153), politique Referer par défaut conservée.

Le cadre « Moniteur » de BOBINE devient un **passe-partout autour** du lecteur, jamais une surcouche.

### Option A — Lecteur visible en permanence, règles inchangées
- **Principe** : on retire toutes les surcouches. Le lecteur reste affiché et figé entre les essais, comme aujourd'hui mais sans masquage.
- **Avantages** :
  - conforme ;
  - le plus simple et le plus robuste (un seul lecteur persistant) ;
  - garde l'indice « arrêt sur image » ;
  - aucun changement pour le mode Répliques, dont le titre de la vidéo est de toute façon affiché.
- **Inconvénients** : tout ce que YouTube affiche (§3, questions 1-2) est visible du joueur. Si le titre apparaît en pause ou au chargement, **le Blindtest et le Battle deviennent triviaux**.
- **Conséquence pour le jeu** : viable seulement si le test du §3 montre que le titre n'apparaît pas, ou très brièvement.

### Option B — Lecteur visible uniquement pendant l'extrait (« monté pour jouer, démonté entre les essais »)
- **Principe** : le lecteur n'existe dans la page que pendant la lecture d'un extrait. Entre les essais, il est **retiré du DOM** (pas caché, pas couvert). À sa place, notre propre interface : Pellicule, timecode, « Rejouer ». Il réapparaît, toujours visible et sans rien par-dessus, à chaque lecture et à la révélation finale.
- **Avantages** :
  - conforme dans sa lettre : aucune surcouche, aucune lecture depuis un lecteur non affiché ;
  - supprime les fuites liées à la pause (question 2) ;
  - garde une identité visuelle forte entre les essais.
- **Inconvénients** :
  - perte de l'indice « arrêt sur image » (on ne peut pas capturer l'image d'une iframe d'un autre domaine) ;
  - rechargement du lecteur à chaque essai, d'où une latence qui pénalise surtout le palier de 0,1 s (question 5) ;
  - le titre peut encore apparaître au chargement (question 1).
- **Conséquence pour le jeu** : le Blindtest repose davantage sur l'**écoute et le mouvement**. Le premier palier sera probablement à revoir (par exemple 0,5 s) selon les mesures.
- **[Interprétation]** La variante « lecteur gardé dans le DOM mais en `display:none` pendant la pause » n'est pas couverte explicitement par les textes. Je ne la recommande pas sans confirmation.

### Option C — Demander l'autorisation écrite de YouTube
- **Principe** : POL III.F prévoit une « prior written approval » pour modifier l'interface (« You can request that approval at this form »). On garde l'option A ou B en attendant la réponse.
- **Avantages** : seule voie qui pourrait permettre de retrouver un masquage du lecteur.
- **Inconvénients** : délai et issue incertains. Rien n'indique que l'autorisation couvrirait aussi la règle RMF sur les overlays. Le formulaire peut demander des informations sur le projet et son responsable : **c'est à toi de faire la démarche si tu le souhaites**.
- **Conséquence pour le jeu** : aucune à court terme.

### Option exclue — Statu quo (recadrage + surcouches)
Non conforme aux règles citées en §1.1 (voir §2). Risque : suspension de l'accès (TOS 3.1). Présentée seulement pour mémoire.

---

## 5. Recommandation

1. **Mode Répliques : option A** dès l'étape 2. Le titre y est déjà affiché, donc le jeu ne change pas, et la mise en conformité est immédiate.
2. **Blindtest et Battle** : trancher entre **A et B après un test réel** des questions du §3. Je propose une **page de test autonome** (un fichier HTML hors de l'application, sans impact sur le site) que tu ouvres sur ton ordinateur et ton téléphone, ou que je fais tourner en local si tu préfères. Elle affiche les états du lecteur avec `controls=0` et mesure les latences.
   - Si le titre n'apparaît pas en pause : **A** (plus simple, garde l'arrêt sur image).
   - Sinon : **B**.
3. L'option C est indépendante : à toi de voir si tu veux la tenter en parallèle.

Rien de ceci n'est implémenté tant que tu n'as pas choisi.

---

## 6. Résultats des essais réels (2026-11-12)

Les essais ont été faits avec la sonde `public/labo/youtube-probe.html` (prévisualisation Vercel de la branche), sur la vidéo « Cyprien - Les geeks » (`wzjvKygubsI`), départ demandé à 106,600 s, son activé. Sources : deux rapports Chrome 157 sur Mac (un essai piloté, un essai manuel), un rapport Safari 27 sur Mac, un rapport Safari iOS 18.7 sur iPhone (lecteur de 328 × 200 px).

### 6.1 Visibilité du titre (réponse §3, questions 1-2)

| État | `controls=0` | `controls=1` |
|---|---|---|
| Avant toute lecture | Titre, chaîne et miniature visibles (la miniature affiche « LES GEEKS ») | Idem |
| Pendant un extrait court | Titre visible (rapport manuel). Il disparaît après quelques secondes de lecture continue sans survol (rapport piloté) | Idem, avec la barre de progression au survol |
| Pause automatique après une coupure | Titre visible sans survol | Idem |
| État « terminé » (`endSeconds`) | Titre, miniature, bouton de relecture, « Plus de vidéos » | Idem |

**Conclusion :** avec un lecteur conforme, le titre est visible au chargement, pendant les extraits courts, en pause et à la fin. **L'option A est exclue pour le Blindtest et le Battle. L'option B ne protège pas les premiers paliers.** L'option A reste valable pour le mode Répliques.

### 6.2 Précision et latence

| Mesure | Résultat |
|---|---|
| Coupure sur le temps vidéo (`getCurrentTime` à chaque trame puis `pauseVideo`) | Fin à +1 à +21 ms de la borne (Chrome, Safari Mac, iPhone) |
| Coupure sur l'horloge (méthode actuelle du site) | Environ +30 ms ; dérive de +200 ms si l'événement « lecture » arrive tard |
| `endSeconds` | +1 à +5 ms, mais le lecteur passe à l'état « terminé » (titre et suggestions affichés). **La borne survit au `seekTo()` suivant**, ce qui fausse les lectures suivantes jusqu'au rechargement. Reproduit trois fois, en contradiction avec la documentation (IFR) |
| Latence clic → « lecture », lecteur réutilisé | 275 à 300 ms |
| Latence clic → « lecture », lecteur recréé | 337 à 654 ms sur Mac, jusqu'à 1 057 ms au premier essai sur iPhone |
| Retard de l'événement « lecture », lecteur réutilisé | La vidéo a déjà avancé d'environ 190 ms quand l'événement arrive : un « extrait de 0,1 s » joue en réalité environ 0,19 s |
| Publicités | Aucune observée |

### 6.3 Son
- Chrome Mac : son présent au premier clic, après « Passer » immédiat et après « Passer » différé de 50 ms.
- iPhone : son présent lors des essais de réplique. La comparaison immédiat / différé depuis une pause normale reste à faire avec la sonde v2.
- L'échec de « Passer immédiat » (relecture depuis le début) observé sur Chrome Mac est probablement dû à un lecteur resté à l'état « terminé ». Le scénario D de la sonde v2 sert à le vérifier.

### 6.4 Coupure des répliques — calibrage en cours

| Navigateur | Pause demandée | Pause effective | Écart avec 111,900 s | Ressenti |
|---|---|---|---|---|
| Chrome Mac | 111,904 | 111,909 | +9 ms | Coupure correcte |
| Safari Mac | 111,907 | 111,910 | +10 ms | Non renseigné |
| Safari iPhone (2 essais) | 111,905 / 111,913 | 111,912 / 111,921 | +12 / +21 ms | « Tu » de « Tu sais voler ! » entendu brièvement |

- La pause n'est pas en retard sur iPhone : 3 à 12 ms de plus que sur Mac seulement.
- **Hypothèse principale** : la borne de cette réplique est trop juste.
- **Hypothèse alternative, non exclue** : un décalage entre la position rapportée et le son entendu sur iOS.
- À trancher par les essais d'écoute de la sonde v2 (décalage par pas de 25 ms).
- Le jeu actuel coupe à la borne + 0,12 s (`QuotePlayer.tsx:181`), donc probablement après le début de la chute.
- **Aucune borne n'est modifiée dans les données tant que le calibrage n'est pas validé.**

### 6.5 Premier résultat d'écoute (2026-11-13) — une seule réplique

Réplique « Les geeks » (`geeks_super_pouvoirs_voler`, borne des données 111,900 s), sortie audio non précisée :

| Appareil | Décalage où le « Tu » n'est plus entendu | Fin de « Oui… » à ce décalage |
|---|---|---|
| Mac | 0 ms | Entière |
| iPhone (Safari iOS 18.7) | −250 ms | Entière |

- Les positions de pause rapportées par YouTube sont les mêmes sur les deux appareils (+9 à +23 ms après la borne). L'écart d'environ 250 ms vient donc de ce qui est entendu sur iOS, pas de la position de pause.
- **Un seul résultat, sur une seule réplique.** Il ne suffit pas à fixer une marge.
- À vérifier :
  - l'iPhone sur le haut-parleur, à 0 et à −250 ms ;
  - le Mac à −250 ms (« Oui… » reste-t-il entier ?) ;
  - quelques autres répliques sur iPhone.
- **Aucune borne n'est modifiée dans les données.** Il reste à **vérifier si une anticipation par plateforme est nécessaire**.

### 6.6 Relance depuis l'état « terminé » (scénario D) — confirmé sur les trois navigateurs

| Relance depuis « terminé » (après `endSeconds`) | Chrome Mac | Safari Mac | Safari iPhone |
|---|---|---|---|
| `playVideo()` seul | Redémarre à 0 s (2/2) | Redémarre à 0 s (3/3) | Redémarre à 0 s (1/1) |
| Repositionner puis `playVideo()` | Repart au début demandé, puis s'arrête de nouveau à l'ancienne borne `endSeconds` (1/1) | Non testé | Idem (2/2) |

- Quand on relance un chargement alors que le lecteur est déjà « terminé », YouTube émet aussi un état « terminé » transitoire à 0 s, avant que la lecture ne démarre. La sonde le conserve dans le journal, mais ne le valide pas comme fin attendue. Elle exige que la lecture ait démarré et que la position soit proche de la borne visée.
- **Conséquence pour le moteur :** aucun `endSeconds`. Un lecteur arrivé à « terminé » doit être **rechargé** : une simple relance ne suffit pas.
