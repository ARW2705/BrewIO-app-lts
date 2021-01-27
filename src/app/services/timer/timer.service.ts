/* Module imports */
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

/* Interface imports */
import { Batch } from '../../shared/interfaces/batch';
import { Process } from '../../shared/interfaces/process';
import { ProgressCircleSettings } from '../../shared/interfaces/progress-circle';
import { Timer, BatchTimer } from '../../shared/interfaces/timer';

/* Utility imports */
import { clone } from '../../shared/utility-functions/clone';
import { hasId } from '../../shared/utility-functions/id-helpers';

/* Service imports */
import { ClientIdService } from '../client-id/client-id.service';


@Injectable({
  providedIn: 'root'
})
export class TimerService {
  batchTimers: BatchTimer[] = [];
  timing: any = null;

  circumference: number;
  timerHeight: number;
  timerWidth: number;
  timerStrokeWidth: number;
  timerRadius: number;
  timerOriginX: number;
  timerOriginY: number;
  timerDY: string;

  timerStroke: string = '#ffffff';
  timerCircleFill: string = 'transparent';
  timerTextFill: string = 'white';
  timerTextXY: string = '50%';
  timerTextAnchor: string = 'middle';
  timerFontFamily: string = 'Arial';

  constructor(
    public backgroundMode: BackgroundMode,
    public clientIdService: ClientIdService,
    public platform: Platform
  ) {
    this.init();
  }

  init(): void {
    if (this.platform.is('cordova')) {
      this.backgroundMode.on('activate')
        .subscribe((): void => {
          this.backgroundMode.disableWebViewOptimizations();
        });
      this.backgroundMode.enable();
      this.backgroundMode.overrideBackButton();
      this.backgroundMode.setDefaults({
        hidden: true,
        silent: true,
        color: '40e0cf'
      });
    }
    this.timing = setInterval(() => {
      this.tick();
    }, 1000);
    this.setupInitialSettings();
  }

  /**
   * Add a new batch set of timers
   *
   * @params: batch - new Batch to generate batch timer
   *
   * @return: none
   */
  addBatchTimer(batch: Batch): void {
    if (this.getBatchTimerById(batch.cid) === undefined) {

      const timers: BehaviorSubject<Timer>[] = [];
      let concurrentIndex: number = 0;
      for (let i = 0; i < batch.process.schedule.length; i++) {
        if (batch.process.schedule[i].type === 'timer') {
          const timeRemaining: number = batch.process.schedule[i].duration * 60; // change duration from minutes to seconds

          const newTimer$: BehaviorSubject<Timer> = new BehaviorSubject<Timer>({
            cid: this.clientIdService.getNewId(),
            first: batch.process.schedule[i - concurrentIndex].cid,
            timer: clone(batch.process.schedule[i]),
            timeRemaining: timeRemaining,
            show: false,
            expansion : {
              value: 'collapsed',
              params: {
                height: 0,
                speed: 250
              }
            },
            isRunning: false,
            settings: this.getSettings(batch.process.schedule[i])
          });
          timers.push(newTimer$);

          if (i < batch.process.schedule.length - 1
            && batch.process.schedule[i].concurrent
            && batch.process.schedule[i + 1].concurrent) {
            concurrentIndex++;
          } else {
            concurrentIndex = 0;
          }
        }
      }
      this.batchTimers.push({
        batchId: batch.cid,
        timers: timers
      });
    }
  }

  /**
   * Add a minute to a timer
   *
   * @params: batchId - batch id associated with BatchTimer
   * @params: timerId - timer id within BatchTimer to update
   *
   * @return: observable of updated timer
   */
  addTimeToTimer(batchId: string, timerId: string): Observable<Timer> {
    const timer$: BehaviorSubject<Timer>
      = this.getTimerSubjectById(batchId, timerId);

    if (timer$ === undefined) {
      return throwError('Timer not found');
    }

    const timer: Timer = timer$.value;

    timer.timer.duration++;
    timer.timeRemaining += 60;
    this.setProgress(timer);
    timer$.next(timer);

    return of(timer);
  }

  /**
   * Format the time remaining text inside progress circle
   *
   * @params: timeRemaining - time remaining in seconds
   *
   * @return: datetime string in hh:mm:ss format - hour/minutes removed if zero
   */
  formatProgressCircleText(timeRemaining: number): string {
    let remainder: number = timeRemaining;
    let result: string = '';
    let hours: number;
    let minutes: number;

    // Set hours
    if (remainder > 3599) {
      hours = Math.floor(remainder / 3600);
      remainder = remainder % 3600;
      result += hours + ':';
    }

    // Set minutes
    if (remainder > 59) {
      minutes = Math.floor(remainder / 60);
      remainder = remainder % 60;
      result += minutes < 10 && timeRemaining > 599 ? '0' : '';
      result += minutes + ':';
    } else if (timeRemaining > 59) {
      result += '00:';
    }

    // Set seconds
    result += remainder < 10 ? '0' : '';
    result += remainder;

    return result;
  }

