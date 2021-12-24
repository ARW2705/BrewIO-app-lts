/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as moment from 'moment';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { MomentPipeStub } from '@test/pipe-stubs';

/* Component imports */
import { DateButtonComponent } from './date-button.component';


describe('DateButtonComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<DateButtonComponent>;
  let component: DateButtonComponent;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        DateButtonComponent,
        MomentPipeStub
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(DateButtonComponent);
    component = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeDefined();
  });

  test('should handle input changes', (): void => {
    const startChange: SimpleChanges = { isStart: new SimpleChange(null, true, true) };
    const projectedChange: SimpleChanges = { isProjected: new SimpleChange(null, true, true) };
    const monthChange: SimpleChanges = { isMonth: new SimpleChange(null, true, true) };

    fixture.detectChanges();

    expect(component.svgClass).toMatch('base');
    component.ngOnChanges(startChange);
    expect(component.svgClass).toMatch('base start');
    component.ngOnChanges(projectedChange);
    expect(component.svgClass).toMatch('base projected');
    component.ngOnChanges(monthChange);
    expect(component.svgClass).toMatch('base month');
  });

  test('should render the template', (): void => {
    const testMoment: moment.Moment = moment('2020-01-01');
    component.date = testMoment;
    MomentPipeStub._returnValue = (): string => {
      return testMoment.toISOString();
    };

    fixture.detectChanges();

    const button: HTMLElement = fixture.nativeElement.querySelector('text');
    expect(button.textContent).toMatch(testMoment.toISOString());
  });

});
