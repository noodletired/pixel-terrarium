/**
 * Get a promise for a given time delay (ms).
 * @returns an awaitable promise.
 */
export const Delay = (milliseconds: number): Promise<void> =>
{
	return new Promise(resolve => setTimeout(resolve, milliseconds));
};