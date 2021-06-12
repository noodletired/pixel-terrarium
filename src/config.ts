export default {
	debug: true,

	// Pixi Display
	transparent: true,
	antialias: true,
	tileWidth: 5,
	tileHeight: 5,
	tileScale: 5,
	worldWidth: 32,
	worldHeight: 24,

	// Generation
	rootGrassProbability: 0.2,

	// Shaders
	windStrength: [0.08, 0.01],
	worldLights: [
		//		{ type: 'point', x: -16, y: 0 },
		//		{ type: 'point', x: 16, y: -16 },
		//		{ type: 'point', x: 48, y: 0 },
		{ type: 'directional', angle: -45 },
		{ type: 'directional', angle: -90 },
		{ type: 'directional', angle: -135 }
	]
} as const;
