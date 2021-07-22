/* Module imports */
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, IonSelect } from '@ionic/angular';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { from } from 'rxjs';

/* Default imports */
import { defaultImage } from '../../../shared/defaults';

/* Interface imports */
import { Image, SelectedUnits, Style } from '../../../shared/interfaces';

/* Page imports */
import { ImageFormPage } from '../image-form/image-form.page';

/* Service imports */
import { CalculationsService, PreferencesService, ToastService, UtilityService } from '../../../services/services';



@Component({
  selector: 'page-general-form',
  templateUrl: './general-form.page.html',
  styleUrls: ['./general-form.page.scss']
})
export class GeneralFormPage implements OnInit {
  @Input() data: object;
  @Input() docMethod: string;
  @Input() formType: string;
  @Input() styles: Style[];
  @ViewChild('styleSelect') styleSelect: IonSelect;
  brewingTouched: boolean = false;
  compareWithFn: (o1: any, o2: any) => boolean;
  controlsToConvertToNumber: string[] = [
    'efficiency',
    'batchVolume',
    'boilVolume',
    'mashVolume',
    'boilDuration',
    'mashDuration'
  ];
  controlsToConvertUnits: string[] = [
    'batchVolume',
    'boilVolume',
    'mashVolume',
  ];
  defaultImage: Image = defaultImage();
  generalForm: FormGroup = null;
  labelImage: Image = this.defaultImage;
  onBackClick: () => void;
  selectOptions: object = { cssClass: 'select-popover' };
  styleSelection: Style;
  styleTouched: boolean = false;
  units: SelectedUnits = null;


  constructor(
    public formBuilder: FormBuilder,
    public route: ActivatedRoute,
    public modalCtrl: ModalController,
    public calculator: CalculationsService,
    public preferenceService: PreferencesService,
    public toastService: ToastService,
    public utilService: UtilityService
  ) {
    this.compareWithFn = this.utilService.compareWith.bind(this);
    this.onBackClick = this.dismiss.bind(this);
  }

  /***** Lifecycle Hooks *****/

  ngOnInit() {
    this.units = this.preferenceService.getSelectedUnits();
    this.initForm();
  }

  /***** End Lifecycle Hooks *****/


  /***** Form Methods *****/

  /**
   * Add name form control to form group based on the formType
   *
   * @params: none
   * @return: none
   */
  addNameControl(): void {
    this.generalForm.addControl(
      this.formType === 'master' ? 'name' : 'variantName',
      new FormControl(
        '',
        [Validators.minLength(2), Validators.maxLength(50), Validators.required]
      )
    );
  }

  /**
   * Convert numeric string values to numbers and store units converted to
   * english standard
   *
   * @params: none
   *
   * @return: a submission ready object of form values
   */
  convertForSubmission(): object {
    const formValues: object = {};
    for (const key in this.generalForm.value) {
      if (this.generalForm.value.hasOwnProperty(key)) {
        if (this.controlsToConvertToNumber.includes(key)) {
          formValues[key] = parseFloat(this.generalForm.value[key]);
        } else {
          formValues[key] = this.generalForm.value[key];
        }
        if (this.requiresConversion(key)) {
          formValues[key] = this.calculator.convertVolume(formValues[key], true, true);
        }
      }
    }
    formValues['labelImage'] = this.labelImage;
    return formValues;
  }

  /**
   * Call ModalController dismiss method
   *
   * @params: none
   * @return: none
   */
  dismiss() {
    this.modalCtrl.dismiss();
  }

  /**
   * Check if there is a value key that should be mapped to the form
   *
   * @params: valueName - the value name to check
   *
   * @return: true if value should be mapped to form
   */
  hasMappableValue(valueName: string): boolean {
    return valueName !== 'labelImage' && valueName !== 'isFavorite' && valueName !== 'isMaster';
  }

