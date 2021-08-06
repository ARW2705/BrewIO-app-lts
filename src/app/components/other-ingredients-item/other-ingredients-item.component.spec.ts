/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockOtherIngredients } from '../../../../test-config/mock-models';

/* Interface imports */
import { OtherIngredients } from '../../shared/interfaces';

/* Component imports */
import { OtherIngredientsItemComponent } from './other-ingredients-item.component';


describe('OtherIngredientsItemComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<OtherIngredientsItemComponent>;
  let component: OtherIngredientsItemComponent;
  const _mockOtherIngredient: OtherIngredients = mockOtherIngredients()[0];

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ OtherIngredientsItemComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(OtherIngredientsItemComponent);
    component = fixture.componentInstance;
    component.other = _mockOtherIngredient;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  test('should open ingredient form modal', (): void => {
    component.openIngredientFormButtonEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.openIngredientFormButtonEvent, 'emit');

    fixture.detectChanges();

    component.openIngredientFormModal();
    expect(emitSpy).toHaveBeenCalled();
  });

  test('should render the template', (): void => {
    fixture.detectChanges();

    const container: HTMLElement = global.document.querySelector('ion-row');
    const icon: Element = container.children[0].children[0];
    expect(icon.attributes.item(1).value).toMatch('create-outline');
    const contentContainer: Element = container.children[1];
    expect(contentContainer.children[0].children[0].textContent).toMatch(_mockOtherIngredient.name);
    expect(contentContainer.children[0].children[1].textContent).toMatch(`${_mockOtherIngredient.quantity} ${_mockOtherIngredient.units}`);
    expect(contentContainer.children[1].children[0].textContent.toLowerCase()).toMatch(`${_mockOtherIngredient.type}: ${_mockOtherIngredient.description}`);
  });

});
