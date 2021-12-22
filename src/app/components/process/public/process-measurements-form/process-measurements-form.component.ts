/* Module imports */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/* Interface imports */
import { Batch, BatchAnnotations, PrimaryValues, SelectedUnits } from '../../../../shared/interfaces';

/* Service imports */
import { CalculationsService, FormValidationService, PreferencesService, UtilityService } from '../../../../services/services';


@Component({
  selector: 'app-process-measurements-form',
  templateUrl: './process-measurements-form.component.html',
  styleUrls: ['./process-measurements-form.component.scss']
})
export class ProcessMeasurementsFormComponent implements OnInit, OnDestroy {
  @Input() areAllRequired: boolean = false;
  @Input() batch: Batch = null;
  destroy$: Subject<boolean> = new Subject<boolean>();
  measurementsForm: FormGroup = null;
  onBackClick: () => void;
  requiresVolumeConversion: boolean = false;
  requiresDensityConversion: boolean = false;
  subTitle: string = `${this.areAllRequired ? 'Confirm' : 'Enter'} Measurements`;
  units: SelectedUnits = null;

  constructor(
    public calculator: CalculationsService,
    public formBuilder: FormBuilder,
    public formValidator: FormValidationService,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public preferenceService: PreferencesService,
    public utilService: UtilityService
  ) { }

  /***** Lifecycle Hooks *****/

  ngOnInit() {
    this.onBackClick = this.areAllRequired ? undefined : this.dismiss.bind(this);
    this.units = this.preferenceService.getSelectedUnits();
    this.requiresVolumeConversion = this.calculator.requiresConversion('volumeLarge', this.units);
    this.requiresDensityConversion = this.calculator.requiresConversion('density', this.units);
    this.initForm();
    this.listenForChanges();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  /***** End Lifecycle Hooks *****/


  /**
   * Convert form number inputs from strings back to numbers;
   * Expect all inputs to be digits only
   *
   * @params: formValues - object of form inputs
   *
   * @return: formValues with strings parsed to numbers
   */
  convertFormValuesToNumbers(formValues: object): void {
    for (const key in formValues) {
      if (typeof formValues[key] === 'string') {
        const parsed: number = parseFloat(formValues[key]);
        if (!isNaN(parsed)) {
          formValues[key] = parsed;
        }
      }
    }
  }

  /**
   * Call ModalController dismiss method with no data
   *
   * @params: none
   * @return: none
   */
  dismiss(): void {
    this.modalCtrl.dismiss();
  }

  /**
   * Get the converted measured gravity, if present, else the target gravity
   *
   * @params: measuredGravity - the measured gravity value
   * @params: targetGravity - the target gravity value
   *
   * @return: the converted gravity value
   */
  getGravity(measuredGravity: number, targetGravity: number): number {
    let originalGravity: number = measuredGravity !== -1 ? measuredGravity : targetGravity;
    if (this.requiresDensityConversion) {
      originalGravity = this.calculator.convertDensity(
        originalGravity,
        'specificGravity',
        this.units.density.longName
      );
    }

    return originalGravity;
  }

  /**
   * Get the converted measured batch volume, if present, else the target
   * batch volume
   *
   * @params: measuredGravity - the measured batch volume value
   * @params: targetGravity - the target batch volume value
   *
   * @return: the converted batch volume value
   */
  getVolume(measuredVolume: number, targetVolume: number): number {
    let batchVolume: number = measuredVolume !== -1 ? measuredVolume : targetVolume;
    if (this.requiresVolumeConversion) {
      batchVolume = this.calculator.convertVolume(batchVolume, true, false);
    }

    batchVolume = this.utilService.roundToDecimalPlace(batchVolume, 2);

    return batchVolume;
  }

  /**
   * Convert density to english standard
   *
   * @params: formValues - form values pending submission
   *
   * @return: none
   */
  formatDensityValues(formValues: object): void {
    if (this.requiresDensityConversion) {
      formValues['originalGravity'] = this.calculator
        .convertDensity(
          formValues['originalGravity'],
          this.units.density.longName,
          'specificGravity'
        );
      formValues['finalGravity'] = this.calculator
        .convertDensity(
          formValues['finalGravity'],
          this.units.density.longName,
          'specificGravity'
        );
    }
  }

  /**
   * Convert volume to english standard
   *
   * @params: formValues - form values pending submission
   *
   * @return: none
   */
  formatVolumeValues(formValues: object): void {
    if (this.requiresVolumeConversion) {
      formValues['batchVolume'] = this.calculator.convertVolume(formValues['batchVolume'], true, true);
    }
  }

  /**
   * Initialize form for measured values and yield; if data was passed to the
   * form page, map data to form fields
   *
   * @params: none
   * @return: none
   */
  initForm(): void {
    // TODO: validator to check that final gravity is not more than original gravity
    const annotations: BatchAnnotations = this.batch.annotations;
    const targetValues: PrimaryValues = annotations.targetValues;
    const measuredValues: PrimaryValues = annotations.measuredValues;

    const originalGravity: number = this.getGravity(measuredValues.originalGravity, targetValues.originalGravity);
    const finalGravity: number = this.getGravity(measuredValues.finalGravity, targetValues.finalGravity);
    const batchVolume: number = this.getVolume(measuredValues.batchVolume, targetValues.batchVolume);

    this.measurementsForm = this.formBuilder.group({
      originalGravity: [
        originalGravity.toFixed(this.requiresDensityConversion ? 1 : 3),
        [
          Validators.min(0),
          this.formValidator.requiredIfValidator(this.areAllRequired)
        ]
      ],
      finalGravity: [
        finalGravity.toFixed(this.requiresDensityConversion ? 1 : 3),
        [
          Validators.min(0),
          this.formValidator.requiredIfValidator(this.areAllRequired)
        ]
      ],
      batchVolume: [
        batchVolume,
        [
          Validators.min(0),
          this.formValidator.requiredIfValidator(this.areAllRequired)
        ]
      ]
    });
  }

  /**
   * Listen for form changes; reformat gravity values to 3 decimal places
   *
   * @params: none
   * @return: none
   */
  listenForChanges(): void {
    const maxPlaces: number = 5;
    this.measurementsForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (formValues: { originalGravity: string, finalGravity: string }): void => {
          const controls: { [key: string]: AbstractControl } = this.measurementsForm.controls;

          if (formValues.originalGravity.length > maxPlaces) {
            controls.originalGravity.setValue(
              parseFloat(formValues.originalGravity).toFixed(3).toString()
            );
          }

          if (formValues.finalGravity.length > maxPlaces) {
            controls.finalGravity.setValue(
              parseFloat(formValues.finalGravity).toFixed(3).toString()
            );
          }
        }
      );
  }

  /**
   * Call modal controller dimiss with form data
   *
   * @params: none
   * @return: none
   */
  async onSubmit(): Promise<void> {
    const formValues: object = this.measurementsForm.value;

    this.convertFormValuesToNumbers(formValues);
    this.formatDensityValues(formValues);
    this.formatVolumeValues(formValues);

    if (this.areAllRequired) {
      const loading: HTMLIonLoadingElement = await this.loadingCtrl.create({
        cssClass: 'loading-custom',
        spinner: 'lines'
      });

      await loading.present();
    }

    this.modalCtrl.dismiss(formValues);
  }

}
