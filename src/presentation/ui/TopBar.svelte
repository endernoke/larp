<script lang="ts">
  import type { GameState } from '../../core/GameState';
  import type { PanelId } from '../bridge/frontendBridge';

  interface Props {
    gameState: GameState;
    activePanel: PanelId | null;
    onOpen: (panel: PanelId) => void;
  }

  let { gameState, activePanel, onOpen }: Props = $props();

  const panelLinks: { id: PanelId; label: string; key: string }[] = [
    { id: 'phone', label: 'Feed', key: '1' },
    { id: 'planner', label: 'Planner', key: '2' },
    { id: 'resume', label: 'Resume', key: '3' },
  ];
</script>

<header
  class="relative z-30 flex items-stretch border-b-2 border-line bg-ink px-3 shadow-[0_4px_0_rgba(0,0,0,0.35)] sm:px-5 lg:px-7"
>
  <div class="mr-auto flex min-w-0 items-center gap-3 sm:gap-4">
    <div class="flex items-center gap-2">
      <span class="h-3 w-3 bg-acid shadow-[0_0_12px_#d9ff57]"></span>
      <span class="font-display text-base leading-none text-acid sm:text-xl">LARP</span>
    </div>
    <span
      class="hidden border-l-2 border-line pl-4 text-[10px] leading-tight tracking-[0.12em] text-muted md:block"
    >
      WEEK {gameState.currentWeek}<br>
      <span class="text-paper/70">{gameState.maxWeeks - gameState.currentWeek} UNTIL GRAD</span>
    </span>
  </div>

  <section
    class="hidden items-center gap-4 pr-5 text-[11px] uppercase tracking-[0.08em] text-paper/75 xl:flex"
    aria-label="Player statistics"
  >
    <span class="flex items-center gap-1.5"
      ><i class="h-2 w-2 bg-acid"></i>${gameState.player.money}</span
    >
    <span class="flex items-center gap-1.5"
      ><i class="h-2 w-2 bg-mint"></i>
      WELLBEING: {gameState.player.wellBeing}%</span
    >
    <span class="flex items-center gap-1.5"
      ><i class="h-2 w-2 bg-coral"></i>
      VISIBILITY: {gameState.player.visibility}</span
    >
    <span class="flex items-center gap-1.5"
      ><i class="h-2 w-2 border border-paper/60"></i>
      GPA: {gameState.player.gpa}</span
    >
  </section>

  <nav class="flex self-stretch border-l-2 border-line" aria-label="Game panels">
    {#each panelLinks as item}
      <button
        type="button"
        class="group flex min-w-12 flex-col items-center justify-center gap-1 border-r-2 border-line px-2 uppercase transition-colors hover:bg-panel hover:text-acid sm:min-w-20 sm:px-3"
        class:bg-panel={activePanel === item.id}
        class:text-acid={activePanel === item.id}
        class:text-muted={activePanel !== item.id}
        aria-pressed={activePanel === item.id}
        onclick={() => onOpen(item.id)}
      >
        <span class="text-[11px] tracking-[0.08em]">{item.label}</span>
        <kbd
          class="border border-current px-1 font-display text-[7px] opacity-60 group-hover:opacity-100"
          >{item.key}</kbd
        >
      </button>
    {/each}
  </nav>
</header>
