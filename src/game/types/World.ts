import { Tile, TileType } from './Tile';
import { Array2D } from './Array2D';

export type WorldLayerContent = Tile | null;
export type WorldLayer = Array2D<WorldLayerContent>;

export type World = Array2D<Tile>;

/**
 * Helper to flatten world layers into a single world.
 * The order of layers is important - higher layers override lower.
 * @param layers List of world layers.
 * @returns a combined, flattened world with nulls converted to special 'void' tiles.
 */
export const FlattenWorldLayers = (layers: WorldLayer[]): World =>
{
	const { width, height } = layers[0] ?? { width: 0, height: 0 };

	const world: Tile[] = [];
	for (let row = 0; row < height; ++row)
	{
		for (let col = 0; col < width; ++col)
		{
			let tile = layers.reduce<WorldLayerContent>((tile, layer) => layer.GetAt(row, col) ?? tile, null);
			if (!tile)
			{
				tile = new Tile({ x: col, y: row }, 'void');
			}

			world.push(tile);
		}
	}

	return new Array2D<Tile>(width, height, world);
};


export type { Tile, TileType };