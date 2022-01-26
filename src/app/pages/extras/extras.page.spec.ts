/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { throwError } from 'rxjs';
import { IonicModule } from '@ionic/angular';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockBatch, mockErrorReport, mockInventoryItem } from '@test/mock-models';
import { AnimationsServiceStub, ErrorReportingServiceStub, UtilityServiceStub } from '@test/service-stubs';
import { ActivatedRouteStub, AnimationStub } from '@test/ionic-stubs';

/* Interface imports */
import { Batch, ErrorReport, InventoryItem } from '@shared/interfaces';

/* Provider imports */
import { AnimationsService, ErrorReportingService, UtilityService } from '@services/public';

/* Page imports */
import { ExtrasPage } from './extras.page';


describe('ExtrasPage', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<ExtrasPage>;
  let page: ExtrasPage;
  let originalOnInit: () => void;
  let originalOnDestroy: () => void;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ ExtrasPage ],
      imports: [
        IonicModule,
        RouterTestingModule
      ],
      providers: [
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        { provide: AnimationsService, useClass: AnimationsServiceStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: UtilityService, useClass: UtilityServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ExtrasPage);
    page = fixture.componentInstance;
    originalOnInit = page.ngOnInit;
    originalOnDestroy = page.ngOnDestroy;
    page.ngOnInit = jest.fn();
    page.ngOnDestroy = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(page).toBeDefined();
  });

  describe('Lifecycle', (): void => {

    test('should init the component with batch data', (): void => {
      const _mockBatch: Batch = mockBatch();
      page.ngOnInit = originalOnInit;
      page.router.getCurrentNavigation = jest.fn()
        .mockReturnValue({
          extras: {
            state: {
              passTo: 'inventory',
              optionalData: _mockBatch
            }
          }
        });
      page.displayComponent = jest.fn();

      fixture.detectChanges();

      expect(page.optionalInventoryData).toStrictEqual(_mockBatch);
    });

    test('should init the component with item data', (): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      page.ngOnInit = originalOnInit;
      page.router.getCurrentNavigation = jest.fn()
        .mockReturnValue({
          extras: {
            state: {
              passTo: 'inventory',
              optionalData: _mockInventoryItem
            }
          }
        });
      page.displayComponent = jest.fn();

      fixture.detectChanges();

      expect(page.optionalInventoryData).toStrictEqual(_mockInventoryItem);
    });

    test('should init the component with data other than passTo', (): void => {
      page.ngOnInit = originalOnInit;
      page.router.getCurrentNavigation = jest.fn()
        .mockReturnValue({
          extras: {
            state: {
              other: {}
            }
          }
        });

      fixture.detectChanges();

      expect(page.optionalInventoryData).toBeNull();
    });

    test('should init the component with no nav data', (): void => {
      page.ngOnInit = originalOnInit;
      page.router.getCurrentNavigation = jest.fn()
        .mockReturnValue({
          extras: {}
        });

      fixture.detectChanges();

      expect(page.optionalInventoryData).toBeNull();
    });

    test('should handle error on init the component', (): void => {
      const _mockError: Error = new Error('test-error');
      const _mockErrorReport: ErrorReport = mockErrorReport();
      page.ngOnInit = originalOnInit;
      page.route.queryParams = throwError(_mockError);
      page.errorReporter.setErrorReport = jest.fn();
      page.errorReporter.getCustomReportFromError = jest.fn()
        .mockReturnValue(_mockErrorReport);
      const getSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'getCustomReportFromError');
      const setSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'setErrorReport');

      fixture.detectChanges();

      setTimeout((): void => {
        expect(getSpy).toHaveBeenCalledWith(_mockError);
        expect(setSpy).toHaveBeenCalledWith(_mockErrorReport);
      }, 10);
    });

    test('should handle destroying the component', (): void => {
      const nextSpy: jest.SpyInstance = jest.spyOn(page.destroy$, 'next');
      const completeSpy: jest.SpyInstance = jest.spyOn(page.destroy$, 'complete');
      page.ngOnDestroy = originalOnDestroy;

      fixture.detectChanges();

      page.ngOnDestroy();
      expect(nextSpy).toHaveBeenCalledWith(true);
      expect(completeSpy).toHaveBeenCalled();
    });

    test('handle ion view enter', (): void => {
      page.viewPageRoot = jest.fn();
      page.optionalInventoryData = mockBatch();
      const viewSpy: jest.SpyInstance = jest.spyOn(page, 'viewPageRoot');

      fixture.detectChanges();

      page.ionViewWillEnter();
      expect(viewSpy).not.toHaveBeenCalled();
      page.optionalInventoryData = null;

      fixture.detectChanges();

      page.ionViewWillEnter();
      expect(viewSpy).toHaveBeenCalled();
    });

  });


  describe('Other', (): void => {

    test('should reset extras page to view root', (done: jest.DoneCallback): void => {
      const _stubAnimation: AnimationStub = new AnimationStub();
      const _mockElement: HTMLElement = global.document.createElement('div');
      page.animationService.slideOut = jest.fn()
        .mockReturnValue(_stubAnimation);
      page.getContainer = jest.fn()
        .mockReturnValue(_mockElement);
      page.title = 'test';
      page.onBackClick = () => {};
      page.optionalInventoryData = mockBatch();
      const playSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'play');

      fixture.detectChanges();

      page.viewPageRoot(0);
      setTimeout((): void => {
        expect(playSpy).toHaveBeenCalled();
        expect(page.title).toMatch('More Options');
        expect(page.onBackClick).toBeUndefined();
        expect(page.optionalInventoryData).toBeNull();
        done();
      }, 10);
    });

    test('should handle error on animation error', (done: jest.DoneCallback): void => {
      const _stubAnimation: AnimationStub = new AnimationStub();
      page.animationService.slideOut = jest.fn()
        .mockImplementation((): any => { throw new Error('test-error'); });
      page.title = 'test';
      page.onBackClick = () => {};
      page.optionalInventoryData = mockBatch();
      const playSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'play');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      fixture.detectChanges();

      page.viewPageRoot(0);
      setTimeout((): void => {
        const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
        expect(consoleCalls[0]).toMatch('display extras home error');
        expect(consoleCalls[1].message).toMatch('test-error');
        expect(playSpy).not.toHaveBeenCalled();
        expect(page.title).toMatch('More Options');
        expect(page.onBackClick).toBeUndefined();
        expect(page.optionalInventoryData).toBeNull();
        done();
      }, 10);
    });

    test('should display a given sub component', (done: jest.DoneCallback): void => {
      const _stubAnimation: AnimationStub = new AnimationStub();
      const _mockElement: HTMLElement = global.document.createElement('div');
      page.viewPageRoot.bind = jest.fn()
        .mockImplementation((page: ExtrasPage): () => void => {
          return page.viewPageRoot;
        });
      page.animationService.slideIn = jest.fn()
        .mockReturnValue(_stubAnimation);
      page.getContainer = jest.fn()
        .mockReturnValue(_mockElement);
      page.utilService.toTitleCase = jest.fn()
        .mockReturnValue('Inventory');
      const playSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'play');

      fixture.detectChanges();

      page.displayComponent(1);
      setTimeout((): void => {
        expect(playSpy).toHaveBeenCalled();
        expect(page.onBackClick).toStrictEqual(page.viewPageRoot);
        expect(page.title).toMatch('Inventory');
        done();
      }, 10);
    });

    test('should display a given sub component that will have pass through data available', (done: jest.DoneCallback): void => {
      const _stubAnimation: AnimationStub = new AnimationStub();
      const _mockElement: HTMLElement = global.document.createElement('div');
      page.viewPageRoot.bind = jest.fn()
        .mockImplementation((extrasPage: ExtrasPage): () => void => {
          return extrasPage.viewPageRoot;
        });
      page.animationService.slideIn = jest.fn().mockReturnValue(_stubAnimation);
      page.getContainer = jest.fn().mockReturnValue(_mockElement);
      page.utilService.toTitleCase = jest.fn().mockReturnValue('Active Batches');
      const slideSpy: jest.SpyInstance = jest.spyOn(page.animationService, 'slideIn');

      fixture.detectChanges();

      page.displayComponent(0, true);
      setTimeout((): void => {
        expect(slideSpy).toHaveBeenCalledWith(_mockElement, { duration: 0});
        expect(page.onBackClick).toStrictEqual(page.viewPageRoot);
        expect(page.title).toMatch('Active Batches');
        done();
      }, 10);
    });

    test('should handle animation error on display component', (done: jest.DoneCallback): void => {
      const _stubAnimation: AnimationStub = new AnimationStub();
      page.animationService.slideIn = jest.fn()
        .mockImplementation((): any => { throw new Error('test-error'); });
      const playSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'play');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      fixture.detectChanges();

      page.displayComponent(0);
      setTimeout((): void => {
        expect(playSpy).not.toHaveBeenCalled();
        const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
        expect(consoleCalls[0]).toMatch('display extras error');
        expect(consoleCalls[1].message).toMatch('test-error');
        done();
      }, 10);
    });

    test('should get the container at a given index', (): void => {
      page.title = 'Active Batches';

      fixture.detectChanges();

      expect(page.getContainer(0).children[0].tagName.toLowerCase()).toMatch('app-active-batch-list');
      page.title = 'Inventory';

      fixture.detectChanges();

      expect(page.getContainer(1).children[0].tagName.toLowerCase()).toMatch('app-inventory');
      page.title = 'Preferences';

      fixture.detectChanges();

      expect(page.getContainer(2).children[0].tagName.toLowerCase()).toMatch('app-preferences');
      page.title = 'User';

      fixture.detectChanges();

      expect(page.getContainer(3).children[0].tagName.toLowerCase()).toMatch('app-user');
      page.title = 'About';

      fixture.detectChanges();

      expect(page.getContainer(4).children[0].tagName.toLowerCase()).toMatch('app-about');
      page.title = 'Active Batches';

      fixture.detectChanges();

      expect(page.getContainer(5)).toBeNull();
    });

  });


  describe('Render Template', (): void => {

    test('should render sub component list', (): void => {
      page.title = 'More Options';

      fixture.detectChanges();

      const subCmps: NodeList = fixture.nativeElement.querySelectorAll('ion-item');
      subCmps.forEach((subCmp: Node, index: number): void => {
        const label: HTMLElement = <HTMLElement>subCmp.childNodes[0];
        expect(label.textContent.toLowerCase()).toMatch(page.extras[index].title);
      });
      const abCmp: HTMLElement = fixture.nativeElement.querySelector('app-active-batch-list');
      expect(abCmp).toBeNull();
      const invCmp: HTMLElement = fixture.nativeElement.querySelector('app-inventory');
      expect(invCmp).toBeNull();
      const prefCmp: HTMLElement = fixture.nativeElement.querySelector('app-preferences');
      expect(prefCmp).toBeNull();
      const userCmp: HTMLElement = fixture.nativeElement.querySelector('app-user');
      expect(userCmp).toBeNull();
      const aboutCmp: HTMLElement = fixture.nativeElement.querySelector('app-about');
      expect(aboutCmp).toBeNull();
    });

    test('should render active-batches sub component', (): void => {
      page.title = 'Active Batches';

      fixture.detectChanges();

      const abCmp: HTMLElement = fixture.nativeElement.querySelector('app-active-batch-list');
      expect(abCmp).not.toBeNull();
      const invCmp: HTMLElement = fixture.nativeElement.querySelector('app-inventory');
      expect(invCmp).toBeNull();
      const prefCmp: HTMLElement = fixture.nativeElement.querySelector('app-preferences');
      expect(prefCmp).toBeNull();
      const userCmp: HTMLElement = fixture.nativeElement.querySelector('app-user');
      expect(userCmp).toBeNull();
      const aboutCmp: HTMLElement = fixture.nativeElement.querySelector('app-about');
      expect(aboutCmp).toBeNull();
    });

    test('should render inventory sub component', (): void => {
      page.title = 'Inventory';

      fixture.detectChanges();

      const abCmp: HTMLElement = fixture.nativeElement.querySelector('app-active-batch-list');
      expect(abCmp).toBeNull();
      const invCmp: HTMLElement = fixture.nativeElement.querySelector('app-inventory');
      expect(invCmp).not.toBeNull();
      const prefCmp: HTMLElement = fixture.nativeElement.querySelector('app-preferences');
      expect(prefCmp).toBeNull();
      const userCmp: HTMLElement = fixture.nativeElement.querySelector('app-user');
      expect(userCmp).toBeNull();
      const aboutCmp: HTMLElement = fixture.nativeElement.querySelector('app-about');
      expect(aboutCmp).toBeNull();
    });

    test('should render preferences sub component', (): void => {
      page.title = 'Preferences';

      fixture.detectChanges();

      const abCmp: HTMLElement = fixture.nativeElement.querySelector('app-active-batch-list');
      expect(abCmp).toBeNull();
      const invCmp: HTMLElement = fixture.nativeElement.querySelector('app-inventory');
      expect(invCmp).toBeNull();
      const prefCmp: HTMLElement = fixture.nativeElement.querySelector('app-preferences');
      expect(prefCmp).not.toBeNull();
      const userCmp: HTMLElement = fixture.nativeElement.querySelector('app-user');
      expect(userCmp).toBeNull();
      const aboutCmp: HTMLElement = fixture.nativeElement.querySelector('app-about');
      expect(aboutCmp).toBeNull();
    });

    test('should render user sub component', (): void => {
      page.title = 'User';

      fixture.detectChanges();

      const abCmp: HTMLElement = fixture.nativeElement.querySelector('app-active-batch-list');
      expect(abCmp).toBeNull();
      const invCmp: HTMLElement = fixture.nativeElement.querySelector('app-inventory');
      expect(invCmp).toBeNull();
      const prefCmp: HTMLElement = fixture.nativeElement.querySelector('app-preferences');
      expect(prefCmp).toBeNull();
      const userCmp: HTMLElement = fixture.nativeElement.querySelector('app-user');
      expect(userCmp).not.toBeNull();
      const aboutCmp: HTMLElement = fixture.nativeElement.querySelector('app-about');
      expect(aboutCmp).toBeNull();
    });

    test('should render about sub component', (): void => {
      page.title = 'About';

      fixture.detectChanges();

      const abCmp: HTMLElement = fixture.nativeElement.querySelector('app-active-batch-list');
      expect(abCmp).toBeNull();
      const invCmp: HTMLElement = fixture.nativeElement.querySelector('app-inventory');
      expect(invCmp).toBeNull();
      const prefCmp: HTMLElement = fixture.nativeElement.querySelector('app-preferences');
      expect(prefCmp).toBeNull();
      const userCmp: HTMLElement = fixture.nativeElement.querySelector('app-user');
      expect(userCmp).toBeNull();
      const aboutCmp: HTMLElement = fixture.nativeElement.querySelector('app-about');
      expect(aboutCmp).not.toBeNull();
    });

  });

});
