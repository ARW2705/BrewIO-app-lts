/* Module imports */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Navigation, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject, from, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, mergeMap, takeUntil, tap } from 'rxjs/operators';

/* Interface imports */
import { Alert, Batch, BatchProcess, CalendarMetadata, PrimaryValues, Process, TimerProcess } from '../../shared/interfaces';

/* Type imports */
import { CustomError } from '../../shared/types';

/* Component imports */
import { ProcessCalendarComponent } from '../../components/process-calendar/process-calendar.component';

/* Page imports */
import { ProcessMeasurementsFormPage } from '../forms/process-measurements-form/process-measurements-form.page';

/* Service imports */
import { ErrorReportingService, EventService, IdService, ProcessService, TimerService, ToastService, UserService } from '../../services/services';


@Component({
  selector: 'page-process',
  templateUrl: './process.page.html',
  styleUrls: ['./process.page.scss']
})
export class ProcessPage implements OnInit, OnDestroy {
  @ViewChild('calendar') calendarRef: ProcessCalendarComponent;
  alerts: Alert[] = [];
  atViewEnd: boolean = false;
  atViewStart: boolean = true;
  destroy$: Subject<boolean> = new Subject<boolean>();
  hideButton: boolean = false;
  isCalendarInProgress: boolean = false;
  isConcurrent: boolean = false;
  navigateToRoot: () => void = () => this.router.navigate([this.rootURL]);
  requestedUserId: string = null;
  recipeMasterId: string = '';
  recipeVariantId: string = '';
  rootURL: string = 'tabs/home';
  selectedBatch: Batch = null;
  selectedBatchId: string = null;
  selectedBatch$: BehaviorSubject<Batch> = null;
  selectedRecipeId: string = null;
  stepData: any = null;
  stepType: string = '';
  title: string = '';
  viewStepIndex: number = 0;

  constructor(
    public errorReporter: ErrorReportingService,
    public event: EventService,
    public idService: IdService,
    public modalCtrl: ModalController,
    public processService: ProcessService,
    public route: ActivatedRoute,
    public router: Router,
    public timerService: TimerService,
    public toastService: ToastService,
    public userService: UserService
  ) { }

  /***** Lifecycle Hooks *****/

  ngOnInit() {
    console.log('process page init');
    this.hideButton = false;
    this.listenForRouteChanges();
  }

  ngOnDestroy() {
    console.log('process page destroy');
    this.destroy$.next(true);
    this.destroy$.complete();
    this.event.unregister('change-date');
  }

  /***** End Lifecycle Hooks *****/


  /***** Batch Initialization *****/

  /**
   * Continue an existing batch
   *
   * @params: none
   * @return: none
   */
  continueBatch(): void {
    console.log('continuing batch', this.selectedBatchId);
    this.selectedBatch$ = this.processService.getBatchById(this.selectedBatchId);
    if (this.selectedBatch$) {
      this.listenForBatchChanges(true);
    } else {
      this.toastService.presentErrorToast('Internal error: Batch not found', this.navigateToRoot);
    }
  }

