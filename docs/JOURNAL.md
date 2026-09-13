---
title: Journal du projet
status: actif
last-reviewed: 2026-09-13
sources: []
tags: [journal]
---

# Journal — AlcooCalc

## 2026-09-13 (suite 5)
- Fait : dans la formule détaillée (LaTeX), renommage de la variable `V_f` en `V_1` (formule
  principale et les 4 étapes substituées) pour rester cohérent avec le renommage UI décidé plus tôt
  ("Volume final" → "Volume cible (V₁)") — la variable calculée `V_f` correspond au même concept que
  le paramètre `V₁` déjà affiché ailleurs dans l'app. Les noms internes JS (`Vf`, `results.Vf`) ne
  sont pas touchés, seul l'affichage KaTeX change. Simplification demandée dans la foulée :
  `S_{conc}` devient simplement `S` dans la formule, cohérent avec le libellé "Sucre visé (S)".
  Cache PWA bumpé à `alcoocalc-v25`.
- Testé dans le navigateur (cache et service worker vidés) : la formule principale et les étapes du
  calcul affichent bien `V_1 = (V_0 · C_0) / C_1`, `m_s = S · V_1`, etc.

## 2026-09-13 (suite 4)
- Fait : correction de deux régressions de traduction signalées par l'utilisateur. (1) Le message
  "Copié !" après "Copy results" en anglais : le code était déjà correct (`copiedMsg` traduit dans
  les deux langues dans `js/translations.js`) — non reproductible en local, probablement un
  service worker resté sur un ancien cache côté utilisateur. (2) La variable `ΔV_sucre` dans la
  formule détaillée et ses étapes de calcul restait en français même en mode anglais : le LaTeX
  était codé en dur dans `js/formulas.js` sans dépendre de la langue. `generateFormulaSteps()` et
  `renderFormula()` acceptent désormais un paramètre `lang` et choisissent `\Delta V_{sucre}` ou
  `\Delta V_{sugar}` en conséquence ; `js/app.js` transmet `getLanguage()` à l'appel de
  `renderFormula()`. Cache PWA bumpé à `alcoocalc-v24` (aide aussi à rafraîchir le cache côté
  utilisateur pour le point (1)).
- Testé dans le navigateur (FR et EN, cache et service worker vidés) : la formule détaillée affiche
  bien `ΔV_sucre` en français et `ΔV_sugar` en anglais, dans la formule principale et les 3 étapes
  qui la référencent.

## 2026-09-13 (suite 3)
- Fait : implémentation de l'**historique cliquable** (deuxième piste v2 mise en œuvre). Chaque
  ligne de `#historyList` est désormais scindée en deux boutons : `.history-row__main` (recharge
  tous les paramètres de l'entrée — V₀, V₁ si l'entrée avait un volume cible actif, C₀, C₁, sucre
  visé, k — via `applyInputsToForm()` puis `compute({recordHistory:false})`, sans dupliquer
  l'entrée dans l'historique) et `.history-row__delete` (bouton "×", supprime uniquement cette
  entrée via `deleteHistoryEntry(index)`, `event.stopPropagation()` pour ne pas déclencher le
  rechargement). `pushHistory()` enregistre désormais aussi `vfTarget` (null si absent) pour que le
  rechargement restaure fidèlement l'état d'origine ; le champ `k` reste stocké en L/g dans
  l'historique (comme avant), donc reconverti ×1000 vers mL/g au rechargement pour l'affichage.
  i18n FR/EN ajoutée (`historyReloadLabel`, `historyDeleteLabel`, en `aria-label` sur les deux
  boutons). Cache PWA bumpé à `alcoocalc-v19`.
- Testé dans le navigateur (FR et EN) : clic sur une entrée recharge exactement les bons résultats
  sans dupliquer l'historique ; clic sur "×" supprime uniquement l'entrée visée, le reste de la
  liste se met à jour correctement ; "Effacer l'historique" continue de tout vider.
- Fait : retrait de la bordure `border-left` (ligne verticale) sur `.history-row__delete`, signalée
  inesthétique par l'utilisateur (capture d'écran). Cache PWA bumpé à `alcoocalc-v20`.
