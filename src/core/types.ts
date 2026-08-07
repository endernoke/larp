export interface WorkItemDefinition {
  id: string;
  title: string;
  deadlineWeeks?: number;
  requiredTime: number;
}

export const allWorkItemDefinitions: WorkItemDefinition[] = [];

export interface WorkItem {
  id: string;
  definitionId: string;
  spentTime: number;
  quality: number;
  deadlineWeek?: number;
}

export interface TimeAllocation {
  activityType: 'work';
  targetId: string;
  timeUnits: number;
  executionMode: 'deferred' | 'immediate';
}

export type OpportunityKind =
  | 'job'
  | 'internship'
  | 'scholarship'
  | 'hackathon'
  | 'conference'
  | 'research'
  | 'graduate-school';

export interface Opportunity {
  id: string;
  kind: OpportunityKind;
  pursuitMode: 'application' | 'registration';
  title: string;
  description: string;
  prerequisites: Requirement[];
  preferredSkills: string[];
  tags: string[];
  applicationWorkItemDefinitionId: string;
}

export interface Application {
  opportunityId: string;
  workItemId: string;
  stage: 'pending' | 'submitted' | 'accepted' | 'rejected';
}

export interface EngagementDefinition {
  id: string;
  opportunityId: string;
  organizationId: string;
  compensation: string;
  durationWeeks?: number;
  workItemDefinitionIds: string[][];
}

export interface Engagement {
  id: string;
  definitionId: string;
  performance: number;
  startWeek: number;
  currentWorkItemIds: string[];
}

export type Requirement =
  | {
      type: 'gpa';
      minValue: number;
    }
  | {
      type: 'student-status';
    };

export type Effect = string;

export interface Notification {
  week: number;
  message: string;
}

export interface Experience {
  type: 'internship' | 'job' | 'coursework' | 'project';
  title: string;
  quality: number;
  tags: string[];
}
