/* Module imports */
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Navigation } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { BehaviorSubject, Observable, Subject, from, of, throwError } from 'rxjs';
import { map, mergeMap, takeUntil } from 'rxjs/operators';

/* Interface imports */
import { Alert } from '../../shared/interfaces/alert';
import { Batch, BatchProcess } from '../../shared/interfaces/batch';
import { PrimaryValues } from '../../shared/interfaces/primary-values';
import { Process } from '../../shared/interfaces/process';

/* Utility function imports */
import { getId } from '../../shared/utility-functions/id-helpers';

/* Component imports */
import { ProcessCalendarComponent } from '../../components/process-calendar/process-calendar.component';

/* Page imports */
import { ProcessMeasurementsFormPage } from '../forms/process-measurements-form/process-measurements-form.page';

/* Service imports */
import { EventService } from '../../services/event/event.service';
import { ProcessService } from '../../services/process/process.service';
import { TimerService } from '../../services/timer/timer.service';
import { ToastService } from '../../services/toast/toast.service';
import { UserService } from '../../services/user/user.service';


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
  controlActions: object = {
    changeStep: this.changeStep.bind(this),
    completeStep: this.completeStep.bind(this),
    goToActiveStep: this.goToActiveStep.bind(this),
    openMeasurementFormModal: this.openMeasurementFormModal.bind(this),
    startCalendar: this.startCalendar.bind(this)
  };
  destroy$: Subject<boolean> = new Subject<boolean>();
  isCalendarInProgress: boolean = false;
  isConcurrent: boolean = false;
  navigateToRoot: () => void = () => this.router.navigate([this.rootURL]);
  onControlAction: (actionName: string, options?: object) => void;
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
    public event: EventService,
    public modalCtrl: ModalController,
    public platform: Platform,
    public processService: ProcessService,
    public route: ActivatedRoute,
    public router: Router,
    public timerService: TimerService,
    public toastService: ToastService,
    public userService: UserService
  ) {
    this.onControlAction = this.onControlActionHandler.bind(this);
  }

  /***** Lifecycle Hooks *****/

  ngOnInit() {
    console.log('process page init');
    this.listenForRouteChanges();
    this.event.register('change-date')
      .pipe(takeUntil(this.destroy$))
      .subscribe((): void => this.changeDateEventHandler());
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
   * Listen for changes in selected batch
   *
   * @params: none
   * @return: none
   */
  listenForBatchChanges(onContinue: boolean): void {
    this.selectedBatch$
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (selectedBatch: Batch): void => {
          console.log('batch change', selectedBatch);
          this.selectedBatch = selectedBatch;
          this.selectedBatchId = getId(selectedBatch);
          this.title = selectedBatch.contextInfo.recipeMasterName;
          this.timerService.addBatchTimer(selectedBatch);
          if (onContinue) {
            this.goToActiveStep();
          } else {
            this.updateViewData();
          }
        },
        (error: string): void => {
          this.toastService.presentErrorToast(error, this.navigateToRoot);
        }
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
        map((): Observable<never> => {
          console.log('route change detected');
          try {
            const nav: Navigation = this.router.getCurrentNavigation();
            const configData: object = nav.extras.state;

            this.rootURL = configData['rootURL'];
            this.requestedUserId = configData['requestedUserId'];
            this.recipeMasterId = configData['recipeMasterId'];
            this.recipeVariantId = configData['recipeVariantId'];
            this.selectedBatchId = configData['selectedBatchId'];
          } catch (error) {
            return throwError(error);
          }
        })
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
        (error: string): void => {
          console.log('Process page routing error', error);
          this.toastService.presentErrorToast(
            'Process routing error',
            this.navigateToRoot
          );
        }
      );
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

    this.processService.startNewBatch(
      this.requestedUserId,
      this.recipeMasterId,
      this.recipeVariantId
    )
    .pipe(map((newBatch: Batch): Observable<never> => {
      this.selectedBatch$ = this.processService.getBatchById(getId(newBatch));
      console.log('start pipe', this.selectedBatch$);

      if (!this.selectedBatch$) {
        return throwError('Internal error: Batch not found');
      }
    }))
    .subscribe(
      (): void => this.listenForBatchChanges(false),
      (error: string): void => {
        this.toastService.presentErrorToast(error, this.navigateToRoot);
      }
    );
  }

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
      this.toastService.presentErrorToast(
        'Internal error: Batch not found',
        this.navigateToRoot
      );
    }
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
    return process.alerts
      .filter((alert: Alert): boolean => {
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
  getTimerStepData(): Process[] {
    const schedule: Process[] = this.selectedBatch.process.schedule;

    const start: number = this.viewStepIndex;
    let end: number = start + 1;

    if (schedule[start].concurrent) {
      for (; end < schedule.length; end++) {
        if (!schedule[end].concurrent) {
          break;
        }
      }
    }

    return schedule.slice(start, end);
  }

  /**
   * Handle child component control function calls
   *
   * @params: actionName - the method name called
   * @params: [options] - optional additional arguments
   *
   * @return: none
   */
  onControlActionHandler(actionName: string, ...options: any[]): void {
    try {
      this.controlActions[actionName](...options);
    } catch (error) {
      console.log('Control action error', actionName, error);
    }
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
    console.log('advance', this.selectedBatch);
    this.selectedBatch.process.currentStep = nextIndex;
    this.viewStepIndex = nextIndex;
    this.updateViewData();
    this.processService.patchBatch(this.selectedBatch)
      .subscribe(
        (): void => console.log('batch increment step'),
        (error: string): void => {
          console.log('batch patch error', error);
          this.toastService.presentErrorToast(
            'Step completion error',
            this.navigateToRoot
          );
        }
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
    this.processService.endBatchById(getId(this.selectedBatch))
      .subscribe(
        (): void => console.log('batch completed'),
        (error: string): void => {
          console.log('batch end error', error);
          this.toastService.presentErrorToast(
            'Batch completion error',
            this.navigateToRoot
          );
        }
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
        if (!process.schedule[i].concurrent) {
          nextIndex = i;
          break;
        }
      }
    } else if (direction === 'prev') {
      for (let i = startIndex - 1; i >= 0; i--) {
        if (!process.schedule[i].concurrent) {
          nextIndex = i + 1;
          break;
        }
      }
    } else {
      console.log('Step direction error', direction);
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
    const viewIndex: number = onComplete
      ? process.currentStep
      : this.viewStepIndex;

    if (direction === 'next') {
      if (viewIndex < process.schedule.length - 1) {
        if (process.schedule[viewIndex].concurrent) {
          return this.getIndexAfterSkippingConcurrent(direction, viewIndex);
        } else {
          return viewIndex + 1;
        }
      }
    } else if (direction === 'prev') {
      if (viewIndex > 0) {
        if (process.schedule[viewIndex - 1].concurrent) {
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
    this.atViewEnd = this.viewStepIndex === process.schedule.length - 1
      || this.getIndexAfterSkippingConcurrent('next', this.viewStepIndex) === -1;
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
    this.toastService.presentToast(
      'Select new dates',
      1500,
      'middle'
    );
    delete this.selectedBatch
      .process
      .schedule[this.selectedBatch.process.currentStep]
      .startDatetime;
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
    process.alerts = process.alerts
      .filter((alert: Alert): boolean => {
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
      && process
        .schedule[this.selectedBatch.process.currentStep]
        .hasOwnProperty('startDatetime')
    );
  }

  /**
   * Set the start of a calendar step
   *
   * @params: none
   * @return: none
   */
  startCalendar(): void {
    const values: object = this.calendarRef.startCalendar();
    this.processService.patchStepById(getId(this.selectedBatch), values)
      .subscribe((): void => console.log('Started calendar'));
  }

  /***** End Calendar Specific Methods *****/


  /***** Other *****/

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

  onMeasurementFormModalDismiss(
    onBatchComplete: boolean
  ): (update: object) => Observable<Batch> {
    return (update: object): Observable<Batch> => {
      const _update: PrimaryValues = <PrimaryValues>update['data'];
      if (_update) {
        return this.processService.patchMeasuredValues(
          !onBatchComplete,
          getId(this.selectedBatch),
          _update
        );
      }
      return of(null);
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
    const options: object = {
      areAllRequired: onBatchComplete,
      batch: this.selectedBatch
    };

    const modal = await this.modalCtrl.create({
      component: ProcessMeasurementsFormPage,
      componentProps: options
    });

    from(modal.onDidDismiss())
      .pipe(mergeMap(this.onMeasurementFormModalDismiss(onBatchComplete)))
      .subscribe(
        (updated: Batch): void => {
          if (updated) {
            this.toastService.presentToast(
              'Measured Values Updated',
              1000,
              'bottom'
            );
          }
          if (onBatchComplete) {
            console.log('navigating to inventory with info');
            this.navToInventory(updated);
          }
        },
        (error: string): void => {
          console.log('Measurement form error', error);
          this.toastService.presentErrorToast('Error updating batch');
        }
      );

    return await modal.present();
  }

  /***** End Other *****/

}
