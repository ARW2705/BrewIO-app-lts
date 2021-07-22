/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { ModalControllerStub } from '../../../../test-config/ionic-stubs';
import { AccordionComponentStub } from '../../../../test-config/component-stubs';

/* Page imports */
import { ErrorReportPage } from './error-report.page';


describe('ErrorReportPage', () => {
  let reportPage: ErrorReportPage;
  let fixture: ComponentFixture<ErrorReportPage>;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        ErrorReportPage,
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
    fixture = TestBed.createComponent(ErrorReportPage);
    reportPage = fixture.componentInstance;
    reportPage.modalCtrl.dismiss = jest
      .fn();
  });

  test('should create the component', (): void => {
    expect(reportPage).toBeTruthy();
  });

  test('should cancel the modal', (): void => {
    const dismissSpy: jest.SpyInstance = jest.spyOn(reportPage.modalCtrl, 'dismiss');

    fixture.detectChanges();

    reportPage.cancel();

    expect(dismissSpy).toHaveBeenCalledWith();
  });

  test('should submit error modal', (): void => {
    const dismissSpy: jest.SpyInstance = jest.spyOn(reportPage.modalCtrl, 'dismiss');

    fixture.detectChanges();

    reportPage.submitError();

    expect(dismissSpy).toHaveBeenCalledWith({ log: true });
  });

  test('should toggle error report visibilty', (): void => {
    fixture.detectChanges();

    reportPage.showReports = false;

    reportPage.toggleReports();

    expect(reportPage.showReports).toBe(true);

    reportPage.toggleReports();

    expect(reportPage.showReports).toBe(false);
  });

});
