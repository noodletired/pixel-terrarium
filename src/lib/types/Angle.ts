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
	 * Normalises degrees to [0, 360), radians to (-pi, pi]
	 */
	private Normalise(value: number, degrees: boolean): number
	{
		if (degrees)
		{
			value %= 360;
			if (value < 0)
			{
				value += 360;
			}
		}
		else
		{
			const { atan2, sin, cos } = Math;
			value = atan2(sin(value), cos(value));
		}
		return value;
	}

	get degrees(): number
	{
		return this.Normalise(this.value, true);
	}

	set degrees(degrees: number)
	{
		this.value = degrees;
	}

	get radians(): number
	{
		return this.Normalise(this.value / 180.0 * Angle.PI, false);
	}

	set radians(radians: number)
	{
		const degrees = radians * 180.0 / Angle.PI;
		this.value = degrees;
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
		super();
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
		super();
		this.radians = value;
	}
}