/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { IonicModule, ModalController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockBatch, mockAlert, mockAlertPresent, mockAlertFuture } from '../../../../test-config/mock-models';
import { EventServiceStub, ProcessServiceStub, TimerServiceStub, ToastServiceStub, UserServiceStub } from '../../../../test-config/service-stubs';
import { HeaderComponentStub, ProcessCalendarComponentStub, ProcessManualComponentStub, ProcessTimerComponentStub, ProcessMeasurementsFormPageStub, ProcessControlsComponentStub } from '../../../../test-config/component-stubs';
import { ModalControllerStub, ModalStub, ActivatedRouteStub } from '../../../../test-config/ionic-stubs';

/* Interface imports */
import { Alert } from '../../shared/interfaces/alert';
import { Batch } from '../../shared/interfaces/batch';
import { Process } from '../../shared/interfaces/process';

/* Service imports */
import { EventService } from '../../services/event/event.service';
import { ProcessService } from '../../services/process/process.service';
import { TimerService } from '../../services/timer/timer.service';
import { ToastService } from '../../services/toast/toast.service';
import { UserService } from '../../services/user/user.service';

/* Page imports */
import { ProcessPage } from './process.page';
import { ProcessMeasurementsFormPage } from '../forms/process-measurements-form/process-measurements-form.page';


