<script lang="ts">
  import type { GameState } from '../../core/GameState';
  import type { PanelId } from '../bridge/frontendBridge';

  interface Props {
    gameState: GameState;
    activePanel: PanelId | null;
    onOpen: (panel: PanelId) => void;
  }

  let { gameState, activePanel, onOpen }: Props = $props();
</script>

<header class="topbar">
  <div class="brand">
    <span class="brand-mark">LARP</span>
    <span class="brand-subtitle"
      >WEEK {gameState.currentWeek} · {gameState.maxWeeks - gameState.currentWeek} UNTIL GRADUATION</span
    >
  </div>

  <section class="stats" aria-label="Mock player statistics">
    <span><i class="dot money"></i>${gameState.player.money}</span>
    <span><i class="dot mood"></i>{gameState.player.wellBeing} wellbeing</span>
    <span><i class="dot signal"></i>{gameState.player.visibility} visibility</span>
    <span><i class="dot signal"></i>{gameState.player.gpa} GPA</span>
  </section>

  <nav aria-label="Game panels">
    <button type="button" class:active={activePanel === 'phone'} onclick={() => onOpen('phone')}>
      Feed <kbd>1</kbd>
    </button>
    <button
      type="button"
      class:active={activePanel === 'planner'}
      onclick={() => onOpen('planner')}
    >
      Planner <kbd>2</kbd>
    </button>
    <button type="button" class:active={activePanel === 'resume'} onclick={() => onOpen('resume')}>
      Résumé <kbd>3</kbd>
    </button>
  </nav>
</header>
