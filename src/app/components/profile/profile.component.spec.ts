/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ModalController } from '@ionic/angular';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockImage, mockUser } from '../../../../test-config/mock-models';
import { ImageServiceStub, UserServiceStub, ToastServiceStub } from '../../../../test-config/service-stubs';
import { ModalControllerStub, ModalStub } from '../../../../test-config/ionic-stubs';

/* Default imports */
import { defaultImage } from '../../shared/defaults/default-image';

/* Interface imports */
import { Image } from '../../shared/interfaces/image';
import { User } from '../../shared/interfaces/user';

/* Service imports */
import { ImageService } from '../../services/image/image.service';
import { UserService } from '../../services/user/user.service';
import { ToastService } from '../../services/toast/toast.service';

/* Component imports */
import { ProfileComponent } from './profile.component';


describe('ProfileComponent', (): void => {
  let fixture: ComponentFixture<ProfileComponent>;
  let profileCmp: ProfileComponent;
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
    profileCmp = fixture.componentInstance;
    originalOnInit = profileCmp.ngOnInit;
    originalOnDestroy = profileCmp.ngOnDestroy;
    profileCmp.ngOnInit = jest
      .fn();
    profileCmp.ngOnDestroy = jest
      .fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(profileCmp).toBeDefined();
  });

  describe('Lifecycle', (): void => {

    test('should init the component', (done: jest.DoneCallback): void => {
      const _mockUser: User = mockUser();
      const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);

      profileCmp.ngOnInit = originalOnInit;

      profileCmp.initForm = jest
        .fn();

      profileCmp.userService.isLoggedIn = jest
        .fn()
        .mockReturnValue(true);

      profileCmp.userService.getUser = jest
        .fn()
        .mockReturnValue(_mockUser$);

      fixture.detectChanges();

      profileCmp.ngOnInit();

      setTimeout((): void => {
        expect(profileCmp.user).toStrictEqual(_mockUser);
        expect(profileCmp.isLoggedIn).toBe(true);
        done();
      }, 10);
    });

    test('should get an error on component init', (done: jest.DoneCallback): void => {
      profileCmp.ngOnInit = originalOnInit;

      profileCmp.userService.getUser = jest
        .fn()
        .mockReturnValue(throwError('test-error'));

      const toastSpy: jest.SpyInstance = jest.spyOn(profileCmp.toastService, 'presentErrorToast');

      fixture.detectChanges();

      profileCmp.ngOnInit();

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith('Error getting profile');
        done();
      }, 10);
    });

    test('should handle component destroy', (): void => {
      const nextSpy: jest.SpyInstance = jest.spyOn(profileCmp.destroy$, 'next');
      const completeSpy: jest.SpyInstance = jest.spyOn(profileCmp.destroy$, 'complete');

      profileCmp.ngOnDestroy = originalOnDestroy;

      fixture.detectChanges();

      profileCmp.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalledWith(true);
      expect(completeSpy).toHaveBeenCalled();
    });

  });


  describe('Form Methods', (): void => {

    test('should get image modal options', (): void => {
      const _mockImage1: Image = mockImage();
      const _mockImage2: Image = mockImage();
      _mockImage2.url = 'other-url';

      profileCmp.imageService.hasDefaultImage = jest
        .fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      profileCmp.userImage = _mockImage1;
      profileCmp.breweryLabelImage = _mockImage2;

      fixture.detectChanges();

      expect(profileCmp.getImageModalOptions('user')).toStrictEqual({ image: _mockImage1 });
      expect(profileCmp.getImageModalOptions('brewery')).toStrictEqual({ image: _mockImage2 });
      expect(profileCmp.getImageModalOptions('user')).toBeNull();
      expect(profileCmp.getImageModalOptions('invalid')).toBeNull();
    });

    test('should init the form with values', (): void => {
      const _mockUser: User = mockUser();

      fixture.detectChanges();

      profileCmp.initForm(_mockUser);

      const formWithValues: object = profileCmp.userForm.value;
      expect(formWithValues['email']).toMatch(_mockUser.email);
      expect(formWithValues['firstname']).toMatch(_mockUser.firstname);
      expect(formWithValues['lastname']).toMatch(_mockUser.lastname);
      expect(profileCmp.userImage).toStrictEqual(_mockUser.userImage);
      expect(profileCmp.breweryLabelImage).toStrictEqual(_mockUser.breweryLabelImage);

      delete _mockUser.email;
      delete _mockUser.firstname;
      delete _mockUser.lastname;
      delete _mockUser.userImage;
      delete _mockUser.breweryLabelImage;
      profileCmp.userImage = null;
      profileCmp.breweryLabelImage = null;
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

      profileCmp.initForm(_mockUser);

      const formWithOutValues: object = profileCmp.userForm.value;
      expect(formWithOutValues['email'].length).toEqual(0);
      expect(formWithOutValues['firstname'].length).toEqual(0);
      expect(formWithOutValues['lastname'].length).toEqual(0);
      expect(profileCmp.userImage).toStrictEqual(_defaultImage);
      expect(profileCmp.breweryLabelImage).toStrictEqual(_defaultImage);
    });

    test('should handle image modal error', (): void => {
      const toastSpy: jest.SpyInstance = jest.spyOn(profileCmp.toastService, 'presentErrorToast');

      fixture.detectChanges();

      const errorHandler: (error: string) => void = profileCmp.onImageModalError();
      errorHandler('test-error');

      expect(toastSpy).toHaveBeenCalledWith('Error selecting image');
    });

    test('should hanlde image modal success', (): void => {
      const _defaultImage: Image = defaultImage();
      const _mockImage1: Image = mockImage();
      const _mockImage2: Image = mockImage();
      _mockImage2.url = 'other-url';

      fixture.detectChanges();

      expect(profileCmp.userImage).toStrictEqual(_defaultImage);
      expect(profileCmp.breweryLabelImage).toStrictEqual(_defaultImage);

      const userHandler: (data: object) => void = profileCmp.onImageModalSuccess('user');
      const breweryHandler: (data: object) => void = profileCmp.onImageModalSuccess('brewery');
      const invalidHandler: (data: object) => void = profileCmp.onImageModalSuccess('invalid');
      const noneHandler: (data: object) => void = profileCmp.onImageModalSuccess('user');

      userHandler({ data: _mockImage1 });
      expect(profileCmp.userImage).toStrictEqual(_mockImage1);

      breweryHandler({ data: _mockImage1 });
      expect(profileCmp.breweryLabelImage).toStrictEqual(_mockImage1);

      invalidHandler({ data: _mockImage2 });
      expect(profileCmp.userImage).toStrictEqual(_mockImage1);
      expect(profileCmp.breweryLabelImage).toStrictEqual(_mockImage1);

      noneHandler({ other: _mockImage2 });
      expect(profileCmp.userImage).toStrictEqual(_mockImage1);
      expect(profileCmp.breweryLabelImage).toStrictEqual(_mockImage1);
    });

    test('should open the image modal', (done: jest.DoneCallback): void => {
      const _stubModal: ModalStub = new ModalStub();

      profileCmp.modalCtrl.create = jest
        .fn()
        .mockReturnValue(_stubModal);

      _stubModal.present = jest
        .fn();

      _stubModal.onDidDismiss = jest
        .fn()
        .mockReturnValueOnce(Promise.resolve())
        .mockReturnValueOnce(Promise.reject());

      profileCmp.onImageModalSuccess = jest
        .fn()
        .mockReturnValue((): void => {});

      profileCmp.onImageModalError = jest
        .fn()
        .mockReturnValue((): void => {});

      const successSpy: jest.SpyInstance = jest.spyOn(profileCmp, 'onImageModalSuccess');
      const errorSpy: jest.SpyInstance = jest.spyOn(profileCmp, 'onImageModalError');

      fixture.detectChanges();

      profileCmp.openImageModal('user');

      setTimeout((): void => {
        expect(successSpy).toHaveBeenCalledWith('user');
        expect(errorSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should handle a profile update', (done: jest.DoneCallback): void => {
      const _mockImage: Image = mockImage();

      profileCmp.userForm = new FormGroup({
        email: new FormControl('test@email'),
        firstname: new FormControl('testfirst'),
        lastname: new FormControl('testlast'),
        userImage: new FormControl(_mockImage),
        breweryLabelImage: new FormControl(_mockImage)
      });

      profileCmp.imageService.hasDefaultImage = jest
        .fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);

      profileCmp.userService.updateUserProfile = jest
        .fn()
        .mockReturnValue(of({}));

      profileCmp.toastService.presentToast = jest
        .fn();

      const toastSpy: jest.SpyInstance = jest.spyOn(profileCmp.toastService, 'presentToast');

      fixture.detectChanges();

      profileCmp.onUpdate();

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith('Profile Updated', 1000);
        done();
      }, 10);
    });

    test('should get an error updating profile', (done: jest.DoneCallback): void => {
      profileCmp.userForm = new FormGroup({});

      profileCmp.imageService.hasDefaultImage = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true);

      profileCmp.userService.updateUserProfile = jest
        .fn()
        .mockReturnValue(throwError('test-error'));

      const toastSpy: jest.SpyInstance = jest.spyOn(profileCmp.toastService, 'presentErrorToast');

      fixture.detectChanges();

      profileCmp.onUpdate();

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith('Error updating profile');
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

      profileCmp.user = _mockUser;
      profileCmp.isLoggedIn = true;
      profileCmp.userImage = _mockImage1;
      profileCmp.breweryLabelImage = _mockImage2;
      profileCmp.userForm = new FormGroup({
        email: new FormControl('test@email'),
        firstname: new FormControl('testfirst'),
        lastname: new FormControl('testlast')
      });

      fixture.detectChanges();

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');

      const email: HTMLElement = <HTMLElement>items.item(0);
      expect(email.children[0].textContent).toMatch('Email');
      expect(email.children[1]['value']).toMatch('test@email');

      const firstName: HTMLElement = <HTMLElement>items.item(1);
      expect(firstName.children[0].textContent).toMatch('First Name');
      expect(firstName.children[1]['value']).toMatch('testfirst');

      const lastName: HTMLElement = <HTMLElement>items.item(2);
      expect(lastName.children[0].textContent).toMatch('Last Name');
      expect(lastName.children[1]['value']).toMatch('testlast');

      const userImage: HTMLElement = <HTMLElement>items.item(3);
      expect(userImage.children[0].textContent).toMatch('User Avatar');
      expect(userImage.children[1].children[0].children[0]['src']).toMatch(_mockImage1.url);

      const breweryImage: HTMLElement = <HTMLElement>items.item(4);
      expect(breweryImage.children[0].textContent).toMatch('Brewery Image');

      const updateButton: HTMLElement = fixture.nativeElement.querySelector('.user-button-container');
      expect(updateButton.children[0].textContent).toMatch('Update Profile');
    });

  });

});
