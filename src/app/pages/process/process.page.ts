/* Module imports */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Navigation, Router } from '@angular/router';
import { OverlayEventDetail } from '@ionic/core';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, mergeMap, takeUntil } from 'rxjs/operators';

/* Interface imports */
import { Alert, Batch, BatchProcess, PrimaryValues, Process, TimerProcess } from '@shared/interfaces';

/* Type imports */
import { CustomError } from '@shared/types';

/* Component imports */
import { ProcessCalendarComponent, ProcessMeasurementsFormComponent } from '@components/process/public';

/* Service imports */
import { CalendarAlertService, CalendarService, ErrorReportingService, EventService, IdService, ModalService, ProcessService, TimerService, ToastService, UserService } from '@services/public';


@Component({
  selector: 'app-page-process',
  templateUrl: './process.page.html',
  styleUrls: ['./process.page.scss']
})
export class ProcessPage implements OnInit, OnDestroy {
  @ViewChild('calendar') calendarRef: ProcessCalendarComponent;
  alerts: Alert[] = [];
  atViewEnd: boolean = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  hideButton: boolean = false;
  isCalendarInProgress: boolean = false;
  rootURL: string = 'tabs/home';
  selectedBatch: Batch = null;
  selectedBatch$: BehaviorSubject<Batch> = null;
  stepData: any = null;
  stepType: string = '';
  title: string = '';
  viewStepIndex: number = 0;

  constructor(
    public calendarAlertService: CalendarAlertService,
    public calendarService: CalendarService,
    public errorReporter: ErrorReportingService,
    public event: EventService,
    public idService: IdService,
    public modalService: ModalService,
    public processService: ProcessService,
    public route: ActivatedRoute,
    public router: Router,
    public timerService: TimerService,
    public toastService: ToastService,
    public userService: UserService
  ) { }

  /***** Lifecycle Hooks *****/

  ngOnInit(): void {
    console.log('process page init');
    this.hideButton = false;
    this.listenForRouteChanges();
  }

  ngOnDestroy(): void {
    console.log('process page destroy');
    this.destroy$.next(true);
    this.destroy$.complete();
    this.event.unregister('change-date');
  }

  /***** End Lifecycle Hooks *****/


  /***** Batch Progress *****/

