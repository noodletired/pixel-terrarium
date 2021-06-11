import { Filter } from 'pixi.js';
import config from '/@/config';

import { RegisterUpdateCallback } from './Filters';

import vertex from '/@/assets/shaders/wind.vert';

// Set the uniforms for wind shader
export const windUniforms = {
	time: 0,
	velocity: config.windStrength || [0.14, 0.02]
};

// Register an update callback
RegisterUpdateCallback('wind', (deltaTime): void => windUniforms.time += deltaTime);

// Export the filter
export const windFilter = new Filter(vertex, undefined, windUniforms);
