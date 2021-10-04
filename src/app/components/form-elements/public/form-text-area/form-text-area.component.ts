/* Module imports */
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';

/* Interface imports */
import { FormChanges } from '../../../../shared/interfaces';

/* Service imports */
import { FormAttributeService } from '../../../../services/services';


@Component({
  selector: 'app-form-text-area',
  templateUrl: './form-text-area.component.html',
  styleUrls: ['./form-text-area.component.scss'],
})
export class FormTextAreaComponent implements OnChanges {
  @Input() control: FormControl = null;
  @Input() controlName: string = null;
  @Input() formName: string = null;
  @Input() label: string = null;
  @Input() overrideTitleCase: boolean = false;
  @Input() rows: number = null;
  @Input() shouldAutocapitalize: boolean = null;
  @Input() shouldRequire: boolean = null;
  @Input() shouldSpellcheck: boolean = null;
  @Output() ionBlurEvent: EventEmitter<CustomEvent> = new EventEmitter<CustomEvent>();
  @Output() ionChangeEvent: EventEmitter<CustomEvent> = new EventEmitter<CustomEvent>();
  controlErrors: object = null;
  showError: boolean = false;

  constructor(public formAttributeService: FormAttributeService) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.assignFormChanges(
      this.formAttributeService.handleFormChange('textarea', this.control, changes)
    );
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
      if (this.hasOwnProperty(key)) {
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
   * Emit blur event and check for errors after user finishes input
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
    this.ionChangeEvent.emit(event);
  }

}
