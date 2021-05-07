import { Alert } from '../../src/app/shared/interfaces/alert';

export const mockAlertFuture: () => Alert = (): Alert => {
  const future: Date = new Date();
  future.setFullYear(future.getFullYear() + 1);
  const mock: Alert = {
    title: 'mock-alert',
    description: 'a future step',
    datetime: future.toISOString()
  };
  return mock;
};
