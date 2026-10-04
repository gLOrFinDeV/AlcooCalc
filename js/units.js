'use strict';

/*
 * Systèmes d'unités : le calcul et l'historique restent toujours en métrique
 * (L, g, g/L, mL/g) ; le système "us" ne change que la saisie et l'affichage.
 * Gallon US = 3,785411784 L = 128 fl oz ; once avoirdupois = 28,349523125 g.
 */
const L_PER_GAL = 3.785411784;
const ML_PER_FLOZ = 29.5735295625;
const G_PER_OZ = 28.349523125;
const G_PER_LB = 453.59237;
const FLOZ_PER_GAL = 128;

const STORAGE_KEY_UNITS = 'alcoocalc_units';
const UNIT_SYSTEMS = ['metric', 'us'];

const VOLUME_CONV = {
  toUs: (liters) => (liters * 1000) / ML_PER_FLOZ,
  fromUs: (flOz) => (flOz * ML_PER_FLOZ) / 1000,
};

// min/max/step/dec = attributs des champs et nombre de décimales affichées, par système
const FIELD_SPECS = {
  v0: {
    metric: { min: 0.1, max: 10, step: 0.05, dec: 2 },
    us: { min: 3, max: 340, step: 0.5, dec: 1 },
    ...VOLUME_CONV,
  },
  vfTarget: {
    metric: { min: 0.1, max: 10, step: 0.05, dec: 2 },
    us: { min: 3, max: 340, step: 0.5, dec: 1 },
    ...VOLUME_CONV,
  },
  sconc: {
    metric: { min: 0, max: 500, step: 5, dec: 0 },
    us: { min: 0, max: 67, step: 0.5, dec: 1 },
    toUs: (gPerL) => (gPerL * L_PER_GAL) / G_PER_OZ,
    fromUs: (ozPerGal) => (ozPerGal * G_PER_OZ) / L_PER_GAL,
  },
  k: {
    metric: { min: 0.1, max: 1, step: 0.01, dec: 2 },
    us: { min: 0.1, max: 1, step: 0.01, dec: 2 },
    toUs: (mlPerG) => (mlPerG * G_PER_OZ) / ML_PER_FLOZ,
    fromUs: (flOzPerOz) => (flOzPerOz * ML_PER_FLOZ) / G_PER_OZ,
  },
};

function getUnitSystem() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_UNITS);
    if (saved && UNIT_SYSTEMS.includes(saved)) return saved;
  } catch (e) {
    /* localStorage indisponible : métrique par défaut */
  }
  return 'metric';
}

function saveUnitSystem(system) {
  try {
    localStorage.setItem(STORAGE_KEY_UNITS, system);
  } catch (e) {
    /* ignore */
  }
}

function roundTo(value, decimals) {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

function toDisplayValue(field, metricValue, system) {
  if (!Number.isFinite(metricValue)) return metricValue;
  const spec = FIELD_SPECS[field];
  const v = system === 'us' ? spec.toUs(metricValue) : metricValue;
  return roundTo(v, spec[system].dec);
}

function fromDisplayValue(field, displayValue, system) {
  if (!Number.isFinite(displayValue)) return displayValue;
  return system === 'us' ? FIELD_SPECS[field].fromUs(displayValue) : displayValue;
}

// Volume : "0.51 L (509 mL)" ou "17.2 fl oz (0.13 gal)"
function formatVolume(liters, system) {
  if (system === 'us') {
    const flOz = VOLUME_CONV.toUs(liters);
    return `${flOz.toFixed(1)} fl oz (${(flOz / FLOZ_PER_GAL).toFixed(2)} gal)`;
  }
  return `${liters.toFixed(2)} L (${(liters * 1000).toFixed(0)} mL)`;
}

// Masse : "0.25 kg (250 g)" ou "8.8 oz (0.55 lb)"
function formatMass(grams, system) {
  if (system === 'us') {
    return `${(grams / G_PER_OZ).toFixed(1)} oz (${(grams / G_PER_LB).toFixed(2)} lb)`;
  }
  return `${(grams / 1000).toFixed(2)} kg (${grams.toFixed(0)} g)`;
}

// Versions courtes (résumé collant, historique, texte copié)
function formatVolumeShort(liters, system) {
  return system === 'us'
    ? `${VOLUME_CONV.toUs(liters).toFixed(1)} fl oz`
    : `${liters.toFixed(2)} L`;
}

function formatMassShort(grams, system) {
  return system === 'us' ? `${(grams / G_PER_OZ).toFixed(1)} oz` : `${grams.toFixed(1)} g`;
}

function formatSugarConc(gPerL, system) {
  return system === 'us'
    ? `${FIELD_SPECS.sconc.toUs(gPerL).toFixed(1)} oz/gal`
    : `${gPerL} g/L`;
}
