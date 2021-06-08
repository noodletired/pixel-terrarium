import type { Mask } from './Array2D';

/**
 * Cardinals
 * Helper class to convert cardinal truthiness to binary string or number.
 * Follows "NESW" convention with N-MSB, W-LSB.
 */
export class Cardinals
{
	north: boolean;
	east: boolean;
	south: boolean;
	west: boolean;

	constructor(binary: string);
	constructor(north: boolean, east: boolean, south: boolean, west: boolean);
	constructor(...args: [string] | [boolean, boolean, boolean, boolean])
	{
		if (args.length === 1)
		{
			const [binary] = args;
			const n = parseInt(binary, 2);
			this.north = !!(n & 1);
			this.east = !!(n & 2);
			this.south = !!(n & 4);
			this.west = !!(n & 8);
		}
		else
		{
			[this.north, this.east, this.south, this.west] = args;
		}
	}

	get asNumber(): number
	{
		return (+this.north << 3) + (+this.east << 2) + (+this.south << 1) + (+this.west << 0);
	}

	get asBinaryString(): string
	{
		const number = this.asNumber;
		const binary = number.toString(2);
		return '0000'.substr(binary.length) + binary;
	}
}

/**
 * CardinalsFromMask
 * Determines cardinal adjacencies for a single tile/field in a Mask.
 * @param mask The Mask to test from.
 * @param row Row of the tile to check.
 * @param col Column of the tile to check.
 * @param boundaryCondition How to treat edges. Defaults to false.
 * @returns Cardinals object.
 */
export const CardinalsFromMask = (
	mask: Mask,
	row: number,
	col: number,
	boundaryCondition: boolean | 'wrap' = false): Cardinals =>
{
	const wrap = boundaryCondition === 'wrap';
	const boundN = row === 0;
	const boundE = col === mask.width - 1;
	const boundS = row === mask.height - 1;
	const boundW = col === 0;
	const iN = boundN ? mask.RowColToIndex(mask.height - 1, col) : mask.RowColToIndex(row - 1, col);
	const iE = boundE ? mask.RowColToIndex(row, 0) : mask.RowColToIndex(row, col + 1);
	const iS = boundS ? mask.RowColToIndex(0, col) : mask.RowColToIndex(row + 1, col);
	const iW = boundW ? mask.RowColToIndex(row, mask.width - 1) : mask.RowColToIndex(row, col - 1);

	const north = (boundN && !wrap) ? !!boundaryCondition : mask.GetAt(iN);
	const east = (boundE && !wrap) ? !!boundaryCondition : mask.GetAt(iE);
	const south = (boundS && !wrap) ? !!boundaryCondition : mask.GetAt(iS);
	const west = (boundW && !wrap) ? !!boundaryCondition : mask.GetAt(iW);

	return new Cardinals(north, east, south, west);
};
