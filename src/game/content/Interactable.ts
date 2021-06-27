import { Container } from 'pixi.js';
import { renderer } from '../engine';

import { Tile } from '../types/Tile';

import { GenerateWorldFoliage } from './generation/Foliage';
import { GenerateWorldLand } from './generation/Land';

import { FlattenWorldLayers, World } from '../types/World';


// Module locals
const container = new Container();
export let world: World|null = null;


/**
 * Generates and attaches interactable content to renderer.
 */
export const InitialiseInteractables = (): void =>
{
	// Generate the layers
	const landTiles = GenerateWorldLand();
	const foliageTiles = GenerateWorldFoliage(landTiles);

	// Combine the layers
	world = FlattenWorldLayers([landTiles, foliageTiles]);

	// Prepare world for interaction and rendering
	world.ForEach(tile =>
	{
		AttachInteractionEvents(tile);
		container.addChild(tile.sprite);
	});

	// Attach to renderer
	renderer.SetLayer('interactable', container);
};

/**
 * Attaches interaction events to tiles.
 * @param tile The tile to attach events to.
 */
const AttachInteractionEvents = (tile: Tile): void =>
{
	// Ignore voids for now
	if (tile.type === 'void')
	{
		return;
	}

	// TODO: add actual UI/interactions
	tile.sprite.buttonMode = true;
	tile.sprite.interactive = true;
	tile.sprite.on('mouseover', () => tile.sprite.tint = 0xff00ff);
	tile.sprite.on('mouseout', () => tile.sprite.tint = 0xffffff);
};


/**
 * Updates all interactible tiles.
 */
export const UpdateInteractibles = (): void =>
{
	world?.ForEach(tile => tile.Update());
};