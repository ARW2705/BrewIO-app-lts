/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { IonicModule } from '@ionic/angular';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockUser } from '../../../../test-config/mock-models';
import { ErrorReportingServiceStub, EventServiceStub, ToastServiceStub, UserServiceStub } from '../../../../test-config/service-stubs';
import { AccordionComponentStub, ActiveBatchesComponentStub, InventoryComponentStub, HeaderComponentStub, LoginPageStub, SignupPageStub } from '../../../../test-config/component-stubs';

/* Interface imports */
import { User } from '../../shared/interfaces';

/* Service imports */
import { ErrorReportingService } from '../../services/error-reporting/error-reporting.service';
import { EventService } from '../../services/event/event.service';
import { ToastService } from '../../services/toast/toast.service';
import { UserService } from '../../services/user/user.service';

/* Component imports */
import { AccordionComponent } from '../../components/accordion/accordion.component';

/* Page imports */
import { HomePage } from './home.page';

/* Modify accordion component */
@Component({
  selector: 'accordion',
  template: '<div><ng-content></ng-content></div>',
  providers: [
    { provide: AccordionComponent, useClass: ModifiedAccordionStub }
  ]
})
class ModifiedAccordionStub extends AccordionComponentStub {
  constructor() {
    super();
  }
}


