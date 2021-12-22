/* Module imports */
import { async, getTestBed, TestBed } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockAlert, mockBatch } from '../../../../test-config/mock-models';

/* Interface imports */
import { Alert, Batch } from '../../shared/interfaces';

/* Service imports */
import { CalendarAlertService } from './calendar-alert.service';


describe('CalendarAlertService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: CalendarAlertService;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [ CalendarAlertService ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(CalendarAlertService);
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  test('should remove alerts from batch process for the current step', (): void => {
    const _mockBatch: Batch = mockBatch();
    const calendarIndex: number = 13;
    _mockBatch.process.currentStep = calendarIndex;
    const _mockAlertToRemain: Alert = mockAlert();
    _mockAlertToRemain.title = _mockBatch.process.schedule[0].name;
    const _mockAlertToClear: Alert = mockAlert();
    _mockAlertToClear.title = _mockBatch.process.schedule[calendarIndex].name;
    _mockBatch.process.alerts = [ _mockAlertToRemain, _mockAlertToClear, _mockAlertToClear ];

    service.clearAlertsForCurrentStep(_mockBatch.process);

    expect(_mockBatch.process.alerts).toStrictEqual([ _mockAlertToRemain ]);
  });

  test('should get alerts for the current step', (): void => {
    const _mockBatch: Batch = mockBatch();
    const calendarIndex: number = 13;
    _mockBatch.process.currentStep = calendarIndex;
    const _mockAlertToRemain: Alert = mockAlert();
    _mockAlertToRemain.title = _mockBatch.process.schedule[0].name;
    const _mockAlertToGet: Alert = mockAlert();
    _mockAlertToGet.title = _mockBatch.process.schedule[calendarIndex].name;
    _mockBatch.process.alerts = [ _mockAlertToRemain, _mockAlertToGet, _mockAlertToGet ];

    expect(service.getAlerts(_mockBatch.process)).toStrictEqual([ _mockAlertToGet, _mockAlertToGet ]);
  });

  test('should get closest alert of group by date', (): void => {
    const _mockAlertTarget: Alert = mockAlert();
    const nowTarget: Date = new Date();
    nowTarget.setDate(nowTarget.getDate() + 1);
    _mockAlertTarget.datetime = nowTarget.toISOString();
    const _mockOtherAlert: Alert = mockAlert();
    const nowOther: Date = new Date();
    nowOther.setDate(nowOther.getDate() + 10);
    _mockOtherAlert.datetime = nowOther.toISOString();
    const _mockAlerts: Alert[] = [ _mockOtherAlert, _mockAlertTarget, _mockOtherAlert, _mockOtherAlert ];

    expect(service.getClosestAlertByGroup(_mockAlerts)).toStrictEqual(_mockAlertTarget);
    expect(service.getClosestAlertByGroup([])).toBeNull();
  });

});