  /**
   * Advance the batch to the next step (blocks of concurrent timers have been skipped)
   *
   * @param: nextIndex - step index to go to
   * @return: none
   */
  advanceBatch(nextIndex: number): void {
    this.processService.updateBatch(this.selectedBatch)
      .subscribe(
        (): void => {
          this.selectedBatch.process.currentStep = nextIndex;
          this.viewStepIndex = nextIndex;
          this.updateView();
        },
        (error: Error): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Complete the current process step and trigger progress to next step,
   * if on last step, end the process, then move onto inventory item generation
   *
   * @param: none
   * @return: none
   */
  completeStep(): void {
    const nextIndex: number = this.getStep(true, true);
    if (nextIndex === -1) {
      this.endBatch();
    } else {
      this.advanceBatch(nextIndex);
    }
  }

  /**
   * Continue an existing batch
   *
   * @param: none
   * @return: none
   */
  continueBatch(batchId: string): void {
    this.selectedBatch$ = this.processService.getBatchById(batchId);
    if (this.selectedBatch$) {
      this.listenForBatchChanges(true);
    } else {
      this.errorReporter.setErrorReportFromCustomError(this.getMissingError('continue'));
    }
  }

  /**
   * End the batch; Open measurements form to confirm values before continuing
   *
   * @param: none
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
   * Assign given Batch to page properties accordingly
   *
   * @param: batch - the Batch to use as a process
   * @param: onContinue - true if continuing a batch; false to start a new batch
   * @return: none
   */
  handleBatchChange(batch: Batch, onContinue: boolean): void {
    this.selectedBatch = batch;
    this.title = batch.contextInfo.recipeMasterName;
    this.timerService.addBatchTimer(batch);
    if (onContinue) {
      this.goToActiveStep();
    } else {
      this.updateView();
    }
  }

  /**
   * Start a new batch from a recipe
   *
   * @param: none
   * @return: none
   */
  startNewBatch(configData: { [key: string]: any }): void {
    this.viewStepIndex = 0;
    this.atViewEnd = false;
    this.processService.startNewBatch(configData.requestedUserId, configData.recipeMasterId, configData.recipeVariantId)
      .pipe(
        mergeMap((newBatch: Batch): Observable<null> => {
          this.selectedBatch$ = this.processService.getBatchById(this.idService.getId(newBatch));
          return this.selectedBatch$ ? of(null) : throwError(this.getMissingError('start'));
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      )
      .subscribe(
        (): void => this.listenForBatchChanges(false),
        (error: Error): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /***** End Batch Progress *****/


  /***** Calendar Methods *****/

  /**
   * Handle change date event from calendar child component
   *
   * @param: none
   * @return: none
   */
  changeDateEventHandler(): void {
    this.stopCalendarInProgress(this.selectedBatch.process.currentStep);
    this.calendarAlertService.clearAlertsForCurrentStep(this.selectedBatch.process);
    this.toastService.presentToast('Select New Dates', this.toastService.mediumDuration, 'middle');
  }

  /**
   * Check if the current calendar is in progress; A calendar is
   * considered in progress if the step has a startDatetime property
   *
   * @param: none
   * @return: true if current step has a startDatetime property
   */
  hasCalendarStarted(): boolean {
    return this.calendarService.hasCalendarStarted(this.selectedBatch);
  }

  /**
   * Set the start of a calendar step
   *
   * @param: none
   * @return: none
   */
  startCalendar(): void {
    this.calendarService.startCalendar(this.selectedBatch, this.calendarRef.getSelectedCalendarData());
  }

  /**
   * Stop calendar in progress status
   *
   * @param: stepIndex - the process schedule index containing an in progress calendar process
   * @return: none
   */
  stopCalendarInProgress(stepIndex: number): void {
    delete this.selectedBatch.process.schedule[stepIndex]['startDatetime'];
    this.isCalendarInProgress = false;
  }

  /***** End Calendar Methods *****/


  /***** Listeners *****/

  /**
   * Listen for changes in selected batch
   *
   * @param: none
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
   * @param: none
   * @return: none
   */
  listenForRouteChanges(): void {
    this.route.queryParams
      .pipe(
        takeUntil(this.destroy$),
        mergeMap((): Observable<{ [key: string]: any }> => this.handleRouteChange()),
        catchError(this.errorReporter.handleGenericCatchError())
      )
      .subscribe(
        (configData: { [key: string]: any }): void => {
          if (configData.selectedBatchId) {
            this.continueBatch(configData.selectedBatchId);
          } else {
            this.startNewBatch(configData);
          }
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /***** End Listeners *****/


  /***** Modal *****/

  /**
   * Handle measurement update on form dismiss
   *
   * @param: areAllRequired - true if measurements are final
   * @return: handler function to update measured values of batch
   */
  onMeasurementFormModalDismiss(
    areAllRequired: boolean
  ): (event: OverlayEventDetail<PrimaryValues>) => Observable<Batch> {
    return (event: OverlayEventDetail<PrimaryValues>): Observable<Batch> => {
      if (event.data) {
        return this.processService.updateMeasuredValues(
          this.selectedBatch.cid,
          event.data,
          !areAllRequired
        );
      }

      return of<Batch>(null);
    };
  }

  /**
   * Open measurement form modal
   *
   * @param: areAllRequired - true if a complete form is required
   * @return: none
   */
  openMeasurementFormModal(areAllRequired: boolean): void {
    this.modalService.openModal<PrimaryValues, Batch>(
      ProcessMeasurementsFormComponent,
      { areAllRequired, batch: this.selectedBatch },
      this.onMeasurementFormModalDismiss(areAllRequired)
    )
    .subscribe(
      (updatedBatch: Batch): void => {
        this.hideButton = true;
        if (updatedBatch) {
          this.toastService.presentToast(
            'Measured Values Updated',
            this.toastService.shortDuration,
            'bottom'
          );
        }

        if (areAllRequired) {
          this.navToInventory(updatedBatch);
        }
      },
      (error: Error): void => this.errorReporter.handleUnhandledError(error)
    );
  }

  /***** End Modal *****/


  /***** Navigation *****/

  /**
   * Get router navigation properties and assign page properties accordingly
   *
   * @param: none
   * @return: observable of null on successful init
   */
  handleRouteChange(): Observable<{ [key: string]: any }> {
    try {
      const nav: Navigation = this.router.getCurrentNavigation();
      const configData: { [key: string]: any } = nav.extras.state;
      this.rootURL = configData.rootURL;
      return of(configData);
    } catch (error) {
      return throwError(error);
    }
  }

  /**
   * Navigate to inventory page with id of batch
   *
   * @param: [batch] - optional batch that inventory will use for base values
   * @return: none
   */
  navToInventory(batch?: Batch): void {
    this.router.navigate(['tabs/extras'], { state: { optionalData: batch, passTo: 'inventory' } });
  }

  /***** End Navigation *****/


  /***** View Navigation *****/

  /**
   * Change view index only, does not trigger step completion
   *
   * @param: isForward - true to advance forward; false to go back
   * @return: none
   */
  changeStep(isForward: boolean): void {
    const nextIndex: number = this.getStep(false, isForward);
    if (nextIndex !== -1) {
      this.viewStepIndex = nextIndex;
    }

    this.updateView();
  }

  /**
   * Get the next index, treating adjacent concurrent timers as a single step
   *
   * @param: isForward - true to advance forward; false to go back
   * @param: startIndex - the current index
   * @return: next index to use or -1 if at the beginning or end of schedule
   */
  getIndexSkippingConcurrent(isForward: boolean, startIndex: number): number {
    return this.timerService.getIndexSkippingConcurrent(
      isForward,
      startIndex,
      this.selectedBatch.process.schedule
    );
  }

  /**
   * Get the next step, skipping over neighboring concurrent timers
   *
   * @param: viewIndex - the view index to start from
   * @return: next index or -1 if at end
   */
  getNextStep(viewIndex: number): number {
    const process: BatchProcess = this.selectedBatch.process;
    if (viewIndex < process.schedule.length - 1) {
      if (process.schedule[viewIndex]['concurrent']) {
        return this.getIndexSkippingConcurrent(true, viewIndex);
      } else {
        return viewIndex + 1;
      }
    }
    return -1;
  }

  /**
   * Get the previous step, skipping over neighboring concurrent timers
   *
   * @param: viewIndex - the view index to start from
   * @return: next index or -1 if at start
   */
  getPreviousStep(viewIndex: number): number {
    const process: BatchProcess = this.selectedBatch.process;
    if (viewIndex > 0) {
      if (process.schedule[viewIndex - 1]['concurrent']) {
        return this.getIndexSkippingConcurrent(false, viewIndex);
      } else {
        return viewIndex - 1;
      }
    }
    return -1;
  }

  /**
   * Get the next or previous schedule step
   *
   * @param: onComplete - true if step is being completed
   * @param: isForward - true to advance forward; false to go back
   * @return: next index to use or -1 if at the beginning or end of schedule
   */
  getStep(onComplete: boolean, isForward: boolean): number {
    const process: BatchProcess = this.selectedBatch.process;
    const viewIndex: number = onComplete ? process.currentStep : this.viewStepIndex;
    if (isForward) {
      return this.getNextStep(viewIndex);
    }
    return this.getPreviousStep(viewIndex);
  }

  /**
   * Change view index to the currently active step and update view
   *
   * @param: none
   * @return: none
   */
  goToActiveStep(): void {
    this.viewStepIndex = this.selectedBatch.process.currentStep;
    this.updateView();
  }

  /***** End View Navigation *****/


  /***** View Update *****/

  /**
   * Set values to be displayed in current view
   *
   * @param: none
   * @return: none
   */
  updateView(): void {
    this.updateViewAlerts();
    this.updateViewStep();
    this.updateAtViewEnd();
  }

  /**
   * Set alerts for current step
   *
   * @param: none
   * @return: none
   */
  updateViewAlerts(): void {
    this.alerts = this.calendarAlertService.getAlerts(this.selectedBatch.process);
  }

  /**
   * Set view end flag
   *
   * @param: none
   * @return: none
   */
  updateAtViewEnd(): void {
    this.atViewEnd = (
      this.viewStepIndex === this.selectedBatch.process.schedule.length - 1
      || this.getIndexSkippingConcurrent(true, this.viewStepIndex) === -1
    );
  }

  /**
   * Update the view step data and type
   *
   * @param: none
   * @return: none
   */
  updateViewStep(): void {
    const pendingStep: Process = this.selectedBatch.process.schedule[this.viewStepIndex];
    if (pendingStep.type === 'timer') {
      this.stepData = this.getTimerStepData();
      this.stepType = 'timer';
    } else {
      this.stepData = pendingStep;
      this.stepType = pendingStep.type;
      this.isCalendarInProgress = this.hasCalendarStarted();
    }
  }

  /***** End View Update *****/


  /***** Other *****/

  /**
   * Get a custom error on missing batch
   *
   * @param: operationName - the name of the operation that threw the error
   * @return: a new custom error
   */
  getMissingError(operationName: string): CustomError {
    const message: string = `An error occurred trying to ${operationName} a batch:${operationName === 'start' ? ' new' : ''} batch not found`;
    return new CustomError('BatchError', message, this.errorReporter.highSeverity, message);
  }

  /**
   * Get the timer process step starting at current view
   * index and including neighbor concurrent timers
   *
   * @param: none
   * @return: Array of timer processes
   */
  getTimerStepData(): TimerProcess[] {
    return this.timerService.getTimerStepData(this.selectedBatch.process.schedule, this.viewStepIndex);
  }

  /***** End Other *****/
}
