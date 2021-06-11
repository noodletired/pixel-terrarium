import { Angle, Radians } from './Angle';

type VectorLike = { x: number, y: number };
type ScalarOrVectorLike = number | VectorLike;

/**
 * Vector
 * A 2D vector number.
 */
export default class Vector implements VectorLike
{
	x: number;
	y: number;
	constructor(public x: number, public y: number);

	get magnitude(): number
	{
		return Math.sqrt(this.x ** 2 + this.y ** 2);
	}

	get angle(): Angle
	{
		return new Radians(Math.atan2(this.y, this.x));
	}

	toString(): string
	{
		return `Vector(${this.x}, ${this.y})`;
	}

	toArray(): [number, number]
	{
		return [this.x, this.y];
	}

	toPlainObject(): VectorLike
	{
		return { x, y } = this;
	}

	/**
	 * FromScalar
	 * Static method to produce a vector from a scalar; sets (x, y) = s.
	 */
	static FromScalar(s: number): Vector
	{
		return new Vector(s, s);
	}

	/**
	 * Vectorise
	 * Helper to turn any argument into a vector.
	 */
	private Vectorise(arg: ScalarOrVectorLike): Vector
	{
		if (arg instanceof Vector)
		{
			return arg;
		}
		else if (typeof arg === 'number')
		{
			return Vector.FromScalar(arg);
		}
		else
		{
			return new Vector(arg.x, arg.y);
		}
	}

	Add(arg: ScalarOrVectorLike): this
	{
		const { x, y } = this.Vectorise(arg);
		this.x += x;
		this.y += y;
		return this;
	}

	Subtract(arg: ScalarOrVectorLike): this
	{
		const { x, y } = this.Vectorise(arg);
		this.x -= x;
		this.y -= y;
		return this;
	}

	Multiply(arg: ScalarOrVectorLike): this
	{
		const { x, y } = this.Vectorise(arg);
		this.x *= x;
		this.y *= y;
		return this;
	}

	Divide(arg: ScalarOrVectorLike): this
	{
		const { x, y } = this.Vectorise(arg);
		this.x /= x;
		this.y /= y;
		return this;
	}

	Equals(arg: ScalarOrVectorLike): boolean
	{
		const { x, y } = this.Vectorise(arg);
		return this.x === x && this.y === y;
	}

	Normalize(): this
	{
		return this.Divide(this.magnitude);
	}

	Dot({ x, y }: VectorLike): number
	{
		return this.x * x + this.y * y;
	}

	Cross({ x, y }: VectorLike): number
	{
		return this.x * y - this.y * x;
	}

	Reverse(): this
	{
		return this.Multiply(-1);
	}

	Inverse(): this
	{
		this.x = 1 / this.x;
		this.y = 1 / this.y;
		return this;
	}

	Abs(): this
	{
		this.x = Math.abs(this.x);
		this.y = Math.abs(this.y);
		return this;
	}

	Zero(): this
	{
		this.x = this.y = 0;
		return this;
	}

	Distance({ x, y }: VectorLike): number
	{
		return Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2);
	}

	Rotate(angle: Angle): this
	{
		const radians = { angle };
		const { x, y } = this;
		const cos = Math.cos(radians);
		const sin = Math.sin(radians);

		this.x = x * cos - y * sin;
		this.y = x * sin + y * cos;

		return this;
	}

	Round(n = 0): this
	{
		const precision = 10 ** n;

		// http://www.dynamicguru.com/javascript/round-numbers-with-precision/
		this.x = ((0.5 + this.x * precision) << 0) / precision;
		this.y = ((0.5 + this.y * precision) << 0) / precision;

		return this;
	}

	Copy(): Vector
	{
		return new Vector(this.x, this.y);
	}
}