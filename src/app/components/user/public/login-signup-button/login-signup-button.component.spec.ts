/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { ActionSheetServiceStub, ErrorReportingServiceStub, ModalServiceStub, UserServiceStub } from '../../../../../../test-config/service-stubs';

/* Services imports */
import { ActionSheetService, ErrorReportingService, ModalService, UserService } from '../../../../services/services';

/* Component imports */
import { LoginSignupButtonComponent } from './login-signup-button.component';
import { LoginFormComponent } from '../login-form/login-form.component';
import { SignupFormComponent } from '../signup-form/signup-form.component';


describe('LoginSignupButtonComponent', (): void => {
  configureTestBed();
  let component: LoginSignupButtonComponent;
  let fixture: ComponentFixture<LoginSignupButtonComponent>;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ LoginSignupButtonComponent ],
      providers: [
        { provide: ActionSheetService, useClass: ActionSheetServiceStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: ModalService, useClass: ModalServiceStub },
        { provide: UserService, useClass: UserServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(LoginSignupButtonComponent);
    component = fixture.componentInstance;
    component.errorReporter.handleUnhandledError = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  test('should open login modal', (): void => {
    component.modalService.openModal = jest.fn()
      .mockReturnValue(of(null));
    const modalSpy: jest.SpyInstance = jest.spyOn(component.modalService, 'openModal');

    fixture.detectChanges();

    component.openLogin();
    expect(modalSpy).toHaveBeenCalledWith(LoginFormComponent, {});
  });

  test('should handle login modal error', (done: jest.DoneCallback): void => {
    const _mockError: Error = new Error('test-error');
    component.modalService.openModal = jest.fn()
      .mockReturnValue(throwError(_mockError));
    const errorSpy: jest.SpyInstance =jest.spyOn(component.errorReporter, 'handleUnhandledError');

    fixture.detectChanges();

    component.openLogin();
    setTimeout((): void => {
      expect(errorSpy).toHaveBeenCalledWith(_mockError);
      done();
    }, 10);
  });

  test('should open signup modal', (): void => {
    component.modalService.openModal = jest.fn()
      .mockReturnValue(of(null));
    const modalSpy: jest.SpyInstance = jest.spyOn(component.modalService, 'openModal');

    fixture.detectChanges();

    component.openSignup();
    expect(modalSpy).toHaveBeenCalledWith(SignupFormComponent, {});
  });

  test('should handle signup modal error', (done: jest.DoneCallback): void => {
    const _mockError: Error = new Error('test-error');
    component.modalService.openModal = jest.fn()
      .mockReturnValue(throwError(_mockError));
    const errorSpy: jest.SpyInstance =jest.spyOn(component.errorReporter, 'handleUnhandledError');

    fixture.detectChanges();

    component.openSignup();
    setTimeout((): void => {
      expect(errorSpy).toHaveBeenCalledWith(_mockError);
      done();
    }, 10);
  });

  test('should open login/signup action sheet', (): void => {
    component.openLogin = jest.fn();
    const loginSpy: jest.SpyInstance = jest.spyOn(component, 'openLogin');
    component.openSignup = jest.fn();
    const signupSpy: jest.SpyInstance = jest.spyOn(component, 'openSignup');
    component.actionService.openActionSheet = jest.fn();
    const sheetSpy: jest.SpyInstance = jest.spyOn(component.actionService, 'openActionSheet');

    fixture.detectChanges();

    component.openActionSheet();
    const calls: any[] = sheetSpy.mock.calls[0];
    expect(calls[0]).toMatch('Log In or Sign Up');
    const buttons: { text: string, handler: () => void }[] = calls[1];
    expect(buttons[0].text).toMatch('Log In');
    buttons[0].handler();
    expect(loginSpy).toHaveBeenCalled();
    expect(buttons[1].text).toMatch('Sign Up');
    buttons[1].handler();
    expect(signupSpy).toHaveBeenCalled();
  });

  test('should render template as icon button', (): void => {
    component.isIconButton = true;

    fixture.detectChanges();

    const buttons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');
    expect(buttons.length).toEqual(1);
    const icon: Element = (<Element>buttons.item(0)).children[0];
    expect(icon.getAttribute('name')).toMatch('log-in-outline');
  });

  test('should render template as non-icon buttons', (): void => {
    component.isIconButton = false;

    fixture.detectChanges();

    const buttons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');
    expect(buttons.length).toEqual(2);
    expect(buttons.item(0).textContent).toMatch('Log In');
    expect(buttons.item(1).textContent).toMatch('Sign Up');
  });

});