  /**
   * Listen for changes in selected batch
   *
   * @params: none
   * @return: none
   */
  listenForBatchChanges(onContinue: boolean): void {
    this.selectedBatch$
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (selectedBatch: Batch): void => this.handleBatchChange(selectedBatch, onContinue),
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Listen for changes in route query params
   *
   * @params: none
   * @return: none
   */
  listenForRouteChanges(): void {
    this.route.queryParams
      .pipe(
        takeUntil(this.destroy$),
        mergeMap((): Observable<null> => {
          console.log('route change detected');
          return this.handleRouteChange();
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      )
      .subscribe(
        (): void => {
          console.log('process route update');
          if (!this.selectedBatchId) {
            this.startNewBatch();
          } else {
            this.continueBatch();
          }
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Assign given Batch to page properties accordingly
   *
   * @param: batch - a Batch object
   * @param: onContinue - true if continuing a batch; false to start a new batch
   *
   * @return: none
   */
  handleBatchChange(batch: Batch, onContinue: boolean): void {
    this.selectedBatch = batch;
    this.selectedBatchId = this.idService.getId(batch);
    this.title = batch.contextInfo.recipeMasterName;
    this.timerService.addBatchTimer(batch);
    if (onContinue) {
      this.goToActiveStep();
    } else {
      this.updateViewData();
    }
  }

  /**
   * Get router navigation properties and assign page properties accordingly
   *
   * @param: none
   *
   * @return: observable of null on successful init
   */
  handleRouteChange(): Observable<null> {
    try {
      const nav: Navigation = this.router.getCurrentNavigation();
      const configData: object = nav.extras.state;
      this.rootURL = configData['rootURL'];
      this.requestedUserId = configData['requestedUserId'];
      this.recipeMasterId = configData['recipeMasterId'];
      this.recipeVariantId = configData['recipeVariantId'];
      this.selectedBatchId = configData['selectedBatchId'];
      return of(null);
    } catch (error) {
      return throwError(error);
    }
  }

  /**
   * Start a new batch from a recipe
   *
   * @params: none
   * @return: none
   */
  startNewBatch(): void {
    console.log('starting batch');
    this.viewStepIndex = 0;
    this.atViewEnd = false;
    this.atViewStart = true;
    this.processService.startNewBatch(this.requestedUserId, this.recipeMasterId, this.recipeVariantId)
      .pipe(
        mergeMap((newBatch: Batch): Observable<null> => {
          this.selectedBatch$ = this.processService.getBatchById(this.idService.getId(newBatch));
          if (!this.selectedBatch$) {
            const message: string = 'An error occurred trying to start a new batch: new batch not found';
            const severity: number = 2;
            return throwError(new CustomError('BatchError', message, severity, message));
          }
          return of(null);
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      )
      .subscribe(
        (): void => this.listenForBatchChanges(false),
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /***** End Batch Initialization *****/


  /***** Child Component Functions *****/

  /**
   * Get alerts associated with the current step
   *
   * @params: none
   *
   * @return: Array of alerts
   */
  getAlerts(): Alert[] {
    const process: BatchProcess = this.selectedBatch.process;
    return process.alerts.filter((alert: Alert): boolean => {
      return alert.title === process.schedule[process.currentStep].name;
    });
  }

  /**
   * Get the timer process step starting at current view
   * index and including neighbor concurrent timers
   *
   * @params: none
   *
   * @return: Array of timer processes
   */
  getTimerStepData(): TimerProcess[] {
    const schedule: Process[] = this.selectedBatch.process.schedule;
    const start: number = this.viewStepIndex;
    let end: number = start + 1;
    if (schedule[start]['concurrent']) {
      for (; end < schedule.length; end++) {
        if (!schedule[end]['concurrent']) {
          break;
        }
      }
    }

    return <TimerProcess[]>schedule.slice(start, end);
  }

  /***** End Child Component Functions *****/


  /***** View Navigation Methods *****/

  /**
   * Advance the batch to the next step (skips blocks of concurrent timers)
   *
   * @params: nextIndex - step index to go to
   *
   * @return: none
   */
  advanceBatch(nextIndex: number): void {
    this.selectedBatch.process.currentStep = nextIndex;
    this.viewStepIndex = nextIndex;
    this.updateViewData();
    this.processService.updateBatch(this.selectedBatch)
      .subscribe(
        (): void => console.log('batch increment step'),
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Change view index only, does not trigger step completion
   *
   * @params: direction - either 'prev' or 'next'
   *
   * @return: none
   */
  changeStep(direction: string): void {
    const nextIndex: number = this.getStep(false, direction);
    if (nextIndex !== -1) {
      this.viewStepIndex = nextIndex;
    }

    this.updateViewData();
  }

  /**
   * Complete the current process step and trigger progress to next step,
   * if on last step, end the process, then move onto inventory item generation
   *
   * @params: none
   * @return: none
   */
  completeStep(): void {
    const nextIndex: number = this.getStep(true, 'next');
    if (nextIndex === -1) {
      this.endBatch();
    } else {
      this.advanceBatch(nextIndex);
    }
  }

  /**
   * End the batch; Open measurements form to confirm values before continuing
   *
   * @params: none
   * @return: none
   */
  endBatch(): void {
    this.timerService.removeBatchTimer(this.selectedBatch.cid);
    this.openMeasurementFormModal(true);
    this.processService.endBatchById(this.idService.getId(this.selectedBatch))
      .subscribe(
        (): void => console.log('batch completed'),
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Get the next index, treating adjacent concurrent timers as a single step
   *
   * @params: direction - either 'prev' or 'next'
   * @params: startIndex - the current index
   *
   * @return: next index to use or -1 if at the beginning or end of schedule
   */
  getIndexAfterSkippingConcurrent(direction: string, startIndex: number): number {
    const process: BatchProcess = this.selectedBatch.process;
    let nextIndex: number = -1;
    if (direction === 'next') {
      for (let i = startIndex; i < process.schedule.length; i++) {
        if (!process.schedule[i]['concurrent']) {
          nextIndex = i;
          break;
        }
      }
    } else if (direction === 'prev') {
      for (let i = startIndex - 1; i >= 0; i--) {
        if (!process.schedule[i]['concurrent']) {
          nextIndex = i + 1;
          break;
        }
      }
    }

    return nextIndex;
  }

  /**
   * Get the next or previous schedule step
   *
   * @params: onComplete - true if step is being completed
   * @params: direction - either 'prev' or 'next'
   *
   * @return: next index to use or -1 if at the beginning or end of schedule
   */
  getStep(onComplete: boolean , direction: string): number {
    const process: BatchProcess = this.selectedBatch.process;
    const viewIndex: number = onComplete ? process.currentStep : this.viewStepIndex;
    if (direction === 'next') {
      if (viewIndex < process.schedule.length - 1) {
        if (process.schedule[viewIndex]['concurrent']) {
          return this.getIndexAfterSkippingConcurrent(direction, viewIndex);
        } else {
          return viewIndex + 1;
        }
      }
    } else if (direction === 'prev') {
      if (viewIndex > 0) {
        if (process.schedule[viewIndex - 1]['concurrent']) {
          return this.getIndexAfterSkippingConcurrent(direction, viewIndex);
        } else {
          return viewIndex - 1;
        }
      }
    }

    return -1;
  }

  /**
   * Change view index to the currently active step and update view
   *
   * @params: none
   * @return: none
   */
  goToActiveStep(): void {
    this.viewStepIndex = this.selectedBatch.process.currentStep;
    this.updateViewData();
  }

  /**
   * Set data to be displayed in current view
   *
   * @params: none
   * @return: none
   */
  updateViewData(): void {
    const process: BatchProcess = this.selectedBatch.process;
    const pendingStep: Process = process.schedule[this.viewStepIndex];
    if (pendingStep.type === 'timer') {
      this.stepData = this.getTimerStepData();
      this.stepType = 'timer';
    } else {
      this.stepData = pendingStep;
      this.stepType = pendingStep.type;
      this.isCalendarInProgress = this.hasCalendarStarted();
    }
    this.alerts = this.getAlerts();
    this.atViewStart = this.viewStepIndex === 0;
    this.atViewEnd = (
      this.viewStepIndex === process.schedule.length - 1
      || this.getIndexAfterSkippingConcurrent('next', this.viewStepIndex) === -1
    );
  }

  /***** End View Navigation Methods *****/


  /***** Calendar Specific Methods *****/

  /**
   * Handle change date event from calendar child component
   *
   * @params: none
   * @return: none
   */
  changeDateEventHandler(): void {
    const secondAndAHalf: number = 1500;
    this.toastService.presentToast('Select new dates', secondAndAHalf, 'middle');
    delete this.selectedBatch
      .process
      .schedule[this.selectedBatch.process.currentStep]['startDatetime'];
    this.isCalendarInProgress = false;
    this.clearAlertsForCurrentStep();
  }

  /**
   * Remove alerts for the current step
   *
   * @params: none
   * @return: none
   */
  clearAlertsForCurrentStep(): void {
    const process: BatchProcess = this.selectedBatch.process;
    process.alerts = process.alerts.filter((alert: Alert): boolean => {
      return alert.title !== process.schedule[process.currentStep].name;
    });
  }

  /**
   * Check if the current calendar is in progress; A calendar is
   * considered in progress if the step has a startDatetime property
   *
   * @params: none
   *
   * @return: true if current step has a startDatetime property
   */
  hasCalendarStarted(): boolean {
    const process: BatchProcess = this.selectedBatch.process;
    return (
      process.currentStep < process.schedule.length
      && process.schedule[this.selectedBatch.process.currentStep].hasOwnProperty('startDatetime')
    );
  }

  /**
   * Set the start of a calendar step
   *
   * @params: none
   * @return: none
   */
  startCalendar(): void {
    const values: CalendarMetadata = this.calendarRef.startCalendar();
    this.processService.updateCalendarStep(this.idService.getId(this.selectedBatch), values)
      .subscribe(
        (): void => console.log('Started calendar'),
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /***** End Calendar Specific Methods *****/


  /***** Navigation *****/

  /**
   * Navigate to inventory page with id of batch
   *
   * @params: [batch] - optional batch to pass to inventory
   *
   * @return: none
   */
  navToInventory(batch?: Batch): void {
    console.log('routing to inventory', batch);
    this.router.navigate(
      ['tabs/extras'],
      {
        state: {
          optionalData: batch,
          passTo: 'inventory'
        }
      }
    );
  }

  /***** End Navigation ****/


  /***** Modal *****/

  /**
   * Get measurement form modal options
   *
   * @param: onBatchComplete - true if batch is being completed
   *   and measurement form should be required
   *
   * @return: modal componentProps object
   */
  getMeasurementFormModalOptions(onBatchComplete: boolean): object {
    return {
      areAllRequired: onBatchComplete,
      batch: this.selectedBatch
    };
  }

  /**
   * Handle measurement update on form dismiss
   *
   * @params: onBatchComplete - true if measurements are final
   *
   * @return: handler function to update measured values of batch
   */
  onMeasurementFormModalDismiss(onBatchComplete: boolean): (update: object) => Observable<Batch> {
    return (update: object): Observable<Batch> => {
      const _update: PrimaryValues = <PrimaryValues>update['data'];
      if (_update) {
        return this.processService.updateMeasuredValues(
          this.selectedBatch.cid,
          _update,
          !onBatchComplete
        );
      }

      return of(null);
    };
  }

  /**
   * Handle measurement form modal error
   *
   * @params: none
   *
   * @return: error handler function
   */
  onMeasurementFormModalError(): (error: string) => void {
    return (error: string): void => {
      console.log('Measurement form error', error);
      this.toastService.presentErrorToast('Error updating batch');
    };
  }

  /**
   * Handle measurement form modal success
   *
   * @params: onBatchComplete - true if batch is complete
   *
   * @return: success handler function
   */
  onMeasurementFormModalSuccess(onBatchComplete: boolean): (updatedBatch: Batch) => void {
    return (updated: Batch): void => {
      if (updated) {
        const oneSecond: number = 1000;
        this.toastService.presentToast('Measured Values Updated', oneSecond, 'bottom');
      }

      if (onBatchComplete) {
        this.navToInventory(updated);
      }
    };
  }

  /**
   * Open batch measurements form modal
   *
   * @params: onBatchComplete - true if a complete form is required
   *
   * @return: none
   */
  async openMeasurementFormModal(onBatchComplete: boolean): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ProcessMeasurementsFormPage,
      componentProps: this.getMeasurementFormModalOptions(onBatchComplete)
    });
    from(modal.onDidDismiss())
      .pipe(
        tap(() => { this.hideButton = true; }),
        mergeMap(this.onMeasurementFormModalDismiss(onBatchComplete)))
      .subscribe(
        this.onMeasurementFormModalSuccess(onBatchComplete),
        this.onMeasurementFormModalError()
      );
    return await modal.present();
  }

  /***** End Modal *****/

}
