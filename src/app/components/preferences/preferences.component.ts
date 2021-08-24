/* Module imports */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { Observable, of, Subject, throwError } from 'rxjs';
import { catchError, mergeMap, take } from 'rxjs/operators';

/* Constant imports */
import { BRIX, PLATO, SPECIFIC_GRAVITY } from '../../shared/constants';

/* Interface imports */
import { FormSelectOption, SelectedUnits, Unit, User } from '../../shared/interfaces';

/* Type imports */
import { CustomError } from '../../shared/types';

/* Default imports */
import { defaultEnglishUnits, defaultMetricUnits } from '../../shared/defaults';

/* Service imports */
import { ErrorReportingService, PreferencesService, ToastService, UserService } from '../../services/services';


@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent implements OnInit, OnDestroy {
  defaultEnglish: SelectedUnits = defaultEnglishUnits();
  defaultMetric: SelectedUnits = defaultMetricUnits();
  destroy$: Subject<boolean> = new Subject<boolean>();
  displayUnits: object = {};
  mappableUnits: string[] = ['weightSmall', 'weightLarge', 'volumeSmall', 'volumeLarge', 'temperature'];
  preferencesForm: FormGroup = null;
  preferredUnits: string = '';
  preferredSelectOptions: FormSelectOption[] = [
    { label: 'English Standard', value: 'englishStandard' },
    { label: 'Metric'          , value: 'metric'          },
    { label: 'Other/Mixed '    , value: 'other'           }
  ];
  densitySelectOptions: FormSelectOption[] = [
    { label: 'Specific Gravity', value: 'specificGravity' },
    { label: 'Brix'            , value: 'brix'            },
    { label: 'Plato '          , value: 'plato'           }
  ];
  setUnits: SelectedUnits = null;
  user: User = null;


  constructor(
    public errorReporter: ErrorReportingService,
    public formBuilder: FormBuilder,
    public preferenceService: PreferencesService,
    public toastService: ToastService,
    public userService: UserService
  ) { }

  /***** Lifecycle Hooks *****/

  ngOnInit(): void {
    console.log('preferences component init');
    this.userService.getUser()
      .pipe(
        take(1),
        mergeMap((user: User): Observable<boolean> => {
          this.user = user;
          this.preferredUnits = this.preferenceService.getPreferredUnitSystemName();
          this.setUnits = this.preferenceService.getSelectedUnits();
          this.mapDisplayUnits();
          if (this.preferredUnits.length === 0 || this.setUnits === null) {
            return throwError(this.getInvalidUnitError());
          }
          return of(true);
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      )
      .subscribe(
        (): void => this.initForm(),
        (error: string): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  ngOnDestroy() {
    console.log('preferences component destroy');
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  /***** End Lifecycle Hooks *****/


  /***** Form Methods *****/

  /**
   * Get the appropriate english standard or metric unit for a given unit name
   *
   * @param: unitName - the name of the Unit
   * @param: isEnglish - true if unit should be english standard; false for metric
   *
   * @return: the corresponding Unit
   */
  getSelectedUnit(unitName: string, isEnglish: boolean): Unit {
    return isEnglish ? this.defaultEnglish[unitName] : this.defaultMetric[unitName];
  }

  /**
   * Configure updated units from form values to SelectedUnits
   *
   * @params: formValues - raw form values object
   *
   * @return: the configured SelectedUnits for update
   */
  getUpdatedUnits(formValues: object): SelectedUnits {
    const update: object = {
      system: formValues['preferredUnitSystem'],
      density: null
    };
    this.mappableUnits.forEach((unitName: string): void => {
      update[unitName] = this.getSelectedUnit(unitName, formValues[unitName]);
    });
    return <SelectedUnits>update;
  }

  /**
   * Initialize preferences form
   *
   * @params: none
   * @return: none
   */
  initForm(): void {
    this.preferencesForm = this.formBuilder.group({
      preferredUnitSystem: [],
      weightSmall: [this.setUnits.weightSmall.system === this.defaultEnglish.weightSmall.system],
      weightLarge: [this.setUnits.weightLarge.system === this.defaultEnglish.weightLarge.system],
      volumeSmall: [this.setUnits.volumeSmall.system === this.defaultEnglish.volumeSmall.system],
      volumeLarge: [this.setUnits.volumeLarge.system === this.defaultEnglish.volumeLarge.system],
      temperature: [this.setUnits.temperature.system === this.defaultEnglish.temperature.system],
      density: []
    });
    const controls: { [key: string]: AbstractControl } = this.preferencesForm.controls;
    controls.preferredUnitSystem.setValue(this.setUnits.system);
    controls.density.setValue(this.setUnits.density.longName);
  }

  /**
   * Submit preferences update
   *
   * @params: none
   * @return: none
   */
  onSubmit(): void {
    const formValues: object = this.preferencesForm.value;
    const system: string = formValues['preferredUnitSystem'];
    const density: string = formValues['density'];
    const updatedUnits: SelectedUnits = this.getUpdatedUnits(formValues);
    this.setDensity(updatedUnits, density);
    this.preferenceService.setUnits(system, updatedUnits);
    this.updateUserProfile(system, updatedUnits);
  }

  /**
   * Set the appropriate density value for a selected unit by given density unit name
   *
   * @params: units - the SelectedUnits to update
   * @params: density - the density unit name
   *
   * @return: none
   */
  setDensity(units: SelectedUnits, density: string): void {
    if (density === 'plato') {
      units.density = PLATO;
    } else if (density === 'specificGravity') {
      units.density = SPECIFIC_GRAVITY;
    } else {
      units.density = BRIX;
    }
  }

  /***** End Form Methods *****/


  /***** Other *****/

  /**
   * Get the system that corresponds with the current selected units
   *
   * @param: none
   *
   * @return: the system name
   */
  determineSystem(): string {
    const [hasStandard, hasMetric] = this.hasSystem();
    if (hasStandard && hasMetric) {
      return 'other';
    } else if (hasStandard && !hasMetric) {
      return 'englishStandard';
    } else if (!hasStandard && hasMetric) {
      return 'metric';
    }
    throw this.getInvalidUnitError();
  }

  /**
   * Get an error for invalid units
   *
   * @param: none
   *
   * @return: custom unit error
   */
  getInvalidUnitError(): CustomError {
    const errorMsg: string = `Given preferredUnits of ${this.preferredUnits} and units of ${this.setUnits}`;
    const userMsg: string = 'An internal error occurred: invalid units';
    const severity: number = 2;
    return new CustomError('PreferencesError', errorMsg, severity, userMsg);
  }

  /**
   * Check if the form units are all english standard, metric, or mixed
   *
   * @param: none
   *
   * @return: array of booleans: [ hasStandard, hasMetric ];
   *  each true if at least one field has that particular unit
   */
  hasSystem(): boolean[] {
    let hasStandard: boolean = false;
    let hasMetric: boolean = false;
    for (const key in this.displayUnits) {
      if (this.preferencesForm.controls[key].value) {
        hasStandard = true;
      } else {
        hasMetric = true;
      }
    }

    return [hasStandard, hasMetric];
  }

  /**
   * Map ion-toggle unit names
   *
   * @params: none
   * @return: none
   */
  mapDisplayUnits(): void {
    this.mappableUnits.forEach((unitName: string): void => {
      this.displayUnits[unitName] = this.setUnits[unitName].longName;
    });
  }

  /**
   * Set ion-toggles to respective unit system;
   * true for english, false for metric
   *
   * @params: event - ion-select change event
   *
   * @return: none
   */
  onSystemChange(event: CustomEvent): void {
    if (event.detail.value === 'englishStandard' || event.detail.value === 'metric') {
      this.mappableUnits.forEach((unitName: string): void => {
        this.preferencesForm.get(unitName).setValue(event.detail.value === 'englishStandard');
      });
    }
  }

  /**
   * Switch unit display name when ion-toggle is changed
   *
   * @params: field - the unit type to change
   * @params: event - the ion-toggle event
   *
   * @return: none
   */
  onToggle(field: string, event: CustomEvent): void {
    this.setDisplayUnit(field, event.detail.checked);
    this.setControlOnToggle(field, event.detail.checked);
    this.updateSetSystem();
  }

  /**
   * Set the unit type to display for a given unit
   *
   * @param: unit - the unit name to change
   * @param: isEnglish - true if english standard; false for metric
   *
   * @return: none
   */
  setDisplayUnit(unit: string, isEnglish: boolean): void {
    this.displayUnits[unit] = (isEnglish ? this.defaultEnglish : this.defaultMetric)[unit].longName;
  }

  /**
   * Set the form control for a corresponding toggle event
   *
   * @param: field - form field to update
   * @param: isEnglish - true if english standard; false for metric
   *
   * @return: none
   */
  setControlOnToggle(field: string, isEnglish: boolean): void {
    this.preferencesForm.get(field).setValue(isEnglish);
  }

  /**
   * Set the preferred unit system based on unit toggles
   *
   * @params: none
   * @return: none
   */
  updateSetSystem(): void {
    this.preferencesForm.controls.preferredUnitSystem.setValue(this.determineSystem());
  }

  /**
   * Update the user profile preferences
   *
   * @params: system - the overall unit system
   * @params: updatedUnits - the current set SelectedUnits
   *
   * @return: none
   */
  updateUserProfile(preferredUnitSystem: string, units: SelectedUnits): void {
    this.userService.updateUserProfile({ preferredUnitSystem, units })
      .subscribe(
        (): void => {
          const oneSecond: number = 1000;
          this.toastService.presentToast('Preferences Updated!', oneSecond, 'middle', 'toast-bright');
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

}
