import { mount } from 'svelte';
import App from './presentation/ui/App.svelte';
import './presentation/ui/styles.css';

mount(App, {
  target: document.getElementById('app')!,
});