- Fait : arrondi systématique à 2 décimales de tous les résultats affichés en litres (au lieu de 3,
  et d'un cas non arrondi du tout). Corrige un bug signalé par l'utilisateur (capture d'écran) où
  une ligne d'historique affichait `0.71076923076923...L` — `entry.v0` y était interpolé sans
  `toFixed`. Modifié : `formatLiters()`, `resultFinalVolume`, `stickyWaterValue`,
  `history-row__spec` (V₀), `history-row__result` (eau), et le template `copyResults()` — tous en
  `toFixed(2)`. Le champ V₀ recalculé (affiché dans le champ de saisie lui-même quand "Volume
  cible" est actif) garde `toFixed(3)`, car c'est une valeur d'entrée réinjectée dans le calcul,
  pas un résultat affiché. Les étapes de formule détaillée (`js/formulas.js`) ne sont pas touchées
  (contexte volontairement plus précis). Cache PWA bumpé à `alcoocalc-v21`.
- Fait : ascenseur de `.history-list` (visible dès 4 entrées) restylé aux couleurs du thème
  terminal, à la demande de l'utilisateur (capture d'écran de l'ascenseur gris par défaut) : piste
  sombre (`--bg-primary`), poignée verte fine, flèches haut/bas en triangle vert (`clip-path`) sur
  fond sombre. Implémenté via les pseudo-éléments `::-webkit-scrollbar-*` (Chromium/WebKit) avec un
  repli `scrollbar-width: thin; scrollbar-color: ...` pour Firefox (pas de contrôle des flèches
  sur ce moteur). Cache PWA bumpé à `alcoocalc-v22`.
- Fait : ajout de **favoris sur l'historique**, à la demande de l'utilisateur (fonctionnalité non
  prévue dans la roadmap v2 initiale). Chaque entrée de `#historyList` reçoit un troisième bouton
  `.history-row__favorite` (entre "recharger" et "supprimer") : étoile vide `☆` par défaut, pleine
  `★` verte au clic (`toggleFavorite(index)`, avec `event.stopPropagation()` pour ne pas déclencher
  le rechargement). Le champ `favorite` (bool) est ajouté à chaque entrée dans `pushHistory()` et
  persiste dans `localStorage` comme le reste de l'historique. Une étoile identique dans l'en-tête
  (`#btnFavoriteFilter`) bascule un filtre en mémoire (`favoritesFilterActive`, non persisté) qui
  restreint `renderHistory()` aux entrées favorites ; l'indexation utilisée pour supprimer/basculer
  une entrée est calculée sur le tableau *non filtré* (`allHistory.map((entry, index) => ...)`)
  pour rester correcte même quand la liste affichée est un sous-ensemble. Message dédié
  "Aucun favori pour le moment." quand le filtre est actif et vide. i18n FR/EN ajoutée
  (`historyFavoriteLabel`, `historyUnfavoriteLabel`, `historyFilterFavoritesLabel`,
  `historyShowAllLabel`, `historyNoFavorites`). Cache PWA bumpé à `alcoocalc-v23`.
- Testé dans le navigateur (FR et EN) : clic sur une étoile de ligne bascule vide/pleine sans
  déclencher le rechargement ; clic sur l'étoile d'en-tête filtre correctement et se traduit par un
  halo sur l'étoile active ; favori conservé après rechargement complet de la page (persistance
  `localStorage` confirmée) ; le filtre repart désactivé par défaut à chaque chargement (non
  persisté, comportement voulu).

## 2026-09-13 (suite)
- Fait : renommage esthétique de deux libellés, à la demande de l'utilisateur (capture d'écran du
  champ "Volume final"). Clarifié via question : la nouvelle variable du champ volume est bien
  **V1** (et non C1, qui désignerait une concentration) pour rester cohérente avec V₀ déjà utilisé.
  - Champ "Volume final" (celui qui remplace V₀) renommé en **"Volume cible (V1)"** — ça lève au
    passage une ambiguïté qui existait avec la ligne de résultat "Volume final" (Vf, le résultat
    calculé), désormais clairement distincte du volume *souhaité* en entrée.
  - Libellé "Alcool cible (C_f)" renommé en **"Alcool cible (C1)"**, et la notation LaTeX
    correspondante dans la formule détaillée (`js/formulas.js`) mise à jour de `C_f` à `C_1` pour
    rester cohérente avec le nouveau libellé (les variables JS internes `Cf`/`cf` ne changent pas,
    seul l'affichage change). i18n FR/EN mise à jour. Cache PWA bumpé à `alcoocalc-v17`.
- Testé dans le navigateur : nouveaux libellés affichés, formule détaillée affiche bien C₁.
- Fait : le "1" de V1/C1 mis en indice (caractère unicode `₁`, comme `₀` pour V₀/C₀ déjà en place)
  à la demande de l'utilisateur, pour un style cohérent — **"Volume cible (V₁)"** et
  **"Alcool cible (C₁)"**. La notation LaTeX de la formule détaillée (`C_1`) n'a pas besoin de
  changement, elle affichait déjà l'indice via KaTeX. Cache PWA bumpé à `alcoocalc-v18`.

## 2026-09-13
- Fait : création de la branche `v2` (poussée sur origin) pour développer les pistes UX v2 sans
  affecter `main`, qui est déployé automatiquement en production via GitHub Pages. Tout le travail
  v2 se fait désormais sur cette branche jusqu'à merge explicite.
- Fait : changement de la couleur verte principale du thème terminal, jugée trop vive/fatigante à
  l'usage (`--terminal-green` passe de `#00FF41` à `#00993D`, un vert phosphore plus sombre et plus
  posé). Choix fait par l'utilisateur après comparaison de 4 nuances sur une palette visuelle
  (artifact) : original, `#00CC52`, `#00993D` (retenu), `#1FAD58`.
- Implémentation : variable CSS `--terminal-green` mise à jour ; toutes les valeurs `rgba(0, 255,
  65, …)` codées en dur (halos/ombres) remplacées par le RGB équivalent (`0, 153, 61`) dans
  `css/styles.css` ; couleur de la traînée de pluie Matrix dans `js/splash.js` alignée sur la même
  teinte ; `theme_color` de `manifest.json` mis à jour pour cohérence PWA. `--terminal-dim` non
  modifié. Cache PWA bumpé à `alcoocalc-v12`.
- Testé dans le navigateur : nouvelle teinte bien appliquée (titres, bordures, sliders, halos,
  résultats), lisibilité conservée.
- Retour utilisateur après vérification en navigateur : `#00993D` manque de contraste. Changement
  pour la proposition 1 : `--terminal-green` passe à **`#00CC52`** (rgb 0, 204, 82). Même
  traitement appliqué (halos CSS, traînée du splash, `theme_color` du manifest). Cache PWA bumpé à
  `alcoocalc-v13`.
- Fait : implémentation du **résumé collant sur mobile** (première piste v2 mise en œuvre). Un
  bandeau `<button>` fixe (`#stickySummary`) apparaît en bas d'écran uniquement sous 768px de
  large (masqué en paysage sur petite hauteur, comme `.app-main` en grille 2 colonnes), affichant
  en continu l'eau et le sucre à ajouter. `renderResults()` (`js/app.js`) le met à jour en même
  temps que le panneau complet ; un clic dessus fait défiler la page jusqu'à `#resultsTitle`
  (`scrollIntoView`, `behavior: 'auto'` si `prefers-reduced-motion`). Le bandeau est
  `aria-hidden="true"` + `tabindex="-1"` : il duplique visuellement les résultats déjà présents et
  accessibles plus bas, donc exclu de l'arbre d'accessibilité pour éviter une double annonce (le
  traitement accessibilité complet — aria-live, etc. — reste une piste v2 séparée). i18n FR/EN
  ajoutée (`stickyWater`/`stickySugar`). Cache PWA bumpé à `alcoocalc-v14`.
- Testé dans le navigateur en émulation mobile (375×812) : bandeau visible et à jour pendant les
  réglages, clic → scroll fluide vers les résultats complets ; absent en desktop (≥1024px).
- Fait : correction signalée par l'utilisateur (capture d'écran) — la bordure supérieure du bandeau
  collant traversait tout l'écran alors que les widgets ont une marge de 1rem de chaque côté.
  `.sticky-summary` passe de `left:0; right:0; width:100%` à `left:1rem; right:1rem;` (padding
  horizontal retiré en compensation) pour que la ligne de séparation fasse la même largeur que les
  cartes. Cache PWA bumpé à `alcoocalc-v15`.
