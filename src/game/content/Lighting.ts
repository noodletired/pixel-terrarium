import { BLEND_MODES, Container, RenderTexture, Sprite, filters } from 'pixi.js';

import config from '/@/config';
import { renderer } from '../engine';
import { world } from './Interactable';

import { ComputeGlobalIllumination, ComputeLocalIllumination } from './postprocess/Illumination';
import { BlitBitmap } from '../utilities/Array2DRender';


// Module locals
const shadowContainer = new Container();
const shadowTexture = RenderTexture.create({ width: config.width, height: config.height });
const shadowSprite = new Sprite(shadowTexture);

const lightContainer = new Container();
const lightTexture = RenderTexture.create({ width: config.width, height: config.height });
const lightSprite = new Sprite(lightTexture);

/**
 * Initialises local and global lighting.
 */
export const InitialiseLighting = (): void =>
{
	if (!world)
	{
		throw new ReferenceError('World must be initialised before computing lighting.');
	}

	// Compute world lighting and draw to container
	const globalLighting = ComputeGlobalIllumination(world).Multiply(255);
	const localLighting = ComputeLocalIllumination(world);
	BlitBitmap(shadowContainer, globalLighting, 'grey', BLEND_MODES.ADD);
	BlitBitmap(lightContainer, localLighting, 'rgb', BLEND_MODES.ADD);

	// Render container to texture with blur filter applied
	shadowContainer.filters = [new filters.BlurFilter(10, 2, undefined, 7)];
	lightContainer.filters = [new filters.BlurFilter(10, 2, undefined, 7)];
	renderer.context.render(shadowContainer, { renderTexture: shadowTexture });
	renderer.context.render(lightContainer, { renderTexture: lightTexture });

	// Blend with correct operation, and add to renderer.
	shadowSprite.blendMode = BLEND_MODES.MULTIPLY;
	lightSprite.blendMode = BLEND_MODES.ADD;
	renderer.GetLayer('shading').addChild(shadowSprite);
	renderer.GetLayer('lighting').addChild(lightSprite);
};