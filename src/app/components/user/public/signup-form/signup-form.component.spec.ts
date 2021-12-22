/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockImage, mockValidator } from '../../../../../../test-config/mock-models';
import { ErrorReportingServiceStub, FormValidationServiceStub, ImageServiceStub, ToastServiceStub, UserServiceStub } from '../../../../../../test-config/service-stubs';
import { LoadingControllerStub, ModalControllerStub } from '../../../../../../test-config/ionic-stubs';

/* Default imports */
import { defaultImage } from '../../../../shared/defaults';

/* Interface imports */
import { Image } from '../../../../shared/interfaces';

/* Service imports */
import { ErrorReportingService, FormValidationService, ImageService, ToastService, UserService } from '../../../../services/services';

/* Page imports */
import { SignupFormComponent } from './signup-form.component';


describe('SignupFormComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<SignupFormComponent>;
  let component: SignupFormComponent;
  let originalOnInit: any;
  const defaultForm: FormGroup = new FormGroup({
    username: new FormControl(),
    password: new FormControl(),
    passwordConfirmation: new FormControl(),
    email: new FormControl(),
    firstname: new FormControl(),
    lastname: new FormControl()
  });

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ SignupFormComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: FormValidationService, useClass: FormValidationServiceStub },
        { provide: ImageService, useClass: ImageServiceStub },
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
    fixture = TestBed.createComponent(SignupFormComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    component.signupForm = defaultForm;
    component.ngOnInit = jest.fn();
    component.toastService.presentToast = jest.fn();
    component.toastService.mediumDuration = 1500;
    component.modalCtrl.dismiss = jest.fn();
    component.errorReporter.handleUnhandledError = jest.fn();
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

  test('should dismiss modal without data', (): void => {
    component.modalCtrl.dismiss = jest.fn();
    const dismissSpy: jest.SpyInstance = jest.spyOn(component.modalCtrl, 'dismiss');

    fixture.detectChanges();

    component.dismiss();
    expect(dismissSpy).toHaveBeenCalled();
  });

  test('should init the form', (): void => {
    const _mockValidator: ValidatorFn = mockValidator();
    component.formValidator.passwordPattern = jest.fn()
      .mockReturnValue(_mockValidator);
    component.formValidator.passwordMatch = jest.fn()
      .mockReturnValue(_mockValidator);

    fixture.detectChanges();

    component.initForm();
    const form: FormGroup = component.signupForm;
    const usernameField: AbstractControl = form.controls.username;
    expect(usernameField).toBeDefined();
    const passwordField: AbstractControl = form.controls.password;
    expect(passwordField).toBeDefined();
    const passwordConfirmationField: AbstractControl = form.controls.passwordConfirmation;
    expect(passwordConfirmationField).toBeDefined();
    const emailField: AbstractControl = form.controls.email;
    expect(emailField).toBeDefined();
    const firstnameField: AbstractControl = form.controls.firstname;
    expect(firstnameField).toBeDefined();
    const lastnameField: AbstractControl = form.controls.lastname;
    expect(lastnameField).toBeDefined();
  });

  test('should handle image modal dismiss event', (): void => {
    fixture.detectChanges();

    const _defaultImage: Image = defaultImage();
    expect(component.userImage).toStrictEqual(_defaultImage);
    expect(component.breweryLabelImage).toStrictEqual(_defaultImage);
    const _mockImage1: Image = mockImage();
    _mockImage1.cid += '1';
    component.handleImageModalDismissEvent(_mockImage1, 'userImage');
    expect(component.userImage).toStrictEqual(_mockImage1);
    const _mockImage2: Image = mockImage();
    component.handleImageModalDismissEvent(_mockImage2, 'breweryLabelImage');
    expect(component.breweryLabelImage).toStrictEqual(_mockImage2);
  });

  test('should submit the form', (done: jest.DoneCallback): void => {
    const _mockImage1: Image = mockImage();
    _mockImage1.cid += '1';
    component.userImage = _mockImage1;
    const _mockImage2: Image = mockImage();
    component.breweryLabelImage = _mockImage2;
    const formValues: object = {
      username: 'testname',
      password: 'pass1234',
      passwordConfirmation: 'pass1234',
      email: 'email@email',
      firstname: 'testfirst',
      lastname: 'testlast'
    };
    const form: FormGroup = (new FormBuilder()).group(formValues);
    component.signupForm = form;
    let isDismissed: boolean = false;
    component.loadingService.createLoader = jest.fn()
      .mockReturnValue({ dismiss: (): void => { isDismissed = true } });
    component.userService.signUp = jest.fn()
      .mockReturnValue(of(null));
    const signupSpy: jest.SpyInstance = jest.spyOn(component.userService, 'signUp');
    component.dismiss = jest.fn();
    const dismissSpy: jest.SpyInstance = jest.spyOn(component, 'dismiss');
    const toastSpy: jest.SpyInstance = jest.spyOn(component.toastService, 'presentToast');

    fixture.detectChanges();

    component.onSubmit();
    expect(component.awaitingResponse).toBe(true);
    setTimeout((): void => {
      expect(signupSpy).toHaveBeenCalledWith({
        username: 'testname',
        password: 'pass1234',
        passwordConfirmation: 'pass1234',
        email: 'email@email',
        firstname: 'testfirst',
        lastname: 'testlast',
        userImage: _mockImage1,
        breweryLabelImage: _mockImage2
      });
      expect(toastSpy).toHaveBeenCalledWith(
        'Sign up complete!',
        component.toastService.mediumDuration,
        'middle',
        'toast-bright'
      );
      expect(dismissSpy).toHaveBeenCalled();
      expect(isDismissed).toBe(true);
      expect(component.awaitingResponse).toBe(false);
      done();
    }, 10);
  });

  test('should handle signup error', (done: jest.DoneCallback): void => {
    const _mockError: Error = new Error('test-error');
    let isDismissed: boolean = false;
    component.loadingService.createLoader = jest.fn()
      .mockReturnValue({ dismiss: (): void => { isDismissed = true } });
    component.dismiss = jest.fn();
    component.userService.signUp = jest.fn()
      .mockReturnValue(throwError(_mockError));
    const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

    fixture.detectChanges();

    component.onSubmit();
    expect(component.awaitingResponse).toBe(true);
    setTimeout((): void => {
      expect(errorSpy).toHaveBeenCalledWith(_mockError);
      expect(isDismissed).toBe(true);
      expect(component.awaitingResponse).toBe(false);
      done();
    }, 10);
  });

  test('should toggle password visibility', (): void => {
    component.passwordType = 'text';

    fixture.detectChanges();

    component.togglePasswordVisible(false);
    expect(component.passwordType).toMatch('password');
    component.togglePasswordVisible(true);
    expect(component.passwordType).toMatch('text');
  });

  test('should render the template', (): void => {
    component.ngOnInit = originalOnInit;
    component.formValidator.passwordPattern = jest.fn()
      .mockReturnValue((...options: any[]): { [key: string]: any } | null => { return null; });
    component.formValidator.passwordMatch = jest.fn()
      .mockReturnValue((...options: any[]): { [key: string]: any } | null => { return null; });

    fixture.detectChanges();

    const headerElem: Element = fixture.nativeElement.querySelector('header');
    expect(headerElem.textContent).toMatch('Sign Up');
    const inputElems: NodeList = fixture.nativeElement.querySelectorAll('app-form-input');
    const usernameElem: Element = <Element>inputElems.item(0);
    expect(usernameElem.getAttribute('label')).toMatch('username');
    const passwordElem: Element = <Element>inputElems.item(1);
    expect(passwordElem.getAttribute('label')).toMatch('password');
    const pConfirmationElem: Element = <Element>inputElems.item(2);
    expect(pConfirmationElem.getAttribute('label')).toMatch('confirm password');
    const emailElem: Element = <Element>inputElems.item(3);
    expect(emailElem.getAttribute('label')).toMatch('email');
    const firstElem: Element = <Element>inputElems.item(4);
    expect(firstElem.getAttribute('label')).toMatch('first name');
    const lastElem: Element = <Element>inputElems.item(5);
    expect(lastElem.getAttribute('label')).toMatch('last name');
    const checkboxElem: Element = fixture.nativeElement.querySelector('app-form-checkbox');
    expect(checkboxElem.getAttribute('label')).toMatch('show password');
    const imageElems: NodeList = fixture.nativeElement.querySelectorAll('app-form-image');
    const userImageElem: Element = <Element>imageElems.item(0);
    expect(userImageElem.getAttribute('label')).toMatch('user avatar');
    const breweryLabelImageElem: Element = <Element>imageElems.item(1);
    expect(breweryLabelImageElem.getAttribute('label')).toMatch('brewery label image');
    const formButtons: Element = fixture.nativeElement.querySelector('app-form-buttons');
    expect(formButtons).toBeTruthy();
  });

});
