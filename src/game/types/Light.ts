import { Clamp } from './Clamp';
import { Colour } from './Colour';
import { Vector } from './Vector';

import type { VectorLike } from './Vector';
export type { VectorLike, Colour };

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
	readonly tint: Colour;

	constructor(position: VectorLike, properties: PointLightProperties);
	constructor(position: VectorLike, radius: number, tint: number | Colour);
	constructor(position: VectorLike, ...args: [number, number | Colour] | [PointLightProperties])
	{
		this.position = new Vector(position);

		let radius: number, tint: number;
		if (args.length === 1)
		{
			({ radius, tint } = args[0]);
		}
		else
		{
			[radius] = args;
			if (typeof args[1] === 'number')
			{
				[, tint] = args;
			}
			else
			{
				tint = args[1].asHex;
			}
		}

		this.radius = radius;
		this.tint = new Colour(tint, true);
	}
}


// TODO directional light


// TODO spot light