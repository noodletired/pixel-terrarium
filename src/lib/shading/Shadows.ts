import config from '/@/config';

import { Bitmap, Mask } from '../types/Array2D';
import { Degrees } from '../types/Angle';
import { PointLight } from '../types/Light';

import { CastRay, Vector } from '../helpers/RayTest';
import { plus3x3 } from '../helpers/MorphologyKernels';

import type { WorldLayer } from '../types/World';


/**
 * ComputeGlobalIllumination
 * Computes global light level/occlusion assuming the world is lit top-down by a very large sun.
 * Rays are checked outward of every point.
 * @param layer Tile layer used to filter and block light.
 * @returns a normalized (0-1) greyscale bitmap of light intensity.
 */
export const ComputeGlobalIllumination = (layer: WorldLayer): Bitmap =>
{
	const wallMask = Mask.From(layer.Map(tile => !tile.isTransparent));
	const skipMask = wallMask.Erode(plus3x3, false); // we can skip enclosed points

	return Bitmap.From(skipMask.Map((skip, i, row, col): number =>
	{
		if (skip) // completely enclosed
		{
			return config.minimumGlobalIllumination;
		}

		return ComputeGlobalLightAtPoint(wallMask, row, col);
	}));
};

/**
 * ComputeGlobalLightAtPoint
 * Traces outward from a point to determine how much global light reaches it.
 * Fast for dense maps - any hit immediately ends the raytrace.
 * @param wallMask Mask indicating wall locations.
 * @param row Row of the point to emit from.
 * @param col Column of the point to emit from.
 * @param quality Number of rays to emit outward, minimum is 3.
 * @param reflextions Number of reflections to allow.
 * @returns a value from 0-1 representing light intensity.
 */
export const ComputeGlobalLightAtPoint = (
	wallMask: Mask,
	row: number,
	col: number,
	quality = config.globalLightQuality,
	reflections = config.globalLightReflections,
	falloff = config.globalLightFalloff
): number =>
{
	const angleStep = 180 / (quality - 1);

	const strengths = [0];
	for (let i = 0; i < quality; ++i) // for each direction step
	{
		let totalLength = 0;
		let ray = new Vector(1000, 0);
		ray.Rotate(new Degrees(angleStep * i));

		for (let r = 0; r <= reflections; ++r) // cast an additional ray for each reflection
		{
			const { hitCount, reflectionAngle, distanceTravelled } = CastRay(wallMask, row, col, ray, true);
			totalLength += distanceTravelled;

			if (hitCount === 0 || totalLength > falloff)
			{
				strengths.push((falloff - totalLength) / falloff); // linear falloff
				break;
			}

			ray = new Vector(1000, 0).Rotate(reflectionAngle); // TODO (optimization): skip cardinal reflections
		}
	}

	return Math.max(...strengths, config.minimumGlobalIllumination);
};


/**
 * ComputePointIllumination
 * Computes a local lightmap from given point lights.
 * @param wallMask Mask indicating occluders.
 * @returns a colour bitmap.
 */
/*export const ComputePointIllumination = (lights: PointLight[], wallMask: Mask): Bitmap =>
{
	// TODO
};
*/