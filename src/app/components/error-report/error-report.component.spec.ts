/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { ModalControllerStub } from '../../../../test-config/ionic-stubs';
import { AccordionComponentStub } from '../../../../test-config/component-stubs';

/* Component imports */
import { ErrorReportComponent } from './error-report.component';


describe('ErrorReportComponent', () => {
  let reportCmp: ErrorReportComponent;
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
    reportCmp = fixture.componentInstance;
    reportCmp.modalCtrl.dismiss = jest
      .fn();
  });

  test('should create the component', (): void => {
    expect(reportCmp).toBeTruthy();
  });

  test('should cancel the modal', (): void => {
    const dismissSpy: jest.SpyInstance = jest.spyOn(reportCmp.modalCtrl, 'dismiss');

    fixture.detectChanges();

    reportCmp.cancel();

    expect(dismissSpy).toHaveBeenCalledWith();
  });

  test('should submit error modal', (): void => {
    const dismissSpy: jest.SpyInstance = jest.spyOn(reportCmp.modalCtrl, 'dismiss');

    fixture.detectChanges();

    reportCmp.submitError();

    expect(dismissSpy).toHaveBeenCalledWith({ log: true });
  });

  test('should toggle error report visibilty', (): void => {
    fixture.detectChanges();

    reportCmp.showReports = false;

    reportCmp.toggleReports();

    expect(reportCmp.showReports).toBe(true);

    reportCmp.toggleReports();

    expect(reportCmp.showReports).toBe(false);
  });

});
