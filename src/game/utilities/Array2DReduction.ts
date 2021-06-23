import { Array2D } from '../types/Array2D';

/**
 * Extract a subregion of specified size about a point.
 * @param row Centre row.
 * @param col Centre column.
 * @param width Width of subregion.
 * @param height Height of subregion.
 * @returns a subsection of an Array2D of the specified width and height.
 */
export const RectAroundPoint = <T>(
	array2D: Array2D<T>,
	row: number,
	col: number,
	width: number,
	height: number,
	edgeValue: T
): Array2D<T> =>
{
	// Adapted from Mask.Erode
	const kL = -Math.floor(width / 2);
	const kR = Math.ceil(width / 2);
	const kU = -Math.floor(height / 2);
	const kD = Math.ceil(height / 2);

	const fields = new Array<T>(width * height);

	let i = 0;
	for (let kRow = kU; kRow < kD; ++kRow)
	{
		for (let kCol = kL; kCol < kR; ++kCol)
		{
			// Edge condition
			let field: T;
			const testCol = col + kCol;
			const testRow = row + kRow;
			if (testRow < 0 || testRow >= height || testCol < 0 || testCol >= width)
			{
				field = edgeValue;
			}
			else
			{
				field = array2D.GetAt(row + kRow, col + kCol);
			}

			fields[i++] = field;
		}
	}

	return new Array2D<T>(width, height, fields);
};