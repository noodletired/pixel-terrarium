import { BLEND_MODES, Container, RenderTexture, Sprite, filters } from 'pixi.js';

import config from '/@/config';
import { renderer } from '../engine';
import { world } from './Interactable';

import { ComputeGlobalIllumination, ComputeLocalIllumination } from './postprocess/Illumination';
import { BlitBitmap } from '../utilities/Array2DRender';


// Module locals
const renderContainer = new Container();
const renderTexture = RenderTexture.create({ width: config.width, height: config.height });
const renderSprite = new Sprite(renderTexture);

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
	BlitBitmap(renderContainer, globalLighting, 'grey', BLEND_MODES.ADD);
	BlitBitmap(renderContainer, localLighting, 'rgba', BLEND_MODES.ADD);

	// Render container to texture with blur filter applied
	renderContainer.filters = [new filters.BlurFilter(10, 2, undefined, 7)];
	renderer.context.render(renderContainer, { renderTexture });

	// Blend with MULTIPLY operation, and add to renderer.
	renderSprite.blendMode = BLEND_MODES.MULTIPLY;
	renderer.GetLayer('lighting').addChild(renderSprite);
};