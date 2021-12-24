/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockUser } from '@test/mock-models';
import { UserServiceStub } from '@test/service-stubs';
import { ModalControllerStub } from '@test/ionic-stubs';

/* Interface imports */
import { User } from '@shared/interfaces';

/* Service imports */
import { UserService } from '@services/user/user.service';

/* Component imoprts */
import { UserComponent } from './user.component';


describe('UserComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<UserComponent>;
  let component: UserComponent;
  let originalOnInit: () => void;
  let originalOnDestroy: () => void;

  beforeEach((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ UserComponent ],
      imports: [ NoopAnimationsModule ],
      providers: [
        { provide: UserService, useClass: UserServiceStub },
        { provide: ModalController, useClass: ModalControllerStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    originalOnDestroy = component.ngOnDestroy;
    component.ngOnInit = jest.fn();
    component.ngOnDestroy = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  test('should init the component', (): void => {
    const _mockUser: User = mockUser();
    const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);
    component.ngOnInit = originalOnInit;
    component.userService.getUser = jest.fn()
      .mockReturnValue(_mockUser$);
    component.userService.isLoggedIn = jest.fn()
      .mockReturnValue(true);

    fixture.detectChanges();

    component.ngOnInit();
    expect(component.isLoggedIn).toBe(true);
  });

  test('should handle destroying the component', (): void => {
    component.ngOnDestroy = originalOnDestroy;
    const nextSpy: jest.SpyInstance = jest.spyOn(component.destroy$, 'next');
    const completeSpy: jest.SpyInstance = jest.spyOn(component.destroy$, 'complete');

    fixture.detectChanges();

    component.ngOnDestroy();
    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(completeSpy).toHaveBeenCalled();
  });

  test('should call logout method', (): void => {
    component.userService.logOut = jest.fn();
    const logoutSpy: jest.SpyInstance = jest.spyOn(component.userService, 'logOut');

    fixture.detectChanges();

    component.logOut();
    expect(logoutSpy).toHaveBeenCalled();
  });

  test('should toggle expanded content', (): void => {
    fixture.detectChanges();

    component.toggleExpandContent('friends');
    expect(component.expandedContent).toMatch('friends');
    component.toggleExpandContent('profile');
    expect(component.expandedContent).toMatch('profile');
    component.toggleExpandContent('profile');
    expect(component.expandedContent.length).toEqual(0);
  });

  test('should render the template while logged out', (): void => {
    component.isLoggedIn = false;

    fixture.detectChanges();

    const message: Element = fixture.nativeElement.querySelector('span');
    expect(message.textContent).toMatch('Log In or Sign Up to view more options');
    const loginButton: Element = fixture.nativeElement.querySelector('app-login-signup-button');
    expect(loginButton).toBeTruthy();
  });

  test('should render the template while logged in', (): void => {
    component.isLoggedIn = true;

    fixture.detectChanges();

    const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');
    const profileItem: Element = <Element>items.item(0);
    expect(profileItem.children[0].textContent).toMatch('Profile');
    const friendsItem: Element = <Element>items.item(1);
    expect(friendsItem.children[0].textContent).toMatch('Friends');
    const accordions: NodeList = fixture.nativeElement.querySelectorAll('app-accordion');
    expect(accordions.length).toEqual(2);
    const logoutButton: Element = fixture.nativeElement.querySelector('ion-button');
    expect(logoutButton.textContent).toMatch('Log Out');
  });

});
