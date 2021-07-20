import { HttpHeaders } from '@angular/common/http';

export const mockHttpHeaders: () => HttpHeaders = (): HttpHeaders => {
  const mock: HttpHeaders = new HttpHeaders()
    .set('content-type', 'application/json')
    .set('Access-Control-Allow-Origin', '*');
  return mock;
};
