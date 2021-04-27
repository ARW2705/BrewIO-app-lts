/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { Timer } from '../../src/app/shared/interfaces/timer';

/* Component imports */
import { TimerComponent } from '../../src/app/components/timer/timer.component';

@Component({
  selector: 'timer',
  template: '',
  providers: [
    { provide: TimerComponent, useClass: TimerComponentStub }
  ]
})
export class TimerComponentStub {
  @Input() isConcurrent: boolean = false;
  @Input() onTimerAction: (actionName: string, timer: Timer) => void;
  @Input() timer: Timer = null;
  @Input() showDescription: boolean = false;
}
