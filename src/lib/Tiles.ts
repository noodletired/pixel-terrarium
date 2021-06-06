import { Sprite, Texture } from 'pixi.js';

import { Cardinals } from './helpers/Cardinals';
import { tileSize } from './Tileset';

import basicBitmask from '/@/assets/bitmask-4b.json';
import landBitmask from '/@/assets/bitmask-4b-b.json';
import vineBitmask from '/@/assets/bitmask-vine.json';

import type { Tiles } from './Tileset';

export type { Tiles };
export { Sprite, Texture, tileSize };

/**
 * Utility types
 */
export type BitmaskTileLookup = Record<string, string | string[]>;
export type TileType = 'dirt' | 'rock' | 'vine' | 'dark' | 'back' | 'void';
export type MaskType = 'land' | 'basic' | 'vine' | 'void';
const tileMaskType: Record<TileType, MaskType> = {
	dirt: 'land',
	rock: 'land',
	vine: 'vine',
	dark: 'basic',
	back: 'basic',
	void: 'void'
} as const;

/**
 * SelectTile
 * @param tiles Map of tiles, name to Texture.
 * @param type Type of the tile in question.
 * @param cardinals Cardinal truthiness to determine bitmask.
 * @returns a/the texture matching the computed bitmask.
 */
export const SelectTile = (tiles: Tiles, type: TileType, cardinals: Cardinals): Sprite | null =>
{
	const bitmaskIndex = cardinals.asBinaryString;
	const maskType = tileMaskType[type];

	// Select bitmask
	let bitmask: BitmaskTileLookup;
	switch (maskType)
	{
		case 'land':
			bitmask = <BitmaskTileLookup>landBitmask;
			break;
		case 'vine':
			bitmask = <BitmaskTileLookup>vineBitmask;
			break;
		case 'basic':
			bitmask = <BitmaskTileLookup>basicBitmask;
			break;
		default:
			return null; // void
	}

	// Select tile suffix option
	const options = bitmask[bitmaskIndex];
	let option: string;
	if (Array.isArray(options))
	{
		const randomIndex = Math.floor(Math.random() * options.length);
		option = options[randomIndex];
	}
	else
	{
		option = options;
	}

	// Concat the tile type with the option suffix
	const tileName = type + option;
	if (!tiles.has(tileName))
	{
		console.error(`Could not find tile ${tileName} in tiles.`);
		throw new ReferenceError(`Could not find tile ${tileName} in tiles.`);
	}
	return new Sprite(tiles.get(tileName));
};