- Fait : l'ajustement précédent n'a pas suffi — l'utilisateur a mesuré (via capture zoomée) un
  écart de 10px de chaque côté entre le bandeau et les cartes, reproductible uniquement dans le
  navigateur intégré de Claude Code (pas ailleurs). Cause : `position: fixed` calcule sa largeur
  par rapport au viewport tel que le moteur de rendu le définit, ce qui peut diverger légèrement du
  calcul utilisé pour les éléments en flux normal selon l'environnement de rendu. Plutôt que
  d'ajuster à nouveau des marges à la main, changement d'architecture : `#stickySummary` déplacé à
  l'intérieur de `<main class="app-main">` (dernier enfant, après `.card--history`) et passé en
  `position: sticky; bottom: 0;` au lieu de `fixed`. En tant qu'enfant du même conteneur flex que
  les cartes (`align-items: stretch` par défaut), il hérite mathématiquement de la même largeur —
  vérifié au pixel près (`getBoundingClientRect()` identique des deux côtés) là où le bug se
  produisait. Effet secondaire positif : le bandeau se fond naturellement à sa place juste avant le
  footer une fois arrivé en bas de page, donc le `padding-bottom` de secours sur `body` n'est plus
  nécessaire (retiré). Cache PWA bumpé à `alcoocalc-v16`.

