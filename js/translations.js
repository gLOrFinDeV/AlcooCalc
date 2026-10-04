'use strict';

const TRANSLATIONS = {
  fr: {
    appTitle: 'AlcooCalc',
    appSubtitle: 'Calculateur de dilution alcool + sucre',
    presetLabel: 'Alcool de base',
    preset_eaudevie: 'Eau-de-vie',
    preset_liqueur: 'Liqueur',
    inputsTitle: 'Paramètres',
    labelV0: 'Volume initial (V₀)',
    labelVfTarget: 'Volume cible (V₁)',
    labelC0: 'Alcool initial (C₀)',
    labelCf: 'Alcool cible (C₁)',
    labelSconc: 'Sucre visé (S)',
    labelK: "Coefficient d'expansion (k)",
    helpBtnLabel: 'Aide',
    skipToContent: 'Aller au contenu',
    helpPreset: "Eau-de-vie : on dilue simplement avec de l'eau. Liqueur : on dilue et on ajoute du sucre.",
    helpVf: "Volume final souhaité. S'il est rempli, l'app calcule le volume d'alcool de départ nécessaire.",
    helpS: 'Quantité de sucre dissous par litre de produit fini (g/L). 150 g/L donne une liqueur peu sucrée, 300 g/L une liqueur très sucrée.',
    helpK: "Volume ajouté par chaque gramme de sucre dissous (≈ 0,63 mL/g pour le saccharose). À ne modifier que pour un autre sucre.",
    advancedToggle: 'Avancé',
    unitL: 'L',
    unitPercent: '%',
    unitGL: 'g/L',
    unitMLg: 'mL/g',
    resultsTitle: 'Résultats',
    resultWater: 'Eau à ajouter (Vₑ)',
    resultSugar: 'Sucre à ajouter (mₛ)',
    resultFinalVolume: 'Volume cible (V₁)',
    resultExpansion: 'Expansion due au sucre (ΔVₛ)',
    stickyWater: 'Eau',
    stickySugar: 'Sucre',
    btnReset: 'Réinitialiser',
    btnCopy: 'Copier les résultats',
    copiedMsg: 'Copié !',
    formulaToggleShow: 'Voir la formule détaillée',
    stepsTitle: 'Étapes du calcul',
    historyTitle: 'Historique',
    historyWaterLabel: 'Eau',
    historySugarLabel: 'Sucre',
    historyEmpty: 'Aucun calcul enregistré pour le moment.',
    historyClear: "Effacer l'historique",
    historyReloadLabel: 'Recharger ce calcul dans les champs',
    historyDeleteLabel: 'Supprimer cette entrée',
    historyRenameLabel: 'Nommer cette recette',
    historyNamePlaceholder: 'Nom de la recette',
    historyFavoriteLabel: 'Ajouter aux favoris',
    historyUnfavoriteLabel: 'Retirer des favoris',
    historyFilterFavoritesLabel: 'Afficher uniquement les favoris',
    historyShowAllLabel: "Afficher tout l'historique",
    historyNoFavorites: 'Aucun favori pour le moment.',
    errorCfGteC0: 'Le degré cible doit être strictement inférieur au degré initial.',
    errorPositive: 'Toutes les valeurs doivent être supérieures à zéro.',
    errorNegativeWater: "Combinaison impossible : trop de sucre pour cette dilution (eau négative). Réduisez le sucre visé ou l'écart de dilution.",
    langSwitchLabel: 'Langue',
    footerText: 'code source ouvert, avec amour gLOrFinD · aucune donnée envoyée · fonctionne hors-ligne',
    copyTemplate:
      'AlcooCalc — {date}\nVolume initial : {v0} L à {c0}%\nCible : {cf}% avec {sconc} g/L de sucre\n---\nEau à ajouter : {ve}\nSucre à ajouter : {ms} g\nVolume final : {vf} L\nExpansion (sucre) : {exp} mL',
    copyTemplateNoSugar:
      'AlcooCalc — {date}\nVolume initial : {v0} L à {c0}%\nCible : {cf}%\n---\nEau à ajouter : {ve}\nVolume final : {vf} L',
  },
  en: {
    appTitle: 'AlcooCalc',
    appSubtitle: 'Alcohol + Sugar Dilution Calculator',
    presetLabel: 'Base spirit',
    preset_eaudevie: 'Spirit',
    preset_liqueur: 'Liqueur',
    inputsTitle: 'Parameters',
    labelV0: 'Initial volume (V₀)',
    labelVfTarget: 'Target volume (V₁)',
    labelC0: 'Initial ABV (C₀)',
    labelCf: 'Target ABV (C₁)',
    labelSconc: 'Target sugar (S)',
    labelK: 'Expansion coefficient (k)',
    helpBtnLabel: 'Help',
    skipToContent: 'Skip to content',
    helpPreset: 'Spirit: simply dilute with water. Liqueur: dilute and add sugar.',
    helpVf: 'Desired final volume. When filled in, the app works out the starting volume of alcohol needed.',
    helpS: 'Amount of sugar dissolved per litre of finished product (g/L). 150 g/L gives a lightly sweet liqueur, 300 g/L a very sweet one.',
    helpK: 'Volume added by each gram of dissolved sugar (≈ 0.63 mL/g for sucrose). Only change it for another kind of sugar.',
    advancedToggle: 'Advanced',
    unitL: 'L',
    unitPercent: '%',
    unitGL: 'g/L',
    unitMLg: 'mL/g',
    resultsTitle: 'Results',
    resultWater: 'Water to add (Vₑ)',
    resultSugar: 'Sugar to add (mₛ)',
    resultFinalVolume: 'Target volume (V₁)',
    resultExpansion: 'Sugar volume expansion (ΔVₛ)',
    stickyWater: 'Water',
    stickySugar: 'Sugar',
    btnReset: 'Reset',
    btnCopy: 'Copy results',
    copiedMsg: 'Copied!',
    formulaToggleShow: 'Show detailed formula',
    stepsTitle: 'Calculation steps',
    historyTitle: 'History',
    historyWaterLabel: 'Water',
    historySugarLabel: 'Sugar',
    historyEmpty: 'No calculation saved yet.',
    historyClear: 'Clear history',
    historyReloadLabel: 'Reload this calculation into the fields',
    historyDeleteLabel: 'Delete this entry',
    historyRenameLabel: 'Name this recipe',
    historyNamePlaceholder: 'Recipe name',
    historyFavoriteLabel: 'Add to favorites',
    historyUnfavoriteLabel: 'Remove from favorites',
    historyFilterFavoritesLabel: 'Show favorites only',
    historyShowAllLabel: 'Show full history',
    historyNoFavorites: 'No favorites yet.',
    errorCfGteC0: 'Target ABV must be strictly lower than initial ABV.',
    errorPositive: 'All values must be greater than zero.',
    errorNegativeWater: 'Impossible combination: too much sugar for this dilution (negative water). Lower the target sugar or the dilution gap.',
    langSwitchLabel: 'Language',
    footerText: 'source code available, with love gLOrFinD · no data sent · works offline',
    copyTemplate:
      'AlcooCalc — {date}\nInitial volume: {v0} L at {c0}%\nTarget: {cf}% with {sconc} g/L sugar\n---\nWater to add: {ve}\nSugar to add: {ms} g\nFinal volume: {vf} L\nSugar expansion: {exp} mL',
    copyTemplateNoSugar:
      'AlcooCalc — {date}\nInitial volume: {v0} L at {c0}%\nTarget: {cf}%\n---\nWater to add: {ve}\nFinal volume: {vf} L',
  },
};

const SUPPORTED_LANGS = Object.keys(TRANSLATIONS);
const DEFAULT_LANG = 'fr';

function getLanguage() {
  try {
    const saved = localStorage.getItem('alcoocalc_lang');
    if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
  } catch (e) {
    /* localStorage indisponible (mode privé, quota…) : on retombe sur le défaut */
  }
  return DEFAULT_LANG;
}

function t(key, lang) {
  const l = lang || getLanguage();
  return (TRANSLATIONS[l] && TRANSLATIONS[l][key]) || TRANSLATIONS[DEFAULT_LANG][key] || key;
}

function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  try {
    localStorage.setItem('alcoocalc_lang', lang);
  } catch (e) {
    /* ignore */
  }
  applyTranslations(lang);
}

function applyTranslations(lang) {
  const l = lang || getLanguage();
  document.documentElement.lang = l;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key, l);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key, l));
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria-label'), l));
  });
  document.querySelectorAll('[data-lang-btn]').forEach((el) => {
    const active = el.getAttribute('data-lang-btn') === l;
    el.classList.toggle('is-active', active);
    el.setAttribute('aria-pressed', String(active));
  });
  if (typeof onLanguageChanged === 'function') onLanguageChanged(l);
}
