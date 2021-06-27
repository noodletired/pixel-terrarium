import config from '/@/config';

import { Mask, plus3x3 } from '/@/game/utilities/MorphologyKernels';
import { EllipseTest } from '/@/game/utilities/MaskShapeTests';
import { Generate2D } from '/@/game/utilities/Noise';

import { CardinalsFromMask } from '/@/game/types/Cardinals';
import { Tile } from '/@/game/types/Tile';

import type { WorldLayer, WorldLayerContent } from '/@/game/types/World';

const width = config.worldWidth;
const height = config.worldHeight;
const reductionKernel = plus3x3;
const cleanupKernels: [Mask, Mask] = [
	new Mask(3, 3, [0, 0, 0, 0, 1, 0, 0, 0, 0]),
	new Mask(3, 3, [0, 1, 0, 1, 0, 1, 0, 1, 0])
];

/**
 * Generates background detail for the world.
 * @returns a world layer with background detail.
 */
export const GenerateWorldBackground = (): WorldLayer =>
{
	const circleMask: Mask = Mask.From(new Mask(width, height, true).Map(EllipseTest(width, height, 0, 0, 0.9, 0.9)));
	let mask: Mask = Generate2D(width, height, [0.9, 0.2])
		.GreaterThan(-0.4)
		.Intersect(circleMask)
		.Erode(reductionKernel);
	mask = mask.HitOrMiss(...cleanupKernels).Complement().Intersect(mask); // remove lonely spots

	return mask.Map((bit, i, row, col): WorldLayerContent =>
	{
		if (!bit)
		{
			return null;
		}

		const cardinals = CardinalsFromMask(mask, row, col);
		return new Tile({ x: col, y: row }, 'back', cardinals);
	});
};