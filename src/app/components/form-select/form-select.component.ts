import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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
export class FormSelectComponent implements OnChanges, OnInit {
  @Input() control: FormControl;
  @Input() label: string;
  @Input() ionChangeEvent: () => any;
  @Input() ionCancelEvent: () => any;
  @Input() compareWithFn: (...options: any) => any;
  @Input() options: FormSelectOption[];
  @Input() value: any;
  selectOptions: object = SELECT_OPTIONS;
  requiredPropertyKeys: string[] = [
    'control',
    'label',
    'ionChangeEvent',
    'ionCancelEvent',
    'compareWithFn',
    'options'
  ];


  constructor() { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    this.requiredPropertyKeys.forEach((key: string): void => {
      if (!changes.hasOwnProperty(key) || changes[key] === undefined) {
        this.setDefault(key);
      }
    });

    if (changes.hasOwnProperty('value') && changes.value.firstChange) {
      this.control.setValue(changes.value.currentValue);
    }
  }

  setDefault(key: string): void {
    console.log('setting default for', key);
    switch (key) {
      case 'control':
        this.control = new FormControl();
        break;
      case 'label':
        this.label = '';
        break;
      case 'ionChangeEvent':
        this.ionChangeEvent = (): void => {};
        break;
      case 'ionCancelEvent':
        this.ionCancelEvent = (): void => {};
        break;
      case 'compareWithFn':
        this.compareWithFn = (o1: any, o2: any): boolean => o1 === o2;
        break;
      case 'options':
        this.options = [];
        break;
      default:
        break;
    }
  }

}
