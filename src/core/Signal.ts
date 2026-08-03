export type InfoChannel =
  | 'reddit'
  | 'linkedin'
  | 'twitter'
  | 'recruiter-dm'
  | 'connection-dm'
  | 'billboard'
  | 'conversation';

export interface SignalTemplate {
  channel: InfoChannel;
  applicableTopics: string[];
  applicableDirections: string[];
  messageTemplates: string[];
}

export interface Signal {
  channel: InfoChannel;
  message: string;
}
