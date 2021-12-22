/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { IonContent, IonicModule } from '@ionic/angular';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockUser } from '../../../../test-config/mock-models';
import { ErrorReportingServiceStub, EventServiceStub, UserServiceStub } from '../../../../test-config/service-stubs';
import { IonContentStub } from '../../../../test-config/ionic-stubs';

/* Interface imports */
import { User } from '../../shared/interfaces';

/* Service imports */
import { ErrorReportingService, EventService, UserService } from '../../services/services'

/* Page imports */
import { HomePage } from './home.page';


describe('HomePage', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<HomePage>;
  let page: HomePage;
  let originalOnInit: () => void;
  let originalOnDestroy: () => void;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ HomePage ],
      imports: [ IonicModule.forRoot() ],
      providers: [
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: EventService, useClass: EventServiceStub },
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
    page = fixture.componentInstance;
    originalOnInit = page.ngOnInit;
    originalOnDestroy = page.ngOnDestroy;
    page.ngOnInit = jest.fn();
    page.ngOnDestroy = jest.fn();
    page.errorReporter.handleUnhandledError = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(page).toBeDefined();
  });

  describe('Lifecycle', (): void => {

    test('should init the component', (): void => {
      page.ngOnInit = originalOnInit;
      page.registerEventListeners = jest.fn();
      page.listenForUserChanges = jest.fn();
      const registerSpy: jest.SpyInstance = jest.spyOn(page, 'registerEventListeners');
      const listenSpy: jest.SpyInstance = jest.spyOn(page, 'listenForUserChanges');

      fixture.detectChanges();

      expect(registerSpy).toHaveBeenCalled();
      expect(listenSpy).toHaveBeenCalled();
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
      expect(unregisterSpy).toHaveBeenCalledWith('scroll-in-sub-component');
    });

  });


  describe('Listeners', (): void => {

    test('should listen for user changes', (done: jest.DoneCallback): void => {
      const _mockUser: User = mockUser();
      page.userService.getUser = jest.fn()
        .mockReturnValue(of(_mockUser));
      page.userService.isLoggedIn = jest.fn()
        .mockReturnValue(true);
      page.setWelcomeMessage = jest.fn();
      const setSpy: jest.SpyInstance = jest.spyOn(page, 'setWelcomeMessage');

      fixture.detectChanges();

      page.listenForUserChanges();
      setTimeout((): void => {
        expect(page.user).toStrictEqual(_mockUser);
        expect(page.isLoggedIn).toBe(true);
        expect(setSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should handle error on user update', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      page.userService.getUser = jest.fn()
        .mockReturnValue(throwError(_mockError));
      const errorSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      page.listenForUserChanges();
      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should register event listeners', (done: jest.DoneCallback): void => {
      page.event.register = jest.fn()
        .mockReturnValue(of({ subComponent: 'inventory', offset: 100 }));
      const _mockElement: HTMLElement = document.createElement('div');
      Object.defineProperty(_mockElement, 'offsetTop', { value: 50, writable: false });
      document.querySelector = jest.fn()
        .mockReturnValue(_mockElement);
      const querySpy: jest.SpyInstance = jest.spyOn(document, 'querySelector');

      fixture.detectChanges();

      const _stubIonContent: IonContent = ((new IonContentStub()) as unknown) as IonContent;
      _stubIonContent.scrollToPoint = jest.fn();
      const scrollSpy: jest.SpyInstance = jest.spyOn(_stubIonContent, 'scrollToPoint');
      page.ionContent = _stubIonContent;
      page.registerEventListeners();
      setTimeout((): void => {
        expect(querySpy).toHaveBeenCalledWith('#inventory-scroll-landmark');
        expect(scrollSpy).toHaveBeenCalledWith(0, 50 + 100 + 150, page.oneSecond);
        done();
      }, 10);
    });

  });


  describe('Other Methods', (): void => {

    test('should scroll to given id', (): void => {
      const _mockElement: HTMLElement = document.createElement('div');
      Object.defineProperty(_mockElement, 'offsetTop', { value: 50, writable: false });
      document.querySelector = jest.fn()
        .mockReturnValue(_mockElement);
      const querySpy: jest.SpyInstance = jest.spyOn(document, 'querySelector');

      fixture.detectChanges();

      const _stubIonContent: IonContent = ((new IonContentStub()) as unknown) as IonContent;
      _stubIonContent.scrollToPoint = jest.fn();
      const scrollSpy: jest.SpyInstance = jest.spyOn(_stubIonContent, 'scrollToPoint');
      page.ionContent = _stubIonContent;
      page.scrollToId('test-id');
      expect(querySpy).toHaveBeenCalledWith('#test-id');
      expect(scrollSpy).toHaveBeenCalledWith(0, 50, page.oneSecond);
    });

    test('should set welcome message with user', (): void => {
      const _mockUser: User = mockUser();
      _mockUser.firstname = '';
      page.user = _mockUser;

      fixture.detectChanges();

      page.setWelcomeMessage();
      expect(page.welcomeMessage).toMatch(`Welcome ${_mockUser.username} to BrewIO`);
      _mockUser.firstname = 'test-name';

      fixture.detectChanges();

      page.setWelcomeMessage();
      expect(page.welcomeMessage).toMatch(`Welcome ${_mockUser.firstname} to BrewIO`);
    });

    test('should set welcome message without a user', (): void => {
      fixture.detectChanges();

      page.setWelcomeMessage();
      expect(page.welcomeMessage).toMatch('Welcome to BrewIO');
    });

    test('should toggle show active batches', (): void => {
      page.scrollToId = jest.fn();
      const scrollSpy: jest.SpyInstance = jest.spyOn(page, 'scrollToId');
      page.showActiveBatches = false;

      fixture.detectChanges();

      expect(page.firstActiveBatchesLoad).toBe(true);
      page.toggleActiveBatches();
      expect(scrollSpy).toHaveBeenCalledWith('batch-scroll-landmark');
      expect(page.showActiveBatches).toBe(true);
      expect(page.firstActiveBatchesLoad).toBe(false);
      page.toggleActiveBatches();
      expect(scrollSpy).toHaveBeenCalledTimes(1);
      expect(page.showActiveBatches).toBe(false);
    });

    test('should toggle show inventory', (): void => {
      page.scrollToId = jest.fn();
      const scrollSpy: jest.SpyInstance = jest.spyOn(page, 'scrollToId');
      page.showInventory = false;

      fixture.detectChanges();

      expect(page.firstInventoryLoad).toBe(true);
      page.toggleInventory();
      expect(scrollSpy).toHaveBeenCalledWith('inventory-scroll-landmark');
      expect(page.showInventory).toBe(true);
      expect(page.firstInventoryLoad).toBe(false);
      page.toggleInventory();
      expect(scrollSpy).toHaveBeenCalledTimes(1);
      expect(page.showInventory).toBe(false);
    });

  });


  describe('Template Render', (): void => {

    test('should render the component', (): void => {
      page.showActiveBatches = false;
      page.showInventory = false;
      page.welcomeMessage = 'Welcome to BrewIO';

      fixture.detectChanges();

      const mainImage: HTMLElement = fixture.nativeElement.querySelector('img');
      expect(mainImage.getAttribute('alt')).toMatch('A glass of beer');
      const welcomeMessage: HTMLElement = fixture.nativeElement.querySelector('h2');
      expect(welcomeMessage.textContent).toMatch('Welcome to BrewIO');
      const expandButtonLabels: NodeList = fixture.nativeElement.querySelectorAll('ion-label');
      const batchButton: HTMLElement = <HTMLElement>expandButtonLabels.item(0);
      expect(batchButton.textContent).toMatch('Show Active Batches');
      const inventoryButton: HTMLElement = <HTMLElement>expandButtonLabels.item(1);
      expect(inventoryButton.textContent).toMatch('Show Inventory');
      const accordions: NodeList = fixture.nativeElement.querySelectorAll('app-accordion');
      expect(accordions.length).toEqual(2);
    });

  });

});
