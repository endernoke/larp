import { mount } from 'svelte';
import '@fontsource-variable/pixelify-sans';
import '@fontsource/silkscreen/400.css';
import '@fontsource/silkscreen/700.css';
import App from './presentation/ui/App.svelte';
import './presentation/ui/app.css';

const target = document.getElementById('app');
if (!target) {
  throw new Error('Could not find the application mount point.');
}

mount(App, {
  target,
});
