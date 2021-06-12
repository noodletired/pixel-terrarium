import { Loader, Rectangle, Sprite, Texture, utils } from 'pixi.js';

import { Cardinals } from './types/Cardinals';
import config from '/@/config';

import tileNames from '/@/assets/tile-names.json';
import tilesetURL from '/@/assets/tileset.png';

import bitmask11 from '/@/assets/bitmask-11.json'; // l/r/b/h/v use basic
import bitmask13 from '/@/assets/bitmask-13.json'; // No basic, v uses t/b, h uses l/r
import bitmask16 from '/@/assets/bitmask-16.json'; // Full 4-bit arrangement
import bitmask4 from '/@/assets/bitmask-4.json'; // for grass

export { Cardinals };
export type { Sprite, Texture };

export type Tileset = Map<string, Texture[]>;
export type BitmaskTileLookup = Record<string, string | string[]>; // look up one or more tile suffixes based on Cardinals
export type TileType = 'dirt' | 'rock' | 'vine' | 'dark' | 'back' | 'root' | 'grass' | 'void';
export type BitmaskType = '4' | '11' | '13' | '16' | `indexed-${number}` | 'none';

export const tileBitmaskType: Record<TileType, BitmaskType> = {
	dirt: '11',
	rock: '11',
	vine: '16',
	dark: '16',
	back: '16',
	root: 'indexed-10',
	grass: '4',
	void: 'none'
} as const;
export const tileSize = { width: config.tileWidth, height: config.tileHeight } as const;


// Load tileset
export const tileset = await new Promise<Tileset>(resolve =>
{
	try
	{
		Loader.shared.add(tilesetURL, () =>
		{
			const atlas = utils.TextureCache[tilesetURL];
			const cols = Math.floor(atlas.width / tileSize.width);
			const rows = Math.floor(atlas.height / tileSize.height);

			// Populate map from tileNames
			const tileset: Tileset = new Map();
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

			resolve(tileset);
		});
	}
	catch (error)
	{
		console.error('Failed to load tileset', error);
		resolve(new Map());
	}
});


/**
 * CreateTileSprite
 * @param type Type of the tile to render.
 * @param cardinals Cardinal truthiness to lookup sprite from bitmask.
 * @returns a/the texture matching the computed bitmask, or null if type doesn't fit any available bitmasks.
 */
export const CreateTileSprite = (type: TileType, cardinals: Cardinals): Sprite | null =>
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
			return null; // none
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
		throw new ReferenceError(`Could not find tile ${tileName} in tileset.`);
	}

	// Select a tile option
	const randomIndex = Math.floor(Math.random() * tileOptions.length);

	return new Sprite(tileOptions[randomIndex]);
};