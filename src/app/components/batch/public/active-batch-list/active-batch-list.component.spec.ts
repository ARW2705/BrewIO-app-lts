/* Module imorts */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockBatch, mockErrorReport } from '../../../../../../test-config/mock-models';
import { AnimationsServiceStub, ErrorReportingServiceStub, IdServiceStub, ProcessServiceStub, ToastServiceStub, UtilityServiceStub } from '../../../../../../test-config/service-stubs';

/* Interface imports */
import { Batch, ErrorReport } from '../../../../shared/interfaces';

/* Service imports */
import { AnimationsService, ErrorReportingService, IdService, ProcessService, ToastService, UtilityService } from '../../../../services/services';

/* Component imports */
import { ActiveBatchListComponent } from './active-batch-list.component';


describe('ActiveBatchListComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<ActiveBatchListComponent>;
  let component: ActiveBatchListComponent;
  let originalOnInit: any;
  let originalOnChanges: any;
  let originalAfterInit: any;
  let originalOnDestroy: any;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ ActiveBatchListComponent ],
      imports: [ RouterTestingModule ],
      providers: [
        { provide: AnimationsService, useClass: AnimationsServiceStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: IdService, useClass: IdServiceStub },
        { provide: ProcessService, useClass: ProcessServiceStub },
        { provide: ToastService, useClass: ToastServiceStub },
        { provide: UtilityService, useClass: UtilityServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ActiveBatchListComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    originalOnChanges = component.ngOnChanges;
    originalAfterInit = component.ngAfterViewInit;
    originalOnDestroy = component.ngOnDestroy;
    component.ngOnInit = jest.fn();
    component.ngOnChanges = jest.fn();
    component.ngAfterViewInit = jest.fn();
    component.ngOnDestroy = jest.fn();
    component.errorReporter.handleUnhandledError = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  describe('Lifecycle', (): void => {

    test('should init the component', (done: jest.DoneCallback): void => {
      component.ngOnInit = originalOnInit;

      const _mockBatch: Batch = mockBatch();
      const list$: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([
        new BehaviorSubject<Batch>(_mockBatch),
        new BehaviorSubject<Batch>(_mockBatch)
      ]);
      component.processService.getBatchList = jest.fn()
        .mockReturnValue(list$);
      component.utilService.getArrayFromSubjects = jest.fn()
        .mockReturnValue([_mockBatch, _mockBatch]);

      fixture.detectChanges();

      setTimeout((): void => {
        expect(component.activeBatchesList).toStrictEqual([_mockBatch, _mockBatch]);
        done();
      }, 10);
    });

    test('should get an error from processService on init', (done: jest.DoneCallback): void => {
      component.ngOnInit = originalOnInit;

      const _mockError: Error = new Error('test-error');
      component.processService.getBatchList = jest.fn()
        .mockReturnValue(throwError(_mockError));
      const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should handle on changes with show hint flag', (): void => {
      component.ngOnChanges = originalOnChanges;

      component.animationService.shouldShowHint = jest.fn()
        .mockReturnValue(true);
      component.runSlidingHints = jest.fn();
      const runSpy: jest.SpyInstance = jest.spyOn(component, 'runSlidingHints');

      fixture.detectChanges();

      component.ngOnChanges();
      expect(runSpy).toHaveBeenCalled();
    });

    test('should not run animation with no show flag', (): void => {
      component.ngOnChanges = originalOnChanges;

      component.animationService.shouldShowHint = jest.fn()
        .mockReturnValue(false);
      component.runSlidingHints = jest.fn();
      const runSpy: jest.SpyInstance = jest.spyOn(component, 'runSlidingHints');

      fixture.detectChanges();

      component.ngOnChanges();
      expect(runSpy).not.toHaveBeenCalled();
    });

    test('should not run animation on error', (): void => {
      component.ngOnChanges = originalOnChanges;

      component.animationService.shouldShowHint = jest.fn()
        .mockImplementation(() => { throw new Error(''); });
      component.runSlidingHints = jest.fn();
      const runSpy: jest.SpyInstance = jest.spyOn(component, 'runSlidingHints');

      fixture.detectChanges();

      component.ngOnChanges();
      expect(runSpy).not.toHaveBeenCalled();
    });

    test('should handle after view init', (): void => {
      component.ngAfterViewInit = originalAfterInit;

      component.animationService.shouldShowHint = jest.fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      component.runSlidingHints = jest.fn();
      const hintSpy: jest.SpyInstance = jest.spyOn(component.animationService, 'shouldShowHint');
      const runSpy: jest.SpyInstance = jest.spyOn(component, 'runSlidingHints');

      fixture.detectChanges();

      component.ngAfterViewInit();
      expect(runSpy).toHaveBeenCalled();
      expect(runSpy).toHaveBeenCalledTimes(1);
      expect(hintSpy).toHaveBeenCalledTimes(2);
    });

    test('should trigger destroy subject on component destroy', (): void => {
      component.ngOnDestroy = originalOnDestroy;

      const nextSpy: jest.SpyInstance = jest.spyOn(component.destroy$, 'next');
      const completeSpy: jest.SpyInstance = jest.spyOn(component.destroy$, 'complete');

      fixture.detectChanges();

      component.ngOnDestroy();
      expect(nextSpy).toHaveBeenCalledWith(true);
      expect(completeSpy).toHaveBeenCalled();
    });

  });


  describe('Navigation', (): void => {

    test('should nav to brew process', (): void => {
      component.router.navigate = jest.fn();
      const _mockBatch: Batch = mockBatch();
      component.idService.getId = jest.fn()
        .mockReturnValue(_mockBatch._id);
      const navSpy: jest.SpyInstance = jest.spyOn(component.router, 'navigate');

      fixture.detectChanges();

      component.navToBrewProcess(_mockBatch);
      expect(navSpy).toHaveBeenCalledWith(
        [ 'tabs/process' ],
        {
          state: {
            requestedUserId: _mockBatch.owner,
            selectedBatchId: _mockBatch._id,
            rootURL: 'tabs/home'
          }
        }
      );
    });

  });


  describe('Rendering', (): void => {

    test('should render a list of batches', (): void => {
      component.ngOnInit = originalOnInit;

      const _mockBatch1: Batch = mockBatch();
      const _mockBatch2: Batch = mockBatch();
      _mockBatch2.cid = _mockBatch1 + 'test';
      component.processService.getBatchList = jest.fn()
        .mockReturnValue(of(null));
      component.utilService.getArrayFromSubjects = jest.fn()
        .mockReturnValue([_mockBatch1, _mockBatch2]);

      fixture.detectChanges();

      const childCmp: NodeList = fixture.nativeElement.querySelectorAll('app-active-batch');
      expect(childCmp.length).toEqual(2);
      expect(childCmp.item(0)['batch']).toStrictEqual(_mockBatch1);
      expect(childCmp.item(1)['batch']).toStrictEqual(_mockBatch2);
    });

  });


  describe('Animations', (): void => {

    test('should get the ion-content element', (): void => {
      const _mockBatch: Batch = mockBatch();
      component.activeBatchesList = [_mockBatch];
      const container: HTMLElement = global.document.createElement('body');
      const ionContent: HTMLElement = global.document.createElement('ion-content');
      const child1: HTMLElement = global.document.createElement('div');
      const child2: HTMLElement = global.document.createElement('p');
      const ref: HTMLElement = global.document.createElement('div');
      Object.defineProperty(ref, 'nativeElement', { writable: false, value: child2 });
      Object.defineProperty(child2, 'parentElement', { writable: false, value: child1 });
      Object.defineProperty(child1, 'parentElement', { writable: false, value: ionContent });
      Object.defineProperty(ionContent, 'parentElement', { writable: false, value: container });
      Object.defineProperty(container, 'parentElement', { writable: false, value: null });

      fixture.detectChanges();

      component.batchSlidingItemsList = <any>ref;
      const elem: HTMLElement = component.getTopLevelContainer();
      expect(elem).toStrictEqual(ionContent);
    });

    test('should get null if batchSlidingItemsList is not defined', (): void => {
      component.batchSlidingItemsList = undefined;

      fixture.detectChanges();

      expect(component.getTopLevelContainer()).toBeNull();
    });

    test('should run sliding hints', (done: jest.DoneCallback): void => {
      const _mockElem: HTMLElement = global.document.createElement('div');
      component.getTopLevelContainer = jest.fn()
        .mockReturnValue(_mockElem);
      component.toggleSlidingItemClass = jest.fn();
      component.animationService.playCombinedSlidingHintAnimations = jest.fn()
        .mockReturnValue(of([]));
      component.animationService.getEstimatedItemOptionWidth = jest.fn()
        .mockReturnValue(150);
      component.animationService.setHintShownFlag = jest.fn();
      const toggleSpy: jest.SpyInstance = jest.spyOn(component, 'toggleSlidingItemClass');
      const setSpy: jest.SpyInstance = jest.spyOn(component.animationService, 'setHintShownFlag');

      fixture.detectChanges();

      component.batchSlidingItemsList = <any>_mockElem;
      component.runSlidingHints();
      setTimeout((): void => {
        expect(toggleSpy).toHaveBeenCalledTimes(2);
        expect(setSpy).toHaveBeenCalledWith('sliding', 'batch');
        done();
      }, 10);
    });

    test('should report a sliding hint error', (): void => {
      const _mockErrorReport: ErrorReport = mockErrorReport();
      component.errorReporter.setErrorReport = jest.fn();
      component.errorReporter.getCustomReportFromError = jest.fn()
        .mockReturnValue(_mockErrorReport);
      const setSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'setErrorReport');
      const getSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'getCustomReportFromError');

      fixture.detectChanges();

      component.reportSlidingHintError();
      expect(setSpy).toHaveBeenCalledWith(_mockErrorReport);
      expect(getSpy.mock.calls[0][0]['name']).toMatch('AnimationError');
    });

    test('should get an error running sliding hints with missing content element', (): void => {
      component.getTopLevelContainer = jest.fn()
        .mockReturnValue(null);
      component.reportSlidingHintError = jest.fn();
      const reportSpy: jest.SpyInstance = jest.spyOn(component, 'reportSlidingHintError');

      fixture.detectChanges();

      component.runSlidingHints();
      expect(reportSpy).toHaveBeenCalledWith();
    });

    test('should get an error running sliding hints with animation error', (done: jest.DoneCallback): void => {
      const _mockElem: HTMLElement = global.document.createElement('div');
      const _mockError: Error = new Error('test-error');
      component.getTopLevelContainer = jest.fn()
        .mockReturnValue(_mockElem);
      component.toggleSlidingItemClass = jest.fn();
      component.animationService.playCombinedSlidingHintAnimations = jest.fn()
        .mockReturnValue(throwError(_mockError));
      component.animationService.getEstimatedItemOptionWidth = jest.fn()
        .mockReturnValue(150);
      component.animationService.setHintShownFlag = jest.fn();
      component.errorReporter.getCustomReportFromError = jest.fn()
        .mockReturnValue(_mockError);
      component.reportSlidingHintError = jest.fn();
      const toggleSpy: jest.SpyInstance = jest.spyOn(component, 'toggleSlidingItemClass');
      const setSpy: jest.SpyInstance = jest.spyOn(component.animationService, 'setHintShownFlag');

      fixture.detectChanges();

      component.batchSlidingItemsList = <any>_mockElem;
      component.runSlidingHints();
      setTimeout((): void => {
        expect(toggleSpy).toHaveBeenCalledTimes(2);
        expect(setSpy).not.toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should toggle sliding item class', (): void => {
      const _mockElem: HTMLElement = global.document.createElement('div');
      component.animationService.toggleSlidingItemClass = jest.fn();
      const toggleSpy: jest.SpyInstance = jest.spyOn(component.animationService, 'toggleSlidingItemClass');

      fixture.detectChanges();

      component.batchSlidingItemsList = <any>_mockElem;
      component.toggleSlidingItemClass(true);
      expect(toggleSpy).toHaveBeenCalledWith(
        component.batchSlidingItemsList.nativeElement,
        true,
        component.renderer
      );
      component.toggleSlidingItemClass(false);
      expect(toggleSpy).toHaveBeenCalledWith(
        component.batchSlidingItemsList.nativeElement,
        false,
        component.renderer
      );
    });

  });

});
