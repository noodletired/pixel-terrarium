export default {
	debug: true,

	// Rendering
	width: 800,
	height: 600,
	antialias: true,
	tileWidth: 5,
	tileHeight: 5,
	tileScale: 5,
	worldWidth: 32,
	worldHeight: 24,

	// Clocks
	maxUpdateFPS: 30,

	// Generation
	rootGrassProbability: 0.2,

	// Lighting
	minimumGlobalIllumination: 0.3,
	globalLightQuality: 5,
	globalLightReflections: 0,
	globalLightFalloff: 50, // max light distance in tiles

	// Weather
	weatherParticleCount: 200,

	// Shader defaults
	windStrength: [0.08, 0.01]
} as const;
