import { DeviceInfo } from './device-info.interface';

export interface ErrorReport {
  message: string;
  severity: number;
  timestamp: string;
  userMessage: string;
  device?: DeviceInfo;
  name?: string;
  stackTrace?: string;
  statusCode?: number;
  headers?: string;
  url?: string;
  dismissFn?: () => void;
}

/**
 * Error severity explained:
 *
 * Possible values: 1 - 4; 1 most severe; 4 least severe
 *
 * 1 - fatal error; require reload, exit app; show error modal and send report
 *
 * 2 - non fatal, but still unexpected error; require routing to home, may
 *     lose current changes to doc that threw the error, but can otherwise
 *     continue operation; http errors such as 5XX, 400, and some 404 responses;
 *     show error modal and send report
 *
 * 3 - non fatal, but ~expected error; thrown errors within my code; will
 *     be custom errors; http errors such as 401 and most 404 errors; show error
 *     message toast, do not send report
 *
 * 4 - non fatal, non content errors; errors that may be thrown, but were expected
 *     and will have little to no impact on user experience such as a scroll event
 *     not triggering; do not show error; ?still send report?
 */
