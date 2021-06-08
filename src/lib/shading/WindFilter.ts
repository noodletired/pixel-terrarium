import { Filter } from 'pixi.js';

import { RegisterUpdateCallback, noiseTexture } from '../Filters';

import vertex from '/@/assets/shaders/wind.vert?raw';

export const windUniforms = {
	time: Date.now(),
	velocity: [-1, -0.1],
	noise: noiseTexture
};

export const windFilter = new Filter(vertex, undefined, windUniforms);

// Register an update callback
RegisterUpdateCallback('wind', () => windUniforms.time = Date.now());
