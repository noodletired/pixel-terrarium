import { Application, IApplicationOptions, Loader, MIPMAP_MODES, SCALE_MODES, Ticker, settings } from 'pixi.js';

settings.SCALE_MODE = SCALE_MODES.NEAREST;
settings.MIPMAP_MODES = MIPMAP_MODES.OFF;
settings.ROUND_PIXELS = true;
Loader.shared.load();

/**
 * CreatePixiApp
 * Initialises the Application with options.
 */
export let app: Application | null = null;
export const CreatePixiApp = (options: IApplicationOptions): Application =>
{
	app = new Application({
		...options,
		sharedLoader: true,
		sharedTicker: true
	});
	return app;
};


// Use ticker.start() and stop() to start/stop rendering
export const ticker = Ticker.shared;
ticker.autoStart = false;
ticker.stop();
ticker.add((): void =>
{
	if (!app)
	{
		throw new ReferenceError(`Pixi application has not been created!`);
	}

	app.renderer.render(app.stage);
});