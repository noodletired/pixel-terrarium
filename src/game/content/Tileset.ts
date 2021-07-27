import { Rectangle, Sprite, Texture, utils } from 'pixi.js';
import { loader } from '../engine/Loader';

import config from '/@/config';

import tileNames from '/@/assets/tile-names.json';
import tilesetURL from '/@/assets/tileset.png';

import bitmask11 from '/@/assets/bitmask-11.json'; // l/r/b/h/v use basic
import bitmask13 from '/@/assets/bitmask-13.json'; // No basic, v uses t/b, h uses l/r
import bitmask16 from '/@/assets/bitmask-16.json'; // Full 4-bit arrangement
import bitmask4 from '/@/assets/bitmask-4.json'; // for grass


import windFilter from '../effects/WindFilter';

import type { Cardinals } from '../types/Cardinals';
import type { Filter } from 'pixi.js';
import type { PointLightProperties } from '../types/Light';

export type { Cardinals };
export type { Sprite, Texture, Filter };


export type Tileset = Map<string, Texture[]>;
export type BitmaskTileLookup = Record<string, string | string[]>; // look up one or more tile suffixes based on Cardinals
export type TileType = 'dirt' | 'rock' | 'vine' | 'dark' | 'back' | 'grass' | 'root' | 'ore' | 'void';
export type BitmaskType = '4' | '11' | '13' | '16' | `indexed-${number}` | 'none';

export const tileBitmaskType: Record<TileType, BitmaskType> = {
	dirt: '11',
	rock: '11',
	vine: '16',
	dark: '16',
	back: '16',
	grass: '4',
	root: 'indexed-10',
	ore: 'indexed-1',
	void: 'none'
} as const;

export const tileSize = {
	width: config.tileWidth,
	height: config.tileHeight
} as const;

export const scaledTileSize = {
	width: tileSize.width * config.tileScale,
	height: tileSize.height * config.tileScale
} as const;

export const tileFilters: Record<string, readonly Filter[]> = {
	root: [windFilter],
	grass: [windFilter]
} as const;

export const transparentTiles: Record<string, boolean> = {
	vine: true,
	grass: true,
	root: true,
	void: true
} as const;

export const emissiveTiles: Record<string, PointLightProperties> = {
	ore: { radius: 2, tint: 0x3030BBFF },
	// TODO: add more!
} as const;

// Actual tileset
export const tileset: Tileset = new Map();

/**
 * Load the game tileset.
 * Should only be called once.
 * @returns the tileset export.
 */
export const LoadTileset = (async (): Promise<Tileset> =>
{
	try
	{
		// Load tileset image
		await loader.Enqueue('tileset', tilesetURL);
		tileset.clear();

		const atlas = utils.TextureCache[tilesetURL];
		const cols = Math.floor(atlas.width / tileSize.width);
		const rows = Math.floor(atlas.height / tileSize.height);

		// Populate map from tileNames
		for (let y = 0; y < rows; ++y)
		{
			for (let x = 0; x < cols; ++x)
			{
				const index = y * cols + x;
				const tileName = tileNames[index];
				if (!tileName)
				{
					continue; // skip blank tiles
				}

				const frame = new Rectangle(x * tileSize.width, y * tileSize.height, tileSize.width, tileSize.height);
				const texture = new Texture(atlas.baseTexture, frame);

				const existingData = tileset.get(tileName);
				const setData = !existingData ? [texture] : [...existingData, texture];
				tileset.set(tileName, setData);
			}
		}
	}
	catch (error)
	{
		console.error('Failed to load tileset', error);
	}

	return tileset;
});


/**
 * Look up a/the texture for a tile given type and cardinals.
 * @param type Type of the tile to render.
 * @param cardinals Cardinal truthiness to lookup sprite from bitmask.
 * @returns a/the texture matching the computed bitmask, or Texture.WHITE if type doesn't fit any available bitmasks.
 */
export const GetTextureFromTileset = (type: TileType, cardinals: Cardinals): Texture =>
{
	const maskType = tileBitmaskType[type];

	// Select bitmask
	let bitmask: BitmaskTileLookup;
	switch (maskType)
	{
		case '4':
			bitmask = <BitmaskTileLookup>bitmask4;
			break;
		case '11':
			bitmask = <BitmaskTileLookup>bitmask11;
			break;
		case '13':
			bitmask = <BitmaskTileLookup>bitmask13;
			break;
		case '16':
			bitmask = <BitmaskTileLookup>bitmask16;
			break;
		case maskType.startsWith('indexed') && maskType: {
			const size = parseInt(/indexed-(?<size>\d+)/.exec(maskType)?.groups?.size ?? '0');
			bitmask = <BitmaskTileLookup>{ '0000': [...Array(size).fill(0).map((_, i) => `-${i}`)] };
		} break;
		default:
			return Texture.WHITE; // none
	}

	// Select a tile suffix option
	const bitmaskIndex = cardinals.asBinaryString;
	const bitmaskOptions = bitmask[bitmaskIndex];
	let bitmaskOption: string;
	if (Array.isArray(bitmaskOptions))
	{
		const randomIndex = Math.floor(Math.random() * bitmaskOptions.length);
		bitmaskOption = bitmaskOptions[randomIndex];
	}
	else
	{
		bitmaskOption = bitmaskOptions;
	}

	// Concat the tile type with the option suffix
	const tileName = type + bitmaskOption;
	const tileOptions = tileset.get(tileName);
	if (!tileOptions)
	{
		console.error(`Could not find tile ${tileName} in tileset.`);
		return Texture.WHITE;
	}

	// Select a tile option
	const randomIndex = Math.floor(Math.random() * tileOptions.length);

	return tileOptions[randomIndex];
};