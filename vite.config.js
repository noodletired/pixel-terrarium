import copy from 'rollup-plugin-copy';
import { defineConfig } from 'vite';
import externals from 'vite-plugin-resolve-externals';
import path from 'path';
import viteStylelint from '@amatlash/vite-plugin-stylelint';
import vue from '@vitejs/plugin-vue';

/**
 * https://vitejs.dev/config/
 * @type { import('vite').UserConfig }
 */
export default defineConfig({
	plugins: [
		externals(),
		vue()
	],

	resolve: {
		alias: [{
			find: '/@',
			replacement: path.resolve(__dirname, 'src')
		}],
		externals: { config: 'config' }
	},

	css: {
		preprocessorOptions: {
			scss: {
				// SCSS configuration
				additionalData: `@use '/@/styles/_globals.scss' as *;`
			}
		}
	},

	build: {
		// https://rollupjs.org/guide/en/#big-list-of-options
		rollupOptions: {
			plugins: [
				copy({
					hook: 'writeBundle',
					targets: [
						{ src: './config.js', dest: 'dist' },
					]
				}),
				viteStylelint()
			]
		}
	}
});