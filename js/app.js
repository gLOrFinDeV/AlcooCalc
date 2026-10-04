'use strict';

// Valeurs de première ouverture, en métrique (comme tout l'état interne).
const DEFAULTS = {
  v0: 1.0,
  vfTarget: null, // optionnel : si renseigné, remplace V0 dans le calcul
  c0: 96,
  cf: 30,
  sconc: 200,
  k: 0.63, // mL/g (affichage) ; converti en L/g avant tout calcul
  preset: 'liqueur',
  advancedOpen: false,
  formulaOpen: false,
};

// En US, les valeurs par défaut sont des nombres ronds dans les unités US (pas la conversion exacte).
const US_DEFAULT_DISPLAY = { v0: 24, sconc: 30 }; // fl oz, oz/gal

function defaultsFor(system) {
  if (system !== 'us') return Object.assign({}, DEFAULTS);
  return Object.assign({}, DEFAULTS, {
    v0: FIELD_SPECS.v0.fromUs(US_DEFAULT_DISPLAY.v0),
    sconc: FIELD_SPECS.sconc.fromUs(US_DEFAULT_DISPLAY.sconc),
  });
}

const STORAGE_KEY_INPUTS = 'alcoocalc_inputs';
const STORAGE_KEY_HISTORY = 'alcoocalc_history';
const MAX_HISTORY = 10;
const MAX_NAME_LENGTH = 40;

const els = {};
let lastResults = null;
let favoritesFilterActive = false;
let currentPreset = 'custom';
let unitSystem = 'metric';
const exactValues = {};
let editingHistoryIndex = null;
let liveTimer = null;
let liveReady = false;

function $(id) {
  return document.getElementById(id);
}

function cacheEls() {
  els.presetButtons = document.querySelectorAll('[data-preset]');
  els.v0Field = $('v0Field');
  els.v0Range = $('v0Range');
  els.v0Number = $('v0Number');
  els.vfTargetRange = $('vfTargetRange');
  els.vfTargetNumber = $('vfTargetNumber');
  els.c0Range = $('c0Range');
  els.c0Number = $('c0Number');
  els.cfRange = $('cfRange');
  els.cfNumber = $('cfNumber');
  els.sconcRange = $('sconcRange');
  els.sconcNumber = $('sconcNumber');
  els.kRange = $('kRange');
  els.kNumber = $('kNumber');
  els.advancedSection = $('advancedSection');
  els.errorBox = $('errorBox');
  els.liveRegion = $('liveRegion');
  els.resultWater = $('resultWater');
  els.resultSugar = $('resultSugar');
  els.resultFinalVolume = $('resultFinalVolume');
  els.resultExpansion = $('resultExpansion');
  els.stickySummary = $('stickySummary');
  els.stickyWaterValue = $('stickyWaterValue');
  els.stickySugarValue = $('stickySugarValue');
  els.btnReset = $('btnReset');
  els.btnCopy = $('btnCopy');
  els.copyFeedback = $('copyFeedback');
  els.formulaSection = $('formulaSection');
  els.formulaContainer = $('formulaContainer');
  els.formulaSteps = $('formulaSteps');
  els.historyList = $('historyList');
  els.btnClearHistory = $('btnClearHistory');
  els.btnFavoriteFilter = $('btnFavoriteFilter');
  els.langButtons = document.querySelectorAll('[data-lang-btn]');
  els.unitButtons = document.querySelectorAll('[data-unit-btn]');
}

function loadInputs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INPUTS);
    if (raw) return Object.assign({}, DEFAULTS, JSON.parse(raw));
  } catch (e) {
    /* ignore corrupted storage */
  }
  return Object.assign({}, DEFAULTS);
}

function saveInputs(state) {
  try {
    localStorage.setItem(STORAGE_KEY_INPUTS, JSON.stringify(state));
  } catch (e) {
    /* quota / private mode : on continue sans persister */
  }
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    /* ignore */
  }
  return [];
}

function saveHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  } catch (e) {
    /* ignore */
  }
}

