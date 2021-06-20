import config from '/@/config';

import { Mask, plus3x3 } from '../helpers/MorphologyKernels';
import { EllipseTest } from '../helpers/MaskShapeTests';
import { Generate2D } from '../helpers/Noise';

import { Tile, TileType } from '../types/Tile';
import { CardinalsFromMask } from '../types/Cardinals';

import type { WorldLayer } from '../types/World';

const width = config.worldWidth;
const height = config.worldHeight;
const cleanupKernel = plus3x3;

export default (): WorldLayer =>
{
	const circleMask: Mask = Mask.From(new Mask(width, height, true).Map(EllipseTest(width, height, 0, 0, 0.8, 0.8)));
	const landMask: Mask = Generate2D(width, height, 0.2).GreaterThan(-0.1).Intersect(circleMask).Open(cleanupKernel);
	const rockMask: Mask = Generate2D(width, height, 0.4).GreaterThan(0.1);
	const darkMask: Mask = landMask.Erode(cleanupKernel, false);

	return landMask.Map((bit, i, row, col): Tile =>
	{
		// Select the correct tile
		let type: TileType = bit ? (rockMask.GetAt(i) ? 'rock' : 'dirt') : 'void';
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