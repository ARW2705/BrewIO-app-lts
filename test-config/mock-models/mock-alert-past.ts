import { Alert } from '../../src/app/shared/interfaces';

export const mockAlertPast: () => Alert = (): Alert => {
  const mock: Alert = {
    title: 'mock-alert',
    description: 'a past step',
    datetime: '2019-11-01T12:00:00Z'
  };
  return mock;
};
