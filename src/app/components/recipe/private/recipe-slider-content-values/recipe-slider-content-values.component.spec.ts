/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockRecipeVariantComplete } from '@test/mock-models';
import { RoundPipeStub, TruncatePipeStub, UnitConversionPipeStub } from '@test/pipe-stubs';

/* Interface imports */
import { RecipeVariant } from '@shared/interfaces';

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
    RoundPipeStub._returnValue = (value: number): number => value;
    TruncatePipeStub._returnValue = (value: number): string => value.toString();
    UnitConversionPipeStub._returnValue = (value: number, ...args: any[]): string => value.toString();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  test('should render the template', (): void => {
    fixture.detectChanges();

    const spans: NodeList = fixture.nativeElement.querySelectorAll('span');
    const volumeElem: Element = <Element>spans.item(1);
    expect(volumeElem.textContent).toMatch(_mockRecipeVariantComplete.batchVolume.toString());
    const abvElem: Element = <Element>spans.item(3);
    expect(abvElem.textContent).toMatch(`${_mockRecipeVariantComplete.ABV}% ABV`);
    const ibuElem: Element = <Element>spans.item(5);
    expect(ibuElem.textContent).toMatch(`${_mockRecipeVariantComplete.IBU} IBU`);
    const srmElem: Element = <Element>spans.item(7);
    expect(srmElem.textContent).toMatch(`${_mockRecipeVariantComplete.SRM} SRM`);
  });

});
