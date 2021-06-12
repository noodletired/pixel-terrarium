import { Container, Sprite, Texture } from 'pixi.js';
import config from '/@/config';

import { CreateTileSprite, tileSize } from './Tileset';

import { Bitmap, Clamp, Mask } from './types/Array2D';
import { CardinalsFromMask } from './types/Cardinals';

import GenerateBack from './generation/Background';
import GenerateFoliage from './generation/Foliage';
import GenerateLand from './generation/Land';

import CalculateShadows from './shading/Shadows';
import { windFilter } from './shading/WindFilter';

import type { Tile, TileType, World } from './types/World';

export type { Tile, TileType };

const { tileScale } = config;
const debugContainer = new Container();

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
	const foliage = GenerateFoliage(land);

	const shadows = CalculateShadows(land);
	DebugDrawBitmap(shadows, 20, debugContainer);

	layers.push(back, land, foliage);

	return layers;
};


/**
 * BlitWorld
 * Completely updates the stage with new sprites.
 * @param stage Container, destructured from PixiJS Application.
 */
export const BlitWorld = (world: World, stage: Container): void =>
{
	stage.removeChildren();

	// Draw land
	const layers = world.map((layer): Container =>
	{
		const container = new Container();
		layer.ForEach((tile, i, row, col) =>
		{
			if (tile.type === 'void')
			{
				return; // ignore void tiles
			}

			const sprite = CreateTileSprite(tile.type, tile.cardinals);
			if (!sprite)
			{
				console.error('We should always have a sprite...'); // we handled voids, so why did we hit this?
				return;
			}

			// Position and scale the tile
			sprite.scale.set(tileScale, tileScale);
			sprite.position.set(col * tileScale * tileSize.width, row * tileScale * tileSize.height);

			// Add filters
			if (tile.type === 'root' || tile.type === 'grass')
			{
				sprite.filters = [windFilter];
			}

			container.addChild(sprite);
		});

		return container;
	});

	stage.addChild(...layers);

	// Debug layer
	if (config.debug)
	{
		stage.addChild(debugContainer);
	}
};


/**
 * DebugDrawMask
 * Draw a mask to a contaienr.
 * @param mask Mask to draw.
 * @param type TileType to draw with (purely for visual funs).
 * @param container Container to draw into.
 */
export const DebugDrawMask = (mask: Mask, type: TileType, container: Container): void =>
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
		const sprite = CreateTileSprite(type, cardinals);
		if (!sprite)
		{
			console.error('We should always have a sprite...');
			return;
		}

		// Position and scale the tile
		sprite.scale.set(tileScale, tileScale);
		sprite.position.set(col * tileScale * tileSize.width, row * tileScale * tileSize.height);

		container.addChild(sprite);
	});
};


/**
 * DebugDrawBitmap
 * Draws a grayscale bitmap to a contaienr.
 * @param bitmap Bitmap to draw.
 * @param scaling Multiplier to apply (e.g. if bitmap exceeds 255).
 * @param stage Container to draw into.
 */
export const DebugDrawBitmap = (bitmap: Bitmap, scaling: number, container: Container): void =>
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
		sprite.width = tileSize.width * tileScale;
		sprite.height = tileSize.height * tileScale;
		sprite.position.set(col * tileScale * tileSize.width, row * tileScale * tileSize.height);

		const scaledValue = value * scaling;
		const u8Value = Clamp.UINT8_NOWRAP.Apply(scaledValue) & 0xFF;
		sprite.tint = 0xFF00FF;
		sprite.alpha = (u8Value) / 512;

		container.addChild(sprite);
	});
};