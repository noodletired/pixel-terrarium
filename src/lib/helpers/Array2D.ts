/**
 * Array2D
 * A 2D collection.
 */
export type Array2DGenerator<T> = (i?: number, row?: number, col?: number) => T;
export type Array2DTest<T> = (field?: T, i?: number, row?: number, col?: number) => boolean;
export class Array2D<T>
{
	readonly width: number
	readonly height: number;
	protected readonly fields: T[];

	constructor(width: number, height: number, initialiser: T[] | Array2DGenerator<T> | T)
	{
		this.width = width;
		this.height = height;
		this.fields = new Array<T>(width * height);

		// Array type
		if (Array.isArray(initialiser))
		{
			this.fields = initialiser;
		}

		// Function type
		else if (typeof initialiser === 'function')
		{
			let i = 0;
			for (let row = 0; row < height; ++row)
			{
				for (let col = 0; col < width; ++col)
				{
					this.fields[i] = initialiser(i, row, col);
					++i;
				}
			}
		}

		// Value type
		else
		{
			this.fields.fill(initialiser);
		}
	}

	/**
	 * RowColToIndex
	 * Helper to translate a row/column position to a field index.
	 */
	RowColToIndex(row: number, col: number): number
	{
		if (row > this.height || col > this.width || row < 0 || col < 0)
		{
			throw new RangeError(`Row or column indices out of bounds (${row}, ${col})`);
		}
		return row * this.width + col;
	}

	/**
	 * IndexToRowCol
	 * Helper to translate a field index to a row/column position.
	 */
	IndexToRowCol(i: number): { row: number, column: number }
	{
		return {
			row: Math.floor(i / this.width),
			column: i % this.width
		};
	}

	/**
	 * GetAt
	 * Helper to return field value.
	 * Accepts index or row/col format.
	 */
	GetAt(index: number): T;
	GetAt(row: number, col: number): T;
	GetAt(...args: [number] | [number, number]): T
	{
		if (args.length === 1)
		{
			const [i] = args;
			return this.fields[i];
		}
		else
		{
			const [row, col] = args;
			return this.fields[this.RowColToIndex(row, col)];
		}
	}

	/**
	 * Map
	 * Applies a function across every field.
	 * @param Functor Function to apply.
	 * @returns new Array2D with the result.
	 */
	Map<U>(Functor: (field?: T, i?: number, row?: number, col?: number) => U): Array2D<U>
	{
		const fields = new Array<U>(this.width * this.height);
		let i = 0;
		for (let row = 0; row < this.height; ++row)
		{
			for (let col = 0; col < this.width; ++col)
			{
				fields[i] = Functor(this.fields[i], i, row, col);
				++i;
			}
		}

		return new Array2D<U>(this.width, this.height, fields);
	}

	/**
	 * ForEach
	 * Runs a function for every field.
	 * @param Functor Function to apply.
	 */
	ForEach(Functor: (field: T, i?: number, row?: number, col?: number) => U): void
	{
		let i = 0;
		for (let row = 0; row < this.height; ++row)
		{
			for (let col = 0; col < this.width; ++col)
			{
				Functor(this.fields[i], i, row, col);
				++i;
			}
		}
	}

	/**
	 * HasSameSize
	 * Checks if another map matches my size.
	 */
	HasSameSize({ width, height }: Array2D<unknown>): boolean
	{
		return this.width === width && this.height === height;
	}
}


/**
 * Mask
 * A 2D boolean image/mask.
 */
export class Mask extends Array2D<boolean>
{
	/**
	 * Intersect
	 * Produces the binary AND between Masks.
	 * @param rhs Other Mask to compare to.
	 * @returns new Mask with the result.
	 */
	Intersect(rhs: Mask): Mask
	{
		return this.Map((bit, i) => bit && rhs.fields[i]);
	}

	/**
	 * Union
	 * Produces the binary OR of two Masks.
	 * @param rhs Other Mask to compare to.
	 * @returns new Mask with the result.
	 */
	Union(rhs: Mask): Mask
	{
		return this.Map((bit, i) => bit || rhs.fields[i]);
	}
}


