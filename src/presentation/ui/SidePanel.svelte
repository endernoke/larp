<script lang="ts">
  import { SvelteMap } from 'svelte/reactivity';
  import type { GameState } from '../../core/GameState';
  import { gameStore } from '../../core/GameStore';
  import type { PanelId } from '../bridge/frontendBridge';

  interface Props {
    gameState: GameState;
    panel: PanelId;
    onClose: () => void;
  }

  let { gameState, panel, onClose }: Props = $props();
  let pendingTaskTimeAllocations = $state(new SvelteMap<string, number>());
  let pendingNewTimeAllocations = $state(new SvelteMap<string, number>());

  $effect(() => {
    pendingTaskTimeAllocations = new SvelteMap(
      gameState.player.work.map((experience) => [
        experience.id,
        experience.currentAllocatedTimeUnits,
      ]),
    );
    pendingNewTimeAllocations.clear();
  });

  const panelTitles: Record<PanelId, { title: string; description: string }> = {
    phone: { title: 'News', description: 'Your extremely reliable feed' },
    planner: { title: 'Weekly Planner', description: 'Spend seven blocks wisely' },
    resume: { title: 'Resume', description: 'Things you claim to have done' },
  };
</script>

<div
  class="pointer-events-auto flex max-h-[calc(100dvh-1.5rem)] w-[min(94vw,40rem)] flex-col overflow-hidden border-4 border-[#354b45] bg-console p-2 shadow-device sm:max-h-[calc(100dvh-3rem)] sm:p-3"
  aria-label={panelTitles[panel].title}
  aria-modal="true"
  role="dialog"
