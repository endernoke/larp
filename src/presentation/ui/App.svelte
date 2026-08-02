<script lang="ts">
  import { onMount } from 'svelte';
  import { frontendBridge, type PanelId } from '../bridge/frontendBridge';
  import GameCanvas from './GameCanvas.svelte';
  import SidePanel from './SidePanel.svelte';
  import TopBar from './TopBar.svelte';

  let activePanel = $state<PanelId | null>(null);
  let nearbyLabel = $state<string | null>(null);
  let sceneReady = $state(false);

  function openPanel(panel: PanelId): void {
    activePanel = activePanel === panel ? null : panel;
  }

  $effect(() => {
    if (activePanel) {
      frontendBridge.emit('ui:block-input', { blocked: true });
    } else {
      frontendBridge.emit('ui:block-input', { blocked: false });
    }
  });

  onMount(() => {
    const unsubscribe = [
      frontendBridge.on('location:nearby', ({ label }) => (nearbyLabel = label)),
      frontendBridge.on('location:interact', ({ panel }) => (activePanel = panel)),
      frontendBridge.on('panel:open', ({ panel }) => (activePanel = panel)),
      frontendBridge.on('scene:ready', () => (sceneReady = true)),
    ];

    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') activePanel = null;
      if (event.key === '1') activePanel = 'phone';
      if (event.key === '2') activePanel = 'planner';
      if (event.key === '3') activePanel = 'resume';
    };
    window.addEventListener('keydown', keyHandler);

    return () => {
      unsubscribe.forEach((stop) => {
        stop();
      });
      window.removeEventListener('keydown', keyHandler);
    };
  });
</script>

<svelte:head>
  <meta name="theme-color" content="#0b1110">
</svelte:head>

<main class="app-shell">
  <TopBar {activePanel} onOpen={openPanel} />

  <section class="game-stage" class:panel-open={activePanel !== null}>
    <GameCanvas />

    <div class="map-title">
      <p class="eyebrow">CAMPUS DISTRICT</p>
      <h1>Opportunity is allegedly nearby.</h1>
    </div>

    <div class="controls-hint">
      <span><kbd>WASD</kbd> / <kbd>ARROWS</kbd> move</span>
      <span><kbd>E</kbd> interact</span>
    </div>

    {#if nearbyLabel}
      <div class="nearby-pill"><i></i>{nearbyLabel}</div>
    {/if}

    {#if !sceneReady}
      <div class="loading-badge">Connecting to campus Wi-Fi…</div>
    {/if}
  </section>

  {#if activePanel}
    <button
      type="button"
      class="panel-scrim"
      onclick={() => (activePanel = null)}
      aria-label="Close panel"
    ></button>
    <SidePanel panel={activePanel} onClose={() => (activePanel = null)} />
  {/if}

  <footer>
    <span>FRONTEND CONCEPT · MOCK DATA</span>
    <span>MARKET SENTIMENT <strong class="market-sentiment">UNREASONABLY CONFIDENT ↑</strong></span>
  </footer>
</main>
