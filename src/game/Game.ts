import { clock } from './engine/Clock';
import { loader } from './engine/Loader';
import { renderer } from './engine/Renderer';

import { Delay } from './utilities/Delay';

import { Filter } from './types/Filter';
import { LoadTileset } from './content/Tileset';

import { BlitWorld, GenerateWorld } from './content/World';

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

	const world = GenerateWorld();
	BlitWorld(renderer.scene, world);

	// Update loop
	for await (const dt of clock.GetUpdates())
	{
		// Update filters
		Filter.registeredFilters.forEach(filter => filter.Update(dt));

		// TODO: Process tile updates => lighting updates

		// TODO: Blit changes

		// Render the scene
		renderer.RenderScene();
	}
};