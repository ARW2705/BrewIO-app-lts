/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { ModalControllerStub } from '../../../../test-config/ionic-stubs';

/* Constant imports */
import { COMMON_CONTAINERS } from '../../shared/constants';

/* Utility imports */
import { toTitleCase } from '../../shared/utility-functions/utilities';

/* Component imoprts */
import { QuantityHelperComponent } from './quantity-helper.component';


describe('QuantityHelperComponent', (): void => {
  let fixture: ComponentFixture<QuantityHelperComponent>;
  let qhCmp: QuantityHelperComponent;
  let originalOnInit: any;
  configureTestBed();

  beforeEach((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ QuantityHelperComponent ],
      providers: [
        { provide: ModalController, useClass: ModalControllerStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(QuantityHelperComponent);
    qhCmp = fixture.componentInstance;
    originalOnInit = qhCmp.ngOnInit;
    qhCmp.ngOnInit = jest
      .fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(qhCmp).toBeDefined();
  });

  test('should init the component', (): void => {
    qhCmp.ngOnInit = originalOnInit;
    qhCmp.quantity = 10;
    qhCmp.headerText = 'initial quantity';
    qhCmp.changeQuantities = jest
      .fn();

    const changeSpy: jest.SpyInstance = jest.spyOn(qhCmp, 'changeQuantities');

    fixture.detectChanges();

    qhCmp.ngOnInit();

    expect(changeSpy).toHaveBeenCalledWith('pints', 10);
  });

  test('should handle input keypress event', (): void => {
    qhCmp.isValidQuantity = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    const mockEvent: KeyboardEvent = new KeyboardEvent('keypress');
    const mockTarget: object = {
      parentNode: {
        parentNode: {
          id: 'input-name'
        }
      },
      value: '1'
    };
    Object.defineProperty(mockEvent, 'target', { writable: false, value: mockTarget });
    Object.defineProperty(mockEvent, 'which', { writable: false, value: 49 });
    Object.defineProperty(mockEvent, 'keyCode', { writable: false, value: 49 });

    const validSpy: jest.SpyInstance = jest.spyOn(qhCmp, 'isValidQuantity');
    const eventSpy: jest.SpyInstance = jest.spyOn(mockEvent, 'preventDefault');

    fixture.detectChanges();

    qhCmp.onInput(mockEvent);

    expect(validSpy).toHaveBeenCalledWith('input-name', '11');
    expect(eventSpy).not.toHaveBeenCalled();

    qhCmp.onInput(mockEvent);

    expect(eventSpy).toHaveBeenCalled();
  });

  test('should compare ion-select options', (): void => {
    expect(qhCmp.compareWithFn({ name: 'test' }, { name: 'test' })).toBe(true);
    expect(qhCmp.compareWithFn({ name: 'test' }, { name: 'other' })).toBe(false);
    expect(qhCmp.compareWithFn('test', 'test')).toBe(true);
    expect(qhCmp.compareWithFn('test', 'other')).toBe(false);
  });

  test('should change quantities', (): void => {
    qhCmp.quantityPints = 0;
    qhCmp.quantityOunces = 0;
    qhCmp.quantityCentiliters = 0;

    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    fixture.detectChanges();

    expect(qhCmp.quantityPints).toEqual(0);
    expect(qhCmp.quantityOunces).toEqual(0);
    expect(qhCmp.quantityCentiliters).toEqual(0);

    qhCmp.changeQuantities('pints', 1);

    expect(qhCmp.quantityPints).toEqual(1);
    expect(qhCmp.quantityOunces).toEqual(16);
    expect(qhCmp.quantityCentiliters).toEqual(47);

    qhCmp.changeQuantities('ounces', 64);

    expect(qhCmp.quantityPints).toEqual(4);
    expect(qhCmp.quantityOunces).toEqual(64);
    expect(qhCmp.quantityCentiliters).toEqual(189);

    qhCmp.changeQuantities('centiliters', 100);

    expect(qhCmp.quantityPints).toEqual(2.1);
    expect(qhCmp.quantityOunces).toEqual(33.8);
    expect(qhCmp.quantityCentiliters).toEqual(100);

    qhCmp.changeQuantities('pints', Number.NaN);

    expect(qhCmp.quantityPints).toBeNull();
    expect(qhCmp.quantityOunces).toEqual(33.8);
    expect(qhCmp.quantityCentiliters).toEqual(100);

    qhCmp.changeQuantities('invalid', 1);

    expect(qhCmp.quantityPints).toBeNull();
    expect(qhCmp.quantityOunces).toEqual(33.8);
    expect(qhCmp.quantityCentiliters).toEqual(100);

    const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
    expect(consoleCalls[0]).toMatch('changeQuantities invalid source');
    expect(consoleCalls[1]).toMatch('invalid');
  });

  test('should check quantities on blur event', (): void => {
    qhCmp.changeQuantities = jest
      .fn();
    qhCmp.quantityPints = 1;
    qhCmp.quantityOunces = 16;
    qhCmp.quantityCentiliters = 47;

    const pintsEvent: CustomEvent = new CustomEvent('blur');
    const pintsTarget: object = {
      parentNode: {
        id: 'pints'
      },
      value: Number.NaN
    };
    Object.defineProperty(pintsEvent, 'target', { writable: false, value: pintsTarget });

    const ouncesEvent: CustomEvent = new CustomEvent('blur');
    const ouncesTarget: object = {
      parentNode: {
        id: 'ounces'
      },
      value: Number.NaN
    };
    Object.defineProperty(ouncesEvent, 'target', { writable: false, value: ouncesTarget });

    const clEvent: CustomEvent = new CustomEvent('blur');
    const clTarget: object = {
      parentNode: {
        id: 'centiliters'
      },
      value: Number.NaN
    };
    Object.defineProperty(clEvent, 'target', { writable: false, value: clTarget });

    const nonNaNEvent: CustomEvent = new CustomEvent('blur');
    const nonNaNTarget: object = {
      parentNode: {
        id: 'pints'
      },
      value: '1'
    };
    Object.defineProperty(nonNaNEvent, 'target', { writable: false, value: nonNaNTarget });

    const changeSpy: jest.SpyInstance = jest.spyOn(qhCmp, 'changeQuantities');

    fixture.detectChanges();

    qhCmp.checkQuantities(pintsEvent);
    expect(changeSpy).toHaveBeenCalledWith('ounces', qhCmp.quantityOunces);

    qhCmp.checkQuantities(ouncesEvent);
    expect(changeSpy).toHaveBeenNthCalledWith(2, 'pints', qhCmp.quantityPints);

    qhCmp.checkQuantities(clEvent);
    expect(changeSpy).toHaveBeenNthCalledWith(3, 'pints', qhCmp.quantityPints);

    qhCmp.checkQuantities(nonNaNEvent);
    expect(changeSpy).toHaveBeenCalledTimes(3);
  });

  test('should call modal dismiss with no return data', (): void => {
    qhCmp.modalCtrl.dismiss = jest
      .fn();

    const dismissSpy: jest.SpyInstance = jest.spyOn(qhCmp.modalCtrl, 'dismiss');

    fixture.detectChanges();

    qhCmp.dismiss();

    expect(dismissSpy).toHaveBeenCalled();
  });

  test('should check if quantity is valid', (): void => {
    fixture.detectChanges();

    expect(qhCmp.isValidQuantity('pints', '1')).toBe(true);
    expect(qhCmp.isValidQuantity('pints', '10000')).toBe(false);
    expect(qhCmp.isValidQuantity('pints', '1.00')).toBe(false);

    expect(qhCmp.isValidQuantity('ounces', '1')).toBe(true);
    expect(qhCmp.isValidQuantity('ounces', '100000')).toBe(false);
    expect(qhCmp.isValidQuantity('ounces', '1.00')).toBe(false);

    expect(qhCmp.isValidQuantity('centiliters', '1')).toBe(true);
    expect(qhCmp.isValidQuantity('centiliters', '100000')).toBe(false);
    expect(qhCmp.isValidQuantity('centiliters', '1.0')).toBe(false);

    expect(qhCmp.isValidQuantity('invalid', '1')).toBe(false);
  });

  test('chould handle ion-select event', (): void => {
    qhCmp.changeQuantities = jest
      .fn();

    const mockEvent: CustomEvent = new CustomEvent('select', { detail: { value: { capacity: 10 } } });

    const changeSpy: jest.SpyInstance = jest.spyOn(qhCmp, 'changeQuantities');

    fixture.detectChanges();

    qhCmp.onCommonSelect(mockEvent);

    expect(changeSpy).toHaveBeenCalledWith('pints', 10);
  });

  test('should handle quantity change event', (): void => {
    qhCmp.changeQuantities = jest
      .fn();

    const mockEvent: CustomEvent = new CustomEvent('change');
    const mockTarget: object = {
      parentNode: {
        id: 'pints'
      },
      value: '1'
    };
    Object.defineProperty(mockEvent, 'target', { writable: false, value: mockTarget });

    const mockErrorEvent: CustomEvent = new CustomEvent('change');

    const changeSpy: jest.SpyInstance = jest.spyOn(qhCmp, 'changeQuantities');
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    fixture.detectChanges();

    qhCmp.onQuantityChange(mockEvent);

    expect(changeSpy).toHaveBeenCalledWith('pints', 1);

    qhCmp.onQuantityChange(mockErrorEvent);

    const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
    expect(consoleCalls[0]).toMatch('quantity change error');
    expect(consoleCalls[1] instanceof TypeError).toBe(true);
  });

  test('should submit the quantity in pints', (): void => {
    qhCmp.modalCtrl.dismiss = jest
      .fn();

    qhCmp.quantityPints = 5;

    const dismissSpy: jest.SpyInstance = jest.spyOn(qhCmp.modalCtrl, 'dismiss');

    fixture.detectChanges();

    qhCmp.submit();

    expect(dismissSpy).toHaveBeenCalledWith(5);
  });

  test('should render the modal content', (): void => {
    qhCmp.headerText = 'test header text';
    qhCmp.quantity = 1;
    qhCmp.quantityPints = 1;
    qhCmp.quantityOunces = 16;
    qhCmp.quantityCentiliters = 47;

    fixture.detectChanges();

    const header: HTMLElement = fixture.nativeElement.querySelector('header');
    expect(header.textContent).toMatch('Test Header Text');

    const quantities: NodeList = fixture.nativeElement.querySelectorAll('ion-item');

    const pints: Element = <Element>quantities.item(0);
    expect(pints.children[1]['ngModel']).toEqual(qhCmp.quantityPints);

    const ounces: Element = <Element>quantities.item(1);
    expect(ounces.children[1]['ngModel']).toEqual(qhCmp.quantityOunces);

    const cl: Element = <Element>quantities.item(2);
    expect(cl.children[1]['ngModel']).toEqual(qhCmp.quantityCentiliters);

    const buttons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');

    expect(buttons.item(0).textContent).toMatch('Cancel');
    expect(buttons.item(1).textContent).toMatch('Submit');
  });

  test('should render ion-select', (): void => {
    qhCmp.headerText = 'test header text';

    fixture.detectChanges();

    const select: HTMLElement = fixture.nativeElement.querySelector('ion-select');
    Array.from(select.children)
      .forEach((option: Element, index: number): void => {
        expect(option.textContent).toMatch(`${toTitleCase(COMMON_CONTAINERS[index].name)} (${COMMON_CONTAINERS[index].capacity} pints)`);
      });
  });

});
