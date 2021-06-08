/* Module imorts */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockBatch } from '../../../../test-config/mock-models';
import { AnimationsServiceStub, ProcessServiceStub, ToastServiceStub } from '../../../../test-config/service-stubs';

import * as subjectHelpers from '../../shared/utility-functions/subject-helpers';

/* Interface imports */
import { Batch } from '../../shared/interfaces/batch';

/* Service imports */
import { AnimationsService } from '../../services/animations/animations.service';
import { ProcessService } from '../../services/process/process.service';
import { ToastService } from '../../services/toast/toast.service';

/* Component imports */
import { ActiveBatchesComponent } from './active-batches.component';


describe('ActiveBatchesComponent', (): void => {
  let fixture: ComponentFixture<ActiveBatchesComponent>;
  let batchCmp: ActiveBatchesComponent;
  let originalOnInit: any;
  let originalAfterInit: any;
  let originalOnDestroy: any;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ ActiveBatchesComponent ],
      imports: [ RouterTestingModule ],
      providers: [
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
    originalAfterInit = batchCmp.ngAfterViewInit;
    originalOnDestroy = batchCmp.ngOnDestroy;
    batchCmp.ngOnInit = jest
      .fn();
    batchCmp.ngAfterViewInit = jest
      .fn();
    batchCmp.ngOnDestroy = jest
      .fn();
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
      batchCmp.ngOnInit = originalOnInit;

      batchCmp.processService.getBatchList = jest
        .fn()
        .mockReturnValue(throwError('test-error'));

      const toastSpy: jest.SpyInstance = jest.spyOn(batchCmp.toastService, 'presentErrorToast');

      fixture.detectChanges();

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith('Error loading batch list');
        done();
      }, 10);
    });

    test('should handle after view init', (): void => {
      batchCmp.ngAfterViewInit = originalAfterInit;

      batchCmp.animationService.hasHintBeenShown = jest
        .fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      batchCmp.runSlidingHints = jest
        .fn();

      const hintSpy: jest.SpyInstance = jest.spyOn(batchCmp.animationService, 'hasHintBeenShown');
      const runSpy: jest.SpyInstance = jest.spyOn(batchCmp, 'runSlidingHints');

      fixture.detectChanges();

      expect(runSpy).toHaveBeenCalled();

      batchCmp.ngAfterViewInit();

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
      batchCmp.router.navigate = jest
        .fn();

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

    test('should run sliding hints', (done: jest.DoneCallback): void => {
      const _mockElem: HTMLElement = global.document.createElement('div');

      batchCmp.getTopLevelContainer = jest
        .fn()
        .mockReturnValue(_mockElem);

      batchCmp.toggleSlidingItemClass = jest
        .fn();

      batchCmp.animationService.playCombinedSlidingHintAnimations = jest
        .fn()
        .mockReturnValue(of([]));

      batchCmp.animationService.setHintShownFlag = jest
        .fn();

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

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      fixture.detectChanges();

      batchCmp.runSlidingHints();

      expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0])
        .toMatch('Animation error: cannot find content container');
    });

    test('should get an error running sliding hints with animation error', (done: jest.DoneCallback): void => {
      const _mockElem: HTMLElement = global.document.createElement('div');

      batchCmp.getTopLevelContainer = jest
        .fn()
        .mockReturnValue(_mockElem);

      batchCmp.toggleSlidingItemClass = jest
        .fn();

      batchCmp.animationService.playCombinedSlidingHintAnimations = jest
        .fn()
        .mockReturnValue(throwError('test-error'));

      batchCmp.animationService.setHintShownFlag = jest
        .fn();

      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
      const toggleSpy: jest.SpyInstance = jest.spyOn(batchCmp, 'toggleSlidingItemClass');
      const setSpy: jest.SpyInstance = jest.spyOn(batchCmp.animationService, 'setHintShownFlag');

      fixture.detectChanges();

      batchCmp.batchSlidingItemsList = <any>_mockElem;

      batchCmp.runSlidingHints();

      setTimeout((): void => {
        expect(toggleSpy).toHaveBeenCalledTimes(2);
        expect(setSpy).not.toHaveBeenCalled();
        const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
        expect(consoleCalls[0]).toMatch('Animation error');
        expect(consoleCalls[1]).toMatch('test-error');
        done();
      }, 10);
    });

    test('should toggle sliding item class', (): void => {
      const _mockElem: HTMLElement = global.document.createElement('div');

      batchCmp.animationService.toggleSlidingItemClass = jest
        .fn();

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
