/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

/* Configure test imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { MomentPipeStub } from '../../../../../../test-config/pipe-stubs';

/* Component imports */
import { CalendarControlsComponent } from './calendar-controls.component';


describe('CalendarControlsComponent', () => {
  configureTestBed();
  let component: CalendarControlsComponent;
  let fixture: ComponentFixture<CalendarControlsComponent>;

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

});
