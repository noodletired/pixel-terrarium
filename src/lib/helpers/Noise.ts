import { makeNoise2D } from 'open-simplex-noise';

import { Bitmap, Clamp } from './Array2D';

/**
 * Generate2D
 * Creates a 2D boolean bitmask indicating
 * @param width Map width.
 * @param height Map height.
 * @param frequency Noise frequency (lower produces smoother noise).
 * @param scale Noise scale (range defaults to [-1, 1], i.e. *1).
 * @param clamping Provides value clamping; see Array2D for info on how to use.
 * @param normalize Whether to perform the initial unscaling from +/-0.707 to 1.
 */
export const Generate2D = (
	width: number,
	height: number,
	frequency: number,
	scale = 1.0,
	clamping: Clamp = Clamp.NONE,
	normalize = true
): Bitmap =>
{
	const seed = Date.now();
	const Simplex = makeNoise2D(seed);

	return new Bitmap(width, height, (i, row, col) => clamping.Clamp(
		Simplex(col * frequency, row * frequency)) * scale * (normalize ? Math.SQRT2 : 1)
	);
};