  /**
   * Initialize general form
   *
   * @params: none
   * @return: none
   */
  initForm(): void {
    this.generalForm = this.formBuilder.group({
      style:        ['',   [Validators.required]],
      brewingType:  ['',   [Validators.required]],
      efficiency:   [70,   [Validators.required, Validators.min(0), Validators.max(100)]],
      mashDuration: [60,   [Validators.required, Validators.min(0), Validators.max(1440)]],
      boilDuration: [60,   [Validators.required, Validators.min(0), Validators.max(1440)]],
      batchVolume:  [null, [Validators.required, Validators.min(0), Validators.max(1000)]],
      boilVolume:   [null, [Validators.required, Validators.min(0), Validators.max(1000)]],
      mashVolume:   [null, [Validators.required, Validators.min(0), Validators.max(1000)]],
      isFavorite:   false,
      isMaster:     false
    });

    this.addNameControl();
    this.mapDataToForm();
  }

  /**
   * Map given data to form values if present; Perform unit conversion if required
   *
   * @params: none
   * @return: none
   */
  mapDataToForm(): void {
    if (this.data) {
      for (const key in this.data) {
        if (this.hasMappableValue(key)) {
          if (this.controlsToConvertUnits.includes(key)) {
            if (this.calculator.requiresConversion('volumeLarge', this.units)) {
              this.data[key] = this.calculator.convertVolume(this.data[key], true, false);
            }
            this.generalForm.controls[key].setValue(
              this.utilService.roundToDecimalPlace(this.data[key], 2)
            );
          } else {
            this.generalForm.controls[key].setValue(this.data[key]);
          }
        }
      }
      this.styleSelection = this.data['style'];
      this.labelImage = this.data['labelImage'] || this.defaultImage;
    }
  }

  /**
   * Get image modal error handler
   *
   * @params: none
   *
   * @return: modal error handler function
   */
  onImageModalError(): (error: string) => void {
    return (error: string): void => {
      console.log('modal dismiss error', error);
      this.toastService.presentErrorToast('Error selecting image');
    };
  }

  /**
   * Get image modal success handler
   *
   * @params: none
   *
   * @return: modal success handler function
   */
  onImageModalSuccess(): (data: object) => void {
    return (data: object): void => {
      const _data: Image = data['data'];
      if (_data) {
        let previousServerFilename: string;
        if (this.labelImage && this.labelImage.serverFilename) {
          previousServerFilename = this.labelImage.serverFilename;
        }
        this.labelImage = _data;
        this.labelImage.serverFilename = previousServerFilename;
      }
    };
  }

  /**
   * Open image modal
   *
   * @params: none
   * @return: none
   */
  async openImageModal(): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalCtrl.create({
      component: ImageFormPage,
      componentProps: { image: this.labelImage }
    });

    from(modal.onDidDismiss())
      .subscribe(
        this.onImageModalSuccess(),
        this.onImageModalError()
      );

    await modal.present();
  }

  /**
   * Set style ion-select touched property based on whether it has a value
   *
   * @params: none
   * @return: none
   */
  onBrewingSelect() {
    this.brewingTouched = !this.generalForm.controls.brewingType.value;
  }

  /**
   * Set style ion-select touched property based on whether it has a value
   *
   * @params: none
   * @return: none
   */
  onStyleSelect(): void {
    this.styleTouched = !this.generalForm.controls.style.value;
  }

  /**
   * Update style selection on form selection
   *
   * @params: style - form select result event
   *
   * @return: none
   */
  onStyleSelection(style: Style): void {
    this.styleSelection = style;
  }

  /**
   * Convert any numbers that are strings to their number types
   * then call ModalController dismiss and pass the form values
   *
   * @params: none
   * @return: none
   */
  onSubmit(): void {
    this.modalCtrl.dismiss(this.convertForSubmission());
  }

  /**
   * Check if value should have a unit conversion applied
   *
   * @params: valueName - the key name to check for
   *
   * @return: true if valueName is included in controlsToConvertUnits and unit
   * requires conversion
   */
  requiresConversion(valueName: string): boolean {
    return this.controlsToConvertUnits.includes(valueName)
      && this.calculator.requiresConversion('volumeLarge', this.units);
  }

  /***** End Form Methods *****/

}
