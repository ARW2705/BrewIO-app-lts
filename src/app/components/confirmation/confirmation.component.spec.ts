/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { ModalControllerStub } from '../../../../test-config/ionic-stubs';

/* Component imports */
import { ConfirmationComponent } from './confirmation.component';


describe('ConfirmationComponent', (): void => {
  let fixture: ComponentFixture<ConfirmationComponent>;
  let confirmCmp: ConfirmationComponent;
  configureTestBed();

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
    confirmCmp = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(confirmCmp).toBeDefined();
  });

  test('should assign back click handler', (): void => {
    fixture.detectChanges();

    expect(confirmCmp.onBackClick).toBeDefined();
  });

  test('should dismiss the modal with a result', (): void => {
    confirmCmp.modalCtrl.dismiss = jest
      .fn();

    const dismissSpy: jest.SpyInstance = jest.spyOn(confirmCmp.modalCtrl, 'dismiss');

    fixture.detectChanges();

    confirmCmp.submit(true);

    expect(dismissSpy).toHaveBeenCalledWith(true);
  });

  test('should render the template', (): void => {
    confirmCmp.message = 'test message';
    confirmCmp.subMessage = 'test sub message';

    fixture.detectChanges();

    const message: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(message.textContent).toMatch('test message');

    const buttons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');
    expect(buttons.item(0).textContent).toMatch('Cancel');
    expect(buttons.item(1).textContent).toMatch('Confirm');

    const subMessage: HTMLElement = fixture.nativeElement.querySelector('#sub-message');
    expect(subMessage.textContent).toMatch('test sub message');
  });

});
