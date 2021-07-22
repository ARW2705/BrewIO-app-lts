/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { ModalControllerStub } from '../../../../test-config/ionic-stubs';
import { UtilityServiceStub } from '../../../../test-config/service-stubs';

/* Constant imports */
import { COMMON_CONTAINERS } from '../../shared/constants';

/* Service imports */
import { UtilityService } from '../../services/services';

/* Page imoprts */
import { QuantityHelperPage } from './quantity-helper.page';


describe('QuantityHelperPage', (): void => {
  let fixture: ComponentFixture<QuantityHelperPage>;
  let qhPage: QuantityHelperPage;
  let originalOnInit: any;
  configureTestBed();

  beforeEach((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ QuantityHelperPage ],
      providers: [
        { provide: ModalController, useClass: ModalControllerStub },
        { provide: UtilityService, useClass: UtilityServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(QuantityHelperPage);
    qhPage = fixture.componentInstance;
    originalOnInit = qhPage.ngOnInit;
    qhPage.ngOnInit = jest
      .fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(qhPage).toBeDefined();
  });

  test('should init the component', (): void => {
    qhPage.ngOnInit = originalOnInit;
    qhPage.quantity = 10;
    qhPage.headerText = 'initial quantity';
    qhPage.changeQuantities = jest
      .fn();

    const changeSpy: jest.SpyInstance = jest.spyOn(qhPage, 'changeQuantities');

    fixture.detectChanges();

    qhPage.ngOnInit();

    expect(changeSpy).toHaveBeenCalledWith('pints', 10);
  });

  test('should handle input keypress event', (): void => {
    qhPage.isValidQuantity = jest
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

    const validSpy: jest.SpyInstance = jest.spyOn(qhPage, 'isValidQuantity');
    const eventSpy: jest.SpyInstance = jest.spyOn(mockEvent, 'preventDefault');

    fixture.detectChanges();

    qhPage.onInput(mockEvent);

    expect(validSpy).toHaveBeenCalledWith('input-name', '11');
    expect(eventSpy).not.toHaveBeenCalled();

    qhPage.onInput(mockEvent);

    expect(eventSpy).toHaveBeenCalled();
  });

  test('should compare ion-select options', (): void => {
    expect(qhPage.compareWithFn({ name: 'test' }, { name: 'test' })).toBe(true);
    expect(qhPage.compareWithFn({ name: 'test' }, { name: 'other' })).toBe(false);
    expect(qhPage.compareWithFn('test', 'test')).toBe(true);
    expect(qhPage.compareWithFn('test', 'other')).toBe(false);
  });

  test('should change quantities', (): void => {
    qhPage.quantityPints = 0;
    qhPage.quantityOunces = 0;
    qhPage.quantityCentiliters = 0;

    qhPage.utilService.toTitleCase = jest
      .fn()
      .mockReturnValueOnce('Pints')
      .mockReturnValueOnce('Ounces')
      .mockReturnValueOnce('Centiliters')
      .mockReturnValueOnce('Pints')
      .mockReturnValueOnce('Invalid');

    qhPage.utilService.roundToDecimalPlace = jest
      .fn()
      .mockImplementation((value: number, places: number): number => {
        if (places < 0) {
          return -1;
        }
        return Math.round(value * Math.pow(10, places)) / Math.pow(10, places);
      });

    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    fixture.detectChanges();

    expect(qhPage.quantityPints).toEqual(0);
    expect(qhPage.quantityOunces).toEqual(0);
    expect(qhPage.quantityCentiliters).toEqual(0);

    qhPage.changeQuantities('pints', 1);

    expect(qhPage.quantityPints).toEqual(1);
    expect(qhPage.quantityOunces).toEqual(16);
    expect(qhPage.quantityCentiliters).toEqual(47);

    qhPage.changeQuantities('ounces', 64);

    expect(qhPage.quantityPints).toEqual(4);
    expect(qhPage.quantityOunces).toEqual(64);
    expect(qhPage.quantityCentiliters).toEqual(189);

    qhPage.changeQuantities('centiliters', 100);

    expect(qhPage.quantityPints).toEqual(2.1);
    expect(qhPage.quantityOunces).toEqual(33.8);
    expect(qhPage.quantityCentiliters).toEqual(100);

    qhPage.changeQuantities('pints', Number.NaN);

    expect(qhPage.quantityPints).toBeNull();
    expect(qhPage.quantityOunces).toEqual(33.8);
    expect(qhPage.quantityCentiliters).toEqual(100);

    qhPage.changeQuantities('invalid', 1);

    expect(qhPage.quantityPints).toBeNull();
    expect(qhPage.quantityOunces).toEqual(33.8);
    expect(qhPage.quantityCentiliters).toEqual(100);

    const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
    expect(consoleCalls[0]).toMatch('changeQuantities invalid source');
    expect(consoleCalls[1]).toMatch('invalid');
  });

  test('should check quantities on blur event', (): void => {
    qhPage.changeQuantities = jest
      .fn();
    qhPage.quantityPints = 1;
    qhPage.quantityOunces = 16;
    qhPage.quantityCentiliters = 47;

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

    const changeSpy: jest.SpyInstance = jest.spyOn(qhPage, 'changeQuantities');

    fixture.detectChanges();

    qhPage.checkQuantities(pintsEvent);
    expect(changeSpy).toHaveBeenCalledWith('ounces', qhPage.quantityOunces);

    qhPage.checkQuantities(ouncesEvent);
    expect(changeSpy).toHaveBeenNthCalledWith(2, 'pints', qhPage.quantityPints);

    qhPage.checkQuantities(clEvent);
    expect(changeSpy).toHaveBeenNthCalledWith(3, 'pints', qhPage.quantityPints);

    qhPage.checkQuantities(nonNaNEvent);
    expect(changeSpy).toHaveBeenCalledTimes(3);
  });

  test('should call modal dismiss with no return data', (): void => {
    qhPage.modalCtrl.dismiss = jest
      .fn();

    const dismissSpy: jest.SpyInstance = jest.spyOn(qhPage.modalCtrl, 'dismiss');

    fixture.detectChanges();

    qhPage.dismiss();

    expect(dismissSpy).toHaveBeenCalled();
  });

  test('should check if quantity is valid', (): void => {
    fixture.detectChanges();

    expect(qhPage.isValidQuantity('pints', '1')).toBe(true);
    expect(qhPage.isValidQuantity('pints', '10000')).toBe(false);
    expect(qhPage.isValidQuantity('pints', '1.00')).toBe(false);

    expect(qhPage.isValidQuantity('ounces', '1')).toBe(true);
    expect(qhPage.isValidQuantity('ounces', '100000')).toBe(false);
    expect(qhPage.isValidQuantity('ounces', '1.00')).toBe(false);

    expect(qhPage.isValidQuantity('centiliters', '1')).toBe(true);
    expect(qhPage.isValidQuantity('centiliters', '100000')).toBe(false);
    expect(qhPage.isValidQuantity('centiliters', '1.0')).toBe(false);

    expect(qhPage.isValidQuantity('invalid', '1')).toBe(false);
  });

  test('chould handle ion-select event', (): void => {
    qhPage.changeQuantities = jest
      .fn();

    const mockEvent: CustomEvent = new CustomEvent('select', { detail: { value: { capacity: 10 } } });

    const changeSpy: jest.SpyInstance = jest.spyOn(qhPage, 'changeQuantities');

    fixture.detectChanges();

    qhPage.onCommonSelect(mockEvent);

    expect(changeSpy).toHaveBeenCalledWith('pints', 10);
  });

  test('should handle quantity change event', (): void => {
    qhPage.changeQuantities = jest
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

    const changeSpy: jest.SpyInstance = jest.spyOn(qhPage, 'changeQuantities');
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    fixture.detectChanges();

    qhPage.onQuantityChange(mockEvent);

    expect(changeSpy).toHaveBeenCalledWith('pints', 1);

    qhPage.onQuantityChange(mockErrorEvent);

    const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
    expect(consoleCalls[0]).toMatch('quantity change error');
    expect(consoleCalls[1] instanceof TypeError).toBe(true);
  });

  test('should submit the quantity in pints', (): void => {
    qhPage.modalCtrl.dismiss = jest
      .fn();

    qhPage.quantityPints = 5;

    const dismissSpy: jest.SpyInstance = jest.spyOn(qhPage.modalCtrl, 'dismiss');

    fixture.detectChanges();

    qhPage.submit();

    expect(dismissSpy).toHaveBeenCalledWith(5);
  });

  test('should render the modal content', (): void => {
    qhPage.headerText = 'test header text';
    qhPage.quantity = 1;
    qhPage.quantityPints = 1;
    qhPage.quantityOunces = 16;
    qhPage.quantityCentiliters = 47;

    fixture.detectChanges();

    const header: HTMLElement = fixture.nativeElement.querySelector('header');
    expect(header.textContent).toMatch('Test Header Text');

    const quantities: NodeList = fixture.nativeElement.querySelectorAll('ion-item');

    const pints: Element = <Element>quantities.item(0);
    expect(pints.children[1]['ngModel']).toEqual(qhPage.quantityPints);

    const ounces: Element = <Element>quantities.item(1);
    expect(ounces.children[1]['ngModel']).toEqual(qhPage.quantityOunces);

    const cl: Element = <Element>quantities.item(2);
    expect(cl.children[1]['ngModel']).toEqual(qhPage.quantityCentiliters);

    const buttons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');

    expect(buttons.item(0).textContent).toMatch('Cancel');
    expect(buttons.item(1).textContent).toMatch('Submit');
  });

  test('should render ion-select', (): void => {
    qhPage.headerText = 'test header text';

    fixture.detectChanges();

    const select: HTMLElement = fixture.nativeElement.querySelector('ion-select');
    Array.from(select.children)
      .forEach((option: Element, index: number): void => {
        expect(option.textContent).toMatch(`${
          COMMON_CONTAINERS[index].name.replace(
            /\b[a-z]/g,
            (firstChar: string): string => firstChar.toUpperCase()
          )
        } (${COMMON_CONTAINERS[index].capacity} pints)`);
      });
  });

});
