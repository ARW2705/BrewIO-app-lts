/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, LoadingController, ModalController } from '@ionic/angular';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockUser, mockImage } from '../../../../../test-config/mock-models';
import { ImageServiceStub, ToastServiceStub, UserServiceStub } from '../../../../../test-config/service-stubs';
import { HeaderComponentStub } from '../../../../../test-config/component-stubs';
import { LoadingControllerStub, LoadingStub, ModalControllerStub, ModalStub } from '../../../../../test-config/ionic-stubs';

/* Default imports */
import { defaultImage } from '../../../shared/defaults/default-image';

/* Interface imports */
import { Image } from '../../../shared/interfaces/image';
import { User } from '../../../shared/interfaces/user';

/* Service imports */
import { FormValidationService } from '../../../services/form-validation/form-validation.service';
import { ImageService } from '../../../services/image/image.service';
import { ToastService } from '../../../services/toast/toast.service';
import { UserService } from '../../../services/user/user.service';

/* Page imports */
import { SignupPage } from './signup.page';


describe('SignupPage', (): void => {
  let fixture: ComponentFixture<SignupPage>;
  let signupPage: SignupPage;
  let originalOnInit: any;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        SignupPage,
        HeaderComponentStub,
      ],
      imports: [
        IonicModule,
        ReactiveFormsModule
      ],
      providers: [
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
    fixture = TestBed.createComponent(SignupPage);
    signupPage = fixture.componentInstance;
    originalOnInit = signupPage.ngOnInit;
    signupPage.ngOnInit = jest
      .fn();
    signupPage.toastService.presentToast = jest
      .fn();
    signupPage.toastService.presentErrorToast = jest
      .fn();
    signupPage.modalCtrl.dismiss = jest
      .fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(signupPage).toBeDefined();
  });

  test('should init the component', (): void => {
    signupPage.ngOnInit = originalOnInit;

    signupPage.initForm = jest
      .fn();

    const initSpy: jest.SpyInstance = jest.spyOn(signupPage, 'initForm');

    fixture.detectChanges();

    expect(initSpy).toHaveBeenCalled();
  });

  test('should dismiss modal without data', (): void => {
    signupPage.modalCtrl.dismiss = jest
      .fn();

    const dismissSpy: jest.SpyInstance = jest.spyOn(signupPage.modalCtrl, 'dismiss');

    fixture.detectChanges();

    signupPage.dismiss();

    expect(dismissSpy).toHaveBeenCalled();
  });

  test('should init the form', (): void => {
    fixture.detectChanges();

    signupPage.initForm();

    const form: FormGroup = signupPage.signupForm;

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

  test('should get image modal options', (): void => {
    const _mockUserImage: Image = mockImage();
    _mockUserImage.cid = 'user';

    const _mockBreweryImage: Image = mockImage();
    _mockBreweryImage.cid = 'brewery';

    signupPage.userImage = _mockUserImage;
    signupPage.breweryLabelImage = _mockBreweryImage;

    signupPage.imageService.hasDefaultImage = jest
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    fixture.detectChanges();

    const userOptions: object = signupPage.getImageModalOptions('user');
    expect(userOptions).toStrictEqual({ image: _mockUserImage });

    const userOptionsNull: object = signupPage.getImageModalOptions('user');
    expect(userOptionsNull).toBeNull();

    const breweryOptions: object = signupPage.getImageModalOptions('brewery');
    expect(breweryOptions).toStrictEqual({ image: _mockBreweryImage });

    const breweryOptionsNull: object = signupPage.getImageModalOptions('brewery');
    expect(breweryOptionsNull).toBeNull();
  });

  test('should handle image modal error', (): void => {
    const toastSpy: jest.SpyInstance = jest.spyOn(signupPage.toastService, 'presentErrorToast');
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    fixture.detectChanges();

    const errorHandler: (error: string) => void = signupPage.onImageModalError();
    errorHandler('test-error');

    expect(toastSpy).toHaveBeenCalledWith('Error selecting image');
    const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
    expect(consoleCalls[0]).toMatch('modal dismiss error');
    expect(consoleCalls[1]).toMatch('test-error');
  });

  test('should handle image modal success', (): void => {
    const _mockUserImage: Image = mockImage();
    _mockUserImage.cid = 'user';

    const _mockBreweryImage: Image = mockImage();
    _mockBreweryImage.cid = 'brewery';

    fixture.detectChanges();

    const userSuccessHandler: (data: object) => void = signupPage.onImageModalSuccess('user');
    userSuccessHandler({ data: _mockUserImage });
    expect(signupPage.userImage).toStrictEqual(_mockUserImage);

    const brewerySuccessHandler: (data: object) => void = signupPage.onImageModalSuccess('brewery');
    brewerySuccessHandler({ data: _mockBreweryImage });
    expect(signupPage.breweryLabelImage).toStrictEqual(_mockBreweryImage);

    const _defaultImage: Image = defaultImage();
    signupPage.userImage = _defaultImage;
    signupPage.breweryLabelImage = _defaultImage;

    fixture.detectChanges();

    const userEmptySuccessHandler: (data: object) => void = signupPage.onImageModalSuccess('user');
    userEmptySuccessHandler({});
    expect(signupPage.userImage).toStrictEqual(_defaultImage);

    const breweryEmptySuccessHandler: (data: object) => void = signupPage.onImageModalSuccess('brewery');
    breweryEmptySuccessHandler({});
    expect(signupPage.breweryLabelImage).toStrictEqual(_defaultImage);
  });

  test('should open image modal', (done: jest.DoneCallback): void => {
    const _stubModal: ModalStub = new ModalStub();

    signupPage.modalCtrl.create = jest
      .fn()
      .mockReturnValue(_stubModal);

    signupPage.getImageModalOptions = jest
      .fn()
      .mockReturnValue({});

    signupPage.onImageModalSuccess = jest
      .fn();

    _stubModal.onDidDismiss = jest
      .fn()
      .mockReturnValue(Promise.resolve());

    const successSpy: jest.SpyInstance = jest.spyOn(signupPage, 'onImageModalSuccess');

    fixture.detectChanges();

    signupPage.openImageModal('user');

    _stubModal.onDidDismiss();

    setTimeout((): void => {
      expect(successSpy).toHaveBeenCalledWith('user');
      done();
    }, 10);
  });

  test('should handle sign up', (done: jest.DoneCallback): void => {
    const _stubLoading: LoadingStub = new LoadingStub();
    const _mockUserImage: Image = mockImage();
    _mockUserImage.cid = 'user';
    const _mockBreweryImage: Image = mockImage();
    _mockBreweryImage.cid = 'brewery';

    signupPage.userImage = _mockUserImage;
    signupPage.breweryLabelImage = _mockBreweryImage;

    signupPage.loadingCtrl.create = jest
      .fn()
      .mockReturnValue(_stubLoading);

    signupPage.userService.signUp = jest
      .fn()
      .mockReturnValue(of(null));

    signupPage.dismiss = jest
      .fn();

    const formBuilder: FormBuilder = new FormBuilder();

    const signupSpy: jest.SpyInstance = jest.spyOn(signupPage.userService, 'signUp');
    const toastSpy: jest.SpyInstance = jest.spyOn(signupPage.toastService, 'presentToast');
    const dismissSpy: jest.SpyInstance = jest.spyOn(signupPage, 'dismiss');
    const loadingSpy: jest.SpyInstance = jest.spyOn(_stubLoading, 'dismiss');

    fixture.detectChanges();

    signupPage.signupForm = formBuilder.group({
      username: 'test-user',
      password: 'Password123!',
      passwordConfirmation: 'Password123!',
      email: 'email@email',
      firstname: 'first-name',
      lastname: 'last-name'
    });

    signupPage.onSubmit();

    setTimeout((): void => {
      expect(signupSpy).toHaveBeenCalledWith({
        username: 'test-user',
        password: 'Password123!',
        passwordConfirmation: 'Password123!',
        email: 'email@email',
        firstname: 'first-name',
        lastname: 'last-name',
        userImage: _mockUserImage,
        breweryLabelImage: _mockBreweryImage
      });
      expect(toastSpy).toHaveBeenCalledWith(
        'Sign up complete!',
        1500,
        'middle',
        'toast-bright'
      );
      expect(dismissSpy).toHaveBeenCalled();
      expect(loadingSpy).toHaveBeenCalled();
      done();
    }, 10);
  });

  test('should handle an error on submit', (done: jest.DoneCallback): void => {
    const _stubLoading: LoadingStub = new LoadingStub();
    const _defaultImage: Image = defaultImage();

    signupPage.loadingCtrl.create = jest
      .fn()
      .mockReturnValue(_stubLoading);

    signupPage.userService.signUp = jest
      .fn()
      .mockReturnValue(throwError('test-error'));

    signupPage.dismiss = jest
      .fn();

    signupPage.dismiss.bind = jest
      .fn()
      .mockImplementation((page: SignupPage) => page.dismiss);

    const formBuilder: FormBuilder = new FormBuilder();

    const signupSpy: jest.SpyInstance = jest.spyOn(signupPage.userService, 'signUp');
    const toastSpy: jest.SpyInstance = jest.spyOn(signupPage.toastService, 'presentErrorToast');
    const loadingSpy: jest.SpyInstance = jest.spyOn(_stubLoading, 'dismiss');

    fixture.detectChanges();

    signupPage.signupForm = formBuilder.group({
      username: 'test-user',
      password: 'Password123!',
      passwordConfirmation: 'Password123!',
      email: 'email@email',
      firstname: 'first-name',
      lastname: 'last-name'
    });

    signupPage.onSubmit();

    setTimeout((): void => {
      expect(signupSpy).toHaveBeenCalledWith({
        username: 'test-user',
        password: 'Password123!',
        passwordConfirmation: 'Password123!',
        email: 'email@email',
        firstname: 'first-name',
        lastname: 'last-name',
        userImage: _defaultImage,
        breweryLabelImage: _defaultImage
      });
      expect(toastSpy).toHaveBeenCalledWith(
        'test-error',
        signupPage.dismiss
      );
      expect(loadingSpy).toHaveBeenCalled();
      done();
    }, 10);
  });

  test('should toggle password visibility', (): void => {
    fixture.detectChanges();

    expect(signupPage.showPassword).toBe(false);

    signupPage.togglePasswordVisible();

    expect(signupPage.showPassword).toBe(true);

    signupPage.togglePasswordVisible();

    expect(signupPage.showPassword).toBe(false);
  });

  test('should render the template', (): void => {
    const _mockUserImage: Image = mockImage();
    _mockUserImage.url = 'user';
    const _mockBreweryImage: Image = mockImage();
    _mockBreweryImage.url = 'brewery';

    signupPage.userImage = _mockUserImage;
    signupPage.breweryLabelImage = _mockBreweryImage;

    const formBuilder: FormBuilder = new FormBuilder();
    signupPage.signupForm = formBuilder.group({
      username: '',
      password: '',
      passwordConfirmation: '',
      email: '',
      firstname: '',
      lastname: ''
    });

    fixture.detectChanges();

    const formItems: NodeList = fixture.nativeElement.querySelectorAll('ion-item');

    const usernameInput: HTMLElement = <HTMLElement>formItems.item(0);
    expect(usernameInput.children[0].textContent).toMatch('Username');
    expect(usernameInput.children[1].getAttribute('type')).toMatch('text');

    const passwordInput: HTMLElement = <HTMLElement>formItems.item(1);
    expect(passwordInput.children[0].textContent).toMatch('Password');
    expect(passwordInput.children[1].getAttribute('ng-reflect-type')).toMatch('password');

    const passwordConfirmationInput: HTMLElement = <HTMLElement>formItems.item(2);
    expect(passwordConfirmationInput.children[0].textContent).toMatch('Password');
    expect(passwordConfirmationInput.children[1].getAttribute('ng-reflect-type')).toMatch('password');

    signupPage.showPassword = true;

    fixture.detectChanges();

    const passwordShowInput: HTMLElement = <HTMLElement>formItems.item(1);
    expect(passwordShowInput.children[1].getAttribute('ng-reflect-type')).toMatch('text');

    const passwordConfirmationShowInput: HTMLElement = <HTMLElement>formItems.item(2);
    expect(passwordConfirmationShowInput.children[1].getAttribute('ng-reflect-type')).toMatch('text');

    const emailInput: HTMLElement = <HTMLElement>formItems.item(4);
    expect(emailInput.children[0].textContent).toMatch('Email');
    expect(emailInput.children[1].getAttribute('type')).toMatch('email');

    const userAvatarInput: HTMLElement = <HTMLElement>formItems.item(5);
    expect(userAvatarInput.children[0].textContent).toMatch('User Avatar');
    expect(userAvatarInput.children[1].children[0].children[0].getAttribute('src')).toMatch(_mockUserImage.url);

    const breweryImageInput: HTMLElement = <HTMLElement>formItems.item(6);
    expect(breweryImageInput.children[0].textContent).toMatch('Brewery Image');
    expect(breweryImageInput.children[1].children[0].children[0].getAttribute('src')).toMatch(_mockBreweryImage.url);

    const firstnameInput: HTMLElement = <HTMLElement>formItems.item(7);
    expect(firstnameInput.children[0].textContent).toMatch('First Name');
    expect(firstnameInput.children[1].getAttribute('type')).toMatch('text');

    const lastnameInput: HTMLElement = <HTMLElement>formItems.item(8);
    expect(lastnameInput.children[0].textContent).toMatch('Last Name');
    expect(lastnameInput.children[1].getAttribute('type')).toMatch('text');
  });

  test('should render control buttons', (): void => {
    signupPage.awaitingResponse = false;

    const formBuilder: FormBuilder = new FormBuilder();
    signupPage.signupForm = formBuilder.group({
      username: '',
      password: '',
      passwordConfirmation: '',
      email: '',
      firstname: '',
      lastname: ''
    });
    Object.defineProperty(signupPage.signupForm, 'valid', { writable: false, value: true });

    fixture.detectChanges();

    const grid: HTMLElement = fixture.nativeElement.querySelector('ion-grid');
    const buttons: NodeList = grid.querySelectorAll('ion-button');

    const cancelButtonValid: HTMLElement = <HTMLElement>buttons.item(0);
    expect(cancelButtonValid['disabled']).toBe(false);

    const submitButtonValid: HTMLElement = <HTMLElement>buttons.item(1);
    expect(submitButtonValid['disabled']).toBe(false);

    signupPage.awaitingResponse = true;

    fixture.detectChanges();

    const cancelButtonDisabled: HTMLElement = <HTMLElement>buttons.item(0);
    expect(cancelButtonDisabled['disabled']).toBe(true);

    const submitButtonDisabled: HTMLElement = <HTMLElement>buttons.item(1);
    expect(submitButtonDisabled['disabled']).toBe(true);
  });

});
