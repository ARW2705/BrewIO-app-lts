/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { ModalControllerStub } from '../../../../test-config/ionic-stubs';

/* Page imports */
import { ConfirmationPage } from './confirmation.page';


describe('ConfirmationPage', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<ConfirmationPage>;
  let page: ConfirmationPage;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmationPage ],
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
    fixture = TestBed.createComponent(ConfirmationPage);
    page = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(page).toBeDefined();
  });

  test('should assign back click handler', (): void => {
    fixture.detectChanges();

    expect(page.onBackClick).toBeDefined();
  });

  test('should dismiss the modal with a result', (): void => {
    page.modalCtrl.dismiss = jest.fn();
    const dismissSpy: jest.SpyInstance = jest.spyOn(page.modalCtrl, 'dismiss');

    fixture.detectChanges();

    page.submit(true);
    expect(dismissSpy).toHaveBeenCalledWith(true);
  });

  test('should render the template', (): void => {
    page.message = 'test message';
    page.subMessage = 'test sub message';

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
