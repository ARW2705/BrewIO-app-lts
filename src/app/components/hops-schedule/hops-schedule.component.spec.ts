/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange, SimpleChanges } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockHopsSchedule } from '../../../../test-config/mock-models/mock-hops';
import { mockRecipeVariantComplete } from '../../../../test-config/mock-models/mock-recipe';
import { CalculatePipeMock } from '../../../../test-config/mock-pipes/mock-calculate-pipe';
import { UnitConversionPipeMock } from '../../../../test-config/mock-pipes/mock-unit-conversion-pipe';

/* Interface imports */
import { HopsSchedule } from '../../shared/interfaces/hops-schedule';

/* Component imports */
import { HopsScheduleComponent } from './hops-schedule.component';


describe('HopsSchedule', (): void => {
  let fixture: ComponentFixture<HopsScheduleComponent>;
  let hsCmp: HopsScheduleComponent;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        HopsScheduleComponent,
        CalculatePipeMock,
        UnitConversionPipeMock
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(HopsScheduleComponent);
    hsCmp = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(hsCmp).toBeDefined();
  });

  test('should handle input change', (): void => {
    const _mockHopsSchedule: HopsSchedule[] = mockHopsSchedule();
    const hopsChange: SimpleChanges = {
      variant: new SimpleChange(null, mockRecipeVariantComplete(), false),
      hops: new SimpleChange(null, _mockHopsSchedule, false)
    };

    expect(hsCmp.hopsSchedule.length).toEqual(0);

    fixture.detectChanges();

    hsCmp.ngOnChanges(hopsChange);

    expect(hsCmp.hopsSchedule).toStrictEqual(_mockHopsSchedule);
  });

  test('should open ingredient form modal via recipe action', (): void => {
    const _mockHopsSchedule: HopsSchedule = mockHopsSchedule()[0];

    hsCmp.onRecipeAction = jest
      .fn();

    const actionSpy: jest.SpyInstance = jest.spyOn(hsCmp, 'onRecipeAction');

    fixture.detectChanges();

    hsCmp.openIngredientFormModal(_mockHopsSchedule);

    expect(actionSpy).toHaveBeenCalledWith('openIngredientFormModal', ['hops', _mockHopsSchedule]);
  });

});
