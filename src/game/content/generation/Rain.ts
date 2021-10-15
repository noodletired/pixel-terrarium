import config from '/@/config';

import { Container, Sprite, Texture } from 'pixi.js';

import { CheckScreenCollision, GetScreenCollisionLocation } from '../postprocess/ScreenCollision';

import { RandomBetween, RandomDist, RandomScaled } from '/@/game/utilities/Random';

import { COLLIDE_X, COLLIDE_XY, COLLIDE_Y } from '/@/game/types/Collision';
import { ControlledValue, IsControlled } from '/@/game/types/Control';
import { Degrees, Vector } from '/@/game/types/Vector';
import { Particle, ParticleCollisionAction } from '/@/game/types/Particle';

import type { World } from '/@/game/types/World';


/**
 * Generates an infinitely cyclable particle system to emulate rain.
 * @param world  The World of tiles to use for collision checks.
 * @param container  The rendering container to attach secondary particle sprites to if necessary.
 * @returns the array of initially generated Particles (primary particles). Is modified later to include secondary particles for updates.
 */
export const GenerateRain = (world: World, container: Container): Particle[] =>
{
	// Controlled velocity (terminal) in a given direction
	const ANGLE_BASE = 60;
	const ANGLE_VARIANCE = 4;
	const STRENGTH = 10;
	const velocityFunc: ControlledValue<Vector> = ({ ID }: { ID: number }) => new Vector(1, 0)
		.Rotate(new Degrees(ANGLE_BASE + Math.cos(ID) * ANGLE_VARIANCE)) // +/- 4deg
		.Multiply(STRENGTH + (+`0.${ID}`));

	// Set rotation to direction of travel
	const rotationFunc: ControlledValue<number> = (particle: Particle) =>
	{
		const { velocity } = particle;
		return (IsControlled(velocity) ? velocity(particle) : velocity).angle.radians + Math.PI; // flip 180 to make sure it disappears upon landing
	};

	// Controlled opacity to indicate lifespan
	const opacityFunc: ControlledValue<number> = ({ t }: { t: number }) => (1.0 - t) * 0.5;

	// Splash particle pool to pull from
	const splashParticles = Array.from(Array(config.weatherSecondaryParticleCount))
		.map((): { inUse: boolean, particle: Particle } =>
		{
			const sprite = new Sprite(Texture.WHITE);
			sprite.width = 2;
			sprite.height = 2;

			const splash = {
				inUse: false,
				particle: new Particle({
					lifetime: RandomBetween(5, 10),
					sprite,
					opacity: opacityFunc,
					rotation: rotationFunc,
					deathAction(particle: Particle): void // self-reset
					{
						container.removeChild(particle.sprite);
						particles.splice(particles.indexOf(particle), 1);
						particle.age = 0;
						splash.inUse = false;
					}
				})
			};

			return splash;
		});

	// Collision function
	// Spawns splatters on collision
	const collideFunc = (newPosition: Vector, particle: Particle): ParticleCollisionAction =>
	{
		if (IsControlled(particle.position))
		{
			return;
		}

		const collision = CheckScreenCollision(world!, particle.position, newPosition);
		if (collision)
		{
			// Check where we collided
			const position = GetScreenCollisionLocation(world!, particle.position, newPosition);

			// Determine which way we should splash
			const velocity = (particle.velocity as ControlledValue<Vector>)(particle);
			let splashAngle: Degrees;
			switch (collision)
			{
				case COLLIDE_X:
					splashAngle = velocity.Copy().ReverseX().angle.degrees;
					break;
				case COLLIDE_Y:
					splashAngle = velocity.Copy().ReverseY().angle.degrees;
					break;
				case COLLIDE_XY:
					splashAngle = velocity.Copy().Reverse().angle.degrees;
					break;
			}
			const splashVelocity = new Vector(1, 0)
				.Rotate(new Degrees(splashAngle + RandomDist(0, 60)))
				.Multiply(velocity.magnitude / RandomBetween(3, 6));

			// Generate some splashes
			const splashCount = RandomBetween(1, 3);
			const splashSprites: Sprite[] = [];
			for (let i = 0; i < splashCount; ++i)
			{
				const splash = splashParticles.find(p => !p.inUse);
				if (splash)
				{
					splash.inUse = true;

					(splash.particle.position as Vector).Set(position);
					(splash.particle.velocity as Vector).Set(splashVelocity);

					splashSprites.push(splash.particle.sprite);
					particles.push(splash.particle);
				}
			}

			if (splashSprites.length)
			{
				container.addChild(...splashSprites);
			}

			return 'kill';
		}
	};

	// Generate primary droplet particles
	const particles = Array.from(Array(config.weatherParticleCount)).map((): Particle =>
	{
		const sprite = new Sprite(Texture.WHITE);
		sprite.width = 10;
		sprite.height = 2;

		return new Particle({
			lifetime: 2 * 1000,
			sprite,
			opacity: opacityFunc,
			age: RandomScaled(1000),
			position: new Vector(RandomBetween(-config.width, config.width), -RandomScaled(config.height)),
			velocity: velocityFunc,
			rotation: rotationFunc,
			collisionTest: collideFunc
		});
	});

	return particles;
};
