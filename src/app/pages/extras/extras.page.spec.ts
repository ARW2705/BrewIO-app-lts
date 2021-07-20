/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { throwError } from 'rxjs';
import { IonicModule } from '@ionic/angular';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockBatch, mockErrorReport, mockInventoryItem } from '../../../../test-config/mock-models';
import { AnimationsServiceStub, ErrorReportingServiceStub } from '../../../../test-config/service-stubs';
import { AboutComponentStub, ActiveBatchesComponentStub, HeaderComponentStub, InventoryComponentStub, PreferencesComponentStub, UserComponentStub } from '../../../../test-config/component-stubs';
import { ActivatedRouteStub, AnimationStub } from '../../../../test-config/ionic-stubs';

/* Interface imports */
import { Batch, ErrorReport, InventoryItem } from '../../shared/interfaces';

/* Provider imports */
import { AnimationsService } from '../../services/animations/animations.service';
import { ErrorReportingService } from '../../services/error-reporting/error-reporting.service';

/* Page imports */
import { ExtrasPage } from './extras.page';


describe('ExtrasPage', (): void => {
  let fixture: ComponentFixture<ExtrasPage>;
  let extrasPage: ExtrasPage;
  let originalOnInit: any;
  let originalOnDestroy: any;
  let originalQuery: any;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        ExtrasPage,
        AboutComponentStub,
        ActiveBatchesComponentStub,
        InventoryComponentStub,
        HeaderComponentStub,
        PreferencesComponentStub,
        UserComponentStub
      ],
      imports: [
        IonicModule,
        RouterTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        { provide: AnimationsService, useClass: AnimationsServiceStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ExtrasPage);
    extrasPage = fixture.componentInstance;
    originalOnInit = extrasPage.ngOnInit;
    originalOnDestroy = extrasPage.ngOnDestroy;
    originalQuery = global.document.querySelector;
    extrasPage.ngOnInit = jest
      .fn();
    extrasPage.ngOnDestroy = jest
      .fn();
  });

  afterEach((): void => {
    global.document.querySelector = originalQuery;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(extrasPage).toBeDefined();
  });

  describe('Lifecycle', (): void => {

    test('should init the component with batch data', (): void => {
      const _mockBatch: Batch = mockBatch();

      extrasPage.ngOnInit = originalOnInit;

      extrasPage.router.getCurrentNavigation = jest
        .fn()
        .mockReturnValue({
          extras: {
            state: {
              passTo: 'inventory',
              optionalData: _mockBatch
            }
          }
        });

      extrasPage.displayComponent = jest
        .fn();

      fixture.detectChanges();

      expect(extrasPage.optionalInventoryData).toStrictEqual(_mockBatch);
    });

    test('should init the component with item data', (): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();

      extrasPage.ngOnInit = originalOnInit;

      extrasPage.router.getCurrentNavigation = jest
        .fn()
        .mockReturnValue({
          extras: {
            state: {
              passTo: 'inventory',
              optionalData: _mockInventoryItem
            }
          }
        });

      extrasPage.displayComponent = jest
        .fn();

      fixture.detectChanges();

      expect(extrasPage.optionalInventoryData).toStrictEqual(_mockInventoryItem);
    });

    test('should init the component with data other than passTo', (): void => {
      extrasPage.ngOnInit = originalOnInit;

      extrasPage.router.getCurrentNavigation = jest
        .fn()
        .mockReturnValue({
          extras: {
            state: {
              other: {}
            }
          }
        });

      fixture.detectChanges();

      expect(extrasPage.optionalInventoryData).toBeNull();
    });

    test('should init the component with no nav data', (): void => {
      extrasPage.ngOnInit = originalOnInit;

      extrasPage.router.getCurrentNavigation = jest
        .fn()
        .mockReturnValue({
          extras: {}
        });

      fixture.detectChanges();

      expect(extrasPage.optionalInventoryData).toBeNull();
    });

    test('should handle error on init the component', (): void => {
      const _mockError: Error = new Error('test-error');
      const _mockErrorReport: ErrorReport = mockErrorReport();

      extrasPage.ngOnInit = originalOnInit;

      extrasPage.route.queryParams = throwError(_mockError);

      extrasPage.errorReporter.setErrorReport = jest
        .fn();

      extrasPage.errorReporter.getCustomReportFromError = jest
        .fn()
        .mockReturnValue(_mockErrorReport);

      const getSpy: jest.SpyInstance = jest.spyOn(extrasPage.errorReporter, 'getCustomReportFromError');
      const setSpy: jest.SpyInstance = jest.spyOn(extrasPage.errorReporter, 'setErrorReport');

      fixture.detectChanges();

      setTimeout((): void => {
        expect(getSpy).toHaveBeenCalledWith(_mockError);
        expect(setSpy).toHaveBeenCalledWith(_mockErrorReport);
      }, 10);
    });

    test('should handle destroying the component', (): void => {
      const nextSpy: jest.SpyInstance = jest.spyOn(extrasPage.destroy$, 'next');
      const completeSpy: jest.SpyInstance = jest.spyOn(extrasPage.destroy$, 'complete');

      extrasPage.ngOnDestroy = originalOnDestroy;

      fixture.detectChanges();

      extrasPage.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalledWith(true);
      expect(completeSpy).toHaveBeenCalled();
    });

    test('handle ion view enter', (): void => {
      extrasPage.viewPageRoot = jest
        .fn();

      extrasPage.optionalInventoryData = mockBatch();

      const viewSpy: jest.SpyInstance = jest.spyOn(extrasPage, 'viewPageRoot');

      fixture.detectChanges();

      extrasPage.ionViewWillEnter();

      expect(viewSpy).not.toHaveBeenCalled();

      extrasPage.optionalInventoryData = null;

      fixture.detectChanges();

      extrasPage.ionViewWillEnter();

      expect(viewSpy).toHaveBeenCalled();
    });

  });


  describe('Other', (): void => {

    test('should reset extras page to view root', (done: jest.DoneCallback): void => {
      const _stubAnimation: AnimationStub = new AnimationStub();
      const _mockElement: HTMLElement = global.document.createElement('div');

      extrasPage.animationService.slideOut = jest
        .fn()
        .mockReturnValue(_stubAnimation);

      extrasPage.getContainer = jest
        .fn()
        .mockReturnValue(_mockElement);

      extrasPage.title = 'test';
      extrasPage.onBackClick = () => {};
      extrasPage.optionalInventoryData = mockBatch();

      const playSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'play');

      fixture.detectChanges();

      extrasPage.viewPageRoot(0);

      setTimeout((): void => {
        expect(playSpy).toHaveBeenCalled();
        expect(extrasPage.title).toMatch('More Options');
        expect(extrasPage.onBackClick).toBeUndefined();
        expect(extrasPage.optionalInventoryData).toBeNull();
        done();
      }, 10);
    });

    test('should handle error on animation error', (done: jest.DoneCallback): void => {
      const _stubAnimation: AnimationStub = new AnimationStub();

      extrasPage.animationService.slideOut = jest
        .fn()
        .mockImplementation((): any => { throw new Error('test-error'); });

      extrasPage.title = 'test';
      extrasPage.onBackClick = () => {};
      extrasPage.optionalInventoryData = mockBatch();

      const playSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'play');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      fixture.detectChanges();

      extrasPage.viewPageRoot(0);

      setTimeout((): void => {
        const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
        expect(consoleCalls[0]).toMatch('display extras home error');
        expect(consoleCalls[1].message).toMatch('test-error');
        expect(playSpy).not.toHaveBeenCalled();
        expect(extrasPage.title).toMatch('More Options');
        expect(extrasPage.onBackClick).toBeUndefined();
        expect(extrasPage.optionalInventoryData).toBeNull();
        done();
      }, 10);
    });

    test('should display a given sub component', (done: jest.DoneCallback): void => {
      const _stubAnimation: AnimationStub = new AnimationStub();
      const _mockElement: HTMLElement = global.document.createElement('div');

      extrasPage.viewPageRoot.bind = jest
        .fn()
        .mockImplementation((page: ExtrasPage): () => void => {
          return page.viewPageRoot;
        });

      extrasPage.animationService.slideIn = jest
        .fn()
        .mockReturnValue(_stubAnimation);

      extrasPage.getContainer = jest
        .fn()
        .mockReturnValue(_mockElement);

      const playSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'play');

      fixture.detectChanges();

      extrasPage.displayComponent(1);

      setTimeout((): void => {
        expect(playSpy).toHaveBeenCalled();
        expect(extrasPage.onBackClick).toStrictEqual(extrasPage.viewPageRoot);
        expect(extrasPage.title).toMatch('Inventory');
        done();
      }, 10);
    });

    test('should display a given sub component that will have pass through data available', (done: jest.DoneCallback): void => {
      const _stubAnimation: AnimationStub = new AnimationStub();
      const _mockElement: HTMLElement = global.document.createElement('div');

      extrasPage.viewPageRoot.bind = jest
        .fn()
        .mockImplementation((page: ExtrasPage): () => void => {
          return page.viewPageRoot;
        });

      extrasPage.animationService.slideIn = jest
        .fn()
        .mockReturnValue(_stubAnimation);

      extrasPage.getContainer = jest
        .fn()
        .mockReturnValue(_mockElement);

      const playSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'play');

      fixture.detectChanges();

      extrasPage.displayComponent(0, true);

      setTimeout((): void => {
        expect(playSpy).not.toHaveBeenCalled();
        expect(extrasPage.onBackClick).toStrictEqual(extrasPage.viewPageRoot);
        expect(extrasPage.title).toMatch('Active Batches');
        done();
      }, 10);
    });

    test('should handle animation error on display component', (done: jest.DoneCallback): void => {
      const _stubAnimation: AnimationStub = new AnimationStub();

      extrasPage.animationService.slideIn = jest
        .fn()
        .mockImplementation((): any => { throw new Error('test-error'); });

      const playSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'play');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      fixture.detectChanges();

      extrasPage.displayComponent(0);

      setTimeout((): void => {
        expect(playSpy).not.toHaveBeenCalled();
        const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
        expect(consoleCalls[0]).toMatch('display extras error');
        expect(consoleCalls[1].message).toMatch('test-error');
        done();
      }, 10);
    });

    test('should get the container at a given index', (): void => {
      extrasPage.title = 'Active Batches';
      fixture.detectChanges();
      expect(extrasPage.getContainer(0).children[0].tagName.toLowerCase()).toMatch('active-batches');

      extrasPage.title = 'Inventory';
      fixture.detectChanges();
      expect(extrasPage.getContainer(1).children[0].tagName.toLowerCase()).toMatch('inventory');

      extrasPage.title = 'Preferences';
      fixture.detectChanges();
      expect(extrasPage.getContainer(2).children[0].tagName.toLowerCase()).toMatch('preferences');

      extrasPage.title = 'User';
      fixture.detectChanges();
      expect(extrasPage.getContainer(3).children[0].tagName.toLowerCase()).toMatch('user');

      extrasPage.title = 'About';
      fixture.detectChanges();
      expect(extrasPage.getContainer(4).children[0].tagName.toLowerCase()).toMatch('about');

      extrasPage.title = 'Active Batches';
      fixture.detectChanges();
      expect(extrasPage.getContainer(5)).toBeNull();
    });

  });


  describe('Render Template', (): void => {

    test('should render sub component list', (): void => {
      extrasPage.title = 'More Options';

      fixture.detectChanges();

      const subCmps: NodeList = fixture.nativeElement.querySelectorAll('ion-item');

      subCmps.forEach((subCmp: Node, index: number): void => {
        const label: HTMLElement = <HTMLElement>subCmp.childNodes[0];
        expect(label.textContent.toLowerCase()).toMatch(extrasPage.extras[index].title);
      });

      const abCmp: HTMLElement = fixture.nativeElement.querySelector('active-batches');
      expect(abCmp).toBeNull();

      const invCmp: HTMLElement = fixture.nativeElement.querySelector('inventory');
      expect(invCmp).toBeNull();

      const prefCmp: HTMLElement = fixture.nativeElement.querySelector('preferences');
      expect(prefCmp).toBeNull();

      const userCmp: HTMLElement = fixture.nativeElement.querySelector('user');
      expect(userCmp).toBeNull();

      const aboutCmp: HTMLElement = fixture.nativeElement.querySelector('about');
      expect(aboutCmp).toBeNull();
    });

    test('should render active-batches sub component', (): void => {
      extrasPage.title = 'Active Batches';

      fixture.detectChanges();

      const abCmp: HTMLElement = fixture.nativeElement.querySelector('active-batches');
      expect(abCmp).not.toBeNull();

      const invCmp: HTMLElement = fixture.nativeElement.querySelector('inventory');
      expect(invCmp).toBeNull();

      const prefCmp: HTMLElement = fixture.nativeElement.querySelector('preferences');
      expect(prefCmp).toBeNull();

      const userCmp: HTMLElement = fixture.nativeElement.querySelector('user');
      expect(userCmp).toBeNull();

      const aboutCmp: HTMLElement = fixture.nativeElement.querySelector('about');
      expect(aboutCmp).toBeNull();
    });

    test('should render inventory sub component', (): void => {
      extrasPage.title = 'Inventory';

      fixture.detectChanges();

      const abCmp: HTMLElement = fixture.nativeElement.querySelector('active-batches');
      expect(abCmp).toBeNull();

      const invCmp: HTMLElement = fixture.nativeElement.querySelector('inventory');
      expect(invCmp).not.toBeNull();

      const prefCmp: HTMLElement = fixture.nativeElement.querySelector('preferences');
      expect(prefCmp).toBeNull();

      const userCmp: HTMLElement = fixture.nativeElement.querySelector('user');
      expect(userCmp).toBeNull();

      const aboutCmp: HTMLElement = fixture.nativeElement.querySelector('about');
      expect(aboutCmp).toBeNull();
    });

    test('should render preferences sub component', (): void => {
      extrasPage.title = 'Preferences';

      fixture.detectChanges();

      const abCmp: HTMLElement = fixture.nativeElement.querySelector('active-batches');
      expect(abCmp).toBeNull();

      const invCmp: HTMLElement = fixture.nativeElement.querySelector('inventory');
      expect(invCmp).toBeNull();

      const prefCmp: HTMLElement = fixture.nativeElement.querySelector('preferences');
      expect(prefCmp).not.toBeNull();

      const userCmp: HTMLElement = fixture.nativeElement.querySelector('user');
      expect(userCmp).toBeNull();

      const aboutCmp: HTMLElement = fixture.nativeElement.querySelector('about');
      expect(aboutCmp).toBeNull();
    });

    test('should render user sub component', (): void => {
      extrasPage.title = 'User';

      fixture.detectChanges();

      const abCmp: HTMLElement = fixture.nativeElement.querySelector('active-batches');
      expect(abCmp).toBeNull();

      const invCmp: HTMLElement = fixture.nativeElement.querySelector('inventory');
      expect(invCmp).toBeNull();

      const prefCmp: HTMLElement = fixture.nativeElement.querySelector('preferences');
      expect(prefCmp).toBeNull();

      const userCmp: HTMLElement = fixture.nativeElement.querySelector('user');
      expect(userCmp).not.toBeNull();

      const aboutCmp: HTMLElement = fixture.nativeElement.querySelector('about');
      expect(aboutCmp).toBeNull();
    });

    test('should render about sub component', (): void => {
      extrasPage.title = 'About';

      fixture.detectChanges();

      const abCmp: HTMLElement = fixture.nativeElement.querySelector('active-batches');
      expect(abCmp).toBeNull();

      const invCmp: HTMLElement = fixture.nativeElement.querySelector('inventory');
      expect(invCmp).toBeNull();

      const prefCmp: HTMLElement = fixture.nativeElement.querySelector('preferences');
      expect(prefCmp).toBeNull();

      const userCmp: HTMLElement = fixture.nativeElement.querySelector('user');
      expect(userCmp).toBeNull();

      const aboutCmp: HTMLElement = fixture.nativeElement.querySelector('about');
      expect(aboutCmp).not.toBeNull();
    });

  });

});
