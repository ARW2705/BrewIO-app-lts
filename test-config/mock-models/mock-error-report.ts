import { ErrorReport } from '../../src/app/shared/interfaces';

export const mockErrorReport: () => ErrorReport = (): ErrorReport => {
  const mock: ErrorReport = {
    name: 'test-name',
    message: 'test-message',
    severity: 3,
    stackTrace: 'stack',
    timestamp: 'timestamp',
    userMessage: 'test-user-message',
    dismissFn: null
  };
  return mock;
};
