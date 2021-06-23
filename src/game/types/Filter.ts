import { Filter as PixiFilter } from 'pixi.js';

/**
 * Base class for custom Filters, i.e. WebGL shaders
 * Any imported filters are automatically registered.
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
	 * Abstract function, intended to be used to update uniforms.
	 * @param deltaTime Time passed since last update.
	 */
	abstract Update(deltaTime: number): void;
}