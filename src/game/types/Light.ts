import { Clamp } from './Clamp';
import { Vector } from './Vector';

import type { VectorLike } from './Vector';
export type { VectorLike };

/**
 * Interface for non-positional light properties
 */
export interface PointLightProperties
{
	readonly radius: number;
	readonly tint: number;
}

/**
 * Representation of a point lamp.
 */
export class PointLight implements PointLightProperties
{
	readonly position: Vector;
	readonly radius: number; // in tiles
	readonly tint: number;

	constructor(position: VectorLike, properties: PointLightProperties);
	constructor(position: VectorLike, radius: number, tint: number);
	constructor(position: VectorLike, ...args: [number, number] | [PointLightProperties])
	{
		this.position = new Vector(position);

		let radius: number, tint: number;
		if (args.length === 1)
		{
			({ radius, tint } = args[0]);
		}
		else
		{
			([radius, tint] = args);
		}

		this.radius = radius;
		this.tint = new Clamp(0, 0xFFFFFF).Apply(tint);
	}
}


// TODO directional light


// TODO spot light