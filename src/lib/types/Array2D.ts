import { Clamp } from './Clamp';
export { Clamp };

// Helper types
export type Array2DGenerator<T> = (i: number, row: number, col: number) => T;
export type Array2DTest<T> = (field: T, i: number, row: number, col: number) => boolean;

// Helper functions
export const IsGenerator = (arg: unknown): arg is Array2DGenerator<unknown> => typeof arg === 'function';
export const IsArray = Array.isArray;
export const IsPrimitive = (arg: unknown): boolean =>
{
	const type = typeof arg;
	return type === 'string' || type === 'boolean' || type === 'number';
};

/**
 * Array2D
 * A 2D collection.
 */
export class Array2D<T>
{
	readonly width: number
	readonly height: number;
	readonly fields: T[];

	constructor(width: number, height: number, initialiser: T | T[] | Array2DGenerator<T>)
	{
		this.width = width;
		this.height = height;
		this.fields = new Array<T>(width * height);

		// Array type
		if (IsArray(initialiser))
		{
			this.fields = initialiser;
		}
		// Function type
		else if (IsGenerator(initialiser))
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
		// Value type, unsupported
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
		if (row >= this.height || col >= this.width || row < 0 || col < 0)
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
	Map<U>(Functor: (field: T, i: number, row: number, col: number) => U): Array2D<U>
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
	ForEach(Functor: (field: T, i: number, row: number, col: number) => void): void
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

	/**
	 * Reflect
	 * Flips about its origin. Useful for kernels.
	 * @param x Mirror about x axis, i.e. --
	 * @param y Mirror about y axis, i.e. |
	 * @returns new Mask with the result.
	 */
	Reflect(x = true, y = true): this
	{
		const Constructor = (this.constructor as any); // eslint-disable-line
		if (x && y)
		{
			return new Constructor(this.width, this.height, [...this.fields].reverse());
		}
		else if (x)
		{
			const fields: T[] = [];
			for (let row = 0; row < this.height; ++row)
			{
				const rowStart = row * this.width;
				fields.push(...this.fields.slice(rowStart, rowStart + this.width).reverse());
			}
			return new Constructor(this.width, this.height, fields);
		}
		else
		{
			const fields: T[] = new Array<T>(this.fields.length);
			for (let col = 0; col < this.width; ++col)
			{
				for (let row = this.height - 1; row >= 0; --row)
				{
					const i = row * this.width + col;
					const j = (this.height - row - 1) * this.width + col;
					fields[j] = this.fields[i];
				}
			}
			return new Constructor(this.width, this.height, fields);
		}
	}
}


/**
 * Mask
 * A 2D boolean image/mask.
 */
export class Mask extends Array2D<boolean>
{
	constructor(
		width: number,
		height: number,
		initialiser: boolean|number | boolean[]|number[] | Array2DGenerator<boolean>
	)
	{
		// Array type
		if (IsArray(initialiser))
		{
			super(width, height, initialiser.map(value => !!value));
		}
		// Function type
		else if (IsGenerator(initialiser))
		{
			super(width, height, initialiser);
		}
		// Value type
		else
		{
			super(width, height, !!initialiser);
		}
	}

	/**
	 * From
	 * Converts an Array2D to a Mask.
	 * @param base
	 * @returns
	 */
	static From(base: Array2D<boolean>): Mask
	{
		return new Mask(base.width, base.height, base.fields);
	}

	/**
	 * Intersect
	 * Produces the binary AND between Masks.
	 * @param rhs Other Mask to compare to.
	 * @returns new Mask with the result.
	 */
	Intersect(rhs: Mask): Mask
	{
		return Mask.From(this.Map((bit, i) => bit && rhs.fields[i]));
	}

	/**
	 * Union
	 * Produces the binary OR of two Masks.
	 * @param rhs Other Mask to compare to.
	 * @returns new Mask with the result.
	 */
	Union(rhs: Mask): Mask
	{
		return Mask.From(this.Map((bit, i) => bit || rhs.fields[i]));
	}

	/**
	 * Complement
	 * Inverts every bit.
	 * @returns new Mask with the result.
	 */
	Complement(): Mask
	{
		return Mask.From(this.Map(bit => !bit));
	}

