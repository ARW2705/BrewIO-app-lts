/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockTimerProcess } from '../../../../test-config/mock-models';

/* Interface imports */
import { TimerProcess } from '../../shared/interfaces';

/* Component imports */
import { ProcessTimerFormComponent } from './process-timer-form.component';


describe('ProcessTimerFormComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<ProcessTimerFormComponent>;
  let component: ProcessTimerFormComponent;
  let originalOnInit: () => void;
  let originalAfterViewInit: () => void;
  const initDefaultForm: () => FormGroup = (): FormGroup => {
    return new FormGroup({
      name: new FormControl(),
      description: new FormControl(),
      duration: new FormControl(),
      concurrent: new FormControl(),
      splitInterval: new FormControl()
    });
  };

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ ProcessTimerFormComponent ],
      imports: [ ReactiveFormsModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ProcessTimerFormComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    component.ngOnInit = jest.fn();
    originalAfterViewInit = component.ngAfterViewInit;
    component.ngAfterViewInit = jest.fn();
    component.timerForm = initDefaultForm();
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
    component.timerForm.controls.name.setValidators(Validators.required);
    component.formStatusEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.formStatusEvent, 'emit');

    fixture.detectChanges();

    const nameControl: AbstractControl = component.timerForm.controls.name;
    nameControl.markAsTouched();
    nameControl.updateValueAndValidity();
    expect(emitSpy).toHaveBeenNthCalledWith(1, false);
    nameControl.setValue('test');
    nameControl.updateValueAndValidity();
    expect(emitSpy).toHaveBeenNthCalledWith(2, true);
  });

  test('should assign form values', (): void => {
    const _mockTimerProcess: TimerProcess = mockTimerProcess();
    component.update = _mockTimerProcess

    fixture.detectChanges();

    component.assignFormValues();
    const controls: { [key: string]: AbstractControl } = component.timerForm.controls;
    expect(controls.name.value).toMatch(_mockTimerProcess.name);
    expect(controls.description.value).toMatch(_mockTimerProcess.description);
    expect(controls.duration.value).toEqual(_mockTimerProcess.duration);
    expect(controls.concurrent.value).toBe(_mockTimerProcess.concurrent);
    expect(controls.splitInterval.value).toEqual(_mockTimerProcess.splitInterval)
  });

  test('should get form results', (): void => {
    const controls: { [key: string]: AbstractControl } = component.timerForm.controls;
    controls.name.setValue('test');
    controls.description.setValue('description');
    controls.duration.setValue(9);
    controls.concurrent.setValue(true);
    controls.splitInterval.setValue(2);

    fixture.detectChanges();

    const result: object = component.getFormResult();
    expect(result).toStrictEqual({
      name: 'test',
      description: 'description',
      duration: 9,
      concurrent: true,
      splitInterval: 2
    });
  });

  test('should init the form', (): void => {
    const _mockTimerProcess: TimerProcess = mockTimerProcess();
    component.update = _mockTimerProcess;
    component.assignFormValues = jest.fn();
    const assignSpy: jest.SpyInstance = jest.spyOn(component, 'assignFormValues');

    fixture.detectChanges();

    component.initForm();
    const formValues: object = component.timerForm.value;
    expect(formValues['name']).not.toBeNull();
    expect(formValues['description']).not.toBeNull();
    expect(formValues['duration']).not.toBeNull();
    expect(formValues['concurrent']).not.toBeNull();
    expect(formValues['splitInterval']).not.toBeNull();
    expect(assignSpy).toHaveBeenCalled();
  });

  test('should render the template', (): void => {
    fixture.detectChanges();

    const inputs: NodeList = fixture.nativeElement.querySelectorAll('app-form-input');
    const nameInput: Element = <Element>inputs.item(0);
    expect(nameInput.getAttribute('controlName')).toMatch('name');
    const durationInput: Element = <Element>inputs.item(1);
    expect(durationInput.getAttribute('controlName')).toMatch('duration');
    const splitIntervalInput: Element = <Element>inputs.item(2);
    expect(splitIntervalInput.getAttribute('controlName')).toMatch('splitInterval');
    const concurrentToggle: Element = fixture.nativeElement.querySelector('app-form-toggle');
    expect(concurrentToggle['control']).not.toBeNull();
    const textarea: Element = fixture.nativeElement.querySelector('app-form-text-area');
    expect(textarea['control']).not.toBeNull();
  });

});
