import type {
  Application,
  Engagement,
  Experience,
  Notification,
  Opportunity,
  TimeAllocation,
  WorkItem,
} from './types';

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

export interface PlayerState {
  money: number;
  wellBeing: number;
  gpa: number;
  visibility: number;

  work: WorkItem[];
  opportunities: Opportunity[];
  applications: Application[];
  engagements: Engagement[];
  projectIds: string[];
  notifications: Notification[];
  weeklyPlan: {
    availableTimeUnits: number;
    timeAllocations: TimeAllocation[];
  };
  experiences: Experience[];
}
