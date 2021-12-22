/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockCalendarProcess, mockManualProcess, mockTimerProcess } from '../../../../../../test-config/mock-models';
import { HeaderComponentStub, ProcessCalendarFormComponentStub } from '../../../../../../test-config/component-stubs';
import { ModalControllerStub } from '../../../../../../test-config/ionic-stubs';
import { UtilityServiceStub } from '../../../../../../test-config/service-stubs';

/* Interface imports */
import { CalendarProcess, ManualProcess, TimerProcess } from '../../../../shared/interfaces';

/* Service imports */
import { UtilityService } from '../../../../services/services';

/* Component imports */
import { ProcessCalendarFormComponent } from '../process-calendar-form/process-calendar-form.component';
import { ProcessFormComponent } from './process-form.component';


describe('ProcessFormComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<ProcessFormComponent>;
  let component: ProcessFormComponent;
  let originalOnInit: any;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        ProcessFormComponent,
        HeaderComponentStub
      ],
      providers: [
        { provide: ModalController, useClass: ModalControllerStub },
        { provide: UtilityService, useClass: UtilityServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ProcessFormComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    component.ngOnInit = jest.fn();
    component.modalCtrl.dismiss = jest.fn();
    component.utilService.toTitleCase = jest.fn()
      .mockImplementation((str: string): string => str);
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeDefined();
  });

  test('should init the component', (): void => {
    component.ngOnInit = originalOnInit;
    component.processType = 'calendar';
    const setSpy: jest.SpyInstance = jest.spyOn(component, 'setFormValidity');

    fixture.detectChanges();

    expect(setSpy).not.toHaveBeenCalled();
    expect(component.formType).toMatch('create');
    expect(component.title).toMatch('calendar');
  });

  test('should init the component with update', (): void => {
    component.ngOnInit = originalOnInit;
    component.processType = 'calendar';
    const _mockCalendarProcess: CalendarProcess = mockCalendarProcess();
    component.update = _mockCalendarProcess;
    const setSpy: jest.SpyInstance = jest.spyOn(component, 'setFormValidity');

    fixture.detectChanges();

    expect(setSpy).toHaveBeenCalledWith(true);
    expect(component.formType).toMatch('update');
    expect(component.title).toMatch('calendar');
  });

  test('should dismiss the modal with no data', (): void => {
    const dismissSpy: jest.SpyInstance = jest.spyOn(component.modalCtrl, 'dismiss');

    fixture.detectChanges();

    component.dismiss();
    expect(dismissSpy).toHaveBeenCalled();
  });

  test('should dismiss the modal with deletion flag', (): void => {
    const dismissSpy: jest.SpyInstance = jest.spyOn(component.modalCtrl, 'dismiss');

    fixture.detectChanges();

    component.onDeletion();
    expect(dismissSpy).toHaveBeenCalledWith({ delete: true });
  });

  test('should dismiss the modal with form values', (): void => {
    const dismissSpy: jest.SpyInstance = jest.spyOn(component.modalCtrl, 'dismiss');

    fixture.detectChanges();

    const calendarForm: ProcessCalendarFormComponent = (new ProcessCalendarFormComponentStub()) as ProcessCalendarFormComponent;
    calendarForm.getFormResult = jest.fn()
      .mockReturnValue({ test: true });
    component.formRef = calendarForm;
    component.onSubmit();
    expect(dismissSpy).toHaveBeenCalledWith({ test: true });
  });

  test('should set form validity', (): void => {
    fixture.detectChanges();

    expect(component.isFormValid).toBe(false);
    component.setFormValidity(true);
    expect(component.isFormValid).toBe(true);
    component.setFormValidity(false);
    expect(component.isFormValid).toBe(false);
  });

  test('should render the template as create form', (): void => {
    component.ngOnInit = originalOnInit;
    component.processType = '';

    fixture.detectChanges();

    const formButtons: HTMLElement = fixture.nativeElement.querySelector('app-form-buttons');
    expect(formButtons).toBeTruthy();
    const deleteButton: HTMLElement = fixture.nativeElement.querySelector('app-delete-button');
    expect(deleteButton).toBeNull();
  });

  test('should render the template as a calendar form', (): void => {
    component.ngOnInit = originalOnInit;
    component.processType = 'calendar';
    const _mockCalendarProcess: CalendarProcess = mockCalendarProcess();
    component.update = _mockCalendarProcess;

    fixture.detectChanges();

    const formButtons: HTMLElement = fixture.nativeElement.querySelector('app-form-buttons');
    expect(formButtons).toBeTruthy();
    const deleteButton: HTMLElement = fixture.nativeElement.querySelector('app-delete-button');
    expect(deleteButton).toBeTruthy();
    const calendarForm: HTMLElement = fixture.nativeElement.querySelector('app-process-calendar-form');
    expect(calendarForm).toBeTruthy();
    const manualForm: HTMLElement = fixture.nativeElement.querySelector('app-process-manual-form');
    expect(manualForm).toBeNull();
    const timerForm: HTMLElement = fixture.nativeElement.querySelector('app-process-timer-form');
    expect(timerForm).toBeNull();
  });

  test('should render the template as a manual form', (): void => {
    component.ngOnInit = originalOnInit;
    component.processType = 'manual';
    const _mockManualProcess: ManualProcess = mockManualProcess();
    component.update = _mockManualProcess;

    fixture.detectChanges();

    const formButtons: HTMLElement = fixture.nativeElement.querySelector('app-form-buttons');
    expect(formButtons).toBeTruthy();
    const deleteButton: HTMLElement = fixture.nativeElement.querySelector('app-delete-button');
    expect(deleteButton).toBeTruthy();
    const calendarForm: HTMLElement = fixture.nativeElement.querySelector('app-process-calendar-form');
    expect(calendarForm).toBeNull();
    const manualForm: HTMLElement = fixture.nativeElement.querySelector('app-process-manual-form');
    expect(manualForm).toBeTruthy();
    const timerForm: HTMLElement = fixture.nativeElement.querySelector('app-process-timer-form');
    expect(timerForm).toBeNull();
  });

  test('should render the template as a timer form', (): void => {
    component.ngOnInit = originalOnInit;
    component.processType = 'timer';
    const _mockTimerProcess: TimerProcess = mockTimerProcess();
    component.update = _mockTimerProcess;

    fixture.detectChanges();

    const formButtons: HTMLElement = fixture.nativeElement.querySelector('app-form-buttons');
    expect(formButtons).toBeTruthy();
    const deleteButton: HTMLElement = fixture.nativeElement.querySelector('app-delete-button');
    expect(deleteButton).toBeTruthy();
    const calendarForm: HTMLElement = fixture.nativeElement.querySelector('app-process-calendar-form');
    expect(calendarForm).toBeNull();
    const manualForm: HTMLElement = fixture.nativeElement.querySelector('app-process-manual-form');
    expect(manualForm).toBeNull();
    const timerForm: HTMLElement = fixture.nativeElement.querySelector('app-process-timer-form');
    expect(timerForm).toBeTruthy();
  });

});
