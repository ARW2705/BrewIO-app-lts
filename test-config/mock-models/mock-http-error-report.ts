import { ErrorReport } from '../../src/app/shared/interfaces';

export const mockHttpErrorReport: (errCode: number) => ErrorReport = (errCode: number): ErrorReport => {
  const mock: ErrorReport = {
    name: 'test-name',
    message: 'test-message',
    severity: 3,
    statusCode: errCode,
    timestamp: 'timestamp',
    userMessage: 'test-user-message',
    dismissFn: null,
    headers: '',
    url: ''
  };
  return mock;
};
