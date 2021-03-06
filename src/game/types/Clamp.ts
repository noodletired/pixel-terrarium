/**
 * Set of min/max rules to apply to numeric values.
 */
export class Clamp
{
	static readonly NONE = new Clamp();
	static readonly UINT8 = new Clamp(0, 255, true);
	static readonly UINT8_NOWRAP = new Clamp(0, 255);
	static readonly INT8 = new Clamp(-128, 127, true);
	static readonly INT8_NOWRAP = new Clamp(-128, 127);
	static readonly RGB = new Clamp(0, 0xFFFFFF);
	static readonly RGBA = new Clamp(0, 0xFFFFFFFF);
	static readonly POSITIVE = new Clamp(0);
	static readonly POSITIVE_NONZERO = new Clamp(1);

	min: number;
	max: number;
	wrap: boolean;

	constructor(min = -Infinity, max = Infinity, wrap = false)
	{
		this.min = min;
		this.max = max;
		this.wrap = wrap;
	}

	/**
	 * Applies clamping rules to a value.
	 * @param value Value to clamp.
	 * @returns clamped value.
	 */
	Apply(value: number): number
	{
		if (!Number.isFinite(value) || Number.isNaN(value))
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

	/**
	 * Applies clamping, but first rescales values.
	 * @param min Minimum of the value's expected range.
	 * @param max Maximum of the value's expected range.
	 * @retuns rescaled, clamped value.
	 */
	Rescale(value: number, min: number, max: number): number
	{
		// Convert value to 0-1 in its expected range.
		const normalisedValue = (value - min) / (max - min);
		const rescaledValue = normalisedValue * (this.max - this.min) + this.min;
		return this.Apply(rescaledValue);
	}
}