function setPreset(key) {
  currentPreset = SPIRIT_PRESETS[key] ? key : 'custom';
  document.body.classList.toggle('no-sugar', currentPreset === 'eaudevie');
  els.presetButtons.forEach((btn) => {
    const active = btn.dataset.preset === currentPreset;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

// Le formulaire affiche le système d'unités courant ; tout ce qui en sort est en métrique.
function readInputsFromForm() {
  const metric = (field, el) => {
    const shown = parseFloat(el.value);
    const exact = exactValues[field];
    // valeur métrique d'origine tant que l'utilisateur n'a pas modifié le champ affiché (arrondi)
    if (Number.isFinite(exact) && toDisplayValue(field, exact, unitSystem) === shown) return exact;
    return fromDisplayValue(field, shown, unitSystem);
  };
  return {
    v0: metric('v0', els.v0Number),
    vfTarget: metric('vfTarget', els.vfTargetNumber),
    c0: parseFloat(els.c0Number.value),
    cf: parseFloat(els.cfNumber.value),
    sconc: metric('sconc', els.sconcNumber),
    k: metric('k', els.kNumber),
    preset: currentPreset,
    advancedOpen: els.advancedSection.open,
    formulaOpen: els.formulaSection.open,
  };
}

function applyInputsToForm(state) {
  const shown = (field, value) => toDisplayValue(field, value, unitSystem);
  Object.assign(exactValues, { v0: state.v0, vfTarget: state.vfTarget, sconc: state.sconc, k: state.k });
  els.v0Range.value = shown('v0', state.v0);
  els.v0Number.value = shown('v0', state.v0);
  els.vfTargetNumber.value = Number.isFinite(state.vfTarget) ? shown('vfTarget', state.vfTarget) : '';
  if (Number.isFinite(state.vfTarget)) {
    els.vfTargetRange.value = shown('vfTarget', state.vfTarget);
  }
  els.c0Range.value = state.c0;
  els.c0Number.value = state.c0;
  els.cfRange.value = state.cf;
  els.cfNumber.value = state.cf;
  els.sconcRange.value = shown('sconc', state.sconc);
  els.sconcNumber.value = shown('sconc', state.sconc);
  els.kRange.value = shown('k', state.k);
  els.kNumber.value = shown('k', state.k);
  setPreset(state.preset);
  els.advancedSection.open = !!state.advancedOpen;
  els.formulaSection.open = !!state.formulaOpen;
}

function syncPair(rangeEl, numberEl, onChange) {
  rangeEl.addEventListener('input', () => {
    numberEl.value = rangeEl.value;
    onChange();
  });
  numberEl.addEventListener('input', () => {
    rangeEl.value = numberEl.value;
    onChange();
  });
}

function syncPairOptional(rangeEl, numberEl, onChange) {
  // Comme syncPair, mais le champ nombre peut être vide (paramètre optionnel) :
  // on ne répercute alors pas de valeur invalide sur le slider.
  rangeEl.addEventListener('input', () => {
    numberEl.value = rangeEl.value;
    onChange();
  });
  numberEl.addEventListener('input', () => {
    if (numberEl.value !== '') {
      rangeEl.value = numberEl.value;
    }
    onChange();
  });
}

function showErrors(errorKeys) {
  if (!errorKeys || !errorKeys.length) {
    els.errorBox.hidden = true;
    els.errorBox.textContent = '';
    return;
  }
  els.errorBox.hidden = false;
  els.errorBox.textContent = errorKeys.map((k) => t(k)).join(' ');
}

function configureFieldsForUnits() {
  const fields = [
    ['v0', els.v0Range, els.v0Number],
    ['vfTarget', els.vfTargetRange, els.vfTargetNumber],
    ['sconc', els.sconcRange, els.sconcNumber],
    ['k', els.kRange, els.kNumber],
  ];
  fields.forEach(([field, rangeEl, numberEl]) => {
    const { min, max, step } = FIELD_SPECS[field][unitSystem];
    [rangeEl, numberEl].forEach((el) => {
      el.min = min;
      el.max = max;
      el.step = step;
    });
  });
  document.querySelectorAll('[data-i18n-metric]').forEach((el) => {
    el.setAttribute('data-i18n', el.getAttribute(unitSystem === 'us' ? 'data-i18n-us' : 'data-i18n-metric'));
  });
  els.unitButtons.forEach((btn) => {
    const active = btn.dataset.unitBtn === unitSystem;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

function setUnitSystem(system) {
  if (!UNIT_SYSTEMS.includes(system) || system === unitSystem) return;
  const state = readInputsFromForm(); // lu avec l'ancien système, converti en métrique
  const old = defaultsFor(unitSystem);
  const untouched = (a, b) => Math.abs(a - b) < 1e-9;
  if (untouched(state.v0, old.v0) && untouched(state.sconc, old.sconc)) {
    // volume et sucre encore à leurs valeurs par défaut : on propose celles du nouveau système
    const fresh = defaultsFor(system);
    state.v0 = fresh.v0;
    state.sconc = fresh.sconc;
  }
  unitSystem = system;
  saveUnitSystem(system);
  configureFieldsForUnits();
  applyInputsToForm(state);
  applyTranslations(getLanguage());
}

function markInvalidFields(results, { v0, c0, cf, sconc, k }) {
  const invalid = new Set();
  if (!results.feasible) {
    if (results.errors.includes('errorPositive')) {
      if (!(v0 > 0)) invalid.add(els.v0Number);
      if (!(c0 > 0)) invalid.add(els.c0Number);
      if (!(cf > 0)) invalid.add(els.cfNumber);
      if (currentPreset !== 'eaudevie') {
        if (!(sconc >= 0)) invalid.add(els.sconcNumber);
        if (!(k >= 0)) invalid.add(els.kNumber);
      }
    }
    if (results.errors.includes('errorCfGteC0')) invalid.add(els.cfNumber);
    if (results.errors.includes('errorNegativeWater')) invalid.add(els.sconcNumber);
  }
  [els.v0Number, els.c0Number, els.cfNumber, els.sconcNumber, els.kNumber].forEach((el) => {
    if (invalid.has(el)) {
      el.setAttribute('aria-invalid', 'true');
      el.setAttribute('aria-describedby', 'errorBox');
    } else {
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
    }
  });
}

function announceResults(results) {
  clearTimeout(liveTimer);
  if (!liveReady) return;
  let message = `${t('resultsTitle')} : ${t('historyWaterLabel')} ${formatVolume(results.Ve, unitSystem)}`;
  if (currentPreset !== 'eaudevie') {
    message += `, ${t('historySugarLabel')} ${formatMass(results.ms, unitSystem)}`;
  }
  liveTimer = setTimeout(() => {
    els.liveRegion.textContent = message;
  }, 700);
}

function renderResults(results) {
  if (!results.feasible) {
    els.resultWater.textContent = '—';
    els.resultSugar.textContent = '—';
    els.resultFinalVolume.textContent = '—';
    els.resultExpansion.textContent = '—';
    els.stickyWaterValue.textContent = '—';
    els.stickySugarValue.textContent = '—';
    showErrors(results.errors);
    return;
  }
  showErrors(null);
  els.resultWater.textContent = formatVolume(results.Ve, unitSystem);
  els.resultSugar.textContent = formatMass(results.ms, unitSystem);
  els.resultFinalVolume.textContent = formatVolume(results.Vf, unitSystem);
  els.resultExpansion.textContent = formatVolume(results.expansion, unitSystem);
  els.stickyWaterValue.textContent = formatVolumeShort(results.Ve, unitSystem);
  els.stickySugarValue.textContent = formatMassShort(results.ms, unitSystem);
  announceResults(results);
}

function compute({ recordHistory } = { recordHistory: false }) {
  const input = readInputsFromForm();
  const kLg = input.k / 1000; // le champ "k" est saisi en mL/g, la formule attend du L/g

  const vfTargetActive = Number.isFinite(input.vfTarget) && input.vfTarget > 0 && input.c0 > 0;
  let v0 = input.v0;
  if (vfTargetActive) {
    v0 = (input.vfTarget * input.cf) / input.c0;
    const shownV0 = unitSystem === 'us' ? FIELD_SPECS.v0.toUs(v0) : v0;
    els.v0Number.value = shownV0.toFixed(unitSystem === 'us' ? 2 : 3);
    els.v0Range.value = Math.min(Math.max(shownV0, Number(els.v0Range.min)), Number(els.v0Range.max));
  }
  els.v0Number.disabled = vfTargetActive;
  els.v0Range.disabled = vfTargetActive;
  els.v0Field.classList.toggle('is-computed', vfTargetActive);

  const sconc = currentPreset === 'eaudevie' ? 0 : input.sconc;
  const results = calculateDilution(v0, input.c0, input.cf, sconc, kLg);
  lastResults = results;
  renderResults(results);
  markInvalidFields(results, { v0, c0: input.c0, cf: input.cf, sconc, k: kLg });

  if (els.formulaSection.open) {
    renderFormula(els.formulaContainer, els.formulaSteps, v0, input.c0, input.cf, sconc, kLg, results, unitSystem);
  }

  saveInputs(Object.assign({}, input, { v0 }));

  if (recordHistory && results.feasible) {
    pushHistory(Object.assign({}, input, { v0, sconc, k: kLg }), results);
  }
}

function pushHistory(input, results) {
  const history = loadHistory();
  history.unshift({
    date: new Date().toISOString(),
    v0: input.v0,
    vfTarget: Number.isFinite(input.vfTarget) ? input.vfTarget : null,
    c0: input.c0,
    cf: input.cf,
    sconc: input.sconc,
    k: input.k,
    ve: results.Ve,
    ms: results.ms,
    vf: results.Vf,
    expansion: results.expansion,
    favorite: false,
  });
  // les favoris sont conservés sans limite ; seul l'historique "courant" est plafonné
  let kept = 0;
  saveHistory(history.filter((entry) => entry.favorite || ++kept <= MAX_HISTORY));
  renderHistory();
}

function toggleFavorite(index) {
  const history = loadHistory();
  if (!history[index]) return;
  history[index].favorite = !history[index].favorite;
  saveHistory(history);
  renderHistory();
}

function renameHistoryEntry(index, rawName) {
  const history = loadHistory();
  if (!history[index]) return;
  const name = rawName.trim().slice(0, MAX_NAME_LENGTH);
  history[index].name = name;
  if (name) history[index].favorite = true;
  saveHistory(history);
}

function setFavoritesFilter(active) {
  favoritesFilterActive = active;
  els.btnFavoriteFilter.textContent = favoritesFilterActive ? '★' : '☆';
  els.btnFavoriteFilter.classList.toggle('is-active', favoritesFilterActive);
  els.btnFavoriteFilter.setAttribute('aria-pressed', String(favoritesFilterActive));
  els.btnFavoriteFilter.setAttribute(
    'aria-label',
    t(favoritesFilterActive ? 'historyShowAllLabel' : 'historyFilterFavoritesLabel')
  );
}

function loadHistoryEntry(entry) {
  applyInputsToForm({
    v0: entry.v0,
    vfTarget: Number.isFinite(entry.vfTarget) ? entry.vfTarget : null,
    c0: entry.c0,
    cf: entry.cf,
    // une entrée sans sucre revient en mode "eau-de-vie" ; le sucre saisi est conservé
    sconc: entry.sconc > 0 ? entry.sconc : readInputsFromForm().sconc,
    k: entry.k * 1000, // stocké en L/g dans l'historique, le champ affiche du mL/g
    preset: entry.sconc > 0 ? 'custom' : 'eaudevie',
    advancedOpen: els.advancedSection.open,
    formulaOpen: els.formulaSection.open,
  });
  compute({ recordHistory: false });
}

function deleteHistoryEntry(index) {
  const history = loadHistory();
  history.splice(index, 1);
  saveHistory(history);
  renderHistory();
}

function renderHistory() {
  const allHistory = loadHistory();
  const indexed = allHistory.map((entry, index) => ({ entry, index }));
  const visible = favoritesFilterActive ? indexed.filter((item) => item.entry.favorite) : indexed;

  els.historyList.innerHTML = '';

  if (!visible.length) {
    const empty = document.createElement('p');
    empty.className = 'history-empty';
    empty.textContent = t(favoritesFilterActive ? 'historyNoFavorites' : 'historyEmpty');
    els.historyList.appendChild(empty);
    return;
  }

  visible.forEach(({ entry, index }) => {
    const row = document.createElement('div');
    row.className = 'history-row';

    const d = new Date(entry.date);
    const main = document.createElement('button');
    main.type = 'button';
    main.className = 'history-row__main';
    main.setAttribute('aria-label', t('historyReloadLabel'));
    main.innerHTML = `
      <span class="history-row__name" hidden></span>
      <span class="history-row__date">${d.toLocaleString()}</span>
      <span class="history-row__spec">${formatVolumeShort(entry.v0, unitSystem)} · ${entry.c0}${t('unitPercent')} → ${entry.cf}${t('unitPercent')}</span>
      <span class="history-row__result">${t('historyWaterLabel')}: ${formatVolumeShort(entry.ve, unitSystem)}${entry.sconc > 0 ? ` · ${t('historySugarLabel')}: ${formatMassShort(entry.ms, unitSystem)}` : ''}</span>
    `;
    main.addEventListener('click', () => loadHistoryEntry(entry));
    if (entry.name) {
      const nameEl = main.querySelector('.history-row__name');
      nameEl.textContent = entry.name;
      nameEl.hidden = false;
    }

    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'history-row__edit';
    edit.setAttribute('aria-label', t('historyRenameLabel'));
    edit.textContent = '✎';
    edit.addEventListener('click', (event) => {
      event.stopPropagation();
      editingHistoryIndex = index;
      renderHistory();
    });

    let first = main;
    if (editingHistoryIndex === index) {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'history-row__name-input';
      input.maxLength = MAX_NAME_LENGTH;
      input.value = entry.name || '';
      input.placeholder = t('historyNamePlaceholder');
      input.setAttribute('aria-label', t('historyRenameLabel'));
      let finished = false;
      const finish = (save) => {
        if (finished) return;
        finished = true;
        editingHistoryIndex = null;
        if (save) renameHistoryEntry(index, input.value);
        renderHistory();
      };
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') finish(true);
        else if (event.key === 'Escape') finish(false);
      });
      input.addEventListener('blur', () => finish(true));
      first = input;
      setTimeout(() => input.focus(), 0);
    }

    const fav = document.createElement('button');
    fav.type = 'button';
    fav.className = 'history-row__favorite';
    fav.classList.toggle('is-active', !!entry.favorite);
    fav.setAttribute('aria-label', t(entry.favorite ? 'historyUnfavoriteLabel' : 'historyFavoriteLabel'));
    fav.textContent = entry.favorite ? '★' : '☆';
    fav.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleFavorite(index);
    });

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'history-row__delete';
    del.setAttribute('aria-label', t('historyDeleteLabel'));
    del.textContent = '×';
    del.addEventListener('click', (event) => {
      event.stopPropagation();
      deleteHistoryEntry(index);
    });

    row.appendChild(first);
    row.appendChild(edit);
    row.appendChild(fav);
    row.appendChild(del);
    els.historyList.appendChild(row);
  });
}

function copyResults() {
  if (!lastResults || !lastResults.feasible) return;
  const input = readInputsFromForm();
  const noSugar = currentPreset === 'eaudevie';
  const text = t(noSugar ? 'copyTemplateNoSugar' : 'copyTemplate')
    .replace('{date}', new Date().toLocaleString())
    .replace('{v0}', formatVolumeShort(input.v0, unitSystem))
    .replace('{c0}', input.c0)
    .replace('{cf}', input.cf)
    .replace('{sconc}', formatSugarConc(input.sconc, unitSystem))
    .replace('{ve}', formatVolume(lastResults.Ve, unitSystem))
    .replace('{ms}', formatMass(lastResults.ms, unitSystem))
    .replace('{vf}', formatVolume(lastResults.Vf, unitSystem))
    .replace('{exp}', formatVolume(lastResults.expansion, unitSystem));

  const feedback = () => {
    els.copyFeedback.textContent = t('copiedMsg');
    els.copyFeedback.hidden = false;
    setTimeout(() => {
      els.copyFeedback.hidden = true;
    }, 1800);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(feedback).catch(() => {});
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      feedback();
    } catch (e) {
      /* ignore */
    }
    document.body.removeChild(ta);
  }
}

function resetToDefaults() {
  applyInputsToForm(defaultsFor(unitSystem));
  compute({ recordHistory: false });
}

function onLanguageChanged(lang) {
  setFavoritesFilter(favoritesFilterActive);
  renderHistory();
  compute({ recordHistory: false });
}

function wireEvents() {
  syncPair(els.v0Range, els.v0Number, () => compute({ recordHistory: false }));
  syncPair(els.c0Range, els.c0Number, () => compute({ recordHistory: false }));
  syncPair(els.cfRange, els.cfNumber, () => compute({ recordHistory: false }));
  syncPair(els.sconcRange, els.sconcNumber, () => compute({ recordHistory: false }));
  syncPair(els.kRange, els.kNumber, () => compute({ recordHistory: false }));

  const alcoholInputs = [els.c0Number, els.c0Range, els.cfNumber, els.cfRange];
  [els.v0Number, els.c0Number, els.cfNumber, els.sconcNumber, els.kNumber].forEach((el) => {
    el.addEventListener('change', () => {
      if (alcoholInputs.includes(el)) setPreset('custom');
      compute({ recordHistory: true });
    });
  });

  syncPairOptional(els.vfTargetRange, els.vfTargetNumber, () => compute({ recordHistory: false }));
  [els.vfTargetRange, els.vfTargetNumber].forEach((el) => {
    el.addEventListener('change', () => compute({ recordHistory: true }));
  });
  [els.v0Range, els.c0Range, els.cfRange, els.sconcRange, els.kRange].forEach((el) => {
    el.addEventListener('change', () => {
      if (alcoholInputs.includes(el)) setPreset('custom');
      compute({ recordHistory: true });
    });
  });

  els.presetButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = applyPreset(btn.dataset.preset);
      if (!preset) return;
      setPreset(btn.dataset.preset);
      els.c0Range.value = preset.c0;
      els.c0Number.value = preset.c0;
      els.cfRange.value = preset.cf;
      els.cfNumber.value = preset.cf;
      compute({ recordHistory: true });
    });
  });

  document.querySelectorAll('.help-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = $(btn.getAttribute('aria-controls'));
      const open = panel.hidden;
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('.help-btn[aria-expanded="true"]').forEach((btn) => {
      $(btn.getAttribute('aria-controls')).hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    });
  });

  els.btnReset.addEventListener('click', resetToDefaults);
  els.btnCopy.addEventListener('click', copyResults);
  els.btnClearHistory.addEventListener('click', () => {
    saveHistory([]);
    renderHistory();
  });

  els.btnFavoriteFilter.addEventListener('click', () => {
    setFavoritesFilter(!favoritesFilterActive);
    renderHistory();
  });

  els.formulaSection.addEventListener('toggle', () => {
    compute({ recordHistory: false });
  });

  els.stickySummary.addEventListener('click', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('resultsTitle').scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  });

  els.langButtons.forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.getAttribute('data-lang-btn')));
  });
  els.unitButtons.forEach((btn) => {
    btn.addEventListener('click', () => setUnitSystem(btn.dataset.unitBtn));
  });
}

function initApp() {
  cacheEls();
  const lang = getLanguage();
  const savedInputs = loadInputs();

  unitSystem = getUnitSystem();
  configureFieldsForUnits();
  applyInputsToForm(savedInputs);
  wireEvents();
  applyTranslations(lang);
  renderHistory();
  compute({ recordHistory: false });
  setTimeout(() => {
    liveReady = true;
  }, 0);
  document.dispatchEvent(new Event('alcoocalc:ready'));

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {
        /* SW facultatif : l'app reste utilisable sans mode hors-ligne */
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', initApp);
