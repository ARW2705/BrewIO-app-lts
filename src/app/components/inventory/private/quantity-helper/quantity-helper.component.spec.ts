/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { ModalControllerStub } from '../../../../../../test-config/ionic-stubs';
import { UtilityServiceStub } from '../../../../../../test-config/service-stubs';

/* Constant imports */
import { COMMON_CONTAINERS } from '../../../../shared/constants';

/* Service imports */
import { UtilityService } from '../../../../services/services';

/* Page imoprts */
import { QuantityHelperComponent } from './quantity-helper.component';


describe('QuantityHelperComponent', (): void => {
  let fixture: ComponentFixture<QuantityHelperComponent>;
  let component: QuantityHelperComponent;
  let originalOnInit: any;
  configureTestBed();

  beforeEach((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ QuantityHelperComponent ],
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
    fixture = TestBed.createComponent(QuantityHelperComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    component.ngOnInit = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeDefined();
  });

  test('should init the component', (): void => {
    component.ngOnInit = originalOnInit;
    component.quantity = 10;
    component.headerText = 'initial quantity';
    component.changeQuantities = jest.fn();
    const changeSpy: jest.SpyInstance = jest.spyOn(component, 'changeQuantities');

    fixture.detectChanges();

    component.ngOnInit();
    expect(changeSpy).toHaveBeenCalledWith('pints', 10);
  });

  test('should handle input keypress event', (): void => {
    component.isValidQuantity = jest.fn()
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
    const validSpy: jest.SpyInstance = jest.spyOn(component, 'isValidQuantity');
    const eventSpy: jest.SpyInstance = jest.spyOn(mockEvent, 'preventDefault');

    fixture.detectChanges();

    component.onInput(mockEvent);
    expect(validSpy).toHaveBeenCalledWith('input-name', '11');
    expect(eventSpy).not.toHaveBeenCalled();
    component.onInput(mockEvent);
    expect(eventSpy).toHaveBeenCalled();
  });

  test('should compare ion-select options', (): void => {
    expect(component.compareWithFn({ name: 'test' }, { name: 'test' })).toBe(true);
    expect(component.compareWithFn({ name: 'test' }, { name: 'other' })).toBe(false);
    expect(component.compareWithFn('test', 'test')).toBe(true);
    expect(component.compareWithFn('test', 'other')).toBe(false);
  });

  test('should change quantities', (): void => {
    component.quantityPints = 0;
    component.quantityOunces = 0;
    component.quantityCentiliters = 0;
    component.utilService.toTitleCase = jest
      .fn()
      .mockReturnValueOnce('Pints')
      .mockReturnValueOnce('Ounces')
      .mockReturnValueOnce('Centiliters')
      .mockReturnValueOnce('Pints')
      .mockReturnValueOnce('Invalid');
    component.utilService.roundToDecimalPlace = jest
      .fn()
      .mockImplementation((value: number, places: number): number => {
        if (places < 0) {
          return -1;
        }
        return Math.round(value * Math.pow(10, places)) / Math.pow(10, places);
      });
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    fixture.detectChanges();

    expect(component.quantityPints).toEqual(0);
    expect(component.quantityOunces).toEqual(0);
    expect(component.quantityCentiliters).toEqual(0);
    component.changeQuantities('pints', 1);
    expect(component.quantityPints).toEqual(1);
    expect(component.quantityOunces).toEqual(16);
    expect(component.quantityCentiliters).toEqual(47);
    component.changeQuantities('ounces', 64);
    expect(component.quantityPints).toEqual(4);
    expect(component.quantityOunces).toEqual(64);
    expect(component.quantityCentiliters).toEqual(189);
    component.changeQuantities('centiliters', 100);
    expect(component.quantityPints).toEqual(2.1);
    expect(component.quantityOunces).toEqual(33.8);
    expect(component.quantityCentiliters).toEqual(100);
    component.changeQuantities('pints', Number.NaN);
    expect(component.quantityPints).toBeNull();
    expect(component.quantityOunces).toEqual(33.8);
    expect(component.quantityCentiliters).toEqual(100);
    component.changeQuantities('invalid', 1);
    expect(component.quantityPints).toBeNull();
    expect(component.quantityOunces).toEqual(33.8);
    expect(component.quantityCentiliters).toEqual(100);
    const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
    expect(consoleCalls[0]).toMatch('changeQuantities invalid source');
    expect(consoleCalls[1]).toMatch('invalid');
  });

  test('should check quantities on blur event', (): void => {
    component.changeQuantities = jest.fn();
    component.quantityPints = 1;
    component.quantityOunces = 16;
    component.quantityCentiliters = 47;
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
    const changeSpy: jest.SpyInstance = jest.spyOn(component, 'changeQuantities');

    fixture.detectChanges();

    component.checkQuantities(pintsEvent);
    expect(changeSpy).toHaveBeenCalledWith('ounces', component.quantityOunces);
    component.checkQuantities(ouncesEvent);
    expect(changeSpy).toHaveBeenNthCalledWith(2, 'pints', component.quantityPints);
    component.checkQuantities(clEvent);
    expect(changeSpy).toHaveBeenNthCalledWith(3, 'pints', component.quantityPints);
    component.checkQuantities(nonNaNEvent);
    expect(changeSpy).toHaveBeenCalledTimes(3);
  });

  test('should call modal dismiss with no return data', (): void => {
    component.modalCtrl.dismiss = jest.fn();
    const dismissSpy: jest.SpyInstance = jest.spyOn(component.modalCtrl, 'dismiss');

    fixture.detectChanges();

    component.dismiss();
    expect(dismissSpy).toHaveBeenCalled();
  });

  test('should check if quantity is valid', (): void => {
    fixture.detectChanges();

    expect(component.isValidQuantity('pints', '1')).toBe(true);
    expect(component.isValidQuantity('pints', '10000')).toBe(false);
    expect(component.isValidQuantity('pints', '1.00')).toBe(false);
    expect(component.isValidQuantity('ounces', '1')).toBe(true);
    expect(component.isValidQuantity('ounces', '100000')).toBe(false);
    expect(component.isValidQuantity('ounces', '1.00')).toBe(false);
    expect(component.isValidQuantity('centiliters', '1')).toBe(true);
    expect(component.isValidQuantity('centiliters', '100000')).toBe(false);
    expect(component.isValidQuantity('centiliters', '1.0')).toBe(false);
    expect(component.isValidQuantity('invalid', '1')).toBe(false);
  });

  test('chould handle ion-select event', (): void => {
    component.changeQuantities = jest.fn();
    const mockEvent: CustomEvent = new CustomEvent('select', { detail: { value: { capacity: 10 } } });
    const changeSpy: jest.SpyInstance = jest.spyOn(component, 'changeQuantities');

    fixture.detectChanges();

    component.onCommonSelect(mockEvent);
    expect(changeSpy).toHaveBeenCalledWith('pints', 10);
  });

  test('should handle quantity change event', (): void => {
    component.changeQuantities = jest.fn();
    const mockEvent: CustomEvent = new CustomEvent('change');
    const mockTarget: object = {
      parentNode: {
        id: 'pints'
      },
      value: '1'
    };
    Object.defineProperty(mockEvent, 'target', { writable: false, value: mockTarget });
    const mockErrorEvent: CustomEvent = new CustomEvent('change');
    const changeSpy: jest.SpyInstance = jest.spyOn(component, 'changeQuantities');
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    fixture.detectChanges();

    component.onQuantityChange(mockEvent);
    expect(changeSpy).toHaveBeenCalledWith('pints', 1);
    component.onQuantityChange(mockErrorEvent);
    const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
    expect(consoleCalls[0]).toMatch('quantity change error');
    expect(consoleCalls[1] instanceof TypeError).toBe(true);
  });

  test('should submit the quantity in pints', (): void => {
    component.modalCtrl.dismiss = jest.fn();
    component.quantityPints = 5;
    const dismissSpy: jest.SpyInstance = jest.spyOn(component.modalCtrl, 'dismiss');

    fixture.detectChanges();

    component.submit();
    expect(dismissSpy).toHaveBeenCalledWith(5);
  });

  test('should render the modal content', (): void => {
    component.headerText = 'test header text';
    component.quantity = 1;
    component.quantityPints = 1;
    component.quantityOunces = 16;
    component.quantityCentiliters = 47;

    fixture.detectChanges();

    const header: HTMLElement = fixture.nativeElement.querySelector('header');
    expect(header.textContent).toMatch('Test Header Text');
    const quantities: NodeList = fixture.nativeElement.querySelectorAll('ion-item');
    const pints: Element = <Element>quantities.item(0);
    expect(pints.children[1]['ngModel']).toEqual(component.quantityPints);
    const ounces: Element = <Element>quantities.item(1);
    expect(ounces.children[1]['ngModel']).toEqual(component.quantityOunces);
    const cl: Element = <Element>quantities.item(2);
    expect(cl.children[1]['ngModel']).toEqual(component.quantityCentiliters);
    const buttons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');
    expect(buttons.item(0).textContent).toMatch('Cancel');
    expect(buttons.item(1).textContent).toMatch('Submit');
  });

  test('should render ion-select', (): void => {
    component.headerText = 'test header text';

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
