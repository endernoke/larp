<script lang="ts">
  import { onMount } from 'svelte';
  import { createGame } from '../phaser/createGame';

  let container: HTMLDivElement;

  onMount(() => {
    let game: ReturnType<typeof createGame> | undefined;
    let cancelled = false;

    void Promise.all([
      document.fonts.load('16px "Pixelify Sans Variable"'),
      document.fonts.load('16px Silkscreen'),
    ]).finally(() => {
      if (!cancelled) game = createGame(container);
    });

    return () => {
      cancelled = true;
      game?.destroy(true);
    };
  });
</script>

<div
  class="h-full w-full [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full [&>canvas]:[image-rendering:pixelated]"
  bind:this={container}
  role="img"
  aria-label="Interactive campus map"
></div>
