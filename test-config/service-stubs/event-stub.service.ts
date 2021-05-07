import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class EventServiceStub {
  public register(...args) {
    return new Observable();
  }
  public unregister(...args) { }
  public emit(...args) { }
}
