/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, ModalController, LoadingController } from '@ionic/angular';
import { FormsModule, AbstractControl, FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockMetricUnits, mockBatch, mockEnglishUnits } from '../../../../../test-config/mock-models';
import { HeaderComponentStub } from '../../../../../test-config/component-stubs';
import { ModalControllerStub, LoadingControllerStub, LoadingStub } from '../../../../../test-config/ionic-stubs';
import { CalculationsServiceStub, PreferencesServiceStub } from '../../../../../test-config/service-stubs';

/* Interface imports */
import { Batch } from '../../../shared/interfaces/batch';
import { SelectedUnits } from '../../../shared/interfaces/units';

/* Service imports */
import { CalculationsService } from '../../../services/calculations/calculations.service';
import { PreferencesService } from '../../../services/preferences/preferences.service';

/* Page imports */
import { ProcessMeasurementsFormPage } from './process-measurements-form.page';


describe('ProcessMeasurementsFormPage', (): void => {
  let fixture: ComponentFixture<ProcessMeasurementsFormPage>;
  let pmFormPage: ProcessMeasurementsFormPage;
  let originalOnInit: any;
  let originalOnDestroy: any;
  const formBuilder: FormBuilder = new FormBuilder();
  const initDefaultForm: () => FormGroup = (): FormGroup => {
    return formBuilder.group({
      originalGravity: null,
      finalGravity: null,
      batchVolume: null
    });
  };
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        ProcessMeasurementsFormPage,
        HeaderComponentStub
      ],
      imports: [
        IonicModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: CalculationsService, useClass: CalculationsServiceStub },
        { provide: LoadingController, useClass: LoadingControllerStub },
        { provide: ModalController, useClass: ModalControllerStub },
        { provide: PreferencesService, useClass: PreferencesServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ProcessMeasurementsFormPage);
    pmFormPage = fixture.componentInstance;
    originalOnInit = pmFormPage.ngOnInit;
    originalOnDestroy = pmFormPage.ngOnDestroy;
    pmFormPage.ngOnInit = jest
      .fn();
    pmFormPage.ngOnDestroy = jest
      .fn();
    pmFormPage.modalCtrl.dismiss = jest
      .fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(pmFormPage).toBeDefined();
  });

  describe('Lifecycle', (): void => {

    test('should init the component', (): void => {
      const _mockMetricUnits: SelectedUnits = mockMetricUnits();

      pmFormPage.areAllRequired = false;

      pmFormPage.initForm = jest
        .fn();

      pmFormPage.listenForChanges = jest
        .fn();

      pmFormPage.preferenceService.getSelectedUnits = jest
        .fn()
        .mockReturnValue(_mockMetricUnits);

      pmFormPage.calculator.requiresConversion = jest
        .fn()
        .mockReturnValue(false);

      pmFormPage.dismiss = jest
        .fn();

      pmFormPage.dismiss.bind = jest
        .fn()
        .mockImplementation((page: ProcessMeasurementsFormPage): any => page.dismiss);

      pmFormPage.ngOnInit = originalOnInit;

      fixture.detectChanges();

      expect(pmFormPage.requiresVolumeConversion).toBe(false);
      expect(pmFormPage.requiresDensityConversion).toBe(false);
      expect(pmFormPage.units).toStrictEqual(_mockMetricUnits);
      expect(pmFormPage.onBackClick).toStrictEqual(pmFormPage.dismiss);
    });

    test('should handle destroying the component', (): void => {
      pmFormPage.ngOnDestroy = originalOnDestroy;

      const nextSpy: jest.SpyInstance = jest.spyOn(pmFormPage.destroy$, 'next');
      const completeSpy: jest.SpyInstance = jest.spyOn(pmFormPage.destroy$, 'complete');

      fixture.detectChanges();

      pmFormPage.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalledWith(true);
      expect(completeSpy).toHaveBeenCalled();
    });

  });


  describe('Form Methods', (): void => {

    test('should convert form values to number', (): void => {
      pmFormPage.measurementsForm = initDefaultForm();
      const controls: { [key: string]: AbstractControl } = pmFormPage.measurementsForm.controls;
      controls.originalGravity.setValue('1.050');
      controls.finalGravity.setValue('1.010');
      controls.batchVolume.setValue(5);

      pmFormPage.convertFormValuesToNumbers(pmFormPage.measurementsForm.value);

      const converted: object = pmFormPage.measurementsForm.value;
      for (const key in converted) {
        if (converted.hasOwnProperty(key)) {
          expect(typeof converted[key]).toMatch('number');
        }
      }
    });

    test('should dismiss modal with no data', (): void => {
      pmFormPage.modalCtrl.dismiss = jest
        .fn();

      const dismissSpy: jest.SpyInstance = jest.spyOn(pmFormPage.modalCtrl, 'dismiss');

      fixture.detectChanges();

      pmFormPage.dismiss();

      expect(dismissSpy).toHaveBeenCalled();
    });

    test('should get measured gravity if present or target gravity otherwise', (): void => {
      pmFormPage.calculator.convertDensity = jest
        .fn()
        .mockImplementation((value: number, ...options: any[]): number => value * 2);

      pmFormPage.units = mockMetricUnits();

      pmFormPage.requiresDensityConversion = false;

      fixture.detectChanges();

      expect(pmFormPage.getGravity(1.05, 1.06)).toEqual(1.05);
      expect(pmFormPage.getGravity(-1, 1.06)).toEqual(1.06);

      pmFormPage.requiresDensityConversion = true;

      fixture.detectChanges();

      expect(pmFormPage.getGravity(1.05, 1.10)).toEqual(2.1);
    });

    test('should get converted batch volume', (): void => {
      pmFormPage.calculator.convertVolume = jest
        .fn()
        .mockImplementation((value: number, ...options: any[]): number => value * 2);

      pmFormPage.requiresVolumeConversion = false;

      fixture.detectChanges();

      expect(pmFormPage.getVolume(5, 5.5)).toEqual(5);
      expect(pmFormPage.getVolume(-1, 5.5)).toBeLessThanOrEqual(5.5);

      pmFormPage.requiresVolumeConversion = true;

      fixture.detectChanges();

      expect(pmFormPage.getVolume(5, 6)).toEqual(10);
    });

    test('should format density values', (): void => {
      pmFormPage.units = mockMetricUnits();

      pmFormPage.calculator.convertDensity = jest
        .fn()
        .mockImplementation((value: number, ...options: any[]): number => value * 2);

      pmFormPage.requiresDensityConversion = false;

      fixture.detectChanges();

      const formValues: object = {
        originalGravity: 1.05,
        finalGravity: 1.01
      };

      pmFormPage.formatDensityValues(formValues);

      expect(formValues['originalGravity']).toEqual(1.05);
      expect(formValues['finalGravity']).toEqual(1.01);

      pmFormPage.requiresDensityConversion = true;

      fixture.detectChanges();

      pmFormPage.formatDensityValues(formValues);

      expect(formValues['originalGravity']).toEqual(2.1);
      expect(formValues['finalGravity']).toEqual(2.02);
    });

    test('should format volume values', (): void => {
      pmFormPage.calculator.convertVolume = jest
        .fn()
        .mockImplementation((value: number, ...options: any[]): number => value * 2);

      pmFormPage.requiresVolumeConversion = false;

      fixture.detectChanges();

      const formValues: object = {
        batchVolume: 5
      };

      pmFormPage.formatVolumeValues(formValues);

      expect(formValues['batchVolume']).toEqual(5);

      pmFormPage.requiresVolumeConversion = true;

      fixture.detectChanges();

      pmFormPage.formatVolumeValues(formValues);

      expect(formValues['batchVolume']).toEqual(10);
    });

    test('should init the form', (): void => {
      const _mockBatch: Batch = mockBatch();

      pmFormPage.batch = _mockBatch;
      pmFormPage.units = mockMetricUnits();

      pmFormPage.getGravity = jest
        .fn()
        .mockReturnValue(1);

      pmFormPage.getVolume = jest
        .fn()
        .mockReturnValue(5);

      pmFormPage.requiresDensityConversion = true;

      pmFormPage.formValidator.requiredIfValidator = jest
        .fn()
        .mockReturnValue((...options: any[]): any => null);

      pmFormPage.initForm();

      fixture.detectChanges();

      expect(pmFormPage.measurementsForm.value).toStrictEqual({
        originalGravity: '1.0',
        finalGravity: '1.0',
        batchVolume: 5
      });
    });

    test('should listen for form changes', (done: jest.DoneCallback): void => {
      pmFormPage.units = mockEnglishUnits();

      pmFormPage.measurementsForm = formBuilder.group({
        originalGravity: '1.0501010101',
        finalGravity: '1.010000001',
        batchVolume: 5
      });

      fixture.detectChanges();

      pmFormPage.listenForChanges();

      const controls: { [key: string]: AbstractControl } = pmFormPage.measurementsForm.controls;
      controls.batchVolume.setValue(6);

      setTimeout((): void => {
        expect(pmFormPage.measurementsForm.value).toStrictEqual({
          originalGravity: '1.050',
          finalGravity: '1.010',
          batchVolume: 6
        });
        done();
      });
    });

    test('should submit the form', (done: jest.DoneCallback): void => {
      const _stubLoading: LoadingStub = new LoadingStub();

      pmFormPage.units = mockEnglishUnits();

      pmFormPage.convertFormValuesToNumbers = jest
        .fn();
      pmFormPage.formatDensityValues = jest
        .fn();
      pmFormPage.formatVolumeValues = jest
        .fn();

      pmFormPage.areAllRequired = true;

      pmFormPage.loadingCtrl.create = jest
        .fn()
        .mockReturnValue(Promise.resolve(_stubLoading));

      const loadSpy: jest.SpyInstance = jest.spyOn(_stubLoading, 'present');
      const dismissSpy: jest.SpyInstance = jest.spyOn(pmFormPage.modalCtrl, 'dismiss');

      pmFormPage.measurementsForm = formBuilder.group({
        originalGravity: 1.05,
        finalGravity: 1.01,
        batchVolume: 5
      });

      fixture.detectChanges();

      pmFormPage.onSubmit();

      setTimeout((): void => {
        expect(loadSpy).toHaveBeenCalled();
        expect(dismissSpy).toHaveBeenCalledWith({
          originalGravity: 1.05,
          finalGravity: 1.01,
          batchVolume: 5
        });
        done();
      });
    });

  });


  describe('Render Template', (): void => {

    test('should render required form', (): void => {
      const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();

      pmFormPage.measurementsForm = formBuilder.group({
        originalGravity: 1.050,
        finalGravity: 1.010,
        batchVolume: 5
      });

      pmFormPage.areAllRequired = true;
      pmFormPage.units = _mockEnglishUnits;

      fixture.detectChanges();

      const cols: NodeList = fixture.nativeElement.querySelectorAll('ion-col');

      const confirmMsgElem: HTMLElement = <HTMLElement>cols.item(0);
      expect(confirmMsgElem.textContent).toMatch('Confirm Measurements');

      const submissionMsgElem: HTMLElement = <HTMLElement>cols.item(1);
      expect(submissionMsgElem.textContent).toMatch('For Submission');

      const submitButton: HTMLElement = <HTMLElement>cols.item(2);
      expect(submitButton.textContent).toMatch('Submit To Inventory');

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');

      const ogItem: HTMLElement = <HTMLElement>items.item(0);
      expect(ogItem.children[0].textContent).toMatch(`Original Gravity (${_mockEnglishUnits.density.shortName})`);
      expect(ogItem.children[0].classList.contains('required')).toBe(true);
      expect(ogItem.children[1]['value']).toEqual(1.050);

      const fgItem: HTMLElement = <HTMLElement>items.item(1);
      expect(fgItem.children[0].textContent).toMatch(`Final Gravity (${_mockEnglishUnits.density.shortName})`);
      expect(fgItem.children[0].classList.contains('required')).toBe(true);
      expect(fgItem.children[1]['value']).toEqual(1.010);

      const volumeItem: HTMLElement = <HTMLElement>items.item(2);
      expect(volumeItem.children[0].textContent).toMatch(`Batch Volume (${_mockEnglishUnits.volumeLarge.shortName})`);
      expect(volumeItem.children[0].classList.contains('required')).toBe(true);
      expect(volumeItem.children[1]['value']).toEqual(5);
    });

    test('should render not-required form', (): void => {
      const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();

      pmFormPage.measurementsForm = formBuilder.group({
        originalGravity: 1.050,
        finalGravity: 1.010,
        batchVolume: 5
      });

      pmFormPage.areAllRequired = false;
      pmFormPage.units = _mockEnglishUnits;

      fixture.detectChanges();

      const cols: NodeList = fixture.nativeElement.querySelectorAll('ion-col');

      const updateMsgElem: HTMLElement = <HTMLElement>cols.item(0);
      expect(updateMsgElem.textContent).toMatch('Update Measurements');

      const cancelButton: HTMLElement = <HTMLElement>cols.item(1);
      expect(cancelButton.textContent).toMatch('Cancel');

      const submitButton: HTMLElement = <HTMLElement>cols.item(2);
      expect(submitButton.textContent).toMatch('Submit');

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');

      const ogItem: HTMLElement = <HTMLElement>items.item(0);
      expect(ogItem.children[0].textContent).toMatch(`Original Gravity (${_mockEnglishUnits.density.shortName})`);
      expect(ogItem.children[0].classList.contains('required')).toBe(false);
      expect(ogItem.children[1]['value']).toEqual(1.050);

      const fgItem: HTMLElement = <HTMLElement>items.item(1);
      expect(fgItem.children[0].textContent).toMatch(`Final Gravity (${_mockEnglishUnits.density.shortName})`);
      expect(fgItem.children[0].classList.contains('required')).toBe(false);
      expect(fgItem.children[1]['value']).toEqual(1.010);

      const volumeItem: HTMLElement = <HTMLElement>items.item(2);
      expect(volumeItem.children[0].textContent).toMatch(`Batch Volume (${_mockEnglishUnits.volumeLarge.shortName})`);
      expect(volumeItem.children[0].classList.contains('required')).toBe(false);
      expect(volumeItem.children[1]['value']).toEqual(5);
    });

    test('should render form errors', (): void => {
      const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();

      pmFormPage.measurementsForm = formBuilder.group({
        originalGravity: [-1, [Validators.min(0)]],
        finalGravity: [-1, [Validators.min(0)]],
        batchVolume: [-1, [Validators.min(0)]]
      });

      pmFormPage.areAllRequired = false;
      pmFormPage.units = _mockEnglishUnits;
      const controls: { [key: string]: AbstractControl } = pmFormPage.measurementsForm.controls;
      for (const key in controls) {
        if (controls.hasOwnProperty(key)) {
          controls[key].markAsTouched();
        }
      }
      pmFormPage.measurementsForm.updateValueAndValidity();

      fixture.detectChanges();

      const errors: NodeList = fixture.nativeElement.querySelectorAll('form-error');

      expect((<HTMLElement>errors.item(0)).getAttribute('controlName')).toMatch('originalGravity');
      expect((<HTMLElement>errors.item(1)).getAttribute('controlName')).toMatch('finalGravity');
      expect((<HTMLElement>errors.item(2)).getAttribute('controlName')).toMatch('batchVolume');
    });

  });

});
