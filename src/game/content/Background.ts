import { Container, RenderTexture, Sprite } from 'pixi.js';
import config from '/@/config';

import { GradientSprite } from '../effects/Gradient';
import { renderer } from '../engine';

import { GenerateWorldBackground } from './generation/Background';

/**
 * Generates and attaches background content to renderer.
 */
export const InitialiseBackground = (): void =>
{
	// Generate tiles and gradients
	const container = new Container();
	const tiles = GenerateWorldBackground();
	const gradient = new GradientSprite([[0, '#2e2833'], [1, '#283d4d']], config.width, config.height, true);
	const overlayGradient = new GradientSprite([[0, '#2e283330'], [1, '#283d4dcf']], config.width, config.height, true);

	// Background is fixed - no moving parts - so we bake it to an RT as an optimization
	const bakedTexture = RenderTexture.create({ width: config.width, height: config.height });
	const bakedSprite = new Sprite(bakedTexture);

	// Add all sprites to container in order
	container.addChild(gradient);
	tiles.ForEach(tile =>
	{
		if (tile)
		{
			container.addChild(tile.sprite);
		}
	});
	container.addChild(overlayGradient);

	// Bake
	renderer.context.render(container, { renderTexture: bakedTexture });

	// Set as background layer
	renderer.SetLayer('background', bakedSprite);
};