## 2026-09-10
- Fait : transfert complet du dépôt GitHub du compte `RobJBee` vers le nouveau compte
  `gLOrFinDeV` (transfert d'ownership natif GitHub, effectué par l'utilisateur via Settings →
  Danger Zone → Transfer ownership). Historique et commits conservés.
- Fait : remote git local mis à jour (`origin` pointe maintenant vers
  `https://github.com/gLOrFinDeV/AlcooCalc.git`), connectivité vérifiée (`git fetch`). GitHub
  Pages vérifié fonctionnel sous la nouvelle URL **https://glorfindev.github.io/AlcooCalc/**.
- Fait : mise à jour des mentions de l'ancienne URL dans `docs/ROADMAP.md` et
  `docs/decisions/0003-deploiement-github-pages.md`. Les entrées de journal antérieures au
  transfert ne sont pas réécrites (journal append-only) ; elles mentionnent encore `RobJBee` par
  fidélité historique.
- Contexte : en amont, l'utilisateur a cherché à connecter son smartphone à cette session Claude
  Code via Remote Control et a rencontré l'erreur "Remote control session is offline" ; clarifié
  que Remote Control projette la session tournant sur le PC (qui doit rester allumé/connecté) et
  n'est pas une session cloud indépendante — aucune action de code liée à ce point.

## 2026-09-07 (suite 2)
- Fait : uniformisation du champ "Volume final" (ex-"Volume cible") avec les autres paramètres, à
  la demande de l'utilisateur : ajout d'un slider synchronisé (comme V₀/C₀/C_f/S), champ nombre
  réduit et aligné à droite (retour au layout `field__controls` standard au lieu d'un champ pleine
  largeur), libellé simplifié en "Volume final" (FR) / "Final volume" (EN), sans changement de
  logique de calcul.
- Implémentation : `syncPairOptional()` (`js/app.js`) synchronise slider ↔ champ nombre en gérant
  le cas où le champ est vidé (le slider conserve alors sa dernière position, sans forcer de valeur
  invalide). Cache PWA bumpé à `alcoocalc-v11`.
- Testé dans le navigateur : glisser le slider active bien le calcul inverse (V₀ grisé/recalculé),
  vider le champ nombre réactive V₀ ; traduction EN vérifiée.

## 2026-09-07 (suite)
- Fait : ajout du paramètre optionnel "Volume cible (V_f)" dans la section Paramètres, à la
  demande de l'utilisateur ("la prochaine fois nous mettrons en œuvre la roadmap pour la v2 ;
  ajoute une feature à laquelle je viens de penser : ajouter un Paramètre 'Volume cible'").
- Décidé (via AskUserQuestion) : le champ est optionnel et, une fois renseigné, **remplace** V₀
  dans le calcul plutôt que de proposer un mode bascule séparé — option choisie par l'utilisateur
  parmi 3 propositions.
