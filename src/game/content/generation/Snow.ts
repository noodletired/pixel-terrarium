import config from '/@/config';

import { Sprite, Texture } from 'pixi.js';

import { CheckScreenCollision } from '../postprocess/ScreenCollision';

import { RandomScaled } from '/@/game/utilities/Random';

import { COLLIDE_X, COLLIDE_XY, COLLIDE_Y } from '/@/game/types/Collision';
import { ControlledValue, IsControlled } from '/@/game/types/Control';
import { Particle, ParticleCollisionAction } from '/@/game/types/Particle';
import { Vector } from '/@/game/types/Vector';

import type { World } from '/@/game/types/World';


/**
 * Generates an infinitely cyclable particle system to emulate snow.
 * @param world  The World of tiles to use for collision checks.
 * @returns the array of generated Particles. This system only uses primary particles.
 */
export const GenerateSnow = (world: World): Particle[] =>
{
	// Collide with land
	const collideFunc = (newPosition: Vector, particle: Particle): ParticleCollisionAction =>
	{
		if (IsControlled(particle.position))
		{
			return;
		}

		const collision = CheckScreenCollision(world!, particle.position, newPosition);

		// Increase age on collide
		if (collision)
		{
			particle.age *= 1.05;
		}

		switch (collision)
		{
			case COLLIDE_XY:
				return 'constrainXY';
			case COLLIDE_X:
				return 'constrainX';
			case COLLIDE_Y:
				return 'constrainY';
		}
	};

	// Controlled velocity for snow
	const velocityFunc: ControlledValue<Vector> = ({ t, ID }: { t: number, ID: number }) => new Vector(
		Math.sin(t * Math.PI * 4 + ID),
		0.5 + (+`0.${ID}`) // float downwards
	);

	// Controlled opacity to indicate lifespan
	const opacityFunc: ControlledValue<number> = ({ t }: { t: number }) => 1.0 - t;

	// Generate some white square particles
	return Array.from(Array(config.weatherParticleCount)).map(() =>
	{
		const sprite = new Sprite(Texture.WHITE);
		sprite.width = 3;
		sprite.height = 3;

		return new Particle({
			lifetime: 2 * 1000,
			sprite,
			opacity: opacityFunc,
			age: RandomScaled(1000),
			position: new Vector(RandomScaled(config.width), -RandomScaled(config.height)),
			velocity: velocityFunc,
			collisionTest: collideFunc
		});
	});
};