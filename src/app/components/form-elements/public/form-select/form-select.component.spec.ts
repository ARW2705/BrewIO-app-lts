/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormControl, ValidationErrors } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockPreferencesSelectOptions } from '../../../../../../test-config/mock-models';
import { FormAttributeServiceStub } from '../../../../../../test-config/service-stubs';

/* Interface imports */
import { FormSelectChanges } from '../../../../shared/interfaces';

/* Service imports */
import { FormAttributeService } from '../../../../services/services';

/* Component imports */
import { FormSelectComponent } from './form-select.component';


describe('FormSelectComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<FormSelectComponent>;
  let component: FormSelectComponent;
  let originalOnChanges: any;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ FormSelectComponent ],
      imports: [
        IonicModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [ { provide: FormAttributeService, useClass: FormAttributeServiceStub } ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(FormSelectComponent);
    component = fixture.componentInstance;
    originalOnChanges = component.ngOnChanges;
    component.ngOnChanges = jest.fn();
    component.options = mockPreferencesSelectOptions();
    component.control = new FormControl();
    component.label = 'test-name';
    component.ionCancelEvent.emit = jest.fn();
    component.ionChangeEvent.emit = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should handle component changes', (): void => {
    component.ngOnChanges = originalOnChanges;
    const control: FormControl = new FormControl();
    component.control = control;
    component.assignFormChanges = jest.fn();
    component.formAttributeService.handleFormChange = jest.fn();
    const handleSpy: jest.SpyInstance = jest.spyOn(component.formAttributeService, 'handleFormChange');
    const change: SimpleChange = new SimpleChange(null, 'test', false);

    fixture.detectChanges();

    component.ngOnChanges({ label: change });
    expect(handleSpy).toHaveBeenCalledWith('select', control, { label: change });
  });

  test('should assign changes to component', (): void => {
    fixture.detectChanges();

    const control: FormControl = new FormControl();
    const compareWithFn: (o1: any, o2: any) => boolean = (...options: any): boolean => true;
    const confirmText: string = 'confirm';
    const dismissText: string = 'dismiss';
    const labelPosition: string = 'floating';
    const shouldRequire: boolean = true;
    const changes: FormSelectChanges = {
      control      : control,
      compareWithFn: compareWithFn,
      confirmText  : confirmText,
      dismissText  : dismissText,
      labelPosition: labelPosition,
      shouldRequire: shouldRequire
    };
    component.assignFormChanges(changes);
    expect(component.control).toStrictEqual(control);
    expect(component.compareWithFn()).toBe(true);
    expect(component.confirmText).toBe(confirmText);
    expect(component.dismissText).toBe(dismissText);
    expect(component.labelPosition).toBe(labelPosition);
    expect(component.shouldRequire).toBe(shouldRequire);
  });

  test('should check for errors', (): void => {
    fixture.detectChanges();

    const formError: ValidationErrors = { maxlength: true };
    component.control.setErrors(formError);
    component.control.markAsTouched();
    component.checkForErrors();
    expect(component.controlErrors).toStrictEqual(formError);
    expect(component.showError).toBe(true);
  });

  test('should handle ion cancel event', (): void => {
    component.checkForErrors = jest.fn();
    const checkSpy: jest.SpyInstance = jest.spyOn(component, 'checkForErrors');
    const emitSpy: jest.SpyInstance = jest.spyOn(component.ionCancelEvent, 'emit');

    fixture.detectChanges();

    const event: CustomEvent = new CustomEvent('test');
    component.ionCancel(event);
    expect(emitSpy).toHaveBeenCalledWith(event);
    expect(checkSpy).toHaveBeenCalled();
  });

  test('should handle ion change event', (): void => {
    component.checkForErrors = jest.fn();
    const checkSpy: jest.SpyInstance = jest.spyOn(component, 'checkForErrors');
    const emitSpy: jest.SpyInstance = jest.spyOn(component.ionChangeEvent, 'emit');

    fixture.detectChanges();

    const event: CustomEvent = new CustomEvent('test');
    component.ionChange(event);
    expect(emitSpy).toHaveBeenCalledWith(event);
    expect(checkSpy).toHaveBeenCalled();
  });

  test('should render the template without errors', (): void => {
    component.confirmText = 'confirm';
    component.control = new FormControl();
    component.dismissText = 'dismiss';
    component.formName = 'form';
    component.labelPosition = 'position';
    component.compareWithFn = (o1: any, o2: any): boolean => o1 === o2;
    component.shouldRequire = false;

    fixture.detectChanges();

    const label: HTMLElement = global.document.querySelector('ion-label');
    expect(label.textContent).toMatch('Test-name');
    const select: HTMLElement = global.document.querySelector('ion-select');
    expect(select['cancelText']).toMatch('dismiss');
    expect(select['okText']).toMatch('confirm');
    const options: NodeList = global.document.querySelectorAll('ion-select-option');
    expect(options.item(0).textContent).toMatch('label1');
    expect(options.item(1).textContent).toMatch('label2');
    expect(options.item(2).textContent).toMatch('label3');
    const error: HTMLElement = global.document.querySelector('app-form-error');
    expect(error).toBeNull();
  });

  test('should render the template without errors', (): void => {
    component.confirmText = 'confirm';
    component.control = new FormControl();
    component.controlName = 'control';
    component.dismissText = 'dismiss';
    component.formName = 'form';
    component.labelPosition = 'position';
    component.compareWithFn = (o1: any, o2: any): boolean => o1 === o2;
    component.shouldRequire = false;
    component.showError = true;
    component.controlErrors = { maxlength: true };

    fixture.detectChanges();

    const error: HTMLElement = global.document.querySelector('app-form-error');
    expect(error['formName']).toMatch('form');
    expect(error['controlName']).toMatch('control');
    expect(error['controlErrors']).toStrictEqual({ maxlength: true });
  });

});
