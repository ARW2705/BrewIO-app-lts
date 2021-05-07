/* Interface imports */
import { HttpErrorResponse } from '@angular/common/http';

export const mockErrorResponse: (status: number, statusText: string, error?: object) => HttpErrorResponse = (status: number, statusText: string, error?: object): HttpErrorResponse => {
  const mock = {
    status: status,
    statusText: statusText
  };

  if (error) {
    mock['error'] = error;
  }

  return new HttpErrorResponse(mock);
};
