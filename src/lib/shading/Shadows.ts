import config from '/@/config';

import { Bitmap, Mask } from '../types/Array2D';
import { CastRay, Vector } from '../helpers/RayTest';
import { Degrees } from '../types/Angle';

import type { WorldLayer } from '../types/World';

const directionalLights = config.worldLights
	.filter(light => light.type === 'directional')
	.map(({ angle }) => new Vector(1000, 0).Rotate(new Degrees(-angle))); // our y-axis is flipped

console.log(directionalLights);

const pointLights = config.worldLights
	.filter(light => light.type === 'point')
	.map(v => new Vector(v));

export default (land: WorldLayer): Bitmap =>
{
	const landMask = Mask.From(land.Map(tile => tile.type !== 'void'));

	// Generate shadows from light positions
	return Bitmap.From(landMask.Map((bit, i, row, col): number =>
	{
		const directionalHitCounts = directionalLights.map(light =>
		{
			const ray = light.Copy().Reverse();  // reverse to get point-to-light
			const { hitCount } = CastRay(landMask, row, col, ray);
			return hitCount;
		});

		const pointHitCounts = pointLights.map(light =>
		{
			const ray = light.Copy().Subtract({ x: col, y: row }); // subtract to get point-to-light
			const { hitCount } = CastRay(landMask, row, col, ray);
			return hitCount;
		});

		// Average: return hitCounts.reduce((acc, val, i, { length }) => acc + val / length);
		// Minimum
		return Math.min(...pointHitCounts, ...directionalHitCounts);
	}));
};