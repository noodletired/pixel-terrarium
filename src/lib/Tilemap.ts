import { Application, Container } from 'pixi.js';

import { SelectTile } from './Tiles';

import { CardinalsFromMask } from './helpers/Cardinals';
import { EllipseTest } from './helpers/MaskShapeTests';
import { Generate2D } from './helpers/Noise';

import type { TileType, Tiles } from './Tiles';
import type { Mask } from './helpers/Array2D';

const width = 5;
const height = 5;
const land = new Container();
const back = new Container();

const landMask: Mask = Generate2D(width, height, 0.1).GreaterThan(0).Map(EllipseTest(width, height));
const rockMask: Mask = Generate2D(width, height, 0.1).GreaterThan(0.1);

/**
 * Redraw
 * Completely updates the stage with new sprites.
 * @param tiles Map of resolved tile options to select from.
 * @param stage Destructured from PixiJS Application.
 */
export const Redraw = (tiles: Tiles, { stage }: Application): void =>
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

		const type: TileType = rockMask.GetAt(i) ? 'rock' : 'dirt';
		const tile = SelectTile(tiles, type, cardinals);
		const cardinals = CardinalsFromMask(landMask, row, col);
		if (!tile)
		{
			console.error('We should always have a land tile...');
			return;
		}

		land.addChild(tile);
	});

	stage.addChild(back, land);
};

export const layers = { land, back };