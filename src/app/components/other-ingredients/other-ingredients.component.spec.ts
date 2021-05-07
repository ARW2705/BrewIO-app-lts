/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockOtherIngredients } from '../../../../test-config/mock-models';

/* Interface imports */
import { OtherIngredients } from '../../shared/interfaces/other-ingredients';

/* Component imports */
import { OtherIngredientsComponent } from './other-ingredients.component';


describe('OtherIngredientsComponent', (): void => {
  let fixture: ComponentFixture<OtherIngredientsComponent>;
  let oiCmp: OtherIngredientsComponent;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ OtherIngredientsComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(OtherIngredientsComponent);
    oiCmp = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(oiCmp).toBeDefined();
  });

  test('should open ingredient modal form via recipe action', (): void => {
    const _mockOtherIngredients: OtherIngredients = mockOtherIngredients()[0];

    oiCmp.onRecipeAction = jest
      .fn();

    const actionSpy: jest.SpyInstance = jest.spyOn(oiCmp, 'onRecipeAction');

    fixture.detectChanges();

    oiCmp.openIngredientFormModal(_mockOtherIngredients);

    expect(actionSpy).toHaveBeenCalledWith('openIngredientFormModal', ['otherIngredients', _mockOtherIngredients]);
  });

  test('should display an \'other\' ingredient', (): void => {
    const _mockOtherIngredients: OtherIngredients[] = mockOtherIngredients();
    _mockOtherIngredients[0].type = 'Flavor';
    _mockOtherIngredients[1].type = 'Water treatment';

    oiCmp.otherIngredients = _mockOtherIngredients;

    fixture.detectChanges();

    const itemList: NodeList = fixture.nativeElement.querySelectorAll('.item-buttons');

    const firstItem: HTMLElement = <HTMLElement>itemList.item(0).parentNode;
    const firstItemTextContainer: Element = firstItem.querySelector('.ingredient-text-container');
    const firstItemName: string = firstItemTextContainer.children[0].children[0].textContent;
    expect(firstItemName).toMatch(_mockOtherIngredients[0].name);
    const firstItemQuantityAndUnit: string = firstItemTextContainer.children[0].children[1].textContent;
    expect(firstItemQuantityAndUnit).toMatch(`${_mockOtherIngredients[0].quantity} ${_mockOtherIngredients[0].units}`);
    const firstItemDescription: string = firstItemTextContainer.children[1].children[0].textContent;
    expect(firstItemDescription).toMatch(`${_mockOtherIngredients[0].type}: ${_mockOtherIngredients[0].description}`);

    const secondItem: HTMLElement = <HTMLElement>itemList.item(1).parentNode;
    const secondItemTextContainer: Element = secondItem.querySelector('.ingredient-text-container');
    const secondItemName: string = secondItemTextContainer.children[0].children[0].textContent;
    expect(secondItemName).toMatch(_mockOtherIngredients[0].name);
    const secondItemQuantityAndUnit: string = secondItemTextContainer.children[0].children[1].textContent;
    expect(secondItemQuantityAndUnit).toMatch(`${_mockOtherIngredients[0].quantity} ${_mockOtherIngredients[0].units}`);
    const secondItemDescription: string = secondItemTextContainer.children[1].children[0].textContent;
    expect(secondItemDescription).toMatch(`${_mockOtherIngredients[0].type}: ${_mockOtherIngredients[0].description}`);
  });

});
