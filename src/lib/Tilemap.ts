import { Application, Container } from 'pixi.js';

import { SelectTile, tileSize } from './Tiles';

import { CardinalsFromMask } from './helpers/Cardinals';
import { EllipseTest } from './helpers/MaskShapeTests';
import { Generate2D } from './helpers/Noise';
import { Mask } from './helpers/Array2D';

import type { TileType, Tiles } from './Tiles';
import config from '/@/config';

const width = 5;
const height = 5;
const land = new Container();
const back = new Container();

const landMask: Mask = Mask.From(Generate2D(width, height, 0.1).GreaterThan(0).Map(EllipseTest(width, height)));
const rockMask: Mask = Generate2D(width, height, 0.4).GreaterThan(0.3);

/**
 * Redraw
 * Completely updates the stage with new sprites.
 * @param tiles Map of resolved tile options to select from.
 * @param stage Container, destructured from PixiJS Application.
 */
export const Redraw = (tiles: Tiles, { stage }: Application): void =>
{
	const scale = config.tileScale;

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
		const cardinals = CardinalsFromMask(landMask, row, col);
		const tile = SelectTile(tiles, type, cardinals);
		if (!tile)
		{
			console.error('We should always have a land tile...');
			return;
		}

		tile.scale.set(scale, scale);
		tile.position.set(col * scale * tileSize.width, row * scale * tileSize.height);

		land.addChild(tile);
	});

	stage.addChild(back, land);
};

export const layers = { land, back };