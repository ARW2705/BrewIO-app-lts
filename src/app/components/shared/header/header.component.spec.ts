/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockUser } from '../../../../../test-config/mock-models';
import { UserServiceStub } from '../../../../../test-config/service-stubs';

/* Interface imports */
import { User } from '../../../shared/interfaces';

/* Service Imports */
import { UserService } from '../../../services/services';

/* Component imports */
import { HeaderComponent } from './header.component';


describe('HeaderComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;
  let originalOnInit: any;
  let originalOnDestroy: any;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ HeaderComponent ],
      imports: [ RouterTestingModule ],
      providers: [
        { provide: UserService, useClass: UserServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(HeaderComponent);
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
    component.userService.getUser = jest.fn()
      .mockReturnValue(new BehaviorSubject<User>(_mockUser));
    component.userService.isLoggedIn = jest.fn()
      .mockReturnValue(true);
    component.ngOnInit = originalOnInit;

    fixture.detectChanges();

    expect(component.user).toStrictEqual(_mockUser);
    expect(component.isLoggedIn).toBe(true);
  });

  test('should destroy the component', (): void => {
    component.ngOnDestroy = originalOnDestroy;
    const nextSpy: jest.SpyInstance = jest.spyOn(component.destroy$, 'next');
    const completeSpy: jest.SpyInstance = jest.spyOn(component.destroy$, 'complete');

    fixture.detectChanges();

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(completeSpy).toHaveBeenCalled();
  });

  test('should handle go back click', (): void => {
    component.overrideBackButton = undefined;
    component.rootURL = 'url';
    component.router.navigate = jest.fn();
    const navSpy: jest.SpyInstance = jest.spyOn(component.router, 'navigate');

    fixture.detectChanges();

    component.goBack();
    expect(navSpy).toHaveBeenCalledWith(['url']);
    component.overrideBackButton = () => {};
    const overrideSpy: jest.SpyInstance = jest.spyOn(component, 'overrideBackButton');

    fixture.detectChanges();

    component.goBack();
    expect(overrideSpy).toHaveBeenCalled();
  });

  test('should render the template with a user logged in', (): void => {
    const _mockUser: User = mockUser();
    component.user = _mockUser;
    component.title = 'test-title';
    component.rootURL = 'url';

    fixture.detectChanges();

    const backButton: HTMLElement = fixture.nativeElement.querySelector('.back-button');
    expect(backButton.children[0].getAttribute('name')).toMatch('chevron-back-outline');
    const title: HTMLElement = fixture.nativeElement.querySelector('ion-title');
    expect(title.textContent).toMatch('Test-title');
    const userName: HTMLElement = fixture.nativeElement.querySelector('.login-header-text');
    expect(userName.children[1].textContent).toMatch(_mockUser.username);
  });

  test('should render the template without a user', (): void => {
    component.title = 'test-title';
    component.isLoggedIn = false;
    component.shouldHideLoginButton = false;

    fixture.detectChanges();

    const loginButton: HTMLElement = fixture.nativeElement.querySelector('app-login-signup-button');
    expect(loginButton).toBeTruthy();
  });

});
