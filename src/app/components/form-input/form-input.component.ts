/* Module imports */
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-form-input',
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss'],
})
export class FormInputComponent implements OnChanges {
  @Input() control: FormControl;
  @Input() controlName: string;
  @Input() formName: string;
  @Input() label: string;
  @Input() shouldAutocapitalize: boolean;
  @Input() shouldAutocomplete: boolean;
  @Input() shouldAutocorrect: boolean;
  @Input() shouldRequire: boolean;
  @Input() shouldSpellcheck: boolean;
  @Input() type: string;
  controlErrors: object = null;
  requiredPropertyKeys: string[] = [
    'control',
    'shouldAutocapitalize',
    'shouldAutocomplete',
    'shouldAutocorrect',
    'shouldRequire',
    'shouldSpellcheck',
    'type'
  ];
  showError: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    this.requiredPropertyKeys.forEach((key: string): void => {
      if (!changes.hasOwnProperty(key) || changes[key] === undefined) {
        this.setDefault(key); // set default if a value wasn't passed in
      }
    });

    if (changes.hasOwnProperty('value') && changes.value.firstChange) {
      this.control.setValue(changes.value.currentValue);
    }
  }

  /**
   * Check for form control errors
   *
   * @param: none
   * @return: none
   */
  checkForErrors(): void {
    this.controlErrors = this.control.errors;
    this.showError = this.controlErrors && this.control.touched;
  }

  /**
   * Input change event handler; if an error is showing, recheck
   * for errors in order to clear the error as soon as input is valid
   *
   * @param: none
   * @return: none
   */
  onInputChange(): void {
    if (this.showError) {
      this.checkForErrors();
    }
  }

  /**
   * Input blur event handler; check for errors after user finishes input
   *
   * @param: none
   * @return: none
   */
  onInputBlur(): void {
    this.checkForErrors();
  }

  /**
   * Set default values if component inputs were not provided
   *
   * @param: key - the property key to set
   *
   * @return: none
   */
  setDefault(key: string): void {
    switch (key) {
      case 'shouldAutocapitalize':
        this.shouldAutocapitalize = false;
        break;
      case 'shouldAutocomplete':
        this.shouldAutocomplete = false;
        break;
      case 'shouldAutocorrect':
        this.shouldAutocorrect = false;
        break;
      case 'control':
        this.control = new FormControl();
        break;
      case 'shouldRequire':
        this.shouldRequire = false;
        break;
      case 'shouldSpellcheck':
        this.shouldSpellcheck = false;
        break;
      case 'type':
        this.type = 'text';
        break;
      default:
        break;
    }
  }

}
