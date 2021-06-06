import { Rectangle, Texture, utils } from 'pixi.js';
import { assets } from './PixiApp';
import tileNames from '/@/assets/tile-names.json';
import tilesetURL from '/@/assets/tileset.png';

type Tiles = Map<string, Texture>;
export const tileSize = { width: 5, height: 5 } as const;

// Load tileset
export const tilesPromise = new Promise<Tiles>(resolve =>
{
	assets.add(tilesetURL).load(() =>
	{
		const atlas = utils.TextureCache[tilesetURL];
		const rows = Math.floor(atlas.width / tileSize.width);
		const cols = Math.floor(atlas.height / tileSize.height);

		// Populate tiles map from tileNames
		const tiles: Tiles = new Map();
		for (let y = 0; y < rows; ++y)
		{
			for (let x = 0; x < cols; ++x)
			{
				const index = y * rows + x;
				const tileName = tileNames[index];
				if (!tileName)
				{
					continue; // skip blank tiles
				}

				const frame = new Rectangle(x * tileSize.width, y * tileSize.height, tileSize.width, tileSize.height);
				const texture = new Texture(atlas.baseTexture, frame);
				tiles.set(tileName, texture);
			}
		}

		resolve(tiles);
	});
});

export type { Texture, Tiles };