/* Module imports */
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';

/* Interface imports */
import { FormChanges } from '../../../../shared/interfaces';

/* Service imports */
import { FormAttributeService } from '../../../../services/services';


@Component({
  selector: 'app-form-input',
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss'],
})
export class FormInputComponent implements OnChanges {
  @Input() control: FormControl = null;
  @Input() controlName: string = null;
  @Input() formName: string = null;
  @Input() label: string = null;
  @Input() overrideTitleCase: boolean = null;
  @Input() shouldAutocapitalize: boolean = null;
  @Input() shouldAutocomplete: boolean = null;
  @Input() shouldAutocorrect: boolean = null;
  @Input() shouldRequire: boolean = null;
  @Input() shouldSpellcheck: boolean = null;
  @Input() type: string = null;
  @Output() ionBlurEvent: EventEmitter<CustomEvent> = new EventEmitter<CustomEvent>();
  @Output() ionChangeEvent: EventEmitter<CustomEvent> = new EventEmitter<CustomEvent>();
  controlErrors: object = null;
  showError: boolean = false;

  constructor(public formAttributeService: FormAttributeService) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.assignFormChanges(
      this.formAttributeService.handleFormChange('input', this.control, changes)
    );
    this.checkForErrors();
  }

  /**
   * Apply form changes object values to component
   *
   * @param: formChanges - contains key: value pairs of component attributes
   *
   * @return: none
   */
  assignFormChanges(formChanges: FormChanges): void {
    for (const key in formChanges) {
      if (this.hasOwnProperty(key) && this[key] === null) {
        this[key] = formChanges[key];
      }
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
   * Input blur event handler; check for errors after user finishes input
   *
   * @param: none
   * @return: none
   */
  onInputBlur(event: CustomEvent): void {
    this.checkForErrors();
    this.ionBlurEvent.emit(event);
  }

  /**
   * Input change event handler; if an error is showing, recheck
   * for errors in order to clear the error as soon as input is valid
   *
   * @param: none
   * @return: none
   */
  onInputChange(event: CustomEvent): void {
    if (this.showError) {
      this.checkForErrors();
    }
    if (this.type.toLowerCase() === 'number') {
      this.rectifyInputType();
    }
    this.ionChangeEvent.emit(event);
  }

  /**
   * Rectify the input value to its appropriate type
   * Angular currently stores inputs of type "number" as type "string" and requires parsing
   *   Open Issue: https://github.com/angular/angular/issues/13243
   *
   * @param: none
   * @return: none
   */
  rectifyInputType(): void {
    const parsed: number = parseFloat(this.control.value.toString());
    if (!isNaN(parsed)) {
      this.control.setValue(parsed);
    }
  }

}
