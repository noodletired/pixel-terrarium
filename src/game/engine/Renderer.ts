import { Container, MIPMAP_MODES, Renderer, SCALE_MODES, settings } from 'pixi.js';
import config from '/@/config';

// Global rendering settings
settings.MIPMAP_TEXTURES = MIPMAP_MODES.OFF;
settings.ROUND_PIXELS = true;
settings.SCALE_MODE = SCALE_MODES.NEAREST;
settings.TARGET_FPMS = 30 / 1000;
settings.STRICT_TEXTURE_CACHE = true;

Object.assign(settings.RENDER_OPTIONS, {
	width: config.width,
	height: config.height,
	antialias: config.antialias
});

/**
 * Handles game rendering.
 */
class GameRenderer
{
	readonly context = new Renderer();
	readonly scene = new Container();

	private readonly layers: { name: string, container: Container|null }[] = [
		{ name: 'gradient', container: null },
		{ name: 'background', container: null },
		{ name: 'midground', container: null },
		{ name: 'interactable', container: null },
		{ name: 'decoration', container: null },
		{ name: 'lighting', container: null },
	];

	/**
	 * Attach a container to a named layer.
	 * @param layerName Name of the layer.
	 * @param container Container to render.
	 */
	SetLayer(layerName: string, container: Container): void
	{
		const layer = this.layers.find(({ name }) => layerName === name);
		if (!layer)
		{
			console.warn('Could not set unknown layer container:', layerName);
			return;
		}

		// Remove previous layer from scene
		if (layer.container)
		{
			const sceneIndex = this.scene.children.indexOf(layer.container);
			this.scene.removeChildAt(sceneIndex);
			layer.container.destroy();
		}

		layer.container = container;

		const sceneIndex = this.layers.filter(({ container }) => !!container).indexOf(layer);
		this.scene.addChildAt(sceneIndex);
	}

	/**
	 * Retrieve a container for a named layer.
	 * @param layerName Name of the layer.
	 * @returns The named container or null.
	 */
	GetLayer(layerName: string): Container|null
	{
		return this.layers.find(({ name }) => layerName === name) ?? null;
	}

	/**
	 * Render the scene.
	 */
	RenderScene(): void
	{
		this.context.render(this.scene);
	}

	/**
	 * Destroys the context safely.
	 */
	Destroy(): void
	{
		try
		{
			this.scene.destroy();
			this.context.destroy();
		}
		catch (error)
		{
			console.warn('Failed to completely destroy GameRenderer:', error);
		}
	}
}

export const renderer = new GameRenderer();
export type { GameRenderer };