- Implémentation : `compute()` (`js/app.js`) calcule V₀ requis = Vf_cible × C_f / C₀ dès que le
  champ cible est un nombre fini > 0 (et C₀ > 0) ; le champ/slider V₀ est alors désactivé
  (`disabled`, classe `.is-computed`) et affiche cette valeur calculée. Vider le champ cible
  réactive V₀ (dernière valeur calculée conservée comme point de départ éditable). Les étapes de
  calcul détaillées (KaTeX) et l'historique utilisent bien le V₀ effectif (calculé ou saisi).
  i18n FR/EN ajoutée (`labelVfTarget`, `vfTargetHint`). Cache PWA bumpé à `alcoocalc-v10`.
- Testé dans le navigateur : remplissage du volume cible → V₀ recalculé et champ grisé ; effacement
  → V₀ redevient éditable ; résultats, étapes de formule et historique cohérents ; traduction EN
  vérifiée.

## 2026-09-07
- Fait : création du dossier de projet (`C:\Users\Robert\Documents\Apps\AlcooCalc`), dépôt git local
  initialisé (branche `main`), structure de mémoire mise en place (`AGENTS.md`, `docs/JOURNAL.md`,
  `docs/ROADMAP.md`, `docs/DECISIONS.md`).
- Décidé : projet indépendant du dépôt "favoris" (AIBS-1), pour ne pas mélanger les journaux des deux
  applications. Dépôt GitHub dédié `RobJBee/AlcooCalc` (privé) à créer.
- Cadrage reçu de l'utilisateur : AlcooCalc est un calculateur de dilution alcool + sucre (pas un
  calculateur d'alcoolémie), en HTML/CSS/JS vanilla, thème "terminal mainframe" (vert Matrix sur fond
  noir), bilingue FR/EN, mobile-first, PWA (offline), KaTeX pour les formules, localStorage pour les
  préférences/historique.
- Dépôt GitHub `RobJBee/AlcooCalc` (privé) créé par l'utilisateur puis relié en remote ; premier
  commit poussé sur `main`.
- Cahier des charges complet reçu (structure de fichiers, fonctionnalités, design, et documentation
  détaillée des formules mathématiques). Le modèle de calcul fourni par l'utilisateur est identique
  à celui déjà anticipé et implémenté : conservation de l'alcool pur, sucre visé dans le volume
  final, expansion volumique du sucre (coefficient k), eau par bilan volumétrique. Voir ADR
  [0002](decisions/0002-formule-dilution-sucre.md).
- Scaffolding complet réalisé : `index.html`, `css/styles.css` (thème terminal mainframe, responsive
  320px→1920px), `js/translations.js` (i18n FR/EN persistant), `js/presets.js` (11 alcools),
  `js/formulas.js` (calcul + rendu KaTeX + étapes substituées), `js/app.js` (sliders synchronisés,
  calcul temps réel, validation, historique 10 dernières entrées, copier dans le presse-papiers,
  sauvegarde localStorage), `manifest.json` + `sw.js` (PWA, cache-first avec mise en cache
  opportuniste des polices KaTeX), icônes PWA 192/512 générées, `README.md`.
- KaTeX 0.16.9 (JS + CSS + les 60 fichiers de polices) téléchargé et vendored en local dans
  `js/katex/` — aucune dépendance CDN, conforme à l'exigence "100% local".
