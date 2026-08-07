export interface WorkItemDefinition {
  id: string;
  title: string;
  deadlineWeeks?: number;
  requiredTime: number;
}

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

export type OpportunityKind = 'job' | 'internship' | 'project' | 'graduate-school';

export const sectorIds = [
  'web',
  'ai',
  'cybersecurity',
  'infrastructure',
  'game-dev',
  'research',
] as const;
export type SectorId = (typeof sectorIds)[number];

export interface BaseOpportunity {
  id: string;
  kind: OpportunityKind;
  title: string;
  description: string;
  tags: string[];
}

export type ProfessionalOpportunity = BaseOpportunity & {
  kind: 'job' | 'internship' | 'graduate-school';
  sector: SectorId;
  prerequisites: Requirement[];
  preferredSkills: string[];
  applicationWorkItemDefinitionId?: string;
};

export type ProjectOpportunity = BaseOpportunity & {
  kind: 'project';
  workItemDefinitionId: string;
};

export type Opportunity = ProfessionalOpportunity | ProjectOpportunity;

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
