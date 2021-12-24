/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockCalendarDate } from '@test/mock-models';

/* Interface imports*/
import { CalendarDate } from '@shared/interfaces';

/* Component imports */
import { CalendarInteractiveDisplayComponent } from './calendar-interactive-display.component';


describe('CalendarInteractiveDisplayComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<CalendarInteractiveDisplayComponent>;
  let component: CalendarInteractiveDisplayComponent;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        CalendarInteractiveDisplayComponent,
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(CalendarInteractiveDisplayComponent);
    component = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should handle a date button click', (): void => {
    const _mockCalendarDate: CalendarDate = mockCalendarDate();
    component.dateButtonEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.dateButtonEvent, 'emit');

    fixture.detectChanges();

    component.onDateButtonClick(_mockCalendarDate);
    expect(emitSpy).toHaveBeenCalledWith(_mockCalendarDate);
  });

  test('should render the component', (): void => {
    const _mockCalendarDate: CalendarDate = mockCalendarDate();
    const month: CalendarDate[][] = Array.from(Array(6)).map((): CalendarDate[] => {
      return Array.from(Array(7)).map((): CalendarDate => _mockCalendarDate);
    });
    component.month = month;

    fixture.detectChanges();

    const buttons: NodeList = fixture.nativeElement.querySelectorAll('app-date-button');
    expect(buttons.length).toEqual(42);
    const example: HTMLElement = <HTMLElement>buttons.item(0);
    expect(example['date']).toStrictEqual(_mockCalendarDate.mDate);
    expect(example['isMonth']).toBe(false);
    expect(example['isProjected']).toBe(false);
    expect(example['isStart']).toBe(false);
  });

});
