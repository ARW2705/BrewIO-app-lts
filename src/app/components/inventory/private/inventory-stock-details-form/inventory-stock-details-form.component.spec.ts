/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { ErrorReportingServiceStub, ModalServiceStub, UtilityServiceStub } from '@test/service-stubs';

/* Constant imports */
import { PINT, STOCK_TYPES } from '@shared/constants';

/* Interface imports */
import { StockType } from '@shared/interfaces';

/* Component imports */
import { InventoryStockDetailsFormComponent } from '@components/inventory/private/inventory-stock-details-form/inventory-stock-details-form.component';
import { QuantityHelperComponent } from '@components/inventory/private/quantity-helper/quantity-helper.component';

/* Service imports */
import { ErrorReportingService, ModalService, UtilityService } from '@services/public';


describe('InventoryStockDetailsFormComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<InventoryStockDetailsFormComponent>;
  let component: InventoryStockDetailsFormComponent;
  let originalOnInit: () => void;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ InventoryStockDetailsFormComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: ModalService, useClass: ModalServiceStub },
        { provide: UtilityService, useClass: UtilityServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(InventoryStockDetailsFormComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    component.ngOnInit = jest.fn();
    component.errorReporter.handleUnhandledError = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  test('should init the component', (): void => {
    component.buildFormSelectOptions = jest.fn();
    const buildSpy: jest.SpyInstance = jest.spyOn(component, 'buildFormSelectOptions');
    const controls: { [key: string]: FormControl } = { stockType: new FormControl() };
    component.controls = controls;
    component.ngOnInit = originalOnInit;

    fixture.detectChanges();

    component.ngOnInit();
    expect(buildSpy).toHaveBeenCalled();
    expect(component.controls.stockType.value).toBeNull();
    const stockTypes: StockType[] = STOCK_TYPES;
    component.selectedStockTypeName = stockTypes[0].name;
    component.ngOnInit();
    expect(component.controls.stockType.value).toStrictEqual(stockTypes[0].name);
  });

  test('should build form select options', (): void => {
    fixture.detectChanges();

    component.buildFormSelectOptions();
    const stockTypes: StockType[] = STOCK_TYPES;
    expect(component.stockTypeOptions.length).toEqual(stockTypes.length);
    expect(component.stockTypeOptions[0]).toStrictEqual({
      label: stockTypes[0].name,
      value: stockTypes[0].name
    });
  });

  test('should update quantity hint', (): void => {
    const controls: { [key: string]: FormControl } = { stockType: new FormControl('keg') };
    component.controls = controls;

    fixture.detectChanges();

    expect(component.allowHelper).toBe(false);
    expect(component.quantityHint.length).toEqual(0);
    controls.stockType.setValue('keg');
    component.updateQuantityHint();
    expect(component.allowHelper).toBe(true);
    expect(component.quantityHint).toMatch(`${PINT.longName}s`);
    controls.stockType.setValue('bottle');
    component.updateQuantityHint();
    expect(component.allowHelper).toBe(false);
    expect(component.quantityHint.length).toEqual(0);
    controls.stockType.setValue('growler');
    component.updateQuantityHint();
    expect(component.allowHelper).toBe(true);
    expect(component.quantityHint).toMatch(`${PINT.longName}s`);
  });

  test('should open quantity helper modal', (done: jest.DoneCallback): void => {
    component.modalService.openModal = jest.fn()
      .mockReturnValue(of(1));
    const openSpy: jest.SpyInstance = jest.spyOn(component.modalService, 'openModal');
    const controls: { [key: string]: FormControl } = {
      initialQuantity: new FormControl(0)
    };
    component.controls = controls;

    fixture.detectChanges();

    component.openQuantityHelperModal('initialQuantity');
    setTimeout((): void => {
      expect(openSpy).toHaveBeenCalledWith(
        QuantityHelperComponent,
        { headerText: 'select initial quantity', quantity: 0 }
      );
      expect(component.controls.initialQuantity.value).toEqual(1);
      done();
    }, 10);
  });

  test('should open quantity helper modal, but not update on NaN response', (done: jest.DoneCallback): void => {
    component.modalService.openModal = jest.fn()
      .mockReturnValue(of(NaN));
    const openSpy: jest.SpyInstance = jest.spyOn(component.modalService, 'openModal');
    const controls: { [key: string]: FormControl } = {
      initialQuantity: new FormControl(0)
    };
    component.controls = controls;

    fixture.detectChanges();

    component.openQuantityHelperModal('initialQuantity');
    setTimeout((): void => {
      expect(openSpy).toHaveBeenCalledWith(
        QuantityHelperComponent,
        { headerText: 'select initial quantity', quantity: 0 }
      );
      expect(component.controls.initialQuantity.value).toEqual(0);
      done();
    }, 10);
  });

  test('should handle error response from quantity helper modal', (done: jest.DoneCallback): void => {
    const _mockError: Error = new Error('test-error');
    component.modalService.openModal = jest.fn()
      .mockReturnValue(throwError(_mockError));
    const controls: { [key: string]: FormControl } = {
      initialQuantity: new FormControl(0)
    };
    component.controls = controls;
    const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

    fixture.detectChanges();

    component.openQuantityHelperModal('initialQuantity');
    setTimeout((): void => {
      expect(errorSpy).toHaveBeenCalledWith(_mockError);
      done();
    }, 10);
  });

  test('should render the template without helper buttons', (): void => {
    component.ngOnInit = originalOnInit;
    component.controls = {
      stockType: new FormControl(),
      initialQuantity: new FormControl(),
      currentQuantity: new FormControl()
    };

    fixture.detectChanges();

    const formSelect: HTMLElement = fixture.nativeElement.querySelector('app-form-select');
    expect(formSelect.getAttribute('controlName')).toMatch('stockType');
    const formInputs: NodeList = fixture.nativeElement.querySelectorAll('app-form-input');
    expect((<HTMLElement>formInputs.item(0)).getAttribute('controlName')).toMatch('initialQuantity');
    expect((<HTMLElement>formInputs.item(1)).getAttribute('controlName')).toMatch('currentQuantity');
  });

  test('should render the template with helper buttons', (): void => {
    component.ngOnInit = originalOnInit;
    component.controls = {
      stockType: new FormControl(),
      initialQuantity: new FormControl(),
      currentQuantity: new FormControl()
    };
    component.allowHelper = true;
    component.quantityHint = '(pints)';

    fixture.detectChanges();

    const formSelect: HTMLElement = fixture.nativeElement.querySelector('app-form-select');
    expect(formSelect.getAttribute('controlName')).toMatch('stockType');
    const formInputs: NodeList = fixture.nativeElement.querySelectorAll('app-form-input');
    expect((<HTMLElement>formInputs.item(0)).getAttribute('controlName')).toMatch('initialQuantity');
    expect((<HTMLElement>formInputs.item(1)).getAttribute('controlName')).toMatch('currentQuantity');
    const modalButtons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');
    expect(modalButtons.length).toEqual(2);
    expect((<HTMLElement>modalButtons.item(0)).getAttribute('aria-label')).toMatch('open quantity helper modal');
  });

});