  /**
   * Get a batch timer by its id
   *
   * @params: batchId - batch id associated with batch timer
   *
   * @return: the BatchTimer associated with given batch id else undefined if
   *          not found
   */
  getBatchTimerById(batchId: string): BatchTimer {
    return this.batchTimers
    .find((batchTimer: BatchTimer): boolean => batchTimer.batchId === batchId);
  }

  /**
   * Get the appropriate font size for timer display based on the
   * number of digits to be displayed
   *
   * @params: timeRemaining - remaining time in seconds
   *
   * @return: css font size value
   */
  getFontSize(timeRemaining: number): string {
    if (timeRemaining > 3599) {
      return `${Math.round(this.timerWidth / 5)}px`;
    } else if (timeRemaining > 59) {
      return `${Math.round(this.timerWidth / 4)}px`;
    } else {
      return `${Math.round(this.timerWidth / 3)}px`;
    }
  }

  /**
   * Get timer progress circle settings
   *
   * @params: process - Process to help create settings
   *
   * @return: ProgressCircleSettings object
   */
  getSettings(process: Process): ProgressCircleSettings {
    return {
      height: this.timerHeight,
      width: this.timerWidth,
      circle: {
        strokeDasharray: `${this.circumference} ${this.circumference}`,
        strokeDashoffset: '0',
        stroke: this.timerStroke,
        strokeWidth: this.timerStrokeWidth,
        fill: this.timerCircleFill,
        radius: this.timerRadius,
        originX: this.timerOriginX,
        originY: this.timerOriginY
      },
      text: {
        textX: this.timerTextXY,
        textY: this.timerTextXY,
        textAnchor: this.timerTextAnchor,
        fill: this.timerTextFill,
        fontSize: this.getFontSize(process.duration * 60),
        fontFamily: this.timerFontFamily,
        dY: this.timerDY,
        content: this.formatProgressCircleText(process.duration * 60)
      }
    };
  }

  /**
   * Get all timer behaviorsubjects associated with given process id
   *
   * @params: batchId - batch id assigned to batchTimer
   * @params: processId -  the Process to match timers to
   *
   * @return: array of timer behaviorsubjects associated to process else
   *          else undefined if not found
   */
  getTimersByProcessId(
    batchId: string,
    processId: string
  ): BehaviorSubject<Timer>[] {
    const batchTimer: BatchTimer = this.getBatchTimerById(batchId);

    if (batchTimer === undefined) {
      return undefined;
    }

    return batchTimer.timers
      .filter((timer$: BehaviorSubject<Timer>): boolean => {
        return timer$.value.first === processId;
      });
  }

  /**
   * Get timer behaviorsubject by its id
   *
   * @params: batchId - batch id used to search for BatchTimer
   * @params: timerId - Timer id to search
   *
   * @return: timer behaviorsubject else undefined if not found
   */
  getTimerSubjectById(batchId: string, timerId: string): BehaviorSubject<Timer> {
    const batchTimer: BatchTimer = this.getBatchTimerById(batchId);

    if (batchTimer === undefined) {
      return undefined;
    }

    return batchTimer.timers
      .find((timer$: BehaviorSubject<Timer>): boolean => {
        return hasId(timer$.value, timerId);
      });
  }

  /**
   * Remove a BatchTimer from list
   *
   * @params: batchId - batch id associated with BatchTimer
   *
   * @return: none
   */
  removeBatchTimer(batchId: string): void {
    const batchTimerIndex: number = this.batchTimers
      .findIndex((batchTimer) => {
        return batchTimer.batchId === batchId;
      });

    if (batchTimerIndex !== -1) {
      this.batchTimers[batchTimerIndex].timers
        .forEach((timer$: BehaviorSubject<Timer>): void => timer$.complete());
      this.batchTimers.splice(batchTimerIndex, 1);
    }
  }

  /**
   * Stop a timer and reset its duration and time remaining
   *
   * @params: batchId - batch id associated with BatchTimer
   * @params: timerId - timer id within BatchTimer to update
   * @params: duration - duration in minutes
   *
   * @return: observable of updated timer
   */
  resetTimer(
    batchId: string,
    timerId: string,
    duration: number
  ): Observable<Timer> {
    const timer$: BehaviorSubject<Timer>
      = this.getTimerSubjectById(batchId, timerId);

    if (timer$ === undefined) {
      return throwError('Timer not found');
    }

    const timer: Timer = timer$.value;

    timer.isRunning = false;
    timer.timer.duration = duration;
    timer.timeRemaining = timer.timer.duration * 60;
    this.setProgress(timer);
    timer$.next(timer);

    return of(timer);
  }

  /**
   * Update css values as timer progresses
   *
   * @params: timer - a timer type process step instance
   *
   * @return: none
   */
  setProgress(timer: Timer): void {
    timer.settings.text.fontSize = this.getFontSize(timer.timeRemaining);
    timer.settings.circle.strokeDashoffset = `
      ${this.circumference - timer.timeRemaining / (timer.timer.duration * 60) * this.circumference}
    `;
    timer.settings.text.content
      = this.formatProgressCircleText(timer.timeRemaining);

    if (timer.isRunning) {
      if (timer.timeRemaining < 1) {
        timer.isRunning = false;
        // TODO activate alarm
        console.log('timer expired alarm');
      } else if (timer.timer.splitInterval > 1) {
        const interval: number = timer.timer.duration
          * 60
          / timer.timer.splitInterval;

        if (timer.timeRemaining % interval === 0) {
          // TODO activate interval alarm
          console.log('interval alarm');
        }
      }
    }
  }

