import config from '/@/config';

import { Mask, plus3x3 } from '/@/game/utilities/MorphologyKernels';
import { EllipseTest } from '/@/game/utilities/MaskShapeTests';
import { Generate2D } from '/@/game/utilities/Noise';

import { Tile, TileType } from '/@/game/types/Tile';
import { CardinalsFromMask } from '/@/game/types/Cardinals';

import type { WorldLayer, WorldLayerContent } from '/@/game/types/World';

const width = config.worldWidth;
const height = config.worldHeight;
const cleanupKernel = plus3x3;

/**
 * Generates land for the world.
 * @returns a world layer with land, including 'rock', 'stone' and 'dark' tiles.
 */
export const GenerateWorldLand = (): WorldLayer =>
{
	const circleMask: Mask = Mask.From(new Mask(width, height, true).Map(EllipseTest(width, height, 0, 0, 0.8, 0.8)));
	const landMask: Mask = Generate2D(width, height, 0.2).GreaterThan(-0.1).Intersect(circleMask).Open(cleanupKernel);
	const rockMask: Mask = Generate2D(width, height, 0.4).GreaterThan(0.1);
	const darkMask: Mask = landMask.Erode(cleanupKernel, false);

	return landMask.Map((bit, i, row, col): WorldLayerContent =>
	{
		if (!bit)
		{
			return null;
		}

		// Select the correct tile
		let type: TileType = rockMask.GetAt(i) ? 'rock' : 'dirt';
		let cardinalMask: Mask = landMask;
		if (darkMask.GetAt(i))
		{
			type = 'dark';
			cardinalMask = darkMask;
		}

		const cardinals = CardinalsFromMask(cardinalMask, row, col);
		return new Tile({ x: col, y: row }, type, cardinals);
	});
};