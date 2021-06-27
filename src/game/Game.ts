import { clock } from './engine/Clock';
import { loader } from './engine/Loader';
import { renderer } from './engine/Renderer';

import { Delay } from './utilities/Delay';

import { Filter } from './types/Filter';
import { LoadTileset } from './content/Tileset';

import { InitialiseInteractables, UpdateInteractibles } from './content/Interactable';
import { InitialiseBackground } from './content/Background';
import { InitialiseLighting } from './content/Lighting';

/**
 * Initialises the game.
 * @param canvas HTML canvas to attach to the renderer.
 */
export const InitialiseGame = async (): Promise<void> =>
{
	// Set up renderer for progress bar
	//renderer.scene.addChild(); TODO: progress bar

	// Load things
	LoadTileset();
	loader.Load();

	for (const progress of loader.GetProgress())
	{
		console.debug(`Loading progress: `, progress);
		// TODO: update and render
		await Delay(100);
	}

	InitialiseBackground();
	InitialiseInteractables();
	InitialiseLighting();

	// Update loop
	for await (const dt of clock.GetUpdates())
	{
		// Update filters
		Filter.registeredFilters.forEach(filter => filter.Update(dt));

		// TODO: Process tile updates => lighting updates
		UpdateInteractibles();

		// Render the scene
		renderer.RenderScene();
	}
};