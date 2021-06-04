import { Rectangle, Sprite, Texture, utils } from 'pixi.js';
import { assets } from './pixi-app';
import tileNames from '/@/assets/tile-names.json';

export { Sprite, Texture };
export type Tiles = Map<string, Sprite>;

// Load tileset
export const tilesPromise = new Promise<Tiles>(resolve =>
{
	assets.add('tileset.png').load(() =>
	{
		const atlas = utils.TextureCache['tileset.png'];
		const tileSize = { width: 5, height: 5 };
		const rows = Math.floor(atlas.width / tileSize.width);
		const cols = Math.floor(atlas.height / tileSize.height);

		// Populate tiles map from tileNames
		const tiles : Tiles = new Map();
		for (let y = 0; y < rows; ++y)
		{
			for (let x = 0; x < cols; ++x)
			{
				const index = y * rows + x % cols;
				const tileName = tileNames[index];
				if (!tileName)
				{
					continue; // skip blank tiles
				}

				const frame = new Rectangle(x * tileSize.width, y * tileSize.height, tileSize.width, tileSize.height);
				const texture = new Texture(atlas, frame);
				tiles.set(tileName, new Sprite(texture));
			}
		}

		resolve(tiles);
	});
});