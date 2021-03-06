import config from '/@/config';

import { Mask, square3x3 } from '/@/game/utilities/MorphologyKernels';
import { Generate2D } from '/@/game/utilities/Noise';

import { Cardinals, CardinalsFromMask } from '/@/game/types/Cardinals';
import { Tile, TileType } from '/@/game/types/Tile';

import type { WorldLayer, WorldLayerContent } from '/@/game/types/World';

const width = config.worldWidth;
const height = config.worldHeight;
const rootProbability = config.rootGrassProbability ?? 0.2;
const aboveKernel = new Mask(1, 3, [1, 1, 0]);
const nextToKernel = square3x3;

/**
 * Generates foliage for the world.
 * @param land The land layer, to determine where foliage can be added.
 * @returns a world layer with only foliage.
 */
export const GenerateWorldFoliage = (land: WorldLayer): WorldLayer =>
{
	const dirt = Mask.From(land.Map(tile => tile?.type === 'dirt'));
	const voids = Mask.From(land.Map(tile => !tile));
	const aboveDirt = dirt.Dilate(aboveKernel).Intersect(voids); // extend dirt up into voids
	const nextToDirt = dirt.Dilate(nextToKernel).Intersect(voids); // extend dirt into voids

	const landMask = Mask.From(land.Map(tile => !!tile));
	const vineMask = Generate2D(width, height, 0.1).GreaterThan(0.5).Intersect(nextToDirt);
	const grassMask = Generate2D(width, height, 0.8).GreaterThan(-0.5).Intersect(aboveDirt)
		.Intersect(vineMask.Complement());

	// Generate foliage
	return grassMask.Map((isGrass, i, row, col): WorldLayerContent =>
	{
		const isRoot = Math.random() < rootProbability; // 20% chance for roots
		const type: TileType = isGrass ? (isRoot ? 'root' : 'grass') :
			vineMask.GetAt(i) ? 'vine' : 'void';

		let cardinals: Cardinals;
		if (type === 'vine')
		{
			cardinals = CardinalsFromMask(vineMask, row, col);
		}
		else if (type === 'grass')
		{
			cardinals = CardinalsFromMask(landMask, row + 1, col);
		}
		else if (type === 'root')
		{
			cardinals = new Cardinals(0);
		}
		else
		{
			return null;
		}

		return new Tile({ x: col, y: row }, type, cardinals);
	});
};