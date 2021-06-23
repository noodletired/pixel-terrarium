import { Filter } from '/@/game/types/Filter';

import config from '/@/config';
import vertex from '/@/assets/shaders/wind.vert';

/**
 * Singleton class for wind filter.
 */
class WindFilter extends Filter
{
	constructor(private uniforms = {
		time: 0,
		velocity: config.windStrength || [0.14, 0.02]
	})
	{
		super('wind', vertex, undefined, uniforms);
	}

	Update(deltaTime: number)
	{
		this.uniforms.time += deltaTime;
	}
}

// Create the filter instance and export the pixijs filter
const windFilterInstance = new WindFilter();
export default windFilterInstance.filter;