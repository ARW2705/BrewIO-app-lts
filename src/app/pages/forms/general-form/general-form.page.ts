/* Module imports */
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonSelect, ModalController } from '@ionic/angular';

/* Constant imports */
import { DURATION_MAX, EFFICIENCY_MAX, NAME_MAX_LENGTH, NAME_MIN_LENGTH, VOLUME_MAX } from '../../../shared/constants';

/* Default imports */
import { defaultImage } from '../../../shared/defaults';

/* Interface imports */
import { FormSelectOption, Image, SelectedUnits, Style } from '../../../shared/interfaces';

/* Service imports */
import { CalculationsService, PreferencesService, UtilityService } from '../../../services/services';


@Component({
  selector: 'app-page-general-form',
  templateUrl: './general-form.page.html',
  styleUrls: ['./general-form.page.scss']
})
export class GeneralFormPage implements OnInit {
  @Input() docMethod: string;
  @Input() formType: string;
  @Input() styles: Style[];
  @Input() update: object;
  @ViewChild('styleSelect') styleSelect: IonSelect;
  readonly brewingSelectOptions: FormSelectOption[] = [
    { label: 'Extract'      , value: 'extract'  },
    { label: 'Brew in a Bag', value: 'biab'     },
    { label: 'All Grain'    , value: 'allgrain' }
  ];
  compareWithFn: (o1: any, o2: any) => boolean;
  readonly controlsToConvertToNumber: string[] = [
    'efficiency',
    'batchVolume',
    'boilVolume',
    'mashVolume',
    'boilDuration',
    'mashDuration'
  ];
  readonly controlsToConvertUnits: string[] = [ 'batchVolume', 'boilVolume', 'mashVolume' ];
  readonly defaultImage: Image = defaultImage();
  generalForm: FormGroup = null;
  labelImage: Image = this.defaultImage;
  onBackClick: () => void;
  styleSelectOptions: FormSelectOption[] = [];
  units: SelectedUnits = null;


  constructor(
    public formBuilder: FormBuilder,
    public route: ActivatedRoute,
    public modalCtrl: ModalController,
    public calculator: CalculationsService,
    public preferenceService: PreferencesService,
    public utilService: UtilityService
  ) {
    this.compareWithFn = this.utilService.compareWith.bind(this);
    this.onBackClick = this.dismiss.bind(this);
  }

  /***** Lifecycle Hooks *****/

  ngOnInit(): void {
    if (this.styles) {
      this.styleSelectOptions = this.styles.map((style: Style): FormSelectOption => {
        return { label: style.name, value: style };
      });
    }

    this.units = this.preferenceService.getSelectedUnits();
    this.initForm();
  }

  /***** End Lifecycle Hooks *****/


  /**
   * Convert numeric string values to numbers and store units converted to
   * english standard
   *
   * @params: none
   * @return: a submission ready object of form values
   */
  convertForSubmission(): object {
    const formValues: object = { labelImage: this.labelImage };
    for (const key in this.generalForm.value) {
      if (this.generalForm.value.hasOwnProperty(key)) {
        formValues[key] = this.parseFormNumber(this.generalForm.value[key]);
        if (this.requiresConversion(key)) {
          formValues[key] = this.calculator.convertVolume(formValues[key], true, true);
        }
      }
    }

    return formValues;
  }

  /**
   * Convert strings of numbers into number; ion-input elements store type number values as strings
   *
   * @param: value - a form value to convert
   * @return: the parsed value if it was a string of numbers; else the original value
   */
  parseFormNumber(value: string | number | boolean): string | number | boolean {
    const parsed: number = parseFloat(value.toString());
    return isNaN(parsed) ? value : parsed;
  }

  /**
   * Call Ionic ModalController dismiss
   *
   * @params: none
   * @return: none
   */
  dismiss(): void {
    this.modalCtrl.dismiss();
  }

  /**
   * Initialize general form
   *
   * @params: none
   * @return: none
   */
  initForm(): void {
    const efficiency: number = 70;
    const duration: number = 60;
    this.generalForm = this.formBuilder.group({
      style:        ['',         [Validators.required]                                                   ],
      brewingType:  ['',         [Validators.required]                                                   ],
      efficiency:   [efficiency, [Validators.required, Validators.min(0), Validators.max(EFFICIENCY_MAX)]],
      mashDuration: [duration,   [Validators.required, Validators.min(0), Validators.max(DURATION_MAX)]  ],
      boilDuration: [duration,   [Validators.required, Validators.min(0), Validators.max(DURATION_MAX)]  ],
      batchVolume:  [null,       [Validators.required, Validators.min(0), Validators.max(VOLUME_MAX)]    ],
      boilVolume:   [null,       [Validators.required, Validators.min(0), Validators.max(VOLUME_MAX)]    ],
      mashVolume:   [null,       [Validators.required, Validators.min(0), Validators.max(VOLUME_MAX)]    ],
      isFavorite:   false,
      isMaster:     false
    });
    this.setNameControl();
    this.mapDataToForm();
  }

  /**
   * Map values to form from given update object performing unit conversion if required
   *
   * @params: none
   * @return: none
   */
  mapDataToForm(): void {
    if (this.update) {
      for (const key in this.update) {
        if (key !== 'labelImage') {
          if (this.controlsToConvertUnits.includes(key)) {
            if (this.calculator.requiresConversion('volumeLarge', this.units)) {
              this.update[key] = this.calculator.convertVolume(this.update[key], true, false);
            }
            const twoPlaces: number = 2;
            this.generalForm.controls[key].setValue(
              this.utilService.roundToDecimalPlace(this.update[key], twoPlaces)
            );
          } else {
            this.generalForm.controls[key].setValue(this.update[key]);
          }
        }
      }

      this.labelImage = this.update['labelImage'] || this.defaultImage;
    }
  }

  /**
   * Update labelImage if a result was returned from form image
   *
   * @param: image - a new image to apply or null if cancelled; do not apply null
   * @return: none
   */
  imageModalDismiss(image: Image): void {
    if (image) {
      this.labelImage = image;
    }
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
   * @return: true if valueName is included in controlsToConvertUnits and unit requires conversion
   */
  requiresConversion(valueName: string): boolean {
    return (
      this.controlsToConvertUnits.includes(valueName)
      && this.calculator.requiresConversion('volumeLarge', this.units)
    );
  }

  /**
   * Add 'name' or 'variantName' form control to form group based on the formType
   *
   * @params: none
   * @return: none
   */
  setNameControl(): void {
    this.generalForm.addControl(
      this.formType === 'master' ? 'name' : 'variantName',
      new FormControl(
        '',
        [
          Validators.minLength(NAME_MIN_LENGTH),
          Validators.maxLength(NAME_MAX_LENGTH),
          Validators.required
        ]
      )
    );
  }

}
