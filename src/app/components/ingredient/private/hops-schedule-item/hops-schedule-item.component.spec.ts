/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockHopsSchedule, mockRecipeVariantComplete } from '@test/mock-models';
import { UnitConversionPipeStub } from '@test/pipe-stubs';

/* Interface imports */
import { HopsSchedule, RecipeVariant } from '@shared/interfaces';

/* Component imports */
import { HopsScheduleItemComponent } from './hops-schedule-item.component';


describe('HopsScheduleItemComponent', (): void => {
  configureTestBed();
  let component: HopsScheduleItemComponent;
  let fixture: ComponentFixture<HopsScheduleItemComponent>;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        HopsScheduleItemComponent,
        UnitConversionPipeStub
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(HopsScheduleItemComponent);
    component = fixture.componentInstance;
    const _mockHopsSchedule: HopsSchedule = mockHopsSchedule()[0];
    component.hops = _mockHopsSchedule;
    component.ibu = '25.0';
    component.isLast = false;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  test('should handle open ingredient form click', (): void => {
    component.openIngredientFormButtonEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.openIngredientFormButtonEvent, 'emit');

    fixture.detectChanges();

    component.openIngredientFormModal();
    expect(emitSpy).toHaveBeenCalled();
  });

  test('should render the template', (): void => {
    const _mockHopsSchedule: HopsSchedule[] = mockHopsSchedule();
    const _mockHopsDryHop: HopsSchedule = _mockHopsSchedule[3];
    const _mockHopsNonDryHop: HopsSchedule = _mockHopsSchedule[0];
    component.hops = _mockHopsNonDryHop;
    UnitConversionPipeStub._returnValue = (value: any) => value;

    fixture.detectChanges();

    const container: HTMLElement = fixture.nativeElement.querySelector('.ingredient-text-container');
    const topRow: Element = container.children[0];
    expect(topRow.children[0].textContent).toMatch(_mockHopsNonDryHop.hopsType.name);
    expect(topRow.children[1].textContent).toMatch(_mockHopsNonDryHop.quantity.toString());
    const nonDryHopRow: Element = container.children[1];
    expect(nonDryHopRow.children[0].textContent).toMatch(`${_mockHopsNonDryHop.hopsType.alphaAcid}% AA`);
    expect(nonDryHopRow.children[1].textContent).toMatch('25.0 IBU');
    expect(nonDryHopRow.children[2].textContent).toMatch(`${_mockHopsNonDryHop.duration}min`);
    component.hops = _mockHopsDryHop;

    fixture.detectChanges();

    const newContainer: HTMLElement = fixture.nativeElement.querySelector('.ingredient-text-container');
    const dryHopRow: Element = newContainer.children[1];
    expect(dryHopRow.children[0].textContent).toMatch('0% AA');
    expect(dryHopRow.children[1].textContent).toMatch('0 IBU');
    expect(dryHopRow.children[2].textContent).toMatch('Dry Hop');
  });

});
