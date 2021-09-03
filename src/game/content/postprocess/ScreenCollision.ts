import config from '/@/config';

import { COLLIDE_X, COLLIDE_Y, CollideFlags, NO_COLLIDE } from '/@/game/types/Collision';
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


		// super simple approach, we haven't tried to exceed one tile distance
		const { isTransparent } = world.GetAt(currentTile.y, currentTile.x);
		if (isTransparent) // all OK
		{
			return NO_COLLIDE;
		}

		// Check side
		return GetCollisionOrientation(previousTile, currentTile);
	}

	// Else we need to raycast
	// TODO
	return COLLIDE_X | COLLIDE_Y;
};

/**
 * Returns collision flags if a collision between two points is known.
 */
const GetCollisionOrientation = (startTile: Vector, endTile: Vector): CollideFlags =>
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