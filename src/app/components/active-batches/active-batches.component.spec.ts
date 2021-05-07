/* Module imorts */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockBatch } from '../../../../test-config/mock-models';
import { ProcessServiceStub, ToastServiceStub } from '../../../../test-config/service-stubs';

import * as subjectHelpers from '../../shared/utility-functions/subject-helpers';

/* Interface imports */
import { Batch } from '../../shared/interfaces/batch';

/* Service imports */
import { ProcessService } from '../../services/process/process.service';
import { ToastService } from '../../services/toast/toast.service';

/* Component imports */
import { ActiveBatchesComponent } from './active-batches.component';


describe('ActiveBatchesComponent', (): void => {
  let fixture: ComponentFixture<ActiveBatchesComponent>;
  let batchCmp: ActiveBatchesComponent;
  let originalOnInit: any;
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
    originalOnDestroy = batchCmp.ngOnDestroy;
    batchCmp.ngOnInit = jest
      .fn();
    batchCmp.ngOnDestroy = jest
      .fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(batchCmp).toBeDefined();
  });

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

  test('should trigger destroy subject on component destroy', (): void => {
    batchCmp.ngOnDestroy = originalOnDestroy;

    const nextSpy: jest.SpyInstance = jest.spyOn(batchCmp.destroy$, 'next');
    const completeSpy: jest.SpyInstance = jest.spyOn(batchCmp.destroy$, 'complete');

    fixture.detectChanges();

    batchCmp.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(completeSpy).toHaveBeenCalled();
  });

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
