import { DocumentGuard } from '../interfaces';

export const CalendarProcessGuardMetadata: DocumentGuard = {
  duration:      { type: 'number', required: true  },
  startDatetime: { type: 'string', required: false }
};
