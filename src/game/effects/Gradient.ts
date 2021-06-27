import { ALPHA_MODES, BaseTexture, FORMATS, Resource, Sprite, TARGETS, TYPES, Texture, WRAP_MODES } from 'pixi.js';
import type { GLTexture, Renderer } from 'pixi.js';

// Support type definitions
export type GradientColorStop = [number, string];

/**
 * Create a gradient resource.
 * @see https://pixijs.io/examples/#/textures/gradient-resource.js for example.
 */
export class GradientResource extends Resource
{
	public colorStops: GradientColorStop[];
	private isVertical: boolean;

	constructor(colorStops: GradientColorStop[], isVertical = false, quality = 256)
	{
		// Gradient only needs to be 1 pixel wide/tall
		if (isVertical)
		{
			super(1, quality);
		}
		else
		{
			super(quality, 1);
		}

		this.isVertical = isVertical;
		this.colorStops = colorStops;
	}

	/**
	 * Creates the gradient texture and uploads to GPU.
	 * @implements Resource.upload
	 */
	upload(renderer: Renderer, baseTexture: BaseTexture, glTexture: GLTexture): boolean
	{
		const { width, height } = this;

		// Create a temporary canvas
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;

		const context = canvas.getContext('2d');
		if (!context)
		{
			console.warn('Unable to generate gradient texture: could not create a 2D canvas context.');
			return false;
		}

		const gradient = this.isVertical
			? context.createLinearGradient(0, 0, 0, height)
			: context.createLinearGradient(0, 0, width, 0);
		for (const [stop, color] of this.colorStops)
		{
			gradient.addColorStop(stop, color);
		}

		context.fillStyle = gradient;
		context.fillRect(0, 0, width, height);

		glTexture.width = width;
		glTexture.height = height;

		// Upload the texture to the GPU
		const { gl } = renderer;
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, baseTexture.alphaMode === ALPHA_MODES.UNPACK);
		gl.texImage2D(
			baseTexture.target ?? TARGETS.TEXTURE_2D,
			0,
			baseTexture.format ?? FORMATS.RGBA,
			baseTexture.format ?? FORMATS.RGBA,
			baseTexture.type ?? TYPES.FLOAT,
			canvas
		);

		return true;
	}
}

/**
 * Create a new gradient sprite, automatically generating the resource and base texture.
 */
export class GradientSprite extends Sprite
{
	readonly gradientResource: GradientResource;
	readonly gradientBaseTexture: BaseTexture;
	readonly gradientTexture: Texture;

	constructor(
		colorStops: GradientColorStop[],
		width: number,
		height: number,
		vertical: boolean,
		quality = vertical ? height : width)
	{
		const gradientResource = new GradientResource(colorStops, vertical, quality);
		const gradientBaseTexture = new BaseTexture(gradientResource);
		const gradientTexture = new Texture(gradientBaseTexture);
		super(gradientTexture);

		this.gradientResource = gradientResource;
		this.gradientBaseTexture = gradientBaseTexture;
		this.gradientTexture = gradientTexture;

		this.width = width;
		this.height = height;
	}
}