/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

/* Configure test imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockCalendarDate } from '@test/mock-models';
import { MomentPipeStub } from '@test/pipe-stubs';

/* Interface imports */
import { CalendarDate } from '@shared/interfaces';

/* Component imports */
import { CalendarControlsComponent } from './calendar-controls.component';


describe('CalendarControlsComponent', () => {
  configureTestBed();
  let component: CalendarControlsComponent;
  let fixture: ComponentFixture<CalendarControlsComponent>;
  const _mockCalendarDate: CalendarDate = mockCalendarDate();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        CalendarControlsComponent,
        MomentPipeStub
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(CalendarControlsComponent);
    component = fixture.componentInstance;
    component.changeButtonEvent.emit = jest.fn();
    component.selectButtonEvent.emit = jest.fn();
    component.displayDate = _mockCalendarDate.mDate;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  test('should handle change button click', (): void => {
    const emitSpy: jest.SpyInstance = jest.spyOn(component.changeButtonEvent, 'emit');

    fixture.detectChanges();

    component.onChangeClick(true);
    expect(emitSpy).toHaveBeenCalledWith(true);
  });

  test('should handle select button click', (): void => {
    const emitSpy: jest.SpyInstance = jest.spyOn(component.selectButtonEvent, 'emit');

    fixture.detectChanges();

    component.onSelectClick('start');
    expect(emitSpy).toHaveBeenCalledWith('start');
  });

  test('should render the template', (): void => {
    MomentPipeStub._returnValue = (...options: any[]): string => "JUNE";

    fixture.detectChanges();

    const changeButtons: NodeList = fixture.nativeElement.querySelectorAll('app-calendar-controls-change-button');
    expect(changeButtons.length).toEqual(2);
    expect((<HTMLElement>changeButtons.item(0)).getAttribute('iconName')).toMatch('back');
    expect((<HTMLElement>changeButtons.item(1)).getAttribute('iconName')).toMatch('forward');
    const month: HTMLElement = fixture.nativeElement.querySelector('.month-header');
    expect(month.textContent).toMatch('JUNE');
    const toggleButtons: NodeList = fixture.nativeElement.querySelectorAll('app-calendar-controls-toggle-button');
    expect(toggleButtons.length).toEqual(2);
    expect((<HTMLElement>toggleButtons.item(0)).getAttribute('buttonText')).toMatch('Start');
    expect((<HTMLElement>toggleButtons.item(1)).getAttribute('buttonText')).toMatch('Alerts');
  });

});
