<script lang="ts">
  import type { PanelId } from '../bridge/frontendBridge';
  import { mockExperiences, mockFeed, mockWeekPlan } from '../mocks/mockData';

  interface Props {
    panel: PanelId;
    onClose: () => void;
  }

  let { panel, onClose }: Props = $props();
  let chosenTasks = $state(
    new Set(mockWeekPlan.filter((task) => task.selected).map((task) => task.label)),
  );

  const panelTitles: Record<PanelId, { eyebrow: string; title: string }> = {
    phone: { eyebrow: 'SIGNAL TERMINAL', title: 'Your extremely reliable feed' },
    planner: { eyebrow: 'WEEKLY ALLOCATION', title: 'Spend seven blocks wisely' },
    resume: { eyebrow: 'EVIDENCE INVENTORY', title: 'Things you claim to have done' },
  };

  function toggleTask(label: string): void {
    const next = new Set(chosenTasks);
    if (next.has(label)) next.delete(label);
    else next.add(label);
    chosenTasks = next;
  }
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
      {#each mockFeed as item}
        <article class="feed-card {item.tone}">
          <div class="feed-meta"><strong>{item.source}</strong><span>{item.age}</span></div>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
          <div class="feed-footer"><span>MARK AS USEFUL</span><span>•••</span></div>
        </article>
      {/each}
    </div>
  {:else if panel === 'planner'}
    <div class="capacity">
      <div>
        <span>ALLOCATED</span
        ><strong
          >{[...chosenTasks].reduce((sum, label) => sum + (mockWeekPlan.find((item) => item.label === label)?.cost ?? 0), 0)}
          / 7</strong
        >
      </div>
      <div class="capacity-track">
        <i
          style:width={`${([...chosenTasks].reduce((sum, label) => sum + (mockWeekPlan.find((item) => item.label === label)?.cost ?? 0), 0) / 7) * 100}%`}
        ></i>
      </div>
    </div>
    <div class="task-list">
      {#each mockWeekPlan as task}
        <button
          type="button"
          class:selected={chosenTasks.has(task.label)}
          onclick={() => toggleTask(task.label)}
        >
          <span class="checkbox">{chosenTasks.has(task.label) ? '✓' : ''}</span>
          <span
            ><strong>{task.label}</strong
            ><small>{task.cost} time {task.cost === 1 ? 'block' : 'blocks'}</small></span
          >
          <b>{task.cost}</b>
        </button>
      {/each}
    </div>
    <button type="button" class="primary-action">LOCK IN THIS WEEK →</button>
    <p class="integration-note">
      Prototype only — this button will later dispatch an ALLOCATE_TIME action.
    </p>
  {:else}
    <div class="resume-intro">
      <span class="avatar">CS</span>
      <div>
        <strong>Anonymous Student</strong><small>Fourth-year · Open to literally anything</small>
      </div>
    </div>
    <div class="experience-list">
      {#each mockExperiences as experience, index}
        <article>
          <span class="index">0{index + 1}</span>
          <div>
            <h3>{experience.title}</h3>
            <p>{experience.meta}</p>
          </div>
          <span class="badge">{experience.score}</span>
        </article>
      {/each}
    </div>
    <div class="match-card">
      <p class="eyebrow">ACTIVE OPPORTUNITY</p>
      <h3>Junior Security Intern</h3>
      <div class="match-line"><span>Current fit</span><strong>LONG SHOT</strong></div>
      <p>Your typo fix proves you can technically use Git.</p>
    </div>
  {/if}
</aside>
