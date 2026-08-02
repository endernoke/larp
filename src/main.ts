import { mount } from 'svelte';
import App from './presentation/ui/App.svelte';
import './presentation/ui/styles.css';

const target = document.getElementById('app');
if (!target) {
  throw new Error('Could not find the application mount point.');
}

mount(App, {
  target,
});
