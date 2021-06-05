import { Application, IApplicationOptions, Loader } from 'pixi.js';

export let app: Application | null;
export const assets = new Loader();

export const Create = (options: IApplicationOptions): Application =>
{
	app = new Application(options);
	return app;
};

/**
 * StartRenderer
 * Set cancelRender = true or use Stop() to stop.
 */
let cancelRender = false;
export const StartRenderer = (): void =>
{
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
 * StopRenderer
 * Cancels rendering.
 */
export const StopRenderer = (): void =>
{
	cancelRender = true;
};