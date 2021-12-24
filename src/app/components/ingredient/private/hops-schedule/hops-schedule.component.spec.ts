/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockHopsSchedule, mockRecipeVariantComplete } from '@test/mock-models';
import { CalculationsServiceStub } from '@test/service-stubs';

/* Interface imports */
import { HopsSchedule, RecipeVariant } from '@shared/interfaces';

/* Service imports */
import { CalculationsService } from '@services/public';

/* Component imports */
import { HopsScheduleComponent } from './hops-schedule.component';


describe('HopsSchedule', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<HopsScheduleComponent>;
  let component: HopsScheduleComponent;
  let originalOnInit: any;
  let originalOnChanges: any;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ HopsScheduleComponent ],
      providers: [
        { provide: CalculationsService, useClass: CalculationsServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(HopsScheduleComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    originalOnChanges = component.ngOnChanges;
    component.ngOnInit = jest.fn();
    component.ngOnChanges = jest.fn();
    component.variant = mockRecipeVariantComplete();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  test('should init the component', (): void => {
    const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
    component.ngOnInit = originalOnInit;
    component.setIBUs = jest.fn();
    const setSpy: jest.SpyInstance = jest.spyOn(component, 'setIBUs');

    fixture.detectChanges();

    component.ngOnInit();
    expect(setSpy).toHaveBeenCalled();
    expect(component.hopsSchedule).toStrictEqual(_mockRecipeVariantComplete.hops);
  });

  test('should init the component', (): void => {
    component.ngOnChanges = originalOnChanges;
    component.setIBUs = jest.fn();
    const setSpy: jest.SpyInstance = jest.spyOn(component, 'setIBUs');

    fixture.detectChanges();

    component.ngOnChanges();
    expect(setSpy).toHaveBeenCalled();
  });

  test('should set IBU values', (): void => {
    const _mockHopsSchedule: HopsSchedule[] = mockHopsSchedule();
    component.hopsSchedule = _mockHopsSchedule;
    let mockIBU: number = 0;
    component.calculateIBU = jest.fn().mockImplementation((): number => {
      mockIBU += 10;
      return mockIBU;
    });

    fixture.detectChanges();

    component.setIBUs();
    component.ibus.forEach((ibu: string, index: number): void => {
      expect(ibu).toMatch(`${index * 10 + 10}.0`)
    });
  });

  test('should calculate IBU for a hops schedule instance', (): void => {
    component.calculator.getIBU = jest.fn().mockReturnValue(0);
    const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
    component.variant = _mockRecipeVariantComplete;
    const _mockHopsSchedule: HopsSchedule = mockHopsSchedule()[0];
    const getSpy: jest.SpyInstance = jest.spyOn(component.calculator, 'getIBU');

    fixture.detectChanges();

    component.calculateIBU(_mockHopsSchedule);
    expect(getSpy).toHaveBeenCalledWith(
      _mockHopsSchedule.hopsType,
      _mockHopsSchedule,
      _mockRecipeVariantComplete.originalGravity,
      _mockRecipeVariantComplete.batchVolume,
      _mockRecipeVariantComplete.boilVolume
    );
  });

  test('should open ingredient form modal', (): void => {
    const _mockHopsSchedule: HopsSchedule = mockHopsSchedule()[0];
    component.openIngredientFormEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.openIngredientFormEvent, 'emit');

    fixture.detectChanges();

    component.openIngredientFormModal(_mockHopsSchedule);
    expect(emitSpy).toHaveBeenCalledWith(_mockHopsSchedule);
  });

  test('should render the template', (): void => {
    const _mockHopsSchedule: HopsSchedule[] = mockRecipeVariantComplete().hops;
    component.ngOnInit = originalOnInit;
    component.ngOnChanges = originalOnChanges;
    component.calculator.getIBU = jest.fn().mockReturnValue(0);

    fixture.detectChanges();

    const items: NodeList = fixture.nativeElement.querySelectorAll('app-hops-schedule-item');
    expect(items.length).toEqual(_mockHopsSchedule.length);
    _mockHopsSchedule.forEach((_mockHops: HopsSchedule, index: number): void => {
      expect(items.item(index)['hops']).toStrictEqual(_mockHops);
    });
  });

});
