import { Sprite, Texture } from 'pixi.js';

import {
	GetTextureFromTileset,
	emissiveTiles,
	scaledTileSize,
	tileFilters,
	transparentTiles
} from '../content/Tileset';

import type { Cardinals, TileType } from '../content/Tileset';
import type { PointLight } from './Light';
import type { VectorLike } from './Vector';

export type { Cardinals, TileType };

/**
 * Representation of a game tile.
 */
export class Tile
{
	readonly sprite = new Sprite(Texture.WHITE);
	public isTransparent = false;
	public light: PointLight | null = null;

	private _needsUpdate = true;
	private _position: Readonly<VectorLike>;
	private _type: TileType;
	private _cardinals: Cardinals;

	constructor(position: VectorLike, type: TileType, cardinals: Cardinals)
	{
		this._position = Object.freeze({ ...position }); // copy and make immutable
		this._type = type;
		this._cardinals = cardinals;

		this.Update();
	}

	get type(): TileType
	{
		return this._type;
	}

	set type(type: TileType)
	{
		if (type !== this.type)
		{
			this._needsUpdate = true;
			this._type = type;
		}
	}

	/**
	 * Updates the cardinal definition based on neighbours.
	 */
	UpdateCardinals(cardinals: Cardinals): void
	{
		if (this._cardinals.asNumber !== cardinals.asNumber)
		{
			this._needsUpdate = true;
			this._cardinals = cardinals;
		}
	}

	/**
	 * Updates the sprite texture and position if needed.
	 */
	Update(): void
	{
		if (!this._needsUpdate)
		{
			return;
		}

		const { sprite, _cardinals, _position, _type } = this;
		const { x, y } = _position;

		sprite.texture = GetTextureFromTileset(_type, _cardinals);
		sprite.alpha = 1;
		sprite.filters = [...(tileFilters[_type] ?? [])];
		sprite.width = scaledTileSize.width;
		sprite.height = scaledTileSize.height;
		sprite.position.set(x * scaledTileSize.width, y * scaledTileSize.height);
		// TODO: add event handlers

		this.isTransparent = transparentTiles[_type] ?? false;
		this.light = emissiveTiles[_type] ?? null;

		if (_type === 'void')
		{
			sprite.alpha = 0; // special case
		}

		this._needsUpdate = false;
	}
}
