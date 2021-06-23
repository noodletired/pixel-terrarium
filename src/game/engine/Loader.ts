import { Loader, Texture, utils } from 'pixi.js';
import type { ILoaderResource } from 'pixi.js';

/**
 * Loads game resources and track progress.
 */
class GameLoader
{
	private totalResources = 0;
	private currentlyLoadedResources = 0;
	private progress = 0;
	private loadFired = false;
	private loader = new Loader();

	/**
	 * Enqueues a texture resource to be loaded.
	 * @returns a promise which resolves once this resource is loaded.
	 */
	Enqueue(name: string, resource: string): Promise<Texture>
	{
		if (this.loadFired)
		{
			console.warn('Cannot enqueue resources after loading!');
			return Promise.resolve(utils.TextureCache[name] ?? Texture.WHITE);
		}

		this.totalResources++;
		return new Promise(resolve => this.loader.add(
			name,
			resource,
			(data: ILoaderResource) => resolve(data.texture ?? Texture.WHITE)
		));
	}

	/**
	 * Loads all resources and updates progress. Currently intended to only be called once.
	 * @returns a promise which resolves post-load.
	 */
	Load(): Promise<unknown>
	{
		if (this.loadFired)
		{
			console.warn('Cannot load resources more than once!');
			return Promise.resolve();
		}

		this.loadFired = true;

		this.loader.onProgress.add(this.OnResourceLoaded, this);
		return new Promise(resolve => this.loader.load(resolve));
	}

	/**
	 * Destroys the loader safely.
	 */
	Destroy(): void
	{
		this.loader.destroy();
		this.loader = new Loader();
	}

	/**
	 * Yields current progress.
	 * @returns a generator with progress from 0-1.
	 */
	*GetProgress(): Generator<number>
	{
		while (this.currentlyLoadedResources !== this.totalResources)
		{
			const progress = this.currentlyLoadedResources / this.totalResources;
			yield progress;
		}

		yield 1;
	}

	/**
	 * Updates progress as a ratio (0-1) of completed vs totalResources.
	 */
	private OnResourceLoaded(loader: unknown, resource: ILoaderResource): void
	{
		console.debug('Loaded resource:', resource.name);
		this.currentlyLoadedResources++;
	}
}

export const loader = new GameLoader();
export type { GameLoader };

// TODO: HMR handling
// See https://vitejs.dev/guide/api-hmr.html
if (import.meta.hot)
{
	import.meta.hot.dispose(() =>
	{
		import.meta.hot?.invalidate();
	});
}