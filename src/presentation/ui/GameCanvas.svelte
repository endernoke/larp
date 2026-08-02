<script lang="ts">
  import { onMount } from 'svelte';
  import { createGame } from '../phaser/createGame';

  let container: HTMLDivElement;

  onMount(() => {
    const game = createGame(container);
    return () => game.destroy(true);
  });
</script>

<div class="game-canvas" bind:this={container} aria-label="Interactive campus map"></div>
