/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockUser } from '../../../../test-config/mock-models/mock-user';
import { LoginPageStub } from '../../../../test-config/component-stubs/login-stub.component';
import { SignupPageStub } from '../../../../test-config/component-stubs/signup-stub.component';
import { ModalControllerMock, ModalMock } from '../../../../test-config/mocks-ionic';
import { ActionSheetServiceMock, UserServiceMock } from '../../../../test-config/mocks-app';

/* Interface imports */
import { User } from '../../shared/interfaces/user';

/* Service Imports */
import { ActionSheetService } from '../../services/action-sheet/action-sheet.service';
import { UserService } from '../../services/user/user.service';

/* Page imports */
import { LoginPage } from '../../pages/forms/login/login.page';
import { SignupPage } from '../../pages/forms/signup/signup.page';

/* Component imports */
import { HeaderComponent } from './header.component';


describe('HeaderComponent', (): void => {
  let fixture: ComponentFixture<HeaderComponent>;
  let headerCmp: HeaderComponent;
  let originalOnInit: any;
  let originalOnDestroy: any;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        HeaderComponent,
        LoginPageStub,
        SignupPageStub
      ],
      imports: [ RouterTestingModule ],
      providers: [
        { provide: ActionSheetService, useClass: ActionSheetServiceMock },
        { provide: UserService, useClass: UserServiceMock },
        { provide: ModalController, useClass: ModalControllerMock }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(HeaderComponent);
    headerCmp = fixture.componentInstance;
    originalOnInit = headerCmp.ngOnInit;
    originalOnDestroy = headerCmp.ngOnDestroy;
    headerCmp.ngOnInit = jest
      .fn();
    headerCmp.ngOnDestroy = jest
      .fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(headerCmp).toBeDefined();
  });

  test('should init the component', (): void => {
    const _mockUser: User = mockUser();

    headerCmp.userService.getUser = jest
      .fn()
      .mockReturnValue(new BehaviorSubject<User>(_mockUser));

    headerCmp.userService.isLoggedIn = jest
      .fn()
      .mockReturnValue(true);

    headerCmp.ngOnInit = originalOnInit;

    fixture.detectChanges();

    expect(headerCmp.user).toStrictEqual(_mockUser);
    expect(headerCmp.isLoggedIn).toBe(true);
  });

  test('should destroy the component', (): void => {
    headerCmp.ngOnDestroy = originalOnDestroy;

    const nextSpy: jest.SpyInstance = jest.spyOn(headerCmp.destroy$, 'next');
    const completeSpy: jest.SpyInstance = jest.spyOn(headerCmp.destroy$, 'complete');

    fixture.detectChanges();

    headerCmp.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(completeSpy).toHaveBeenCalled();
  });

  test('should open the login modal', (done: jest.DoneCallback): void => {
    const _mockModal = new ModalMock();

    headerCmp.modalCtrl.create = jest
      .fn()
      .mockReturnValue(Promise.resolve(_mockModal));

    const createSpy: jest.SpyInstance = jest.spyOn(headerCmp.modalCtrl, 'create');
    const presentSpy: jest.SpyInstance = jest.spyOn(_mockModal, 'present');

    fixture.detectChanges();

    headerCmp.openLogin();

    setTimeout((): void => {
      expect(createSpy).toHaveBeenCalledWith({ component: LoginPage });
      expect(presentSpy).toHaveBeenCalled();
      done();
    }, 10);
  });

  test('should open the signup modal', (done: jest.DoneCallback): void => {
    const _mockModal = new ModalMock();

    headerCmp.modalCtrl.create = jest
      .fn()
      .mockReturnValue(Promise.resolve(_mockModal));

    const createSpy: jest.SpyInstance = jest.spyOn(headerCmp.modalCtrl, 'create');
    const presentSpy: jest.SpyInstance = jest.spyOn(_mockModal, 'present');

    fixture.detectChanges();

    headerCmp.openSignup();

    setTimeout((): void => {
      expect(createSpy).toHaveBeenCalledWith({ component: SignupPage });
      expect(presentSpy).toHaveBeenCalled();
      done();
    }, 10);
  });

  test('should handle go back click', (): void => {
    headerCmp.overrideBackButton = undefined;
    headerCmp.rootURL = 'url';

    headerCmp.router.navigate = jest
      .fn();

    const navSpy: jest.SpyInstance = jest.spyOn(headerCmp.router, 'navigate');

    fixture.detectChanges();

    headerCmp.goBack();

    expect(navSpy).toHaveBeenCalledWith(['url']);

    headerCmp.overrideBackButton = () => {};

    const overrideSpy: jest.SpyInstance = jest.spyOn(headerCmp, 'overrideBackButton');

    fixture.detectChanges();

    headerCmp.goBack();

    expect(overrideSpy).toHaveBeenCalled();
  });

  test('should open the login/signup action sheet', (): void => {
    headerCmp.actionService.openActionSheet = jest
      .fn();

    const actionSpy: jest.SpyInstance = jest.spyOn(headerCmp.actionService, 'openActionSheet');

    fixture.detectChanges();

    headerCmp.openLoginSignup();

    expect(actionSpy).toHaveBeenCalled();
  });

});
