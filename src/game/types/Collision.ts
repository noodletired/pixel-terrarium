/**
 * Collision orientations definitions.
 */
export type CollideFlags = number;

export const NO_COLLIDE = 0b00;
export const COLLIDE_X = 0b01;
export const COLLIDE_Y = 0b10;
export const COLLIDE_XY = 0b11;