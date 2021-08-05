/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Component imports */
import { CalendarControlsChangeButtonComponent } from './calendar-controls-change-button.component';


describe('CalendarControlsChangeButtonComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<CalendarControlsChangeButtonComponent>;
  let component: CalendarControlsChangeButtonComponent;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ CalendarControlsChangeButtonComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(CalendarControlsChangeButtonComponent);
    component = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should handle change button click', (): void => {
    component.changeButtonEvent.emit = jest.fn();
    const changeSpy: jest.SpyInstance = jest.spyOn(component.changeButtonEvent, 'emit');

    fixture.detectChanges();

    component.onChangeButtonClick();
    expect(changeSpy).toHaveBeenCalled();
  });

  test('should render the component', (): void => {
    component.iconName = 'test-icon-name';

    fixture.detectChanges();

    const elem: HTMLElement = global.document.querySelector('ion-icon');
    expect(elem['name']).toMatch('test-icon-name');
  });

});
