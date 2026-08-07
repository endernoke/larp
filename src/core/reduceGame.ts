import { advanceWeek } from './advanceWeek';
import { experienceDefinitions } from './data/experience';
import { allOpportunities, allWorkItemDefinitions } from './data/stubs';
import type { GameAction, GameState, GameUpdate } from './GameState';
import type { PlayerState } from './PlayerState';
import type { WorkItemDefinition } from './types';

export function checkOverload(
  player: PlayerState,
  requestedTimeUnits: number,
): 'ok' | 'overload-warning' | 'overload-error' {
  const totalAllocatedTimeUnits =
    player.weeklyPlan.timeAllocations
      .filter((allocation) => allocation.executionMode === 'deferred')
      .reduce((sum, allocation) => sum + allocation.timeUnits, 0) + requestedTimeUnits;

  const maxTimeUnits = 9;
  const comfortableTimeUnits = 7;
  if (totalAllocatedTimeUnits > maxTimeUnits) {
    return 'overload-error';
  }
  if (totalAllocatedTimeUnits > comfortableTimeUnits) {
    return 'overload-warning';
  }
  return 'ok';
}

export function reduceGame(state: GameState, action: GameAction): GameUpdate {
  switch (action.type) {
    case 'advance-week': {
      if (state.currentWeek >= state.maxWeeks - 1) {
        return {
          state,
          outcomes: [{ type: 'action-rejected', message: 'Cannot advance week beyond maxWeeks' }],
        };
      }
      const newState = advanceWeek(state);
      return {
        state: newState,
        outcomes: [{ type: 'week-advanced', newWeek: newState.currentWeek }],
      };
    }

    case 'clear-planner': {
      const newState = { ...state };
      // Clear deferred time allocations only
      newState.player.weeklyPlan.timeAllocations =
        newState.player.weeklyPlan.timeAllocations.filter(
          (allocation) => allocation.executionMode === 'immediate',
        );
      return {
        state: newState,
        outcomes: [{ type: 'work-updated' }],
      };
    }

    case 'allocate-time': {
      const newState = { ...state };
      if (action.targetType === 'work') {
        const overloadStatus = checkOverload(newState.player, action.timeUnits);
        if (overloadStatus === 'overload-error') {
          return {
            state,
            outcomes: [
              {
                type: 'action-rejected',
                message:
                  'You cannot handle the requested workload. Consider improving your well-being or reducing your commitments.',
              },
            ],
          };
        }
        const workItem = newState.player.work.find((workItem) => workItem.id === action.targetId);
        if (!workItem) {
          return {
            state,
            outcomes: [{ type: 'action-rejected', message: 'Work item not found' }],
          };
        }
        newState.player.weeklyPlan.timeAllocations.push({
          activityType: 'work',
          targetId: workItem.id,
          timeUnits: action.timeUnits,
          executionMode: 'deferred',
        });
        return {
          state: newState,
          outcomes: [
            { type: 'work-updated' },
            ...(overloadStatus === 'overload-warning'
              ? [
                  {
                    type: 'reminder' as const,
                    message: 'You are overcommitted. This will result in decreased well-being.',
                  },
                ]
              : []),
          ],
        };
        // } else if (action.targetType === 'application') {
        //   const overloadStatus = checkOverload(newState.player, action.timeUnits);
        //   if (overloadStatus === 'overload-error') {
        //     return {
        //       state,
        //       outcomes: [
        //         {
        //           type: 'action-rejected',
        //           message:
        //             'You cannot handle the requested workload. Consider improving your well-being or reducing your commitments.',
        //         },
        //       ],
        //     };
        //   }
      } else {
        return {
          state,
          outcomes: [{ type: 'action-rejected', message: 'Unknown target type for allocation' }],
        };
      }
    }

    case 'apply-for-opportunity': {
      const newState = { ...state };
      const opportunity = newState.player.opportunities.find(
        (opp) => opp.id === action.opportunityId,
      );
      if (!opportunity) {
        return {
          state,
          outcomes: [{ type: 'action-rejected', message: 'Opportunity not found' }],
        };
      }
      const existingApplication = newState.player.applications.find(
        (app) => app.opportunityId === action.opportunityId,
      );
      if (existingApplication) {
        return {
          state,
          outcomes: [{ type: 'action-rejected', message: 'Already applied for this opportunity' }],
        };
      }
      if (
        opportunity.kind === 'job' ||
        opportunity.kind === 'internship' ||
        opportunity.kind === 'graduate-school'
      ) {
        const workItemDefinition = allWorkItemDefinitions.find(
          (def) => def.id === opportunity.applicationWorkItemDefinitionId,
        );
        if (!workItemDefinition) {
          return {
            state,
            outcomes: [
              {
                type: 'action-rejected',
                message: 'Work item definition for application not found',
              },
            ],
          };
        }
        const workItemId = `application-${opportunity.id}-${newState.currentWeek}`;
        newState.player.work.push({
          id: workItemId,
          definitionId: workItemDefinition.id,
          spentTime: 0,
          quality: 0,
          deadlineWeek: workItemDefinition.deadlineWeeks
            ? newState.currentWeek + workItemDefinition.deadlineWeeks
            : undefined,
        });
        newState.player.applications.push({
          opportunityId: action.opportunityId,
          stage: 'pending',
          workItemId: workItemId,
        });
        return {
          state: newState,
          outcomes: [{ type: 'work-updated' }],
        };
      } else if (opportunity.kind === 'project' || opportunity.kind === 'coursework') {
        // Projects don't need application
        const workItemDefinition = allWorkItemDefinitions.find(
          (def) => def.id === opportunity.workItemDefinitionId,
        );
        if (!workItemDefinition) {
          return {
            state,
            outcomes: [
              {
                type: 'action-rejected',
                message: 'Work item definition for project not found',
              },
            ],
          };
        }
        newState.player.projectIds.push(opportunity.id);
        newState.player.work.push({
          id: `project-${opportunity.id}-${newState.currentWeek}`,
          definitionId: opportunity.workItemDefinitionId,
          spentTime: 0,
          quality: 0,
          deadlineWeek: workItemDefinition.deadlineWeeks
            ? newState.currentWeek + workItemDefinition.deadlineWeeks
            : undefined,
        });
        return {
          state: newState,
          outcomes: [{ type: 'work-updated' }],
        };
      } else {
        return {
          state,
          outcomes: [{ type: 'action-rejected', message: 'Unknown opportunity kind' }],
        };
      }
    }

    case 'submit-application': {
      const newState = { ...state };
      const application = newState.player.applications.find(
        (app) => app.opportunityId === action.opportunityId,
      );
      if (!application) {
        return {
          state,
          outcomes: [{ type: 'action-rejected', message: 'Application not found' }],
        };
      }
      if (application.stage !== 'pending') {
        return {
          state,
          outcomes: [{ type: 'action-rejected', message: 'Application already submitted' }],
        };
      }
      application.stage = 'submitted';
      return {
        state: newState,
        outcomes: [{ type: 'work-updated' }],
      };
    }

    case 'finish-project': {
      const newState = { ...state };
      const projectDefinition = allOpportunities.find((opp) => opp.id === action.projectId);
      if (!projectDefinition) {
        return {
          state,
          outcomes: [{ type: 'action-rejected', message: 'Project not found' }],
        };
      }
      if (projectDefinition.kind === 'project') {
        const workItem = newState.player.work.find(
          (wi) => wi.definitionId === projectDefinition.workItemDefinitionId,
        );
        if (!workItem) {
          return {
            state,
            outcomes: [{ type: 'action-rejected', message: 'Work item for project not found' }],
          };
        }
        newState.player.experiences.push({
          type: 'project',
          title: projectDefinition.title,
          quality: workItem.quality,
          tags: projectDefinition.tags,
        });
        newState.player.projectIds = newState.player.projectIds.filter(
          (id) => id !== action.projectId,
        );
        newState.player.work = newState.player.work.filter((wi) => wi.id !== workItem.id);
        return {
          state: newState,
          outcomes: [{ type: 'work-updated' }],
        };
      } else if (projectDefinition.kind === 'coursework') {
        const workItem = newState.player.work.find(
          (wi) => wi.definitionId === projectDefinition.workItemDefinitionId,
        );
        if (!workItem) {
          return {
            state,
            outcomes: [{ type: 'action-rejected', message: 'Work item for coursework not found' }],
          };
        }
        newState.player.experiences.push({
          type: 'coursework',
          title: projectDefinition.title,
          quality: workItem.quality,
          tags: projectDefinition.tags,
        });
        newState.player.gpa = Math.min(4.0, newState.player.gpa + (workItem.quality / 100) * 0.5);
        newState.player.projectIds = newState.player.projectIds.filter(
          (id) => id !== action.projectId,
        );
        newState.player.work = newState.player.work.filter((wi) => wi.id !== workItem.id);
        return {
          state: newState,
          outcomes: [{ type: 'work-updated' }],
        };
      } else {
        return {
          state,
          outcomes: [{ type: 'action-rejected', message: 'Unknown project kind' }],
        };
      }
    }

    default:
      return {
        state,
        outcomes: [{ type: 'action-rejected', message: 'Unknown action type' }],
      };
  }
}
