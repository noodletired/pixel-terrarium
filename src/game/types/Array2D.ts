import { Clamp } from './Clamp';
import { Vector } from './Vector';

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
 * A generic 2D collection.
 */
export class Array2D<T>
{
	readonly width: number
	readonly height: number;
	readonly fields: T[];

	/**
	 * Construct a 2D collection.
	 * @param width Number of columns in the collection.
	 * @param height Number of rows in the collection.
	 * @param initialiser Can be a single value, flat array of entries, or function returning values.
	 */
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
	 * Helper to translate a row/column position to a field index.
	 * @returns the 1D index.
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
	 * Helper to translate a field index to a row/column position.
	 * @returns 2D row and column indices.
	 */
	IndexToRowCol(i: number): { row: number, column: number }
	{
		return {
			row: Math.floor(i / this.width),
			column: i % this.width
		};
	}

	/**
	 * Helper to return field value.
	 * Accepts 1D index or 2D row/col.
	 * @returns the value at the given position.
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
	 * Applies a function across every field, possibly mapping to another type.
	 * @param Func Function to apply across every field.
	 * @returns new Array2D with the mapped result.
	 */
	Map<U>(Func: (field: T, i: number, row: number, col: number) => U): Array2D<U>
	{
		const fields = new Array<U>(this.width * this.height);
		let i = 0;
		for (let row = 0; row < this.height; ++row)
		{
			for (let col = 0; col < this.width; ++col)
			{
				fields[i] = Func(this.fields[i], i, row, col);
				++i;
			}
		}

		return new Array2D<U>(this.width, this.height, fields);
	}

	/**
	 * Runs a function on every field.
	 * @param Func Function to apply.
	 */
	ForEach(Func: (field: T, i: number, row: number, col: number) => void): void
	{
		let i = 0;
		for (let row = 0; row < this.height; ++row)
		{
			for (let col = 0; col < this.width; ++col)
			{
				Func(this.fields[i], i, row, col);
				++i;
			}
		}
	}

	/**
	 * Checks if another map matches my size.
	 * @returns true if both width and height match.
	 */
	HasSameSize({ width, height }: Array2D<unknown>): boolean
	{
		return this.width === width && this.height === height;
	}

	/**
	 * Cretes a new Array2D flipped about its origin. Useful for kernels.
	 * @param x Mirror about x axis, i.e. --
	 * @param y Mirror about y axis, i.e. |
	 * @returns a new Array2D (or derived class) with the result.
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
 * A 2D boolean image/mask.
 */
export class Mask extends Array2D<boolean>
{
	/**
	 * Construct a mask.
	 * @see Array2D for constructor parameter details.
	 */
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
	 * Creates a new Mask from an acceptably typed Array2D.
	 */
	static From(base: Array2D<boolean>): Mask
	{
		return new Mask(base.width, base.height, base.fields);
	}

	/**
	 * Converts a mask to a different size.
	 * Accepts a relative scale, or absolute width/height.
	 * Nearest neighbour sampling is used.
	 * @returns new Mask with the result.
	 */
	Resize(width: number, height: number): Mask;
	Resize(scale: number): Mask;
	Resize(...args: [number] | [number, number]): Mask
	{
		let width, height;
		if (args.length === 1)
		{
			const [scale] = args;
			width = Math.floor(this.width * scale);
			height = Math.floor(this.height * scale);
		}
		else
		{
			[width, height] = args;
		}

		const colRatio = width / this.width;
		const rowRatio = height / this.height;

		return new Mask(width, height, (i, row, col) =>
		{
			const sampleRow = Math.floor(row / rowRatio);
			const sampleCol = Math.floor(col / colRatio);
			return this.GetAt(sampleRow, sampleCol);
		});
	}

	/**
	 * Produces the binary AND between Masks.
	 * @param rhs Other Mask to compare to.
	 * @returns new Mask with the result.
	 */
	Intersect(rhs: Mask): Mask
	{
		return Mask.From(this.Map((bit, i) => bit && rhs.fields[i]));
	}

	/**
	 * Produces the binary OR of two Masks.
	 * @param rhs Other Mask to compare to.
	 * @returns new Mask with the result.
	 */
	Union(rhs: Mask): Mask
	{
		return Mask.From(this.Map((bit, i) => bit || rhs.fields[i]));
	}

	/**
	 * Inverts every bit.
	 * @returns new Mask with the result.
	 */
	Complement(): Mask
	{
		return Mask.From(this.Map(bit => !bit));
	}

	/**
	 * Produces the morphological erosion result using another Mask as a kernel.
	 * @param kernel Typically a small Mask (3x3) to apply over this Mask.
	 * @param includeEdges Whether an edge is considered 'true' or 'false', default is true.
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
	 * Produces the morphological dilation result using another Mask as a kernel.
	 * @param kernel Typically a small Mask (3x3) to apply over this Mask.
	 * @returns new Mask with the result.
	 */
	Dilate(kernel: Mask): Mask
	{
		return this.Complement().Erode(kernel.Reflect()).Complement();
	}

