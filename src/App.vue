<template>
<div id="app">
	<canvas ref="canvas" />
</div>
</template>


<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import config from './config';

import { BlitWorld, GenerateWorld } from './lib/World';
import { CreatePixiApp, Render } from './lib/PixiApp';

export default defineComponent({
	name: 'application',

	setup()
	{
		const canvas = ref<HTMLCanvasElement | null>(null);
		const world = GenerateWorld();

		onMounted(() =>
		{
			let app = CreatePixiApp({
				backgroundAlpha: config.transparent ? 0 : 1,
				view: canvas.value!
			});

			BlitWorld(world, app.stage);
			Render();
		});

		// TODO: generate tilemap

		return { canvas };
	}
});
</script>


<style scoped lang="scss">
#app {
	$color-1: hsl(273, 12%, 18%);
	$color-2: hsl(207, 32%, 23%);
	background: linear-gradient($color-1, $color-2);
}

canvas {
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	border: solid 1px hsl(0, 0%, 90%);
}
</style>
