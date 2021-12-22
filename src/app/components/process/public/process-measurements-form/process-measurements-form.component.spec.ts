/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, LoadingController, ModalController } from '@ionic/angular';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockMetricUnits, mockBatch, mockEnglishUnits } from '../../../../../../test-config/mock-models';
import { HeaderComponentStub } from '../../../../../../test-config/component-stubs';
import { ModalControllerStub, LoadingControllerStub, LoadingStub } from '../../../../../../test-config/ionic-stubs';
import { CalculationsServiceStub, PreferencesServiceStub, FormValidationServiceStub, UtilityServiceStub } from '../../../../../../test-config/service-stubs';

/* Interface imports */
import { Batch, SelectedUnits } from '../../../../shared/interfaces';

/* Service imports */
import { CalculationsService, FormValidationService, PreferencesService, UtilityService } from '../../../../services/services';

/* Page imports */
import { ProcessMeasurementsFormComponent } from './process-measurements-form.component';


describe('ProcessMeasurementsFormComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<ProcessMeasurementsFormComponent>;
  let component: ProcessMeasurementsFormComponent;
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

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        ProcessMeasurementsFormComponent,
        HeaderComponentStub
      ],
      imports: [
        IonicModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: CalculationsService, useClass: CalculationsServiceStub },
        { provide: FormValidationService, useClass: FormValidationServiceStub },
        { provide: LoadingController, useClass: LoadingControllerStub },
        { provide: ModalController, useClass: ModalControllerStub },
        { provide: PreferencesService, useClass: PreferencesServiceStub },
        { provide: UtilityService, useClass: UtilityServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ProcessMeasurementsFormComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    originalOnDestroy = component.ngOnDestroy;
    component.ngOnInit = jest.fn();
    component.ngOnDestroy = jest.fn();
    component.modalCtrl.dismiss = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Lifecycle', (): void => {

    test('should init the component', (): void => {
      const _mockMetricUnits: SelectedUnits = mockMetricUnits();
      component.areAllRequired = false;
      component.initForm = jest.fn();
      component.listenForChanges = jest.fn();
      component.preferenceService.getSelectedUnits = jest.fn()
        .mockReturnValue(_mockMetricUnits);
      component.calculator.requiresConversion = jest.fn()
        .mockReturnValue(false);
      component.dismiss = jest.fn();
      component.dismiss.bind = jest.fn()
        .mockImplementation((page: ProcessMeasurementsFormComponent): any => page.dismiss);
      component.ngOnInit = originalOnInit;

      fixture.detectChanges();

      expect(component.requiresVolumeConversion).toBe(false);
      expect(component.requiresDensityConversion).toBe(false);
      expect(component.units).toStrictEqual(_mockMetricUnits);
      expect(component.onBackClick).toStrictEqual(component.dismiss);
    });

    test('should handle destroying the component', (): void => {
      component.ngOnDestroy = originalOnDestroy;
      const nextSpy: jest.SpyInstance = jest.spyOn(component.destroy$, 'next');
      const completeSpy: jest.SpyInstance = jest.spyOn(component.destroy$, 'complete');

      fixture.detectChanges();

      component.ngOnDestroy();
      expect(nextSpy).toHaveBeenCalledWith(true);
      expect(completeSpy).toHaveBeenCalled();
    });

  });


  describe('Form Methods', (): void => {

    test('should convert form values to number', (): void => {
      component.measurementsForm = initDefaultForm();
      const controls: { [key: string]: AbstractControl } = component.measurementsForm.controls;
      controls.originalGravity.setValue('1.050');
      controls.finalGravity.setValue('1.010');
      controls.batchVolume.setValue(5);

      component.convertFormValuesToNumbers(component.measurementsForm.value);

      const converted: object = component.measurementsForm.value;
      for (const key in converted) {
        if (converted.hasOwnProperty(key)) {
          expect(typeof converted[key]).toMatch('number');
        }
      }
    });

    test('should dismiss modal with no data', (): void => {
      component.modalCtrl.dismiss = jest.fn();
      const dismissSpy: jest.SpyInstance = jest.spyOn(component.modalCtrl, 'dismiss');

      fixture.detectChanges();

      component.dismiss();
      expect(dismissSpy).toHaveBeenCalled();
    });

    test('should get measured gravity if present or target gravity otherwise', (): void => {
      component.calculator.convertDensity = jest.fn()
        .mockImplementation((value: number, ...options: any[]): number => value * 2);
      component.units = mockMetricUnits();
      component.requiresDensityConversion = false;

      fixture.detectChanges();

      expect(component.getGravity(1.05, 1.06)).toEqual(1.05);
      expect(component.getGravity(-1, 1.06)).toEqual(1.06);
      component.requiresDensityConversion = true;

      fixture.detectChanges();

      expect(component.getGravity(1.05, 1.10)).toEqual(2.1);
    });

    test('should get converted batch volume', (): void => {
      component.calculator.convertVolume = jest.fn()
        .mockImplementation((value: number, ...options: any[]): number => value * 2);
      component.requiresVolumeConversion = false;
      component.utilService.roundToDecimalPlace = jest.fn()
        .mockImplementation((value: number, places: number): number => {
          if (places < 0) {
            return -1;
          }
          return Math.round(value * Math.pow(10, places)) / Math.pow(10, places);
        });

      fixture.detectChanges();

      expect(component.getVolume(5, 5.5)).toEqual(5);
      expect(component.getVolume(-1, 5.5)).toBeLessThanOrEqual(5.5);
      component.requiresVolumeConversion = true;

      fixture.detectChanges();

      expect(component.getVolume(5, 6)).toEqual(10);
    });

    test('should format density values', (): void => {
      component.units = mockMetricUnits();
      component.calculator.convertDensity = jest.fn()
        .mockImplementation((value: number, ...options: any[]): number => value * 2);
      component.requiresDensityConversion = false;

      fixture.detectChanges();

      const formValues: object = {
        originalGravity: 1.05,
        finalGravity: 1.01
      };
      component.formatDensityValues(formValues);
      expect(formValues['originalGravity']).toEqual(1.05);
      expect(formValues['finalGravity']).toEqual(1.01);
      component.requiresDensityConversion = true;

      fixture.detectChanges();

      component.formatDensityValues(formValues);
      expect(formValues['originalGravity']).toEqual(2.1);
      expect(formValues['finalGravity']).toEqual(2.02);
    });

    test('should format volume values', (): void => {
      component.calculator.convertVolume = jest.fn()
        .mockImplementation((value: number, ...options: any[]): number => value * 2);
      component.requiresVolumeConversion = false;

      fixture.detectChanges();

      const formValues: object = {
        batchVolume: 5
      };
      component.formatVolumeValues(formValues);
      expect(formValues['batchVolume']).toEqual(5);
      component.requiresVolumeConversion = true;

      fixture.detectChanges();

      component.formatVolumeValues(formValues);
      expect(formValues['batchVolume']).toEqual(10);
    });

    test('should init the form', (): void => {
      const _mockBatch: Batch = mockBatch();
      component.batch = _mockBatch;
      component.units = mockMetricUnits();
      component.getGravity = jest.fn()
        .mockReturnValue(1);
      component.getVolume = jest.fn()
        .mockReturnValue(5);
      component.requiresDensityConversion = true;
      component.formValidator.requiredIfValidator = jest.fn()
        .mockReturnValue((...options: any[]): any => null);
      component.initForm();

      fixture.detectChanges();

      expect(component.measurementsForm.value).toStrictEqual({
        originalGravity: '1.0',
        finalGravity: '1.0',
        batchVolume: 5
      });
    });

    test('should listen for form changes', (done: jest.DoneCallback): void => {
      component.units = mockEnglishUnits();
      component.measurementsForm = formBuilder.group({
        originalGravity: '1.0501010101',
        finalGravity: '1.010000001',
        batchVolume: 5
      });

      fixture.detectChanges();

      component.listenForChanges();
      const controls: { [key: string]: AbstractControl } = component.measurementsForm.controls;
      controls.batchVolume.setValue(6);
      setTimeout((): void => {
        expect(component.measurementsForm.value).toStrictEqual({
          originalGravity: '1.050',
          finalGravity: '1.010',
          batchVolume: 6
        });
        done();
      });
    });

    test('should submit the form', (done: jest.DoneCallback): void => {
      const _stubLoading: LoadingStub = new LoadingStub();
      component.units = mockEnglishUnits();
      component.convertFormValuesToNumbers = jest.fn();
      component.formatDensityValues = jest.fn();
      component.formatVolumeValues = jest.fn();
      component.areAllRequired = true;
      component.loadingCtrl.create = jest.fn()
        .mockReturnValue(Promise.resolve(_stubLoading));
      const loadSpy: jest.SpyInstance = jest.spyOn(_stubLoading, 'present');
      const dismissSpy: jest.SpyInstance = jest.spyOn(component.modalCtrl, 'dismiss');
      component.measurementsForm = formBuilder.group({
        originalGravity: 1.05,
        finalGravity: 1.01,
        batchVolume: 5
      });

      fixture.detectChanges();

      component.onSubmit();
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

    test('should render a required form', (): void => {
      const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
      component.measurementsForm = formBuilder.group({
        originalGravity: 1.050,
        finalGravity: 1.010,
        batchVolume: 5
      });
      component.areAllRequired = true;
      component.units = _mockEnglishUnits;

      fixture.detectChanges();

      const headerContainer: HTMLElement = fixture.nativeElement.querySelector('#heading');
      const header: HTMLElement = <HTMLElement>headerContainer.children[0];
      expect(header.textContent).toMatch('Confirm Measurements');
      const subHeader: HTMLElement = <HTMLElement>headerContainer.children[1];
      expect(subHeader.textContent).toMatch('For Submission');
      const warning: HTMLElement = fixture.nativeElement.querySelector('p');
      expect(warning.textContent).toMatch('Required fields');
      const inputs: NodeList = fixture.nativeElement.querySelectorAll('app-form-input');
      expect((<HTMLElement>inputs.item(0)).getAttribute('controlName')).toMatch('originalGravity');
      expect((<HTMLElement>inputs.item(1)).getAttribute('controlName')).toMatch('finalGravity');
      expect((<HTMLElement>inputs.item(2)).getAttribute('controlName')).toMatch('batchVolume');
      const formButtons: HTMLElement = fixture.nativeElement.querySelector('app-form-buttons');
      expect(formButtons).toBeNull();
      const submitButton: HTMLElement = fixture.nativeElement.querySelector('ion-button');
      expect(submitButton.textContent).toMatch('Submit To Inventory');
    });

    test('should render a non-required form', (): void => {
      const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
      component.measurementsForm = formBuilder.group({
        originalGravity: 1.050,
        finalGravity: 1.010,
        batchVolume: 5
      });
      component.areAllRequired = false;
      component.units = _mockEnglishUnits;

      fixture.detectChanges();

      const headerContainer: HTMLElement = fixture.nativeElement.querySelector('#heading');
      expect(headerContainer.children.length).toEqual(1);
      const header: HTMLElement = <HTMLElement>headerContainer.children[0];
      expect(header.textContent).toMatch('Update Measurements');
      const warning: HTMLElement = fixture.nativeElement.querySelector('p');
      expect(warning).toBeNull();
      const inputs: NodeList = fixture.nativeElement.querySelectorAll('app-form-input');
      expect((<HTMLElement>inputs.item(0)).getAttribute('controlName')).toMatch('originalGravity');
      expect((<HTMLElement>inputs.item(1)).getAttribute('controlName')).toMatch('finalGravity');
      expect((<HTMLElement>inputs.item(2)).getAttribute('controlName')).toMatch('batchVolume');
      const formButtons: HTMLElement = fixture.nativeElement.querySelector('app-form-buttons');
      expect(formButtons).toBeTruthy();
      const submitButton: HTMLElement = fixture.nativeElement.querySelector('ion-button');
      expect(submitButton).toBeNull();
    });

  });

});
