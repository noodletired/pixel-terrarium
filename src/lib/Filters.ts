import { utils } from 'pixi.js';
import { assets } from './PixiApp';

import noiseURL from '/@/assets/noise.png';

import type { Filter, Texture } from 'pixi.js';

// Load noise texture
export const noiseTexture = await new Promise<Texture>(resolve =>
{
	assets
		.add(noiseURL)
		.load(() => resolve(utils.TextureCache[noiseURL]));
});

export type FilterUpdateCallback = () => void;
export const updateCallbacks = new Map<string, FilterUpdateCallback>();

/**
 * RegisterUpdateCallback
 * Add a filter to our list of options.
 */
export const RegisterUpdateCallback = (name: string, callback: () => void): void =>
{
	updateCallbacks.set(name, callback);
};