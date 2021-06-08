import { Rectangle, Sprite, Texture, utils } from 'pixi.js';
import { assets } from './PixiApp';

import { Cardinals } from './types/Cardinals';
import config from '/@/config';

import tileNames from '/@/assets/tile-names.json';
import tilesetURL from '/@/assets/tileset.png';

import bitmask11 from '/@/assets/bitmask-11.json'; // l/r/b/h/v use basic
import bitmask13 from '/@/assets/bitmask-13.json'; // No basic, v uses t/b, h uses l/r
import bitmask16 from '/@/assets/bitmask-16.json'; // Full 4-bit arrangement

export { Cardinals };
export type { Sprite, Texture };

export type Tileset = Map<string, Texture>;
export type BitmaskTileLookup = Record<string, string | string[]>; // look up one or more tile suffixes based on Cardinals
export type TileType = 'dirt' | 'rock' | 'vine' | 'dark' | 'back' | 'void';
export type BitmaskType = '11' | '13' | '16' | 'none';

export const tileBitmaskType: Record<TileType, BitmaskType> = {
	dirt: '11',
	rock: '11',
	vine: '13',
	dark: '16',
	back: '16',
	void: 'none'
} as const;
export const tileSize = { width: config.tileWidth, height: config.tileHeight } as const;


// Load tileset
export const tileset = await new Promise<Tileset>(resolve =>
{
	try
	{
		assets.add(tilesetURL).load(() =>
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
					tileset.set(tileName, texture);
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
	const bitmaskIndex = cardinals.asBinaryString;
	const maskType = tileBitmaskType[type];

	// Select bitmask
	let bitmask: BitmaskTileLookup;
	switch (maskType)
	{
		case '11':
			bitmask = <BitmaskTileLookup>bitmask11;
			break;
		case '13':
			bitmask = <BitmaskTileLookup>bitmask13;
			break;
		case '16':
			bitmask = <BitmaskTileLookup>bitmask16;
			break;
		default:
			return null; // none
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
	if (!tileset.has(tileName))
	{
		console.error(`Could not find tile ${tileName} in tileset.`);
		throw new ReferenceError(`Could not find tile ${tileName} in tileset.`);
	}
	return new Sprite(tileset.get(tileName));
};