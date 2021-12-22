/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { ModalControllerStub } from '../../../../../../test-config/ionic-stubs';
import { AccordionComponentStub } from '../../../../../../test-config/component-stubs';
import { mockErrorReport } from '../../../../../../test-config/mock-models';

/* Interface imports */
import { ErrorReport } from '../../../../shared/interfaces';

/* component imports */
import { ErrorReportComponent } from './error-report.component';


describe('ErrorReportComponent', () => {
  let component: ErrorReportComponent;
  let fixture: ComponentFixture<ErrorReportComponent>;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        ErrorReportComponent,
        AccordionComponentStub
      ],
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
    fixture = TestBed.createComponent(ErrorReportComponent);
    component = fixture.componentInstance;
    component.modalCtrl.dismiss = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  test('should cancel the modal', (): void => {
    const dismissSpy: jest.SpyInstance = jest.spyOn(component.modalCtrl, 'dismiss');

    fixture.detectChanges();

    component.cancel();
    expect(dismissSpy).toHaveBeenCalledWith();
  });

  test('should submit error modal', (): void => {
    const dismissSpy: jest.SpyInstance = jest.spyOn(component.modalCtrl, 'dismiss');

    fixture.detectChanges();

    component.submitError();
    expect(dismissSpy).toHaveBeenCalledWith({ log: true });
  });

  test('should toggle error report visibilty', (): void => {
    fixture.detectChanges();

    component.showReports = false;
    component.toggleReports();
    expect(component.showReports).toBe(true);
    component.toggleReports();
    expect(component.showReports).toBe(false);
  });

  test('should render the template', (): void => {
    component.showReports = false;
    const _mockErrorReport: ErrorReport = mockErrorReport();
    component.reports = [ _mockErrorReport, _mockErrorReport ];

    fixture.detectChanges();

    const header: Element = fixture.nativeElement.querySelector('h2');
    expect(header.textContent).toMatch('System Errors');
    const buttons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');
    const expandButton: Element = <Element>buttons.item(0);
    expect(expandButton.textContent).toMatch('Show 2 Reports');
    const sendButton: Element = <Element>buttons.item(1);
    expect(sendButton.textContent).toMatch('Send And Continue');
    const cancelButton: Element = <Element>buttons.item(2);
    expect(cancelButton.textContent).toMatch('Continue Without Sending');
  });

});