describe('ProcessPage', (): void => {
  let fixture: ComponentFixture<ProcessPage>;
  let processPage: ProcessPage;
  let originalOnInit: any;
  let originalOnDestroy: any;
  let originalQuery: any;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        ProcessPage,
        HeaderComponentStub,
        ProcessCalendarComponentStub,
        ProcessManualComponentStub,
        ProcessTimerComponentStub,
        ProcessMeasurementsFormPageStub,
        ProcessControlsComponentStub
      ],
      imports: [
        IonicModule,
        RouterTestingModule
      ],
      providers: [
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        { provide: ModalController, useClass: ModalControllerStub },
        { provide: EventService, useClass: EventServiceStub },
        { provide: ProcessService, useClass: ProcessServiceStub },
        { provide: TimerService, useClass: TimerServiceStub },
        { provide: ToastService, useClass: ToastServiceStub },
        { provide: UserService, useClass: UserServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ProcessPage);
    processPage = fixture.componentInstance;
    originalOnInit = processPage.ngOnInit;
    originalOnDestroy = processPage.ngOnDestroy;
    originalQuery = global.document.querySelector;
    processPage.ngOnInit = jest
      .fn();
    processPage.ngOnDestroy = jest
      .fn();
    processPage.toastService.presentToast = jest
      .fn();
    processPage.toastService.presentErrorToast = jest
      .fn();
  });

  afterEach((): void => {
    global.document.querySelector = originalQuery;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(processPage).toBeDefined();
  });

  describe('Lifecycle', (): void => {

    test('should init the component', (done: jest.DoneCallback): void => {
      processPage.ngOnInit = originalOnInit;

      processPage.listenForRouteChanges = jest
        .fn();

      processPage.event.register = jest
        .fn()
        .mockReturnValue(of({}));

      processPage.changeDateEventHandler = jest
        .fn();

      const changeSpy: jest.SpyInstance = jest.spyOn(processPage, 'changeDateEventHandler');

      fixture.detectChanges();

      setTimeout((): void => {
        expect(changeSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should handle destroying the component', (): void => {
      processPage.ngOnDestroy = originalOnDestroy;

      processPage.event.unregister = jest
        .fn();

      const nextSpy: jest.SpyInstance = jest.spyOn(processPage.destroy$, 'next');
      const completeSpy: jest.SpyInstance = jest.spyOn(processPage.destroy$, 'complete');
      const unregisterSpy: jest.SpyInstance = jest.spyOn(processPage.event, 'unregister');

      fixture.detectChanges();

      processPage.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalledWith(true);
      expect(completeSpy).toHaveBeenCalled();
      expect(unregisterSpy).toHaveBeenCalledWith('change-date');
    });

  });


  describe('Batch Initialization', (): void => {

    test('should listen for changes of selected batch on continuation', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);

      processPage.selectedBatch$ = _mockBatch$;

      processPage.timerService.addBatchTimer = jest
        .fn();

      processPage.goToActiveStep = jest
        .fn();

      const gotoSpy: jest.SpyInstance = jest.spyOn(processPage, 'goToActiveStep');

      fixture.detectChanges();

      processPage.listenForBatchChanges(true);

      setTimeout((): void => {
        expect(gotoSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should listen for changes of selected batch on start', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);

      processPage.selectedBatch$ = _mockBatch$;

      processPage.timerService.addBatchTimer = jest
        .fn();

      processPage.updateViewData = jest
        .fn();

      const viewSpy: jest.SpyInstance = jest.spyOn(processPage, 'updateViewData');

      fixture.detectChanges();

      processPage.listenForBatchChanges(false);

      setTimeout((): void => {
        expect(viewSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should handle error on batch change', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);

      processPage.selectedBatch$ = _mockBatch$;

      processPage.timerService.addBatchTimer = jest
        .fn();

      processPage.goToActiveStep = jest
        .fn();

      const toastSpy: jest.SpyInstance = jest.spyOn(processPage.toastService, 'presentErrorToast');

      fixture.detectChanges();

      processPage.listenForBatchChanges(true);

      _mockBatch$.error('test-error');

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith('test-error', processPage.navigateToRoot);
        done();
      }, 10);
    });

    test('should listen for route changes on batch continuation', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();

      processPage.router.getCurrentNavigation = jest
        .fn()
        .mockReturnValue({
          extras: {
            state: {
              rootURL: 'rootURL',
              requestedUserId: _mockBatch.owner,
              recipeMasterId: _mockBatch.recipeMasterId,
              recipeVariantId: _mockBatch.recipeVariantId,
              selectedBatchId: _mockBatch.cid
            }
          }
        });

      processPage.continueBatch = jest
        .fn();

      const continueSpy: jest.SpyInstance = jest.spyOn(processPage, 'continueBatch');

      fixture.detectChanges();

      processPage.listenForRouteChanges();

      setTimeout((): void => {
        expect(continueSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should listen for route changes on batch continuation', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();

      processPage.router.getCurrentNavigation = jest
        .fn()
        .mockReturnValue({
          extras: {
            state: {
              rootURL: 'rootURL',
              requestedUserId: _mockBatch.owner,
              recipeMasterId: _mockBatch.recipeMasterId,
              recipeVariantId: _mockBatch.recipeVariantId,
              selectedBatchId: undefined
            }
          }
        });

      processPage.startNewBatch = jest
        .fn();

      const startSpy: jest.SpyInstance = jest.spyOn(processPage, 'startNewBatch');

      fixture.detectChanges();

      processPage.listenForRouteChanges();

      setTimeout((): void => {
        expect(startSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should handle an error on route change', (done: jest.DoneCallback): void => {
      processPage.route.queryParams = throwError('test-error');

      const toastSpy: jest.SpyInstance = jest.spyOn(processPage.toastService, 'presentErrorToast');

      fixture.detectChanges();

      processPage.listenForRouteChanges();

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith(
          'Process routing error',
          processPage.navigateToRoot
        );
        done();
      }, 10);
    });

    test('should handle error from nav data on route change', (done: jest.DoneCallback): void => {
      processPage.router.getCurrentNavigation = jest
        .fn()
        .mockImplementation((): void => { throw new Error('test-error'); });

      const toastSpy: jest.SpyInstance = jest.spyOn(processPage.toastService, 'presentErrorToast');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      fixture.detectChanges();

      processPage.listenForRouteChanges();

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith(
          'Process routing error',
          processPage.navigateToRoot
        );
        const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
        expect(consoleCalls[0]).toMatch('Process page routing error');
        expect(consoleCalls[1]).toMatch('test-error');
        done();
      }, 10);
    });

    test('should start a new batch', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);

      processPage.processService.startNewBatch = jest
        .fn()
        .mockReturnValue(of(_mockBatch));

      processPage.processService.getBatchById = jest
        .fn()
        .mockReturnValue(_mockBatch$);

      processPage.listenForBatchChanges = jest
        .fn();

      const listenSpy: jest.SpyInstance = jest.spyOn(processPage, 'listenForBatchChanges');

      fixture.detectChanges();

      processPage.startNewBatch();

      setTimeout((): void => {
        expect(listenSpy).toHaveBeenCalledWith(false);
        done();
      }, 10);
    });

    test('should handle error when starting a new batch', (done: jest.DoneCallback): void => {
      processPage.processService.startNewBatch = jest
        .fn()
        .mockReturnValue(throwError('test-error'));

      const toastSpy: jest.SpyInstance = jest.spyOn(processPage.toastService, 'presentErrorToast');

      fixture.detectChanges();

      processPage.startNewBatch();

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith(
          'test-error',
          processPage.navigateToRoot
        );
        done();
      }, 10);
    });

    test('should handle error when starting a new batch and unable to find stored batch', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();

      processPage.processService.startNewBatch = jest
        .fn()
        .mockReturnValue(of(_mockBatch));

      processPage.processService.getBatchById = jest
        .fn()
        .mockReturnValue(undefined);

      const toastSpy: jest.SpyInstance = jest.spyOn(processPage.toastService, 'presentErrorToast');

      fixture.detectChanges();

      processPage.startNewBatch();

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith(
          'Internal error: Batch not found',
          processPage.navigateToRoot
        );
        done();
      }, 10);
    });

    test('should continue a batch', (): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);

      processPage.processService.getBatchById = jest
        .fn()
        .mockReturnValue(_mockBatch$);

      processPage.listenForBatchChanges = jest
        .fn();

      const listenSpy: jest.SpyInstance = jest.spyOn(processPage, 'listenForBatchChanges');

      fixture.detectChanges();

      processPage.continueBatch();

      expect(listenSpy).toHaveBeenCalled();
    });

    test('should handle error continuing a batch', (): void => {
      processPage.processService.getBatchById = jest
        .fn()
        .mockReturnValue(undefined);

      const toastSpy: jest.SpyInstance = jest.spyOn(processPage.toastService, 'presentErrorToast');

      fixture.detectChanges();

      processPage.continueBatch();

      expect(toastSpy).toHaveBeenCalledWith(
        'Internal error: Batch not found',
        processPage.navigateToRoot
      );
    });

  });


  describe('Child Component Functions', (): void => {

    test('should get all alerts', (): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockAlertPresent: Alert = mockAlertPresent();
      const _mockAlertFuture: Alert = mockAlertFuture();
      const _mockAlertOther: Alert = mockAlert();

      _mockAlertPresent.title = _mockBatch.process.schedule[_mockBatch.process.currentStep].name;
      _mockAlertFuture.title = _mockBatch.process.schedule[_mockBatch.process.currentStep].name;
      _mockAlertOther.title = Date.now().toString();

      _mockBatch.process.alerts = [
        _mockAlertPresent,
        _mockAlertFuture,
        _mockAlertOther
      ];

      processPage.selectedBatch = _mockBatch;

      fixture.detectChanges();

      const alerts: Alert[] = processPage.getAlerts();

      expect(alerts.length).toEqual(2);
      expect(alerts[0]).toStrictEqual(_mockAlertPresent);
      expect(alerts[1]).toStrictEqual(_mockAlertFuture);
    });

    test('should get timer step data', (): void => {
      const _mockBatch: Batch = mockBatch();

      const singleTimerIndex: number = 10;
      const concurrentTimerStartIndex: number = 2;

      processPage.selectedBatch = _mockBatch;

      processPage.viewStepIndex = singleTimerIndex;

      fixture.detectChanges();

      const singleTimerStep: Process[] = processPage.getTimerStepData();

      expect(singleTimerStep.length).toEqual(1);
      expect(singleTimerStep[0]).toStrictEqual(_mockBatch.process.schedule[singleTimerIndex]);

      processPage.viewStepIndex = concurrentTimerStartIndex;

      fixture.detectChanges();

      const concurrentTimerSteps: Process[] = processPage.getTimerStepData();

      expect(concurrentTimerSteps.length).toEqual(2);
      expect(concurrentTimerSteps[0]).toStrictEqual(_mockBatch.process.schedule[concurrentTimerStartIndex]);
      expect(concurrentTimerSteps[1]).toStrictEqual(_mockBatch.process.schedule[concurrentTimerStartIndex + 1]);
    });

    test('should handle child component control action call', (): void => {
      processPage.changeStep = jest
        .fn();

      processPage.controlActions['changeStep'] = processPage.changeStep;

      fixture.detectChanges();

      const changeSpy: jest.SpyInstance = jest.spyOn(processPage, 'changeStep');

      processPage.onControlActionHandler('changeStep', 'next');

      expect(changeSpy).toHaveBeenCalledWith('next');
    });

    test('should handle an error from a child component control action call', (): void => {
      const _mockError: Error = new Error('test-error');

      processPage.changeStep = jest
        .fn()
        .mockImplementation((): void => { throw _mockError; });

      processPage.controlActions['changeStep'] = processPage.changeStep;

      fixture.detectChanges();

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      processPage.onControlActionHandler('changeStep', 'next');

      const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
      expect(consoleCalls[0]).toMatch('Control action error');
      expect(consoleCalls[1]).toMatch('changeStep');
      expect(consoleCalls[2]).toStrictEqual(_mockError);
    });

  });


  describe('View Navigation', (): void => {

    test('should advance batch current step', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      _mockBatch.process.currentStep = 0;

      processPage.selectedBatch = _mockBatch;
      processPage.viewStepIndex = 0;
      processPage.updateViewData = jest
        .fn();

      processPage.processService.updateBatch = jest
        .fn()
        .mockReturnValue(of(_mockBatch));

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      fixture.detectChanges();

      processPage.advanceBatch(1);

      setTimeout((): void => {
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('batch increment step');
        done();
      }, 10);
    });

    test('should handle an error updating batch on advance batch', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();

      processPage.selectedBatch = _mockBatch;
      processPage.viewStepIndex = 0;
      processPage.updateViewData = jest
        .fn();

      processPage.processService.updateBatch = jest
        .fn()
        .mockReturnValue(throwError('test-error'));

      const toastSpy: jest.SpyInstance = jest.spyOn(processPage.toastService, 'presentErrorToast');

      fixture.detectChanges();

      processPage.advanceBatch(1);

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith(
          'Step completion error',
          processPage.navigateToRoot
        );
        done();
      }, 10);
    });

    test('should change step in given direction', (): void => {
      processPage.getStep = jest
        .fn()
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(-1);

      processPage.updateViewData = jest
        .fn();

      processPage.viewStepIndex = 0;

      const getSpy: jest.SpyInstance = jest.spyOn(processPage, 'getStep');

      fixture.detectChanges();

      processPage.changeStep('next');
      expect(getSpy).toHaveBeenCalledWith(false, 'next');
      expect(processPage.viewStepIndex).toEqual(1);

      processPage.changeStep('prev');
      expect(getSpy).toHaveBeenCalledWith(false, 'prev');
      expect(processPage.viewStepIndex).toEqual(1);
    });

    test('should complete a step', (): void => {
      processPage.getStep = jest
        .fn()
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(-1);

      processPage.endBatch = jest
        .fn();

      processPage.advanceBatch = jest
        .fn();

      const endSpy: jest.SpyInstance = jest.spyOn(processPage, 'endBatch');
      const advanceSpy: jest.SpyInstance = jest.spyOn(processPage, 'advanceBatch');

      fixture.detectChanges();

      processPage.completeStep();

      expect(endSpy).not.toHaveBeenCalled();
      expect(advanceSpy).toHaveBeenCalledWith(1);

      processPage.completeStep();

      expect(endSpy).toHaveBeenCalled();
      expect(advanceSpy).toHaveBeenCalledTimes(1);
    });

    test('should end a batch', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();

      processPage.selectedBatch = _mockBatch;

      processPage.timerService.removeBatchTimer = jest
        .fn();

      processPage.openMeasurementFormModal = jest
        .fn();

      processPage.processService.endBatchById = jest
        .fn()
        .mockReturnValue(of({}));

      const removeSpy: jest.SpyInstance = jest.spyOn(processPage.timerService, 'removeBatchTimer');
      const openSpy: jest.SpyInstance = jest.spyOn(processPage, 'openMeasurementFormModal');
      const endSpy: jest.SpyInstance = jest.spyOn(processPage.processService, 'endBatchById');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      fixture.detectChanges();

      processPage.endBatch();

      setTimeout((): void => {
        expect(removeSpy).toHaveBeenCalledWith(_mockBatch.cid);
        expect(openSpy).toHaveBeenCalledWith(true);
        expect(endSpy).toHaveBeenCalledWith(_mockBatch._id);
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('batch completed');
        done();
      }, 10);
    });

    test('should handle error on end batch', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();

      processPage.selectedBatch = _mockBatch;

      processPage.timerService.removeBatchTimer = jest
        .fn();

      processPage.openMeasurementFormModal = jest
        .fn();

      processPage.processService.endBatchById = jest
        .fn()
        .mockReturnValue(throwError('test-error'));

      const toastSpy: jest.SpyInstance = jest.spyOn(processPage.toastService, 'presentErrorToast');

      fixture.detectChanges();

      processPage.endBatch();

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith(
          'Batch completion error',
          processPage.navigateToRoot
        );
        done();
      }, 10);
    });

    test('should get next step index after concurrent timer block', (): void => {
      const _mockBatch: Batch = mockBatch();

      processPage.selectedBatch = _mockBatch;

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      fixture.detectChanges();

      // indicies 2 and 3 are concurrent
      const skipTo4: number = processPage.getIndexAfterSkippingConcurrent('next', 2);
      expect(skipTo4).toEqual(4);
      const skipTo2: number = processPage.getIndexAfterSkippingConcurrent('prev', 4);
      expect(skipTo2).toEqual(2);
      const noSkipNext: number = processPage.getIndexAfterSkippingConcurrent('next', 0);
      expect(noSkipNext).toEqual(0);
      const noSkipPrev: number = processPage.getIndexAfterSkippingConcurrent('prev', 1);
      expect(noSkipPrev).toEqual(1);
      const invalid: number = processPage.getIndexAfterSkippingConcurrent('other', 1);
      expect(invalid).toEqual(-1);
      const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
      expect(consoleCalls[0]).toMatch('Step direction error');
      expect(consoleCalls[1]).toMatch('other');
    });

    test('should get the next step in a given direction', (): void => {
      const _mockBatch: Batch = mockBatch();
      _mockBatch.process.currentStep = 2;

      processPage.selectedBatch = _mockBatch;
      processPage.viewStepIndex = 0;

      processPage.getIndexAfterSkippingConcurrent = jest
        .fn()
        .mockImplementation((direction: string, index: number): number => index);

      fixture.detectChanges();

      const getNextConcurrent: number = processPage.getStep(true, 'next');
      expect(getNextConcurrent).toEqual(2);

      const getNextNonConcurrent: number = processPage.getStep(false, 'next');
      expect(getNextNonConcurrent).toEqual(1);

      processPage.selectedBatch.process.currentStep = 3;
      processPage.viewStepIndex = 1;

      const getPrevConcurrent: number = processPage.getStep(true, 'prev');
      expect(getPrevConcurrent).toEqual(3);

      const getPrevNonConcurrent: number = processPage.getStep(false, 'prev');
      expect(getPrevNonConcurrent).toEqual(0);

      processPage.selectedBatch.process.currentStep = processPage.selectedBatch.process.schedule.length - 1;
      processPage.viewStepIndex = 0;

      const getNextFromEnd: number = processPage.getStep(true, 'next');
      expect(getNextFromEnd).toEqual(-1);

      const getPrevFromStart: number = processPage.getStep(false, 'prev');
      expect(getPrevFromStart).toEqual(-1);

      const invalidDirection: number = processPage.getStep(true, 'other');
      expect(invalidDirection).toEqual(-1);
    });

    test('should go to active step', (): void => {
      const _mockBatch: Batch = mockBatch();
      const midIndex: number = _mockBatch.process.schedule.length / 2;
      _mockBatch.process.currentStep = midIndex;

      processPage.selectedBatch = _mockBatch;

      processPage.updateViewData = jest
        .fn();

      processPage.viewStepIndex = 0;

      fixture.detectChanges();

      processPage.goToActiveStep();

      expect(processPage.viewStepIndex).toEqual(midIndex);
    });

    test('should update current view data', (): void => {
      const _mockBatch: Batch = mockBatch();
      const timerIndex: number = 10;
      const timerStep: Process = _mockBatch.process.schedule[timerIndex];
      _mockBatch.process.currentStep = 0;

      processPage.selectedBatch = _mockBatch;
      processPage.viewStepIndex = 0;

      processPage.getTimerStepData = jest
        .fn()
        .mockReturnValue([timerStep]);

      processPage.hasCalendarStarted = jest
        .fn()
        .mockReturnValue(false);

      processPage.getAlerts = jest
        .fn()
        .mockReturnValue([]);

      processPage.getIndexAfterSkippingConcurrent = jest
        .fn();

      fixture.detectChanges();

      processPage.updateViewData();

      expect(processPage.stepData).toStrictEqual(_mockBatch.process.schedule[0]);
      expect(processPage.stepType).toMatch('manual');
      expect(processPage.atViewStart).toBe(true);
      expect(processPage.atViewEnd).toBe(false);

      processPage.viewStepIndex = timerIndex;

      processPage.updateViewData();

      expect(processPage.stepData).toStrictEqual([_mockBatch.process.schedule[timerIndex]]);
      expect(processPage.stepType).toMatch('timer');
      expect(processPage.atViewStart).toBe(false);
      expect(processPage.atViewEnd).toBe(false);
    });

  });


  describe('Calendar Specific', (): void => {

    test('should handle date change event', (): void => {
      const _mockBatch: Batch = mockBatch();
      const calendarIndex: number = _mockBatch.process.schedule.length - 2;
      _mockBatch.process.schedule[calendarIndex].startDatetime = (new Date()).toISOString();
      _mockBatch.process.currentStep = calendarIndex;

      processPage.selectedBatch = _mockBatch;

      processPage.clearAlertsForCurrentStep = jest
        .fn();

      const toastSpy: jest.SpyInstance = jest.spyOn(processPage.toastService, 'presentToast');

      fixture.detectChanges();

      expect(_mockBatch.process.schedule[calendarIndex].startDatetime).toBeDefined();

      processPage.changeDateEventHandler();

      expect(_mockBatch.process.schedule[calendarIndex].startDatetime).toBeUndefined();
      expect(toastSpy).toHaveBeenCalledWith(
        'Select new dates',
        1500,
        'middle'
      );
    });

    test('should clear alerts for the current step', (): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockAlertToClear: Alert = mockAlert();
      _mockAlertToClear.title = _mockBatch.process.schedule[_mockBatch.process.currentStep].name;

      const _mockAlertOther: Alert = mockAlert();
      _mockAlertOther.title = 'other';

      _mockBatch.process.alerts = [
        _mockAlertOther,
        _mockAlertToClear
      ];

      processPage.selectedBatch = _mockBatch;

      fixture.detectChanges();

      processPage.clearAlertsForCurrentStep();

      expect(_mockBatch.process.alerts.length).toEqual(1);
      expect(_mockBatch.process.alerts[0]).toStrictEqual(_mockAlertOther);
    });

    test('should check if calendar step has been started', (): void => {
      const _mockBatch: Batch = mockBatch();
      const calendarNotStartedIndex: number = 13;
      const calendarStartedIndex: number = _mockBatch.process.schedule.length - 2;

      _mockBatch.process.schedule[calendarStartedIndex].startDatetime = (new Date()).toISOString();
      _mockBatch.process.currentStep = calendarNotStartedIndex;

      processPage.selectedBatch = _mockBatch;

      fixture.detectChanges();

      expect(processPage.hasCalendarStarted()).toBe(false);

      processPage.selectedBatch.process.currentStep = calendarStartedIndex;

      expect(processPage.hasCalendarStarted()).toBe(true);
    });

    test('should start a calendar step', (done: jest.DoneCallback): void => {
      processPage.processService.updateStepById = jest
        .fn()
        .mockReturnValue(of(null));

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      fixture.detectChanges();

      processPage.calendarRef = new ProcessCalendarComponentStub();

      processPage.calendarRef.startCalendar = jest
        .fn();

      processPage.startCalendar();

      setTimeout((): void => {
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Started calendar');
        done();
      }, 10);
    });

    test('should handle error starting a calendar step', (done: jest.DoneCallback): void => {
      processPage.processService.updateStepById = jest
        .fn()
        .mockReturnValue(throwError('test-error'));

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
      const toastSpy: jest.SpyInstance = jest.spyOn(processPage.toastService, 'presentErrorToast');

      fixture.detectChanges();

      processPage.calendarRef = new ProcessCalendarComponentStub();

      processPage.calendarRef.startCalendar = jest
        .fn();

      processPage.startCalendar();

      setTimeout((): void => {
        const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
        expect(consoleCalls[0]).toMatch('Calendar start error');
        expect(consoleCalls[1]).toMatch('test-error');
        expect(toastSpy).toHaveBeenCalledWith('Error starting calendar step');
        done();
      }, 10);
    });

  });


  describe('Navigation', (): void => {

    test('should nav to inventory', (): void => {
      const _mockBatch: Batch = mockBatch();

      processPage.router.navigate = jest
        .fn();

      const navSpy: jest.SpyInstance = jest.spyOn(processPage.router, 'navigate');

      fixture.detectChanges();

      processPage.navToInventory(_mockBatch);

      expect(navSpy).toHaveBeenCalledWith(
        ['tabs/extras'],
        {
          state: {
            optionalData: _mockBatch,
            passTo: 'inventory'
          }
        }
      );
    });

  });


  describe('Modal', (): void => {

    test('should update batch on modal dismiss with update', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();

      processPage.selectedBatch = _mockBatch;

      processPage.processService.updateMeasuredValues = jest
        .fn()
        .mockReturnValue(of(null));

      const updateSpy: jest.SpyInstance = jest.spyOn(processPage.processService, 'updateMeasuredValues');

      fixture.detectChanges();

      const handler: (data: object) => void = processPage.onMeasurementFormModalDismiss(true);
      handler({ data: {} });

      setTimeout((): void => {
        expect(updateSpy).toHaveBeenCalledWith(
          _mockBatch.cid,
          {},
          false
        );
        done();
      }, 10);
    });

    test('should update batch on modal dismiss without update', (done: jest.DoneCallback): void => {
      const updateSpy: jest.SpyInstance = jest.spyOn(processPage.processService, 'updateMeasuredValues');

      fixture.detectChanges();

      const handler: (data: object) => void = processPage.onMeasurementFormModalDismiss(true);
      handler({});

      setTimeout((): void => {
        expect(updateSpy).not.toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should handle measurement form modal error', (): void => {
      const toastSpy: jest.SpyInstance = jest.spyOn(processPage.toastService, 'presentErrorToast');

      fixture.detectChanges();

      const handler: (error: string) => void = processPage.onMeasurementFormModalError();
      handler('test-error');

      expect(toastSpy).toHaveBeenCalledWith('Error updating batch');
    });

    test('should handle measurment form modal success', (): void => {
      const _mockBatch: Batch = mockBatch();

      const toastSpy: jest.SpyInstance = jest.spyOn(processPage.toastService, 'presentToast');
      const navSpy: jest.SpyInstance = jest.spyOn(processPage, 'navToInventory');

      fixture.detectChanges();

      const handler: (updated: Batch) => void = processPage.onMeasurementFormModalSuccess(true);
      handler(_mockBatch);

      expect(toastSpy).toHaveBeenCalledWith(
        'Measured Values Updated',
        1000,
        'bottom'
      );
      expect(navSpy).toHaveBeenCalledWith(_mockBatch);

      const emptyHandler: (updated: Batch) => void = processPage.onMeasurementFormModalSuccess(false);
      emptyHandler(null);

      expect(toastSpy).toHaveBeenCalledTimes(1);
      expect(navSpy).toHaveBeenCalledTimes(1);
    });

    test('should open measurement form modal', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      const _stubModal: ModalStub = new ModalStub();

      processPage.selectedBatch = _mockBatch;

      processPage.modalCtrl.create = jest
        .fn()
        .mockReturnValue(Promise.resolve(_stubModal));

      _stubModal.onDidDismiss = jest
        .fn()
        .mockReturnValue(Promise.resolve());

      processPage.onMeasurementFormModalDismiss = jest
        .fn()
        .mockReturnValue(() => of(null));

      processPage.onMeasurementFormModalError = jest
        .fn();

      processPage.onMeasurementFormModalSuccess = jest
        .fn();

      const createSpy: jest.SpyInstance = jest.spyOn(processPage.modalCtrl, 'create');
      const successSpy: jest.SpyInstance = jest.spyOn(processPage, 'onMeasurementFormModalSuccess');

      fixture.detectChanges();

      processPage.openMeasurementFormModal(true);

      _stubModal.onDidDismiss();

      setTimeout((): void => {
        expect(createSpy).toHaveBeenCalledWith({
          component: ProcessMeasurementsFormPage,
          componentProps: {
            areAllRequired: true,
            batch: _mockBatch
          }
        });
        expect(successSpy).toHaveBeenCalledWith(true);
        expect(processPage.hideButton).toBe(true);
        done();
      }, 10);
    });

  });


  describe('Render Template', (): void => {

    test('should render the template with a manual step', (): void => {
      const _mockBatch: Batch = mockBatch();
      _mockBatch.process.currentStep = 0;
      const manualProcess: Process = _mockBatch.process.schedule[0];

      processPage.selectedBatch = _mockBatch;
      processPage.stepData = manualProcess;
      processPage.stepType = 'manual';

      fixture.detectChanges();

      processPage.stepData = manualProcess;
      processPage.stepType = 'manual';

      const manualElem: HTMLElement = fixture.nativeElement.querySelector('process-manual');
      const timerElem: HTMLElement = fixture.nativeElement.querySelector('process-timer');
      const calendarElem: HTMLElement = fixture.nativeElement.querySelector('process-calendar');

      expect(manualElem).not.toBeNull();
      expect(manualElem.hasAttribute('ng-reflect-step-data')).toBe(true);
      expect(timerElem).toBeNull();
      expect(calendarElem).toBeNull();
    });

    test('should render the template with a timer step', (): void => {
      const _mockBatch: Batch = mockBatch();
      _mockBatch.process.currentStep = 2;
      const timerProcess: Process = _mockBatch.process.schedule[0];

      processPage.selectedBatch = _mockBatch;
      processPage.stepData = timerProcess;
      processPage.stepType = 'timer';

      fixture.detectChanges();

      processPage.stepData = timerProcess;
      processPage.stepType = 'timer';

      const manualElem: HTMLElement = fixture.nativeElement.querySelector('process-manual');
      const timerElem: HTMLElement = fixture.nativeElement.querySelector('process-timer');
      const calendarElem: HTMLElement = fixture.nativeElement.querySelector('process-calendar');

      expect(manualElem).toBeNull();
      expect(timerElem).not.toBeNull();
      expect(timerElem.hasAttribute('ng-reflect-batch-id')).toBe(true);
      expect(calendarElem).toBeNull();
    });

    test('should render the template with a calendar step', (): void => {
      const _mockBatch: Batch = mockBatch();
      _mockBatch.process.currentStep = 13;
      const calendarProcess: Process = _mockBatch.process.schedule[0];

      processPage.selectedBatch = _mockBatch;
      processPage.stepData = calendarProcess;
      processPage.stepType = 'calendar';

      fixture.detectChanges();

      processPage.stepData = calendarProcess;
      processPage.stepType = 'calendar';

      const manualElem: HTMLElement = fixture.nativeElement.querySelector('process-manual');
      const timerElem: HTMLElement = fixture.nativeElement.querySelector('process-timer');
      const calendarElem: HTMLElement = fixture.nativeElement.querySelector('process-calendar');

      expect(manualElem).toBeNull();
      expect(timerElem).toBeNull();
      expect(calendarElem).not.toBeNull();
      expect(calendarElem.hasAttribute('ng-reflect-alerts')).toBe(true);
    });

    test('should render the template controls', (): void => {
      const _mockBatch: Batch = mockBatch();

      processPage.selectedBatch = _mockBatch;

      fixture.detectChanges();

      const controlElem: HTMLElement = fixture.nativeElement.querySelector('process-controls');
      expect(controlElem).not.toBeNull();
      expect(controlElem.hasAttribute('ng-reflect-on-current-step')).toBe(true);
    });

  });

});
