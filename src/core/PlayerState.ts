import type { Application, Engagement, Notification, TimeAllocation, WorkItem } from './types';

export const experienceTypes = [
  'internship',
  'job',
  'project',
  'hackathon',
  'coursework',
  'research',
  'misc',
] as const;
export type ExperienceType = (typeof experienceTypes)[number];

export interface ExperienceEntryDefinition {
  id: string;
  type: ExperienceType;
  title: string;
  tag: string[];
  baseRequiredTime: number;
  deadlineWeeks?: number;
}

export interface ExperienceEntry {
  id: string;
  definitionId: string;
  type: ExperienceType;
  title: string;
  tag: string[];
  actualRequiredTime: number;
  completedTimeUnits: number;
  status: 'not-started' | 'in-progress' | 'completed';
  currentAllocatedTimeUnits: number;
  startWeek: number;
  deadlineWeeks?: number;
  endWeek: number;
  quality: number;
  impact: number;
  collaborators: string[];
}

export interface PlayerState {
  money: number;
  wellBeing: number;
  gpa: number;
  visibility: number;

  work: WorkItem[];
  applications: Application[];
  engagements: Engagement[];
  notifications: Notification[];
  weeklyPlan: {
    availableTimeUnits: number;
    timeAllocations: TimeAllocation[];
  };
}
