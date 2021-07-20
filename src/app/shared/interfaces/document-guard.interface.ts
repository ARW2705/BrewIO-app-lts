export interface DocumentGuard {
  [key: string]: {
    type: string;
    required: boolean;
  };
}
