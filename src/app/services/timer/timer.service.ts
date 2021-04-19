/* Module imports */
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
import { BackgroundModeService } from '../background-mode/background-mode.service';
import { ClientIdService } from '../client-id/client-id.service';
import { LocalNotificationService } from '../local-notification/local-notification.service';


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
    public backgroundModeService: BackgroundModeService,
    public clientIdService: ClientIdService,
    public notificationService: LocalNotificationService,
    public platform: Platform
  ) {
    this.timing = setInterval((): void => {
      this.tick();
    }, 1000);
    this.initializeSettings();
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
          timers.push(this.generateNewTimerSubject(batch, i, concurrentIndex));

          if (this.isConcurrent(batch, i)) {
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
    const timer$: BehaviorSubject<Timer> = this.getTimerSubjectById(batchId, timerId);

    if (!timer$) {
      return throwError('Error adding time: timer not found');
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
    if (timeRemaining < 0) {
      return '';
    }

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
   * Generate a new timer based on batch data
   *
   * @params: batch - the batch that contains required data
   * @params: processIndex - the process schedule index with time data
   * @params: concurrentOffset - offset index from processIndex to first concurrent timer
   *
   * @return: BehaviorSubject of new timer
   */
  generateNewTimerSubject(
    batch: Batch,
    processIndex: number,
    concurrentOffset: number
  ): BehaviorSubject<Timer> {
    const newTimer$: BehaviorSubject<Timer> = new BehaviorSubject<Timer>({
      cid: this.clientIdService.getNewId(),
      first: batch.process.schedule[processIndex - concurrentOffset].cid,
      timer: clone(batch.process.schedule[processIndex]),
      timeRemaining: batch.process.schedule[processIndex].duration * 60,
      show: false,
      expansion : {
        value: 'collapsed',
        params: {
          height: 0,
          speed: 250
        }
      },
      isRunning: false,
      settings: this.getSettings(batch.process.schedule[processIndex])
    });

    return newTimer$;
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
    return this.batchTimers.find((batchTimer: BatchTimer): boolean => batchTimer.batchId === batchId);
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
   * @params: processId - the Process to match timers to
   *
   * @return: array of timer behaviorsubjects associated to process else
   *          else undefined if not found
   */
  getTimersByProcessId(batchId: string, processId: string): BehaviorSubject<Timer>[] {
    const batchTimer: BatchTimer = this.getBatchTimerById(batchId);

    if (batchTimer === undefined) {
      return undefined;
    }

    return batchTimer.timers
      .filter((timer$: BehaviorSubject<Timer>): boolean => timer$.value.first === processId);
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
      .find((timer$: BehaviorSubject<Timer>): boolean => hasId(timer$.value, timerId));
  }

  /**
   * Generate initial base settings for timers
   *
   * @params: none
   * @return: none
   */
  initializeSettings(): void {
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
   * Check if adjacent timer steps are concurrent
   *
   * @params: batch - batch that contains the process schedule to check
   * @params: index - index of step to check
   *
   * @return: true if given step index and the next step are both concurrent
   */
  isConcurrent(batch: Batch, index: number): boolean {
    return (
      index < batch.process.schedule.length - 1
      && batch.process.schedule[index].concurrent
      && batch.process.schedule[index + 1].concurrent
    );
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
      .findIndex((batchTimer) => batchTimer.batchId === batchId);

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
  resetTimer(batchId: string, timerId: string, duration: number): Observable<Timer> {
    const timer$: BehaviorSubject<Timer> = this.getTimerSubjectById(batchId, timerId);

    if (!timer$) {
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
    timer.settings.text.content = this.formatProgressCircleText(timer.timeRemaining);

    if (timer.isRunning) {
      if (timer.timeRemaining < 1) {
        timer.isRunning = false;
        this.notificationService.setLocalNotification(`${timer.timer.name} complete!`);
      } else if (timer.timer.splitInterval > 1) {
        const interval: number = timer.timer.duration * 60 / timer.timer.splitInterval;

        if (timer.timeRemaining % interval === 0) {
          this.notificationService.setLocalNotification(`${timer.timer.name} interval complete!`);
        }
      }
    }
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
    const timer$: BehaviorSubject<Timer> = this.getTimerSubjectById(batchId, timerId);

    if (!timer$) {
      return throwError('Timer switch error: timer not found');
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
    const runningTimers: Timer[] = [];

    this.batchTimers.forEach((batchTimer: BatchTimer): void => {
      batchTimer.timers.forEach((timer$: BehaviorSubject<Timer>): void => {
        const timer: Timer = timer$.value;

        if (timer.isRunning) {
          if (timer.timeRemaining > 0) {
            timer.timeRemaining--;
            this.backgroundModeService.enableBackgroundMode();
          } else {
            timer.isRunning = false;
          }
        }

        this.setProgress(timer);
        timer$.next(timer);
        if (timer.isRunning) {
          runningTimers.push(timer);
        }
      });
    });

    this.updatedBackgroundNotifications(runningTimers);
  }

  /**
   * Update notifications timer
   *
   * @params: timers - array of all running timers
   *
   * @return: none
   */
  updatedBackgroundNotifications(timers: Timer[]): void {
    if (this.platform.is('cordova') && this.backgroundModeService.isActive()) {
      if (timers.length) {
        let nearest: Timer = timers[0];

        if (timers.length > 1) {
          nearest = timers.reduce(
            (acc: Timer, curr: Timer): Timer => {
              return acc.timeRemaining < curr.timeRemaining ? acc : curr;
            }
          );
        }

        this.backgroundModeService.setNotification(
          `${nearest.timer.name}: ${nearest.settings.text.content}`,
          `${timers.length} timer${timers.length > 1 ? 's' : ''} running`
        );
      } else {
        this.backgroundModeService.disableBackgroundMode();
      }
    }
  }

}
