/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockGrainBill } from '../../../../test-config/mock-models';
import { RatioPipeStub, UnitConversionPipeStub } from '../../../../test-config/pipe-stubs';

/* Interface imports */
import { GrainBill } from '../../shared/interfaces/grain-bill';

/* Component imports */
import { GrainBillComponent } from './grain-bill.component';


describe('GrainBillComponent', (): void => {
  let fixture: ComponentFixture<GrainBillComponent>;
  let gbCmp: GrainBillComponent;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        GrainBillComponent,
        RatioPipeStub,
        UnitConversionPipeStub
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(GrainBillComponent);
    gbCmp = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(gbCmp).toBeDefined();
  });

  test('should open ingredient form modal via recipe action', (): void => {
    const _mockGrainBill: GrainBill = mockGrainBill()[0];

    gbCmp.onRecipeAction = jest
      .fn();

    const actionSpy: jest.SpyInstance = jest.spyOn(gbCmp, 'onRecipeAction');

    fixture.detectChanges();

    gbCmp.openIngredientFormModal(_mockGrainBill);

    expect(actionSpy).toHaveBeenCalledWith('openIngredientFormModal', ['grains', _mockGrainBill]);
  });

  test('should display grain bill data', (): void => {
    const _mockGrainBill: GrainBill[] = mockGrainBill();

    gbCmp.grainBill = _mockGrainBill;

    fixture.detectChanges();

    const grainBillElements: NodeList = fixture.nativeElement.querySelectorAll('.ingredient-text-container');

    expect(grainBillElements.length).toEqual(3);

    const grainBillElem: Node = grainBillElements.item(0);
    const grainBillElemTopRow = grainBillElem.childNodes.item(0);
    expect(grainBillElemTopRow.childNodes.item(0).textContent).toMatch(_mockGrainBill[0].grainType.name);
    const grainBillElemBottomRow = grainBillElem.childNodes.item(1);
    expect(grainBillElemBottomRow.childNodes.item(1).textContent).toMatch(`${_mockGrainBill[0].grainType.lovibond}°L`);
  });

});
