/* Module imports */
import { SimpleChange, SimpleChanges } from '@angular/core';
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockFormChanges, mockFormCommonAttributes } from '../../../../test-config/mock-models';
import { ErrorReportingServiceStub } from '../../../../test-config/service-stubs';

/* Interface imports */
import { FormChanges, FormCommonAttributes, FormInputChanges, FormSelectChanges, FormTextAreaChanges } from '../../shared/interfaces';

/* Type imports */
import { CustomError } from '../../shared/types';

/* Service imports */
import { FormAttributeService } from './form-attribute.service';
import { ErrorReportingService } from '../services';


describe('FormAttributeService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: FormAttributeService;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        FormAttributeService,
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(FormAttributeService);''
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  describe('Default Form Change Factories', (): void => {

    test('should get default form changes', (): void => {
      const defaultChanges: FormChanges = service.getDefaultFormChanges();
      expect(defaultChanges.control instanceof FormControl).toBe(true);
      expect(defaultChanges.control.value).toBeNull();
      expect(defaultChanges.shouldRequire).toBe(false);
    });

    test('should get default form common attributes', (): void => {
      expect(service.getDefaultFormCommonAttributes()).toStrictEqual({
        shouldAutocorrect: false,
        shouldAutocomplete: false,
        shouldAutocapitalize: false,
        shouldSpellcheck: false
      });
    });

    test('should get default form input changes', (): void => {
      const _mockFormChanges: FormChanges = mockFormChanges();
      service.getDefaultFormChanges = jest.fn()
        .mockReturnValue(_mockFormChanges);
      const _mockFormCommmonAttributes: FormCommonAttributes = mockFormCommonAttributes();
      service.getDefaultFormCommonAttributes = jest.fn()
        .mockReturnValue(_mockFormCommmonAttributes);

      const defaultChanges: FormInputChanges = service.getDefaultFormInputChanges();
      expect(defaultChanges.control).toBeTruthy();
      expect(defaultChanges.shouldRequire).toBe(false);
      expect(defaultChanges.shouldAutocorrect).toBe(false);
      expect(defaultChanges.shouldAutocomplete).toBe(false);
      expect(defaultChanges.shouldAutocapitalize).toBe(false);
      expect(defaultChanges.shouldSpellcheck).toBe(false);
      expect(defaultChanges.type).toMatch('text');
      expect(Object.keys(defaultChanges).length).toEqual(7);
    });

    test('should get default form select changes', (): void => {
      const _mockFormChanges: FormChanges = mockFormChanges();
      service.getDefaultFormChanges = jest.fn()
        .mockReturnValue(_mockFormChanges);

      const defaultChanges: FormSelectChanges = service.getDefaultFormSelectChanges();
      expect(defaultChanges.control).toBeTruthy();
      expect(defaultChanges.shouldRequire).toBe(false);
      expect(defaultChanges.compareWithFn).toBeTruthy();
      expect(defaultChanges.confirmText).toMatch('Okay');
      expect(defaultChanges.dismissText).toMatch('Dismiss');
      expect(defaultChanges.labelPosition).toMatch('floating');
      expect(Object.keys(defaultChanges).length).toEqual(6);
      const compareFn: (c1: any, c2: any) => boolean = defaultChanges.compareWithFn;
      const option: object = {};
      expect(compareFn(option, option)).toBe(true);
    });

    test('shoudl get default form textarea changes', (): void => {
      const _mockFormChanges: FormChanges = mockFormChanges();
      service.getDefaultFormChanges = jest.fn()
        .mockReturnValue(_mockFormChanges);
      const _mockFormCommmonAttributes: FormCommonAttributes = mockFormCommonAttributes();
      service.getDefaultFormCommonAttributes = jest.fn()
        .mockReturnValue(_mockFormCommmonAttributes);

      const defaultChanges: FormTextAreaChanges = service.getDefaultFormTextAreaChanges();
      expect(defaultChanges.control).toBeTruthy();
      expect(defaultChanges.shouldRequire).toBe(false);
      expect(defaultChanges.shouldAutocorrect).toBe(false);
      expect(defaultChanges.shouldAutocomplete).toBe(false);
      expect(defaultChanges.shouldAutocapitalize).toBe(false);
      expect(defaultChanges.shouldSpellcheck).toBe(false);
      expect(defaultChanges.rows).toEqual(3);
      expect(Object.keys(defaultChanges).length).toEqual(7);
    });

  });


  describe('Form Attributes Handling', (): void => {

    test('should apply form attributes', (): void => {
      const _mockFormChanges: FormInputChanges = <FormInputChanges>mockFormChanges('input');
      const _mockControl: FormControl = new FormControl();
      const changes: SimpleChanges = {
        value: new SimpleChange(null, 'test-value', true),
        type: new SimpleChange(null, 'number', true),
        shouldRequire: new SimpleChange(null, true, true),
        shouldAutocomplete: new SimpleChange(null, true, true)
      };

      service.applyFormAttributes(_mockFormChanges, _mockControl, changes);

      expect(_mockFormChanges.control.value).toMatch('test-value');
      expect(_mockFormChanges.shouldRequire).toBe(true);
      expect(_mockFormChanges.shouldAutocorrect).toBe(false);
      expect(_mockFormChanges.shouldAutocomplete).toBe(true);
      expect(_mockFormChanges.shouldAutocapitalize).toBe(false);
      expect(_mockFormChanges.shouldSpellcheck).toBe(false);
      expect(_mockFormChanges.type).toMatch('number');
    });

    test('should handle form change', (): void => {
      const _mockControl: FormControl = new FormControl();
      const _mockChanges: SimpleChanges = {};
      service.applyFormAttributes = jest.fn();
      const applySpy: jest.SpyInstance = jest.spyOn(service, 'applyFormAttributes');
      const _mockFormInputChanges: FormInputChanges = <FormInputChanges>mockFormChanges('input');
      service.getDefaultFormInputChanges = jest.fn()
        .mockReturnValue(_mockFormInputChanges);
      const inputSpy: jest.SpyInstance = jest.spyOn(service, 'getDefaultFormInputChanges');
      const _mockFormSelectChanges: FormSelectChanges = <FormSelectChanges>mockFormChanges('select');
      service.getDefaultFormSelectChanges = jest.fn()
        .mockReturnValue(_mockFormSelectChanges);
      const selectSpy: jest.SpyInstance = jest.spyOn(service, 'getDefaultFormSelectChanges');
      const _mockFormTextareaChanges: FormTextAreaChanges = <FormTextAreaChanges>mockFormChanges('textarea');
      service.getDefaultFormTextAreaChanges = jest.fn()
        .mockReturnValue(_mockFormTextareaChanges);
      const textareaSpy: jest.SpyInstance = jest.spyOn(service, 'getDefaultFormTextAreaChanges');
      service.setInvalidFormTypeError = jest.fn();
      const errorSpy: jest.SpyInstance = jest.spyOn(service, 'setInvalidFormTypeError');
      const _mockFormChanges: FormChanges = mockFormChanges();
      service.getDefaultFormChanges = jest.fn()
        .mockReturnValue(_mockFormChanges);
      const defaultSpy: jest.SpyInstance = jest.spyOn(service, 'getDefaultFormChanges');

      service.handleFormChange('input', _mockControl, _mockChanges);
      expect(inputSpy).toHaveBeenCalled();
      expect(applySpy).toHaveBeenNthCalledWith(1, _mockFormInputChanges, _mockControl, _mockChanges);
      service.handleFormChange('select', _mockControl, _mockChanges);
      expect(selectSpy).toHaveBeenCalled();
      expect(applySpy).toHaveBeenNthCalledWith(2, _mockFormSelectChanges, _mockControl, _mockChanges);
      service.handleFormChange('textarea', _mockControl, _mockChanges);
      expect(textareaSpy).toHaveBeenCalled();
      expect(applySpy).toHaveBeenNthCalledWith(3, _mockFormTextareaChanges, _mockControl, _mockChanges);
      const defaultChanges: FormChanges = service.handleFormChange('unknown', _mockControl, _mockChanges);
      expect(errorSpy).toHaveBeenCalledWith('unknown');
      expect(defaultSpy).toHaveBeenCalled();
      expect(defaultChanges).toStrictEqual(_mockFormChanges);
    });

    test('should set invalid form type error', (): void => {
      Object.assign(service.errorReporter, { moderateSeverity: 3 });
      service.errorReporter.setErrorReportFromCustomError = jest.fn();
      const errorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'setErrorReportFromCustomError');

      service.setInvalidFormTypeError('input');
      const expectedMessage: string = 'Error setting up form: given form type input is not valid';
      service.setInvalidFormTypeError('input');
      const customError: CustomError = errorSpy.mock.calls[0][0];
      expect(customError.name).toMatch('FormError');
      expect(customError.message).toMatch(expectedMessage);
      expect(customError.severity).toEqual(3);
      expect(customError.userMessage).toMatch(expectedMessage);
    });

  });

});
