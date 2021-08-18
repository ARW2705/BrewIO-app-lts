/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { FormControl, FormGroup } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockEnglishUnits, mockMetricUnits, mockPreferencesSelectOptions, mockUser } from '../../../../test-config/mock-models';
import { ErrorReportingServiceStub, PreferencesServiceStub, ToastServiceStub, UserServiceStub } from '../../../../test-config/service-stubs';

/* Default imports */
import { defaultEnglishUnits, defaultMetricUnits } from '../../shared/defaults';

/* Interface imports */
import { FormSelectOption, SelectedUnits, Unit, User } from '../../shared/interfaces';

/* Type impots */
import { CustomError } from '../../shared/types';

/* Service imports */
import { ErrorReportingService, PreferencesService, ToastService, UserService } from '../../services/services';

/* Component imports */
import { PreferencesComponent } from './preferences.component';


describe('PreferencesComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<PreferencesComponent>;
  let component: PreferencesComponent;
  let originalOnInit: any;
  let originalOnDestroy: any;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ PreferencesComponent ],
      imports: [
        IonicModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: PreferencesService, useClass: PreferencesServiceStub },
        { provide: ToastService, useClass: ToastServiceStub },
        { provide: UserService, useClass: UserServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(PreferencesComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    originalOnDestroy = component.ngOnDestroy;
    component.ngOnInit = jest.fn();
    component.ngOnDestroy = jest.fn();
    component.errorReporter.handleUnhandledError = jest.fn();
    component.errorReporter.handleGenericCatchError = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  test('should init the component', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
    component.ngOnInit = originalOnInit;
    component.userService.getUser = jest.fn()
      .mockReturnValue(_mockUser$);
    component.mapDisplayUnits = jest.fn();
    component.initForm = jest.fn();
    component.preferenceService.getPreferredUnitSystemName = jest.fn()
      .mockReturnValue(_mockEnglishUnits.system);
    component.preferenceService.getSelectedUnits = jest.fn()
      .mockReturnValue(_mockEnglishUnits);
    const initSpy: jest.SpyInstance = jest.spyOn(component, 'initForm');

    fixture.detectChanges();

    setTimeout((): void => {
      expect(component.user).toStrictEqual(_mockUser);
      expect(component.preferredUnits).toStrictEqual(_mockEnglishUnits.system);
      expect(component.setUnits).toStrictEqual(_mockEnglishUnits);
      expect(initSpy).toHaveBeenCalled();
      done();
    }, 10);
  });

  test('should get an error on component init if preferences are missing', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);
    component.ngOnInit = originalOnInit;
    component.userService.getUser = jest.fn()
      .mockReturnValue(_mockUser$);
    component.mapDisplayUnits = jest.fn();
    component.initForm = jest.fn();
    component.getInvalidUnitError = jest.fn()
      .mockReturnValue(new Error('test-error'));
    component.preferenceService.getPreferredUnitSystemName = jest.fn()
      .mockReturnValue('');
    component.preferenceService.getSelectedUnits = jest.fn()
      .mockReturnValue(null);
    component.errorReporter.handleGenericCatchError = jest
      .fn()
      .mockImplementation(() => (error: Error) => {
        expect(error.message).toMatch('test-error');
        return throwError(null);
      });
    const handleSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleGenericCatchError');
    const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

    fixture.detectChanges();

    setTimeout((): void => {
      expect(handleSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(null);
      done();
    }, 10);
  });

  test('should get an error on component init from user', (done: jest.DoneCallback): void => {
    const _mockError: Error = new Error('test-error');
    component.ngOnInit = originalOnInit;
    component.userService.getUser = jest.fn()
      .mockReturnValue(throwError(_mockError));
    component.errorReporter.handleGenericCatchError = jest.fn()
      .mockImplementation((): (error: Error) => Observable<never> => (error: Error) => throwError(error));
    const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

    fixture.detectChanges();

    setTimeout((): void => {
      expect(errorSpy).toHaveBeenCalledWith(_mockError);
      done();
    }, 10);
  });

  test('should handle component on destroy', (): void => {
    const nextSpy: jest.SpyInstance = jest.spyOn(component.destroy$, 'next');
    const completeSpy: jest.SpyInstance = jest.spyOn(component.destroy$, 'complete');
    component.ngOnDestroy = originalOnDestroy;

    fixture.detectChanges();

    component.ngOnDestroy();
    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(completeSpy).toHaveBeenCalled();
  });

  test('should get selected unit', (): void => {
    const _defaultEnglishUnits: SelectedUnits = defaultEnglishUnits();
    const _defaultMetricUnits: SelectedUnits = defaultMetricUnits();

    fixture.detectChanges();

    expect(component.getSelectedUnit('volumeSmall', true)).toStrictEqual(_defaultEnglishUnits.volumeSmall);
    expect(component.getSelectedUnit('weightLarge', false)).toStrictEqual(_defaultMetricUnits.weightLarge);
  });

  test('should get updated units', (): void => {
    const _defaultEnglishUnits: SelectedUnits = defaultEnglishUnits();
    const _defaultMetricUnits: SelectedUnits = defaultMetricUnits();
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
    _mockEnglishUnits.density = null;
    const _mockMetricUnits: SelectedUnits = mockMetricUnits();
    _mockMetricUnits.density = null;
    const _mockEnglishValues: object = {
      preferredUnitSystem: _mockEnglishUnits.system,
      weightSmall: true,
      weightLarge: true,
      volumeSmall: true,
      volumeLarge: true,
      temperature: true
    };
    const _mockMetricValues: object = {
      preferredUnitSystem: _mockMetricUnits.system,
      weightSmall: false,
      weightLarge: false,
      volumeSmall: false,
      volumeLarge: false,
      temperature: false
    };
    component.getSelectedUnit = jest.fn()
      .mockImplementation((unitName: string, isEnglish: boolean): Unit => {
        return isEnglish ? _defaultEnglishUnits[unitName] : _defaultMetricUnits[unitName];
      });

    fixture.detectChanges();

    const updatedEnglish: SelectedUnits = component.getUpdatedUnits(_mockEnglishValues);
    expect(updatedEnglish).toStrictEqual(_mockEnglishUnits);
    const updatedMetric: SelectedUnits = component.getUpdatedUnits(_mockMetricValues);
    expect(updatedMetric).toStrictEqual(_mockMetricUnits);
  });

  test('should init the form (english)', (): void => {
    const _mockUser: User = mockUser();
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
    component.user = _mockUser;
    component.preferredUnits = _mockEnglishUnits.system;
    component.setUnits = _mockEnglishUnits;

    fixture.detectChanges();

    component.initForm();
    const formValues: object = component.preferencesForm.value;
    expect(formValues['weightSmall']).toBe(true);
    expect(formValues['weightLarge']).toBe(true);
    expect(formValues['volumeSmall']).toBe(true);
    expect(formValues['volumeLarge']).toBe(true);
    expect(formValues['temperature']).toBe(true);
  });

  test('should init the form (metric)', (): void => {
    const _mockUser: User = mockUser();
    const _mockMetricUnits: SelectedUnits = mockMetricUnits();
    component.user = _mockUser;
    component.preferredUnits = _mockMetricUnits.system;
    component.setUnits = _mockMetricUnits;

    fixture.detectChanges();

    component.initForm();
    const formValues: object = component.preferencesForm.value;
    expect(formValues['weightSmall']).toBe(false);
    expect(formValues['weightLarge']).toBe(false);
    expect(formValues['volumeSmall']).toBe(false);
    expect(formValues['volumeLarge']).toBe(false);
    expect(formValues['temperature']).toBe(false);
  });

  test('should handle form submission', (): void => {
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
    component.setUnits = _mockEnglishUnits;
    component.preferencesForm = new FormGroup({
      preferredUnitSystem: new FormControl('test-system'),
      weightSmall: new FormControl(),
      weightLarge: new FormControl(),
      volumeSmall: new FormControl(),
      volumeLarge: new FormControl(),
      temperature: new FormControl(),
      density: new FormControl('test-density')
    });
    component.getUpdatedUnits = jest.fn()
      .mockReturnValue(_mockEnglishUnits);
    component.setDensity = jest.fn();
    component.preferenceService.setUnits = jest.fn();
    component.updateUserProfile = jest.fn();
    const unitSpy: jest.SpyInstance = jest.spyOn(component.preferenceService, 'setUnits');
    const updateSpy: jest.SpyInstance = jest.spyOn(component, 'updateUserProfile');

    fixture.detectChanges();

    component.onSubmit();
    expect(unitSpy).toHaveBeenCalledWith('test-system', _mockEnglishUnits);
    expect(updateSpy).toHaveBeenCalledWith('test-system', _mockEnglishUnits);
  });

  test('should set selected units density', (): void => {
    const _mockMetricUnits: SelectedUnits = mockMetricUnits();

    fixture.detectChanges();

    expect(_mockMetricUnits.density.longName).toMatch('specificGravity');
    component.setDensity(_mockMetricUnits, 'plato');
    expect(_mockMetricUnits.density.longName).toMatch('plato');
    component.setDensity(_mockMetricUnits, 'brix');
    expect(_mockMetricUnits.density.longName).toMatch('brix');
    component.setDensity(_mockMetricUnits, 'specificGravity');
    expect(_mockMetricUnits.density.longName).toMatch('specificGravity');
  });

  test('should determine what unit system is being used', (): void => {
    component.hasSystem = jest
      .fn()
      .mockReturnValueOnce([true, true])
      .mockReturnValueOnce([true, false])
      .mockReturnValueOnce([false, true])
      .mockReturnValueOnce([false, false]);
    const _mockError: Error = new Error('test-error');
    component.getInvalidUnitError = jest.fn()
      .mockReturnValue(_mockError);

    fixture.detectChanges();

    expect(component.determineSystem()).toMatch('other');
    expect(component.determineSystem()).toMatch('englishStandard');
    expect(component.determineSystem()).toMatch('metric');
    expect((): void => {
      component.determineSystem();
    }).toThrowError(_mockError);
  });

  test('should get an invalid unit error', (): void => {
    fixture.detectChanges();

    const error: CustomError = component.getInvalidUnitError();
    expect(error.name).toMatch('PreferencesError');
    expect(error.severity).toEqual(2);
  });

  test('should determine which unit system is being used by toggle value', (): void => {
    const englishForm: FormGroup = new FormGroup({
      preferredUnitSystem: new FormControl('englishStandard'),
      weightSmall: new FormControl(true),
      weightLarge: new FormControl(true),
      volumeSmall: new FormControl(true),
      volumeLarge: new FormControl(true),
      temperature: new FormControl(true),
      density: new FormControl('specificGravity')
    });
    const metricForm: FormGroup = new FormGroup({
      preferredUnitSystem: new FormControl('metric'),
      weightSmall: new FormControl(false),
      weightLarge: new FormControl(false),
      volumeSmall: new FormControl(false),
      volumeLarge: new FormControl(false),
      temperature: new FormControl(false),
      density: new FormControl('specificGravity')
    });
    component.displayUnits = {
      weightSmall: true,
      weightLarge: true,
      volumeSmall: true,
      volumeLarge: true,
      temperature: true
    };
    component.preferencesForm = englishForm;

    fixture.detectChanges();
    const [hasStandard1, hasMetric1] = component.hasSystem();
    expect(hasStandard1).toBe(true);
    expect(hasMetric1).toBe(false);
    component.preferencesForm = metricForm;
    const [hasStandard2, hasMetric2] = component.hasSystem();
    expect(hasStandard2).toBe(false);
    expect(hasMetric2).toBe(true);
  });

  test('should map units to be displayed', (): void => {
    const _mockMetricUnits: SelectedUnits = mockMetricUnits();
    component.setUnits = _mockMetricUnits;

    fixture.detectChanges();

    component.mapDisplayUnits();
    expect(component.displayUnits).toStrictEqual({
      weightSmall: _mockMetricUnits.weightSmall.longName,
      weightLarge: _mockMetricUnits.weightLarge.longName,
      volumeSmall: _mockMetricUnits.volumeSmall.longName,
      volumeLarge: _mockMetricUnits.volumeLarge.longName,
      temperature: _mockMetricUnits.temperature.longName
    });
  });

  test('should update current form values on system change', (): void => {
    const _mockEvent: CustomEvent = new CustomEvent(
      'event',
      {
        detail: {
          value: 'metric'
        }
      }
    );
    component.preferencesForm = new FormGroup({
      preferredUnitSystem: new FormControl('metric'),
      weightSmall: new FormControl(true),
      weightLarge: new FormControl(true),
      volumeSmall: new FormControl(true),
      volumeLarge: new FormControl(true),
      temperature: new FormControl(true),
      density: new FormControl('specificGravity')
    });

    fixture.detectChanges();

    component.onSystemChange(_mockEvent);
    const formValues: object = component.preferencesForm.value;
    expect(formValues).toStrictEqual({
      preferredUnitSystem: 'metric',
      weightSmall: false,
      weightLarge: false,
      volumeSmall: false,
      volumeLarge: false,
      temperature: false,
      density: 'specificGravity'
    });
  });

  test('should handle form toggle event', (): void => {
    const _mockEvent: CustomEvent = new CustomEvent(
      'event',
      {
        detail: {
          checked: true
        }
      }
    );
    component.setDisplayUnit = jest.fn();
    component.setControlOnToggle = jest.fn();
    component.updateSetSystem = jest.fn();
    const displaySpy: jest.SpyInstance = jest.spyOn(component, 'setDisplayUnit');
    const controlSpy: jest.SpyInstance = jest.spyOn(component, 'setControlOnToggle');
    const updateSpy: jest.SpyInstance = jest.spyOn(component, 'updateSetSystem');

    fixture.detectChanges();

    component.onToggle('test-field', _mockEvent);
    expect(displaySpy).toHaveBeenCalledWith('test-field', true);
    expect(controlSpy).toHaveBeenCalledWith('test-field', true);
    expect(updateSpy).toHaveBeenCalled();
  });

  test('should set display unit', (): void => {
    const _defaultEnglishUnits: SelectedUnits = defaultEnglishUnits();
    const _defaultMetricUnits: SelectedUnits = defaultMetricUnits();
    fixture.detectChanges();

    component.setDisplayUnit('weightSmall', false);
    expect(component.displayUnits['weightSmall']).toBe(_defaultMetricUnits.weightSmall.longName);
    component.setDisplayUnit('weightSmall', true);
    expect(component.displayUnits['weightSmall']).toBe(_defaultEnglishUnits.weightSmall.longName);
  });

  test('should set the form control on toggle event', (): void => {
    component.preferencesForm = new FormGroup({
      preferredUnitSystem: new FormControl('englishStandard'),
      weightSmall: new FormControl(true),
      weightLarge: new FormControl(true),
      volumeSmall: new FormControl(true),
      volumeLarge: new FormControl(true),
      temperature: new FormControl(true),
      density: new FormControl('specificGravity')
    });

    fixture.detectChanges();
    expect(component.preferencesForm.controls.volumeSmall.value).toBe(true);
    component.setControlOnToggle('volumeSmall', false);
    expect(component.preferencesForm.controls.volumeSmall.value).toBe(false);
  });

  test('should update the set unit system', (): void => {
    component.preferencesForm = new FormGroup({
      preferredUnitSystem: new FormControl('englishStandard'),
      weightSmall: new FormControl(true),
      weightLarge: new FormControl(true),
      volumeSmall: new FormControl(true),
      volumeLarge: new FormControl(true),
      temperature: new FormControl(true),
      density: new FormControl('specificGravity')
    });
    component.determineSystem = jest.fn()
      .mockReturnValueOnce('englishStandard')
      .mockReturnValueOnce('other')
      .mockReturnValueOnce('metric');

    fixture.detectChanges();

    component.updateSetSystem();
    expect(component.preferencesForm.value.preferredUnitSystem).toMatch('englishStandard');
    component.preferencesForm.controls.volumeSmall.setValue(false);
    component.updateSetSystem();
    expect(component.preferencesForm.value.preferredUnitSystem).toMatch('other');
    component.preferencesForm.controls.weightSmall.setValue(false);
    component.preferencesForm.controls.weightLarge.setValue(false);
    component.preferencesForm.controls.volumeLarge.setValue(false);
    component.preferencesForm.controls.temperature.setValue(false);
    component.updateSetSystem();
    expect(component.preferencesForm.value.preferredUnitSystem).toMatch('metric');
  });

  test('should update user profile', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    const _mockMetricUnits: SelectedUnits = mockMetricUnits();
    component.userService.updateUserProfile = jest.fn()
      .mockReturnValue(of(_mockUser));
    const toastSpy: jest.SpyInstance = jest.spyOn(component.toastService, 'presentToast');

    fixture.detectChanges();

    component.updateUserProfile('metric', _mockMetricUnits);
    setTimeout((): void => {
      expect(toastSpy).toHaveBeenCalledWith(
        'Preferences Updated!',
        1000,
        'middle',
        'toast-bright'
      );
      done();
    }, 10);
  });

  test('should update user profile', (done: jest.DoneCallback): void => {
    const _mockMetricUnits: SelectedUnits = mockMetricUnits();
    const _mockError: Error = new Error('test-error');
    component.userService.updateUserProfile = jest.fn()
      .mockReturnValue(throwError(_mockError));
    const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

    fixture.detectChanges();

    component.updateUserProfile('metric', _mockMetricUnits);
    setTimeout((): void => {
      expect(errorSpy).toHaveBeenCalledWith(_mockError);
      done();
    }, 10);
  });

  test('should display the preferences page', (): void => {
    const _mockUser: User = mockUser();
    const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
    component.ngOnInit = originalOnInit;
    component.userService.getUser = jest.fn()
      .mockReturnValue(_mockUser$);
    component.preferenceService.getPreferredUnitSystemName = jest.fn()
      .mockReturnValue(_mockEnglishUnits.system);
    component.preferenceService.getSelectedUnits = jest.fn()
      .mockReturnValue(_mockEnglishUnits);

    fixture.detectChanges();

    const selects: NodeList = global.document.querySelectorAll('app-form-select');
    expect(selects.length).toEqual(2);
    const toggles: NodeList = global.document.querySelectorAll('app-preferences-toggle');
    expect(toggles.length).toEqual(5);
  });

});
