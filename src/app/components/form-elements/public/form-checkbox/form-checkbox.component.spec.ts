/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Component imports */
import { FormCheckboxComponent } from './form-checkbox.component';


describe('FormCheckboxComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<FormCheckboxComponent>;
  let component: FormCheckboxComponent;
  let originalOnChanges: any;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ FormCheckboxComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(FormCheckboxComponent);
    component = fixture.componentInstance;
    originalOnChanges = component.ngOnChanges;
    component.ngOnChanges = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should apply a default form control if one was not given by parent component', (): void => {
    component.ngOnChanges = originalOnChanges;

    fixture.detectChanges();

    expect(component.control).toBeUndefined();
    component.ngOnChanges();
    expect(component.control).toBeDefined();
  });

  test('should emit checkbox event', (): void => {
    component.ionCheckboxEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.ionCheckboxEvent, 'emit');

    fixture.detectChanges();

    const checkEvent: CustomEvent = new CustomEvent('checkbox', { detail: { checked: true } });
    component.onCheckBoxChange(checkEvent);
    expect(emitSpy).toHaveBeenNthCalledWith(1, true);
    const unCheckEvent: CustomEvent = new CustomEvent('checkbox', { detail: { checked: false } });
    component.onCheckBoxChange(unCheckEvent);
    expect(emitSpy).toHaveBeenNthCalledWith(2, false);
  });

  test('should render the template', (): void => {
    component.control = new FormControl();
    component.label = 'test-label';

    fixture.detectChanges();

    const label: HTMLElement = fixture.nativeElement.querySelector('ion-label');
    expect(label.textContent).toMatch('Test-label');
    const checkbox: HTMLElement = fixture.nativeElement.querySelector('ion-checkbox');
    expect(checkbox.textContent).toBeDefined();
  });

});
