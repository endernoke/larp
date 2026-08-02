export interface MockFeedItem {
  source: string;
  age: string;
  title: string;
  body: string;
  tone: 'signal' | 'noise' | 'direct';
}

export const mockFeed: MockFeedItem[] = [
  {
    source: 'r/csMajors',
    age: '14m',
    title: 'Is security suddenly hiring or am I being baited?',
    body: 'Saw twelve junior roles this morning. All require seven years of Kubernetes, naturally.',
    tone: 'signal',
  },
  {
    source: 'LinkedIn',
    age: '38m',
    title: 'Thrilled to announce I have been laid off',
    body: 'After an incredible 11 weeks, I am excited for whatever comes next. #OpenToWork #Resilience',
    tone: 'noise',
  },
  {
    source: 'Maya · DM',
    age: '1h',
    title: 'Small heads-up',
    body: 'The breach is real. Our security team may open two junior seats before the posting goes public.',
    tone: 'direct',
  },
];

export const mockWeekPlan = [
  { label: 'Finish portfolio deployment', cost: 3, selected: true },
  { label: 'Coffee chat with Maya', cost: 1, selected: true },
  { label: 'Apply: Security intern', cost: 2, selected: false },
  { label: 'Touch grass', cost: 1, selected: false },
];

export const mockExperiences = [
  { title: 'Coursework Compiler', meta: 'Systems · C++', score: 'unfinished' },
  { title: 'Campus Map Prototype', meta: 'Web · Accessibility', score: '58 quality' },
  { title: 'README typo fix', meta: 'Open source · Collaboration', score: 'merged' },
];

// TODO(backend): Replace these exported constants with selectors over the
// authoritative GameState and relational content repository.
