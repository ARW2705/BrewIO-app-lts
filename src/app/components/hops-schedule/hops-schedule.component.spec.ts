/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange, SimpleChanges } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockHopsSchedule, mockRecipeVariantComplete } from '../../../../test-config/mock-models';
import { CalculatePipeStub, UnitConversionPipeStub } from '../../../../test-config/pipe-stubs';

/* Interface imports */
import { HopsSchedule } from '../../shared/interfaces/hops-schedule';

/* Component imports */
import { HopsScheduleComponent } from './hops-schedule.component';


describe('HopsSchedule', (): void => {
  let fixture: ComponentFixture<HopsScheduleComponent>;
  let hsCmp: HopsScheduleComponent;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        HopsScheduleComponent,
        CalculatePipeStub,
        UnitConversionPipeStub
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(HopsScheduleComponent);
    hsCmp = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(hsCmp).toBeDefined();
  });

  test('should handle input change', (): void => {
    const _mockHopsSchedule: HopsSchedule[] = mockHopsSchedule();
    const hopsChange: SimpleChanges = {
      variant: new SimpleChange(null, mockRecipeVariantComplete(), false),
      hops: new SimpleChange(null, _mockHopsSchedule, false)
    };

    expect(hsCmp.hopsSchedule.length).toEqual(0);

    fixture.detectChanges();

    hsCmp.ngOnChanges(hopsChange);

    expect(hsCmp.hopsSchedule).toStrictEqual(_mockHopsSchedule);
  });

  test('should open ingredient form modal via recipe action', (): void => {
    const _mockHopsSchedule: HopsSchedule = mockHopsSchedule()[0];

    hsCmp.onRecipeAction = jest
      .fn();

    const actionSpy: jest.SpyInstance = jest.spyOn(hsCmp, 'onRecipeAction');

    fixture.detectChanges();

    hsCmp.openIngredientFormModal(_mockHopsSchedule);

    expect(actionSpy).toHaveBeenCalledWith('openIngredientFormModal', ['hops', _mockHopsSchedule]);
  });

  test('should render template with hops schedule', (): void => {
    const _mockHopsSchedule: HopsSchedule[] = mockHopsSchedule();

    CalculatePipeStub._returnValue = (): string => {
      return '10';
    };

    UnitConversionPipeStub._returnValue = (value: number): string => {
      return value.toString();
    };

    hsCmp.hopsSchedule = _mockHopsSchedule;

    fixture.detectChanges();

    const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');
    expect(items.length).toEqual(_mockHopsSchedule.length);

    const hopsContainer: HTMLElement = <HTMLElement>items.item(0);

    const hopsRow: Element = hopsContainer.children[0].children[0].children[0];

    const icon: Element = hopsRow.children[0];
    expect(icon.children[0].getAttribute('name')).toMatch('create-outline');

    const name: Element = hopsRow.children[1].children[0].children[0];
    expect(name.textContent).toMatch(_mockHopsSchedule[0].hopsType.name);

    const quantity: Element = hopsRow.children[1].children[0].children[1];
    expect(quantity.textContent).toMatch(_mockHopsSchedule[0].quantity.toString());

    const alphaAcid: Element = hopsRow.children[1].children[1].children[0];
    expect(alphaAcid.textContent).toMatch(`${_mockHopsSchedule[0].hopsType.alphaAcid}% AA`);

    const ibu: Element = hopsRow.children[1].children[1].children[1];
    expect(ibu.textContent).toMatch('10');

    const duration: Element = hopsRow.children[1].children[1].children[2];
    expect(duration.textContent).toMatch(`${_mockHopsSchedule[0].duration}min`);
  });

  test('should render template with dry hops', (): void => {
    const _mockHopsSchedule: HopsSchedule[] = mockHopsSchedule();
    _mockHopsSchedule[0].dryHop = true;

    UnitConversionPipeStub._returnValue = (value: number): string => {
      return value.toString();
    };

    hsCmp.hopsSchedule = _mockHopsSchedule;

    fixture.detectChanges();

    const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');

    const hopsContainer: HTMLElement = <HTMLElement>items.item(0);

    const hopsRow: Element = hopsContainer.children[0].children[0].children[0];

    const dryHopRow: Element = hopsRow.children[1].children[1];

    expect(dryHopRow.children[0].textContent).toMatch('0% AA');
    expect(dryHopRow.children[1].textContent).toMatch('0 IBU');
    expect(dryHopRow.children[2].textContent).toMatch('Dry Hop');
  });

});
