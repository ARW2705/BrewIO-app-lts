/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockOtherIngredients } from '../../../../../../test-config/mock-models';

/* Interface imports */
import { OtherIngredients } from '../../../../shared/interfaces';

/* Component imports */
import { OtherIngredientsComponent } from './other-ingredients.component';


describe('OtherIngredientsComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<OtherIngredientsComponent>;
  let component: OtherIngredientsComponent;

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
    component = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  test('should open ingredient form modal', (): void => {
    const _mockOtherIngredient: OtherIngredients = mockOtherIngredients()[0];
    component.openIngredientFormEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.openIngredientFormEvent, 'emit');

    fixture.detectChanges();

    component.openIngredientFormModal(_mockOtherIngredient);
    expect(emitSpy).toHaveBeenLastCalledWith(_mockOtherIngredient);
  });

  test('should render the template', (): void => {
    const _mockOtherIngredients: OtherIngredients[] = mockOtherIngredients();
    component.otherIngredients = _mockOtherIngredients;

    fixture.detectChanges();

    const items: NodeList = fixture.nativeElement.querySelectorAll('app-other-ingredients-item');
    expect(items.length).toEqual(_mockOtherIngredients.length);
    _mockOtherIngredients.forEach((other: OtherIngredients, index: number): void => {
      expect(items.item(index)['other']).toStrictEqual(other);
    })
  });

});