  /**
   * Get step duration to be used in description display
   *
   * @params: duration - stored duration in minutes
   *
   * @return: datetime string hh:mm
   */
  getFormattedDurationString(duration: number): string {
    let result: string = 'Duration: ';

    // Get hours
    if (duration > 59) {
      const hours = Math.floor(duration / 60);
      result += `${hours} hour${hours > 1 ? 's' : ''}`;
      duration = duration % 60;
      result += (duration) ? ' ' : '';
    }

    // Get minutes
    if (duration) {
      result += `${duration} minute${duration > 1 ? 's' : ''}`;
    }
    return result;
  }

  /**
   * Generate initial base settings for timers
   *
   * @params: none
   * @return: none
   */
  setupInitialSettings(): void {
    const width: number = Math.round(this.platform.width() * 2 / 3);
    const strokeWidth: number = 8;
    const radius: number = (width / 2) - (strokeWidth * 2);
    const circumference: number = radius * 2 * Math.PI;

    this.circumference = circumference;
    this.timerHeight = width;
    this.timerWidth = width;
    this.timerStrokeWidth = strokeWidth;
    this.timerRadius = radius;
    this.timerOriginX = width / 2;
    this.timerOriginY = width / 2;
    this.timerDY = `${this.timerWidth / 800}em`;
  }

  /**
   * Start a timer by id
   *
   * @params: batchId - batch id associated with BatchTimer
   * @params: timerId - timer id within BatchTimer to update
   *
   * @return: observable of updated timer
   */
  startTimer(batchId: string, timerId: string): Observable<Timer> {
    return this.switchTimer(batchId, timerId, true);
  }

  /**
   * Stop a timer by id
   *
   * @params: batchId - batch id associated with BatchTimer
   * @params: timerId - timer id within BatchTimer to update
   *
   * @return: observable of updated timer
   */
  stopTimer(batchId: string, timerId: string): Observable<Timer> {
    return this.switchTimer(batchId, timerId, false);
  }

  /**
   * Toggle timer start/stop
   *
   * @params: batchId - batch id associated with BatchTimer
   * @params: timerId - timer id within BatchTimer to update
   * @params: run - true if timer should run, false if should stop
   *
   * @return: observable of updated timer
   */
  switchTimer(batchId: string, timerId: string, run: boolean): Observable<Timer> {
    const timer$: BehaviorSubject<Timer>
      = this.getTimerSubjectById(batchId, timerId);

    if (timer$ === undefined) {
      return throwError('Timer not found');
    }

    const timer: Timer = timer$.value;

    timer.isRunning = run;
    this.setProgress(timer);
    timer$.next(timer);

    return of(timer);
  }

  /**
   * Update all running timers
   *
   * @params: none
   * @return: none
   */
  tick(): void {
    this.batchTimers.forEach((batchTimer: BatchTimer): void => {
      batchTimer.timers.forEach((timer$: BehaviorSubject<Timer>): void => {
        const timer: Timer = timer$.value;

        if (timer.isRunning) {
          if (timer.timeRemaining > 0) {
            timer.timeRemaining--;
          } else {
            timer.isRunning = false;
          }
        }

        this.setProgress(timer);
        timer$.next(timer);
      });
    });
    this.updateNotifications();
  }

  /**
   * Update notifications timer
   *
   * @params: none
   * @return: none
   */
  updateNotifications(): void {
    // if (this.platform.is('cordova') && this.backgroundMode.isActive()) {
    //   const timers: Timer[] = this.batchTimers.flatMap(
    //     (batchTimer: BatchTimer): Timer[] => {
    //       const _timers: Timer[] = [];
    //
    //       batchTimer.timers
    //         .forEach((timer$: BehaviorSubject<Timer>): void => {
    //           if (timer$.value.isRunning) {
    //             _timers.push(timer$.value);
    //           }
    //         });
    //
    //       return _timers;
    //     }
    //   );
    //
    //   if (timers.length) {
    //     let nearest: Timer = timers[0];
    //
    //     if (timers.length > 1) {
    //       nearest = timers.reduce(
    //         (acc: Timer, curr: Timer): Timer => {
    //           return acc.timeRemaining < curr.timeRemaining
    //             ? acc
    //             : curr;
    //           }
    //       );
    //     }
    //
    //     this.backgroundMode.configure({
    //       title: `${nearest.timer.name}: ${nearest.settings.text.content}`,
    //       text: `${timers.length} timer${timers.length > 2 ? 's': ''} running`,
    //       icon: 'ic_launcher',
    //       hidden: true,
    //       silent: false,
    //       color: '40e0cf'
    //     });
    //   }
    // }
  }

}
