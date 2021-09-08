const r = Math.random;

/**
 * Generate a random number with some +/- variance (uniform) about a base.
 * @param base  Number to begin at.
 * @param variance  Plus-minus value.
 * @returns a random number near the base.
 */
export const RandomDist = (base: number, variance: number): number => base + (r() * variance) - (variance / 2);

/**
 * Generate a random number between 0 and scale.
 * @param scale  Multiplier.
 * @returns a random number.
 */
export const RandomScaled = (scale: number): number => r() * scale;

/**
 * Generate a random number between two values.
 * @param a  Number to begin at.
 * @param b  Number to end at.
 * @returns a random number between [a, b).
 */
export const RandomBetween = (a: number, b: number): number => r() * Math.abs(b - a) + Math.min(a, b);