- Testé dans le navigateur (serveur de test PowerShell `scripts/serve.ps1`, créé faute de Node/Python
  disponibles sur la machine) : calcul en temps réel conforme à l'exemple du cahier des charges
  (V0=1L, C0=50%, Cf=30%, S=150g/L → Ve=0.509L, ms=250g, Vf=1.667L, expansion=157.5mL), presets
  fonctionnels, formule KaTeX + étapes affichées correctement, validation Cf≥C0 bloque bien le
  calcul avec message d'erreur, changement de langue FR/EN traduit toute l'interface (y compris la
  formule et l'historique déjà affichés), historique enregistré correctement, reset fonctionnel,
  responsive mobile (375px) vérifié. Mode hors-ligne (service worker) non testé en profondeur : son
  enregistrement nécessite un contexte sécurisé (http/https), non vérifiable sur `file://`.
- Prochaine étape : tester le mode hors-ligne réel (installer la PWA, couper le réseau, vérifier le
  cache) ; valider visuellement sur mobile réel ; envisager le déploiement (GitHub Pages ?) une fois
  le feu vert donné par l'utilisateur.
- Retour utilisateur : le champ "Coefficient d'expansion (k)" affichait 0.00063 L/g, illisible
  (trois zéros après la virgule). Champ converti en mL/g pour l'affichage (0.63 mL/g), conversion
  en L/g faite dans `js/app.js` juste avant l'appel à `calculateDilution`/`renderFormula` — la
  formule interne (et son affichage KaTeX) reste inchangée, en L/g, conformément à l'ADR 0002.
  Vérifié : mêmes résultats qu'avant (Ve=0.509L, ms=250g, Vf=1.667L, expansion=157.5mL) pour les
  valeurs par défaut.
- Retour utilisateur : de petites barres de défilement grises apparaissaient sur chaque ligne des
  "Étapes du calcul". Cause : `overflow-x: auto` sur `.formula-step` force la spec CSS à calculer
  `overflow-y: auto` aussi ; dès que la fraction KaTeX dépassait de peu la hauteur de la ligne, un
  ascenseur vertical apparaissait. Corrigé dans `css/styles.css` : `overflow-y: hidden` explicite,
  hauteur de ligne augmentée (`min-height`, `padding`, `line-height`), `align-items: center`.
  Vérifié dans le navigateur (SW + cache vidés au préalable pour écarter le CSS déjà en cache).
- Retour utilisateur : "Voir la formule détaillée" devait avoir le même style (gras/majuscules) que
  les titres de section ("Résultats") et un chevron d'expansion. Bouton restylé en `.formula-toggle`
  (même apparence que `.card h2/h3`) avec un chevron `▸` qui pivote à 90° (`aria-expanded='true'`)
  quand la section est ouverte. Vérifié dans le navigateur : style cohérent, rotation et changement
  de texte ("Masquer la formule") au clic.
- L'utilisateur est revenu sur ce choix : la formule déplacée dans le widget "Résultats" (après les
  boutons Réinitialiser/Copier), avec le même format que "Avancé" (élément `<details>/<summary>`
  natif, triangle de disclosure natif, texte statique). Le bouton personnalisé + chevron CSS créés à
  l'étape précédente sont retirés (code mort). `js/app.js` adapté : `els.formulaSection` (un
  `<details>`) remplace `els.formulaToggle`/`formulaWrapper` ; l'événement natif `toggle` déclenche
  le calcul/rendu de la formule à l'ouverture. Clé de traduction `formulaToggleHide` supprimée
  (devenue inutile, le texte ne change plus). Vérifié dans le navigateur.
- Ajout du splash screen demandé (roadmap v2) : animation d'ouverture "pluie Matrix" (canvas plein
  écran, `js/splash.js`), ~3s puis ralentissement progressif sur les derniers 500ms ("les caractères
  se mettent en place"), fondu croisé de 700ms vers l'interface réelle (classe `app-ready` sur
  `<body>`, contenu enveloppé dans `#appContent`). Clic/tap pour passer l'animation ; sautée
  instantanément si `prefers-reduced-motion` est actif. `sw.js` mis à jour (nouveau fichier
  précaché, cache renommé `alcoocalc-v2` pour forcer la mise à jour chez les utilisateurs existants).
  Testé dans le navigateur (desktop + mobile 375px) : rendu correct, clic-pour-passer fonctionnel,
  transition vers l'app sans erreur console. Non vérifié directement : le chemin
  `prefers-reduced-motion` (pas d'outil d'émulation disponible pour ce test) — la logique est
  simple (un `matchMedia` + retour anticipé) donc risque jugé faible.
