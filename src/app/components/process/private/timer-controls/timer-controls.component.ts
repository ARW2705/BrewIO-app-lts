/* Module imports */
import { Component, Input, OnInit } from '@angular/core';

/* Interface imports */
import { Timer, TimerProcess } from '@shared/interfaces';

/* Service imports */
import { IdService, TimerService } from '@services/public';


@Component({
  selector: 'app-timer-controls',
  templateUrl: './timer-controls.component.html',
  styleUrls: ['./timer-controls.component.scss'],
})
export class TimerControlsComponent implements OnInit {
  @Input() processes: TimerProcess[] = [];
  @Input() timers: Timer[] = [];
  multiText: string;

  constructor(
    public idService: IdService,
    public timerService: TimerService
  ) { }

  ngOnInit() {
    const multiTimerCount: number = 2;
    this.multiText = this.timers.length < multiTimerCount ? '' : ' All';
  }

  /**
   * Add one minute to each timer
   *
   * @param: none
   * @return: none
   */
  addTime(): void {
    this.timers.forEach((timer: Timer): void => this.timerService.addTimeToTimer(timer.cid));
  }

  /**
   * Reset each timer
   *
   * @param: none
   * @return: none
   */
  reset(): void {
    this.timers.forEach((timer: Timer): void => {
      const process: TimerProcess = this.processes
        .find((_process: TimerProcess): boolean => {
          return this.idService.hasId(_process, timer.timer.cid);
        });
      if (process) {
        this.timerService.resetTimer(timer.cid, process.duration);
      } else {
        console.log('could not find process', timer, this.processes);
      }
    });
  }

  /**
   * Start each timer
   *
   * @param: none
   * @return: none
   */
  start(): void {
    this.timers.forEach((timer: Timer): void => this.timerService.startTimer(timer.cid));
  }

  /**
   * Stop each timer
   *
   * @param: none
   * @return: none
   */
  stop(): void {
    this.timers.forEach((timer: Timer): void => this.timerService.stopTimer(timer.cid));
  }

}
