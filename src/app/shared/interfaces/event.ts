import { Subject } from 'rxjs';

export interface EventSubscriber {
  [key: string]: {
    message: Subject<object>;
    subscriberCount: number;
  };
}
