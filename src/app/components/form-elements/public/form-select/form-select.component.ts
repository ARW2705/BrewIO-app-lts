/* Module imports */
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';

/* Constant imports */
import { SELECT_OPTIONS } from '../../../../shared/constants';

/* Interface imports */
import { FormChanges, FormSelectOption } from '../../../../shared/interfaces';

/* Service imports */
import { FormAttributeService } from '../../../../services/services';


@Component({
  selector: 'app-form-select',
  templateUrl: './form-select.component.html',
  styleUrls: ['./form-select.component.scss'],
})
export class FormSelectComponent implements OnChanges {
  @Input() confirmText: string = null;
  @Input() control: FormControl = null;
  @Input() controlName: string = null;
  @Input() dismissText: string = null;
  @Input() formName: string = null;
  @Input() label: string = null;
  @Input() labelPosition: string = null;
  @Input() compareWithFn: (...options: any) => any = null;
  @Input() options: FormSelectOption[] = null;
  @Input() overrideTitleCase: boolean = false;
  @Input() shouldRequire: boolean = null;
  @Input() value: any;
  @Output() ionCancelEvent: EventEmitter<CustomEvent> = new EventEmitter<CustomEvent>();
  @Output() ionChangeEvent: EventEmitter<CustomEvent> = new EventEmitter<CustomEvent>();
  controlErrors: object = null;
  selectOptions: object = SELECT_OPTIONS;
  showError: boolean = false;

  constructor(public formAttributeService: FormAttributeService) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.assignFormChanges(
      this.formAttributeService.handleFormChange('select', this.control, changes)
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
   * Check form control for errors and set show error flag accordingly
   *
   * @param: none
   * @return: none
   */
  checkForErrors(): void {
    this.controlErrors = this.control.errors;
    this.showError = this.controlErrors && this.control.touched;
  }

  /**
   * Emit ion cancel event
   *
   * @param: event - the triggering custom event
   *
   * @return: none
   */
  ionCancel(event: CustomEvent): void {
    this.ionCancelEvent.emit(event);
    this.checkForErrors();
  }

  /**
   * Emit ion change event
   *
   * @param: event - the triggering custom event
   *
   * @return: none
   */
  ionChange(event: CustomEvent): void {
    this.ionChangeEvent.emit(event);
    this.checkForErrors();
  }

}
