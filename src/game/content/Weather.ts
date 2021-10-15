import { Container } from 'pixi.js';
import config from '/@/config';

// OPTIONAL: try https://github.com/pixijs/pixi-particles
import { renderer } from '/@/game/engine';
import { world } from './Interactable';

import { GenerateRain } from './generation/Rain';

import { RandomBetween, RandomScaled } from '/@/game/utilities/Random';

import { IsControlled } from '/@/game/types/Control';
import { Particle } from '/@/game/types/Particle';


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

	particles = GenerateRain(world, weatherContainer);

	weatherContainer.addChild(...particles.map(particle => particle.sprite));
	renderer.GetLayer('decoration').addChild(weatherContainer);
};

/**
 * Updates the location of all weather particles and computes simple collision.
 * @param world Array2D of Tiles. Opaque tiles are used for collision.
 */
export const UpdateWeather = (dt: number): void =>
{
	const ResetX = () => RandomBetween(-config.width, config.width);
	const ResetY = () => -RandomScaled(config.height);

	particles.forEach(particle =>
	{
		particle.Update(dt);
		if (particle.isDead)
		{
			// reuse it
			particle.age = 0;

			if (!IsControlled(particle.position))
			{
				particle.position.x = ResetX();
				particle.position.y = ResetY();
			}
		}

		if (!IsControlled(particle.position) && particle.position.y > config.height)
		{
			particle.position.y = ResetY();
		}

		if (!IsControlled(particle.position) && particle.position.x > config.width)
		{
			particle.position.y = ResetY();
			particle.position.x = ResetX();
		}
	});
};
