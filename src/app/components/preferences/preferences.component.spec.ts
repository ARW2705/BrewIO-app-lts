/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormControl, FormGroup } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockEnglishUnits, mockMetricUnits } from '../../../../test-config/mock-models/mock-units';
import { mockUser } from '../../../../test-config/mock-models/mock-user';
import { PreferencesServiceMock, ToastServiceMock, UserServiceMock } from '../../../../test-config/mocks-app';

/* Default imports */
import { defaultEnglish } from '../../shared/defaults/default-units';

/* Interface imports */
import { User } from '../../shared/interfaces/user';
import { SelectedUnits } from '../../shared/interfaces/units';

/* Service imports */
import { PreferencesService } from '../../services/preferences/preferences.service';
import { ToastService } from '../../services/toast/toast.service';
import { UserService } from '../../services/user/user.service';

/* Component imports */
import { PreferencesComponent } from './preferences.component';


describe('PreferencesComponent', (): void => {
  let fixture: ComponentFixture<PreferencesComponent>;
  let prefCmp: PreferencesComponent;
  let originalOnInit: any;
  let originalOnDestroy: any;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ PreferencesComponent ],
      imports: [
        IonicModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: PreferencesService, useClass: PreferencesServiceMock },
        { provide: ToastService, useClass: ToastServiceMock },
        { provide: UserService, useClass: UserServiceMock }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(PreferencesComponent);
    prefCmp = fixture.componentInstance;
    originalOnInit = prefCmp.ngOnInit;
    originalOnDestroy = prefCmp.ngOnDestroy;
    prefCmp.ngOnInit = jest
      .fn();
    prefCmp.ngOnDestroy = jest
      .fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(prefCmp).toBeDefined();
  });

  test('should init the component', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();

    prefCmp.ngOnInit = originalOnInit;

    prefCmp.userService.getUser = jest
      .fn()
      .mockReturnValue(_mockUser$);

    prefCmp.mapDisplayUnits = jest
      .fn();

    prefCmp.initForm = jest
      .fn();

    prefCmp.preferenceService.getPreferredUnitSystemName = jest
      .fn()
      .mockReturnValue(_mockEnglishUnits.system);

    prefCmp.preferenceService.getSelectedUnits = jest
      .fn()
      .mockReturnValue(_mockEnglishUnits);

    const initSpy: jest.SpyInstance = jest.spyOn(prefCmp, 'initForm');

    fixture.detectChanges();

    setTimeout((): void => {
      expect(prefCmp.user).toStrictEqual(_mockUser);
      expect(prefCmp.preferredUnits).toStrictEqual(_mockEnglishUnits.system);
      expect(prefCmp.setUnits).toStrictEqual(_mockEnglishUnits);
      expect(initSpy).toHaveBeenCalled();
      done();
    }, 10);
  });

  test('should get an error on component init if preferences are missing', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);

    prefCmp.ngOnInit = originalOnInit;

    prefCmp.userService.getUser = jest
      .fn()
      .mockReturnValue(_mockUser$);

    prefCmp.mapDisplayUnits = jest
      .fn();

    prefCmp.initForm = jest
      .fn();

    prefCmp.preferenceService.getPreferredUnitSystemName = jest
      .fn()
      .mockReturnValue('');

    prefCmp.preferenceService.getSelectedUnits = jest
      .fn()
      .mockReturnValue(null);

    const toastSpy: jest.SpyInstance = jest.spyOn(prefCmp.toastService, 'presentErrorToast');

    fixture.detectChanges();

    setTimeout((): void => {
      expect(toastSpy).toHaveBeenCalledWith('Error loading preferences');
      done();
    }, 10);
  });

  test('should get an error on component init from user', (done: jest.DoneCallback): void => {
    prefCmp.ngOnInit = originalOnInit;

    prefCmp.userService.getUser = jest
      .fn()
      .mockReturnValue(throwError('test-error'));

    const toastSpy: jest.SpyInstance = jest.spyOn(prefCmp.toastService, 'presentErrorToast');

    fixture.detectChanges();

    setTimeout((): void => {
      expect(toastSpy).toHaveBeenCalledWith('test-error');
      done();
    }, 10);
  });

  test('should handle component on destroy', (): void => {
    const nextSpy: jest.SpyInstance = jest.spyOn(prefCmp.destroy$, 'next');
    const completeSpy: jest.SpyInstance = jest.spyOn(prefCmp.destroy$, 'complete');

    prefCmp.ngOnDestroy = originalOnDestroy;

    fixture.detectChanges();

    prefCmp.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(completeSpy).toHaveBeenCalled();
  });

  test('should get updated units', (): void => {
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

    prefCmp.setDensity = jest
      .fn();

    fixture.detectChanges();

    const updatedEnglish: SelectedUnits = prefCmp.getUpdatedUnits(_mockEnglishValues, 'brix');
    expect(updatedEnglish).toStrictEqual(_mockEnglishUnits);

    const updatedMetric: SelectedUnits = prefCmp.getUpdatedUnits(_mockMetricValues, 'brix');
    expect(updatedMetric).toStrictEqual(_mockMetricUnits);
  });

  test('should init the form (english)', (): void => {
    const _mockUser: User = mockUser();
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();

    prefCmp.user = _mockUser;
    prefCmp.preferredUnits = _mockEnglishUnits.system;
    prefCmp.setUnits = _mockEnglishUnits;

    fixture.detectChanges();

    prefCmp.initForm();

    const formValues: object = prefCmp.preferencesForm.value;
    expect(formValues['preferredUnitSystem']).toMatch(_mockEnglishUnits.system);
    expect(formValues['weightSmall']).toBe(true);
    expect(formValues['weightLarge']).toBe(true);
    expect(formValues['volumeSmall']).toBe(true);
    expect(formValues['volumeLarge']).toBe(true);
    expect(formValues['temperature']).toBe(true);
    expect(formValues['density']).toMatch('specificGravity');
  });

  test('should init the form (metric)', (): void => {
    const _mockUser: User = mockUser();
    const _mockMetricUnits: SelectedUnits = mockMetricUnits();

    prefCmp.user = _mockUser;
    prefCmp.preferredUnits = _mockMetricUnits.system;
    prefCmp.setUnits = _mockMetricUnits;

    fixture.detectChanges();

    prefCmp.initForm();

    const formValues: object = prefCmp.preferencesForm.value;
    expect(formValues['preferredUnitSystem']).toMatch(_mockMetricUnits.system);
    expect(formValues['weightSmall']).toBe(false);
    expect(formValues['weightLarge']).toBe(false);
    expect(formValues['volumeSmall']).toBe(false);
    expect(formValues['volumeLarge']).toBe(false);
    expect(formValues['temperature']).toBe(false);
    expect(formValues['density']).toMatch('specificGravity');
  });

  test('should handle form submission', (): void => {
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();

    prefCmp.setUnits = _mockEnglishUnits;

    prefCmp.preferencesForm = new FormGroup({
      preferredUnitSystem: new FormControl('test-system'),
      weightSmall: new FormControl(),
      weightLarge: new FormControl(),
      volumeSmall: new FormControl(),
      volumeLarge: new FormControl(),
      temperature: new FormControl(),
      density: new FormControl('test-density')
    });

    prefCmp.getUpdatedUnits = jest
      .fn()
      .mockReturnValue(_mockEnglishUnits);

    prefCmp.preferenceService.setUnits = jest
      .fn();

    prefCmp.updateUserProfile = jest
      .fn();

    const unitSpy: jest.SpyInstance = jest.spyOn(prefCmp.preferenceService, 'setUnits');
    const updateSpy: jest.SpyInstance = jest.spyOn(prefCmp, 'updateUserProfile');

    fixture.detectChanges();

    prefCmp.onSubmit();

    expect(unitSpy).toHaveBeenCalledWith('test-system', _mockEnglishUnits);
    expect(updateSpy).toHaveBeenCalledWith('test-system', _mockEnglishUnits);
  });

  test('should set selected units density', (): void => {
    const _mockMetricUnits: SelectedUnits = mockMetricUnits();

    fixture.detectChanges();

    expect(_mockMetricUnits.density.longName).toMatch('specificGravity');

    prefCmp.setDensity(_mockMetricUnits, 'plato');
    expect(_mockMetricUnits.density.longName).toMatch('plato');

    prefCmp.setDensity(_mockMetricUnits, 'brix');
    expect(_mockMetricUnits.density.longName).toMatch('brix');

    prefCmp.setDensity(_mockMetricUnits, 'specificGravity');
    expect(_mockMetricUnits.density.longName).toMatch('specificGravity');
  });

  test('should map units to be displayed', (): void => {
    const _mockMetricUnits: SelectedUnits = mockMetricUnits();

    prefCmp.setUnits = _mockMetricUnits;

    fixture.detectChanges();

    prefCmp.mapDisplayUnits();

    expect(prefCmp.displayUnits).toStrictEqual({
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

    prefCmp.preferencesForm = new FormGroup({
      preferredUnitSystem: new FormControl('metric'),
      weightSmall: new FormControl(true),
      weightLarge: new FormControl(true),
      volumeSmall: new FormControl(true),
      volumeLarge: new FormControl(true),
      temperature: new FormControl(true),
      density: new FormControl('specificGravity')
    });

    fixture.detectChanges();

    prefCmp.onSystemChange(_mockEvent);

    const formValues: object = prefCmp.preferencesForm.value;
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
    const _defaultEnglish: SelectedUnits = defaultEnglish();
    const _mockMetricUnits: SelectedUnits = mockMetricUnits();

    prefCmp.setSystem = jest
      .fn();

    fixture.detectChanges();

    expect(prefCmp.displayUnits).toStrictEqual({
      weightSmall: _defaultEnglish.weightSmall.longName,
      weightLarge: _defaultEnglish.weightLarge.longName,
      volumeSmall: _defaultEnglish.volumeSmall.longName,
      volumeLarge: _defaultEnglish.volumeLarge.longName,
      temperature: _defaultEnglish.temperature.longName
    });

    prefCmp.onToggle('weightLarge', new CustomEvent('event', { detail: { checked: false } }));
    expect(prefCmp.displayUnits['weightLarge']).toMatch(_mockMetricUnits.weightLarge.longName);

    prefCmp.onToggle('temperature', new CustomEvent('event', { detail: { checked: false } }));
    expect(prefCmp.displayUnits['temperature']).toMatch(_mockMetricUnits.temperature.longName);

    prefCmp.onToggle('temperature', new CustomEvent('event', { detail: { checked: true } }));
    expect(prefCmp.displayUnits['temperature']).toMatch(_defaultEnglish.temperature.longName);
  });

  test('should set the unit system', (): void => {
    prefCmp.preferencesForm = new FormGroup({
      preferredUnitSystem: new FormControl('englishStandard'),
      weightSmall: new FormControl(true),
      weightLarge: new FormControl(true),
      volumeSmall: new FormControl(true),
      volumeLarge: new FormControl(true),
      temperature: new FormControl(true),
      density: new FormControl('specificGravity')
    });

    fixture.detectChanges();

    prefCmp.setSystem();
    expect(prefCmp.preferencesForm.value.preferredUnitSystem).toMatch('englishStandard');

    prefCmp.preferencesForm.controls.volumeSmall.setValue(false);
    prefCmp.setSystem();
    expect(prefCmp.preferencesForm.value.preferredUnitSystem).toMatch('none');

    prefCmp.preferencesForm.controls.weightSmall.setValue(false);
    prefCmp.preferencesForm.controls.weightLarge.setValue(false);
    prefCmp.preferencesForm.controls.volumeLarge.setValue(false);
    prefCmp.preferencesForm.controls.temperature.setValue(false);
    prefCmp.setSystem();
    expect(prefCmp.preferencesForm.value.preferredUnitSystem).toMatch('metric');
  });

  test('should update user profile', (done: jest.DoneCallback): void => {
    const _mockUser: User = mockUser();
    const _mockMetricUnits: SelectedUnits = mockMetricUnits();

    prefCmp.userService.updateUserProfile = jest
      .fn()
      .mockReturnValue(of(_mockUser));

    const toastSpy: jest.SpyInstance = jest.spyOn(prefCmp.toastService, 'presentToast');

    fixture.detectChanges();

    prefCmp.updateUserProfile('metric', _mockMetricUnits);

    setTimeout((): void => {
      expect(toastSpy).toHaveBeenCalledWith(
        'Preferences Updated!',
        1000,
        'middle',
        'toast-bright',
        []
      );
      done();
    }, 10);
  });

  test('should update user profile', (done: jest.DoneCallback): void => {
    const _mockMetricUnits: SelectedUnits = mockMetricUnits();

    prefCmp.userService.updateUserProfile = jest
      .fn()
      .mockReturnValue(throwError('test-error'));

    const toastSpy: jest.SpyInstance = jest.spyOn(prefCmp.toastService, 'presentErrorToast');

    fixture.detectChanges();

    prefCmp.updateUserProfile('metric', _mockMetricUnits);

    setTimeout((): void => {
      expect(toastSpy).toHaveBeenCalledWith('test-error', 5000);
      done();
    }, 10);
  });

  test('should display the preferences page', (): void => {
    const _mockUser: User = mockUser();
    const _mockUser$: BehaviorSubject<User> = new BehaviorSubject<User>(_mockUser);
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();

    prefCmp.ngOnInit = originalOnInit;

    prefCmp.userService.getUser = jest
      .fn()
      .mockReturnValue(_mockUser$);

    prefCmp.preferenceService.getPreferredUnitSystemName = jest
      .fn()
      .mockReturnValue(_mockEnglishUnits.system);

    prefCmp.preferenceService.getSelectedUnits = jest
      .fn()
      .mockReturnValue(_mockEnglishUnits);

    fixture.detectChanges();

    prefCmp.preferencesForm.controls.volumeSmall.setValue(false);
    prefCmp.preferencesForm.controls.volumeLarge.setValue(false);

    const formItems: NodeList = fixture.nativeElement.querySelectorAll('ion-item');

    const system: Node = formItems.item(0);
    expect(system.childNodes.item(1)['value']).toMatch('englishStandard');

    const density: Node = formItems.item(1);
    expect(density.childNodes.item(1)['value']).toMatch('specificGravity');

    const weightSmall: Node = formItems.item(2);
    expect(weightSmall.childNodes.item(1)['checked']).toBe(true);

    const weightLarge: Node = formItems.item(3);
    expect(weightLarge.childNodes.item(1)['checked']).toBe(true);

    const volumeSmall: Node = formItems.item(4);
    expect(volumeSmall.childNodes.item(1)['checked']).toBe(false);

    const volumeLarge: Node = formItems.item(5);
    expect(volumeLarge.childNodes.item(1)['checked']).toBe(false);

    const temperature: Node = formItems.item(6);
    expect(temperature.childNodes.item(1)['checked']).toBe(true);
  });

});
