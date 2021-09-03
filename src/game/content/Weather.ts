import { Container, Sprite, Texture } from 'pixi.js';
import config from '/@/config';

// OPTIONAL: try https://github.com/pixijs/pixi-particles
import { renderer } from '../engine';
import { world } from './Interactable';

import { CheckScreenCollision } from './postprocess/ScreenCollision';

import { COLLIDE_X, COLLIDE_XY, COLLIDE_Y, NO_COLLIDE } from '/@/game/types/Collision';
import { ControlledValue, IsControlled } from '/@/game/types/Control';
import { Particle, ParticleCollisionAction } from '/@/game/types/Particle';
import { Vector } from '/@/game/types/Vector';


// Module locals
let particles: Particle[] = [];
const weatherContainer = new Container();

/**
 * Initialises weather particles.
 */
export const InitialiseWeather = (): void =>
{
	if (!world)
	{
		throw new ReferenceError('World must be initialised before computing weather.');
	}

	// Collide with land
	const collideFunc = (newPosition: Vector, particle: Particle): ParticleCollisionAction =>
	{
		if (IsControlled(particle.position))
		{
			return;
		}

		const collision = CheckScreenCollision(world!, particle.position, newPosition);
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
		0.5 + Number(`0.${ID}`) // float downwards
	);
	const opacityFunc: ControlledValue<number> = ({ t }: { t: number }) => 1.0 - t;

	// Generate some very plain particles
	particles = Array.from(Array(config.weatherParticleCount)).map(() =>
	{
		const sprite = new Sprite(Texture.WHITE);
		sprite.width = 3;
		sprite.height = 3;

		return new Particle({
			lifetime: 2 * 1000,
			sprite,
			opacity: opacityFunc,
			age: Math.random() * 1000,
			position: new Vector(Math.random() * config.width, -Math.random() * config.height),
			velocity: velocityFunc,
			collisionTest: collideFunc
		});
	});

	weatherContainer.addChild(...particles.map(particle => particle.sprite));
	renderer.GetLayer('decoration').addChild(weatherContainer);
};

/**
 * Updates the location of all weather particles and computes simple collision.
 * @param world Array2D of Tiles. Opaque tiles are used for collision.
 */
export const UpdateWeather = (dt: number): void =>
{
	particles.forEach(particle =>
	{
		particle.Update(dt);
		if (particle.isDead)
		{
			// reuse it
			particle.age = 0;

			if (!IsControlled(particle.position))
			{
				particle.position.y -= config.height;
			}
		}

		if (!IsControlled(particle.position) && particle.position.y > config.height)
		{
			particle.position.y -= config.height * 1.5;
		}
	});
};
