/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockGrainBill, mockHopsSchedule, mockOtherIngredients, mockYeastBatch } from '@test/mock-models';
import { UnitConversionPipeStub } from '@test/pipe-stubs';

/* Interface imports */
import { GrainBill, HopsSchedule, OtherIngredients, YeastBatch } from '@shared/interfaces';

/* Component imports */
import { IngredientListItemComponent } from './ingredient-list-item.component';


describe('IngredientListItemComponent', () => {
  configureTestBed();
  let fixture: ComponentFixture<IngredientListItemComponent>;
  let component: IngredientListItemComponent;
  let originalOnInit: any;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        IngredientListItemComponent,
        UnitConversionPipeStub
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(IngredientListItemComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    component.ngOnInit = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  test('should init the component', (): void => {
    const _mockGrainBill: GrainBill[] = mockGrainBill();
    component.ingredients = _mockGrainBill;
    component.ingredientType = 'grainType';
    component.ingredientNames = _mockGrainBill.map((_grains: GrainBill): string => '');
    component.setIngredientType = jest.fn();
    component.setNames = jest.fn();
    component.setTitle = jest.fn();
    const ingredientSpy: jest.SpyInstance = jest.spyOn(component, 'setIngredientType');
    const nameSpy: jest.SpyInstance = jest.spyOn(component, 'setNames');
    const titleSpy: jest.SpyInstance = jest.spyOn(component, 'setTitle');
    component.ngOnInit = originalOnInit;

    fixture.detectChanges();

    component.ngOnInit();
    expect(ingredientSpy).toHaveBeenCalled();
    expect(nameSpy).toHaveBeenCalled();
    expect(titleSpy).toHaveBeenCalled();
  });

  test('should set ingredient type', (): void => {
    const _mockGrainBill: GrainBill[] = mockGrainBill();
    const _mockHopsSchedule: HopsSchedule[] = mockHopsSchedule();
    const _mockOtherIngredients: OtherIngredients[] = mockOtherIngredients();
    const _mockYeastBatch: YeastBatch[] = mockYeastBatch();
    component.ingredients = _mockGrainBill;
    component.setIngredientType();
    expect(component.ingredientType).toMatch('grainType');
    component.ingredients = _mockHopsSchedule;
    component.setIngredientType();
    expect(component.ingredientType).toMatch('hopsType');
    component.ingredients = _mockOtherIngredients;
    component.setIngredientType();
    expect(component.ingredientType).toMatch('otherType');
    component.ingredients = _mockYeastBatch;
    component.setIngredientType();
    expect(component.ingredientType).toMatch('yeastType');
  });

  test('should set ingredient names', (): void => {
    const _mockHopsSchedule: HopsSchedule[] = mockHopsSchedule();
    const hopsNames: string[] = _mockHopsSchedule.map((_mockHops: HopsSchedule): string => {
      return _mockHops.hopsType.name
    });
    component.ingredients = _mockHopsSchedule;
    component.ingredientType = 'hopsType';
    component.setNames();
    component.ingredientNames.forEach((name: string, index: number): void => {
      expect(name).toMatch(hopsNames[index]);
    });
    const _mockOtherIngredients: OtherIngredients[] = mockOtherIngredients();
    const otherNames: string[] = _mockOtherIngredients.map((_mockOther: OtherIngredients): string => {
      return _mockOther.name;
    });
    component.ingredients = _mockOtherIngredients;
    component.ingredientType = 'otherType';
    component.setNames();
    component.ingredientNames.forEach((name: string, index: number): void => {
      expect(name).toMatch(otherNames[index]);
    });
  });

  test('should set the title', (): void => {
    component.ingredientType = 'grainType';
    component.setTitle();
    expect(component.title).toMatch('grain');
  });

  test('should render the template', (): void => {
    const _mockGrainBill: GrainBill[] = mockGrainBill();
    component.ingredients = _mockGrainBill;
    component.ngOnInit = originalOnInit;
    UnitConversionPipeStub._returnValue = (value: any): any => value;

    fixture.detectChanges();

    const titleElem: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(titleElem.textContent).toMatch('Grain');
    const container: HTMLElement = fixture.nativeElement.querySelector('ion-grid');
    expect(container.children.length).toEqual(_mockGrainBill.length);
    const sampleContainer: Element = container.children[0];
    expect(sampleContainer.children[0].textContent).toMatch(_mockGrainBill[0].grainType.name);
    expect(sampleContainer.children[1].textContent).toMatch(_mockGrainBill[0].quantity.toString());
  });

});
