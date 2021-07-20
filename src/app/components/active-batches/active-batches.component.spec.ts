/* Module imorts */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockBatch } from '../../../../test-config/mock-models';
import {
  AnimationsServiceStub,
  ErrorReportingServiceStub,
  ProcessServiceStub,
  ToastServiceStub
} from '../../../../test-config/service-stubs';

import * as subjectHelpers from '../../shared/utility-functions/subject-helpers';

/* Interface imports */
import { Batch } from '../../shared/interfaces';

/* Service imports */
import { AnimationsService } from '../../services/animations/animations.service';
import { ErrorReportingService } from '../../services/error-reporting/error-reporting.service';
import { ProcessService } from '../../services/process/process.service';
import { ToastService } from '../../services/toast/toast.service';

/* Component imports */
import { ActiveBatchesComponent } from './active-batches.component';


describe('ActiveBatchesComponent', (): void => {
  let fixture: ComponentFixture<ActiveBatchesComponent>;
  let batchCmp: ActiveBatchesComponent;
  let originalOnInit: any;
  let originalOnChanges: any;
  let originalAfterInit: any;
  let originalOnDestroy: any;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ ActiveBatchesComponent ],
      imports: [ RouterTestingModule ],
      providers: [
        { provide: AnimationsService, useClass: AnimationsServiceStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: ProcessService, useClass: ProcessServiceStub },
        { provide: ToastService, useClass: ToastServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ActiveBatchesComponent);
    batchCmp = fixture.componentInstance;
    originalOnInit = batchCmp.ngOnInit;
    originalOnChanges = batchCmp.ngOnChanges;
    originalAfterInit = batchCmp.ngAfterViewInit;
    originalOnDestroy = batchCmp.ngOnDestroy;
    batchCmp.ngOnInit = jest.fn();
    batchCmp.ngOnChanges = jest.fn();
    batchCmp.ngAfterViewInit = jest.fn();
    batchCmp.ngOnDestroy = jest.fn();
    batchCmp.errorReporter.handleUnhandledError = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(batchCmp).toBeDefined();
  });

  describe('Lifecycle', (): void => {

    test('should init the component', (done: jest.DoneCallback): void => {
      batchCmp.ngOnInit = originalOnInit;

      const _mockBatch: Batch = mockBatch();
      const list$: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([
        new BehaviorSubject<Batch>(_mockBatch),
        new BehaviorSubject<Batch>(_mockBatch)
      ]);

      batchCmp.processService.getBatchList = jest
        .fn()
        .mockReturnValue(list$);

      const getSpy: jest.SpyInstance = jest.spyOn(subjectHelpers, 'getArrayFromSubjects')
        .mockImplementation((): Batch[] => {
          return [_mockBatch, _mockBatch];
        });

      fixture.detectChanges();

      setTimeout((): void => {
        expect(getSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should get an error from processService on init', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      batchCmp.ngOnInit = originalOnInit;

      batchCmp.processService.getBatchList = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      const errorSpy: jest.SpyInstance = jest.spyOn(batchCmp.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should handle on changes with show hint flag', (): void => {
      batchCmp.ngOnChanges = originalOnChanges;

      batchCmp.animationService.shouldShowHint = jest
        .fn()
        .mockReturnValue(true);

      batchCmp.runSlidingHints = jest.fn();

      const runSpy: jest.SpyInstance = jest.spyOn(batchCmp, 'runSlidingHints');

      fixture.detectChanges();

      batchCmp.ngOnChanges();

      expect(runSpy).toHaveBeenCalled();
    });

    test('should not run animation with no show flag', (): void => {
      batchCmp.ngOnChanges = originalOnChanges;

      batchCmp.animationService.shouldShowHint = jest
        .fn()
        .mockReturnValue(false);

      batchCmp.runSlidingHints = jest.fn();

      const runSpy: jest.SpyInstance = jest.spyOn(batchCmp, 'runSlidingHints');

      fixture.detectChanges();

      batchCmp.ngOnChanges();

      expect(runSpy).not.toHaveBeenCalled();
    });

    test('should not run animation on error', (): void => {
      batchCmp.ngOnChanges = originalOnChanges;

      batchCmp.animationService.shouldShowHint = jest
        .fn()
        .mockImplementation(() => { throw new Error(''); });

      batchCmp.runSlidingHints = jest.fn();

      const runSpy: jest.SpyInstance = jest.spyOn(batchCmp, 'runSlidingHints');

      fixture.detectChanges();

      batchCmp.ngOnChanges();

      expect(runSpy).not.toHaveBeenCalled();
    });

    test('should handle after view init', (): void => {
      batchCmp.ngAfterViewInit = originalAfterInit;

      batchCmp.animationService.shouldShowHint = jest
        .fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      batchCmp.runSlidingHints = jest.fn();

      const hintSpy: jest.SpyInstance = jest.spyOn(batchCmp.animationService, 'shouldShowHint');
      const runSpy: jest.SpyInstance = jest.spyOn(batchCmp, 'runSlidingHints');

      fixture.detectChanges();

      batchCmp.ngAfterViewInit();

      expect(runSpy).toHaveBeenCalled();

      expect(runSpy).toHaveBeenCalledTimes(1);
      expect(hintSpy).toHaveBeenCalledTimes(2);
    });

    test('should trigger destroy subject on component destroy', (): void => {
      batchCmp.ngOnDestroy = originalOnDestroy;

      const nextSpy: jest.SpyInstance = jest.spyOn(batchCmp.destroy$, 'next');
      const completeSpy: jest.SpyInstance = jest.spyOn(batchCmp.destroy$, 'complete');

      fixture.detectChanges();

      batchCmp.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalledWith(true);
      expect(completeSpy).toHaveBeenCalled();
    });

  });


  describe('Navigation', (): void => {

    test('should nav to brew process', (): void => {
      batchCmp.router.navigate = jest.fn();

      const _mockBatch: Batch = mockBatch();

      const navSpy: jest.SpyInstance = jest.spyOn(batchCmp.router, 'navigate');

      fixture.detectChanges();

      batchCmp.navToBrewProcess(_mockBatch);

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
      batchCmp.ngOnInit = originalOnInit;

      const _mockBatch: Batch = mockBatch();
      const list$: BehaviorSubject<BehaviorSubject<Batch>[]> = new BehaviorSubject<BehaviorSubject<Batch>[]>([
        new BehaviorSubject<Batch>(_mockBatch),
        new BehaviorSubject<Batch>(_mockBatch)
      ]);

      batchCmp.processService.getBatchList = jest
        .fn()
        .mockReturnValue(list$);

      fixture.detectChanges();

      const summaries: NodeList = fixture.nativeElement.querySelectorAll('.summary-text-container');
      expect(summaries.length).toEqual(2);
      const [recipeDisplay, processDisplay, dateDisplay] = Array.from(summaries.item(0).childNodes);
      expect(recipeDisplay.textContent).toMatch('Active • Complete');
      expect(processDisplay.textContent).toMatch('Next Step: Mash Out / Heat To Boil');
      expect(dateDisplay.textContent).toMatch('Started on Wednesday, January 1');
    });

  });


  describe('Animations', (): void => {

    test('should get the ion-content element', (): void => {
      const _mockBatch: Batch = mockBatch();
      batchCmp.activeBatchesList = [_mockBatch];

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

      batchCmp.batchSlidingItemsList = <any>ref;

      const elem: HTMLElement = batchCmp.getTopLevelContainer();

      expect(elem).toStrictEqual(ionContent);
    });

    test('should get null if batchSlidingItemsList is not defined', (): void => {
      batchCmp.batchSlidingItemsList = undefined;

      fixture.detectChanges();

      expect(batchCmp.getTopLevelContainer()).toBeNull();
    });

    test('should run sliding hints', (done: jest.DoneCallback): void => {
      const _mockElem: HTMLElement = global.document.createElement('div');

      batchCmp.getTopLevelContainer = jest
        .fn()
        .mockReturnValue(_mockElem);

      batchCmp.toggleSlidingItemClass = jest.fn();

      batchCmp.animationService.playCombinedSlidingHintAnimations = jest
        .fn()
        .mockReturnValue(of([]));

      batchCmp.animationService.getEstimatedItemOptionWidth = jest
        .fn()
        .mockReturnValue(150);

      batchCmp.animationService.setHintShownFlag = jest.fn();

      const toggleSpy: jest.SpyInstance = jest.spyOn(batchCmp, 'toggleSlidingItemClass');
      const setSpy: jest.SpyInstance = jest.spyOn(batchCmp.animationService, 'setHintShownFlag');

      fixture.detectChanges();

      batchCmp.batchSlidingItemsList = <any>_mockElem;

      batchCmp.runSlidingHints();

      setTimeout((): void => {
        expect(toggleSpy).toHaveBeenCalledTimes(2);
        expect(setSpy).toHaveBeenCalledWith('sliding', 'batch');
        done();
      }, 10);
    });

    test('should get an error running sliding hints with missing content element', (): void => {
      batchCmp.getTopLevelContainer = jest
        .fn()
        .mockReturnValue(null);

      fixture.detectChanges();

      expect((): void => {
        batchCmp.runSlidingHints();
      }).toThrowError('Animation error: cannot find content container');
    });

    test('should get an error running sliding hints with animation error', (done: jest.DoneCallback): void => {
      const _mockElem: HTMLElement = global.document.createElement('div');
      const _mockError: Error = new Error('test-error');

      batchCmp.getTopLevelContainer = jest
        .fn()
        .mockReturnValue(_mockElem);

      batchCmp.toggleSlidingItemClass = jest.fn();

      batchCmp.animationService.playCombinedSlidingHintAnimations = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      batchCmp.animationService.getEstimatedItemOptionWidth = jest
        .fn()
        .mockReturnValue(150);

      batchCmp.animationService.setHintShownFlag = jest.fn();

      batchCmp.errorReporter.getCustomReportFromError = jest
        .fn()
        .mockReturnValue(_mockError);

      const toggleSpy: jest.SpyInstance = jest.spyOn(batchCmp, 'toggleSlidingItemClass');
      const setSpy: jest.SpyInstance = jest.spyOn(batchCmp.animationService, 'setHintShownFlag');
      const reportSpy: jest.SpyInstance = jest.spyOn(batchCmp.errorReporter, 'setErrorReport');

      fixture.detectChanges();

      batchCmp.batchSlidingItemsList = <any>_mockElem;

      batchCmp.runSlidingHints();

      setTimeout((): void => {
        expect(toggleSpy).toHaveBeenCalledTimes(2);
        expect(setSpy).not.toHaveBeenCalled();
        expect(reportSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should toggle sliding item class', (): void => {
      const _mockElem: HTMLElement = global.document.createElement('div');

      batchCmp.animationService.toggleSlidingItemClass = jest.fn();

      const toggleSpy: jest.SpyInstance = jest.spyOn(batchCmp.animationService, 'toggleSlidingItemClass');

      fixture.detectChanges();

      batchCmp.batchSlidingItemsList = <any>_mockElem;

      batchCmp.toggleSlidingItemClass(true);

      expect(toggleSpy).toHaveBeenCalledWith(
        batchCmp.batchSlidingItemsList.nativeElement,
        true,
        batchCmp.renderer
      );

      batchCmp.toggleSlidingItemClass(false);

      expect(toggleSpy).toHaveBeenCalledWith(
        batchCmp.batchSlidingItemsList.nativeElement,
        false,
        batchCmp.renderer
      );
    });

  });

});