- Amélioration du splash (demande utilisateur) : "que certaines lettres de la pluie s'arrêtent au
  bon endroit et que l'écran se construise sous les yeux de l'utilisateur". Implémenté dans
  `js/splash.js` : au démarrage, un `TreeWalker` parcourt le vrai DOM (`#appContent`, encore à
  opacity:0 mais déjà mis en page) et récupère tous les caractères de texte visibles à l'écran avec
  leur position exacte (`Range.getBoundingClientRect`), taille, casse (CSS `text-transform`) et
  couleur réelles. ~20% d'entre eux (`LOCK_RATIO`) sont tirés au sort et se "verrouillent" à un
  instant aléatoire réparti sur les 400-2700ms de la pluie (`LOCK_WINDOW`), dans un flash blanc bref
  puis leur vraie couleur ; une fois verrouillés ils sont redessinés chaque frame donc restent nets,
  contrairement aux caractères de pluie ordinaires qui continuent de s'effacer. Résultat : des
  fragments reconnaissables de l'interface (titre, "PARAMÈTRES", labels, boutons) apparaissent et se
  stabilisent au bon endroit pendant la pluie, avant le fondu final vers l'interface complète.
  Test réalisé en allongeant temporairement `RAIN_DURATION_MS` à 15s (la latence entre mes appels
  d'outils dépassait les 3s réelles, rendant l'observation impossible sinon) : capture d'écran en
  cours d'animation confirmant des fragments lisibles ("PARAMÈTRES", "Volume initial", "Effacer
  l'historique"...) bien positionnés et colorés correctement ; valeur remise à 3000 avant de committer.
- Retour utilisateur : ralentir la pluie et passer le taux de verrouillage à 40%. `LOCK_RATIO`
  0.2→0.4 et vitesse de chute réduite de moitié (`0.6*speedFactor+0.1` → `0.3*speedFactor+0.05`)
  dans `js/splash.js`. Cache PWA bump à `alcoocalc-v4`. Testé (même méthode : durée temporairement
  allongée à 15s pour observer, remise à 3000 avant commit) : rendu bien plus dense et lisible, le
  titre "AlcooCalc" apparaît presque en entier ; testé aussi avec la vraie durée de 3s pour confirmer
  que le cycle complet (pluie → app-ready) fonctionne toujours correctement.
- Retour utilisateur (travail sur la transition) : (1) privilégier les caractères à droite de
  l'écran lors du tirage des verrouillages (proportionnellement moins nombreux) ; (2) démarrer le
  fondu-enchaîné dès que la pluie commence à ralentir (plutôt qu'après la fin complète), avec une
  transition 50% plus longue, l'app apparaissant en transparence pendant que la pluie (qui continue
  de tourner/ralentir) disparaît aussi en transparence. Implémenté dans `js/splash.js` :
  - Tirage pondéré sans remise (algorithme A-Res, poids = `1 + xRatio*RIGHT_BIAS` avec
    `RIGHT_BIAS=3`) au lieu d'un tirage uniforme, pour favoriser les caractères à x élevé.
  - Timeline restructurée : `PRE_SLOWDOWN_MS` (2500ms, pluie normale) → au-delà, ralentissement
    (`SLOWDOWN_MS`=500ms) ET déclenchement simultané du fondu (`startFade()`, avant seulement
    appelé en toute fin) ; la boucle d'animation continue de tourner (pluie visible à travers le
    fondu) jusqu'à la fin du fondu, pas seulement jusqu'à la fin de la pluie. `FADE_MS` 700→1050ms
    (+50%), durée de transition CSS mise à jour en conséquence dans `css/styles.css`
    (`.app-content`/`.splash`). `LOCK_WINDOW` resserré à `[400, PRE_SLOWDOWN_MS-100]` pour que tous
    les verrouillages soient résolus avant le début du fondu. Cache PWA bump à `alcoocalc-v5`.
  - Testé (durée temporairement allongée à 15s, remise à 2500 avant commit) : répartition des
    verrouillages bien étalée sur toute la largeur ; capture en plein fondu confirmant que l'app
    apparaît bien en transparence par-dessus la pluie encore visible et en mouvement. Testé aussi
    avec les vraies durées : cycle complet sans erreur console.
- Déploiement : l'utilisateur a activé GitHub Pages (Settings → Pages → Deploy from branch `main`,
  dossier `/`). Site en ligne et vérifié fonctionnel sur `https://robjbee.github.io/AlcooCalc/`
  (service worker bien enregistré, HTTPS oblige — contrairement aux tests locaux sur `file://` ou
  IP LAN, le mode hors-ligne/PWA est donc pleinement testable en conditions réelles, y compris
  depuis un smartphone). Le dépôt GitHub a aussi été rendu public par l'utilisateur (Pages n'exige
  pas la visibilité publique du dépôt, mais c'est son choix).
