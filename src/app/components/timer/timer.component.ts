/* Module imports */
import { Component, Input, OnInit } from '@angular/core';

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
export class TimerComponent implements OnInit {
  @Input() isConcurrent: boolean = false;
  @Input() onTimerAction: (actionName: string, timer: Timer) => void;
  @Input() timer = null;
  @Input() showDescription: boolean = false;
  chevronPath: string = '';

  constructor() { }

  ngOnInit() {
    this.setChevron();
  }

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
   * Set button icon path up or down
   *
   * @params: none
   * @return: none
   */
  setChevron(): void {
    const isUp: boolean = this.timer.show;
    const xMid: number = this.timer.settings.width / 2;
    const xOffset: number = xMid * 0.2;
    const yEnd: number = this.timer.settings.height * 0.75;
    const yOffset: number = yEnd * 0.1;
    this.chevronPath = `
      M${xMid - xOffset} ${yEnd + (isUp ? yOffset : 0)}
      L${xMid} ${yEnd + (isUp ? 0 : yOffset)}
       ${xMid + xOffset} ${yEnd + (isUp ? yOffset : 0)}
    `;
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
    this.setChevron();
  }

}
