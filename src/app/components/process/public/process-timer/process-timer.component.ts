/* Module imports */
import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, QueryList, SimpleChange, SimpleChanges, ViewChildren } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/* Interface imports */
import { Timer, TimerProcess } from '@shared/interfaces';

/* Service imports */
import { ErrorReportingService, IdService, TimerService, ToastService, UtilityService } from '@services/public';


@Component({
  selector: 'app-process-timer',
  templateUrl: './process-timer.component.html',
  styleUrls: ['./process-timer.component.scss']
})
export class ProcessTimerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() batchId: string;
  @Input() isPreview: boolean;
  @Input() timerProcess: TimerProcess[];
  @ViewChildren('slidingTimers') slidingTimers: QueryList<ElementRef>;
  destroy$: Subject<boolean> = new Subject<boolean>();
  timers: Timer[] = [];

  constructor(
    public errorReporter: ErrorReportingService,
    public idService: IdService,
    public timerService: TimerService,
    public toastService: ToastService,
    public utilService: UtilityService
  ) { }

  /***** Lifecycle Hooks *****/

  ngOnInit() {
    console.log('process timer component init');
    this.initTimers();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('process timer component changes', changes);
    const stepChange: SimpleChange = changes.timerProcess;
    if (stepChange !== undefined && stepChange.currentValue !== undefined) {
      if (stepChange.currentValue[0].type !== 'timer') {
        this.destroy$.next(true);
      } else if (this.hasChanges(stepChange)) {
        this.timerProcess = stepChange.currentValue;
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


  /**
   * Check if new changes object has the same values as the previous
   * changes object
   *
   * @param: changes - changes detected from ngOnChanges
   *
   * @return: true if current values are different than previous values
   */
  hasChanges(changes: SimpleChange): boolean {
    return this.utilService.hasChanges(changes);
  }

  /**
   * Initialize timers for the current step and subscribe to their subjects
   *
   * @param: none
   * @return: none
   */
  initTimers(): void {
    this.timers = [];
    const timers: BehaviorSubject<Timer>[] = this.timerService.getTimersByProcessId(
      this.batchId,
      this.timerProcess[0].cid
    );
    if (timers === undefined) {
      return;
    }

    timers.forEach((timer$: BehaviorSubject<Timer>): void => {
      timer$
        .pipe(takeUntil(this.destroy$))
        .subscribe((timer: Timer): void => this.updateTimerInList(timer));
    });
  }

  /**
   * Update a timer in timers list or add to list if it is not present
   *
   * @param: timer - updated Timer
   *
   * @return: none
   */
  updateTimerInList(timer: Timer): void {
    const timerIndex: number = this.timers.findIndex((_timer: Timer): boolean => {
      return this.idService.hasId(timer, _timer.cid);
    });
    if (timerIndex === -1) {
      this.timers.push(timer);
    } else {
      this.timers[timerIndex] = timer;
    }
  }

}
