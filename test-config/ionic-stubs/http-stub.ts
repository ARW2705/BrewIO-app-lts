/* Module imports */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/* Constant imports */
import { API_VERSION, BASE_URL } from '../../src/app/shared/constants';

@Injectable()
export class HttpStub {
  ROOT_URL: string = `${BASE_URL}/${API_VERSION}`;

  constructor(public http: HttpClient) { }

  public get(): Observable<any> {
    return this.http.get<any>(this.ROOT_URL + '/mock');
  }
}
