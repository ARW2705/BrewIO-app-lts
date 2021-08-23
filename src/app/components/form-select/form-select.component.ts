/* Module imports */
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';

/* Constant imports */
import { SELECT_OPTIONS } from '../../shared/constants';

/* Interface imports */
import { FormSelectOption } from '../../shared/interfaces';


@Component({
  selector: 'app-form-select',
  templateUrl: './form-select.component.html',
  styleUrls: ['./form-select.component.scss'],
})
export class FormSelectComponent implements OnChanges {
  @Input() confirmText: string;
  @Input() control: FormControl;
  @Input() controlName: string;
  @Input() dismissText: string;
  @Input() formName: string;
  @Input() label: string;
  @Input() labelPosition: string;
  @Input() compareWithFn: (...options: any) => any;
  @Input() options: FormSelectOption[];
  @Input() shouldRequire: boolean;
  @Input() value: any;
  @Output() ionCancelEvent: EventEmitter<CustomEvent> = new EventEmitter<CustomEvent>();
  @Output() ionChangeEvent: EventEmitter<CustomEvent> = new EventEmitter<CustomEvent>();
  controlErrors: object = null;
  selectOptions: object = SELECT_OPTIONS;
  showError: boolean = false;
  optionalPropertyKeys: string[] = [
    'compareWithFn',
    'confirmText',
    'control',
    'dismissText',
    'labelPosition'
  ];

  ngOnChanges(changes: SimpleChanges): void {
    this.optionalPropertyKeys.forEach((key: string): void => {
      if (!changes.hasOwnProperty(key) || changes[key] === undefined) {
        this.setDefault(key); // set default if a value wasn't given from parent component
      }
    });

    if (changes.hasOwnProperty('value') && changes.value.firstChange) {
      this.control.setValue(changes.value.currentValue);
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
    console.log('select cancel', event);
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
    console.log('select change', event);
    this.ionChangeEvent.emit(event);
    this.checkForErrors();
  }

  /**
   * Set a default value for a given property
   *
   * @param: key - the property name to assign a default
   *
   * @return: none
   */
  setDefault(key: string): void {
    switch (key) {
      case 'compareWithFn':
        this.compareWithFn = (o1: any, o2: any): boolean => o1 === o2;
        break;
      case 'confirmText':
        this.confirmText = 'Okay';
        break;
      case 'control':
        this.control = new FormControl();
        break;
      case 'dismissText':
        this.dismissText = 'Dismiss';
        break;
      case 'labelPosition':
        this.labelPosition = 'floating';
        break;
      default:
        break;
    }
  }

}
