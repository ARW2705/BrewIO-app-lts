import { Alert } from '../../src/app/shared/interfaces';

export const mockAlertPresent: () => Alert = (): Alert => {
  const mock: Alert = {
    title: 'mock-alert',
    description: 'a present step',
    datetime: (new Date()).toISOString()
  };
  return mock;
};
