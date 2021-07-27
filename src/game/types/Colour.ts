import { Clamp } from './Clamp';

/**
 * Utility class to handle colour to hex conversion and mixing operations.
 * Uses 8-bit storage.
 */
export class Colour
{
	private static lookupRGBA = ['r', 'g', 'b', 'a'];
	private static lookupRGB = ['r', 'g', 'b'];

	#r = 0;
	#g = 0;
	#b = 0;
	#a = 255;

	get r(): number
	{
		return this.#r;
	}
	set r(r: number): void
	{
		this.#r = Clamp.UINT8_NOWRAP.Apply(r);
	}

	get g(): number
	{
		return this.#g;
	}
	set g(g: number): void
	{
		this.#g = Clamp.UINT8_NOWRAP.Apply(g);
	}

	get b(): number
	{
		return this.#b;
	}
	set b(b: number): void
	{
		this.#b = Clamp.UINT8_NOWRAP.Apply(b);
	}

	get a(): number
	{
		return this.#a;
	}
	set a(a: number): void
	{
		this.#a = Clamp.UINT8_NOWRAP.Apply(a);
	}


	constructor(r: number, g: number, b: number, a?: number);
	constructor(hex: number, alpha?: boolean);
	constructor(...args: [number, number, number] | [number, number, number, number] | [number] | [number, boolean])
	{
		if (args.length <= 2)
		{
			const [hex, useAlpha] = args;
			if (useAlpha !== false) // must be explicit; could be undefined
			{
				this.#r = (hex & 0xff000000) >> 24;
				this.#g = (hex & 0x00ff0000) >> 16;
				this.#b = (hex & 0x0000ff00) >> 8;
				this.#a = (hex & 0x000000ff);
			}
			else
			{
				this.#r = (hex & 0xff0000) >> 16;
				this.#g = (hex & 0x00ff00) >> 8;
				this.#b = (hex & 0x0000ff);
			}
		}
		else
		{
			const [r, g, b, a] = args;
			this.r = r;
			this.g = g;
			this.b = b;
			this.a = a ?? 255;
		}
	}

	/**
	 * Converts to 32-bit hex number.
	 */
	get asRGBA(): number
	{
		const { r, g, b, a } = this;
		return r << 24 | g << 16 | b << 8 | a;
	}

	/**
	 * Converts to 24-bit hex number, discarding alpha.
	 */
	get asRGB(): number
	{
		const { r, g, b } = this;
		return r << 16 | g << 8 | b;
	}

	/**
	 * Converts to 24-bit hex number, premultiplying alpha.
	 */
	get asPMA(): number
	{
		const { a } = this;
		return this.Multiply(a << 24 | a << 16 | a << 8).asRGB;
	}

	/**
	 * Mix two colours additively.
	 * @param colour Either another Colour or hex representation.
	 * @returns a new Colour object.
	 */
	Add(colour: Colour | number): Colour
	{
		if (typeof colour === 'number')
		{
			colour = new Colour(colour, true);
		}

		const clone = new Colour(this.asRGBA);
		Colour.lookupRGBA.forEach(ch => clone[ch] += colour[ch]);
		return clone;
	}

	/**
	 * Mix two colours multiplicatively.
	 * @param colour Either another Colour or hex representation.
	 * @returns a new Colour object.
	 */
	Multiply(colour: Colour | number): Colour
	{
		if (typeof colour === 'number')
		{
			colour = new Colour(colour, true);
		}

		const clone = new Colour(this.asRGBA);
		Colour.lookupRGBA.forEach(ch => clone[ch] *= colour[ch] / 255);
		return clone;
	}

	/**
	 * Mix two colours with blending.
	 * @param colour Either another Colour or hex representation.
	 * @returns a new Colour object.
	 * Adapted from https://stackoverflow.com/a/29321264
	 */
	Blend(colour: Colour | number, factor: number): Colour
	{
		if (typeof colour === 'number')
		{
			colour = new Colour(colour, true);
		}

		const BlendRGB = (a, b, t) => Math.sqrt((1 - factor) * a ** 2 + t * b ** 2); // technically incorrect due to gamma correction
		const BlendAlpha = (a, b, t) => (1 - factor) * a + t * b;

		const clone = new Colour(this.asRGBA);
		Colour.lookupRGB.forEach(ch => clone[ch] = BlendRGB(clone[ch], colour[ch], factor));
		clone.a = BlendAlpha(clone.a, colour.a, factor);
		return clone;
	}

	/**
	 * Creates a new colour with multiplied opacity.
	 * @param factor 0-1, but can be >1 to 'harden'.
	 */
	Fade(factor: number): Colour
	{
		const { r, g, b, a } = this;
		return new Colour(r, g, b, a * factor);
	}
}