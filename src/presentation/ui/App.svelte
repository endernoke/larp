<script lang="ts">
  import { onMount } from 'svelte';
  import { gameStore } from '../../core/GameStore';
  import { frontendBridge, type PanelId } from '../bridge/frontendBridge';
  import GameCanvas from './GameCanvas.svelte';
  import SidePanel from './SidePanel.svelte';
  import TopBar from './TopBar.svelte';

  let gameState = $state(gameStore.state);
  let activePanel = $state<PanelId | null>(null);
  let queuedPanel = $state<PanelId | null>(null);
  let panelClosing = $state(false);
  let nearbyLabel = $state<string | null>(null);
  let sceneReady = $state(false);

  function showPanel(panel: PanelId): void {
    if (activePanel) {
      if (activePanel !== panel || panelClosing) {
        queuedPanel = panel;
        panelClosing = true;
      }
      return;
    }

    queuedPanel = null;
    panelClosing = false;
    activePanel = panel;
  }

  function openPanel(panel: PanelId): void {
    if (activePanel === panel && !panelClosing) {
      closePanel();
      return;
    }
    showPanel(panel);
  }

  function closePanel(): void {
    if (!activePanel) return;
    queuedPanel = null;
    if (panelClosing) return;
    panelClosing = true;
  }

  function finishPanelClose(event: AnimationEvent): void {
    if (panelClosing && event.animationName === 'panel-exit') {
      activePanel = queuedPanel;
      queuedPanel = null;
      panelClosing = false;
    }
  }

  $effect(() => {
    frontendBridge.emit('ui:block-input', {
      blocked: activePanel !== null || queuedPanel !== null,
    });
  });

  onMount(() => {
    const unsubscribe = [
      frontendBridge.on('location:nearby', ({ label }) => (nearbyLabel = label)),
      frontendBridge.on('location:interact', ({ panel }) => showPanel(panel)),
      frontendBridge.on('panel:open', ({ panel }) => showPanel(panel)),
      frontendBridge.on('scene:ready', () => (sceneReady = true)),
    ];

    const stopState = gameStore.subscribe((state) => {
      gameState = state;
      console.log(gameState);
    });
    const stopEvents = gameStore.onOutcome((_outcome) => {});

    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePanel();
      if (event.key === '1') showPanel('phone');
      if (event.key === '2') showPanel('planner');
      if (event.key === '3') showPanel('resume');
    };
    window.addEventListener('keydown', keyHandler);

    return () => {
      unsubscribe.forEach((stop) => {
        stop();
      });
      stopState();
      stopEvents();
      window.removeEventListener('keydown', keyHandler);
    };
  });
</script>

<svelte:head>
  <meta name="theme-color" content="#07110f">
</svelte:head>

<main
  class="grid h-full w-full grid-rows-[4.5rem_minmax(0,1fr)] bg-ink md:grid-rows-[5rem_minmax(0,1fr)]"
>
  <TopBar {gameState} {activePanel} onOpen={openPanel} />

  <section class="relative min-h-0 overflow-hidden bg-screen">
    <GameCanvas />

    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 z-10 opacity-[0.06] mix-blend-screen [background-image:repeating-linear-gradient(0deg,transparent_0,transparent_3px,#d9ff57_4px)]"
    ></div>

    <div
      class="absolute bottom-3 left-3 z-20 flex items-center gap-3 border-2 border-line bg-screen/90 px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-muted shadow-pixel backdrop-blur-sm sm:bottom-5 sm:left-5 sm:gap-5"
    >
      <span class="flex items-center gap-2">
        <kbd
          class="border border-muted/60 bg-console px-1.5 py-0.5 font-display text-[8px] text-paper"
          >WASD</kbd
        >
        <span class="hidden sm:inline">Move</span>
      </span>
      <span class="flex items-center gap-2">
        <kbd
          class="border border-acid/60 bg-console px-1.5 py-0.5 font-display text-[8px] text-acid"
          >E</kbd
        >
        <span class="hidden sm:inline">Interact</span>
      </span>
    </div>

    {#if nearbyLabel}
      <div
        class="absolute top-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 border-2 border-acid bg-screen/95 px-4 py-2 text-center font-display text-[9px] text-acid shadow-pixel"
      >
        <i
          class="h-2 w-2 animate-[blink_1s_steps(2,end)_infinite] bg-acid shadow-[0_0_10px_#d9ff57]"
        ></i>
        {nearbyLabel}
      </div>
    {/if}

    {#if !sceneReady}
      <div
        class="absolute right-4 bottom-4 z-20 border-2 border-line bg-screen/95 px-3 py-2 font-display text-[8px] tracking-[0.08em] text-muted shadow-pixel"
      >
        CONNECTING TO CAMPUS WI-FI<span class="animate-[blink_1s_steps(2,end)_infinite]">_</span>
      </div>
    {/if}
  </section>

  {#if activePanel}
    <button
      type="button"
      class="fixed inset-0 z-40 cursor-default bg-[#020605]/80 backdrop-blur-[3px]"
      data-panel-scrim={panelClosing ? 'exit' : 'enter'}
      onclick={closePanel}
      aria-label="Close panel"
    ></button>
    <div
      class="pointer-events-none fixed inset-0 z-50 grid place-items-center p-3 sm:p-6"
      data-panel-motion={panelClosing ? 'exit' : 'enter'}
      onanimationend={finishPanelClose}
    >
      <SidePanel {gameState} panel={activePanel} onClose={closePanel} />
    </div>
  {/if}
</main>
