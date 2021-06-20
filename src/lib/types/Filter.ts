import { Filter as PixiFilter, Ticker } from 'pixi.js';

// Add all callbacks to the ticker
const ticker = Ticker.shared;
ticker.add((): void => Filter.registeredFilters.forEach(filter => filter.Update(ticker.deltaTime)));

/**
 * Filter
 * Base class for Filters. Automatically updates with the pixi ticker if an Update method is implemented.
 */
export abstract class Filter
{
	static readonly registeredFilters: Map<string, Filter> = new Map();

	readonly filter: PixiFilter;
	readonly type: string;

	constructor(
		type: string,
		vertexSrc?: string,
		fragmentSrc?: string,
		uniforms?: Record<string, unknown>)
	{
		this.type = type;
		this.filter = new PixiFilter(vertexSrc, fragmentSrc, uniforms);

		Filter.registeredFilters.set(type, this);
	}

	/**
	 * Update
	 * Abstract function, could be used to update uniforms.
	 * @param deltaTime Time passed since last update.
	 */
	abstract Update(deltaTime: number): void;
}