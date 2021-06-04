import './styles/main.scss';

import { App as AppType, createApp } from 'vue';
import App from './App.vue';

// Create app
const app = createApp(App);

// Expose to window
declare global { interface Window { vue: AppType; } }
window.vue = app.mount('#app');