import { Clamp } from './Clamp';
import { Vector } from './Vector';

import type { VectorLike } from './Vector';
export type { VectorLike };

/**
 * PointLight
 * Representation of a point lamp.
 */
export class PointLight
{
	readonly position: Vector;
	readonly radius: number; // in tiles
	readonly tint: number;

	constructor(position: VectorLike, radius: number, tint: number)
	{
		this.position = new Vector(position);
		this.radius = radius;
		this.tint = new Clamp(0, 0xFFFFFF).Apply(tint);
	}
}


// TODO directional light


// TODO spot light