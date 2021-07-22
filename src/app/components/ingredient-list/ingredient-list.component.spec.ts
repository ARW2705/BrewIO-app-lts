/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockRecipeVariantComplete } from '../../../../test-config/mock-models';
import { UnitConversionPipeStub } from '../../../../test-config/pipe-stubs';

/* Interface imports */
import { RecipeVariant } from '../../shared/interfaces';

/* Component imports */
import { IngredientListComponent } from './ingredient-list.component';


describe('IngredientListComponent', (): void => {
  let fixture: ComponentFixture<IngredientListComponent>;
  let ilCmp: IngredientListComponent;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        IngredientListComponent,
        UnitConversionPipeStub
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(IngredientListComponent);
    ilCmp = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(ilCmp).toBeDefined();
  });

  test('should display lists of ingredients of a recipe', (): void => {
    const _mockRecipeVariant: RecipeVariant = mockRecipeVariantComplete();
    const grainsCount: number = _mockRecipeVariant.grains.length;
    const hopsCount: number = _mockRecipeVariant.hops.length;
    const yeastCount: number = _mockRecipeVariant.yeast.length;

    ilCmp.recipeVariant = _mockRecipeVariant;

    fixture.detectChanges();

    const ingredientLists: NodeList = fixture.nativeElement.querySelectorAll('.ingredient-row');

    // grain nodes
    for (let i = 0; i < grainsCount; i++) {
      const grainNodes: NodeList = ingredientLists.item(i).childNodes;
      expect(grainNodes.item(0).textContent).toMatch(_mockRecipeVariant.grains[i].grainType.name);
    }

    // hops nodes
    for (let i = 0; i < hopsCount; i++) {
      const hopsNodes: NodeList = ingredientLists.item(grainsCount + i).childNodes;
      expect(hopsNodes.item(0).textContent).toMatch(_mockRecipeVariant.hops[i].hopsType.name);
    }

    // yeast nodes
    for (let i = 0; i < yeastCount; i++) {
      const yeastNodes: NodeList = ingredientLists.item(grainsCount + hopsCount + i).childNodes;
      expect(yeastNodes.item(0).textContent).toMatch(_mockRecipeVariant.yeast[i].yeastType.name);
    }

    // other ingredient nodes
    for (let i = 0; i < yeastCount; i++) {
      const otherNodes: NodeList = ingredientLists.item(grainsCount + hopsCount + yeastCount + i).childNodes;
      expect(otherNodes.item(0).textContent).toMatch(_mockRecipeVariant.otherIngredients[i].name);
    }
  });

});
