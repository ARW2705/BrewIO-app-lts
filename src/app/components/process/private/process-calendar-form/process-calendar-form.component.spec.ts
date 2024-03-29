/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockCalendarProcess } from '@test/mock-models';

/* Interface imports */
import { CalendarProcess } from '@shared/interfaces';

/* Component imports */
import { ProcessCalendarFormComponent } from './process-calendar-form.component';


describe('ProcessCalendarFormComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<ProcessCalendarFormComponent>;
  let component: ProcessCalendarFormComponent;
  let originalOnInit: () => void;
  let originalAfterViewInit: () => void;
  const initDefaultForm: () => FormGroup = (): FormGroup => {
    return new FormGroup({
      name: new FormControl(),
      description: new FormControl(),
      duration: new FormControl()
    });
  };

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ ProcessCalendarFormComponent ],
      imports: [ ReactiveFormsModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ProcessCalendarFormComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    component.ngOnInit = jest.fn();
    originalAfterViewInit = component.ngAfterViewInit;
    component.ngAfterViewInit = jest.fn();
    component.calendarForm = initDefaultForm();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should init the component', (): void => {
    component.ngOnInit = originalOnInit;
    component.initForm = jest.fn();
    const initSpy: jest.SpyInstance = jest.spyOn(component, 'initForm');

    fixture.detectChanges();

    expect(initSpy).toHaveBeenCalled();
  });

  test('should listen for form status changes', (): void => {
    component.ngAfterViewInit = originalAfterViewInit;
    component.calendarForm.controls.name.setValidators(Validators.required);
    component.formStatusEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.formStatusEvent, 'emit');

    fixture.detectChanges();

    const nameControl: AbstractControl = component.calendarForm.controls.name;
    nameControl.markAsTouched();
    nameControl.updateValueAndValidity();
    expect(emitSpy).toHaveBeenNthCalledWith(1, false);
    nameControl.setValue('test');
    nameControl.updateValueAndValidity();
    expect(emitSpy).toHaveBeenNthCalledWith(2, true);
  });

  test('should assign form values', (): void => {
    const _mockCalendarProcess: CalendarProcess = mockCalendarProcess();
    component.update = _mockCalendarProcess

    fixture.detectChanges();

    component.assignFormValues();
    const controls: { [key: string]: AbstractControl } = component.calendarForm.controls;
    expect(controls.name.value).toMatch(_mockCalendarProcess.name);
    expect(controls.description.value).toMatch(_mockCalendarProcess.description);
    expect(controls.duration.value).toEqual(_mockCalendarProcess.duration);
  });

  test('should get form results', (): void => {
    const controls: { [key: string]: AbstractControl } = component.calendarForm.controls;
    controls.name.setValue('test');
    controls.description.setValue('description');
    controls.duration.setValue(9);

    fixture.detectChanges();

    const result: object = component.getFormResult();
    expect(result).toStrictEqual({
      name: 'test',
      description: 'description',
      duration: 9,
      type: 'calendar'
    });
  });

  test('should init the form', (): void => {
    const _mockCalendarProcess: CalendarProcess = mockCalendarProcess();
    component.update = _mockCalendarProcess;
    component.assignFormValues = jest.fn();
    const assignSpy: jest.SpyInstance = jest.spyOn(component, 'assignFormValues');

    fixture.detectChanges();

    component.initForm();
    const formValues: object = component.calendarForm.value;
    expect(formValues['name']).not.toBeNull();
    expect(formValues['description']).not.toBeNull();
    expect(assignSpy).toHaveBeenCalled();
  });

  test('should render the template', (): void => {
    fixture.detectChanges();

    const inputs: NodeList = fixture.nativeElement.querySelectorAll('app-form-input');
    const nameInput: Element = <Element>inputs.item(0);
    expect(nameInput.getAttribute('controlName')).toMatch('name');
    const durationInput: Element = <Element>inputs.item(1);
    expect(durationInput.getAttribute('controlName')).toMatch('duration');
    const textarea: Element = fixture.nativeElement.querySelector('app-form-text-area');
    expect(textarea['control']).not.toBeNull();
  });

});
