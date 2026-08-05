import type { GameState } from './GameState';
import type {
  Application,
  Effect,
  Engagement,
  EngagementDefinition,
  Opportunity,
  Requirement,
  WorkItem,
  WorkItemDefinition,
} from './types';

const allOpportunities = [] as Opportunity[];
const allEngagementDefinitions = [] as EngagementDefinition[];
const allworkItemDefinitions = [] as WorkItemDefinition[];

export function handleApplicationResults(gameState: GameState): GameState {
  const newState = { ...gameState };
  newState.player.applications.forEach((app) => {
    const opportunity = allOpportunities.find((o) => o.id === app.opportunityId);
    if (!opportunity) return;
    if (app.stage === 'accepted') {
      const engagementDefinition = allEngagementDefinitions.find((ed) => ed.id === opportunity.id);
      if (!engagementDefinition) return;

      const newWorkItemIds: string[] = [];
      if (engagementDefinition.workItemDefinitionIds.length > 0) {
        // First week
        engagementDefinition.workItemDefinitionIds[0].forEach((definitionId) => {
          const workItemDefinition = allworkItemDefinitions.find((wid) => wid.id === definitionId);
          if (!workItemDefinition) return;
          const workItemId: string = `work-${definitionId}-${newState.currentWeek}`;
          const workItem: WorkItem = {
            id: workItemId,
            definitionId,
            spentTime: 0,
            quality: 0,
            deadlineWeeks: workItemDefinition.deadlineWeeks,
          };
          newState.player.work.push(workItem);
          newWorkItemIds.push(workItemId);
        });
      }

      const engagement: Engagement = {
        id: `engagement-${app.opportunityId}`,
        definitionId: engagementDefinition.id,
        performance: 0,
        startWeek: newState.currentWeek,
        currentWorkItemIds: newWorkItemIds,
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
  newState.player.applications = [];
  return newState;
}
