/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockGrainBill } from '../../../../test-config/mock-models';

/* Interface imports */
import { GrainBill } from '../../shared/interfaces';

/* Component imports */
import { GrainBillComponent } from './grain-bill.component';


describe('GrainBillComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<GrainBillComponent>;
  let component: GrainBillComponent;
  let originalOnChanges: any;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ GrainBillComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(GrainBillComponent);
    component = fixture.componentInstance;
    originalOnChanges = component.ngOnChanges;
    component.ngOnChanges = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  test('should call setRatios on component changes', (): void => {
    component.setRatios = jest.fn();
    const setSpy: jest.SpyInstance = jest.spyOn(component, 'setRatios');
    component.ngOnChanges = originalOnChanges;

    fixture.detectChanges();

    component.ngOnChanges();
    expect(setSpy).toHaveBeenCalled();
  });

  test('should check if a grain instance contributes to fermentation', (): void => {
    const _mockGrainBill: GrainBill[] = mockGrainBill();
    const _mockFermentable: GrainBill = _mockGrainBill[0];
    const _mockNonFermentable: GrainBill = _mockGrainBill[1];
    _mockNonFermentable.grainType.gravity = 0;

    fixture.detectChanges();

    expect(component.contributesFermentable(_mockFermentable)).toBe(true);
    expect(component.contributesFermentable(_mockNonFermentable)).toBe(false);
  });

  test('should get total grains quantity', (): void => {
    const _mockGrainBill: GrainBill[] = mockGrainBill(); // total quantity 12.5
    component.grainBill = _mockGrainBill;
    component.contributesFermentable = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false) // mock second instance as not contributing 2
      .mockReturnValueOnce(true);

    fixture.detectChanges();

    expect(component.getTotalGristQuantity()).toEqual(10.5);
  });

  test('should handle open form modal click', (): void => {
    const _mockGrainBill: GrainBill = mockGrainBill()[0];
    component.openIngredientFormEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.openIngredientFormEvent, 'emit');

    fixture.detectChanges();

    component.openIngredientFormModal(_mockGrainBill);
    expect(emitSpy).toHaveBeenCalledWith(_mockGrainBill);
  });

  test('should set ratios of grains instances to total', (): void => {
    const _mockGrainBill: GrainBill[] = mockGrainBill(); // total quantity 10.5; 10, 2 (ignore), 0.5
    component.grainBill = _mockGrainBill;
    component.getTotalGristQuantity = jest.fn().mockReturnValue(10.5);
    component.contributesFermentable = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    fixture.detectChanges();

    component.setRatios();
    expect(component.ratios[0]).toMatch('95.2%');
    expect(component.ratios[1]).toMatch('0%');
    expect(component.ratios[2]).toMatch('4.8%');
  });

  test('should render the component', (): void => {
    const _mockGrainBill: GrainBill[] = mockGrainBill();
    component.grainBill = _mockGrainBill;
    component.ratios = [ '80%', '16%', '4%' ];

    fixture.detectChanges();

    const items: NodeList = global.document.querySelectorAll('app-grain-bill-item');
    const first: HTMLElement = <HTMLElement>items.item(0);
    expect(first['grains']).toStrictEqual(_mockGrainBill[0]);
    expect(first['ratio']).toMatch('80%');
    const second: HTMLElement = <HTMLElement>items.item(1);
    expect(second['grains']).toStrictEqual(_mockGrainBill[1]);
    expect(second['ratio']).toMatch('16%');
    const last: HTMLElement = <HTMLElement>items.item(2);
    expect(last['grains']).toStrictEqual(_mockGrainBill[2]);
    expect(last['ratio']).toMatch('4%');
  });

});
