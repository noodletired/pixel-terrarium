import { Ticker } from 'pixi.js';

export type FilterUpdateCallback = (deltaTime: number) => void;

/**
 * RegisterUpdateCallback
 * Add a filter to our list of options.
 */
const updateCallbacks = new Map<string, FilterUpdateCallback>();
export const RegisterUpdateCallback = (name: string, callback: FilterUpdateCallback): void =>
{
	updateCallbacks.set(name, callback);
};


// Add all callbacks to the ticker
const ticker = Ticker.shared;
ticker.add((): void => updateCallbacks.forEach(cb => cb(ticker.deltaTime)));