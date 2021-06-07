import { Application, Container } from 'pixi.js';

import { SelectTile, tileSize } from './Tiles';

import { CardinalsFromMask } from './helpers/Cardinals';
import { EllipseTest } from './helpers/MaskShapeTests';
import { Generate2D } from './helpers/Noise';
import { Mask } from './helpers/Array2D';

import type { TileType, Tiles } from './Tiles';
import config from '/@/config';

const width = config.worldWidth;
const height = config.worldHeight;
const scale = config.tileScale;
const land = new Container();
const back = new Container();

const cleanupKernel = new Mask(3, 3, [0, 1, 0, 1, 1, 1, 0, 1, 0]);
const circleMask: Mask = Mask.From(new Mask(width, height, true).Map(EllipseTest(width, height, 0, 0, 0.8, 0.8)));
const landMask: Mask = Generate2D(width, height, 0.2).GreaterThan(0).Intersect(circleMask).Open(cleanupKernel);
const rockMask: Mask = Generate2D(width, height, 0.4).GreaterThan(0.4);
const darkMask: Mask = landMask.Erode(cleanupKernel, false);

/**
 * Redraw
 * Completely updates the stage with new sprites.
 * @param tiles Map of resolved tile options to select from.
 * @param stage Container, destructured from PixiJS Application.
 */
export const Redraw = (tiles: Tiles, stage: Container): void =>
{
	stage.removeChildren();
	land.removeChildren();

	// Draw land
	landMask.ForEach((bit, i, row, col) =>
	{
		if (!bit)
		{
			return; // ignore
		}

		// Select the correct tile
		let type: TileType = rockMask.GetAt(i) ? 'rock' : 'dirt';
		let cardinalMask: Mask = landMask;
		if (darkMask.GetAt(i))
		{
			type = 'dark';
			cardinalMask = darkMask;
		}

		const cardinals = CardinalsFromMask(cardinalMask, row, col);
		const tile = SelectTile(tiles, type, cardinals);
		if (!tile)
		{
			console.error('We should always have a land tile...');
			return;
		}

		// Position and scale the tile
		tile.scale.set(scale, scale);
		tile.position.set(col * scale * tileSize.width, row * scale * tileSize.height);

		land.addChild(tile);
	});

	stage.addChild(back, land);
};

/**
 * DebugDrawMask
 * Draw a mask to the screen.
 * @param tiles Map of resolved tile options to select from.
 * @param stage Container, destructured from PixiJS Application.
 */
export const DebugDrawMask = (mask: Mask, tiles: Tiles, type: TileType, stage: Container): void =>
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
		const tile = SelectTile(tiles, type, cardinals);
		if (!tile)
		{
			console.error('We should always have a tile...');
			return;
		}

		// Position and scale the tile
		tile.scale.set(scale, scale);
		tile.position.set(col * scale * tileSize.width, row * scale * tileSize.height);

		stage.addChild(tile);
	});
};

export const layers = { land, back };