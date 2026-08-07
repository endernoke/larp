import type {
  Application,
  Engagement,
  Experience,
  Notification,
  Opportunity,
  PostGradOption,
  TimeAllocation,
  WorkItem,
} from './types';

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

  postGradOptions: PostGradOption[];
  selectedPostGradOption?: PostGradOption;
}
