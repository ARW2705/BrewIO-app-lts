/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

/* Configure test bed import */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockGrainBill } from '@test/mock-models';
import { RatioPipeStub, UnitConversionPipeStub } from '@test/pipe-stubs';

/* Interface imports */
import { GrainBill } from '@shared/interfaces';

/* Component imports */
import { GrainBillItemComponent } from './grain-bill-item.component';


describe('GrainBillItemComponent', (): void => {
  configureTestBed();
  let component: GrainBillItemComponent;
  let fixture: ComponentFixture<GrainBillItemComponent>;
  const _mockGrainBill: GrainBill = mockGrainBill()[0];

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        GrainBillItemComponent,
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
    fixture = TestBed.createComponent(GrainBillItemComponent);
    component = fixture.componentInstance;
    component.grains = _mockGrainBill;
    component.isLast = false;
    component.ratio = '80%';
    component.openIngredientFormButtonEvent.emit = jest.fn();
    UnitConversionPipeStub._returnValue = jest.fn()
      .mockImplementation((value: any, ...options: any): string => {
        return value;
      });
  });

  test('should create component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should handle open ingredient form modal click', (): void => {
    const emitSpy: jest.SpyInstance = jest.spyOn(component.openIngredientFormButtonEvent, 'emit');

    fixture.detectChanges();

    component.openIngredientFormModal();
    expect(emitSpy).toHaveBeenCalled();
  });

  test('should render the template', (): void => {
    fixture.detectChanges();

    const textContainer: HTMLElement = fixture.nativeElement.querySelector('.ingredient-text-container');
    const topRow: Element = textContainer.children[0];
    expect(topRow.children[0].textContent).toMatch(_mockGrainBill.grainType.name);
    expect(topRow.children[1].textContent).toMatch(_mockGrainBill.quantity.toString());
    const bottomRow: Element = textContainer.children[1];
    expect(bottomRow.children[0].textContent).toMatch(_mockGrainBill.grainType.gravity.toString());
    expect(bottomRow.children[1].textContent).toMatch(`${_mockGrainBill.grainType.lovibond}°L`);
    expect(bottomRow.children[2].textContent).toMatch(_mockGrainBill.mill.toString());
    expect(bottomRow.children[3].textContent).toMatch('80%');
  });

});
