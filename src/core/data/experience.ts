import type { ExperienceEntryDefinition } from '../PlayerState';

export const experienceDefinitions: ExperienceEntryDefinition[] = [
  {
    id: 'internship-1',
    type: 'internship',
    title: 'Frontend Engineer Internship at TechCorp',
    tag: ['frontend'],
    baseRequiredTime: 28,
    deadlineWeeks: 4,
  },
  {
    id: 'coursework-1',
    type: 'coursework',
    title: '3D Graphics Programming',
    tag: ['3d', 'graphics', 'cpp'],
    baseRequiredTime: 3,
  },
];
