import { allEngagementDefinitions, allOpportunities, allWorkItemDefinitions } from './data/stubs';
import type { GameState } from './GameState';
import type {
  Application,
  Effect,
  Engagement,
  EngagementDefinition,
  Experience,
  Opportunity,
  ProfessionalOpportunity,
  Requirement,
  TimeAllocation,
  WorkItem,
  WorkItemDefinition,
} from './types';

export function createWeeklyWorkItems(
  engagementDefinition: EngagementDefinition,
  weekIndex: number,
  currentWeek: number,
): WorkItem[] {
  const newWorkItems: WorkItem[] = [];
  if (engagementDefinition.workItemDefinitionIds.length <= weekIndex) {
    return [];
  }
  engagementDefinition.workItemDefinitionIds[weekIndex].forEach((definitionId) => {
    const workItemDefinition = allWorkItemDefinitions.find((wid) => wid.id === definitionId);
    if (!workItemDefinition) return;
    newWorkItems.push({
      id: `work-${definitionId}-${weekIndex}`,
      definitionId,
      spentTime: 0,
      quality: 0,
      deadlineWeek: workItemDefinition.deadlineWeeks
        ? currentWeek + workItemDefinition.deadlineWeeks
        : undefined,
    });
  });
  return newWorkItems;
}

export function checkOpportunityEligibility(
  player: GameState['player'],
  opportunity: ProfessionalOpportunity,
): boolean {
  return opportunity.prerequisites.every((requirement) => {
    switch (requirement.type) {
      case 'gpa':
        return player.gpa >= requirement.minValue;
      case 'student-status':
        // TODO
        return true;
      default:
        return false;
    }
  });
}

export function evaluateApplications(gameState: GameState): GameState {
  const newState = { ...gameState };
  newState.player.applications.forEach((app) => {
    const opportunity = allOpportunities.find((o) => o.id === app.opportunityId);
    if (!opportunity) return;
    if (
      opportunity.kind !== 'job' &&
      opportunity.kind !== 'internship' &&
      opportunity.kind !== 'graduate-school'
    )
      return;
    if (app.stage !== 'submitted') return;
    if (!checkOpportunityEligibility(newState.player, opportunity)) {
      app.stage = 'rejected';
      newState.player.work = newState.player.work.filter((wi) => wi.id !== app.workItemId);
      return;
    }
    const workItem = newState.player.work.find((wi) => wi.id === app.workItemId);
    if (!workItem) return;
    const relevanceScore =
      opportunity.preferredSkills.reduce((score, skill) => {
        for (const experience of newState.player.experiences) {
          if (experience.tags.includes(skill)) {
            score += experience.quality * 0.01;
            return score;
          }
        }
        return score;
      }, 0) / opportunity.preferredSkills.length;
    const sectorStateScore = (newState.world.sectors[opportunity.sector]?.demand ?? 0) * 0.01;
    const overallScore =
      (workItem.quality * 0.25 + relevanceScore * 100 * 0.25 + sectorStateScore * 100 * 0.5) / 100;
    if (newState.rng() < overallScore) {
      app.stage = 'accepted';
    } else {
      app.stage = 'rejected';
    }
    newState.player.work = newState.player.work.filter((wi) => wi.id !== app.workItemId);
  });
  return newState;
}

export function handleApplicationResults(gameState: GameState): GameState {
  const newState = { ...gameState };
  newState.player.applications.forEach((app) => {
    const opportunity = allOpportunities.find((o) => o.id === app.opportunityId);
    if (!opportunity) return;
    if (app.stage === 'accepted') {
      const engagementDefinition = allEngagementDefinitions.find((ed) => ed.id === opportunity.id);
      if (!engagementDefinition) return;

      const newWorkItems = createWeeklyWorkItems(engagementDefinition, 0, newState.currentWeek);
      newState.player.work.push(...newWorkItems);
      const engagement: Engagement = {
        id: `engagement-${app.opportunityId}`,
        definitionId: engagementDefinition.id,
        performance: 0,
        startWeek: newState.currentWeek,
        currentWorkItemIds: newWorkItems.map((wi) => wi.id),
      };
      newState.player.engagements.push(engagement);
      newState.player.notifications.push({
        week: newState.currentWeek,
        message: `Your application for ${opportunity.title} was accepted! Time to lock in..`,
      });
    } else if (app.stage === 'rejected') {
      newState.player.notifications.push({
        week: newState.currentWeek,
        message: `Your application for ${opportunity.title} was rejected.`,
      });
    }
  });
  newState.player.applications = newState.player.applications.filter(
    (app) => app.stage === 'pending',
  );
  return newState;
}

