import { createApp } from 'vue';

import './styles/main.scss';
import App from './App.vue';

import type { ComponentPublicInstance } from 'vue';

// Create app
const app = createApp(App);

// Expose to window
declare global
{
	interface Window
	{
		vue: ComponentPublicInstance;
	}
}
window.vue = app.mount('#app');