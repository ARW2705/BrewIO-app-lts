/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockCalendarProcess, mockProcessSchedule, mockRecipeVariantComplete } from '../../../../../../test-config/mock-models';
import { ActionSheetServiceStub, ErrorReportingServiceStub, ModalServiceStub } from '../../../../../../test-config/service-stubs';

/* Interface imports */
import { CalendarProcess, Process, RecipeVariant } from '../../../../shared/interfaces';

/* Service imports */
import { ActionSheetService, ErrorReportingService, ModalService } from '../../../../services/services';

/* Component imports */
import { ProcessFormComponent } from '../../private/process-form/process-form.component';
import { ProcessContainerComponent } from './process-container.component';


describe('ProcessContainerComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<ProcessContainerComponent>;
  let component: ProcessContainerComponent;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        ProcessContainerComponent
      ],
      providers: [
        { provide: ActionSheetService, useClass: ActionSheetServiceStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: ModalService, useClass: ModalServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ProcessContainerComponent);
    component = fixture.componentInstance;
    component.processUpdateEvent.emit = jest.fn();
    component.reorderEvent.emit = jest.fn();
    component.errorReporter.handleUnhandledError = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  test('should open process action sheet', (): void => {
    component.openProcessModal = jest.fn();
    component.actionService.openActionSheet = jest.fn();
    const modalSpy: jest.SpyInstance = jest.spyOn(component, 'openProcessModal');
    const sheetSpy: jest.SpyInstance = jest.spyOn(component.actionService, 'openActionSheet');

    fixture.detectChanges();

    component.openProcessActionSheet();
    const args: any[] = sheetSpy.mock.calls[0];
    expect(args[0]).toMatch('Add a process step');
    const options: any[] = args[1];
    const manualOption: { text: string, handler: () => void } = options[0];
    expect(manualOption.text).toMatch('Manual');
    manualOption.handler();
    expect(modalSpy).toHaveBeenNthCalledWith(1, 'manual');
    const timerOption: { text: string, handler: () => void } = options[1];
    expect(timerOption.text).toMatch('Timer');
    timerOption.handler();
    expect(modalSpy).toHaveBeenNthCalledWith(2, 'timer');
    const calendarOption: { text: string, handler: () => void } = options[2];
    expect(calendarOption.text).toMatch('Calendar');
    calendarOption.handler();
    expect(modalSpy).toHaveBeenNthCalledWith(3, 'calendar');
  });

  test('should get modal options', (): void => {
    const _mockCalendarProcess: CalendarProcess = mockCalendarProcess();

    fixture.detectChanges();

    expect(component.getProcessFormModalOptions('calendar', _mockCalendarProcess)).toStrictEqual({
      processType: _mockCalendarProcess.type,
      update: _mockCalendarProcess,
      formType: 'update'
    });
    expect(component.getProcessFormModalOptions('calendar')).toStrictEqual({
      processType: 'calendar',
      update: undefined,
      formType: 'create'
    });
  });

  test('should open process modal and handle success', (done: jest.DoneCallback): void => {
    const _mockCalendarProcess: CalendarProcess = mockCalendarProcess();
    const _mockCalendarProcessArg: CalendarProcess = mockCalendarProcess();
    _mockCalendarProcessArg.cid += '1';
    component.modalService.openModal = jest.fn()
      .mockReturnValue(of(_mockCalendarProcess));
    const modalSpy: jest.SpyInstance = jest.spyOn(component.modalService, 'openModal');
    component.getProcessFormModalOptions = jest.fn()
      .mockReturnValue({});
    const optionSpy: jest.SpyInstance = jest.spyOn(component, 'getProcessFormModalOptions');
    const emitSpy: jest.SpyInstance = jest.spyOn(component.processUpdateEvent, 'emit');


    fixture.detectChanges();

    component.openProcessModal('calendar', _mockCalendarProcessArg, 1);
    setTimeout((): void => {
      expect(modalSpy).toHaveBeenCalledWith(ProcessFormComponent, {});
      expect(optionSpy).toHaveBeenCalledWith('calendar', _mockCalendarProcessArg);
      expect(emitSpy).toHaveBeenCalledWith({
        type: 'calendar',
        toUpdate: _mockCalendarProcessArg,
        process: _mockCalendarProcess,
        index: 1
      });
      done();
    }, 10);
  });

  test('should open process modal and handle error', (done: jest.DoneCallback): void => {
    const _mockError: Error = new Error('test-error');
    component.modalService.openModal = jest.fn()
      .mockReturnValue(throwError(_mockError));
    const modalSpy: jest.SpyInstance = jest.spyOn(component.modalService, 'openModal');
    component.getProcessFormModalOptions = jest.fn()
      .mockReturnValue({});
    const optionSpy: jest.SpyInstance = jest.spyOn(component, 'getProcessFormModalOptions');
    const emitSpy: jest.SpyInstance = jest.spyOn(component.processUpdateEvent, 'emit');
    const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

    fixture.detectChanges();

    component.openProcessModal('calendar');
    setTimeout((): void => {
      expect(modalSpy).toHaveBeenCalledWith(ProcessFormComponent, {});
      expect(optionSpy).toHaveBeenCalledWith('calendar', undefined);
      expect(emitSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(_mockError);
      done();
    }, 10);
  });

  test('should open modal from template binding call', (): void => {
    component.openProcessModal = jest.fn();
    const modalSpy: jest.SpyInstance = jest.spyOn(component, 'openProcessModal');
    const _mockCalendarProcess: CalendarProcess = mockCalendarProcess();

    fixture.detectChanges();

    component.openProcessModalHelper(['calendar', _mockCalendarProcess, 0]);
    expect(modalSpy).toHaveBeenCalledWith('calendar', _mockCalendarProcess, 0);
  });

  test('should emit ion reorder group event', (): void => {
    const emitSpy: jest.SpyInstance = jest.spyOn(component.reorderEvent, 'emit');
    const _mockProcessSchedule: Process[] = mockProcessSchedule();

    fixture.detectChanges();

    component.onReorder(_mockProcessSchedule);
    expect(emitSpy).toHaveBeenCalledWith(_mockProcessSchedule);
  });

  test('should render the template', (): void => {
    const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
    component.variant = _mockRecipeVariantComplete;

    fixture.detectChanges();

    const button: HTMLElement = fixture.nativeElement.querySelector('ion-button');
    expect(button.textContent).toMatch('ADD PROCESS');
    const list: HTMLElement = fixture.nativeElement.querySelector('app-process-list');
    expect(list['schedule']).toStrictEqual(_mockRecipeVariantComplete.processSchedule);
  });

});
