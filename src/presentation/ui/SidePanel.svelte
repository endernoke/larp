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
  let pendingTaskTimeAllocations = $state(
    new SvelteMap<string, number>(
      gameState.player.work.map((experience) => [
        experience.id,
        experience.currentAllocatedTimeUnits,
      ]),
    ),
  );
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

  const panelTitles: Record<PanelId, { eyebrow: string; title: string }> = {
    phone: { eyebrow: 'SIGNAL TERMINAL', title: 'Your extremely reliable feed' },
    planner: { eyebrow: 'WEEKLY ALLOCATION', title: 'Spend seven blocks wisely' },
    resume: { eyebrow: 'EVIDENCE INVENTORY', title: 'Things you claim to have done' },
  };
</script>

<aside class="side-panel" aria-label={panelTitles[panel].title}>
  <div class="panel-heading">
    <div>
      <p class="eyebrow">{panelTitles[panel].eyebrow}</p>
      <h2>{panelTitles[panel].title}</h2>
    </div>
    <button type="button" class="close-button" onclick={onClose} aria-label="Close panel">×</button>
  </div>

  {#if panel === 'phone'}
    <div class="source-tabs">
      <span class="selected">All signals</span><span>Messages</span><span>Jobs</span>
    </div>
    <div class="feed-list">
      {#each gameState.world.signals as item}
        {@const title = item.message.split('\n').length > 1 ? item.message.split('\n')[0] : null}
        {@const body = item.message.split('\n').length > 1 ? item.message.split('\n').slice(1).join('\n') : item.message}
        <article class="feed-card">
          <div class="feed-meta"><strong>{item.channel}</strong><span>1h</span></div>
          {#if title}
            <h3>{title}</h3>
          {/if}
          <p>{body}</p>
        </article>
      {/each}
    </div>
  {:else if panel === 'planner'}
    {@const shownTasks = gameState.player.work.filter((experience) => experience.status !== 'completed')}
    {@const shownOpportunities = gameState.player.availableOpportunities}
    {@const totalAllocatedTime = [...pendingTaskTimeAllocations.values()].reduce((sum, time) => sum + time, 0) + [...pendingNewTimeAllocations.values()].reduce((sum, time) => sum + time, 0)}
    <div class="capacity">
      <div>
        <span>ALLOCATED</span><strong>{totalAllocatedTime}/ 7</strong>
      </div>
      <div class="capacity-track">
        <i style:width={`${(totalAllocatedTime / 7) * 100}%`}></i>
      </div>
    </div>
    <div class="task-list">
      {#each shownTasks as task}
        <span
          ><strong>{task.title}</strong
          ><small
            >Estimated {task.actualRequiredTime} time blocks required,
            {task.completedTimeUnits}
            time blocks completed</small
          ></span
        >
        <div class="time-allocation">
          <button
            type="button"
            class="decrement"
            disabled={!pendingTaskTimeAllocations.get(task.id)}
            onclick={() => {
                const current = pendingTaskTimeAllocations.get(task.id) ?? 0;
                pendingTaskTimeAllocations.set(task.id, Math.max(0, current - 1));
              }}
          >
            −
          </button>
          <span>{pendingTaskTimeAllocations.get(task.id) ?? 0}</span>
          <button
            type="button"
            class="increment"
            disabled={totalAllocatedTime >= 9}
            onclick={() => {
                const current = pendingTaskTimeAllocations.get(task.id) ?? 0;
                pendingTaskTimeAllocations.set(task.id, current + 1);
              }}
          >
            +
          </button>
        </div>
      {/each}
    </div>
    <div class="task-list">
      {#each shownOpportunities as opportunity}
        <article>
          <span
            ><strong>{opportunity.title}</strong
            ><small>Estimated {opportunity.baseRequiredTime} time blocks required</small></span
          >
          <div class="time-allocation">
            <button
              type="button"
              class="decrement"
              disabled={!pendingNewTimeAllocations.get(opportunity.id)}
              onclick={() => {
                const current = pendingNewTimeAllocations.get(opportunity.id) ?? 0;
                pendingNewTimeAllocations.set(opportunity.id, Math.max(0, current - 1));
              }}
            >
              −
            </button>
            <span>{pendingNewTimeAllocations.get(opportunity.id) ?? 0}</span>
            <button
              type="button"
              class="increment"
              disabled={totalAllocatedTime >= 9}
              onclick={() => {
                const current = pendingNewTimeAllocations.get(opportunity.id) ?? 0;
                pendingNewTimeAllocations.set(opportunity.id, current + 1);
              }}
            >
              +
            </button>
          </div>
        </article>
      {/each}
    </div>
    <button
      type="button"
      class="secondary-action"
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
      CONFIRM TIME ALLOCATIONS
    </button>
    <button
      type="button"
      class="primary-action"
      onclick={() => gameStore.dispatch({ type: 'advance-week' })}
    >
      LOCK IN THIS WEEK →
    </button>
  {:else}
    {@const experiences = gameState.player.work.filter((experience) => experience.status !== 'not-started')}
    <div class="resume-intro">
      <span class="avatar">CS</span>
      <div>
        <strong>Anonymous Student</strong><small>Fourth-year · Open to literally anything</small>
      </div>
    </div>
    <div class="experience-list">
      {#each experiences as experience, index}
        <article>
          <span class="index">0{index + 1}</span>
          <div>
            <h3>{experience.title}</h3>
          </div>
          <span class="badge">{experience.quality}</span>
        </article>
      {/each}
    </div>
  {/if}
</aside>