- Retour utilisateur (desktop ≥1024px) : (1) les champs numériques affichaient les flèches natives
  du navigateur sous forme d'un bloc gris disgracieux ("ascenseurs") ; (2) déséquilibre visuel entre
  les colonnes "Paramètres"/"Résultats" ; (3) déplacer "Alcool de base" sous "Paramètres", aligné
  avec "Historique". Corrigé :
  - `css/styles.css` : flèches natives des `input[type=number]` masquées (`appearance: textfield` +
    reset des pseudo-éléments WebKit `::-webkit-inner/outer-spin-button`) — redondantes avec le
    slider, et rendues de façon incohérente selon navigateur/OS.
  - Grille desktop remplacée par un `grid-template-areas` explicite (2×2 : Paramètres/Résultats en
    haut, Alcool de base/Historique en bas), avec des classes dédiées (`card--params`,
    `card--presets`, `card--results`, `card--history`) au lieu des sélecteurs `nth-child` fragiles
    utilisés avant (qui comptaient mal les enfants à cause du `<p id="errorBox">` intercalé). Comme
    les deux colonnes partagent les mêmes pistes de ligne (row tracks) en CSS Grid, "Alcool de base"
    et "Historique" s'alignent automatiquement sans hack supplémentaire — l'ordre du DOM (donc le
    flux mobile) reste inchangé, seul l'ordre visuel change en desktop.
  - Cache PWA bump à `alcoocalc-v6`. Testé en 1200×900 (desktop) et 375×812 (mobile) : mise en page
    correcte dans les deux cas, aucune flèche native visible, aucune erreur console.
- Retour utilisateur : les cartes ne remplissaient pas la hauteur de leur ligne (Résultats restait
  plus petit que Paramètres, Alcool de base plus petit qu'Historique, malgré le partage de la même
  piste de ligne CSS Grid) — cause : `align-items: start` sur `.app-main` empêchait les cartes de
  s'étirer. Passé à `align-items: stretch` (comportement par défaut de CSS Grid) : les cartes
  remplissent maintenant toute la hauteur de leur ligne. Vérifié par mesure directe des hauteurs
  (`getBoundingClientRect`) : Paramètres/Résultats = 397px chacun, Alcool de base/Historique = 108px
  chacun, parfaitement alignés. Titre "Alcool de base" aligné visuellement sur le style des autres
  titres de section (nouvelle classe partagée `.card-title`, appliquée au `<label>` en plus des
  règles existantes sur `.card h2/h3`). Cache PWA bump à `alcoocalc-v7`. Testé desktop (1200×900) et
  mobile (375×812) : rendu correct, aucune régression, aucune erreur console.
- Retour utilisateur (capture à l'appui) : le titre "Alcool de base" n'apparaissait pas en gras
  malgré la classe `.card-title`. Cause : le gras de `h2`/`h3` vient du style par défaut du
  navigateur (jamais déclaré explicitement dans la règle CSS partagée), donc le `<label>` n'en
  hérite pas — de même pour la marge basse (headings ont une marge par défaut, pas les labels),
  ce qui écrasait aussi la lisibilité de la ligne pointillée. Ajout explicite de `font-weight: bold`
  et `margin-bottom: 0.6rem` à la règle `.card h2, .card h3, .card-title`. Cache PWA bump à
  `alcoocalc-v8`. Vérifié dans le navigateur : titre "ALCOOL DE BASE" désormais identique en gras
  aux autres titres de section.
- Retour utilisateur : passer le texte des options du menu "Alcool de base" en blanc, et le
  surlignage (actuellement bleu, natif du navigateur) en vert. Ajout de règles `.terminal-select
  option` (texte blanc) et `option:checked`/`:hover` (fond vert) dans `css/styles.css`. Testé dans
  le navigateur : le texte blanc s'applique bien, mais le surlignage reste bleu — limitation connue
  des navigateurs Chromium (Chrome/Edge, y compris Chrome Android) : la couleur de l'option
  survolée/en cours de sélection dans la liste déroulante native est dessinée par le navigateur et
  ignore `background-color` en CSS, quel que soit le sélecteur utilisé. Vraie solution : remplacer
  le `<select>` natif par un menu déroulant personnalisé (bouton + liste stylée). Proposé à
  l'utilisateur, qui a choisi de garder le natif tel quel (texte blanc conservé, surlignage bleu
  accepté). Cache PWA bump à `alcoocalc-v9`.