export function processWeeklyEngagements(gameState: GameState): GameState {
  const newState = { ...gameState };
  // Currently assuming all engagement work items are one-week tasks
  const terminatedEngagementIds: string[] = [];
  newState.player.engagements.forEach((engagement) => {
    const engagementDefinition = allEngagementDefinitions.find(
      (ed) => ed.id === engagement.definitionId,
    );
    if (!engagementDefinition) return;

    newState.player.money += engagementDefinition.weeklyCompensation;

    let averageQuality = 0;
    engagement.currentWorkItemIds.forEach((workItemId) => {
      const workItem = newState.player.work.find((wi) => wi.id === workItemId);
      if (!workItem) return;
      averageQuality += workItem.quality;
    });
    averageQuality /= engagement.currentWorkItemIds.length;
    const prevWeeksWeighting = newState.currentWeek - engagement.startWeek + 1;
    engagement.performance =
      (engagement.performance * prevWeeksWeighting + averageQuality) / (prevWeeksWeighting + 1);
    if (engagement.performance < 50) {
      terminatedEngagementIds.push(engagement.id);
      newState.player.notifications.push({
        week: newState.currentWeek,
        // FIXME
        message: `You have been laid off from ${engagementDefinition.opportunityId} due to poor performance.`,
      });
      return;
    }
    const nextWeekIndex = newState.currentWeek - engagement.startWeek + 1;
    if (engagementDefinition.workItemDefinitionIds.length <= nextWeekIndex) {
      terminatedEngagementIds.push(engagement.id);
      const opportunity = allOpportunities.find((o) => o.id === engagementDefinition.opportunityId);
      if (opportunity) {
        newState.player.experiences.push({
          type:
            opportunity.kind === 'job' || opportunity.kind === 'internship'
              ? opportunity.kind
              : 'project',
          title: opportunity.title,
          quality: engagement.performance,
          tags: opportunity.tags,
        });
      }
      newState.player.notifications.push({
        week: newState.currentWeek,
        message: `Your engagement with ${engagementDefinition.opportunityId} has ended.`,
      });
      return;
    }
    const nextWeekWorkItems = createWeeklyWorkItems(
      engagementDefinition,
      nextWeekIndex,
      newState.currentWeek,
    );
    engagement.currentWorkItemIds = nextWeekWorkItems.map((wi) => wi.id);
    newState.player.work.push(...nextWeekWorkItems);
  });
  newState.player.engagements = newState.player.engagements.filter(
    (engagement) => !terminatedEngagementIds.includes(engagement.id),
  );
  return newState;
}

export function applyTimeAllocations(gameState: GameState): GameState {
  const newState = { ...gameState };

  let totalWorkload = 0;
  newState.player.weeklyPlan.timeAllocations.forEach((allocation) => {
    totalWorkload += allocation.timeUnits;
    if (allocation.activityType === 'work') {
      const workItem = newState.player.work.find((wi) => wi.id === allocation.targetId);
      const workItemDefinition = allWorkItemDefinitions.find(
        (wid) => wid.id === workItem?.definitionId,
      );
      if (!workItem || !workItemDefinition) return;
      workItem.spentTime += allocation.timeUnits;
      workItem.quality = Math.min(
        100,
        workItem.quality +
          (allocation.timeUnits / workItemDefinition.requiredTime) *
            (newState.player.wellBeing / 100),
      );
    }
  });

  newState.player.wellBeing = Math.max(
    20,
    Math.min(120, newState.player.wellBeing + (1 - totalWorkload / 7) * 100),
  );
  newState.player.weeklyPlan.availableTimeUnits = Math.round(
    Math.max(5, Math.min(9, newState.player.wellBeing / 10)),
  );

  newState.player.weeklyPlan.timeAllocations = [];

  return newState;
}