describe('HomePage', (): void => {
  let fixture: ComponentFixture<HomePage>;
  let homePage: HomePage;
  let originalOnInit: any;
  let originalOnDestroy: any;
  let originalQuery: any;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        HomePage,
        ModifiedAccordionStub,
        ActiveBatchesComponentStub,
        InventoryComponentStub,
        HeaderComponentStub,
        LoginPageStub,
        SignupPageStub
      ],
      imports: [ IonicModule ],
      providers: [
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: EventService, useClass: EventServiceStub },
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
    fixture = TestBed.createComponent(HomePage);
    homePage = fixture.componentInstance;
    originalOnInit = homePage.ngOnInit;
    originalOnDestroy = homePage.ngOnDestroy;
    originalQuery = global.document.querySelector;
    homePage.ngOnInit = jest
      .fn();
    homePage.ngOnDestroy = jest
      .fn();
    homePage.toastService.presentToast = jest
      .fn();
    homePage.toastService.presentErrorToast = jest
      .fn();
    homePage.errorReporter.handleUnhandledError = jest
      .fn();
  });

  afterEach((): void => {
    global.document.querySelector = originalQuery;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(homePage).toBeDefined();
  });

  describe('Lifecycle', (): void => {

    test('should init the component', (): void => {
      homePage.ngOnInit = originalOnInit;

      homePage.registerEventListeners = jest
        .fn();

      homePage.listenForUserChanges = jest
        .fn();

      const registerSpy: jest.SpyInstance = jest.spyOn(homePage, 'registerEventListeners');
      const listenSpy: jest.SpyInstance = jest.spyOn(homePage, 'listenForUserChanges');

      fixture.detectChanges();

      expect(registerSpy).toHaveBeenCalled();
      expect(listenSpy).toHaveBeenCalled();
    });

    test('should handle destroying the component', (): void => {
      homePage.ngOnDestroy = originalOnDestroy;

      homePage.event.unregister = jest
        .fn();

      const nextSpy: jest.SpyInstance = jest.spyOn(homePage.destroy$, 'next');
      const completeSpy: jest.SpyInstance = jest.spyOn(homePage.destroy$, 'complete');
      const unregisterSpy: jest.SpyInstance = jest.spyOn(homePage.event, 'unregister');

      fixture.detectChanges();

      homePage.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalledWith(true);
      expect(completeSpy).toHaveBeenCalled();
      expect(unregisterSpy).toHaveBeenCalledWith('scroll-in-sub-component');
    });

  });


  describe('Other', (): void => {

    test('should listen for user changes', (done: jest.DoneCallback): void => {
      const _mockUser: User = mockUser();
      const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);

      homePage.userService.getUser = jest
        .fn()
        .mockReturnValue(_mockUser$);

      homePage.userService.isLoggedIn = jest
        .fn()
        .mockReturnValue(true);

      homePage.setWelcomeMessage = jest
        .fn();

      fixture.detectChanges();

      homePage.listenForUserChanges();

      setTimeout((): void => {
        expect(homePage.user).toStrictEqual(_mockUser);
        expect(homePage.isLoggedIn).toBe(true);
        done();
      }, 10);
    });

    test('should handle error listening for user', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      homePage.userService.getUser = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      // const toastSpy: jest.SpyInstance = jest.spyOn(homePage.toastService, 'presentErrorToast');

      const errorSpy: jest.SpyInstance = jest.spyOn(homePage.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      homePage.listenForUserChanges();

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        // expect(toastSpy).toHaveBeenCalledWith('test-error');
        done();
      }, 10);
    });

    test('should register event listeners', (done: jest.DoneCallback): void => {
      const _mockElement: HTMLElement = global.document.createElement('div');
      Object.defineProperty(_mockElement, 'offsetTop', { writable: false, value: 50 });

      global.document.querySelector = jest
        .fn()
        .mockReturnValue(_mockElement);

      homePage.event.register = jest
        .fn()
        .mockReturnValue(of({
          subComponent: 'inventory',
          offset: 100
        }));

      fixture.detectChanges();

      homePage.ionContent.scrollToPoint = jest
        .fn();

      const scrollSpy: jest.SpyInstance = jest.spyOn(homePage.ionContent, 'scrollToPoint');

      homePage.registerEventListeners();

      setTimeout((): void => {
        expect(scrollSpy).toHaveBeenCalledWith(
          0,
          300,
          1000
        );
        done();
      }, 10);
    });

    test('should scroll to element at id', (): void => {
      const _mockElement: HTMLElement = global.document.createElement('div');
      Object.defineProperty(_mockElement, 'offsetTop', { writable: false, value: 50 });

      global.document.querySelector = jest
        .fn()
        .mockReturnValue(_mockElement);

      fixture.detectChanges();

      homePage.ionContent.scrollToPoint = jest
        .fn();

      const scrollSpy: jest.SpyInstance = jest.spyOn(homePage.ionContent, 'scrollToPoint');
      const querySpy: jest.SpyInstance = jest.spyOn(global.document, 'querySelector');

      homePage.scrollToId('test-id');

      expect(scrollSpy).toHaveBeenCalledWith(
        0,
        50,
        1000
      );
      expect(querySpy).toHaveBeenCalledWith('#test-id');
    });

    test('should not scroll to null element', (): void => {
      global.document.querySelector = jest
        .fn()
        .mockReturnValue(null);

      fixture.detectChanges();

      homePage.ionContent.scrollToPoint = jest
        .fn();

      const scrollSpy: jest.SpyInstance = jest.spyOn(homePage.ionContent, 'scrollToPoint');
      const querySpy: jest.SpyInstance = jest.spyOn(global.document, 'querySelector');

      homePage.scrollToId('test-id');

      expect(querySpy).toHaveBeenCalledWith('#test-id');
      expect(scrollSpy).not.toHaveBeenCalled();
    });

    test('should set the welcome message', (): void => {
      const _mockUser: User = mockUser();
      _mockUser.firstname = 'test-first-name';
      _mockUser.username = 'test-user-name';

      fixture.detectChanges();

      expect(homePage.welcomeMessage.length).toEqual(0);

      homePage.setWelcomeMessage();
      expect(homePage.welcomeMessage).toMatch('Welcome to BrewIO');

      homePage.user = _mockUser;
      homePage.setWelcomeMessage();
      expect(homePage.welcomeMessage).toMatch(`Welcome ${_mockUser.firstname} to BrewIO`);

      delete homePage.user.firstname;
      homePage.setWelcomeMessage();
      expect(homePage.welcomeMessage).toMatch(`Welcome ${_mockUser.username} to BrewIO`);

      delete homePage.user.username;
      homePage.setWelcomeMessage();
      expect(homePage.welcomeMessage).toMatch('Welcome to BrewIO');
    });

    test('should toggle showing active batches', (): void => {
      homePage.scrollToId = jest
        .fn();

      const scrollSpy: jest.SpyInstance = jest.spyOn(homePage, 'scrollToId');

      fixture.detectChanges();

      homePage.toggleActiveBatches();

      expect(homePage.showActiveBatches).toBe(true);
      expect(homePage.firstActiveBatchesLoad).toBe(false);
      expect(scrollSpy).toHaveBeenCalledWith('batch-scroll-landmark');

      homePage.toggleActiveBatches();

      expect(homePage.showActiveBatches).toBe(false);
      expect(homePage.firstActiveBatchesLoad).toBe(false);
      expect(scrollSpy).toHaveBeenCalledTimes(1);
    });

    test('should toggle showing inventory', (): void => {
      homePage.scrollToId = jest
        .fn();

      const scrollSpy: jest.SpyInstance = jest.spyOn(homePage, 'scrollToId');

      fixture.detectChanges();

      homePage.toggleInventory();

      expect(homePage.showInventory).toBe(true);
      expect(homePage.firstInventoryLoad).toBe(false);
      expect(scrollSpy).toHaveBeenCalledWith('inventory-scroll-landmark');

      homePage.toggleInventory();

      expect(homePage.showInventory).toBe(false);
      expect(homePage.firstInventoryLoad).toBe(false);
      expect(scrollSpy).toHaveBeenCalledTimes(1);
    });

  });


  describe('Render Template', (): void => {

    test('should render the template with no user logged in and accordions expanded', (): void => {
      homePage.setWelcomeMessage();
      homePage.showActiveBatches = true;
      homePage.firstActiveBatchesLoad = false;
      homePage.showInventory = true;
      homePage.firstInventoryLoad = false;

      fixture.detectChanges();

      const welcomeElem: Element = fixture.nativeElement.querySelector('#welcome-message');
      expect(welcomeElem.textContent).toMatch('Welcome to BrewIO');

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');

      const batchesItem: Element = <Element>items.item(0);
      expect(batchesItem.children[0].textContent).toMatch('Hide Active Batches');

      const activeBatchesElem: Element = fixture.nativeElement.querySelector('active-batches');
      expect(activeBatchesElem.getAttribute('rootURL')).toMatch('tabs/home');

      const inventoryItem: Element = <Element>items.item(1);
      expect(inventoryItem.children[0].textContent).toMatch('Hide Inventory');

      const inventoryElem: Element = fixture.nativeElement.querySelector('inventory');
      expect(inventoryElem).toBeDefined();
    });

    test('should render template with user logged in and accordions collapsed', (): void => {
      const _mockUser: User = mockUser();

      homePage.user = _mockUser;
      homePage.setWelcomeMessage();
      homePage.showActiveBatches = false;
      homePage.firstActiveBatchesLoad = true;
      homePage.showInventory = false;
      homePage.firstInventoryLoad = true;

      fixture.detectChanges();

      const welcomeElem: Element = fixture.nativeElement.querySelector('#welcome-message');
      expect(welcomeElem.textContent).toMatch(`Welcome ${_mockUser.firstname} to BrewIO`);

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');

      const batchesItem: Element = <Element>items.item(0);
      expect(batchesItem.children[0].textContent).toMatch('Show Active Batches');

      const activeBatchesElem: Element = fixture.nativeElement.querySelector('active-batches');
      expect(activeBatchesElem).toBeNull();

      const inventoryItem: Element = <Element>items.item(1);
      expect(inventoryItem.children[0].textContent).toMatch('Show Inventory');

      const inventoryElem: Element = fixture.nativeElement.querySelector('inventory');
      expect(inventoryElem).toBeNull();
    });

  });

});
