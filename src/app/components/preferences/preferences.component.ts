/* Module imports */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject, of, throwError } from 'rxjs';
import { catchError, mergeMap, take } from 'rxjs/operators';

/* Constant imports */
import { BRIX, PLATO, SELECT_OPTIONS, SPECIFIC_GRAVITY } from '../../shared/constants';

/* Interface imports */
import { SelectedUnits, User } from '../../shared/interfaces';

/* Type imports */
import { CustomError } from '../../shared/types';

/* Default imports */
import { defaultEnglishUnits, defaultMetricUnits } from '../../shared/defaults';

/* Service imports */
import { ErrorReportingService } from '../../services/error-reporting/error-reporting.service';
import { PreferencesService } from '../../services/preferences/preferences.service';
import { ToastService } from '../../services/toast/toast.service';
import { UserService } from '../../services/user/user.service';


@Component({
  selector: 'preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  defaultEnglish: SelectedUnits = defaultEnglishUnits();
  defaultMetric: SelectedUnits = defaultMetricUnits();
  displayUnits: object = {
    weightSmall: this.defaultEnglish.weightSmall.longName,
    weightLarge: this.defaultEnglish.weightLarge.longName,
    volumeSmall: this.defaultEnglish.volumeSmall.longName,
    volumeLarge: this.defaultEnglish.volumeLarge.longName,
    temperature: this.defaultEnglish.temperature.longName
  };
  preferencesForm: FormGroup = null;
  preferredUnits: string = '';
  selectOptions: object = SELECT_OPTIONS;
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
            return throwError(new CustomError(
              'PreferencesError',
              `Given preferredUnits of ${this.preferredUnits} and units of ${this.setUnits}`,
              2,
              'An internal error occurred: invalid units'
            ));
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
   * Configure updated units form values to SelectedUnits
   *
   * @params: formValues - raw form values object
   * @params: density - density unit string
   *
   * @return: the configured SelectedUnits for update
   */
  getUpdatedUnits(formValues: object, density: string): SelectedUnits {
    const updatedUnits: SelectedUnits = {
      system: formValues['preferredUnitSystem'],

      weightSmall: formValues['weightSmall']
        ? this.defaultEnglish.weightSmall
        : this.defaultMetric.weightSmall,

      weightLarge: formValues['weightLarge']
        ? this.defaultEnglish.weightLarge
        : this.defaultMetric.weightLarge,

      volumeSmall: formValues['volumeSmall']
        ? this.defaultEnglish.volumeSmall
        : this.defaultMetric.volumeSmall,

      volumeLarge: formValues['volumeLarge']
        ? this.defaultEnglish.volumeLarge
        : this.defaultMetric.volumeLarge,

      temperature: formValues['temperature']
        ? this.defaultEnglish.temperature
        : this.defaultMetric.temperature,

      density: null
    };

    this.setDensity(updatedUnits, density);

    return updatedUnits;
  }

  /**
   * Initialize preferences form
   *
   * @params: none
   * @return: none
   */
  initForm(): void {
    const _defaultEnglish: SelectedUnits = defaultEnglishUnits();
    this.preferencesForm = this.formBuilder.group({
      preferredUnitSystem: [],
      weightSmall: [
        this.setUnits.weightSmall.system === _defaultEnglish.weightSmall.system
      ],
      weightLarge: [
        this.setUnits.weightLarge.system === _defaultEnglish.weightLarge.system
      ],
      volumeSmall: [
        this.setUnits.volumeSmall.system === _defaultEnglish.volumeSmall.system
      ],
      volumeLarge: [
        this.setUnits.volumeLarge.system === _defaultEnglish.volumeLarge.system
      ],
      temperature: [
        this.setUnits.temperature.system === _defaultEnglish.temperature.system
      ],
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

    const updatedUnits: SelectedUnits = this.getUpdatedUnits(
      formValues,
      density
    );

    this.preferenceService.setUnits(system, updatedUnits);
    this.updateUserProfile(system, updatedUnits);
  }

  /**
   * Set the appropriate density value for a
   * selected unit by given density unit name
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
   * Map ion-toggle unit names
   *
   * @params: none
   * @return: none
   */
  mapDisplayUnits(): void {
    this.displayUnits = {
      weightSmall: this.setUnits.weightSmall.longName,
      weightLarge: this.setUnits.weightLarge.longName,
      volumeSmall: this.setUnits.volumeSmall.longName,
      volumeLarge: this.setUnits.volumeLarge.longName,
      temperature: this.setUnits.temperature.longName
    };
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
    if (event.detail.value !== 'none') {
      this.preferencesForm.controls.weightSmall.setValue(event.detail.value === 'englishStandard');
      this.preferencesForm.controls.weightLarge.setValue(event.detail.value === 'englishStandard');
      this.preferencesForm.controls.volumeSmall.setValue(event.detail.value === 'englishStandard');
      this.preferencesForm.controls.volumeLarge.setValue(event.detail.value === 'englishStandard');
      this.preferencesForm.controls.temperature.setValue(event.detail.value === 'englishStandard');
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
    this.displayUnits[field] = event.detail.checked
      ? this.defaultEnglish[field].longName
      : this.defaultMetric[field].longName;
    this.setSystem();
  }

  /**
   * Set the preferred unit system based on unit toggles; Set to mixed if there
   * is at least one english standard and one metric toggle, otherwise set to
   * relevant system
   *
   * @params: none
   * @return: none
   */
  setSystem(): void {
    let hasStandard: boolean = false;
    let hasMetric: boolean = false;

    for (const key in this.displayUnits) {
      if (this.preferencesForm.controls[key].value) {
        hasStandard = true;
      } else {
        hasMetric = true;
      }
    }

    if (hasStandard && hasMetric) {
      this.preferencesForm.controls.preferredUnitSystem.setValue('none');
    } else if (hasStandard && !hasMetric) {
      this.preferencesForm.controls.preferredUnitSystem.setValue('englishStandard');
    } else if (!hasStandard && hasMetric) {
      this.preferencesForm.controls.preferredUnitSystem.setValue('metric');
    }
  }

  /**
   * Update the user profile preferences
   *
   * @params: system - the overall unit system
   * @params: updatedUnits - the current set SelectedUnits
   *
   * @return: none
   */
  updateUserProfile(system: string, updatedUnits: SelectedUnits): void {
    this.userService.updateUserProfile({
      preferredUnitSystem: system,
      units: updatedUnits
    })
    .subscribe(
      (): void => {
        this.toastService.presentToast(
          'Preferences Updated!',
          1000,
          'middle',
          'toast-bright',
          []
        );
      },
      (error: any): void => this.errorReporter.handleUnhandledError(error)
    );
  }

}
