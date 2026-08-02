<script lang="ts">
  import type { PanelId } from '../bridge/frontendBridge';

  interface Props {
    activePanel: PanelId | null;
    onOpen: (panel: PanelId) => void;
  }

  let { activePanel, onOpen }: Props = $props();
</script>

<header class="topbar">
  <div class="brand">
    <span class="brand-mark">LARP</span>
    <span class="brand-subtitle">WEEK 03 · 17 UNTIL GRADUATION</span>
  </div>

  <div class="stats" aria-label="Mock player statistics">
    <span><i class="dot money"></i>$1,240</span>
    <span><i class="dot mood"></i>68 wellbeing</span>
    <span><i class="dot signal"></i>12 visibility</span>
  </div>

  <nav aria-label="Game panels">
    <button class:active={activePanel === 'phone'} onclick={() => onOpen('phone')}>Feed <kbd>1</kbd></button>
    <button class:active={activePanel === 'planner'} onclick={() => onOpen('planner')}>Planner <kbd>2</kbd></button>
    <button class:active={activePanel === 'resume'} onclick={() => onOpen('resume')}>Résumé <kbd>3</kbd></button>
  </nav>
</header>
