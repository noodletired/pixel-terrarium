import { CastRay, Vector } from './RayTest';
import { Degrees } from '../types/Angle';
import { Mask } from '../types/Array2D';

describe('RayTest', () =>
{
	test('Top', () =>
	{
		const mask = new Mask(3, 3, [
			...[0, 1, 0],
			...[0, 0, 0],
			...[0, 0, 0]
		]);
		const ray = new Vector(1, 0);
		ray.Rotate(new Degrees(90)); // +90deg should rotate the ray to be Vector(0,1)
		expect(ray.x).toBeLessThanOrEqual(Number.EPSILON);
		expect(ray.y).toBe(1);
		const result = CastRay(mask, 1, 1, ray, true);
		expect(result.hitCount).toBe(1);
	});

	test('TopLeft', () =>
	{
		const mask = new Mask(3, 3, [
			...[0, 1, 0],
			...[1, 0, 0],
			...[0, 0, 0]
		]);
		const ray = new Vector(1, 0);
		ray.Rotate(new Degrees(90 + 45));
		const result = CastRay(mask, 1, 1, ray, true);
		expect(result.hitCount).toBe(1);
	});

	test('TopRight', () =>
	{
		const mask = new Mask(3, 3, [
			...[0, 1, 0],
			...[0, 0, 1],
			...[0, 0, 0]
		]);
		const ray = new Vector(1, 0);
		ray.Rotate(new Degrees(90 - 45));
		const result = CastRay(mask, 1, 1, ray, true);
		expect(result.hitCount).toBe(1);
	});

	test('BottomLeft', () =>
	{
		const mask = new Mask(3, 3, [
			...[0, 0, 0],
			...[1, 0, 0],
			...[0, 1, 0]
		]);
		const ray = new Vector(1, 0);
		ray.Rotate(new Degrees(180 + 45));
		const result = CastRay(mask, 1, 1, ray, true);
		expect(result.hitCount).toBe(1);
	});

	test('BottomRight', () =>
	{
		const mask = new Mask(3, 3, [
			...[0, 0, 0],
			...[0, 0, 1],
			...[0, 1, 0]
		]);
		const ray = new Vector(1, 0);
		ray.Rotate(new Degrees(-45));
		const result = CastRay(mask, 1, 1, ray, true);
		expect(result.hitCount).toBe(1);
	});
});
