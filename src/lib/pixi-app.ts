import { Application, Loader } from 'pixi.js';

export const app = new Application(); // TODO: options?
export const { view } = app;
export const assets = new Loader('./assets');

/**
 * StartRenderer
 * Set cancelRender = true or use Stop() to stop.
 */
let cancelRender = false;
export const StartRenderer = () : void =>
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
export const StopRenderer = () : void =>
{
	cancelRender = true;
};