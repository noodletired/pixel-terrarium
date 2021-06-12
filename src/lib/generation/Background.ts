import config from '/@/config';

import { Mask, plus3x3 } from '../helpers/MorphologyKernels';
import { EllipseTest } from '../helpers/MaskShapeTests';
import { Generate2D } from '../helpers/Noise';

import { Tile, TileType } from '../types/Tile';
import { CardinalsFromMask } from '../types/Cardinals';

import type { WorldLayer } from '../types/World';

const width = config.worldWidth;
const height = config.worldHeight;
const reductionKernel = plus3x3;
const cleanupKernels: [Mask, Mask] = [
	new Mask(3, 3, [0, 0, 0, 0, 1, 0, 0, 0, 0]),
	new Mask(3, 3, [0, 1, 0, 1, 0, 1, 0, 1, 0])
];

export default (): WorldLayer =>
{
	const circleMask: Mask = Mask.From(new Mask(width, height, true).Map(EllipseTest(width, height, 0, 0, 0.9, 0.9)));
	let mask: Mask = Generate2D(width, height, [0.9, 0.2])
		.GreaterThan(-0.4)
		.Intersect(circleMask)
		.Erode(reductionKernel);
	mask = mask.HitOrMiss(...cleanupKernels).Complement().Intersect(mask); // remove lonely spots

	return mask.Map((bit, i, row, col): Tile =>
	{
		const type: TileType = bit ? 'back' : 'void';
		const cardinals = CardinalsFromMask(mask, row, col);
		return new Tile(type, cardinals);
	});
};