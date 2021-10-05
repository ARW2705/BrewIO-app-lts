/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockUser } from '../../../../../test-config/mock-models';
import { ErrorReportingServiceStub, LoadingServiceStub, ToastServiceStub, UserServiceStub } from '../../../../../test-config/service-stubs';
import { HeaderComponentStub } from '../../../../../test-config/component-stubs';
import { LoadingStub, ModalControllerStub } from '../../../../../test-config/ionic-stubs';

/* Interface imports */
import { User } from '../../../shared/interfaces';

/* Service imports */
import { ErrorReportingService, LoadingService, ToastService, UserService } from '../../../services/services';

/* Page imports */
import { LoginPage } from './login.page';


describe('LoginPage', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<LoginPage>;
  let page: LoginPage;
  let originalOnInit: any;

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
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: LoadingService, useClass: LoadingServiceStub },
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
    page = fixture.componentInstance;
    originalOnInit = page.ngOnInit;
    page.ngOnInit = jest.fn();
    page.toastService.presentToast = jest.fn();
    page.toastService.presentErrorToast = jest.fn();
    page.modalCtrl.dismiss = jest.fn();
    page.toastService.mediumDuration = 1500;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(page).toBeDefined();
  });

  test('should init the component', (): void => {
    page.ngOnInit = originalOnInit;
    page.initForm = jest.fn();
    const initSpy: jest.SpyInstance = jest.spyOn(page, 'initForm');

    fixture.detectChanges();

    expect(initSpy).toHaveBeenCalled();
  });

  test('should call modal dismiss with no data', (): void => {
    const dismissSpy: jest.SpyInstance = jest.spyOn(page.modalCtrl, 'dismiss');

    fixture.detectChanges();

    page.dismiss();
    expect(dismissSpy).toHaveBeenCalled();
  });

  test('should init the form', (): void => {
    fixture.detectChanges();

    page.initForm();
    expect(page.loginForm.value).toStrictEqual({
      password: '',
      remember: false,
      username: ''
    });
  });

  test('should handle login', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    const formBuilder: FormBuilder = new FormBuilder();
    const form: object = {
      password: 'test-pass',
      remember: true,
      username: 'test-user'
    };
    page.userService.logIn = jest.fn()
      .mockReturnValue(of(_mockUser));
    let isDismissed: boolean = false;
    page.loadingService.createLoader = jest.fn()
      .mockReturnValue({ dismiss: () => { isDismissed = true } });
    const loginSpy: jest.SpyInstance = jest.spyOn(page.userService, 'logIn');
    const toastSpy: jest.SpyInstance = jest.spyOn(page.toastService, 'presentToast');

    fixture.detectChanges();

    page.loginForm = formBuilder.group(form);
    page.onSubmit();
    setTimeout((): void => {
      expect(loginSpy).toHaveBeenCalledWith(form, false);
      expect(toastSpy).toHaveBeenCalledWith(
        `Welcome ${_mockUser.username}`,
        1500,
        'middle',
        'toast-bright'
      );
      expect(isDismissed).toBe(true);
      done();
    }, 10);
  });

  test('should handle an error loggin in', (done: jest.DoneCallback): void => {
    const _mockError: Error = new Error('test-error');
    const formBuilder: FormBuilder = new FormBuilder();
    const form: object = {
      password: 'test-pass',
      remember: true,
      username: 'test-user'
    };
    page.userService.logIn = jest.fn()
      .mockReturnValue(throwError(_mockError));
    let isDismissed: boolean = false;
    page.loadingService.createLoader = jest.fn()
      .mockReturnValue({ dismiss: () => { isDismissed = true } });
    page.errorReporter.handleUnhandledError = jest.fn();
    const errorSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'handleUnhandledError');

    fixture.detectChanges();

    page.loginForm = formBuilder.group(form);

    page.onSubmit();

    setTimeout((): void => {
      expect(errorSpy).toHaveBeenCalledWith(_mockError);
      expect(isDismissed).toBe(true);
      done();
    }, 10);
  });

  test('should toggle password visibility', (): void => {
    fixture.detectChanges();

    expect(page.passwordType).toMatch('password');
    page.togglePasswordVisible(true);
    expect(page.passwordType).toMatch('text');
    page.togglePasswordVisible(false);
    expect(page.passwordType).toMatch('password');
  });

  test('should render the template', (): void => {
    const formBuilder: FormBuilder = new FormBuilder();
    const form: object = {
      password: '',
      remember: false,
      username: ''
    };

    page.loginForm = formBuilder.group(form);

    fixture.detectChanges();

    const inputs: NodeList = fixture.nativeElement.querySelectorAll('app-form-input');
    const usernameInput: Element = <Element>inputs.item(0);
    expect(usernameInput.getAttribute('controlName')).toMatch('username');
    const passwordInput: Element = <Element>inputs.item(1);
    expect(passwordInput.getAttribute('controlName')).toMatch('password');
    expect(passwordInput['type']).toMatch('password');
    const checkboxes: NodeList = fixture.nativeElement.querySelectorAll('app-form-checkbox');
    const displayBox: Element = <Element>checkboxes.item(0);
    expect(displayBox.getAttribute('label')).toMatch('show password');
    const rememberBox: Element = <Element>checkboxes.item(1);
    expect(rememberBox.getAttribute('label')).toMatch('remember me');
    page.passwordType = 'text';

    fixture.detectChanges();

    const updatedInputs: NodeList = fixture.nativeElement.querySelectorAll('app-form-input');
    const textPasswordInput: Element = <Element>updatedInputs.item(1);
    expect(textPasswordInput['type']).toMatch('text');
    const buttons: HTMLElement = fixture.nativeElement.querySelector('app-form-buttons');
    expect(buttons).toBeTruthy();
  });

});