	/**
	 * Erode
	 * Produces the morphological erosion result using another Mask as a kernel.
	 * @param kernel Typically a small Mask (3x3) to apply over this Mask.
	 * @returns new Mask with the result.
	 */
	Erode(kernel: Mask, includeEdges = true): Mask
	{
		const kL = -Math.floor(kernel.width / 2);
		const kR = Math.ceil(kernel.width / 2);
		const kU = -Math.floor(kernel.height / 2);
		const kD = Math.ceil(kernel.height / 2);

		return Mask.From(this.Map((bit, i, row, col): boolean =>
		{
			for (let kRow = kU; kRow < kD; ++kRow)
			{
				for (let kCol = kL; kCol < kR; ++kCol)
				{
					const kernelBit = kernel.GetAt(kRow - kU, kCol - kL);
					if (!kernelBit) // ignore zeros in kernel
					{
						continue;
					}

					// Edge condition
					let testBit: boolean;
					const testCol = col + kCol;
					const testRow = row + kRow;
					if (testRow < 0 || testRow >= this.height || testCol < 0 || testCol >= this.width)
					{
						testBit = includeEdges;
					}
					else
					{
						testBit = this.GetAt(row + kRow, col + kCol);
					}

					// Exit early if any bit under the kernel is false
					if (!testBit)
					{
						return false;
					}
				}
			}
			return true;
		}));
	}

	/**
	 * Dilate
	 * Produces the morphological dilation result using another Mask as a kernel.
	 * @param kernel Typically a small Mask (3x3) to apply over this Mask.
	 * @returns new Mask with the result.
	 */
	Dilate(kernel: Mask): Mask
	{
		return this.Complement().Erode(kernel.Reflect()).Complement();
	}

	/**
	 * Open
	 * Produces the morphological opening result using another Mask as a kernel.
	 * @param kernel Typically a small Mask (3x3) to apply over this Mask.
	 * @returns new Mask with the result.
	 */
	Open(kernel: Mask): Mask
	{
		return this.Erode(kernel).Dilate(kernel);
	}

	/**
	 * Close
	 * Produces the morphological closing result using another Mask as a kernel.
	 * @param kernel Typically a small Mask (3x3) to apply over this Mask.
	 * @returns new Mask with the result.
	 */
	Close(kernel: Mask): Mask
	{
		return this.Dilate(kernel).Erode(kernel);
	}

	/**
	 * HitOrMiss
	 * Applies the morphological hit-or-miss transform with two disjoint kernels.
	 * @param hitKernel Mask to include.
	 * @param missKernel Mask to exclude.
	 */
	HitOrMiss(hitKernel: Mask, missKernel: Mask = hitKernel.Complement()): Mask
	{
		return this.Erode(hitKernel).Intersect(this.Complement().Erode(missKernel));
	}
}


/**
 * Bitmap
 * A 2D numeric image.
 */
export class Bitmap extends Array2D<number>
{
	constructor(
		width: number,
		height: number,
		initialiser: boolean|number | boolean[]|number[] | Array2DGenerator<number>
	)
	{
		// Array type
		if (IsArray(initialiser))
		{
			super(width, height, initialiser.map(value => +value));
		}
		// Function type
		else if (IsGenerator(initialiser))
		{
			super(width, height, initialiser);
		}
		// Value type
		else
		{
			super(width, height, +initialiser);
		}
	}

	/**
	 * From
	 * Converts an Array2D to a Mask.
	 * @param base
	 * @returns
	 */
	static From(base: Array2D<number>): Bitmap
	{
		return new Bitmap(base.width, base.height, base.fields);
	}

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
			return Mask.From(this.Map((value, i) => value < rhs.fields[i]));
		}
		else
		{
			return Mask.From(this.Map(value => value < rhs));
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
			return Mask.From(this.Map((value, i) => value > rhs.fields[i]));
		}
		else
		{
			return Mask.From(this.Map(value => value > rhs));
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
			return Bitmap.From(this.Map((value, i) => clamping.Clamp(value + rhs.fields[i])));
		}
		else
		{
			return Bitmap.From(this.Map(value => clamping.Clamp(value + rhs)));
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
			return Bitmap.From(this.Map((value, i) => clamping.Clamp(value - rhs.fields[i])));
		}
		else
		{
			return Bitmap.From(this.Map(value => clamping.Clamp(value - rhs)));
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
			return Bitmap.From(this.Map((value, i) => clamping.Clamp(value * rhs.fields[i])));
		}
		else
		{
			return Bitmap.From(this.Map(value => clamping.Clamp(value * rhs)));
		}
	}
}