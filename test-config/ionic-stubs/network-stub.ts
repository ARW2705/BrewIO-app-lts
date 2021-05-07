import { Observable, of } from 'rxjs';

export class NetworkStub {
  Connection = {
    NONE: 'NONE'
  };

  public onConnect(): Observable<any> {
    return of();
  }

  public onDisconnect(): Observable<any> {
    return of();
  }
}