/**
 * Bitmap
 * A 2D numeric image.
 */
export class Bitmap extends Array2D<number>
{
	/**
	 * LessThan
	 * Produces the result of a logical less-than operation.
	 * @param rhs Another Bitmap, or a single value to compare to.
	 * @returns a boolean Mask with the result.
	 */
	LessThan(rhs: Bitmap | number): Mask
	{
		if (rhs instanceof Bitmap)
		{
			return this.Map((value, i) => value < rhs.fields[i]);
		}
		else
		{
			return this.Map(value => value < rhs);
		}
	}

	/**
	 * GreaterThan
	 * Produces the result of a logical greater-than operation.
	 * @param rhs Another Bitmap, or a single value to compare to.
	 * @returns a boolean Mask with the result.
	 */
	GreaterThan(rhs: Bitmap | number): Mask
	{
		if (rhs instanceof Bitmap)
		{
			return this.Map((value, i) => value < rhs.fields[i]);
		}
		else
		{
			return this.Map(value => value < rhs);
		}
	}

	/**
	 * Add
	 * Produces the numerical addition of this and another Bitmap or value.
	 * @param rhs Another Bitmap, or a single value to add.
	 * @returns new Bitmap with the result.
	 */
	Add(rhs: Bitmap | number, clamping: Clamp = Clamp.NONE): Bitmap
	{
		if (rhs instanceof Bitmap)
		{
			return this.Map((value, i) => clamping.Clamp(value + rhs.fields[i]));
		}
		else
		{
			return this.Map(value => clamping.Clamp(value + rhs));
		}
	}

	/**
	 * Subtract
	 * Produces the numerical subtration of this and another Bitmap or value.
	 * @param rhs Another Bitmap, or a single value to subtract.
	 * @returns new Bitmap with the result.
	 */
	Subtract(rhs: Bitmap | number, clamping: Clamp = Clamp.NONE): Bitmap
	{
		if (rhs instanceof Bitmap)
		{
			return this.Map((value, i) => clamping.Clamp(value - rhs.fields[i]));
		}
		else
		{
			return this.Map(value => clamping.Clamp(value - rhs));
		}
	}

	/**
	 * Multiply
	 * Produces the element-wise multiplication of this and another Bitmap or value.
	 * @param rhs Another Bitmap, or a single value to multiply with.
	 * @returns new Bitmap with the result.
	 */
	Multiply(rhs: Bitmap | number, clamping: Clamp = Clamp.NONE): Bitmap
	{
		if (rhs instanceof Bitmap)
		{
			return this.Map((value, i) => clamping.Clamp(value * rhs.fields[i]));
		}
		else
		{
			return this.Map(value => clamping.Clamp(value * rhs));
		}
	}
}


/**
 * Clamp
 * Set of rules to Map during clamping.
 */
export class Clamp
{
	static readonly NONE = new Clamp();
	static readonly UINT8 = new Clamp(0, 255, true);
	static readonly INT8 = new Clamp(-128, 127, true);
	static readonly POSITIVE = new Clamp(0);
	static readonly POSITIVE_NONZERO = new Clamp(1);

	constructor(min = -Infinity, max = Infinity, wrap = false)
	{
		this.min = min;
		this.max = max;
		this.wrap = wrap;
	}

	/**
	 * Clamp
	 * Applies clamping rules to a value.
	 * @param value Value to clamp.
	 * @returns clamped value.
	 */
	Clamp(value: number): number
	{
		if (!Number.isFinite(value) || Number.isNaN())
		{
			throw new RangeError(`Value ${value} must be finite and real.`);
		}

		if (this.wrap)
		{
			if (value < this.min)
			{
				return this.max - (this.min - value) % (this.max - this.min);
			}
			else
			{
				return this.min + (value - this.min) % (this.max - this.min);
			}
		}
		else
		{
			return Math.max(this.min, Math.min(this.max, value));
		}
	}
}