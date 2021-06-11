/**
 * Angle
 * Utility class to easily manage angles in radians and degrees.
 */
export abstract class Angle
{
	static PI = Math.PI;
	protected value = 0; // store in degrees

	/**
	 * Normalise
	 * Normalises degrees to [0, 360), radians to [-pi, pi)
	 */
	private Normalise(value: number, degrees: boolean): this
	{
		if (degrees)
		{
			this.value %= 360;
			if (this.value < 0)
			{
				this.value += 360;
			}
		}
		else
		{
			const { value: x } = this;
			const { atan2, sin, cos } = Math;
			this.value = atan2(sin(x), cos(x));
		}
	}

	get degrees(): number
	{
		return this.value;
	}

	set degrees(degrees: number): number
	{
		this.value = degrees;
		this.Normalise();
		return this.value;
	}

	get radians(): number
	{
		return this.value / 180.0 * Angle.PI;
	}

	set radians(radians: number): number
	{
		const degrees = radians * 180.0 / Angle.PI;
		this.value = degrees;
		this.Normalise();
		return this.radians;
	}
}


/**
 * Degrees
 * Semantic helper class to construct Angle with degrees.
 */
export class Degrees extends Angle
{
	constructor(value: number)
	{
		this.degrees = value;
	}
}


/**
 * Radians
 * Semantic helper class to construct Angle with radians.
 */
export class Radians extends Angle
{
	constructor(value: number)
	{
		this.radians = value;
	}
}