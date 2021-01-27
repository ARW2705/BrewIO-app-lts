/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { Timer } from '../../shared/interfaces/timer';

/* Animation imports */
import { expandUpDown } from '../../animations/expand';


@Component({
  selector: 'timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
  animations: [
    expandUpDown()
  ]
})
export class TimerComponent {
  @Input() isConcurrent: boolean = false;
  @Input() onTimerAction: (actionName: string, timer: Timer) => void;
  @Input() timer = null;
  @Input() showDescription: boolean = false;

  constructor() { }

  /**
   * Add a minute to the timer
   *
   * @params: none
   * @return: none
   */
  addToSingleTimer(): void {
    this.onTimerAction('addToSingleTimer', this.timer);
  }

  /**
   * Reset the timer
   *
   * @params: none
   * @return: none
   */
  resetSingleTimer(): void {
    this.onTimerAction('resetSingleTimer', this.timer);
  }

  /**
   * Start the timer
   *
   * @params: none
   * @return: none
   */
  startSingleTimer(): void {
    this.onTimerAction('startSingleTimer', this.timer);
  }

  /**
   * Stop the timer
   *
   * @params: none
   * @return: none
   */
  stopSingleTimer(): void {
    this.onTimerAction('stopSingleTimer', this.timer);
  }

  /**
   * Show or hide individual timer controls
   *
   * @params: timer - a timer type process step instance
   *
   * @return: none
   */
  toggleTimerControls(): void {
    this.timer.show = !this.timer.show;
    this.timer.expansion = {
      value: this.timer.show ? 'expanded' : 'collapsed',
      params: {
        height: this.timer.settings.height,
        speed: 250
      }
    };
  }

}
