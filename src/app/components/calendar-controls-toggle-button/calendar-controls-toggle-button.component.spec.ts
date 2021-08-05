/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Component imports */
import { CalendarControlsToggleButtonComponent } from './calendar-controls-toggle-button.component';


describe('CalendarControlsToggleButtonComponent', () => {
  configureTestBed();
  let component: CalendarControlsToggleButtonComponent;
  let fixture: ComponentFixture<CalendarControlsToggleButtonComponent>;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ CalendarControlsToggleButtonComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(CalendarControlsToggleButtonComponent);
    component = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should handle toggle button click', (): void => {
    component.toggleButtonEvent.emit = jest.fn();
    const toggleSpy: jest.SpyInstance = jest.spyOn(component.toggleButtonEvent, 'emit');

    fixture.detectChanges();

    component.onToggleClick();
    expect(toggleSpy).toHaveBeenCalled();
  });

  test('should render the button', (): void => {
    component.buttonText = 'test-text';
    component.buttonColor = 'primary';

    fixture.detectChanges();

    const elem: HTMLElement = global.document.querySelector('ion-button');
    expect(elem.textContent).toMatch('test-text');
    expect(elem['color']).toMatch('primary');
  });

});
