/* Module imports */
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

/* Interface imports */
import { Batch, BatchTimer, Process, ProgressCircleSettings, Timer, TimerProcess } from '@shared/interfaces';

/* Type imports */
import { CustomError } from '@shared/types';

/* Service imports */
import { BackgroundModeService } from '@services/background-mode/background-mode.service';
import { ErrorReportingService } from '@services/error-reporting/error-reporting.service';
import { IdService } from '@services/id/id.service';
import { LocalNotificationService } from '@services/local-notification/local-notification.service';
import { ProcessService } from '@services/process/process.service';
import { UtilityService } from '@services/utility/utility.service';


@Injectable({
  providedIn: 'root'
})
export class TimerService {
  batchTimers: BatchTimer[] = [];
  oneSecondInMs: number = 1000;
  oneMinuteInSeconds: number = 60;
  oneHourInMinutes: number = 60;
  oneHourInSeconds: number = 3600;
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
    public errorReporter: ErrorReportingService,
    public idService: IdService,
    public notificationService: LocalNotificationService,
    public platform: Platform,
    public processService: ProcessService,
    public utilService: UtilityService
  ) {
    this.timing = setInterval((): void => {
      this.tick();
    }, this.oneSecondInMs);
    this.initializeSettings();
  }

  /***** Timer Operation *****/

  /**
   * Add a minute to a timer
   *
   * @param: timerId - timer id within BatchTimer to update
   * @return: none
   */
  addTimeToTimer(timerId: string): void {
    const timer$: BehaviorSubject<Timer> = this.getTimerSubjectById(timerId);
    if (timer$) {
      const timer: Timer = timer$.value;
      timer.timer.duration++;
      timer.timeRemaining += this.oneMinuteInSeconds;
      this.setProgress(timer);
      timer$.next(timer);
    } else {
      const message: string = 'An error occurred trying to add time to timer';
      const additionalMessage: string = `Timer with id ${timerId} not found`;
      this.errorReporter.setErrorReport(
        this.errorReporter.getCustomReportFromError(
          this.getMissingError(message, additionalMessage)
        )
      );
    }
  }

  /**
   * Stop a timer and reset its duration and time remaining
   *
   * @param: timerId - timer id within BatchTimer to update
   * @param: duration - duration in minutes
   * @return: observable of updated timer
   */
  resetTimer(timerId: string, duration: number): void {
    const timer$: BehaviorSubject<Timer> = this.getTimerSubjectById(timerId);
    if (timer$) {
      const timer: Timer = timer$.value;
      timer.isRunning = false;
      timer.timer.duration = duration;
      timer.timeRemaining = timer.timer.duration * this.oneMinuteInSeconds;
      this.setProgress(timer);
      timer$.next(timer);
    } else {
      const message: string = 'An error occurred trying to reset timer';
      const additionalMessage: string = `Timer with id ${timerId} not found`;
      this.errorReporter.setErrorReport(
        this.errorReporter.getCustomReportFromError(
          this.getMissingError(message, additionalMessage)
        )
      );
    }
  }

  /**
   * Start a timer by id
   *
   * @param: timerId - timer id within BatchTimer to update
   * @return: observable of updated timer
   */
  startTimer(timerId: string): void {
    this.switchTimer(timerId, true);
  }

  /**
   * Stop a timer by id
   *
   * @param: timerId - timer id within BatchTimer to update
   * @return: observable of updated timer
   */
  stopTimer(timerId: string): void {
    this.switchTimer(timerId, false);
  }

  /**
   * Toggle timer start/stop
   *
   * @param: timerId - timer id within BatchTimer to update
   * @param: run - true if timer should run, false if should stop
   * @return: observable of updated timer
   */
  switchTimer(timerId: string, run: boolean): void {
    const timer$: BehaviorSubject<Timer> = this.getTimerSubjectById(timerId);
    if (timer$) {
      const timer: Timer = timer$.value;
      timer.isRunning = run;
      this.setProgress(timer);
      timer$.next(timer);
    } else {
      const message: string = `An error occurred trying to ${ run ? 'start' : 'stop' } timer`;
      const additionalMessage: string = `Timer with id ${timerId} not found`;
      this.errorReporter.setErrorReport(
        this.errorReporter.getCustomReportFromError(
          this.getMissingError(message, additionalMessage)
        )
      );
    }
  }

  /***** End Timer Operation *****/


  /***** Timer Handling *****/

  /**
   * Add a new batch set of timers; do not add a timer if it already exists
   *
   * @param: batch - new Batch to generate batch timer
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
      this.batchTimers.push({ timers, batchId: batch.cid });
    }
  }

  /**
   * Generate a new timer based on batch data
   *
   * @param: batch - the batch that contains required data
   * @param: processIndex - the process schedule index with time data
   * @param: concurrentOffset - offset index from processIndex to first concurrent timer
   * @return: BehaviorSubject of new timer
   */
  generateNewTimerSubject(
    batch: Batch,
    processIndex: number,
    concurrentOffset: number
  ): BehaviorSubject<Timer> {
    const newTimer: Timer = {
      cid: this.idService.getNewId(),
      first: batch.process.schedule[processIndex - concurrentOffset].cid,
      timer: this.utilService.clone(<TimerProcess>batch.process.schedule[processIndex]),
      timeRemaining: (<TimerProcess>batch.process.schedule[processIndex]).duration * this.oneMinuteInSeconds,
      show: false,
      expansion : {
        value: 'collapsed',
        params: { height: 0, speed: 250 }
      },
      isRunning: false,
      settings: this.getSettings(<TimerProcess>batch.process.schedule[processIndex])
    };

    return new BehaviorSubject<Timer>(newTimer);
  }

  /**
   * Get a batch timer by its id
   *
   * @param: batchId - batch id associated with batch timer
   * @return: the BatchTimer associated with given batch id else undefined if not found
   */
  getBatchTimerById(batchId: string): BatchTimer {
    return this.batchTimers.find((batchTimer: BatchTimer): boolean => batchTimer.batchId === batchId);
  }

  /**
   * Get all timer behaviorsubjects associated with given process id
   *
   * @param: batchId - batch id assigned to batchTimer
   * @param: processId - the Process to match timers to
   * @return: array of timer behaviorsubjects associated to process else
   * else undefined if not found
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
   * @param: timerId - Timer id to search
   * @return: timer behaviorsubject else undefined if not found
   */
  getTimerSubjectById(timerId: string): BehaviorSubject<Timer> {
    for (const batchTimer of this.batchTimers) {
      for (const timer$ of batchTimer.timers) {
        if (this.idService.hasId(timer$.value, timerId)) {
          return timer$;
        }
      }
    }
    return undefined;
  }

  /**
   * Check if adjacent timer steps are concurrent
   *
   * @param: batch - batch that contains the process schedule to check
   * @param: index - index of step to check
   * @return: true if given step index and the next step are both concurrent
   */
  isConcurrent(batch: Batch, index: number): boolean {
    const schedule: Process[] = batch.process.schedule;
    return (
      index < batch.process.schedule.length - 1
      && this.isConcurrentTimer(schedule[index])
      && this.isConcurrentTimer(schedule[index + 1])
    );
  }

  /**
   * Check if a process is a TimerProcess and has a concurrent flag
   *
   * @param: process - the process to check
   * @return: true if process is a TimerProcess and concurrent is true
   */
  isConcurrentTimer(process: Process): boolean {
    return process.type === 'timer' && (<TimerProcess>process).concurrent;
  }

  /**
   * Remove a BatchTimer from list
   *
   * @param: batchId - batch id associated with BatchTimer
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
   * Update all running timers
   *
   * @param: none
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

  /***** End Timer Handling *****/


  /***** Progress Circle *****/

  /**
   * Format the time remaining text inside progress circle
   *
   * @param: timeRemaining - time remaining in seconds
   * @return: datetime string in hh:mm:ss format - hour/minutes removed if zero
   */
  formatProgressCircleText(timeRemaining: number): string {
    if (timeRemaining < 0 || timeRemaining === null || timeRemaining === undefined) {
      return '';
    }

    let remainder: number = timeRemaining;
    let result: string = '';
    let hours: number;
    let minutes: number;
    // Set hours
    if (remainder > this.oneHourInSeconds - 1) {
      hours = Math.floor(remainder / this.oneHourInSeconds);
      remainder = remainder % this.oneHourInSeconds;
      result += `${hours}:`;
    }
    // Set minutes
    if (remainder > this.oneHourInMinutes - 1) {
      minutes = Math.floor(remainder / this.oneHourInMinutes);
      remainder = remainder % this.oneHourInMinutes;
      result += minutes < 10 && timeRemaining > (this.oneHourInMinutes * 10 - 1) ? '0' : '';
      result += `${minutes}:`;
    } else if (timeRemaining > this.oneHourInMinutes - 1) {
      result += '00:';
    }
    // Set seconds
    result += remainder < 10 ? '0' : '';
    result += remainder;

    return result;
  }

  /**
   * Get the appropriate font size for timer display based on the
   * number of digits to be displayed
   *
   * @param: timeRemaining - remaining time in seconds
   *
   * @return: css font size value
   */
  getFontSize(timeRemaining: number): string {
    if (timeRemaining > this.oneHourInSeconds - 1) {
      return `${Math.round(this.timerWidth / 5)}px`;
    } else if (timeRemaining > this.oneHourInMinutes - 1) {
      return `${Math.round(this.timerWidth / 4)}px`;
    } else {
      return `${Math.round(this.timerWidth / 3)}px`;
    }
  }

  /**
   * Get step duration to be used in description display
   *
   * @param: duration - stored duration in minutes
   * @return: datetime string hh:mm
   */
  getFormattedDurationString(duration: number): string {
    let result: string = 'Duration: ';
    if (duration === 0) {
      return `${result}0 minutes`;
    }

    let durationRemaining = duration;
    if (duration >= this.oneHourInMinutes) {
      const hours = Math.floor(durationRemaining / this.oneHourInMinutes);
      result += `${hours} hour${hours > 1 ? 's' : ''}`;
      durationRemaining = durationRemaining % this.oneHourInMinutes;
      result += (durationRemaining) ? ' ' : '';
    }
    if (durationRemaining) {
      result += `${durationRemaining} minute${durationRemaining > 1 ? 's' : ''}`;
    }
    return result;
  }

  /**
   * Get timer progress circle settings
   *
   * @param: process - TimerProcess to help create settings
   * @return: ProgressCircleSettings object
   */
  getSettings(process: TimerProcess): ProgressCircleSettings {
    return {
      height: this.timerHeight,
      width: this.timerWidth,
      circle: {
        strokeDasharray: this.circumference.toString(),
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
        fontSize: this.getFontSize(process.duration * this.oneMinuteInSeconds),
        fontFamily: this.timerFontFamily,
        dY: this.timerDY,
        content: this.formatProgressCircleText(process.duration * this.oneMinuteInSeconds)
      }
    };
  }

  /**
   * Generate initial base settings for timers
   *
   * @param: none
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
   * Update css values as timer progresses
   *
   * @param: timer - a timer type process step instance
   * @return: none
   */
  setProgress(timer: Timer): void {
    timer.settings.text.fontSize = this.getFontSize(timer.timeRemaining);
    timer.settings.circle.strokeDashoffset = `${this.circumference - timer.timeRemaining / (timer.timer.duration * 60) * this.circumference}`;
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

  /***** End Progress Circle *****/


  /***** Other Methods *****/

  /**
   * Get the next index, treating adjacent concurrent timers as a single step
   *
   * @param: isForward - true to advance forward; false to go back
   * @param: startIndex - the current index
   * @return: next index to use or -1 if at the beginning or end of schedule
   */
  getIndexSkippingConcurrent(isForward: boolean, startIndex: number, schedule: Process[]): number {
    if (isForward) {
      return this.getNextIndexSkippingConcurrent(startIndex, schedule);
    }
    return this.getPreviousIndexSkippingConcurrent(startIndex, schedule);
  }

  /**
   * Get the next step, skipping over neighboring concurrent timers
   *
   * @param: viewIndex - the view index to start from
   * @return: next index or -1 if at end
   */
  getNextIndexSkippingConcurrent(startIndex: number, schedule: Process[]): number {
    let nextIndex: number = -1;
    for (let i = startIndex; i < schedule.length; i++) {
      if (!schedule[i]['concurrent']) {
        nextIndex = i;
        break;
      }
    }
    return nextIndex;
  }

  /**
   * Get the previous step, skipping over neighboring concurrent timers
   *
   * @param: viewIndex - the view index to start from
   * @return: next index or -1 if at start
   */
  getPreviousIndexSkippingConcurrent(startIndex: number, schedule: Process[]): number {
    let previousIndex: number = -1;
    for (let i = startIndex - 1; i >= 0; i--) {
      if (!schedule[i]['concurrent']) {
        previousIndex = i + 1;
        break;
      }
    }
    return previousIndex;
  }

  /**
   * Get a custom error for missing timer
   *
   * @param: baseMessage - base error message for user and internal
   * @param: additionalMessage - additional message for internal use only
   * @return: a new missing timer error
   */
  getMissingError(baseMessage: string, additionalMessage: string = ''): Error {
    return new CustomError(
      'TimerError',
      `${baseMessage} ${additionalMessage}`,
      this.errorReporter.highSeverity,
      baseMessage
    );
  }

  /**
   * Get the timer process step starting at a given index and including neighbor concurrent timers
   *
   * @param: schedule - process schedule in which to search for timer processes
   * @param: startIndex - the starting index in the schedule
   * @return: Array of timer processes
   */
  getTimerStepData(schedule: Process[], startIndex: number): TimerProcess[] {
    let end: number = startIndex + 1;
    if (schedule[startIndex]['concurrent']) {
      for (; end < schedule.length; end++) {
        if (!schedule[end]['concurrent']) {
          break;
        }
      }
    }

    return <TimerProcess[]>schedule.slice(startIndex, end);
  }

  /**
   * Update notifications timer
   *
   * @param: timers - array of all running timers
   * @return: none
   */
  updatedBackgroundNotifications(timers: Timer[]): void {
    if (this.platform.is('cordova') && this.backgroundModeService.isActive()) {
      if (timers.length) {
        let nearest: Timer = timers[0];

        if (timers.length > 1) {
          nearest = timers
            .reduce((acc: Timer, curr: Timer): Timer => {
              return acc.timeRemaining < curr.timeRemaining ? acc : curr;
            });
        }

        this.backgroundModeService.setNotification(
          `${ nearest.timer.name }: ${ nearest.settings.text.content }`,
          `${ timers.length } timer${ timers.length > 1 ? 's' : '' } running`
        );
      } else {
        this.backgroundModeService.disableBackgroundMode();
      }
    }
  }

  /***** End Other Methods *****/

}
