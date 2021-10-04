/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockRecipeVariantComplete } from '../../../../../../test-config/mock-models';
import { RoundPipeStub, TruncatePipeStub, UnitConversionPipeStub } from '../../../../../../test-config/pipe-stubs';

/* Interface imports */
import { RecipeVariant } from '../../../../shared/interfaces';

/* Component imports */
import { RecipeSliderContentValuesComponent } from './recipe-slider-content-values.component';


describe('RecipeSliderContentValuesComponent', (): void => {
  let fixture: ComponentFixture<RecipeSliderContentValuesComponent>;
  let component: RecipeSliderContentValuesComponent;
  const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        RecipeSliderContentValuesComponent,
        RoundPipeStub,
        TruncatePipeStub,
        UnitConversionPipeStub
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(RecipeSliderContentValuesComponent);
    component = fixture.componentInstance;
    component.variant = _mockRecipeVariantComplete;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

});
