/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, of, Subject, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockBatch, mockAlert, mockCalendarProcess, mockCalendarMetadata, mockTimerProcess } from '@test/mock-models';
import { CalendarAlertServiceStub, CalendarServiceStub, ErrorReportingServiceStub, EventServiceStub, IdServiceStub, ModalServiceStub,  ProcessServiceStub, TimerServiceStub, ToastServiceStub, UserServiceStub } from '@test/service-stubs';
import { ActivatedRouteStub } from '@test/ionic-stubs';

/* Type imports */
import { CustomError } from '@shared/types';

/* Interface imports */
import { Alert, Batch, CalendarMetadata, CalendarProcess, Process, TimerProcess } from '@shared/interfaces';

/* Service imports */
import { CalendarAlertService, CalendarService, ErrorReportingService, EventService, IdService, ModalService, ProcessService, TimerService, ToastService, UserService } from '@services/public';

/* Component imports */
import { ProcessCalendarComponent, ProcessMeasurementsFormComponent } from '@components/process/public';

/* Page imports */
import { ProcessPage } from './process.page';


describe('ProcessPage', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<ProcessPage>;
  let page: ProcessPage;
  let originalOnInit: () => void;
  let originalOnDestroy: () => void;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ ProcessPage ],
      imports: [ RouterTestingModule ],
      providers: [
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        { provide: CalendarAlertService, useClass: CalendarAlertServiceStub },
        { provide: CalendarService, useClass: CalendarServiceStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: EventService, useClass: EventServiceStub },
        { provide: IdService, useClass: IdServiceStub },
        { provide: ModalService, useClass: ModalServiceStub },
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
    page = fixture.componentInstance;
    originalOnInit = page.ngOnInit;
    originalOnDestroy = page.ngOnDestroy;
    page.ngOnInit = jest.fn();
    page.ngOnDestroy = jest.fn();
    page.toastService.presentToast = jest.fn();
    page.toastService.presentErrorToast = jest.fn();
    page.toastService.shortDuration = 1000;
    page.toastService.mediumDuration = 1500;
    page.errorReporter.handleUnhandledError = jest.fn();
    page.errorReporter.handleGenericCatchError = jest.fn()
      .mockImplementation((): (error: any) => Observable<never> => {
        return (error: any): Observable<never> => throwError(error);
      });
    const _mockBatch: Batch = mockBatch();
    page.selectedBatch = _mockBatch;
    const currentProcess: Process = _mockBatch.process.schedule[_mockBatch.process.currentStep];
    page.stepType = currentProcess.type;
    page.stepData = currentProcess;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(page).toBeTruthy();
  });

  describe('Lifecycle', (): void => {

    test('should init the component', (done: jest.DoneCallback): void => {
      page.ngOnInit = originalOnInit;
      page.listenForRouteChanges = jest.fn();
      const listenSpy: jest.SpyInstance = jest.spyOn(page, 'listenForRouteChanges');

      fixture.detectChanges();

      setTimeout((): void => {
        expect(listenSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should handle destroying the component', (): void => {
      page.ngOnDestroy = originalOnDestroy;
      page.event.unregister = jest.fn();
      const nextSpy: jest.SpyInstance = jest.spyOn(page.destroy$, 'next');
      const completeSpy: jest.SpyInstance = jest.spyOn(page.destroy$, 'complete');
      const unregisterSpy: jest.SpyInstance = jest.spyOn(page.event, 'unregister');

      fixture.detectChanges();

      page.ngOnDestroy();
      expect(nextSpy).toHaveBeenCalledWith(true);
      expect(completeSpy).toHaveBeenCalled();
      expect(unregisterSpy).toHaveBeenCalledWith('change-date');
    });

  });


  describe('Batch Progress', (): void => {

    test('should advance batch progress', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      page.selectedBatch = _mockBatch;
      page.processService.updateBatch = jest.fn()
        .mockReturnValue(of(null));
      page.updateView = jest.fn();
      const updateSpy: jest.SpyInstance = jest.spyOn(page, 'updateView');

      fixture.detectChanges();

      const nextIndex: number = 5;
      page.advanceBatch(nextIndex);
      setTimeout((): void => {
        expect(page.selectedBatch.process.currentStep).toEqual(nextIndex);
        expect(page.viewStepIndex).toEqual(nextIndex);
        expect(updateSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should catch error advancing batch progress', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      page.processService.updateBatch = jest.fn()
        .mockReturnValue(throwError(_mockError));
      const errorSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      page.advanceBatch(0);
      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should complete a step', (): void => {
      page.getStep = jest.fn()
        .mockReturnValueOnce(-1)
        .mockReturnValueOnce(0);
      page.endBatch = jest.fn();
      const endSpy: jest.SpyInstance = jest.spyOn(page, 'endBatch');
      page.advanceBatch = jest.fn();
      const advanceSpy: jest.SpyInstance = jest.spyOn(page, 'advanceBatch');

      fixture.detectChanges();

      page.completeStep();
      expect(endSpy).toHaveBeenCalled();
      expect(advanceSpy).not.toHaveBeenCalled();
      page.completeStep();
      expect(advanceSpy).toHaveBeenCalledWith(0);
    });

    test('should continue batch', (): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);
      page.processService.getBatchById = jest.fn()
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(_mockBatch$);
      page.listenForBatchChanges = jest.fn();
      const listenSpy: jest.SpyInstance = jest.spyOn(page, 'listenForBatchChanges');
      page.errorReporter.setErrorReportFromCustomError = jest.fn();
      const _mockError: Error = new Error('test-error');
      page.getMissingError = jest.fn()
        .mockReturnValue(_mockError);
      const errorSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'setErrorReportFromCustomError');

      fixture.detectChanges();

      page.continueBatch('test-id');
      expect(errorSpy).toHaveBeenCalledWith(_mockError);
      page.continueBatch('test-id');
      expect(listenSpy).toHaveBeenCalledWith(true);
    });

    test('should end a batch', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch()
      page.selectedBatch = _mockBatch;
      page.timerService.removeBatchTimer = jest.fn();
      const timerSpy: jest.SpyInstance = jest.spyOn(page.timerService, 'removeBatchTimer');
      page.openMeasurementFormModal = jest.fn();
      const modalSpy: jest.SpyInstance = jest.spyOn(page, 'openMeasurementFormModal');
      page.idService.getId = jest.fn()
        .mockReturnValue('test-id');
      const idSpy: jest.SpyInstance = jest.spyOn(page.idService, 'getId');
      page.processService.endBatchById = jest.fn()
        .mockReturnValue(of(null));
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      fixture.detectChanges();

      page.endBatch();
      setTimeout((): void => {
        expect(timerSpy).toHaveBeenCalledWith(_mockBatch.cid);
        expect(modalSpy).toHaveBeenCalledWith(true);
        expect(idSpy).toHaveBeenCalledWith(_mockBatch);
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('batch completed');
        done();
      }, 10);
    });

    test('should catch error on end batch', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      page.timerService.removeBatchTimer = jest.fn();
      page.openMeasurementFormModal = jest.fn();
      page.processService.endBatchById = jest.fn()
        .mockReturnValue(throwError(_mockError));
      page.errorReporter.handleUnhandledError = jest.fn();
      const errorSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      page.endBatch();
      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should handle batch change', (): void => {
      const _mockBatch: Batch = mockBatch();
      page.selectedBatch = _mockBatch;
      const _mockBatchChange: Batch = mockBatch();
      _mockBatchChange.cid += '1';
      page.timerService.addBatchTimer = jest.fn();
      const timerSpy: jest.SpyInstance = jest.spyOn(page.timerService, 'addBatchTimer');
      page.goToActiveStep = jest.fn();
      const gotoSpy: jest.SpyInstance = jest.spyOn(page, 'goToActiveStep');
      page.updateView = jest.fn();
      const updateSpy: jest.SpyInstance = jest.spyOn(page, 'updateView');

      fixture.detectChanges();

      page.handleBatchChange(_mockBatchChange, true);
      expect(timerSpy).toHaveBeenCalledWith(_mockBatchChange);
      expect(page.selectedBatch).toStrictEqual(_mockBatchChange);
      expect(gotoSpy).toHaveBeenCalled();
      page.selectedBatch = _mockBatch;
      page.handleBatchChange(_mockBatchChange, false);
      expect(page.selectedBatch).toStrictEqual(_mockBatchChange);
      expect(updateSpy).toHaveBeenCalled();
    });

    test('should start a new batch', (done: jest.DoneCallback): void => {
      page.viewStepIndex = 10;
      page.atViewEnd = true;
      const _mockBatch: Batch = mockBatch();
      page.processService.startNewBatch = jest.fn()
        .mockReturnValue(of(_mockBatch));
      const startSpy: jest.SpyInstance = jest.spyOn(page.processService, 'startNewBatch');
      page.idService.getId = jest.fn()
        .mockReturnValue('test-id');
      const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);
      page.processService.getBatchById = jest.fn()
        .mockReturnValue(_mockBatch$);
      page.listenForBatchChanges = jest.fn();
      const listenSpy: jest.SpyInstance = jest.spyOn(page, 'listenForBatchChanges');
      const _mockConfig: { [key: string]: any } = {
        requestedUserId: 'user-id',
        recipeMasterId: 'master-id',
        recipeVariantId: 'variant-id'
      };

      fixture.detectChanges();

      page.startNewBatch(_mockConfig);
      setTimeout((): void => {
        expect(page.viewStepIndex).toEqual(0);
        expect(page.atViewEnd).toBe(false);
        expect(page.selectedBatch$).toStrictEqual(_mockBatch$);
        expect(startSpy).toHaveBeenCalledWith(_mockConfig.requestedUserId, _mockConfig.recipeMasterId, _mockConfig.recipeVariantId);
        expect(listenSpy).toHaveBeenCalledWith(false);
        done();
      }, 10);
    });

    test('should handle error on batch start', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      page.processService.startNewBatch = jest.fn()
        .mockReturnValue(throwError(_mockError));
      page.errorReporter.handleGenericCatchError = jest.fn()
        .mockImplementation((): (error: Error) => Observable<never> => {
          return (error: Error): Observable<never> => throwError(error);
        });
      const errorSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      page.startNewBatch({});
      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should throw error on batch start if generated batch cannot be found', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      page.getMissingError = jest.fn()
        .mockReturnValue(_mockError);
      page.processService.startNewBatch = jest.fn()
        .mockReturnValue(of(null));
      page.processService.getBatchById = jest.fn()
        .mockReturnValue(undefined);
      page.errorReporter.handleGenericCatchError = jest.fn()
        .mockImplementation((): (error: Error) => Observable<never> => {
          return (error: Error): Observable<never> => throwError(error);
        });
      const errorSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      page.startNewBatch({});
      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

  });


  describe('Calendar Methods', (): void => {

    test('should handle change date event', (): void => {
      const _mockBatch: Batch = mockBatch();
      page.selectedBatch = _mockBatch;
      page.stopCalendarInProgress = jest.fn();
      const stopSpy: jest.SpyInstance = jest.spyOn(page, 'stopCalendarInProgress');
      page.calendarAlertService.clearAlertsForCurrentStep = jest.fn();
      const alertSpy: jest.SpyInstance = jest.spyOn(page.calendarAlertService, 'clearAlertsForCurrentStep');
      const toastSpy: jest.SpyInstance = jest.spyOn(page.toastService, 'presentToast');

      fixture.detectChanges();

      page.changeDateEventHandler();
      expect(stopSpy).toHaveBeenCalledWith(_mockBatch.process.currentStep);
      expect(alertSpy).toHaveBeenCalledWith(_mockBatch.process);
      expect(toastSpy).toHaveBeenCalledWith(
        'Select New Dates',
        page.toastService.mediumDuration,
        'middle'
      );
    });

    test('should check if a calendar has been started', (): void => {
      const _mockBatch: Batch = mockBatch();
      page.selectedBatch = _mockBatch;
      page.calendarService.hasCalendarStarted = jest.fn()
        .mockReturnValue(false);
      const calendarSpy: jest.SpyInstance = jest.spyOn(page.calendarService, 'hasCalendarStarted');

      fixture.detectChanges();

      page.hasCalendarStarted()
      expect(calendarSpy).toHaveBeenCalledWith(_mockBatch);
    });

    test('should start a calendar step', (): void => {
      const _mockBatch: Batch = mockBatch();
      page.selectedBatch = _mockBatch;
      page.calendarService.startCalendar = jest.fn();
      const startSpy: jest.SpyInstance = jest.spyOn(page.calendarService, 'startCalendar');

      fixture.detectChanges();

      const _mockCalendarMetadata: CalendarMetadata = mockCalendarMetadata();
      const calRef: ProcessCalendarComponent = ({ getSelectedCalendarData: (): CalendarMetadata => _mockCalendarMetadata } as unknown) as ProcessCalendarComponent;
      page.calendarRef = calRef;
      page.startCalendar();
      expect(startSpy).toHaveBeenCalledWith(_mockBatch, _mockCalendarMetadata);
    });

    test('should stop a calendar in progress', (): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockCalendarProcess: CalendarProcess = mockCalendarProcess();
      _mockCalendarProcess.startDatetime = 'test';
      _mockBatch.process.schedule.push(_mockCalendarProcess);
      page.selectedBatch = _mockBatch;
      page.isCalendarInProgress = true;

      fixture.detectChanges();

      page.stopCalendarInProgress(_mockBatch.process.schedule.length - 1);
      expect(_mockCalendarProcess.hasOwnProperty('startDatetime')).toBe(false);
      expect(page.isCalendarInProgress).toBe(false);
    });

  });


  describe('Listeners', (): void => {

    test('should listen for batch changes', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);
      page.selectedBatch$ = _mockBatch$;
      page.handleBatchChange = jest.fn();
      const handleSpy: jest.SpyInstance = jest.spyOn(page, 'handleBatchChange');

      fixture.detectChanges();

      page.listenForBatchChanges(true);
      setTimeout((): void => {
        expect(handleSpy).toHaveBeenCalledWith(_mockBatch, true);
        done();
      }, 10);
    });

    test('should handle error on batch change', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockBatch$: BehaviorSubject<Batch> = new BehaviorSubject<Batch>(_mockBatch);
      page.selectedBatch$ = _mockBatch$;
      page.handleBatchChange = jest.fn();
      const _mockError: Error = new Error('test-error');
      const errorSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      page.listenForBatchChanges(true);
      _mockBatch$.error(_mockError);
      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should listen for route changes on start', (done: jest.DoneCallback): void => {
      const configDataWithId: { [key: string]: any } = {};
      const _mockParams: any = new Subject<any>();
      page.route.queryParams = _mockParams;
      page.handleRouteChange = jest.fn()
        .mockReturnValue(of(configDataWithId));
      const handleSpy: jest.SpyInstance = jest.spyOn(page, 'handleRouteChange');
      page.startNewBatch = jest.fn();
      const startSpy: jest.SpyInstance = jest.spyOn(page, 'startNewBatch');

      fixture.detectChanges();

      page.listenForRouteChanges();
      _mockParams.next(configDataWithId);
      setTimeout((): void => {
        expect(handleSpy).toHaveBeenCalled();
        expect(startSpy).toHaveBeenCalledWith({});
        done();
      }, 10);
    });

    test('should listen for route changes on continuation', (done: jest.DoneCallback): void => {
      const configDataWithId: { [key: string]: any } = { selectedBatchId: 'test-id' };
      const _mockParams: any = new Subject<any>();
      page.route.queryParams = _mockParams;
      page.handleRouteChange = jest.fn()
        .mockReturnValue(of(configDataWithId));
      const handleSpy: jest.SpyInstance = jest.spyOn(page, 'handleRouteChange');
      page.continueBatch = jest.fn();
      const continueSpy: jest.SpyInstance = jest.spyOn(page, 'continueBatch');

      fixture.detectChanges();

      page.listenForRouteChanges();
      _mockParams.next(configDataWithId);
      setTimeout((): void => {
        expect(handleSpy).toHaveBeenCalled();
        expect(continueSpy).toHaveBeenCalledWith('test-id');
        done();
      }, 10);
    });

    test('should handle error on route change error', (done: jest.DoneCallback): void => {
      const _mockParams: any = new Subject<any>();
      page.route.queryParams = _mockParams;
      const handleSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'handleGenericCatchError');
      const errorSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      page.listenForRouteChanges();
      const _mockError: Error = new Error('test-error');
      _mockParams.error(_mockError);
      setTimeout((): void => {
        expect(handleSpy).toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

  });


  describe('Modals', (): void => {

    test('should get measurement form modal dismiss handler', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      page.processService.updateMeasuredValues = jest.fn()
        .mockReturnValue(of(_mockBatch));
      const updateSpy: jest.SpyInstance = jest.spyOn(page.processService, 'updateMeasuredValues');

      fixture.detectChanges();

      const handler: any = page.onMeasurementFormModalDismiss(false);
      forkJoin([
        handler({ data: true }),
        handler({})
      ])
      .subscribe(
        ([batch, expectNull]: Batch[]): void => {
          expect(batch).toStrictEqual(_mockBatch);
          expect(expectNull).toBeNull();
          expect(updateSpy).toHaveBeenCalled();
          done();
        },
        (error: any): void => {
          console.log('should not get an error', error);
          expect(true).toBe(false);
        }
      );
    });

    test('should open measurement form modal', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      page.selectedBatch = _mockBatch;
      page.modalService.openModal = jest.fn()
        .mockReturnValue(of(_mockBatch));
      const modalSpy: jest.SpyInstance = jest.spyOn(page.modalService, 'openModal');
      page.onMeasurementFormModalDismiss = jest.fn()
        .mockReturnValue(null);
      const dismissSpy: jest.SpyInstance = jest.spyOn(page, 'onMeasurementFormModalDismiss');
      const toastSpy: jest.SpyInstance = jest.spyOn(page.toastService, 'presentToast');
      page.navToInventory = jest.fn();
      const navSpy: jest.SpyInstance = jest.spyOn(page, 'navToInventory');

      fixture.detectChanges();

      page.openMeasurementFormModal(true);
      setTimeout((): void => {
        expect(modalSpy).toHaveBeenCalledWith(
          ProcessMeasurementsFormComponent,
          { areAllRequired: true, batch: _mockBatch },
          null
        );
        expect(dismissSpy).toHaveBeenCalled();
        expect(navSpy).toHaveBeenCalledWith(_mockBatch);
        expect(toastSpy).toHaveBeenCalledWith(
          'Measured Values Updated',
          page.toastService.shortDuration,
          'bottom'
        );
        done();
      }, 10);
    });

    test('should handle measurement form error', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      page.modalService.openModal = jest.fn()
        .mockReturnValue(throwError(_mockError));
      const errorSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      page.openMeasurementFormModal(true);
      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

  });


  describe('Navigation', (): void => {

    test('should handle route change', (done: jest.DoneCallback): void => {
      const _mockConfigData: { [key: string]: any } = {
        extras: {
          state: {
            rootURL: 'new-url'
          }
        }
      };
      page.rootURL = 'test-url';
      page.router.getCurrentNavigation = jest.fn()
        .mockReturnValue(_mockConfigData);

      fixture.detectChanges();

      page.handleRouteChange()
        .subscribe(
          (configData: { [key: string]: any }): void => {
            expect(configData).toStrictEqual(_mockConfigData.extras.state);
            expect(page.rootURL).toMatch('new-url');
            done();
          },
          (error: any): void => {
            console.log('should not get error', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should handle route change error', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      page.router.getCurrentNavigation = jest.fn()
        .mockImplementation((): void => { throw _mockError; });

      fixture.detectChanges();

      page.handleRouteChange()
        .subscribe(
          (results: any): void => {
            console.log('should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error).toStrictEqual(_mockError);
            done();
          }
        );
    });

    test('should navigate to inventory', (): void => {
      const _mockBatch: Batch = mockBatch();
      page.router.navigate = jest.fn();
      const navSpy: jest.SpyInstance = jest.spyOn(page.router, 'navigate');

      fixture.detectChanges();

      page.navToInventory(_mockBatch);
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


  describe('View Navigation', (): void => {

    test('should change step', (): void => {
      page.getStep = jest.fn()
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(-1);
      page.updateView = jest.fn();
      const updateSpy: jest.SpyInstance = jest.spyOn(page, 'updateView');
      page.viewStepIndex = 0;

      fixture.detectChanges();

      page.changeStep(true);
      expect(page.viewStepIndex).toEqual(1);
      expect(updateSpy).toHaveBeenCalled();
      page.changeStep(true);
      expect(page.viewStepIndex).toEqual(1);
      expect(updateSpy).toHaveBeenCalledTimes(2);
    });

    test('should get index after skipping concurrent timers', (): void => {
      const _mockBatch: Batch = mockBatch();
      page.selectedBatch = _mockBatch;
      page.timerService.getIndexSkippingConcurrent = jest.fn()
        .mockReturnValue(10);
      const timerSpy: jest.SpyInstance = jest.spyOn(page.timerService, 'getIndexSkippingConcurrent');

      fixture.detectChanges();

      page.getIndexSkippingConcurrent(true, 0);
      expect(timerSpy).toHaveBeenCalledWith(true, 0, _mockBatch.process.schedule);
    });

    test('should get the next step index', (): void => {
      const _mockBatch: Batch = mockBatch();
      const timerIndex: number = 2;
      _mockBatch.process.schedule[timerIndex]['concurrent'] = true;
      page.selectedBatch = _mockBatch;
      page.getIndexSkippingConcurrent = jest.fn()
        .mockReturnValue(10);
      const getSpy: jest.SpyInstance = jest.spyOn(page, 'getIndexSkippingConcurrent');

      fixture.detectChanges();

      expect(page.getNextStep(timerIndex)).toEqual(10);
      expect(getSpy).toHaveBeenCalledWith(true, timerIndex);
      expect(page.getNextStep(0)).toEqual(1);
      expect(page.getNextStep(_mockBatch.process.schedule.length)).toEqual(-1);
    });

    test('should get the previous step index', (): void => {
      const _mockBatch: Batch = mockBatch();
      const timerIndex: number = 2;
      _mockBatch.process.schedule[timerIndex]['concurrent'] = true;
      page.selectedBatch = _mockBatch;
      page.getIndexSkippingConcurrent = jest.fn()
        .mockReturnValue(0);
      const getSpy: jest.SpyInstance = jest.spyOn(page, 'getIndexSkippingConcurrent');

      fixture.detectChanges();

      expect(page.getPreviousStep(timerIndex + 1)).toEqual(0);
      expect(getSpy).toHaveBeenCalledWith(false, timerIndex + 1);
      expect(page.getPreviousStep(10)).toEqual(9);
      expect(page.getPreviousStep(-1)).toEqual(-1);
    });

    test('should get step index', (): void => {
      const _mockBatch: Batch = mockBatch();
      page.selectedBatch = _mockBatch;
      page.getNextStep = jest.fn()
        .mockImplementation((index: number): number => index + 1);
      const nextSpy: jest.SpyInstance = jest.spyOn(page, 'getNextStep');
      page.getPreviousStep = jest.fn()
        .mockImplementation((index: number): number => index - 1);
      const previousSpy: jest.SpyInstance = jest.spyOn(page, 'getPreviousStep');
      page.viewStepIndex = 1;

      fixture.detectChanges();

      expect(page.getStep(true, true)).toEqual(_mockBatch.process.currentStep + 1);
      expect(nextSpy).toHaveBeenCalledWith(_mockBatch.process.currentStep);
      expect(page.getStep(false, false)).toEqual(0);
      expect(previousSpy).toHaveBeenCalledWith(1);
    });

    test('should go to active step', (): void => {
      const _mockBatch: Batch = mockBatch();
      page.selectedBatch = _mockBatch;
      page.viewStepIndex = _mockBatch.process.currentStep + 1;
      page.updateView = jest.fn();
      const updateSpy: jest.SpyInstance = jest.spyOn(page, 'updateView');

      fixture.detectChanges();

      page.goToActiveStep();
      expect(page.viewStepIndex).toEqual(_mockBatch.process.currentStep);
      expect(updateSpy).toHaveBeenCalled();
    });

  });


  describe('View Update', (): void => {

    test('should update view', (): void => {
      page.updateViewAlerts = jest.fn();
      const alertSpy: jest.SpyInstance = jest.spyOn(page, 'updateViewAlerts');
      page.updateViewStep = jest.fn();
      const stepSpy: jest.SpyInstance = jest.spyOn(page, 'updateViewStep');
      page.updateAtViewEnd = jest.fn();
      const endSpy: jest.SpyInstance = jest.spyOn(page, 'updateAtViewEnd');

      fixture.detectChanges();

      page.updateView();
      expect(alertSpy).toHaveBeenCalled();
      expect(stepSpy).toHaveBeenCalled();
      expect(endSpy).toHaveBeenCalled();
    });

    test('should update view alerts', (): void => {
      const _mockAlert: Alert = mockAlert();
      const _mockAlerts: Alert[] = [ _mockAlert, _mockAlert ];
      page.calendarAlertService.getAlerts = jest.fn()
        .mockReturnValue(_mockAlerts);
      page.alerts = [];

      fixture.detectChanges();

      page.updateViewAlerts();
      expect(page.alerts).toStrictEqual(_mockAlerts);
    });

    test('should update view end flag', (): void => {
      const _mockBatch: Batch = mockBatch();
      const endIndex: number = _mockBatch.process.schedule.length - 1;
      page.selectedBatch = _mockBatch;
      page.getIndexSkippingConcurrent = jest.fn()
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(-1);
      page.viewStepIndex = endIndex;
      page.atViewEnd = false;

      fixture.detectChanges();

      page.updateAtViewEnd();
      expect(page.atViewEnd).toBe(true);
      page.viewStepIndex = 0;
      page.updateAtViewEnd();
      expect(page.atViewEnd).toBe(false);
      page.updateAtViewEnd();
      expect(page.atViewEnd).toBe(true);
    });

    test('should update view step', (): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockTimerProcess: TimerProcess = mockTimerProcess();
      page.selectedBatch = _mockBatch;
      page.getTimerStepData = jest.fn()
        .mockReturnValue(_mockTimerProcess);
      page.hasCalendarStarted = jest.fn()
        .mockReturnValue(true);
      const timerIndex: number = 2;
      const calendarIndex: number = 13;
      page.viewStepIndex = timerIndex;
      page.isCalendarInProgress = false;

      fixture.detectChanges();

      page.stepData = null;
      page.stepType = '';
      page.updateViewStep();
      expect(page.stepData).toStrictEqual(_mockTimerProcess);
      expect(page.stepType).toMatch('timer');
      page.viewStepIndex = calendarIndex;
      page.updateViewStep();
      expect(page.stepData).toStrictEqual(_mockBatch.process.schedule[calendarIndex]);
      expect(page.stepType).toMatch('calendar');
      expect(page.isCalendarInProgress).toBe(true);
    });

  });


  describe('Other Methods', (): void => {

    test('should get batch missing error', (): void => {
      fixture.detectChanges();

      const missingErrorStart: CustomError = page.getMissingError('start');
      expect(missingErrorStart.name).toMatch('BatchError');
      expect(missingErrorStart.message).toMatch('An error occurred trying to start a batch: new batch not found');
      const missingErrorContinue: CustomError = page.getMissingError('continue');
      expect(missingErrorContinue.name).toMatch('BatchError');
      expect(missingErrorContinue.message).toMatch('An error occurred trying to continue a batch: batch not found');
    });

    test('should get timer step data', (): void => {
      const _mockTimerProcess: TimerProcess = mockTimerProcess();
      page.timerService.getTimerStepData = jest.fn()
        .mockReturnValue([_mockTimerProcess]);
      const getSpy: jest.SpyInstance = jest.spyOn(page.timerService, 'getTimerStepData');
      const _mockBatch: Batch = mockBatch();
      page.selectedBatch = _mockBatch;
      page.viewStepIndex = 0;

      fixture.detectChanges();

      expect(page.getTimerStepData()).toStrictEqual([_mockTimerProcess]);
      expect(getSpy).toHaveBeenCalledWith(_mockBatch.process.schedule, 0);
    });

  });


  describe('Render Template', (): void => {

    test('should render template with loading spinner', (): void => {
      page.selectedBatch = null;

      fixture.detectChanges();

      const spinner: HTMLElement = fixture.nativeElement.querySelector('ion-spinner');
      expect(spinner).toBeTruthy();
    });

    test('should render the template with a manual process', (): void => {
      const _mockBatch: Batch = mockBatch();
      const manualStepIndex: number = 0;
      _mockBatch.process.currentStep = manualStepIndex;
      page.selectedBatch = _mockBatch;
      page.stepType = 'manual';
      page.stepData = _mockBatch.process.schedule[manualStepIndex];

      fixture.detectChanges();

      const process: HTMLElement = fixture.nativeElement.querySelector('app-process-manual');
      expect(process['manualProcess']).toStrictEqual(_mockBatch.process.schedule[manualStepIndex]);
    });

    test('should render the template with a timer process', (): void => {
      const _mockBatch: Batch = mockBatch();
      const timerStepIndex: number = 2;
      _mockBatch.process.currentStep = timerStepIndex;
      page.selectedBatch = _mockBatch;
      page.stepType = 'timer';
      page.stepData = _mockBatch.process.schedule[timerStepIndex];
      page.viewStepIndex = timerStepIndex;

      fixture.detectChanges();

      const process: HTMLElement = fixture.nativeElement.querySelector('app-process-timer');
      expect(process['timerProcess']).toStrictEqual(_mockBatch.process.schedule[timerStepIndex]);
      expect(process['batchId']).toMatch(_mockBatch.cid);
      expect(process['isPreview']).toBe(false);
    });

    test('should render the template with a calendar process', (): void => {
      const _mockBatch: Batch = mockBatch();
      const calendarStepIndex: number = 13;
      _mockBatch.process.currentStep = calendarStepIndex;
      page.selectedBatch = _mockBatch;
      page.stepType = 'calendar';
      page.stepData = _mockBatch.process.schedule[calendarStepIndex];
      page.viewStepIndex = calendarStepIndex - 1;
      const _mockAlert: Alert = mockAlert();
      const _mockAlerts: Alert[] = [ _mockAlert, _mockAlert ];
      page.alerts = _mockAlerts;

      fixture.detectChanges();

      const process: HTMLElement = fixture.nativeElement.querySelector('app-process-calendar');
      expect(process['calendarProcess']).toStrictEqual(_mockBatch.process.schedule[calendarStepIndex]);
      expect(process['alerts']).toStrictEqual(_mockAlerts);
      expect(process['isPreview']).toBe(true);
    });

    test('should render the template with process controls', (): void => {
      const _mockBatch: Batch = mockBatch();
      const manualStepIndex: number = 1;
      _mockBatch.process.currentStep = manualStepIndex;
      page.selectedBatch = _mockBatch;
      page.stepType = '';
      page.stepData = _mockBatch.process.schedule[manualStepIndex];
      page.viewStepIndex = manualStepIndex;
      page.isCalendarInProgress = false;
      page.atViewEnd = false;

      fixture.detectChanges();

      const controls: HTMLElement = fixture.nativeElement.querySelector('app-process-controls');
      expect(controls['atViewStart']).toBe(false);
      expect(controls['atViewEnd']).toBe(false);
      expect(controls['isCurrentStep']).toBe(true);
      expect(controls['isCalendarStep']).toBe(false);
      expect(controls['isCalendarInProgress']).toBe(false);
    });

  })

});
