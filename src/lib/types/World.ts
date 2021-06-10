import type { Tile, TileType } from './Tile';
import type { Array2D } from './Array2D';

export type WorldLayer = Array2D<Tile>;
export type World = WorldLayer[];

export type { Tile, TileType };