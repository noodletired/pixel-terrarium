<template>
<div id="app">
	<canvas ref="canvas" />
</div>
</template>


<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { Create } from './lib/PixiApp';
import { tilesPromise } from './lib/Tileset';

import './lib/Tilemap';

import type { Application } from 'pixi.js';
import type { Tiles } from './lib/Tileset';

export default defineComponent({
	name: 'application',

	setup()
	{
		const canvas = ref<HTMLCanvasElement | null>(null);
		const app = ref<Application | null>(null);
		const tiles = ref<Tiles | null>(null);
		onMounted(async () =>
		{
			console.log('mounted', canvas.value);
			app.value = Create({ view: canvas.value! });
			tiles.value = await tilesPromise;
		});


		// TODO: generate tilemap

		return { app, canvas, tiles };
	}
});
</script>


<style scoped lang="scss">
</style>
