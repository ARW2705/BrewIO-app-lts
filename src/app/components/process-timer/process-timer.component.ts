/* Module imports */
import { Component, ElementRef, Input, OnInit, OnChanges, OnDestroy, QueryList, SimpleChange, SimpleChanges, ViewChildren } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/* Interface imports */
import { Process } from '../../shared/interfaces/process';
import { Timer } from '../../shared/interfaces/timer';

/* Utility imports */
import { hasId } from '../../shared/utility-functions/id-helpers';

/* Service imports */
import { TimerService } from '../../services/timer/timer.service';
import { ToastService } from '../../services/toast/toast.service';


@Component({
  selector: 'process-timer',
  templateUrl: './process-timer.component.html',
  styleUrls: ['./process-timer.component.scss']
})
export class ProcessTimerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() batchId: string;
  @Input() isPreview: boolean;
  @Input() stepData: Process[];
  @ViewChildren('slidingTimers') slidingTimers: QueryList<ElementRef>;
  destroy$: Subject<boolean> = new Subject<boolean>();
  isConcurrent: boolean = false;
  onTimerAction: (actionName: string, timer: Timer) => void;
  showDescription: boolean = false;
  timerActions: object = {
    addToSingleTimer: this.addToSingleTimer.bind(this),
    resetSingleTimer: this.resetSingleTimer.bind(this),
    startSingleTimer: this.startSingleTimer.bind(this),
    stopSingleTimer: this.stopSingleTimer.bind(this)
  };
  timers: Timer[] = [];

  constructor(
    public timerService: TimerService,
    public toastService: ToastService
  ) {
    this.onTimerAction = this.onTimerActionHandler.bind(this);
  }

  /***** Lifecycle Hooks *****/

  ngOnInit() {
    console.log('process timer component init');
    this.initTimers();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('process timer component changes', changes);
    const stepChange: SimpleChange = changes.stepData;
    if (stepChange !== undefined && stepChange.currentValue !== undefined) {
      if (stepChange.currentValue[0].type !== 'timer') {
        this.destroy$.next(true);
      } else if (this.hasChanges(stepChange)) {
        this.stepData = stepChange.currentValue;
        this.destroy$.next(true);
        this.initTimers();
      }
    }

    if (changes.isPreview !== undefined && changes.isPreview.currentValue) {
      this.isPreview = changes.isPreview.currentValue;
    }
  }

  ngOnDestroy() {
    console.log('process timer component destroy');
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  /***** End Lifecycle Hooks *****/


  /***** Timer Controls *****/

  /**
   * Add a minute to all timers for the current step
   *
   * @params: none
   * @return: none
   */
  addToAllTimers(): void {
    this.timers.forEach((timer: Timer): void => this.addToSingleTimer(timer));
  }

  /**
   * Add a minute to a single timer instance
   *
   * @params: timer - the timer with which to add time
   *
   * @return: none
   */
  addToSingleTimer(timer: Timer): void {
    this.timerService.addTimeToTimer(this.batchId, timer.cid)
      .subscribe(
        (): void => console.log('added time to timer', timer.cid),
        (error: string): void => {
          console.log('error adding time to timer', error);
          this.toastService.presentErrorToast(
            'Error: unable to add time to timer'
          );
        }
      );
  }

  /**
   * Reset all timers for the current Step
   *
   * @params: none
   * @return: none
   */
  resetAllTimers(): void {
    this.timers.forEach((timer: Timer): void => this.resetSingleTimer(timer));
  }

  /**
   * Reset a single timer instance
   *
   * @params: timer - the timer to reset
   *
   * @return: none
   */
  resetSingleTimer(timer: Timer): void {
    const process: Process = this.stepData
      .find((_process: Process): boolean => {
        return hasId(_process, timer.timer.cid);
      });

    this.timerService.resetTimer(this.batchId, timer.cid, process.duration)
      .subscribe(
        (): void => console.log('reset timer', timer.cid),
        (error: string): void => {
          console.log('error resetting timer', error);
          this.toastService.presentErrorToast('Error: unable to reset timer');
        }
      );
  }

  /**
   * Start all timers for the current step
   *
   * @params: none
   * @return: none
   */
  startAllTimers(): void {
    this.timers.forEach((timer: Timer): void => this.startSingleTimer(timer));
  }

  /**
   * Start a single timer instance
   *
   * @params: timer - the timer to start
   *
   * @return: none
   */
  startSingleTimer(timer: Timer): void {
    this.timerService.startTimer(this.batchId, timer.cid)
      .subscribe(
        (): void => console.log('started timer', timer.cid),
        (error: string): void => {
          console.log('error starting timer', error);
          this.toastService.presentErrorToast('Error: unable to start timer');
        }
      );
  }

  /**
   * Stop all timers for the current step
   *
   * @params: none
   * @return: none
   */
  stopAllTimers(): void {
    this.timers.forEach((timer: Timer): void => this.stopSingleTimer(timer));
  }

  /**
   * Stop a single timer instance
   *
   * @params: timer - the timer to stop
   *
   * @return: none
   */
  stopSingleTimer(timer: Timer): void {
    this.timerService.stopTimer(this.batchId, timer.cid)
      .subscribe(
        (): void => console.log('stopped timer', timer.cid),
        (error: string): void => {
          console.log('error stopping timer', error);
          this.toastService.presentErrorToast('Error: unable to stop timer');
        }
      );
  }

  /**
   * Show or hide the current step description
   *
   * @params: none
   * @return: none
   */
  toggleShowDescription(): void {
    this.showDescription = !this.showDescription;
  }

  /***** End Timer Controls *****/


  /***** Timer Settings *****/

  /**
   * Initialize timers for the current step and subscribe to their subjects
   *
   * @params: none
   * @return: none
   */
  initTimers(): void {
    this.timers = [];
    const timers: BehaviorSubject<Timer>[] = this.timerService
      .getTimersByProcessId(this.batchId, this.stepData[0].cid);

    if (timers === undefined) {
      this.isConcurrent = false;
      return;
    }

    this.isConcurrent = timers.length > 1;
    timers.forEach(
      (timer$: BehaviorSubject<Timer>): void => {
        timer$
          .pipe(takeUntil(this.destroy$))
          .subscribe((timer: Timer): void => this.updateTimerInList(timer));
      }
    );
  }

  /**
   * Update a timer in timers list or add to list if it is not present
   *
   * @params: timer - updated Timer
   *
   * @return: none
   */
  updateTimerInList(timer: Timer): void {
    const timerIndex: number = this.timers
      .findIndex((_timer: Timer): boolean => _timer.cid === timer.cid);

    if (timerIndex === -1) {
      this.timers.push(timer);
    } else {
      this.timers[timerIndex] = timer;
    }
  }

  /***** End Timer Settings *****/


  /***** Other *****/

  /**
   * Check if new changes object has the same values as the previous
   * changes object
   *
   * @params: changes - changes detected from ngOnChanges
   *
   * @return: true if current values are different than previous values
   */
  hasChanges(changes: SimpleChange): boolean {
    return JSON.stringify(changes.currentValue) !== JSON.stringify(changes.previousValue);
  }

  /**
   * Handle timer component function calls
   *
   * @params: actionName - the method name called
   * @params: timer - the origin timer
   *
   * @return: none
   */
  onTimerActionHandler(actionName: string, timer: Timer): void {
    try {
      this.timerActions[actionName](timer);
    } catch (error) {
      console.log('Timer action error', actionName, error);
    }
  }

}