	/**
	 * Produces the morphological opening result using another Mask as a kernel.
	 * @param kernel Typically a small Mask (3x3) to apply over this Mask.
	 * @returns new Mask with the result.
	 */
	Open(kernel: Mask): Mask
	{
		return this.Erode(kernel).Dilate(kernel);
	}

	/**
	 * Produces the morphological closing result using another Mask as a kernel.
	 * @param kernel Typically a small Mask (3x3) to apply over this Mask.
	 * @returns new Mask with the result.
	 */
	Close(kernel: Mask): Mask
	{
		return this.Dilate(kernel).Erode(kernel);
	}

	/**
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
 * A 2D numeric image.
 */
export class Bitmap extends Array2D<number>
{
	/**
	 * Construct a bitmap.
	 * @see Array2D for constructor parameter details.
	 */
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
	 * Creates a new Bitmap from an acceptably typed Array2D.
	 */
	static From(base: Array2D<number>): Bitmap
	{
		return new Bitmap(base.width, base.height, base.fields);
	}

	/**
	 * Converts a bitmap to a different size.
	 * Accepts a relative scale, or absolute width/height.
	 * Bilinear sampling is used.
	 * @returns new Bitmap with the result.
	 */
	Resize(width: number, height: number): Bitmap;
	Resize(scale: number): Bitmap;
	Resize(...args: [number] | [number, number]): Bitmap
	{
		let width, height;
		if (args.length === 1)
		{
			const [scale] = args;
			width = Math.floor(this.width * scale);
			height = Math.floor(this.height * scale);
		}
		else
		{
			[width, height] = args;
		}

		const colRatio = width / this.width;
		const rowRatio = height / this.height;

		return new Bitmap(width, height, (i, row, col): number =>
		{
			const sample = new Vector(col / colRatio, row / rowRatio);
			const bias = sample.Copy().Fract();
			const xBias = new Vector(1.0 - bias.x, bias.x);
			const yBias = new Vector(1.0 - bias.y, bias.y);
			const min = sample.Copy().Floor();
			const max = min.Copy().Add(1).Clamp(new Vector(), new Vector(this.width - 1, this.height - 1));

			const points = [
				this.GetAt(min.y, min.x), // 0, 0
				this.GetAt(min.y, max.x), // 1, 0
				this.GetAt(max.y, min.x), // 0, 1
				this.GetAt(max.y, max.x)  // 1, 1
			];

			const value = (
				(points[0] * xBias.x * yBias.x) +
				(points[1] * xBias.y * yBias.x) +
				(points[2] * xBias.x * yBias.y) +
				(points[3] * xBias.y * yBias.y)
			);
			return value;
		});
	}

	/**
	 * Produces the result of a logical less-than operation.
	 * @param rhs Another Bitmap, or a single value to compare to.
	 * @returns Mask with the result.
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
	 * Produces the result of a logical greater-than operation.
	 * @param rhs Another Bitmap, or a single value to compare to.
	 * @returns Mask with the result.
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
	 * Produces the numerical addition of this and another Bitmap or value.
	 * @param rhs Another Bitmap, or a single value to add.
	 * @param clamping Optional clamp to apply post-op.
	 * @returns new Bitmap with the result.
	 */
	Add(rhs: Bitmap | number, clamping: Clamp = Clamp.NONE): Bitmap
	{
		if (rhs instanceof Bitmap)
		{
			return Bitmap.From(this.Map((value, i) => clamping.Apply(value + rhs.fields[i])));
		}
		else
		{
			return Bitmap.From(this.Map(value => clamping.Apply(value + rhs)));
		}
	}

	/**
	 * Produces the numerical subtration of this and another Bitmap or value.
	 * @param rhs Another Bitmap, or a single value to subtract.
	 * @param clamping Optional clamp to apply post-op.
	 * @returns new Bitmap with the result.
	 */
	Subtract(rhs: Bitmap | number, clamping: Clamp = Clamp.NONE): Bitmap
	{
		if (rhs instanceof Bitmap)
		{
			return Bitmap.From(this.Map((value, i) => clamping.Apply(value - rhs.fields[i])));
		}
		else
		{
			return Bitmap.From(this.Map(value => clamping.Apply(value - rhs)));
		}
	}

	/**
	 * Produces the element-wise multiplication of this and another Bitmap or value.
	 * @param rhs Another Bitmap, or a single value to multiply with.
	 * @param clamping Optional clamp to apply post-op.
	 * @returns new Bitmap with the result.
	 */
	Multiply(rhs: Bitmap | number, clamping: Clamp = Clamp.NONE): Bitmap
	{
		if (rhs instanceof Bitmap)
		{
			return Bitmap.From(this.Map((value, i) => clamping.Apply(value * rhs.fields[i])));
		}
		else
		{
			return Bitmap.From(this.Map(value => clamping.Apply(value * rhs)));
		}
	}
}