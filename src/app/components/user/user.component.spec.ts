/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockUser } from '../../../../test-config/mock-models';
import { UserServiceStub } from '../../../../test-config/service-stubs';
import { ModalControllerStub, ModalStub } from '../../../../test-config/ionic-stubs';

/* Interface imports */
import { User } from '../../shared/interfaces/user';

/* Service imports */
import { UserService } from '../../services/user/user.service';

/* Page imports */
import { LoginPage } from '../../pages/forms/login/login.page';
import { SignupPage } from '../../pages/forms/signup/signup.page';

/* Component imoprts */
import { UserComponent } from './user.component';


describe('UserComponent', (): void => {
  let fixture: ComponentFixture<UserComponent>;
  let userCmp: UserComponent;
  let originalOnInit: any;
  let originalOnDestroy: any;
  configureTestBed();

  beforeEach((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ UserComponent ],
      imports: [ NoopAnimationsModule ],
      providers: [
        { provide: UserService, useClass: UserServiceStub },
        { provide: ModalController, useClass: ModalControllerStub }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(UserComponent);
    userCmp = fixture.componentInstance;
    originalOnInit = userCmp.ngOnInit;
    originalOnDestroy = userCmp.ngOnDestroy;
    userCmp.ngOnInit = jest
      .fn();
    userCmp.ngOnDestroy = jest
      .fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(userCmp).toBeDefined();
  });

  test('should init the component', (): void => {
    const _mockUser: User = mockUser();
    const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);

    userCmp.ngOnInit = originalOnInit;

    userCmp.userService.getUser = jest
      .fn()
      .mockReturnValue(_mockUser$);

    userCmp.userService.isLoggedIn = jest
      .fn()
      .mockReturnValue(true);

    fixture.detectChanges();

    userCmp.ngOnInit();

    expect(userCmp.isLoggedIn).toBe(true);
  });

  test('should handle destroying the component', (): void => {
    userCmp.ngOnDestroy = originalOnDestroy;

    const nextSpy: jest.SpyInstance = jest.spyOn(userCmp.destroy$, 'next');
    const completeSpy: jest.SpyInstance = jest.spyOn(userCmp.destroy$, 'complete');

    fixture.detectChanges();

    userCmp.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(completeSpy).toHaveBeenCalled();
  });

  test('should log out user', (): void => {
    userCmp.userService.logOut = jest
      .fn();

    const logoutSpy: jest.SpyInstance = jest.spyOn(userCmp.userService, 'logOut');

    fixture.detectChanges();

    userCmp.logOut();

    expect(logoutSpy).toHaveBeenCalled();
  });

  test('should open login modal', (done: jest.DoneCallback): void => {
    const _stubModal: ModalStub = new ModalStub();

    userCmp.modalCtrl.create = jest
      .fn()
      .mockReturnValue(_stubModal);

    _stubModal.present = jest
      .fn();

    const createSpy: jest.SpyInstance = jest.spyOn(userCmp.modalCtrl, 'create');
    const presentSpy: jest.SpyInstance = jest.spyOn(_stubModal, 'present');

    fixture.detectChanges();

    userCmp.openLogin();

    setTimeout((): void => {
      expect(createSpy).toHaveBeenCalledWith({ component: LoginPage });
      expect(presentSpy).toHaveBeenCalled();
      done();
    }, 10);
  });

  test('should open signup modal', (done: jest.DoneCallback): void => {
    const _stubModal: ModalStub = new ModalStub();

    userCmp.modalCtrl.create = jest
      .fn()
      .mockReturnValue(_stubModal);

    _stubModal.present = jest
      .fn();

    const createSpy: jest.SpyInstance = jest.spyOn(userCmp.modalCtrl, 'create');
    const presentSpy: jest.SpyInstance = jest.spyOn(_stubModal, 'present');

    fixture.detectChanges();

    userCmp.openSignup();

    setTimeout((): void => {
      expect(createSpy).toHaveBeenCalledWith({ component: SignupPage });
      expect(presentSpy).toHaveBeenCalled();
      done();
    }, 10);
  });

  test('should toggle expand content section', (): void => {
    fixture.detectChanges();

    expect(userCmp.expandedContent.length).toEqual(0);

    userCmp.toggleExpandContent('profile');

    expect(userCmp.expandedContent).toMatch('profile');

    userCmp.toggleExpandContent('profile');

    expect(userCmp.expandedContent.length).toEqual(0);
  });

  test('should render the template with user not logged in', (): void => {
    fixture.detectChanges();

    const componentList: HTMLElement = fixture.nativeElement.querySelector('ion-list');
    expect(componentList).toBeNull();

    const buttons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');
    expect(buttons.length).toEqual(2);
    expect(buttons.item(0).textContent).toMatch('Log In');
    expect(buttons.item(1).textContent).toMatch('Sign Up');
  });

  test('should render the template with user logged in', (): void => {
    userCmp.isLoggedIn = true;
    userCmp.expandedContent = 'profile';

    fixture.detectChanges();

    const componentList: HTMLElement = fixture.nativeElement.querySelector('ion-list');
    expect(componentList.children.length).toEqual(4);

    const profileLabel: Element = componentList.children[0].children[0];
    expect(profileLabel.textContent).toMatch('Profile');

    const profileCmpContainer: Element = componentList.children[1];
    expect(profileCmpContainer['expanded']).toBe(true);
    const profileCmp: Element = profileCmpContainer.children[0];
    expect(profileCmp).not.toBeNull();

    const friendsLabel: Element = componentList.children[2].children[0];
    expect(friendsLabel.textContent).toMatch('Friends');

    const friendsCmpContainer: Element = componentList.children[3];
    expect(friendsCmpContainer['expanded']).toBe(false);
    const friendsCmp: Element = friendsCmpContainer.children[0];
    expect(friendsCmp).not.toBeNull();

    const buttons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');
    const logoutButton: HTMLElement = <HTMLElement>buttons.item(buttons.length - 1);
    expect(logoutButton.textContent).toMatch('Log Out');
  });

});
