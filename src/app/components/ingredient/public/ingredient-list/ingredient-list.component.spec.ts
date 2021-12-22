/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockRecipeVariantComplete, mockRecipeVariantIncomplete } from '../../../../../../test-config/mock-models';

/* Interface imports */
import { RecipeVariant } from '../../../../shared/interfaces';

/* Component imports */
import { IngredientListComponent } from './ingredient-list.component';


describe('IngredientListComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<IngredientListComponent>;
  let component: IngredientListComponent;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ IngredientListComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(IngredientListComponent);
    component = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  test('should set has ingredients flag based on variant ingredients list', (): void => {
    const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
    const _mockRecipeVariantIncomplete: RecipeVariant = mockRecipeVariantIncomplete();

    component.recipeVariant = _mockRecipeVariantIncomplete;

    fixture.detectChanges();
    component.ngOnChanges();
    expect(component.hasIngredients).toBe(false);

    _mockRecipeVariantIncomplete.grains = _mockRecipeVariantComplete.grains;
    fixture.detectChanges();
    component.ngOnChanges();
    expect(component.hasIngredients).toBe(true);

    _mockRecipeVariantIncomplete.grains = [];
    _mockRecipeVariantIncomplete.hops = _mockRecipeVariantComplete.hops;
    fixture.detectChanges();
    component.ngOnChanges();
    expect(component.hasIngredients).toBe(true);

    _mockRecipeVariantIncomplete.hops = [];
    _mockRecipeVariantIncomplete.yeast = _mockRecipeVariantComplete.yeast;
    fixture.detectChanges();
    component.ngOnChanges();
    expect(component.hasIngredients).toBe(true);

    _mockRecipeVariantIncomplete.yeast = [];
    _mockRecipeVariantIncomplete.otherIngredients = _mockRecipeVariantComplete.otherIngredients;
    fixture.detectChanges();
    component.ngOnChanges();
    expect(component.hasIngredients).toBe(true);
  });

  test('should display empty message if no ingredients', (): void => {
    const _mockRecipeVariant: RecipeVariant = mockRecipeVariantComplete();
    component.hasIngredients = false;
    component.recipeVariant = _mockRecipeVariant;

    fixture.detectChanges();

    const message: HTMLElement = fixture.nativeElement.querySelector('.no-ingredients');
    expect(message.textContent).toMatch('No Ingredients Provided Yet!');
  });

  test('should display list items', (): void => {
    const _mockRecipeVariant: RecipeVariant = mockRecipeVariantComplete();
    component.recipeVariant = _mockRecipeVariant;
    component.hasIngredients = true;

    fixture.detectChanges();

    const items: NodeList = fixture.nativeElement.querySelectorAll('app-ingredient-list-item');
    expect(items.item(0)['ingredients']).toStrictEqual(_mockRecipeVariant.grains);
    expect(items.item(1)['ingredients']).toStrictEqual(_mockRecipeVariant.hops);
    expect(items.item(2)['ingredients']).toStrictEqual(_mockRecipeVariant.yeast);
    expect(items.item(3)['ingredients']).toStrictEqual(_mockRecipeVariant.otherIngredients);
  });

});
