/* Module imports */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/* Interface imports */
import { EventSubscriber } from '../../shared/interfaces/event';


@Injectable({
  providedIn: 'root'
})
export class EventService {
  subscribers: EventSubscriber = {};

  constructor() { }

  /**
   * Emit an event
   *
   * @params: name - the name of the event
   * @params: message - object containing event data
   *
   * @return: none
   */
  emit(name: string, message: object = {}): void {
    if (this.subscribers[name]) {
      console.log('emitting', name, message);
      this.subscribers[name].message.next(message);
    }
  }


  /**
   * Register an event listener
   *
   * @params: name - the event name to listen for
   *
   * @return: event Subject
   */
  register(name: string): Subject<object> {
    if (!this.subscribers[name]) {
      this.subscribers[name] = {
        message: new Subject<object>(),
        subscriberCount: 1
      };
    }
    this.subscribers[name].subscriberCount++;
    return this.subscribers[name].message;
  }

  /**
   * Unregister from an event
   *
   * @params: name - the event name to unregister from
   *
   * @return: none
   */
  unregister(name: string): void {
    if (this.subscribers[name].subscriberCount === 1) {
      this.subscribers[name].message.complete();
      delete this.subscribers[name];
    } else {
      this.subscribers[name].subscriberCount--;
    }
  }

}
