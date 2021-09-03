/**
 * Helper type to indicate that a value is controllable by function.
 */
// eslint-disable-next-line
export type ControlledValue<T> = ((...args: any[]) => T);

/**
 * Controllable types can be themselves, or a controlled value.
 */
export type Controllable<T> = T | ControlledValue<T>;

/**
 * Checks to see if a variable instance is being controlled.
 * @param instance  The instance of a possibly controllable value
 * @returns
 */
export const IsControlled = <T>(instance: Controllable<T>): instance is ControlledValue<T> =>
{
	return (typeof instance === 'function');
};