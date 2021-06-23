import { loader } from '../engine/Loader';
import { makeNoise2D } from 'open-simplex-noise';

import { Bitmap, Clamp, IsArray } from '../types/Array2D';
export { Bitmap, Clamp };

import config from '/@/config';
import noiseURL from '/@/assets/noise.png';

import type { Texture } from 'pixi.js';


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
	frequency: number | [number, number],
	scale = 1.0,
	clamping: Clamp = Clamp.NONE,
	normalize = true
): Bitmap =>
{
	const seed = config.debug ? 1 : Date.now();
	const xF = IsArray(frequency) ? frequency[0] : frequency;
	const yF = IsArray(frequency) ? frequency[1] : frequency;
	const Simplex = makeNoise2D(seed);

	return new Bitmap(width, height, (i, row, col) => clamping.Apply(
		Simplex(col * xF, row * yF)) * scale * (normalize ? Math.SQRT2 : 1)
	);
};


// Queue the noise texture for loading
const noiseTexture = loader.Enqueue('noise', noiseURL);

/**
 * Retrieve the noise texture.
 * @returns a Promise for the noise texture.
 */
export const GetNoiseTexture = (): Promise<Texture> =>
{
	return noiseTexture;
};