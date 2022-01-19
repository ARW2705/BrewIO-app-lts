/* Interface imports */
import { HttpErrorResponse } from '@angular/common/http';

/* Mock imports */
import { mockHttpHeaders } from './mock-http-headers';

/**
 * Get a mock HttpErrorResponse object
 *
 * @param: status - HTTP error status
 * @param: statusText - error message
 * @param: [url] - optional url
 * @param: [error] - optional error to apply to response
 * @return: custom HttpErrorResponse
 */
export const mockErrorResponse: (status: number, statusText: string, url?: string, error?: object) => HttpErrorResponse = (status: number, statusText: string, url?: string, error?: object): HttpErrorResponse => {
  const mock: { [key: string]: any } = { status, statusText };

  if (url) {
    mock['url'] = url;
  }

  if (error) {
    mock['error'] = error;
  }

  mock['headers'] = mockHttpHeaders();

  return new HttpErrorResponse(mock);
};
