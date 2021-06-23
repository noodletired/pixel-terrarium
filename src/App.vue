<template>
<div id="content" ref="content" />
</template>


<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { InitialiseGame } from './game/Game';
import { renderer } from './game/engine/Renderer';

export default defineComponent({
	name: 'application',

	setup()
	{
		const content = ref<HTMLDivElement|null>(null);

		onMounted(() =>
		{
			content.value?.appendChild(renderer.context.view);
			InitialiseGame();
		});

		return { content };
	}
});

// HMR force reload
if (import.meta.hot)
{
	import.meta.hot.dispose(() =>
	{
		import.meta.hot?.invalidate();
	});
}
</script>


<style scoped lang="scss">
#content {
	$color-1: hsl(273, 12%, 18%);
	$color-2: hsl(207, 32%, 23%);
	height: 100%;
	width: 100%;
	background: linear-gradient($color-1, $color-2);

	::v-deep(canvas) {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		border: solid 1px hsl(0, 0%, 90%);
	}
}
</style>
