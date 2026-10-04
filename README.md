# AlcooCalc

Calculateur de dilution alcool + sucre — pensé pour la macération/liquoristerie maison
(ex. limoncello, liqueurs infusées) : à partir d'un volume d'alcool à un degré donné, calcule
l'eau (et le sucre) à ajouter pour atteindre un degré et une concentration en sucre cibles, en
tenant compte de l'expansion de volume causée par le sucre dissous.

**Application en ligne :** <https://glorfindev.github.io/AlcooCalc/>

## Fonctionnalités

- Calcul en temps réel : eau à ajouter, sucre à ajouter, volume cible, expansion due au sucre
  (chaque valeur en L / mL ou kg / g)
- Deux modes de base : **Eau-de-vie** (dilution simple, sans sucre) et **Liqueur** (dilution +
  sucre), ou saisie libre des degrés
- Volume cible optionnel : renseigné, il remplace le volume initial dans le calcul
- Formule détaillée (rendu KaTeX) avec étapes de calcul substituées
- Historique cliquable : recharger un calcul, le nommer (ce qui en fait un favori), filtrer sur les
  favoris. Les favoris sont conservés sans limite, l'historique courant est plafonné à 10 entrées
- Données et préférences sauvegardées localement (`localStorage`) — rien n'est envoyé
- Bilingue FR/EN, et deux systèmes d'unités au choix : **métrique** ou **US** (fl oz, gal, oz, lb)
- Thème "terminal mainframe" (vert sur fond noir), responsive mobile-first
- PWA installable, fonctionne hors-ligne (service worker)

## Stack technique

- HTML5 / CSS3 / JavaScript vanilla (aucun framework, aucune dépendance de build)
- [KaTeX](https://katex.org/) 0.16.9 (fourni en local dans `js/katex/`, aucun CDN requis)
- PWA : `manifest.json` + `sw.js`
- `localStorage` pour la persistance (inputs, historique, langue)

## Utiliser et modifier l'application

L'app est un site 100% statique — aucune installation ni build nécessaire.

**Le plus simple : ouvrir `index.html` directement dans un navigateur** (double-clic). Les
calculs, l'historique et le changement de langue fonctionnent normalement.

**Pour tester le mode hors-ligne (PWA)**, un service worker ne s'enregistre pas sur `file://` :
il faut servir les fichiers via un petit serveur local, par exemple :

```bash
npx serve .
# ou
python -m http.server 8080
```

Si ni Node ni Python ne sont installés, un petit serveur statique en PowerShell est fourni :

```powershell
powershell -File scripts\serve.ps1 -Port 8123
```

puis ouvrir `http://localhost:<port>/` dans le navigateur.

> Après une modification des fichiers servis, incrémenter `CACHE_NAME` dans `sw.js` (ex.
> `alcoocalc-v38`), sinon le service worker continue de servir l'ancienne version depuis son cache.

## Formules

Voir [`js/formulas.js`](js/formulas.js) et [`docs/decisions/0002-formule-dilution-sucre.md`](docs/decisions/0002-formule-dilution-sucre.md)
pour le détail du modèle physique retenu (conservation de l'alcool pur + expansion volumique du sucre).

## Licence

AlcooCalc est publié sous licence **[PolyForm Noncommercial 1.0.0](LICENSE)**.

En clair (le texte de [`LICENSE`](LICENSE) fait foi) :

- Vous pouvez **télécharger, utiliser, étudier, modifier et partager** le code, et en faire vos
  propres versions, pour tout usage **non commercial** : usage personnel, loisir, recherche,
  enseignement, associations et organismes à but non lucratif, etc.
- Vous **ne pouvez pas** vendre l'application, l'intégrer à un produit ou service commercial, ni
  l'utiliser pour en tirer un profit, sans l'accord écrit de l'auteur.
- Toute redistribution (modifiée ou non) doit inclure le fichier `LICENSE` et la ligne
  `Required Notice: Copyright (c) 2026 gLOrFinD` qu'il contient.
- Le logiciel est fourni « tel quel », sans garantie. Les résultats de calcul sont indicatifs.

Cette licence est dite *source-available* : le code est ouvert à la lecture et à la modification,
mais, comme elle interdit l'usage commercial, elle n'entre pas dans la définition « open source »
de l'[OSI](https://opensource.org/osd). Pour un usage commercial, contactez l'auteur
(voir [Auteur](#auteur) ci-dessous).

### Composants tiers

- **[KaTeX](https://katex.org/)** (0.16.9) — © 2013-2020 Khan Academy and other contributors,
  distribué sous **licence MIT**. Il est embarqué dans [`js/katex/`](js/katex/) (script, feuille de
  style et polices) et **n'est pas couvert par la licence PolyForm ci-dessus** : il reste sous sa
  propre licence MIT, dont le texte est conservé dans
  [`js/katex/LICENSE`](js/katex/LICENSE). Si vous redistribuez ce projet, conservez ce fichier et
  la mention de copyright de KaTeX avec les fichiers de `js/katex/`.

## Contribuer

Les suggestions et corrections sont les bienvenues via les *issues* et *pull requests* GitHub.
En proposant une contribution, vous acceptez qu'elle soit publiée sous la même licence
(PolyForm Noncommercial 1.0.0). Les règles de travail du projet sont décrites dans
[`AGENTS.md`](AGENTS.md) et l'historique des décisions dans [`docs/`](docs/).

## Auteur

🥃 **gLOrFinD** a publié la première version d'AlcooCalc et l'offre à la communauté, avec amour,
pour que chacun puisse doser, diluer, macérer, apprendre et améliorer le code librement. Si vous
l'utilisez, le modifiez, ou avez simplement une idée, un retour ou une recette à partager :

📬 **[glorfind@pm.me](mailto:glorfind@pm.me)**

Une question sur un usage commercial ? Écrivez-moi aussi, on en discute.

*Santé !* 🍋
