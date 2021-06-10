import config from '/@/config';

import { Mask, square3x3 } from '../helpers/MorphologyKernels';
import { Generate2D } from '../helpers/Noise';

import { Cardinals, CardinalsFromMask } from '../types/Cardinals';
import { Tile, TileType } from '../types/Tile';

import type { WorldLayer } from '../types/World';

const width = config.worldWidth;
const height = config.worldHeight;
const aboveKernel = new Mask(1, 3, [1, 1, 0]);
const nextToKernel = square3x3;

export default (land: WorldLayer): WorldLayer =>
{
	const dirt = Mask.From(land.Map(tile => tile.type === 'dirt'));
	const voids = Mask.From(land.Map(tile => tile.type === 'void'));
	const aboveDirt = dirt.Dilate(aboveKernel).Intersect(voids); // extend dirt up into voids
	const nextToDirt = dirt.Dilate(nextToKernel).Intersect(voids); // extend dirt into voids

	const vineMask = Generate2D(width, height, 0.1).GreaterThan(0.5).Intersect(nextToDirt);
	const rootMask = Generate2D(width, height, 0.8).GreaterThan(-0.5).Intersect(aboveDirt)
		.Intersect(vineMask.Complement());

	// Generate roots
	return rootMask.Map((isRoot, i, row, col): Tile =>
	{
		const type: TileType = isRoot ? 'root' :
			vineMask.GetAt(i) ? 'vine' : 'void';

		let cardinals: Cardinals;
		if (type === 'vine')
		{
			cardinals = CardinalsFromMask(vineMask, row, col);
		}
		else
		{
			cardinals = new Cardinals(0);
		}

		return new Tile(type, cardinals);
	});
};