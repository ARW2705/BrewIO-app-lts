/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, LoadingController, ModalController } from '@ionic/angular';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockUser } from '../../../../../test-config/mock-models';
import { ToastServiceStub, UserServiceStub } from '../../../../../test-config/service-stubs';
import { HeaderComponentStub } from '../../../../../test-config/component-stubs';
import { LoadingControllerStub, LoadingStub, ModalControllerStub } from '../../../../../test-config/ionic-stubs';

/* Interface imports */
import { User } from '../../../shared/interfaces/user';

/* Service imports */
import { ToastService } from '../../../services/toast/toast.service';
import { UserService } from '../../../services/user/user.service';

/* Page imports */
import { LoginPage } from './login.page';


describe('LoginPage', (): void => {
  let fixture: ComponentFixture<LoginPage>;
  let loginPage: LoginPage;
  let originalOnInit: any;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        LoginPage,
        HeaderComponentStub,
      ],
      imports: [
        IonicModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: LoadingController, useClass: LoadingControllerStub },
        { provide: ModalController, useClass: ModalControllerStub },
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
    fixture = TestBed.createComponent(LoginPage);
    loginPage = fixture.componentInstance;
    originalOnInit = loginPage.ngOnInit;
    loginPage.ngOnInit = jest
      .fn();
    loginPage.toastService.presentToast = jest
      .fn();
    loginPage.toastService.presentErrorToast = jest
      .fn();
    loginPage.modalCtrl.dismiss = jest
      .fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(loginPage).toBeDefined();
  });

  test('should init the component', (): void => {
    loginPage.ngOnInit = originalOnInit;

    loginPage.initForm = jest
      .fn();

    const initSpy: jest.SpyInstance = jest.spyOn(loginPage, 'initForm');

    fixture.detectChanges();

    expect(initSpy).toHaveBeenCalled();
  });

  test('should call modal dismiss with not data', (): void => {
    const dismissSpy: jest.SpyInstance = jest.spyOn(loginPage.modalCtrl, 'dismiss');

    fixture.detectChanges();

    loginPage.dismiss();

    expect(dismissSpy).toHaveBeenCalled();
  });

  test('should init the form', (): void => {
    fixture.detectChanges();

    loginPage.initForm();

    expect(loginPage.loginForm.value).toStrictEqual({
      password: '',
      remember: false,
      username: ''
    });
  });

  test('should handle login', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    const _stubLoading: LoadingStub = new LoadingStub();
    const formBuilder: FormBuilder = new FormBuilder();
    const form: object = {
      password: 'test-pass',
      remember: true,
      username: 'test-user'
    };

    loginPage.userService.logIn = jest
      .fn()
      .mockReturnValue(of(_mockUser));

    loginPage.loadingCtrl.create = jest
      .fn()
      .mockReturnValue(_stubLoading);

    _stubLoading.present = jest
      .fn();
    _stubLoading.dismiss = jest
      .fn();

    const loginSpy: jest.SpyInstance = jest.spyOn(loginPage.userService, 'logIn');
    const toastSpy: jest.SpyInstance = jest.spyOn(loginPage.toastService, 'presentToast');

    fixture.detectChanges();

    loginPage.loginForm = formBuilder.group(form);

    loginPage.onSubmit();

    setTimeout((): void => {
      expect(loginSpy).toHaveBeenCalledWith(form, false);
      expect(toastSpy).toHaveBeenCalledWith(
        `Welcome ${_mockUser.username}!`,
        2000,
        'middle',
        'toast-bright'
      );
      done();
    }, 10);
  });

  test('should handle an error loggin in', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    const _stubLoading: LoadingStub = new LoadingStub();
    const formBuilder: FormBuilder = new FormBuilder();
    const form: object = {
      password: 'test-pass',
      remember: true,
      username: 'test-user'
    };

    loginPage.userService.logIn = jest
      .fn()
      .mockReturnValue(throwError('test-error'));

    loginPage.loadingCtrl.create = jest
      .fn()
      .mockReturnValue(_stubLoading);

    _stubLoading.present = jest
      .fn();
    _stubLoading.dismiss = jest
      .fn();

    const dismissSpy: jest.SpyInstance = jest.spyOn(_stubLoading, 'dismiss');
    const toastSpy: jest.SpyInstance = jest.spyOn(loginPage.toastService, 'presentErrorToast');

    fixture.detectChanges();

    loginPage.loginForm = formBuilder.group(form);

    loginPage.onSubmit();

    setTimeout((): void => {
      expect(toastSpy).toHaveBeenCalledWith('test-error');
      expect(dismissSpy).toHaveBeenCalled();
      done();
    }, 10);
  });

  test('should toggle password visibility', (): void => {
    fixture.detectChanges();

    expect(loginPage.showPassword).toBe(false);

    loginPage.togglePasswordVisible();
    expect(loginPage.showPassword).toBe(true);

    loginPage.togglePasswordVisible();
    expect(loginPage.showPassword).toBe(false);
  });

  test('should render the component', (): void => {
    const formBuilder: FormBuilder = new FormBuilder();
    const form: object = {
      password: '',
      remember: false,
      username: ''
    };

    loginPage.loginForm = formBuilder.group(form);

    fixture.detectChanges();

    const formItems: NodeList = fixture.nativeElement.querySelectorAll('ion-item');

    const usernameInput: HTMLElement = <HTMLElement>formItems.item(0);
    expect(usernameInput.children[0].textContent).toMatch('Username');
    expect(usernameInput.children[1].getAttribute('type')).toMatch('text');

    const passwordInput: HTMLElement = <HTMLElement>formItems.item(1);
    expect(passwordInput.children[0].textContent).toMatch('Password');
    expect(passwordInput.children[1].getAttribute('ng-reflect-type')).toMatch('password');

    loginPage.showPassword = true;

    fixture.detectChanges();

    const passwordShowInput: HTMLElement = <HTMLElement>formItems.item(1);
    expect(passwordShowInput.children[1].getAttribute('ng-reflect-type')).toMatch('text');

    const showCheck: HTMLElement = <HTMLElement>formItems.item(2);
    expect(showCheck.children[0].textContent).toMatch('Show Password');
    expect(showCheck.children[1].tagName).toMatch('ION-CHECKBOX');

    const rememberCheck: HTMLElement = <HTMLElement>formItems.item(3);
    expect(rememberCheck.children[0].textContent).toMatch('Remember Me');
    expect(rememberCheck.children[1].tagName).toMatch('ION-CHECKBOX');
  });

  test('should render buttons', (): void => {
    const formBuilder: FormBuilder = new FormBuilder();
    const form: object = {
      password: 'testPassword1!',
      remember: false,
      username: 'username'
    };

    loginPage.loginForm = formBuilder.group(form);

    fixture.detectChanges();

    const buttons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');

    const cancelButton: HTMLElement = <HTMLElement>buttons.item(0);
    expect(cancelButton.textContent).toMatch('Cancel');
    const loginButton: HTMLElement = <HTMLElement>buttons.item(1);
    expect(loginButton.textContent).toMatch('Log In');
    expect(loginButton.getAttribute('ng-reflect-disabled')).toMatch('false');
  });

});
