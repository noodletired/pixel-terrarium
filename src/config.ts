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
	minimumGlobalIllumination: 0.5,
	globalLightQuality: 5,
	globalLightReflections: 0,
	globalLightFalloff: 50, // 20 tiles max
	windStrength: [0.08, 0.01]
} as const;
