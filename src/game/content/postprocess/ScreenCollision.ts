import config from '/@/config';

import { COLLIDE_X, COLLIDE_XY, COLLIDE_Y, CollideFlags, NO_COLLIDE } from '/@/game/types/Collision';
import { scaledTileSize } from '../Tileset';

import { Clamp } from '/@/game/types/Clamp';
import type { Vector } from '/@/game/types/Vector';
import type { World } from '/@/game/types/World';

/**
 * Checks screen position vs world tile location for collision, ignoring transparent tiles.
 * @param world  Game world.
 * @param previous  Old position in screen space to test.
 * @param current  New position in screen space to test.
 * @returns a collision indication; 0 indicates no collide.
 */
export const CheckScreenCollision = (world: World, previous: Vector, current: Vector): CollideFlags =>
{
	const { width, height } = config;
	if (current.x >= width || current.y >= height || current.x < 0 || current.y < 0)
	{
		return NO_COLLIDE;
	}

	const previousTile = previous.Copy().Divide({ x: scaledTileSize.width, y: scaledTileSize.height }).Floor(); // x: col, y: row
	const currentTile = current.Copy().Divide({ x: scaledTileSize.width, y: scaledTileSize.height }).Floor(); // x: col, y: row

	// If within one tile distance
	if (currentTile.Distance(previousTile) <= Math.SQRT2)
	{
		const rowClamp = new Clamp(0, world.height - 1);
		const colClamp = new Clamp(0, world.width - 1);

		// check ->x, ->y
		const { x: dx, y: dy } = currentTile.Copy().Subtract(previousTile).Cardinalise();
		const xTile = world.GetAt(rowClamp.Apply(previousTile.y), colClamp.Apply(previousTile.x + dx));
		const yTile = world.GetAt(rowClamp.Apply(previousTile.y + dy), colClamp.Apply(previousTile.x));

		return (!xTile.isTransparent ? COLLIDE_X : 0) | (!yTile.isTransparent ? COLLIDE_Y : 0);
	}

	// Else we need to raycast
	// TODO
	return COLLIDE_X | COLLIDE_Y;
};

/**
 * Checks screen position vs world tile location for collision, ignoring transparent tiles.
 * @param world  Game world.
 * @param previous  Old position in screen space to test.
 * @param current  New position in screen space to test.
 * @returns expected collision location.
 */
export const GetScreenCollisionLocation = (world: World, previous: Vector, current: Vector): Vector =>
{
	const { width, height } = config;
	if (current.x >= width || current.y >= height || current.x < 0 || current.y < 0)
	{
		return new Vector(); // we don't deal with outside collisions
	}

	const previousTile = previous.Copy().Divide({ x: scaledTileSize.width, y: scaledTileSize.height }).Floor(); // x: col, y: row
	const currentTile = current.Copy().Divide({ x: scaledTileSize.width, y: scaledTileSize.height }).Floor(); // x: col, y: row

	// If within one tile distance
	if (currentTile.Distance(previousTile) <= Math.SQRT2)
	{
		const rowClamp = new Clamp(0, world.height - 1);
		const colClamp = new Clamp(0, world.width - 1);

		// check ->x, ->y
		const { x: dx, y: dy } = currentTile.Copy().Subtract(previousTile).Cardinalise();
		const xTile = world.GetAt(rowClamp.Apply(previousTile.y), colClamp.Apply(previousTile.x + dx));
		const yTile = world.GetAt(rowClamp.Apply(previousTile.y + dy), colClamp.Apply(previousTile.x));

		const orientation = (!xTile.isTransparent ? COLLIDE_X : 0) | (!yTile.isTransparent ? COLLIDE_Y : 0);
		switch (orientation)
		{
			case COLLIDE_X:
				return AlignToWorld(current).SetY(previous.y);
			case COLLIDE_Y:
				return AlignToWorld(current).SetX(previous.x);
			case COLLIDE_XY:
				return AlignToWorld(current);
			default:
				throw new Exception('Should never get here if we checked for collision first!');
		}
	}

	// Else we need to raycast
	// TODO
	return current.Copy();
};

/**
 * Returns collision flags if a collision between two points is known.
 */
export const GetCollisionOrientation = (startTile: Vector, endTile: Vector): CollideFlags =>
{
	let flags: CollideFlags = NO_COLLIDE;
	const d = endTile.Copy().Subtract(startTile);
	if (d.x !== 0)
	{
		flags |= COLLIDE_X;
	}

	if (d.y !== 0)
	{
		flags |= COLLIDE_Y;
	}

	return flags;
};

/**
 * Align a vector to the world grid, top-left of tile.
 * @param position  Vector to copy.
 * @returns a new Vector aligned to the world grid (top-left of tile).
 */
export const AlignToWorld = (position: Vector): Vector => position
	.Copy()
	.Divide({ x: scaledTileSize.width, y: scaledTileSize.height }) // x: col, y: row
	.Floor()
	.Multiply({ x: scaledTileSize.width, y: scaledTileSize.height });