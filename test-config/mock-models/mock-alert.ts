import { Alert } from '../../src/app/shared/interfaces';

export const mockAlert: () => Alert = (): Alert => {
  const mock: Alert = {
    title: 'Mash out / Heat to boil',
    description: 'match mock batch current step',
    datetime: (new Date()).toISOString()
  };
  return mock;
};
