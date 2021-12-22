/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockManualProcess } from '../../../../../../test-config/mock-models';

/* Interface imports */
import { ManualProcess } from '../../../../shared/interfaces';

/* Component imports */
import { ProcessManualFormComponent } from './process-manual-form.component';


describe('ProcessManualFormComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<ProcessManualFormComponent>;
  let component: ProcessManualFormComponent;
  let originalOnInit: () => void;
  let originalAfterViewInit: () => void;
  const initDefaultForm: () => FormGroup = (): FormGroup => {
    return new FormGroup({
      name: new FormControl(),
      description: new FormControl(),
      expectedDuration: new FormControl()
    });
  };

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ ProcessManualFormComponent ],
      imports: [ ReactiveFormsModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ProcessManualFormComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    component.ngOnInit = jest.fn();
    originalAfterViewInit = component.ngAfterViewInit;
    component.ngAfterViewInit = jest.fn();
    component.manualForm = initDefaultForm();
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
    component.manualForm.controls.name.setValidators(Validators.required);
    component.formStatusEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.formStatusEvent, 'emit');

    fixture.detectChanges();

    const nameControl: AbstractControl = component.manualForm.controls.name;
    nameControl.markAsTouched();
    nameControl.updateValueAndValidity();
    expect(emitSpy).toHaveBeenNthCalledWith(1, false);
    nameControl.setValue('test');
    nameControl.updateValueAndValidity();
    expect(emitSpy).toHaveBeenNthCalledWith(2, true);
  });

  test('should assign form values', (): void => {
    const _mockManualProcess: ManualProcess = mockManualProcess();
    component.update = _mockManualProcess

    fixture.detectChanges();

    component.assignFormValues();
    const controls: { [key: string]: AbstractControl } = component.manualForm.controls;
    expect(controls.name.value).toMatch(_mockManualProcess.name);
    expect(controls.description.value).toMatch(_mockManualProcess.description);
    expect(controls.expectedDuration.value).toEqual(_mockManualProcess.expectedDuration);
  });

  test('should get form results', (): void => {
    const controls: { [key: string]: AbstractControl } = component.manualForm.controls;
    controls.name.setValue('test');
    controls.description.setValue('description');
    controls.expectedDuration.setValue(9);

    fixture.detectChanges();

    const result: object = component.getFormResult();
    expect(result).toStrictEqual({
      name: 'test',
      description: 'description',
      expectedDuration: 9,
      type: 'manual'
    });
  });

  test('should init the form', (): void => {
    const _mockManualProcess: ManualProcess = mockManualProcess();
    component.update = _mockManualProcess;
    component.assignFormValues = jest.fn();
    const assignSpy: jest.SpyInstance = jest.spyOn(component, 'assignFormValues');

    fixture.detectChanges();

    component.initForm();
    const formValues: object = component.manualForm.value;
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
    expect(durationInput.getAttribute('controlName')).toMatch('expectedDuration');
    const textarea: Element = fixture.nativeElement.querySelector('app-form-text-area');
    expect(textarea['control']).not.toBeNull();
  });

});
