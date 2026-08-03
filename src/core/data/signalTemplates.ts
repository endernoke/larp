import type { SignalTemplate } from '../Signal';

export const signalTemplates: SignalTemplate[] = [
  {
    channel: 'reddit',
    applicableTopics: ['cybersecurity-hiring'],
    applicableDirections: ['up'],
    messageTemplates: [
      'Is {sector} hiring again?\nI swear I saw {rand} job postings this week. Is this fr or am I being baited again?',
      '{sector} might be back\nTwo people in my class jsut got interviews for {sector}. I also received a recruiter DM.',
    ],
  },
  {
    channel: 'reddit',
    applicableTopics: ['cybersecurity-hiring'],
    applicableDirections: ['down'],
    messageTemplates: [
      "{sector} is cooked\nI haven't seen any job postings for {sector} in weeks. I think the hype is over.",
    ],
  },
  {
    channel: 'twitter',
    applicableTopics: ['dependency-auditing'],
    applicableDirections: ['up'],
    messageTemplates: [
      'Pro tip: set min-release-age=7d in your npm config. This will help you avoid using packages that have been recently published and may be compromised.',
    ],
  },
];
