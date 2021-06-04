<template>
<div id="app" ref="root" />
</template>


<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { tilesPromise } from './lib/tileset';
import { view } from './lib/pixi-app';

export default defineComponent({
	name: 'application',

	async setup()
	{
		const root = ref<HTMLDivElement | null>(null);
		onMounted(() => root.value?.appendChild(view));

		const tiles = await tilesPromise;

		// TODO: generate tilemap

		return { tiles };
	}
});
</script>


<style scoped lang="scss">
</style>
