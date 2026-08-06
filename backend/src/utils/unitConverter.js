/**
 * Normalizes units to a common base to allow netting and math.
 * Standardizes common units (e.g., 'grams', 'g', 'kilograms', 'kg' -> 'g')
 */

const STANDARD_UNITS = {
  // Mass/Weight -> base: 'g'
  g: 'g',
  grams: 'g',
  gram: 'g',
  kg: 'g',
  kilogram: 'g',
  kilograms: 'g',
  oz: 'g',
  ounce: 'g',
  ounces: 'g',
  lbs: 'g',
  lb: 'g',
  pound: 'g',
  pounds: 'g',
  
  // Volume -> base: 'ml'
  ml: 'ml',
  milliliter: 'ml',
  milliliters: 'ml',
  l: 'ml',
  liter: 'ml',
  liters: 'ml',
  cup: 'ml',
  cups: 'ml',
  tbsp: 'ml',
  tablespoon: 'ml',
  tablespoons: 'ml',
  tsp: 'ml',
  teaspoon: 'ml',
  teaspoons: 'ml',
  
  // Count -> base: 'pcs'
  pcs: 'pcs',
  piece: 'pcs',
  pieces: 'pcs',
  unit: 'pcs',
  bottle: 'pcs'
};

// Conversion ratios to base unit
const CONVERSION_RATIOS = {
  // To 'g'
  g: 1,
  grams: 1,
  gram: 1,
  kg: 1000,
  kilogram: 1000,
  kilograms: 1000,
  oz: 28.3495,
  ounce: 28.3495,
  ounces: 28.3495,
  lbs: 453.592,
  lb: 453.592,
  pound: 453.592,
  pounds: 453.592,
  
  // To 'ml'
  ml: 1,
  milliliter: 1,
  milliliters: 1,
  l: 1000,
  liter: 1000,
  liters: 1000,
  cup: 236.588,
  cups: 236.588,
  tbsp: 14.7868,
  tablespoon: 14.7868,
  tablespoons: 14.7868,
  tsp: 4.92892,
  teaspoon: 4.92892,
  teaspoons: 4.92892,
  
  // To 'pcs'
  pcs: 1,
  piece: 1,
  pieces: 1,
  unit: 1,
  bottle: 1
};

/**
 * Normalizes a quantity and unit to a standard base unit.
 * @param {number} qty 
 * @param {string} unit 
 * @returns {{ qty: number, unit: string, isStandardized: boolean }}
 */
exports.normalize = (qty, unit) => {
  if (!unit) return { qty, unit: 'pcs', isStandardized: false };
  
  const lowerUnit = unit.toLowerCase().trim();
  
  if (STANDARD_UNITS[lowerUnit] && CONVERSION_RATIOS[lowerUnit]) {
    const baseUnit = STANDARD_UNITS[lowerUnit];
    const multiplier = CONVERSION_RATIOS[lowerUnit];
    return {
      qty: qty * multiplier,
      unit: baseUnit,
      isStandardized: true
    };
  }
  
  // Return as-is if we don't know the unit
  return { qty, unit: lowerUnit, isStandardized: false };
};
