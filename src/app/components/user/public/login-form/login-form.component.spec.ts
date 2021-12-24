/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockUser } from '@test/mock-models';
import { ErrorReportingServiceStub, LoadingServiceStub, ToastServiceStub, UserServiceStub } from '@test/service-stubs';
import { HeaderComponentStub } from '@test/component-stubs';
import { ModalControllerStub } from '@test/ionic-stubs';

/* Interface imports */
import { User } from '@shared/interfaces';

/* Service imports */
import { ErrorReportingService, LoadingService, ToastService, UserService } from '@services/public';

/* Page imports */
import { LoginFormComponent } from './login-form.component';


describe('LoginFormComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<LoginFormComponent>;
  let component: LoginFormComponent;
  let originalOnInit: any;
  const defaultForm: FormGroup = new FormGroup({
    password: new FormControl(),
    username: new FormControl(),
    remember: new FormControl()
  });

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        LoginFormComponent,
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
    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    component.ngOnInit = jest.fn();
    component.toastService.presentToast = jest.fn();
    component.toastService.presentErrorToast = jest.fn();
    component.modalCtrl.dismiss = jest.fn();
    component.toastService.mediumDuration = 1500;
    component.loginForm = defaultForm;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  test('should init the component', (): void => {
    component.ngOnInit = originalOnInit;
    component.initForm = jest.fn();
    const initSpy: jest.SpyInstance = jest.spyOn(component, 'initForm');

    fixture.detectChanges();

    expect(initSpy).toHaveBeenCalled();
  });

  test('should call modal dismiss with no data', (): void => {
    const dismissSpy: jest.SpyInstance = jest.spyOn(component.modalCtrl, 'dismiss');

    fixture.detectChanges();

    component.dismiss();
    expect(dismissSpy).toHaveBeenCalled();
  });

  test('should init the form', (): void => {
    fixture.detectChanges();

    component.initForm();
    expect(component.loginForm.value).toStrictEqual({
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
    component.userService.logIn = jest.fn()
      .mockReturnValue(of(_mockUser));
    let isDismissed: boolean = false;
    component.loadingService.createLoader = jest.fn()
      .mockReturnValue({ dismiss: (): void => { isDismissed = true } });
    const loginSpy: jest.SpyInstance = jest.spyOn(component.userService, 'logIn');
    const toastSpy: jest.SpyInstance = jest.spyOn(component.toastService, 'presentToast');

    fixture.detectChanges();

    component.loginForm = formBuilder.group(form);
    component.onSubmit();
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
    component.userService.logIn = jest.fn()
      .mockReturnValue(throwError(_mockError));
    let isDismissed: boolean = false;
    component.loadingService.createLoader = jest.fn()
      .mockReturnValue({ dismiss: () => { isDismissed = true } });
    component.errorReporter.handleUnhandledError = jest.fn();
    const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

    fixture.detectChanges();

    component.loginForm = formBuilder.group(form);

    component.onSubmit();

    setTimeout((): void => {
      expect(errorSpy).toHaveBeenCalledWith(_mockError);
      expect(isDismissed).toBe(true);
      done();
    }, 10);
  });

  test('should toggle password visibility', (): void => {
    fixture.detectChanges();

    expect(component.passwordType).toMatch('password');
    component.togglePasswordVisible(true);
    expect(component.passwordType).toMatch('text');
    component.togglePasswordVisible(false);
    expect(component.passwordType).toMatch('password');
  });

  test('should render the template', (): void => {
    const formBuilder: FormBuilder = new FormBuilder();
    const form: object = {
      password: '',
      remember: false,
      username: ''
    };

    component.loginForm = formBuilder.group(form);

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
    component.passwordType = 'text';

    fixture.detectChanges();

    const updatedInputs: NodeList = fixture.nativeElement.querySelectorAll('app-form-input');
    const textPasswordInput: Element = <Element>updatedInputs.item(1);
    expect(textPasswordInput['type']).toMatch('text');
    const buttons: HTMLElement = fixture.nativeElement.querySelector('app-form-buttons');
    expect(buttons).toBeTruthy();
  });

});
