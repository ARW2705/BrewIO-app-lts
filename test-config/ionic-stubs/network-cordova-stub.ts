import { Observable } from 'rxjs';

import { NetworkStub } from './network-stub';

export class NetworkCordovaStub extends NetworkStub {
  constructor() {
    super();
  }

  public get type(): string {
    return 'cordova';
  }

  public onConnect(): Observable<any> {
    let emitter;
    const obs = Observable.create((observer: any) => emitter = observer);
    setTimeout(() => {
      emitter.next(true);
    }, 10);
    return obs;
  }

  public onDisconnect(): Observable<any> {
    let emitter;
    const obs = Observable.create((observer: any) => emitter = observer);
    setTimeout(() => {
      emitter.next(true);
    }, 30);
    return obs;
  }
}
