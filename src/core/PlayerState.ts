export type ExperienceType = 'internship' | 'job' | 'hackathon' | 'coursework' | 'research';

export interface ExperienceEntry {
  id: string;
  type: ExperienceType;
  title: string;
  tag: string[];
  startWeek: number;
  endWeek: number;
  completionPercentage: number;
  quality: number;
  impact: number;
  collaborators: string[];
}

export interface PlayerState {
  wealth: number;
  wellBeing: number;
  grades: number;
  visibility: number;

  experiences: ExperienceEntry[];
  calendar: string;
}
