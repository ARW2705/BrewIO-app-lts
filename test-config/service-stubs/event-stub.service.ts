/* Module imports */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/* Interface imports */
import { EventSubscriber } from '../../src/app/shared/interfaces';


@Injectable()
export class EventServiceStub {
  subscribers: EventSubscriber = {};
  public register(...options: any[]): any {
    return new Observable();
  }
  public unregister(...options: any[]) { }
  public emit(...options: any[]) { }
}
