/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockRecipeMasterActive } from '../../../../test-config/mock-models';

/* Interface imports */
import { RecipeMaster, RecipeVariant } from '../../shared/interfaces';

/* Component imports */
import { RecipeSliderComponent } from './recipe-slider.component';


describe('RecipeSliderComponent', (): void => {
  let fixture: ComponentFixture<RecipeSliderComponent>;
  let component: RecipeSliderComponent;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ RecipeSliderComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(RecipeSliderComponent);
    component = fixture.componentInstance;
    component.confirmDeleteEvent.emit = jest.fn();
    component.expandIngredientListEvent.emit = jest.fn();
    component.navToBrewProcessEvent.emit = jest.fn();
    component.navToDetailsEvent.emit = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });


  describe('Component Events', (): void => {

    test('should emit confirm delete event', (): void => {
      const emitSpy: jest.SpyInstance = jest.spyOn(component.confirmDeleteEvent, 'emit');

      fixture.detectChanges();

      component.confirmDelete();
      expect(emitSpy).toHaveBeenCalled();
    });

    test('should emit expand ingredient list event', (): void => {
      const emitSpy: jest.SpyInstance = jest.spyOn(component.expandIngredientListEvent, 'emit');

      fixture.detectChanges();

      component.expandIngredientList();
      expect(emitSpy).toHaveBeenCalled();
    });

    test('should emit nav to brew process event', (): void => {
      const emitSpy: jest.SpyInstance = jest.spyOn(component.navToBrewProcessEvent, 'emit');

      fixture.detectChanges();

      component.navToBrewProcess();
      expect(emitSpy).toHaveBeenCalled();
    });

    test('should emit nav to details event', (): void => {
      const emitSpy: jest.SpyInstance = jest.spyOn(component.navToDetailsEvent, 'emit');

      fixture.detectChanges();

      component.navToDetails();
      expect(emitSpy).toHaveBeenCalled();
    });

  });


  describe('Template Rendering', (): void => {

    beforeAll((): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockRecipeVariant: RecipeVariant = _mockRecipeMasterActive.variants[0];
      component.recipe = _mockRecipeMasterActive;
      component.variant = _mockRecipeVariant;
    });

    test('should render a delete option', (): void => {
      fixture.detectChanges();

      const options: NodeList = fixture.nativeElement.querySelectorAll('ion-item-option');
      const deleteOption: Element = <Element>options.item(0);
      const deleteIcon: Element = deleteOption.children[0].children[0];
      expect(deleteIcon.getAttribute('name')).toMatch('trash');
      const deleteText: Element = deleteOption.children[0].children[1];
      expect(deleteText.textContent).toMatch('Delete');
    });

    test('should render the slider content', (): void => {
      fixture.detectChanges();

      const content: Element = fixture.nativeElement.querySelector('app-recipe-slider-content');
      expect(content).toBeTruthy();
    });

    test('should render a nav to brew option', (): void => {
      fixture.detectChanges();

      const options: NodeList = fixture.nativeElement.querySelectorAll('ion-item-option');
      const brewOption: Element = <Element>options.item(1);
      const brewIcon: Element = brewOption.children[0].children[0];
      expect(brewIcon.getAttribute('name')).toMatch('beer');
      const brewText: Element = brewOption.children[0].children[1];
      expect(brewText.textContent).toMatch('Brew');
    });

    test('should render a nav to details option', (): void => {
      fixture.detectChanges();

      const options: NodeList = fixture.nativeElement.querySelectorAll('ion-item-option');
      const detailsOption: Element = <Element>options.item(2);
      const detailsIcon: Element = detailsOption.children[0].children[0];
      expect(detailsIcon.getAttribute('name')).toMatch('menu');
      const detailsText: Element = detailsOption.children[0].children[1];
      expect(detailsText.textContent).toMatch('Details');
    });

  });

});
