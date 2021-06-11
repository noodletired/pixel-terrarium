import { Container } from 'pixi.js';
import config from '/@/config';

import { CreateTileSprite, tileSize } from './Tileset';

import { CardinalsFromMask } from './types/Cardinals';
import { Mask } from './types/Array2D';

import GenerateBack from './generation/Background';
import GenerateFoliage from './generation/Foliage';
import GenerateLand from './generation/Land';

import { windFilter } from './shading/WindFilter';

import type { Tile, TileType, World } from './types/World';

export type { Tile, TileType };

const { tileScale } = config;

/**
 * GenerateWorld
 * Creates a new world from generator functions.
 * @returns a world definition.
 *
 * @todo Add options to generator (e.g. biomes, amplified, etc. like minecraft).
 */
export const GenerateWorld = (): World =>
{
	const layers: World = [];

	// Generate layers
	const back = GenerateBack();
	const land = GenerateLand();
	const foliage = GenerateFoliage(land);
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
};


/**
 * DebugDrawMask
 * Draw a mask to the screen.
 * @param mask Mask to draw.
 * @param type TileType to draw with (purely for visual funs).
 * @param stage Container, destructured from PixiJS Application.
 */
export const DebugDrawMask = (mask: Mask, type: TileType, stage: Container): void =>
{
	stage.removeChildren();

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

		stage.addChild(sprite);
	});
};