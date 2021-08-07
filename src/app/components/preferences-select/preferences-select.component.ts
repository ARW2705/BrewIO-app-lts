/* Module imports */
import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

/* Constant imports */
import { SELECT_OPTIONS } from '../../shared/constants';

/* Interface imports */
import { FormSelectOption } from '../../shared/interfaces';


@Component({
  selector: 'app-preferences-select',
  templateUrl: './preferences-select.component.html',
  styleUrls: ['./preferences-select.component.scss'],
})
export class PreferencesSelectComponent {
  @Input() control: FormControl;
  @Input() preferenceName: string;
  @Input() ionChangeEvent: (event: any) => void;
  @Input() options: FormSelectOption[];
  selectOptions: object = SELECT_OPTIONS;
}
