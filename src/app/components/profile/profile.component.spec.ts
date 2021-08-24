/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ModalController } from '@ionic/angular';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockImage, mockUser } from '../../../../test-config/mock-models';
import { ErrorReportingServiceStub, ImageServiceStub, UserServiceStub, ToastServiceStub } from '../../../../test-config/service-stubs';
import { ModalControllerStub, ModalStub } from '../../../../test-config/ionic-stubs';

/* Default imports */
import { defaultImage } from '../../shared/defaults';

/* Interface imports */
import { Image, User } from '../../shared/interfaces';

/* Service imports */
import { ErrorReportingService, ImageService, ToastService, UserService } from '../../services/services';

/* Component imports */
import { ProfileComponent } from './profile.component';


describe('ProfileComponent', (): void => {
  let fixture: ComponentFixture<ProfileComponent>;
  let component: ProfileComponent;
  let originalOnInit: any;
  let originalOnDestroy: any;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        ProfileComponent
      ],
      imports: [
        IonicModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: ModalController, useClass: ModalControllerStub },
        { provide: ImageService, useClass: ImageServiceStub },
        { provide: ToastService, useClass: ToastServiceStub },
        { provide: UserService, useClass: UserServiceStub }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    originalOnDestroy = component.ngOnDestroy;
    component.ngOnInit = jest
      .fn();
    component.ngOnDestroy = jest
      .fn();
    component.errorReporter.handleUnhandledError = jest
      .fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  describe('Lifecycle', (): void => {

    test('should init the component', (done: jest.DoneCallback): void => {
      const _mockUser: User = mockUser();
      const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);

      component.ngOnInit = originalOnInit;

      component.initForm = jest
        .fn();

      component.userService.isLoggedIn = jest
        .fn()
        .mockReturnValue(true);

      component.userService.getUser = jest
        .fn()
        .mockReturnValue(_mockUser$);

      fixture.detectChanges();

      component.ngOnInit();

      setTimeout((): void => {
        expect(component.user).toStrictEqual(_mockUser);
        expect(component.isLoggedIn).toBe(true);
        done();
      }, 10);
    });

    test('should get an error on component init', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      component.ngOnInit = originalOnInit;

      component.userService.getUser = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      component.ngOnInit();

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should handle component destroy', (): void => {
      const nextSpy: jest.SpyInstance = jest.spyOn(component.destroy$, 'next');
      const completeSpy: jest.SpyInstance = jest.spyOn(component.destroy$, 'complete');

      component.ngOnDestroy = originalOnDestroy;

      fixture.detectChanges();

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalledWith(true);
      expect(completeSpy).toHaveBeenCalled();
    });

  });


  describe('Form Methods', (): void => {

    test('should init the form with values', (): void => {
      const _mockUser: User = mockUser();

      fixture.detectChanges();

      component.initForm(_mockUser);

      const formWithValues: object = component.userForm.value;
      expect(formWithValues['email']).toMatch(_mockUser.email);
      expect(formWithValues['firstname']).toMatch(_mockUser.firstname);
      expect(formWithValues['lastname']).toMatch(_mockUser.lastname);
      expect(component.userImage).toStrictEqual(_mockUser.userImage);
      expect(component.breweryLabelImage).toStrictEqual(_mockUser.breweryLabelImage);

      delete _mockUser.email;
      delete _mockUser.firstname;
      delete _mockUser.lastname;
      delete _mockUser.userImage;
      delete _mockUser.breweryLabelImage;
      component.userImage = null;
      component.breweryLabelImage = null;
    });

    test('should init the form with values', (): void => {
      const _mockUser: User = mockUser();
      const _defaultImage: Image = defaultImage();

      delete _mockUser.email;
      delete _mockUser.firstname;
      delete _mockUser.lastname;
      delete _mockUser.userImage;
      delete _mockUser.breweryLabelImage;

      fixture.detectChanges();

      component.initForm(_mockUser);

      const formWithOutValues: object = component.userForm.value;
      expect(formWithOutValues['email'].length).toEqual(0);
      expect(formWithOutValues['firstname'].length).toEqual(0);
      expect(formWithOutValues['lastname'].length).toEqual(0);
      expect(component.userImage).toStrictEqual(_defaultImage);
      expect(component.breweryLabelImage).toStrictEqual(_defaultImage);
    });

    test('should handle image selection event', (): void => {
      const _mockImage: Image = mockImage();
      const _defaultImage: Image = defaultImage();
      component.userImage = _defaultImage;
      component.breweryLabelImage = _defaultImage;

      fixture.detectChanges();

      component.onImageSelection('userImage', _mockImage);
      expect(component.userImage).toStrictEqual(_mockImage);
      component.onImageSelection('breweryLabelImage', _mockImage);
      expect(component.breweryLabelImage).toStrictEqual(_mockImage);
    });

    test('should handle a profile update', (done: jest.DoneCallback): void => {
      const _mockImage: Image = mockImage();

      component.userForm = new FormGroup({
        email: new FormControl('test@email'),
        firstname: new FormControl('testfirst'),
        lastname: new FormControl('testlast'),
        userImage: new FormControl(_mockImage),
        breweryLabelImage: new FormControl(_mockImage)
      });

      component.imageService.hasDefaultImage = jest.fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);

      component.userService.updateUserProfile = jest.fn()
        .mockReturnValue(of({}));

      component.toastService.presentToast = jest.fn();

      const toastSpy: jest.SpyInstance = jest.spyOn(component.toastService, 'presentToast');

      fixture.detectChanges();

      component.onUpdate();

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith('Profile Updated', 1000);
        done();
      }, 10);
    });

    test('should get an error updating profile', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      component.userForm = new FormGroup({});

      component.imageService.hasDefaultImage = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true);

      component.userService.updateUserProfile = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      component.onUpdate();

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

  });


  describe('Template Rendering', (): void => {

    test('should render template without a user logged in', (): void => {
      fixture.detectChanges();

      const container: HTMLElement = fixture.nativeElement.querySelector('ion-grid');
      expect(container).toBeNull();

      const content: NodeList = fixture.nativeElement.querySelectorAll('ion-row');
      expect(content.length).toEqual(0);
    });

    test('should render template with a user logged in', (): void => {
      const _mockImage1: Image = mockImage();
      const _mockImage2: Image = mockImage();
      _mockImage2.url = 'other-url';
      const _mockUser: User = mockUser();

      component.user = _mockUser;
      component.isLoggedIn = true;
      component.userImage = _mockImage1;
      component.breweryLabelImage = _mockImage2;
      component.userForm = new FormGroup({
        email: new FormControl('test@email'),
        firstname: new FormControl('testfirst'),
        lastname: new FormControl('testlast')
      });

      fixture.detectChanges();

      const inputs: NodeList = fixture.nativeElement.querySelectorAll('app-form-input');
      const email: HTMLElement = <HTMLElement>inputs.item(0);
      console.log('EMAIL', email.getAttribute('controlName'));
      expect(email.getAttribute('controlName')).toMatch('email');
      const firstName: HTMLElement = <HTMLElement>inputs.item(1);
      expect(firstName.getAttribute('controlName')).toMatch('firstname');
      const lastName: HTMLElement = <HTMLElement>inputs.item(2);
      expect(lastName.getAttribute('controlName')).toMatch('lastname');
      const images: NodeList = fixture.nativeElement.querySelectorAll('app-form-image');
      const userImage: HTMLElement = <HTMLElement>images.item(0);
      expect(userImage.getAttribute('label')).toMatch('user avatar');
      const breweryImage: HTMLElement = <HTMLElement>images.item(1);
      expect(breweryImage.getAttribute('label')).toMatch('brewery image');
      const updateButton: HTMLElement = fixture.nativeElement.querySelector('.user-button-container');
      expect(updateButton.children[0].textContent).toMatch('Update Profile');
    });

  });

});
