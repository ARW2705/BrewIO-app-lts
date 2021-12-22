/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Component imports */
import { FormButtonsComponent } from './form-buttons.component';


describe('FormButtonsComponent', (): void => {
  let fixture: ComponentFixture<FormButtonsComponent>;
  let component: FormButtonsComponent;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ FormButtonsComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(FormButtonsComponent);
    component = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should emit a cancel event', (): void => {
    component.cancelEvent.emit = jest.fn();
    const cancelSpy: jest.SpyInstance = jest.spyOn(component.cancelEvent, 'emit');

    fixture.detectChanges();

    component.cancel();
    expect(cancelSpy).toHaveBeenCalled();
  });

  test('should emit a submit event', (): void => {
    component.submitEvent.emit = jest.fn();
    const submitSpy: jest.SpyInstance = jest.spyOn(component.submitEvent, 'emit');

    fixture.detectChanges();

    component.submit();
    expect(submitSpy).toHaveBeenCalled();
  });

  test('should render the template', (): void => {
    component.isSubmitDisabled = true;
    component.shouldCautionSubmit = false;

    fixture.detectChanges();

    const buttons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');
    const cancelButton: HTMLElement = <HTMLElement>buttons.item(0);
    expect(cancelButton.textContent).toMatch('Cancel');
    const submitButton: HTMLElement = <HTMLElement>buttons.item(1);
    expect(submitButton['color']).toMatch('primary');
    expect(submitButton['disabled']).toBe(true);
  });

});
