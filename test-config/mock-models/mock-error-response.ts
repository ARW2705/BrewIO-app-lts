/* Interface imports */
import { HttpErrorResponse } from '@angular/common/http';

/* Mock imports */
import { mockHttpHeaders } from './mock-http-headers';

export const mockErrorResponse: (status: number, statusText: string, url?: string, error?: object) => HttpErrorResponse = (status: number, statusText: string, url?: string, error?: object): HttpErrorResponse => {
  const mock = {
    status: status,
    statusText: statusText
  };

  if (url) {
    mock['url'] = url;
  }

  if (error) {
    mock['error'] = error;
  }

  mock['headers'] = mockHttpHeaders();

  return new HttpErrorResponse(mock);
};
