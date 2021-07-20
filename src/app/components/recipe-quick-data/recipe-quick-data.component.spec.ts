/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockEnglishUnits, mockStyles, mockRecipeVariantComplete } from '../../../../test-config/mock-models';
import { TruncatePipeStub, UnitConversionPipeStub } from '../../../../test-config/pipe-stubs';

/* Interface imports */
import { RecipeVariant, SelectedUnits, Style } from '../../shared/interfaces';

/* Component imoprts */
import { RecipeQuickDataComponent } from './recipe-quick-data.component';


describe('RecipeQuickDataComponent', (): void => {
  let fixture: ComponentFixture<RecipeQuickDataComponent>;
  let quickCmp: RecipeQuickDataComponent;
  configureTestBed();

  beforeEach((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        RecipeQuickDataComponent,
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
    fixture = TestBed.createComponent(RecipeQuickDataComponent);
    quickCmp = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(quickCmp).toBeDefined();
  });

  test('should render the template with original gravity', (): void => {
    const _mockStyle: Style = mockStyles()[0];
    const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

    quickCmp.variant = _mockRecipeVariantComplete;
    quickCmp.style = _mockStyle;

    UnitConversionPipeStub._returnValue = (value: string): string => {
      return value;
    };

    fixture.detectChanges();

    const rows: NodeList = fixture.nativeElement.querySelectorAll('ion-row');
    const originalGravity: HTMLElement = <HTMLElement>rows.item(0);

    const gravityValue: Element = originalGravity.children[0];
    expect(gravityValue.textContent).toMatch(`Original Gravity ${_mockRecipeVariantComplete.originalGravity}`);

    const gravityRange: Element = originalGravity.children[1];
    expect(gravityRange.textContent).toMatch(`${_mockStyle.originalGravity[0]} - ${_mockStyle.originalGravity[1]}`);
  });

  test('should render the template with final gravity', (): void => {
    const _mockStyle: Style = mockStyles()[0];
    const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();

    quickCmp.variant = _mockRecipeVariantComplete;
    quickCmp.style = _mockStyle;

    UnitConversionPipeStub._returnValue = (value: string, unitType: string, showSymbol: boolean): string => {
      return `${value}${showSymbol ? _mockEnglishUnits.density.symbol : ''}`;
    };

    fixture.detectChanges();

    const rows: NodeList = fixture.nativeElement.querySelectorAll('ion-row');
    const finalGravity: HTMLElement = <HTMLElement>rows.item(1);

    const gravityValue: Element = finalGravity.children[0];
    expect(gravityValue.textContent).toMatch(`Final Gravity ${_mockRecipeVariantComplete.finalGravity}${_mockEnglishUnits.density.symbol}`);

    const gravityRange: Element = finalGravity.children[1];
    expect(gravityRange.textContent).toMatch(`${_mockStyle.finalGravity[0]} - ${_mockStyle.finalGravity[1]}`);
  });

  test('should render the template with ibu', (): void => {
    const _mockStyle: Style = mockStyles()[0];
    const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

    quickCmp.variant = _mockRecipeVariantComplete;
    quickCmp.style = _mockStyle;

    TruncatePipeStub._returnValue = (value: number, places: number): string => {
      return value.toFixed(places);
    };

    fixture.detectChanges();

    const rows: NodeList = fixture.nativeElement.querySelectorAll('ion-row');
    const ibu: HTMLElement = <HTMLElement>rows.item(2);

    const ibuValue: Element = ibu.children[0];
    expect(ibuValue.textContent).toMatch(_mockRecipeVariantComplete.IBU.toFixed(1));

    const styleIbuValue: Element = ibu.children[1];
    expect(styleIbuValue.textContent).toMatch(`${_mockStyle.IBU[0]} - ${_mockStyle.IBU[1]}`);
  });

  test('should render the template with ibu without style ibu', (): void => {
    const _mockStyle: Style = mockStyles()[0];
    _mockStyle._id = '-1';
    const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

    quickCmp.variant = _mockRecipeVariantComplete;
    quickCmp.style = _mockStyle;

    TruncatePipeStub._returnValue = (value: number, places: number): string => {
      return value.toFixed(places);
    };

    fixture.detectChanges();

    const rows: NodeList = fixture.nativeElement.querySelectorAll('ion-row');
    const ibu: HTMLElement = <HTMLElement>rows.item(2);

    const ibuValue: Element = ibu.children[0];
    expect(ibuValue.textContent).toMatch(_mockRecipeVariantComplete.IBU.toFixed(1));

    const styleIbuValue: Element = ibu.children[1];
    expect(styleIbuValue.textContent).toMatch('-- - --');
  });

  test('should render the template with srm', (): void => {
    const _mockStyle: Style = mockStyles()[0];
    const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

    quickCmp.variant = _mockRecipeVariantComplete;
    quickCmp.style = _mockStyle;

    TruncatePipeStub._returnValue = (value: number, places: number): string => {
      return value.toFixed(places);
    };

    fixture.detectChanges();

    const rows: NodeList = fixture.nativeElement.querySelectorAll('ion-row');
    const srm: HTMLElement = <HTMLElement>rows.item(2);

    const srmValue: Element = srm.children[0];
    expect(srmValue.textContent).toMatch(_mockRecipeVariantComplete.IBU.toFixed(1));

    const styleIbuValue: Element = srm.children[1];
    expect(styleIbuValue.textContent).toMatch(`${_mockStyle.IBU[0]} - ${_mockStyle.IBU[1]}`);
  });

  test('should render the template with srm without style srm', (): void => {
    const _mockStyle: Style = mockStyles()[0];
    _mockStyle._id = '-1';
    const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

    quickCmp.variant = _mockRecipeVariantComplete;
    quickCmp.style = _mockStyle;

    TruncatePipeStub._returnValue = (value: number, places: number): string => {
      return value.toFixed(places);
    };

    fixture.detectChanges();

    const rows: NodeList = fixture.nativeElement.querySelectorAll('ion-row');
    const srm: HTMLElement = <HTMLElement>rows.item(2);

    const srmValue: Element = srm.children[0];
    expect(srmValue.textContent).toMatch(_mockRecipeVariantComplete.IBU.toFixed(1));

    const styleIbuValue: Element = srm.children[1];
    expect(styleIbuValue.textContent).toMatch('-- - --');
  });

});
