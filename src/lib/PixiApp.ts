import { Application, IApplicationOptions, Loader, SCALE_MODES, settings } from 'pixi.js';

settings.SCALE_MODE = SCALE_MODES.NEAREST;

export let app: Application | null;
export const assets = new Loader();

export const Create = (options: IApplicationOptions): Application =>
{
	app = new Application(options);
	return app;
};

/**
 * Render
 * Set cancelRender = true or use Stop() to stop.
 */
let cancelRender = false;
export const Render = (): void =>
{
	if (!app)
	{
		throw new ReferenceError(`Pixi application has not been created!`);
	}

	if (!cancelRender)
	{
		requestAnimationFrame(Render);
	}
	else
	{
		cancelRender = false; // clear the flag
	}

	app.renderer.render(app.stage);
};

/**
 * StopRender
 * Cancels rendering.
 */
export const StopRender = (): void =>
{
	cancelRender = true;
};