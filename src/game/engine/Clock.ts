import { Ticker } from 'pixi.js';
import config from '/@/config';

const SYSTEM_TICKER_ID = 'system';

/**
 * Handles game updates.
 */
class GameClock
{
	readonly tickers: Map<string, Ticker> = new Map();

	/**
	 * Constructs a new game clock with a simple ticker.
	 */
	constructor()
	{
		const systemTicker = new Ticker();
		systemTicker.autoStart = true;
		systemTicker.maxFPS = config.maxUpdateFPS;
		this.tickers.set(SYSTEM_TICKER_ID, systemTicker);
	}

	/**
	 * Generates a promise for the next update tick.
	 */
	*GetUpdates(tickerID = SYSTEM_TICKER_ID): Generator<Promise<number>>
	{
		const ticker = this.tickers.get(tickerID);
		if (!ticker)
		{
			return;
		}

		while (true)
		{
			yield new Promise(resolve => ticker.addOnce(dt => resolve(dt)));
		}
	}

	/**
	 * Destroys the renderer safely.
	 */
	Destroy(): void
	{
		this.tickers.forEach(ticker => ticker.destroy());
		this.tickers.clear();
	}
}

export const clock = new GameClock();
export type { GameClock };
