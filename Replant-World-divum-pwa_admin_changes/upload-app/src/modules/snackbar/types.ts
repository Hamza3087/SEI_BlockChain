export type Severity = 'error' | 'success';

export type Message = {
  message: string;
  severity: Severity;
  duration: number;
};

export type MessageWithId = Message & { id: number };
