/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { ModalControllerStub } from '@test/ionic-stubs';

/* Page imports */
import { ConfirmationComponent } from './confirmation.component';


describe('ConfirmationComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<ConfirmationComponent>;
  let component: ConfirmationComponent;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmationComponent ],
      providers: [
        { provide: ModalController, useClass: ModalControllerStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ConfirmationComponent);
    component = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  test('should dismiss the modal with a result', (): void => {
    component.modalCtrl.dismiss = jest.fn();
    const dismissSpy: jest.SpyInstance = jest.spyOn(component.modalCtrl, 'dismiss');

    fixture.detectChanges();

    component.submit(true);
    expect(dismissSpy).toHaveBeenCalledWith(true);
  });

  test('should render the template', (): void => {
    component.message = 'test message';
    component.subMessage = 'test sub message';

    fixture.detectChanges();

    const message: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(message.textContent).toMatch('test message');
    const buttons: HTMLElement = fixture.nativeElement.querySelector('app-form-buttons');
    expect(buttons).toBeDefined();
    const subMessage: HTMLElement = fixture.nativeElement.querySelector('#sub-message');
    expect(subMessage.textContent).toMatch('test sub message');
  });

});
