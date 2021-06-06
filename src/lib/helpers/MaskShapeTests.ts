import { Array2DTest } from './Array2D';

/**
 * EllipseTest
 * For a given width and height, tests for an ellipse.
 * @param width Width of the Array2D.
 * @param height Height of the Array2D.
 * @param offsetX Offset the centre x.
 * @param offsetY Offset the centre y.
 * @param scaleX Scale the width.
 * @param scaleY Scale the height.
 * @returns Test function, for use with `Array2D.Map`.
 */
export const EllipseTest = (
	width: number,
	height: number,
	offsetX = 0,
	offsetY = 0,
	scaleX = 1.0,
	scaleY = 1.0
): Array2DTest<unknown> =>
{
	const cx = Math.floor(width / 2) + offsetX;
	const cy = Math.floor(height / 2) + offsetY;
	const a2 = ((width - (cx + 1)) * scaleX) ** 2;
	const b2 = ((height - (cy + 1)) * scaleY) ** 2;

	return (value, i, row, col): boolean =>
	{
		return ((row - cy) ** 2 / b2) + ((col - cx) ** 2 / a2) < 1;
	};
};