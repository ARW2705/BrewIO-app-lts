/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockEnglishUnits, mockRecipeVariantComplete, mockStyles } from '@test/mock-models';
import { TruncatePipeStub, UnitConversionPipeStub } from '@test/pipe-stubs';

/* Interface imports */
import { RecipeVariant, SelectedUnits, Style } from '@shared/interfaces';

/* Component imoprts */
import { RecipeQuickDataComponent } from './recipe-quick-data.component';


describe('RecipeQuickDataComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<RecipeQuickDataComponent>;
  let component: RecipeQuickDataComponent;
  const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
  const _mockStyle: Style = mockStyles()[0];

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
    component = fixture.componentInstance;
    component.variant = _mockRecipeVariantComplete;
    component.style = _mockStyle;
    TruncatePipeStub._returnValue = (value: number): string => value.toString();
    UnitConversionPipeStub._returnValue = (value: number, ...args: any[]): string => value.toString();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  test('should render the template header', (): void => {
    fixture.detectChanges();

    const headers: NodeList = fixture.nativeElement.querySelectorAll('.col-header');
    expect((<Element>headers.item(0)).textContent).toMatch('Recipe');
    expect((<Element>headers.item(1)).textContent).toMatch('Style');
  });

  test('should render the template original gravity', (): void => {
    fixture.detectChanges();

    const rows: NodeList = fixture.nativeElement.querySelectorAll('ion-row');
    const ogElement: Element = <Element>rows.item(1);
    const ogRecipeCol: Element = ogElement.children[0];
    expect(ogRecipeCol.textContent).toMatch(`Original Gravity ${_mockRecipeVariantComplete.originalGravity}`);
    const ogStyleCol: Element = ogElement.children[1];
    expect(ogStyleCol.textContent).toMatch(`${_mockStyle.originalGravity[0]} - ${_mockStyle.originalGravity[1]}`);
  });

  test('should render the template final gravity', (): void => {
    fixture.detectChanges();

    const rows: NodeList = fixture.nativeElement.querySelectorAll('ion-row');
    const fgElement: Element = <Element>rows.item(2);
    const fgRecipeCol: Element = fgElement.children[0];
    expect(fgRecipeCol.textContent).toMatch(`Final Gravity ${_mockRecipeVariantComplete.finalGravity}`);
    const fgStyleCol: Element = fgElement.children[1];
    expect(fgStyleCol.textContent).toMatch(`${_mockStyle.finalGravity[0]} - ${_mockStyle.finalGravity[1]}`);
  });

  test('should render the template IBU', (): void => {
    fixture.detectChanges();

    const rows: NodeList = fixture.nativeElement.querySelectorAll('ion-row');
    const ibuElement: Element = <Element>rows.item(3);
    const ibuRecipeCol: Element = ibuElement.children[0];
    expect(ibuRecipeCol.textContent).toMatch(`IBU ${_mockRecipeVariantComplete.IBU}`);
    const ibuStyleCol: Element = ibuElement.children[1];
    expect(ibuStyleCol.textContent).toMatch(`${_mockStyle.IBU[0]} - ${_mockStyle.IBU[1]}`);
  });

  test('should render the template SRM', (): void => {
    fixture.detectChanges();

    const rows: NodeList = fixture.nativeElement.querySelectorAll('ion-row');
    const srmElement: Element = <Element>rows.item(4);
    const srmRecipeCol: Element = srmElement.children[0];
    expect(srmRecipeCol.textContent).toMatch(`SRM ${_mockRecipeVariantComplete.SRM}`);
    const srmStyleCol: Element = srmElement.children[1];
    expect(srmStyleCol.textContent).toMatch(`${_mockStyle.SRM[0]} - ${_mockStyle.SRM[1]}`);
  });

});
