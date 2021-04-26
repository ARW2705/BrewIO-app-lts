import { Alert } from '../../src/app/shared/interfaces/alert';

export const mockAlert: () => Alert = (): Alert => {
  const mock: Alert = {
    title: 'Mash out / Heat to boil',
    description: 'match mock batch current step',
    datetime: (new Date()).toISOString()
  };
  return mock;
};

export const mockAlertPast: () => Alert = (): Alert => {
  const mock: Alert = {
    title: 'mock-alert',
    description: 'a past step',
    datetime: '2019-11-01T12:00:00Z'
  };
  return mock;
};

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

export const mockAlertPresent: () => Alert = (): Alert => {
  const mock: Alert = {
    title: 'mock-alert',
    description: 'a present step',
    datetime: (new Date()).toISOString()
  };
  return mock;
};
