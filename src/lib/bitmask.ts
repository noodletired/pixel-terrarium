import { Sprite, Tiles } from './tileset';

import basicBitmask from '/@/assets/bitmask-4b.json';
import landBitmask from '/@/assets/bitmask-4b-b.json';
import vineBitmask from '/@/assets/bitmask-vine.json';

/**
 * Cardinals
 * Helper class to convert cardinal truthiness to bitmask.
 */
export class Cardinals
{
	constructor(
		north: boolean,
		east: boolean,
		south: boolean,
		west: boolean,
	)

	constructor(binary: string)
	{
		const n = parseInt(binary, 2);
		this.north = n & 1;
		this.east = n & 2;
		this.south = n & 4;
		this.west = n & 8;
	}

	get asNumber() : number
	{
		return (this.north << 0) + (this.east << 1) + (this.south << 2) + (this.west << 3);
	}

	get asBinaryString() : string
	{
		const number = this.toNumber();
		return number.toString(2);
	}
}

/**
 * Utility types
 */
export type Bitmask = Record<string, string | string[]>;
export type TileType = 'dirt' | 'rock' | 'vine' | 'dark' | 'back';
export type MaskType = 'land' | 'basic' | 'vine';
readonly const tileMaskType : Record<TileType, MaskType> = {
	dirt: 'land',
	rock: 'land',
	vine: 'vine',
	dark: 'basic',
	back: 'basic'
};

/**
 * SelectTile
 * @param tiles Map of tiles, name to Sprite.
 * @param type Type of the tile in question.
 * @param cardinals Cardinal truthiness to determine bitmask.
 * @returns A/the sprite matching the computed bitmask.
 */
export const SelectTile = (tiles: Tiles, type: TileType, cardinals: Cardinals) : Sprite =>
{
	const bitmaskIndex = cardinals.asBinaryString;
	const maskType = tileMaskType[type];

	// Select bitmask
	let bitmask : Bitmask;
	switch (maskType)
	{
		case 'land':
			bitmask = <Bitmask>landBitmask;
			break;
		case 'vine':
			bitmask = <Bitmask>vineBitmask;
			break;
		case 'basic':
		default:
			bitmask = <Bitmask>basicBitmask;
	}

	// Select tile option
	const options = bitmask[bitmaskIndex];
	let option : string;
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
	return tiles.get(tileName);
};