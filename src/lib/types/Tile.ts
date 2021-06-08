import { Cardinals, TileType } from '../Tileset';

export { Cardinals };
export type { TileType };

/**
 * Tile
 * Represents everything a tile needs to be rendered.
 */
export class Tile
{
	constructor(
		readonly type: TileType,
		readonly cardinals: Cardinals
	)
	{}
}
