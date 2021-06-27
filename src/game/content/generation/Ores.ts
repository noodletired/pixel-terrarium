import config from '/@/config';

import { Generate2D } from '/@/game/utilities/Noise';
import { Mask } from '/@/game/utilities/MorphologyKernels';

import { Tile } from '/@/game/types/Tile';

import type { WorldLayer, WorldLayerContent } from '/@/game/types/World';

const width = config.worldWidth;
const height = config.worldHeight;
const validPlacementKernels = [new Mask(1, 3, 1), new Mask(3, 1, 1)];

/**
 * Generates ores for the world.
 * @param land The land layer, to determine where ores can be added.
 * @returns a world layer with only ores.
 */
export const GenerateWorldOres = (land: WorldLayer): WorldLayer =>
{
	const landMask = Mask.From(land.Map(tile => !!tile));
	const rockMask = Mask.From(land.Map(tile => tile?.type === 'rock'));
	const validRockMask = landMask
		.Erode(validPlacementKernels[0])
		.Union(landMask.Erode(validPlacementKernels[1]))
		.Intersect(rockMask);

	const oreMask = Generate2D(width, height, 2.0).GreaterThan(0.75).Intersect(validRockMask);

	// Generate ores
	return oreMask.Map((isOre, i, row, col): WorldLayerContent =>
	{
		if (!isOre)
		{
			return null;
		}

		return new Tile({ x: col, y: row }, 'ore'); // cardinals don't matter
	});
};