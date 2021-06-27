import { BLEND_MODES, Sprite, Texture } from 'pixi.js';

import { GetTextureFromTileset, scaledTileSize } from '../content/Tileset';
import { CardinalsFromMask } from '../types/Cardinals';
import { Clamp } from '../types/Clamp';

import type { Bitmap, Mask } from '../types/Array2D';
import type { Container } from 'pixi.js';
import type { TileType } from '../content/Tileset';

/**
 * Draw a Bitmap to a container as sprites.
 * @param container Container to draw into.
 * @param bitmap Bitmap to draw.
 * @param colorMode Use 'grey' for 0-255 black to white or 'alpha' for 0-1 opacity. Use 'color' if the bitmap is hex coloured (e.g. 0xf89284).
 * @param blendMode Useful for testing different blending types.
 * @param scale Useful for visualising downsampled bitmaps, e.g. for lighting.
 */
export const BlitBitmap = (
	container: Container,
	bitmap: Bitmap,
	colorMode: 'grey'|'alpha'|'rgb'|'rgba',
	blendMode: BLEND_MODES = BLEND_MODES.NORMAL,
	scale = 1
): void =>
{
	// Draw bitmap
	bitmap.ForEach((value, i, row, col) =>
	{
		const sprite = new Sprite(Texture.WHITE);
		sprite.width = scaledTileSize.width * scale;
		sprite.height = scaledTileSize.height * scale;
		sprite.position.set(col * scaledTileSize.width * scale, row * scaledTileSize.height * scale);
		sprite.blendMode = blendMode;

		switch (colorMode)
		{
			case 'grey':
			{
				const u8Value = Clamp.UINT8_NOWRAP.Apply(value) & 0xff;
				sprite.tint = (u8Value << 16) | (u8Value << 8) | u8Value;
				break;
			}
			case 'alpha':
			{
				const u8Value = Clamp.UINT8_NOWRAP.Apply(value);
				sprite.alpha = (u8Value) / 255;
				break;
			}
			case 'rgb':
				sprite.tint = Clamp.RGB.Apply(value & 0xffffff);
				break;
			case 'rgba':
				sprite.tint = Clamp.RGB.Apply((value & 0xffffffff) >> 8 & 0xffffff);
				sprite.alpha = Clamp.UINT8_NOWRAP.Apply(value & 0xff);
				break;
			default:
				break;
		}

		container.addChild(sprite);
	});
};


/**
 * Draw a Mask to a container as sprites. Only 'true' fields are drawn.
 * @param container Container to draw into.
 * @param mask Mask to draw.
 * @param type TileType to draw with (purely for visual funs).
 */
export const BlitMask = (container: Container, mask: Mask, type: TileType = 'void'): void =>
{
	// Draw mask
	mask.ForEach((bit, i, row, col) =>
	{
		if (!bit)
		{
			return; // ignore
		}

		const cardinals = CardinalsFromMask(mask, row, col);
		const sprite = new Sprite(GetTextureFromTileset(type, cardinals));
		if (!sprite)
		{
			console.error('We should always have a sprite...');
			return;
		}

		// Position and scale the tile
		sprite.width = scaledTileSize.width;
		sprite.height = scaledTileSize.height;
		sprite.position.set(col * scaledTileSize.width, row * scaledTileSize.height);

		container.addChild(sprite);
	});
};