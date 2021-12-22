/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockAlertFuture, mockAlertPast, mockAlertPresent } from '../../../../../../test-config/mock-models';
import { SortPipeStub } from '../../../../../../test-config/pipe-stubs';

/* Interface imports */
import { Alert } from '../../../../shared/interfaces';

/* Component imports */
import { ProcessCalendarAlertsComponent } from './process-calendar-alerts.component';


describe('ProcessCalendarAlertsComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<ProcessCalendarAlertsComponent>;
  let component: ProcessCalendarAlertsComponent;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        ProcessCalendarAlertsComponent,
        SortPipeStub
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ProcessCalendarAlertsComponent);
    component = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  test('should emit change date event', (): void => {
    component.changeDateEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.changeDateEvent, 'emit');

    fixture.detectChanges();

    component.changeDate();
    expect(emitSpy).toHaveBeenCalled();
  });

  test('should render the template', (): void => {
    const _mockAlertPresent: Alert = mockAlertPresent();
    const _mockAlertFuture: Alert = mockAlertFuture();
    const _mockalertPast: Alert = mockAlertPast();
    const _mockAlerts: Alert[] = [_mockalertPast, _mockAlertPresent, _mockAlertFuture ];
    component.alerts = _mockAlerts;
    component.closestAlert = _mockAlertPresent;
    SortPipeStub._returnValue = (value: any): any[] => _mockAlerts;
    fixture.detectChanges();

    const alerts: NodeList = fixture.nativeElement.querySelectorAll('p');
    expect(alerts.length).toEqual(3);
    expect((<Element>alerts.item(0)).className).toMatch('alert-datetime');
    expect((<Element>alerts.item(1)).className).toMatch('alert-datetime next-datetime');
    expect((<Element>alerts.item(2)).className).toMatch('alert-datetime');
  });

});
