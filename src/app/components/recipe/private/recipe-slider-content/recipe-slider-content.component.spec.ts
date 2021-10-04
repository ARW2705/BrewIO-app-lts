/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockRecipeMasterActive } from '../../../../../../test-config/mock-models';

/* Interface imports */
import { RecipeMaster, RecipeVariant } from '../../../../shared/interfaces';

/* Component imports */
import { RecipeSliderContentComponent } from './recipe-slider-content.component';


describe('RecipeSliderContentComponent', (): void => {
  let fixture: ComponentFixture<RecipeSliderContentComponent>;
  let component: RecipeSliderContentComponent;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ RecipeSliderContentComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(RecipeSliderContentComponent);
    component = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should emit expand ingredient list event', (): void => {
    component.expandIngredientListEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.expandIngredientListEvent, 'emit');

    fixture.detectChanges();

    component.expandIngredientList();
    expect(emitSpy).toHaveBeenCalled();
  });

  test('should render the template', (): void => {
    const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
    const _mockRecipeVariant: RecipeVariant = _mockRecipeMasterActive.variants[0];
    component.recipe = _mockRecipeMasterActive;
    component.variant = _mockRecipeVariant;

    fixture.detectChanges();

    const nameElem: HTMLElement = fixture.nativeElement.querySelector('app-recipe-slider-content-name');
    expect(nameElem['recipe']).toStrictEqual(_mockRecipeMasterActive);
    const valuesElem: HTMLElement = fixture.nativeElement.querySelector('app-recipe-slider-content-values');
    expect(valuesElem['variant']).toStrictEqual(_mockRecipeVariant);
  });

});
