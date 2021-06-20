import { Angle, Degrees, Vector } from '../types/Vector';

import type { Mask } from '../types/Array2D';

export { Vector };

/**
 * CastResult
 * Interface describing return type of CastRay.
 */
export interface CastResult
{
	hitCount: number,
	firstHitDistance: number,
	reflectionAngle: Angle,
	lastHitDistance: number,
	distanceTravelled: number
}

/**
 * CastRay
 * Casts a ray from a point on a mask until it hits maxLength or mask edge.
 * Adapted from C here: https://lodev.org/cgtutor/raycasting.html
 * @param mask Mask to test. 1/true represents a wall; 0/false represents free space.
 * @param startRow Row to start at.
 * @param startCol Col to start at.
 * @param ray Vector of length and angle to test at.
 * @param stopEarly Quit after first hit.
 * @param maxSteps Limits the number of steps in case there is an infinite-length ray.
 * @returns a cast result.
 */
export const CastRay = (
	mask: Mask,
	startRow: number,
	startCol: number,
	ray: Vector,
	stopEarly = false,
	maxSteps = 100
): CastResult =>
{
	const { width, height } = mask;
	const maxLength = ray.magnitude;

	const startPosition = new Vector(startCol, startRow);
	const position = startPosition.Copy();

	const direction = ray.Copy().Normalise().ReverseY(); // +y in a mask is down
	const step = direction.Copy().Cardinalise(); // x/y direction of ray
	const deltaDist = direction.Copy().Inverse().Abs(); // full-cell step
	const sideDist = deltaDist.Copy().Multiply(0.5); // half-cell step

	const results: CastResult = {
		hitCount: 0,
		firstHitDistance: 0,
		reflectionAngle: new Degrees(0),
		lastHitDistance: 0,
		distanceTravelled: 0
	};

	let length = 0;
	let side = 0; // 0: x-side, 1: y-side
	for (let i = 0; (i < maxSteps && length < maxLength); ++i)
	{
		// Increment x or y depending on which is currently closest
		if (sideDist.x < sideDist.y)
		{
			sideDist.x += deltaDist.x;
			position.x += step.x;
			side = 0;
		}
		else
		{
			sideDist.y += deltaDist.y;
			position.y += step.y;
			side = 1;
		}
		results.distanceTravelled = length = position.Distance(startPosition);

		// Check boundaries
		if (position.x < 0 || position.y < 0 || position.x >= width || position.y >= height)
		{
			break;
		}

		// Check mask
		if (mask.GetAt(position.y, position.x))
		{
			if (results.hitCount === 0)
			{
				results.firstHitDistance = length;
				results.reflectionAngle = (side === 0) ? ray.Copy().ReverseX().angle : ray.Copy().ReverseY().angle;
			}

			results.lastHitDistance = length;
			results.hitCount++;

			if (stopEarly)
			{
				break;
			}
		}
	}

	return results;
};