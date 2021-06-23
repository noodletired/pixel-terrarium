import { BLEND_MODES, Container, Filter, RenderTexture, Sprite, Texture, filters } from 'pixi.js';
import config from '/@/config';
import { renderer } from '../engine/Renderer';

import { GetTextureFromTileset, scaledTileSize } from './Tileset';

import { Bitmap, Clamp, Mask } from '../types/Array2D';
import { CardinalsFromMask } from '../types/Cardinals';
import { GradientSprite } from '../effects/Gradient';

import GenerateBack from './generation/Background';
import GenerateFoliage from './generation/Foliage';
import GenerateLand from './generation/Land';

import { ComputeGlobalIllumination } from './postprocess/Lighting';

import type { Tile, TileType, World } from '../types/World';
export type { Tile, TileType };

// Debug container
const debugContainer = new Container();

// Lighting
const lightingContainer = new Container();
lightingContainer.filters = [new filters.BlurFilter(10, 2, undefined, 7)];
const lightingRT = RenderTexture.create({ width: config.width, height: config.height });
const lighting = new Sprite(lightingRT);
lighting.blendMode = BLEND_MODES.MULTIPLY;


/**
 * GenerateWorld
 * Creates a new world from generator functions.
 * @returns a world definition.
 * @todo Add options to generator (e.g. biomes, amplified, etc. like minecraft).
 */
export const GenerateWorld = (): World =>
{
	const layers: World = [];

	// Generate layers
	const back = GenerateBack();
	const land = GenerateLand();
	const foliage = GenerateFoliage(land); // TODO: consolidate into "interactions" layer
	// TODO: add particle effects layer

	// TODO: move to an update loop? needs access to 'app.renderer'
	const globalLighting = ComputeGlobalIllumination(land).Multiply(256);
	BlitBitmap(lightingContainer, globalLighting, 'grey', BLEND_MODES.ADD);
	renderer.context.render(lightingContainer, { renderTexture: lightingRT });
	// TODO: blit local lighting

	layers.push(back, land, foliage);

	return layers;
};


/**
 * BlitWorld
 * Completely updates the stage with new sprites.
 * @param stage Container to blit into.
 * @param world World structure to draw.
 */
export const BlitWorld = (stage: Container, world: World): void =>
{
	const background = new GradientSprite([[0, '#2e2833'], [1, '#283d4d']], config.width, config.height, true);

	// Draw land
	const layers = world.map((layer): Container =>
	{
		const container = new Container();
		layer.ForEach(tile => container.addChild(tile.sprite));

		return container;
	});

	stage.addChild(background, ...layers, lighting);

	// Debug layer
	if (config.debug)
	{
		stage.addChild(debugContainer);
	}
};


/**
 * BlitBitmap
 * Draws a grayscale bitmap to a container as sprites.
 * @param container Container to draw into.
 * @param bitmap Bitmap to draw.
 * @param colourMode Use 'grey' for 0-255 black to white or 'alpha' for 0-1 opacity. Use 'color' if the bitmap is hex coloured (e.g. 0xf89284).
 * @param scale Useful for visualising downsampled bitmaps, e.g. for lighting.
 */
export const BlitBitmap = (
	container: Container,
	bitmap: Bitmap,
	colorMode: 'grey'|'alpha'|'color',
	blendMode: BLEND_MODES = BLEND_MODES.NORMAL,
	scale = 1
): void =>
{
	// Draw bitmap
	bitmap.ForEach((value, i, row, col) =>
	{
		if (!value)
		{
			return; // ignore
		}

		const sprite = new Sprite(Texture.WHITE);
		sprite.width = scaledTileSize.width * scale;
		sprite.height = scaledTileSize.height * scale;
		sprite.position.set(col * scaledTileSize.width * scale, row * scaledTileSize.height * scale);
		sprite.blendMode = blendMode;

		if (colorMode === 'grey')
		{
			const u8Value = Clamp.UINT8_NOWRAP.Apply(value) & 0xff;
			sprite.tint = (u8Value << 16) | (u8Value << 8) | u8Value;
		}
		else if (colorMode === 'alpha')
		{
			const u8Value = Clamp.UINT8_NOWRAP.Apply(value);
			sprite.alpha = (u8Value) / 255;
		}
		else
		{
			sprite.tint = new Clamp(0, 0xffffff).Apply(value) & 0xffffff;
		}

		container.addChild(sprite);
	});
};


/**
 * DebugDrawMask
 * Draw a mask to a container.
 * @param mask Mask to draw.
 * @param type TileType to draw with (purely for visual funs).
 * @param container Container to draw into.
 */
export const DebugDrawMask = (container: Container, mask: Mask, type: TileType): void =>
{
	container.removeChildren();

	// Draw mask
	mask.ForEach((bit, i, row, col) =>
	{
		if (!bit)
		{
			return; // ignore
		}

		const cardinals = CardinalsFromMask(mask, row, col);
		const sprite = new Sprite(GetTextureFromTileset(type, cardinals));
		if (!sprite)
		{
			console.error('We should always have a sprite...');
			return;
		}

		// Position and scale the tile
		sprite.width = scaledTileSize.width;
		sprite.height = scaledTileSize.height;
		sprite.position.set(col * scaledTileSize.width, row * scaledTileSize.height);

		container.addChild(sprite);
	});
};


/**
 * DebugDrawBitmap
 * Draws a grayscale bitmap to a container.
 * @param container Container to draw into.
 * @param bitmap Bitmap to draw.
 * @param mode Whether to clamp to 255 or to treat as a hexadecimal.
 * @param scale Useful for visualising downsampled bitmaps, e.g. for lighting.
 * @param filters Applied to the whole container; useful for visualising full-screen effects, e.g. blur.
 */
export const DebugDrawBitmap = (
	container: Container,
	bitmap: Bitmap,
	mode: 'grey'|'color',
	scale = 1,
	filters: Filter[] = []
): void =>
{
	container.removeChildren();

	// Draw bitmap
	bitmap.ForEach((value, i, row, col) =>
	{
		if (!value)
		{
			return; // ignore
		}

		const sprite = new Sprite(Texture.WHITE);
		sprite.width = scaledTileSize.width * scale;
		sprite.height = scaledTileSize.height * scale;
		sprite.position.set(col * scaledTileSize.width * scale, row * scaledTileSize.height * scale);

		if (mode === 'grey')
		{
			const u8Value = Clamp.UINT8_NOWRAP.Apply(value);
			sprite.tint = 0xff00ff;
			sprite.alpha = (u8Value) / 255 * 0.75;
		}
		else
		{
			sprite.tint = new Clamp(0, 0xffffff).Apply(value);
			sprite.alpha = 0.75;
		}

		container.addChild(sprite);
		container.filters = filters;
	});
};