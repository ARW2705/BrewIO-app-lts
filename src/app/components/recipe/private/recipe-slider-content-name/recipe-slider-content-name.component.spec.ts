/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockRecipeMasterActive } from '../../../../../../test-config/mock-models';

/* Interface imports */
import { RecipeMaster } from '../../../../shared/interfaces';

/* Component imports */
import { RecipeSliderContentNameComponent } from './recipe-slider-content-name.component';


describe('RecipeSliderContentNameComponent', (): void => {
  let fixture: ComponentFixture<RecipeSliderContentNameComponent>;
  let component: RecipeSliderContentNameComponent;
  const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ RecipeSliderContentNameComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(RecipeSliderContentNameComponent);
    component = fixture.componentInstance;
    component.recipe = _mockRecipeMasterActive;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

});