>
  <div
    class="flex h-7 shrink-0 items-center justify-between border-x-2 border-t-2 border-line bg-[#182722] px-2"
    aria-hidden="true"
  >
    <div class="flex gap-1.5">
      <i class="h-2 w-2 bg-coral"></i>
      <i class="h-2 w-2 bg-acid"></i>
      <i class="h-2 w-2 bg-mint"></i>
    </div>
    <div class="h-1.5 w-20 bg-[#050a09] shadow-[inset_0_1px_0_#2b403a]"></div>
  </div>

  <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden border-2 border-line bg-screen">
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 z-20 opacity-[0.035] [background-image:repeating-linear-gradient(0deg,transparent_0,transparent_3px,#d9ff57_4px)]"
    ></div>

    <header
      class="relative z-30 flex shrink-0 items-start justify-between gap-4 border-b-2 border-line bg-screen/95 p-4 sm:p-5"
    >
      <div>
        <h2 class="text-xl leading-none font-bold text-paper sm:text-2xl">
          {panelTitles[panel].title}
        </h2>
        <p class="text-sm text-muted">
          {panelTitles[panel].description}
        </p>
      </div>
      <button
        type="button"
        class="grid h-9 w-9 shrink-0 place-items-center border-2 border-line bg-console font-display text-sm text-muted shadow-[2px_2px_0_#020504] transition-colors hover:border-coral hover:text-coral active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        onclick={onClose}
        aria-label="Close panel"
      >
        ×
      </button>
    </header>

    <div class="relative z-10 min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
      {#if panel === 'phone'}
        <!-- <div
          class="mb-4 flex gap-2 border-b-2 border-line pb-3 font-display text-[7px] tracking-[0.06em] sm:gap-4"
        >
          <span class="border border-acid bg-acid px-2 py-1 text-ink">ALL SIGNALS</span>
          <span class="border border-line px-2 py-1 text-muted">MESSAGES</span>
          <span class="border border-line px-2 py-1 text-muted">JOBS</span>
        </div> -->

        {#if gameState.world.signals.length === 0}
          <div class="border-2 border-dashed border-line p-8 text-center text-sm text-muted">
            YOU'RE ALL CAUGHT UP<span class="animate-[blink_1s_steps(2,end)_infinite]">_</span>
          </div>
        {:else}
          <div class="grid gap-3">
            {#each gameState.world.signals as item}
              {@const messageLines = item.message.split('\n')}
              {@const title = messageLines.length > 1 ? messageLines[0] : null}
              {@const body = messageLines.length > 1 ? messageLines.slice(1).join('\n') : item.message}
              <article class="border-2 border-line bg-panel p-4 shadow-[3px_3px_0_#020504]">
                <div
                  class="flex items-center justify-between font-display text-[7px] tracking-[0.08em] text-muted"
                >
                  <strong class="font-normal text-mint">[{item.channel}]</strong>
                  <span>01H AGO</span>
                </div>
                {#if title}
                  <h3 class="mt-3 text-base leading-tight font-bold text-paper">{title}</h3>
                {/if}
                <p class="mt-2 text-sm leading-relaxed whitespace-pre-line text-paper/70">{body}</p>
              </article>
            {/each}
          </div>
        {/if}
      {:else if panel === 'planner'}
        {@const shownTasks = gameState.player.work.filter((experience) => experience.status !== 'completed')}
        {@const shownOpportunities = gameState.player.availableOpportunities}
        {@const totalAllocatedTime = [...pendingTaskTimeAllocations.values()].reduce((sum, time) => sum + time, 0) + [...pendingNewTimeAllocations.values()].reduce((sum, time) => sum + time, 0)}

        <section class="mb-5 border-2 border-line bg-panel p-4" aria-label="Time block capacity">
          <div class="flex items-end justify-between font-display text-[8px] text-muted">
            <span>TIME BLOCKS ALLOCATED</span>
            <strong class="text-sm font-normal text-acid"
              >{totalAllocatedTime}<span class="text-muted">/07</span></strong
            >
          </div>
          <div class="mt-3 grid h-4 grid-cols-7 gap-1 bg-screen p-1" aria-hidden="true">
            {#each Array(7) as _, index}
              <i
                class:bg-acid={index < totalAllocatedTime}
                class:bg-line={index >= totalAllocatedTime}
              ></i>
            {/each}
          </div>
        </section>

        {#if shownTasks.length > 0}
          <p class="mb-2 font-display text-[8px] tracking-[0.1em] text-muted">KEEP GOING</p>
          <div class="grid gap-2">
            {#each shownTasks as task}
              <article
                class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-2 border-line bg-panel p-3"
              >
                <div class="min-w-0">
                  <strong class="block text-sm leading-tight text-paper">{task.title}</strong>
                  <small class="mt-1 block text-[11px] leading-snug text-muted">
                    {task.completedTimeUnits}/{task.actualRequiredTime}
                    blocks completed
                  </small>
                  <small class="mt-1 block text-[11px] leading-snug text-muted">
                    Quality: {task.quality * 100}%
                  </small>
                </div>
                <fieldset class="flex items-center border-0 p-0">
                  <legend class="sr-only">Allocate time to {task.title}</legend>
                  <button
                    type="button"
                    class="grid h-9 w-9 place-items-center border-2 border-line bg-screen text-lg text-muted hover:border-acid hover:text-acid disabled:cursor-not-allowed disabled:opacity-25"
                    disabled={!pendingTaskTimeAllocations.get(task.id)}
                    onclick={() => {
                      const current = pendingTaskTimeAllocations.get(task.id) ?? 0;
                      pendingTaskTimeAllocations.set(task.id, Math.max(0, current - 1));
                    }}
                    aria-label={`Remove a time block from ${task.title}`}
                  >
                    −
                  </button>
                  <span
                    class="grid h-9 w-9 place-items-center border-y-2 border-line bg-ink font-display text-xs text-acid"
                  >
                    {pendingTaskTimeAllocations.get(task.id) ?? 0}
                  </span>
                  <button
                    type="button"
                    class="grid h-9 w-9 place-items-center border-2 border-line bg-screen text-lg text-muted hover:border-acid hover:text-acid disabled:cursor-not-allowed disabled:opacity-25"
                    disabled={totalAllocatedTime >= 9}
                    onclick={() => {
                      const current = pendingTaskTimeAllocations.get(task.id) ?? 0;
                      pendingTaskTimeAllocations.set(task.id, current + 1);
                    }}
                    aria-label={`Add a time block to ${task.title}`}
                  >
                    +
                  </button>
                </fieldset>
              </article>
            {/each}
          </div>
        {/if}

        {#if shownOpportunities.length > 0}
          <p class="mt-5 mb-2 font-display text-[8px] tracking-[0.1em] text-muted">
            START SOMETHING NEW
          </p>
          <div class="grid gap-2">
            {#each shownOpportunities as opportunity}
              <article
                class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-2 border-mint/30 bg-[#10201c] p-3"
              >
                <div class="min-w-0">
                  <strong class="block text-sm leading-tight text-paper"
                    >{opportunity.title}</strong
                  >
                  <small class="mt-1 block text-[11px] leading-snug text-muted">
                    Est. {opportunity.baseRequiredTime} blocks
                  </small>
                </div>
                <fieldset class="flex items-center border-0 p-0">
                  <legend class="sr-only">Allocate time to {opportunity.title}</legend>
                  <button
                    type="button"
                    class="grid h-9 w-9 place-items-center border-2 border-line bg-screen text-lg text-muted hover:border-acid hover:text-acid disabled:cursor-not-allowed disabled:opacity-25"
                    disabled={!pendingNewTimeAllocations.get(opportunity.id)}
                    onclick={() => {
                      const current = pendingNewTimeAllocations.get(opportunity.id) ?? 0;
                      pendingNewTimeAllocations.set(opportunity.id, Math.max(0, current - 1));
                    }}
                    aria-label={`Remove a time block from ${opportunity.title}`}
                  >
                    −
                  </button>
                  <span
                    class="grid h-9 w-9 place-items-center border-y-2 border-line bg-ink font-display text-xs text-acid"
                  >
                    {pendingNewTimeAllocations.get(opportunity.id) ?? 0}
                  </span>
                  <button
                    type="button"
                    class="grid h-9 w-9 place-items-center border-2 border-line bg-screen text-lg text-muted hover:border-acid hover:text-acid disabled:cursor-not-allowed disabled:opacity-25"
                    disabled={totalAllocatedTime >= 9}
                    onclick={() => {
                      const current = pendingNewTimeAllocations.get(opportunity.id) ?? 0;
                      pendingNewTimeAllocations.set(opportunity.id, current + 1);
                    }}
                    aria-label={`Add a time block to ${opportunity.title}`}
                  >
                    +
                  </button>
                </fieldset>
              </article>
            {/each}
          </div>
        {/if}

        <button
          type="button"
          class="mt-5 w-full border-2 border-mint bg-transparent px-4 py-3 font-display text-[9px] tracking-[0.08em] text-mint shadow-[3px_3px_0_#020504] transition-colors hover:bg-mint hover:text-ink active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          onclick={() => {
            let failed = false;
            for (const [experienceId, allocatedTimeUnits] of pendingTaskTimeAllocations.entries()) {
              const result = gameStore.dispatch({
                type: 'add-to-planner',
                experienceId,
                allocatedTimeUnits,
              });
              if (result.outcomes.some((outcome) => outcome.type === 'action-rejected')) {
                failed = true;
                break;
              }
            }
            if (failed) return;
            for (const [experienceDefinitionId, allocatedTimeUnits] of pendingNewTimeAllocations.entries()) {
              const result = gameStore.dispatch({
                type: 'add-to-planner',
                experienceDefinitionId,
                allocatedTimeUnits,
              });
              if (result.outcomes.some((outcome) => outcome.type === 'action-rejected')) {
                failed = true;
                break;
              }
            }
          }}
        >
          SAVE ALLOCATIONS
        </button>
        <button
          type="button"
          class="mt-3 w-full border-2 border-acid bg-acid px-4 py-3 font-display text-[9px] tracking-[0.08em] text-ink shadow-[3px_3px_0_#020504] transition-[filter,transform,box-shadow] hover:brightness-110 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          onclick={() => gameStore.dispatch({ type: 'advance-week' })}
        >
          LOCK IN WEEK &gt;&gt;
        </button>
      {:else}
        {@const experiences = gameState.player.work.filter((experience) => experience.status !== 'not-started')}

        <section class="mb-5 flex items-center gap-4 border-2 border-line bg-panel p-4">
          <span
            class="grid h-14 w-14 shrink-0 place-items-center border-2 border-acid bg-acid font-display text-sm text-ink shadow-[3px_3px_0_#020504]"
            >CS</span
          >
          <div class="min-w-0">
            <strong class="block text-base text-paper">Anonymous Student</strong>
            <small class="mt-1 block text-[11px] leading-snug text-muted"
              >OPEN TO LITERALLY ANYTHING</small
            >
          </div>
        </section>

        <div class="border-t-2 border-line">
          {#each experiences as experience}
            <article
              class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b-2 border-line py-4"
            >
              <div class="min-w-0">
                <small class="block text-[11px] leading-snug text-muted">{experience.type}</small>
                <h3 class="text-sm leading-tight text-paper">{experience.title}</h3>
              </div>
              <span class="border border-line bg-panel px-2 py-1 font-display text-[7px] text-mint">
                {experience.quality * 100}%
              </span>
            </article>
          {:else}
            <p class="border-b-2 border-line py-8 text-center text-sm text-muted">
              NO EXPERIENCE YET. YOU MIGHT BE COOKED. MAYBE TRY TO FIND SOMETHING TO DO IN THE
              PLANNER.
            </p>
          {/each}
        </div>
      {/if}
    </div>
  </div>
  -->
</div>
